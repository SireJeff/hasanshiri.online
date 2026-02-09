'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all page content for a page
 */
export async function getPageContent(pageSlug) {
  const supabase = await createClient()

  const { data: content, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_slug', pageSlug)
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching page content:', error)
    return []
  }

  return content || []
}

/**
 * Get content for specific section
 */
export async function getSectionContent(pageSlug, sectionKey) {
  const supabase = await createClient()

  const { data: content, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_slug', pageSlug)
    .eq('section_key', sectionKey)
    .eq('is_enabled', true)
    .single()

  if (error) {
    console.error('Error fetching section content:', error)
    return null
  }

  return content
}

/**
 * Get hero section content
 */
export async function getHeroContent() {
  return getSectionContent('home', 'hero')
}

/**
 * Get about section content
 */
export async function getAboutContent() {
  const supabase = await createClient()

  const { data: content, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_slug', 'about')
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching about content:', error)
    return []
  }

  return content || []
}

/**
 * Get all content as key-value map for easy access
 */
export async function getPageContentMap() {
  const supabase = await createClient()

  const { data: content, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('is_enabled', true)

  if (error) {
    console.error('Error fetching page content map:', error)
    return {}
  }

  // Convert to map: "page_slug.section_key" => content
  const map = {}
  for (const item of content || []) {
    const key = `${item.page_slug}.${item.section_key}`
    map[key] = item
  }

  return map
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Get all page content for admin (including disabled)
 */
export async function getAdminPageContent(pageSlug = null) {
  const supabase = await createClient()

  let query = supabase
    .from('page_content')
    .select('*')
    .order('page_slug', { ascending: true })
    .order('sort_order', { ascending: true })

  if (pageSlug) {
    query = query.eq('page_slug', pageSlug)
  }

  const { data: content, error } = await query

  if (error) {
    console.error('Error fetching admin page content:', error)
    return { content: [], error: error.message }
  }

  return { content: content || [] }
}

/**
 * Get page content section for editing
 */
export async function getPageContentForEdit(id) {
  const supabase = await createClient()

  const { data: content, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching page content for edit:', error)
    return { content: null, error: error.message }
  }

  return { content }
}

/**
 * Create page content
 */
export async function createPageContent(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: content, error } = await supabase
    .from('page_content')
    .insert(formData)
    .select()
    .single()

  if (error) {
    console.error('Error creating page content:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/content')

  return { content }
}

/**
 * Update page content
 */
export async function updatePageContent(id, formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: content, error } = await supabase
    .from('page_content')
    .update({
      ...formData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating page content:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/content')

  return { content }
}

/**
 * Delete page content
 */
export async function deletePageContent(id) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('page_content')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting page content:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/content')

  return { success: true }
}

/**
 * Toggle page content enabled status
 */
export async function togglePageContentEnabled(id, isEnabled) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('page_content')
    .update({ is_enabled: isEnabled })
    .eq('id', id)

  if (error) {
    console.error('Error toggling page content enabled:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')

  return { success: true }
}

/**
 * Reorder page content sections
 */
export async function reorderPageContent(contentOrders) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const updates = contentOrders.map(({ id, sort_order }) =>
    supabase.from('page_content').update({ sort_order }).eq('id', id)
  )

  await Promise.all(updates)

  revalidatePath('/')
  revalidatePath('/en')
  revalidatePath('/fa')
  revalidatePath('/admin/content')

  return { success: true }
}
