'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get published articles with pagination and filtering
 */
export async function getArticles({
  page = 1,
  limit = 9,
  category = null,
  tag = null,
  search = null,
  featured = false,
} = {}) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('articles')
    .select(`
      *,
      author:profiles(id, full_name, avatar_url),
      category:categories(id, slug, name_en, name_fa, color),
      article_tags(tag:tags(id, slug, name_en, name_fa))
    `, { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  // Filter by category
  if (category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  // Filter by tag
  if (tag) {
    const { data: tagData } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tag)
      .single()

    if (tagData) {
      const { data: articleIds } = await supabase
        .from('article_tags')
        .select('article_id')
        .eq('tag_id', tagData.id)

      if (articleIds?.length) {
        query = query.in('id', articleIds.map(a => a.article_id))
      } else {
        return { articles: [], total: 0, totalPages: 0 }
      }
    }
  }

  // Search in title and excerpt
  if (search) {
    query = query.or(`title_en.ilike.%${search}%,title_fa.ilike.%${search}%,excerpt_en.ilike.%${search}%,excerpt_fa.ilike.%${search}%`)
  }

  // Featured only
  if (featured) {
    query = query.eq('is_featured', true).order('featured_order', { ascending: true })
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data: articles, count, error } = await query

  if (error) {
    console.error('Error fetching articles:', error)
    return { articles: [], total: 0, totalPages: 0, error: error.message }
  }

  // Transform article_tags to flat tags array
  const transformedArticles = articles?.map(article => ({
    ...article,
    tags: article.article_tags?.map(at => at.tag) || [],
    article_tags: undefined,
  })) || []

  return {
    articles: transformedArticles,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Get featured articles for homepage
 */
export async function getFeaturedArticles(limit = 3) {
  return getArticles({ limit, featured: true })
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug) {
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles(id, full_name, avatar_url, bio),
      category:categories(id, slug, name_en, name_fa, color),
      article_tags(tag:tags(id, slug, name_en, name_fa))
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching article:', error)
    return { article: null, error: error.message }
  }

  // Transform tags
  const transformedArticle = {
    ...article,
    tags: article.article_tags?.map(at => at.tag) || [],
    article_tags: undefined,
  }

  return { article: transformedArticle }
}

/**
 * Get related articles based on category and tags
 */
export async function getRelatedArticles(articleId, categoryId, tagIds = [], limit = 3) {
  const supabase = await createClient()

  let query = supabase
    .from('articles')
    .select(`
      id, slug, title_en, title_fa, excerpt_en, excerpt_fa,
      featured_image, published_at, reading_time_minutes,
      category:categories(slug, name_en, name_fa, color)
    `)
    .eq('status', 'published')
    .neq('id', articleId)
    .lte('published_at', new Date().toISOString())
    .limit(limit)

  // Prefer same category
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data: articles, error } = await query.order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching related articles:', error)
    return []
  }

  return articles || []
}

/**
 * Record article view
 */
export async function recordArticleView(articleId, metadata = {}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('article_views')
    .insert({
      article_id: articleId,
      ip_address: metadata.ip || null,
      user_agent: metadata.userAgent || null,
      referrer: metadata.referrer || null,
    })

  if (error) {
    console.error('Error recording view:', error)
  }
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Get all articles for admin (including drafts)
 */
export async function getAdminArticles({
  page = 1,
  limit = 20,
  status = null,
  search = null,
} = {}) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('articles')
    .select(`
      *,
      author:profiles(id, full_name, avatar_url),
      category:categories(id, slug, name_en, name_fa, color)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(`title_en.ilike.%${search}%,title_fa.ilike.%${search}%`)
  }

  query = query.range(offset, offset + limit - 1)

  const { data: articles, count, error } = await query

  if (error) {
    console.error('Error fetching admin articles:', error)
    return { articles: [], total: 0, totalPages: 0, error: error.message }
  }

  return {
    articles: articles || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Get single article for editing
 */
export async function getArticleForEdit(id) {
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      article_tags(tag_id)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching article for edit:', error)
    return { article: null, error: error.message }
  }

  return {
    article: {
      ...article,
      tag_ids: article.article_tags?.map(at => at.tag_id) || [],
    },
  }
}

/**
 * Create a new article
 */
export async function createArticle(formData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const tagIds = formData.tag_ids || []
  delete formData.tag_ids

  // Calculate reading time
  const content = formData.content_en || formData.content_fa || ''
  const wordCount = content.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const articleData = {
    ...formData,
    author_id: user.id,
    reading_time_minutes: readingTime,
    published_at: formData.status === 'published' ? (formData.published_at || new Date().toISOString()) : null,
  }

  const { data: article, error } = await supabase
    .from('articles')
    .insert(articleData)
    .select()
    .single()

  if (error) {
    console.error('Error creating article:', error)
    return { error: error.message }
  }

  // Add tags
  if (tagIds.length > 0) {
    const tagInserts = tagIds.map(tagId => ({
      article_id: article.id,
      tag_id: tagId,
    }))

    await supabase.from('article_tags').insert(tagInserts)
  }

  revalidatePath('/blog')
  revalidatePath('/admin/articles')

  return { article }
}

/**
 * Update an existing article
 */
export async function updateArticle(id, formData) {
  const supabase = await createClient()

  const tagIds = formData.tag_ids || []
  delete formData.tag_ids

  // Calculate reading time
  const content = formData.content_en || formData.content_fa || ''
  const wordCount = content.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const articleData = {
    ...formData,
    reading_time_minutes: readingTime,
  }

  // Handle publishing
  if (formData.status === 'published' && !formData.published_at) {
    articleData.published_at = new Date().toISOString()
  }

  const { data: article, error } = await supabase
    .from('articles')
    .update(articleData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating article:', error)
    return { error: error.message }
  }

  // Update tags - remove old, add new
  await supabase.from('article_tags').delete().eq('article_id', id)

  if (tagIds.length > 0) {
    const tagInserts = tagIds.map(tagId => ({
      article_id: id,
      tag_id: tagId,
    }))

    await supabase.from('article_tags').insert(tagInserts)
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${article.slug}`)
  revalidatePath('/admin/articles')

  return { article }
}

/**
 * Delete an article
 */
export async function deleteArticle(id) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting article:', error)
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/articles')

  return { success: true }
}

/**
 * Toggle featured status
 */
export async function toggleArticleFeatured(id, isFeatured) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('articles')
    .update({ is_featured: isFeatured })
    .eq('id', id)

  if (error) {
    console.error('Error toggling featured:', error)
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/articles')

  return { success: true }
}

/**
 * Generate unique slug from title
 */
export async function generateSlug(title) {
  const supabase = await createClient()

  // Create base slug
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  // Check if exists
  const { data: existing } = await supabase
    .from('articles')
    .select('slug')
    .like('slug', `${slug}%`)

  if (existing?.length) {
    const slugs = existing.map(a => a.slug)
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
