import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Static client for build-time operations (no cookies needed)
export function createStaticClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  // Trim whitespace and remove any newlines that might be in the env var
  // This can happen when secrets are copied with trailing newlines in GitHub Actions
  url = url.trim().replace(/[\r\n]/g, '')
  key = key.trim().replace(/[\r\n]/g, '')

  if (key.length < 50) {
    console.error('[Supabase] ANON_KEY appears too short after cleanup:', key.length, 'characters')
  }

  return createSupabaseClient(url, key)
}

export async function createClient() {
  const cookieStore = await cookies()

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  // Trim whitespace and remove any newlines
  url = url.trim().replace(/[\r\n]/g, '')
  key = key.trim().replace(/[\r\n]/g, '')

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Admin client with service role for privileged operations
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  )
}
