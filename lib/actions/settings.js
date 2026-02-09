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
 * Get site settings (key-value pattern)
 * Returns settings grouped by category
 */
export async function getSiteSettings() {
  const supabase = await createClient()

  const { data: settings, error } = await supabase
    .from('site_settings')
    .select('*')

  if (error) {
    console.error('Error fetching site settings:', error)
    return { settings: {} }
  }

  // Convert to object with grouped access
  const grouped = {
    all: settings || [],
    byKey: {},
    byCategory: { contact: {}, social: {}, github: {}, external: {}, general: {} }
  }

  for (const setting of settings || []) {
    // Add to byKey map
    grouped.byKey[setting.key] = setting

    // Add to category
    if (setting.category) {
      grouped.byCategory[setting.category] = grouped.byCategory[setting.category] || {}
      grouped.byCategory[setting.category][setting.key] = setting

      // For convenience, add direct value access
      const valueKey = setting.key.replace(`${setting.category}_`, '')
      if (valueKey !== setting.key) {
        grouped.byCategory[setting.category][valueKey] = setting.value_en
      }
    }
  }

  // Helper function to get a setting value
  grouped.get = (key, defaultValue = null, locale = 'en') => {
    const setting = grouped.byKey[key]
    if (!setting) return defaultValue
    return locale === 'fa' ? (setting.value_fa || setting.value_en) : setting.value_en
  }

  return { settings: grouped }
}

/**
 * Update a single site setting
 */
export async function updateSiteSetting(key, valueEn, valueFa = null, type = null) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const updateData = {
    value_en: valueEn,
    updated_at: new Date().toISOString()
  }

  if (valueFa !== null) {
    updateData.value_fa = valueFa
  }

  if (type !== null) {
    updateData.type = type
  }

  const { data, error } = await supabase
    .from('site_settings')
    .update(updateData)
    .eq('key', key)
    .select()
    .single()

  if (error) {
    console.error('Error updating site setting:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/settings')

  return { setting: data }
}

/**
 * Update multiple site settings
 */
export async function updateSiteSettings(settings) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update each setting
  for (const [key, value] of Object.entries(settings)) {
    const valueEn = typeof value === 'object' ? value.en : value
    const valueFa = typeof value === 'object' ? value.fa : null

    await supabase
      .from('site_settings')
      .update({
        value_en: valueEn,
        ...(valueFa !== null && { value_fa: valueFa }),
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/settings')

  return { success: true }
}

/**
 * Get contact settings
 */
export async function getContactSettings() {
  const { settings } = await getSiteSettings()

  return {
    email: settings.get('contact_email'),
    phone: settings.get('contact_phone'),
    location: settings.get('contact_location'),
    locationEn: settings.get('contact_location'),
    locationFa: settings.get('contact_location')
  }
}

/**
 * Get social links
 */
export async function getSocialLinks() {
  const { settings } = await getSiteSettings()

  return {
    github: settings.get('social_github'),
    linkedin: settings.get('social_linkedin'),
    twitter: settings.get('social_twitter'),
    youtube: settings.get('social_youtube'),
    telegram: settings.get('social_telegram'),
    whatsapp: settings.get('social_whatsapp'),
    instagram: settings.get('social_instagram'),
    dockerhub: settings.get('social_dockerhub'),
    virgool: settings.get('social_virgool')
  }
}

/**
 * Get external links for project section
 */
export async function getExternalLinks() {
  const { settings } = await getSiteSettings()

  return {
    link1: {
      nameEn: settings.get('external_link_1_name_en'),
      nameFa: settings.get('external_link_1_name_fa'),
      url: settings.get('external_link_1_url'),
      icon: settings.get('external_link_1_icon')
    },
    link2: {
      nameEn: settings.get('external_link_2_name_en'),
      nameFa: settings.get('external_link_2_name_fa'),
      url: settings.get('external_link_2_url'),
      icon: settings.get('external_link_2_icon')
    }
  }
}

/**
 * Get resume URLs
 */
export async function getResumeUrls() {
  const { settings } = await getSiteSettings()

  return {
    en: settings.get('resume_en_url'),
    fa: settings.get('resume_fa_url')
  }
}

/**
 * Get GitHub sync settings
 */
export async function getGitHubSettings() {
  const { settings } = await getSiteSettings()

  return {
    username: settings.get('github_username'),
    syncEnabled: settings.get('github_sync_enabled') === 'true',
    lastRun: settings.get('github_sync_last_run')
  }
}

/**
 * Update GitHub sync settings
 */
export async function updateGitHubSettings(username, syncEnabled) {
  await updateSiteSetting('github_username', username, username)
  await updateSiteSetting('github_sync_enabled', syncEnabled ? 'true' : 'false', syncEnabled ? 'true' : 'false')
  await updateSiteSetting('github_sync_last_run', '', '', 'text')

  return { success: true }
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
