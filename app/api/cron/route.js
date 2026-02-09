import { NextResponse } from 'next/server'
import { syncGitHubProjects, getGitHubSettings } from '@/lib/actions/projects'
import { revalidatePath } from 'next/cache'

/**
 * Unified Cron Endpoint
 * Handles: GitHub sync + Scheduled article publishing
 *
 * Configure in Vercel:
 * cron: "0 * * * *" (every hour)
 *
 * Environment variables needed:
 * - CRON_SECRET: Secret key to verify cron requests
 * - GITHUB_TOKEN: (optional) GitHub personal access token for higher rate limits
 */

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing CRON_SECRET' },
      { status: 401 }
    )
  }

  const startTime = Date.now()
  const results = {
    timestamp: new Date().toISOString(),
    duration: 0,
    githubSync: null,
    scheduledPublish: null,
    errors: []
  }

  try {
    // 1. GitHub Sync (if enabled)
    try {
      const githubSettings = await getGitHubSettings()

      if (githubSettings.syncEnabled && githubSettings.username) {
        const syncResult = await syncGitHubProjects(process.env.GITHUB_TOKEN)

        results.githubSync = {
          success: true,
          synced: syncResult.synced || 0,
          message: syncResult.message || `Synced ${syncResult.synced} projects`
        }

        // Revalidate paths after GitHub sync
        revalidatePath('/')
        revalidatePath('/en')
        revalidatePath('/fa')
      } else {
        results.githubSync = {
          success: true,
          skipped: true,
          message: 'GitHub sync not enabled'
        }
      }
    } catch (error) {
      results.githubSync = {
        success: false,
        error: error.message
      }
      results.errors.push(`GitHub sync: ${error.message}`)
    }

    // 2. Scheduled Article Publishing
    try {
      const { publishScheduledArticles } = await import('@/lib/actions/articles')
      const publishResult = await publishScheduledArticles()

      results.scheduledPublish = {
        success: true,
        published: publishResult.count || 0
      }

      // Revalidate paths after publishing
      revalidatePath('/en/blog')
      revalidatePath('/fa/blog')
    } catch (error) {
      results.scheduledPublish = {
        success: false,
        error: error.message
      }
      results.errors.push(`Scheduled publish: ${error.message}`)
    }

  } catch (error) {
    return NextResponse.json({
      ...results,
      error: error.message,
      errors: [...results.errors, error.message]
    }, { status: 500 })
  }

  results.duration = Date.now() - startTime

  // Log the cron run
  console.log('[Cron] Completed:', JSON.stringify(results, null, 2))

  return NextResponse.json(results, {
    status: results.errors.length > 0 ? 207 : 200, // 207 = Multi-status (some success, some errors)
    headers: {
      'X-Cron-Duration': `${results.duration}ms`
    }
  })
}

/**
 * POST endpoint for manual triggering (for testing)
 */
export async function POST(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get body to see which jobs to run
  const body = await request.json().catch(() => ({}))
  const { jobs = ['github', 'publish'] } = body

  const results = {
    timestamp: new Date().toISOString(),
    jobs: jobs.join(', '),
    githubSync: null,
    scheduledPublish: null
  }

  // GitHub Sync
  if (jobs.includes('github')) {
    try {
      const syncResult = await syncGitHubProjects(process.env.GITHUB_TOKEN)
      results.githubSync = {
        success: true,
        ...syncResult
      }
    } catch (error) {
      results.githubSync = {
        success: false,
        error: error.message
      }
    }
  }

  // Scheduled Publishing
  if (jobs.includes('publish')) {
    try {
      const { publishScheduledArticles } = await import('@/lib/actions/articles')
      const publishResult = await publishScheduledArticles()
      results.scheduledPublish = {
        success: true,
        published: publishResult.count || 0
      }
    } catch (error) {
      results.scheduledPublish = {
        success: false,
        error: error.message
      }
    }
  }

  return NextResponse.json(results)
}
