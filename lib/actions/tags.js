'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get all tags
 */
export async function getTags() {
  const supabase = await createClient()

  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .order('name_en', { ascending: true })

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return tags || []
}

/**
 * Get tags with article count
 */
export async function getTagsWithCount() {
  const supabase = await createClient()

  const { data: tags, error } = await supabase
    .from('tags')
    .select(`
      *,
      article_tags:article_tags(count)
    `)
    .order('name_en', { ascending: true })

  if (error) {
    console.error('Error fetching tags with count:', error)
    return []
  }

  return tags?.map(tag => ({
    ...tag,
    article_count: tag.article_tags?.[0]?.count || 0,
    article_tags: undefined,
  })) || []
}

/**
 * Get popular tags (by article count)
 */
export async function getPopularTags(limit = 10) {
  const supabase = await createClient()

  const { data: tags, error } = await supabase
    .from('tags')
    .select(`
      *,
      article_tags:article_tags(count)
    `)
    .order('name_en', { ascending: true })
    .limit(50) // Get more to filter

  if (error) {
    console.error('Error fetching popular tags:', error)
    return []
  }

  // Sort by count and take top N
  return (tags || [])
    .map(tag => ({
      ...tag,
      article_count: tag.article_tags?.[0]?.count || 0,
      article_tags: undefined,
    }))
    .sort((a, b) => b.article_count - a.article_count)
    .slice(0, limit)
}

/**
 * Get single tag by slug
 */
export async function getTagBySlug(slug) {
  const supabase = await createClient()

  const { data: tag, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching tag:', error)
    return null
  }

  return tag
}

/**
 * Create a new tag (admin only)
 */
export async function createTag(formData) {
  const supabase = await createClient()

  // Generate slug from English name
  const slug = formData.name_en
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  const { data: tag, error } = await supabase
    .from('tags')
    .insert({ ...formData, slug })
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error)
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/tags')

  return { tag }
}

/**
 * Update a tag (admin only)
 */
export async function updateTag(id, formData) {
  const supabase = await createClient()

  const { data: tag, error } = await supabase
    .from('tags')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating tag:', error)
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/tags')

  return { tag }
}

/**
 * Delete a tag (admin only)
 */
export async function deleteTag(id) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting tag:', error)
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/tags')

  return { success: true }
}

/**
 * Create or get tag by name (for quick tag creation in editor)
 */
export async function getOrCreateTag(name_en, name_fa = '') {
  const supabase = await createClient()

  const slug = name_en
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  // Check if exists
  const { data: existing } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (existing) {
    return { tag: existing }
  }

  // Create new
  const { data: tag, error } = await supabase
    .from('tags')
    .insert({
      slug,
      name_en,
      name_fa: name_fa || name_en,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error)
    return { error: error.message }
  }

  return { tag }
}
