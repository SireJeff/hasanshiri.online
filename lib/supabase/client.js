import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  // Trim whitespace and remove any newlines
  url = url.trim().replace(/[\r\n]/g, '')
  key = key.trim().replace(/[\r\n]/g, '')

  return createBrowserClient(url, key)
}
