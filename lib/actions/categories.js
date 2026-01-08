'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get all categories
 */
export async function getCategories() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories || []
}

/**
 * Get categories with article count
 */
export async function getCategoriesWithCount() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      articles:articles(count)
    `)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories with count:', error)
    return []
  }

  return categories?.map(cat => ({
    ...cat,
    article_count: cat.articles?.[0]?.count || 0,
    articles: undefined,
  })) || []
}

/**
 * Get single category by slug
 */
export async function getCategoryBySlug(slug) {
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return category
}

/**
 * Create a new category (admin only)
 */
export async function createCategory(formData) {
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .insert(formData)
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/categories')

  return { category }
}

/**
 * Update a category (admin only)
 */
export async function updateCategory(id, formData) {
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating category:', error)
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/categories')

  return { category }
}

/**
 * Delete a category (admin only)
 */
export async function deleteCategory(id) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/categories')

  return { success: true }
}
