'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get projects with filtering
 */
export async function getProjects({
  featured = false,
  status = 'active',
  tag = null,
  limit = null
} = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select(`
      *,
      project_tags:project_tag_relations(
        tag:project_tags(id, slug, name_en, name_fa)
      )
    `)
    .order('sort_order', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  if (featured) {
    query = query.eq('is_featured', true).order('featured_order', { ascending: true, nullsFirst: false })
  }

  if (tag) {
    // Filter by tag slug
    const { data: tagData } = await supabase
      .from('project_tags')
      .select('id')
      .eq('slug', tag)
      .single()

    if (tagData) {
      const { data: projectIds } = await supabase
        .from('project_tag_relations')
        .select('project_id')
        .eq('tag_id', tagData.id)

      if (projectIds?.length) {
        query = query.in('id', projectIds.map(p => p.project_id))
      } else {
        return []
      }
    }
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data: projects, error } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  // Transform tags to flat array
  const transformed = projects?.map(project => ({
    ...project,
    tags: project.project_tags?.map(pt => pt.tag).filter(Boolean) || [],
    project_tags: undefined
  })) || []

  return transformed
}

/**
 * Get featured projects for homepage
 */
export async function getFeaturedProjects(limit = 3) {
  return getProjects({ featured: true, limit })
}

/**
 * Get project by slug
 */
export async function getProjectBySlug(slug) {
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_tags:project_tag_relations(
        tag:project_tags(id, slug, name_en, name_fa)
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return { project: null, error: error.message }
  }

  return {
    project: {
      ...project,
      tags: project.project_tags?.map(pt => pt.tag).filter(Boolean) || [],
      project_tags: undefined
    }
  }
}

/**
 * Get project tags
 */
export async function getProjectTags() {
  const supabase = await createClient()

  const { data: tags, error } = await supabase
    .from('project_tags')
    .select('*')
    .order('name_en', { ascending: true })

  if (error) {
    console.error('Error fetching project tags:', error)
    return []
  }

  return tags || []
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Get all projects for admin
 */
export async function getAdminProjects({ status = null, search = null } = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(`title_en.ilike.%${search}%,title_fa.ilike.%${search}%`)
  }

  const { data: projects, error } = await query

  if (error) {
    console.error('Error fetching admin projects:', error)
    return { projects: [], error: error.message }
  }

  return { projects: projects || [] }
}

/**
 * Get project for editing (with tags)
 */
export async function getProjectForEdit(id) {
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_tags:project_tag_relations(tag_id)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project for edit:', error)
    return { project: null, error: error.message }
  }

  return {
    project: {
      ...project,
      tag_ids: project.project_tags?.map(pt => pt.tag_id) || [],
      project_tags: undefined
    }
  }
}

/**
 * Create project
 */
export async function createProject(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const tagIds = formData.tag_ids || []
  delete formData.tag_ids

  // Generate slug if not provided
  if (!formData.slug) {
    const baseSlug = formData.title_en
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    formData.slug = baseSlug
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert(formData)
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return { error: error.message }
  }

  // Add tags
  if (tagIds.length > 0) {
    const tagInserts = tagIds.map(tagId => ({
      project_id: project.id,
      tag_id: tagId,
    }))

    await supabase.from('project_tag_relations').insert(tagInserts)
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/projects')

  return { project }
}

/**
 * Update project
 */
export async function updateProject(id, formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const tagIds = formData.tag_ids || []
  delete formData.tag_ids

  const { data: project, error } = await supabase
    .from('projects')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return { error: error.message }
  }

  // Update tags - remove old, add new
  await supabase.from('project_tag_relations').delete().eq('project_id', id)

  if (tagIds.length > 0) {
    const tagInserts = tagIds.map(tagId => ({
      project_id: id,
      tag_id: tagId,
    }))

    await supabase.from('project_tag_relations').insert(tagInserts)
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/projects')

  return { project }
}

/**
 * Delete project
 */
export async function deleteProject(id) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/projects')

  return { success: true }
}

/**
 * Toggle project featured status
 */
export async function toggleProjectFeatured(id, isFeatured) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('projects')
    .update({ is_featured: isFeatured })
    .eq('id', id)

  if (error) {
    console.error('Error toggling project featured:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')

  return { success: true }
}

/**
 * Reorder projects (bulk update sort_order)
 */
export async function reorderProjects(projectOrders) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const updates = projectOrders.map(({ id, sort_order }) =>
    supabase.from('projects').update({ sort_order }).eq('id', id)
  )

  await Promise.all(updates)

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/projects')

  return { success: true }
}

// ============================================
// TAG OPERATIONS
// ============================================

/**
 * Create project tag
 */
export async function createProjectTag(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Generate slug if not provided
  if (!formData.slug) {
    formData.slug = formData.name_en
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  const { data: tag, error } = await supabase
    .from('project_tags')
    .insert(formData)
    .select()
    .single()

  if (error) {
    console.error('Error creating project tag:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/projects')

  return { tag }
}

/**
 * Update project tag
 */
export async function updateProjectTag(id, formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: tag, error } = await supabase
    .from('project_tags')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project tag:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/projects')

  return { tag }
}

/**
 * Delete project tag
 */
export async function deleteProjectTag(id) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('project_tags')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project tag:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/projects')

  return { success: true }
}

/**
 * Generate unique slug for project
 */
export async function generateProjectSlug(title) {
  const supabase = await createClient()

  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  // Check if exists
  const { data: existing } = await supabase
    .from('projects')
    .select('slug')
    .like('slug', `${slug}%`)

  if (existing?.length) {
    const slugs = existing.map(p => p.slug)
    let counter = 1
    let newSlug = slug
    while (slugs.includes(newSlug)) {
      newSlug = `${slug}-${counter}`
      counter++
    }
    slug = newSlug
  }

  return slug
}

/**
 * Migrate existing hardcoded projects to database
 * Run once during initial setup
 */
export async function migrateProjects() {
  const projectsToMigrate = [
    {
      title: 'PROJECT-LIBERTAD',
      descriptionKey: 'projectLibertad',
      image: '/projects/project1.png',
      tags: ['python', 'docker', 'automation', 'telegram', 'mtproto', 'web-scraping', 'smtp', 'vmess', 'telethon', 'proxy-scraper', 'vless', 'runonflux'],
      demoUrl: 'https://github.com/SireJeff/interpolationTechniques',
      githubUrl: 'https://github.com/SireJeff/interpolationTechniques',
    },
    {
      title: 'interpolationTechniques',
      descriptionKey: 'interpolationTechniques',
      image: '/projects/project2.png',
      tags: ['python', 'interpolation', 'spline', 'newtonian'],
      demoUrl: 'https://github.com/SireJeff/interpolationTechniques',
      githubUrl: 'https://github.com/SireJeff/interpolationTechniques',
    },
    {
      title: 'Restaurant_data_analysis',
      descriptionKey: 'restaurantDataAnalysis',
      image: '/projects/project3.jpg',
      tags: ['Python', 'Pandas', 'Data Analysis'],
      demoUrl: 'https://github.com/SireJeff/Restaurant_data_analysis',
      githubUrl: 'https://github.com/SireJeff/Restaurant_data_analysis',
    },
    {
      title: 'decentralized containerized ssh vpn on runonflux platform',
      descriptionKey: 'sshVpn',
      image: '/projects/project4.jpg',
      tags: ['Python', 'Docker', 'SSH', 'VPN', 'RunOnFlux'],
      demoUrl: 'https://github.com/SireJeff/fluxssh',
      githubUrl: 'https://github.com/SireJeff/fluxssh',
    },
    {
      title: 'NASTA',
      descriptionKey: 'nasta',
      image: '/projects/project5.jpg',
      tags: ['Python', 'Data Analysis', 'NASA'],
      demoUrl: 'https://github.com/SireJeff/Nasta',
      githubUrl: 'https://github.com/SireJeff/Nasta',
    },
    {
      title: 'TG_reminder',
      descriptionKey: 'tgReminder',
      image: '/projects/project6.png',
      tags: ['Python', 'Telegram', 'Reminders'],
      demoUrl: 'https://github.com/SireJeff/TG_reminder',
      githubUrl: 'https://github.com/SireJeff/TG_reminder',
    },
    {
      title: 'oscilation_simulation',
      descriptionKey: 'oscillationSimulation',
      image: '/projects/project7.png',
      tags: ['computational-physics', 'wave-simulation', 'mass-spring-systems', 'coupled-oscillators', 'normal-modes', 'python', 'numpy', 'scipy', 'matplotlib'],
      demoUrl: 'https://github.com/SireJeff/oscilation_simulation',
      githubUrl: 'https://github.com/SireJeff/oscilation_simulation',
    },
    {
      title: 'SKM construction company website',
      descriptionKey: 'skmWebsite',
      image: '/projects/project8.png',
      tags: ['web-development', 'react', 'tailwind-css', 'javascript'],
      demoUrl: 'https://skm-co.ir',
      githubUrl: 'https://github.com/SireJeff/skm-co',
    },
    {
      title: 'UISSF - Universal Interconnected Systems of Smart Faculties',
      descriptionKey: 'uissf',
      image: '/projects/project9.png',
      tags: ['distributed-systems', 'p2p-storage', 'augmented-reality', 'indoor-positioning', 'smart-campus', 'iot', 'computer-vision', 'research-proposal'],
      demoUrl: 'https://github.com/SireJeff/UISSF',
      githubUrl: 'https://github.com/SireJeff/UISSF',
    },
  ]

  const supabase = await createClient()

  let created = 0
  let updated = 0

  for (const project of projectsToMigrate) {
    const slug = project.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if exists
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .single()

    const projectData = {
      slug,
      title_en: project.title,
      title_fa: project.title,
      description_en: project.descriptionKey, // Will update with actual description later
      description_fa: project.descriptionKey,
      featured_image: project.image,
      demo_url: project.demoUrl,
      github_url: project.githubUrl,
      status: 'active',
      sort_order: created
    }

    let projectId

    if (existing) {
      const { data } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', existing.id)
        .select('id')
        .single()

      projectId = data?.id
      updated++
    } else {
      const { data } = await supabase
        .from('projects')
        .insert(projectData)
        .select('id')
        .single()

      projectId = data?.id
      created++
    }

    // Handle tags
    if (projectId && project.tags?.length > 0) {
      // Get or create tags
      for (const tagName of project.tags) {
        const tagSlug = tagName.toLowerCase()

        // Check if tag exists
        let { data: tag } = await supabase
          .from('project_tags')
          .select('id')
          .eq('slug', tagSlug)
          .single()

        // Create tag if not exists
        if (!tag) {
          const { data: newTag } = await supabase
            .from('project_tags')
            .insert({
              slug: tagSlug,
              name_en: tagName,
              name_fa: tagName
            })
            .select('id')
            .single()

          tag = newTag
        }

        // Link tag to project
        if (tag) {
          await supabase
            .from('project_tag_relations')
            .upsert({
              project_id: projectId,
              tag_id: tag.id
            }, { onConflict: 'project_id,tag_id' })
        }
      }
    }
  }

  return { created, updated, total: projectsToMigrate.length }
}

// ============================================
// GITHUB SYNC OPERATIONS
// ============================================

/**
 * Get GitHub integration settings from site_settings
 */
export async function getGitHubSettings() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value_en')
    .in('key', ['github_username', 'github_sync_enabled'])

  const result = {
    username: null,
    syncEnabled: false
  }

  for (const setting of settings || []) {
    if (setting.key === 'github_username') {
      result.username = setting.value_en
    } else if (setting.key === 'github_sync_enabled') {
      result.syncEnabled = setting.value_en === 'true' || setting.value_en === true
    }
  }

  return result
}

/**
 * Fetch GitHub repositories for a user
 */
export async function fetchGitHubRepos(username, token = null) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&type=public&sort=updated`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Transform GitHub repo to project format
 * Internal helper function - not exported
 * @returns {object} Transformed project data
 */
// eslint-disable-next-line no-unused-vars -- Internal helper used conditionally
function transformGitHubRepo(repo) {
  return {
    slug: repo.full_name.toLowerCase().replace(/\//g, '-'),
    title_en: repo.name,
    title_fa: repo.name,
    description_en: repo.description || '',
    description_fa: repo.description || '',
    github_url: repo.html_url,
    demo_url: repo.homepage || null,
    featured_image: null, // Will need to add manually
    github_repo_name: repo.full_name,
    github_repo_id: repo.id,
    github_stars: repo.stargazers_count,
    github_forks: repo.forks_count,
    github_language: repo.language,
    github_description: repo.description,
    is_github_synced: true,
    status: 'draft', // Require admin review before publishing
  }
}

/**
 * Import GitHub repositories as draft projects
 */
export async function importGitHubRepositories(reposData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  let created = 0
  let updated = 0

  for (const repoData of reposData) {
    // Check if exists by github_repo_id
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('github_repo_id', repoData.github_repo_id)
      .single()

    if (existing) {
      await supabase
        .from('projects')
        .update({
          ...repoData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
      updated++
    } else {
      await supabase
        .from('projects')
        .insert(repoData)
      created++
    }
  }

  // Log sync
  await logGitHubSync('repos', 'success', reposData.length, created, updated)

  revalidatePath('/')
  revalidatePath('/admin/projects')

  return { created, updated, total: reposData.length }
}

/**
 * Sync GitHub data for projects with auto_sync enabled
 */
export async function syncGitHubProjects(token = null) {
  const supabase = await createClient()

  // Get site settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('value_en')
    .eq('key', 'github_username')
    .single()

  if (!settings?.value_en) {
    return { error: 'GitHub username not configured' }
  }

  // Extracted for potential future use (logging, API calls, etc.)
  // eslint-disable-next-line no-unused-vars -- Extracted for future use
  const username = settings.value_en

  // Get projects with auto_sync enabled
  const { data: autoSyncProjects } = await supabase
    .from('projects')
    .select('id, github_repo_name')
    .eq('auto_sync', true)
    .not('github_repo_name', 'is', null)

  if (!autoSyncProjects?.length) {
    return { synced: 0, message: 'No projects with auto-sync enabled' }
  }

  let synced = 0

  for (const project of autoSyncProjects) {
    if (!project.github_repo_name) continue

    const [owner, repo] = project.github_repo_name.split('/')

    // Fetch repo data from GitHub
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      }
    )

    if (!response.ok) {
      console.error(`Failed to sync ${project.github_repo_name}:`, response.statusText)
      continue
    }

    const repoData = await response.json()

    // Update project with latest GitHub data
    await supabase
      .from('projects')
      .update({
        github_stars: repoData.stargazers_count,
        github_forks: repoData.forks_count,
        github_language: repoData.language,
        github_description: repoData.description,
        github_last_sync_at: new Date().toISOString()
      })
      .eq('id', project.id)

    synced++
  }

  // Update last sync time
  await supabase
    .from('site_settings')
    .update({ value_en: new Date().toISOString() })
    .eq('key', 'github_sync_last_run')

  // Log sync
  await logGitHubSync('repos', 'success', synced, 0, synced)

  return { synced }
}

/**
 * Log GitHub sync operation
 */
async function logGitHubSync(type, status, processed, created, updated, error = null) {
  const supabase = await createClient()

  await supabase.from('github_sync_logs').insert({
    sync_type: type,
    status,
    items_processed: processed,
    items_created: created,
    items_updated: updated,
    error_message: error,
    completed_at: new Date().toISOString()
  })
}

/**
 * Get GitHub sync logs
 */
export async function getGitHubSyncLogs(limit = 50) {
  const supabase = await createClient()

  const { data: logs, error } = await supabase
    .from('github_sync_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching sync logs:', error)
    return []
  }

  return logs || []
}
