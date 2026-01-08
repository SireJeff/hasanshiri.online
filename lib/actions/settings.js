'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get current user profile
 */
export async function getProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return { error: error.message }
  }

  return { profile, user }
}

/**
 * Update user profile
 */
export async function updateProfile(formData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.full_name,
      avatar_url: formData.avatar_url,
      bio: formData.bio,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/settings')

  return { profile }
}

/**
 * Get site settings
 */
export async function getSiteSettings() {
  const supabase = await createClient()

  const { data: settings, error } = await supabase
    .from('site_settings')
    .select('*')
    .single()

  if (error) {
    // If no settings exist, return defaults
    if (error.code === 'PGRST116') {
      return {
        settings: {
          site_name_en: 'Hasan Shiri',
          site_name_fa: 'حسن شیری',
          site_description_en: 'Personal blog and portfolio',
          site_description_fa: 'وبلاگ و نمونه کارهای شخصی',
          contact_email: '',
          social_github: '',
          social_linkedin: '',
          social_twitter: '',
        }
      }
    }
    console.error('Error fetching site settings:', error)
    return { error: error.message }
  }

  return { settings }
}

/**
 * Update site settings
 */
export async function updateSiteSettings(formData) {
  const supabase = await createClient()

  // Check if settings exist
  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .single()

  let result
  if (existing) {
    // Update existing
    result = await supabase
      .from('site_settings')
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    // Insert new
    result = await supabase
      .from('site_settings')
      .insert(formData)
      .select()
      .single()
  }

  if (result.error) {
    console.error('Error updating site settings:', result.error)
    return { error: result.error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/settings')

  return { settings: result.data }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats() {
  const supabase = await createClient()

  try {
    // List all files in articles bucket
    const { data: articleFiles } = await supabase.storage
      .from('articles')
      .list('', { limit: 1000 })

    let totalSize = 0
    let fileCount = 0

    if (articleFiles) {
      for (const file of articleFiles) {
        if (file.id) {
          totalSize += file.metadata?.size || 0
          fileCount++
        }
      }
    }

    return {
      stats: {
        totalFiles: fileCount,
        totalSize,
        formattedSize: formatBytes(totalSize),
      }
    }
  } catch (error) {
    console.error('Error getting storage stats:', error)
    return {
      stats: {
        totalFiles: 0,
        totalSize: 0,
        formattedSize: '0 B',
      }
    }
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
