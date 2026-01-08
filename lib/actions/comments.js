'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// Rate limiting store (in-memory for simplicity, consider Redis for production)
const rateLimitStore = new Map()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_COMMENTS_PER_WINDOW = 3

// Edit time limit (15 minutes)
const EDIT_TIME_LIMIT = 15 * 60 * 1000

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get approved comments for an article (with threading support)
 */
export async function getArticleComments(articleId) {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles(id, full_name, avatar_url)
    `)
    .eq('article_id', articleId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return { comments: [], error: error.message }
  }

  // Build threaded structure (2 levels max)
  const rootComments = []
  const repliesMap = new Map()

  comments?.forEach(comment => {
    if (!comment.parent_id) {
      rootComments.push({ ...comment, replies: [] })
    } else {
      if (!repliesMap.has(comment.parent_id)) {
        repliesMap.set(comment.parent_id, [])
      }
      repliesMap.get(comment.parent_id).push(comment)
    }
  })

  // Attach replies to parent comments
  rootComments.forEach(comment => {
    comment.replies = repliesMap.get(comment.id) || []
  })

  return { comments: rootComments }
}

/**
 * Get comment count for an article
 */
export async function getArticleCommentCount(articleId) {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', articleId)
    .eq('status', 'approved')

  if (error) {
    console.error('Error fetching comment count:', error)
    return 0
  }

  return count || 0
}

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Check if user has previously approved comments (for hybrid moderation)
 */
async function hasApprovedComments(supabase, email, userId) {
  let query = supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')

  if (userId) {
    query = query.eq('user_id', userId)
  } else if (email) {
    query = query.eq('guest_email', email)
  } else {
    return false
  }

  const { count } = await query
  return (count || 0) > 0
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ipAddress) {
  const now = Date.now()
  const key = ipAddress || 'unknown'

  // Clean old entries
  const entry = rateLimitStore.get(key)
  if (entry && now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.delete(key)
  }

  const current = rateLimitStore.get(key)
  if (current) {
    if (current.count >= MAX_COMMENTS_PER_WINDOW) {
      return false
    }
    current.count++
    return true
  }

  rateLimitStore.set(key, { windowStart: now, count: 1 })
  return true
}

/**
 * Create a new comment
 */
export async function createComment(formData) {
  const supabase = await createClient()
  const headersList = await headers()

  // Get IP and user agent for spam prevention
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                    headersList.get('x-real-ip') ||
                    'unknown'
  const userAgent = headersList.get('user-agent')

  // Honeypot check - if filled, it's a bot
  if (formData.website_url) {
    console.log('Honeypot triggered')
    // Pretend success but don't save
    return { success: true, comment: { id: 'fake' } }
  }

  // Rate limit check
  if (!checkRateLimit(ipAddress)) {
    return { error: 'Too many comments. Please wait a moment before trying again.' }
  }

  // Validate required fields
  const { articleId, content, parentId, guestName, guestEmail } = formData

  if (!articleId) {
    return { error: 'Article ID is required' }
  }

  if (!content || content.trim().length < 3) {
    return { error: 'Comment must be at least 3 characters' }
  }

  if (content.length > 2000) {
    return { error: 'Comment must be less than 2000 characters' }
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  // If not authenticated, require guest info
  if (!user && (!guestName || !guestEmail)) {
    return { error: 'Name and email are required' }
  }

  // Validate email format for guests
  if (!user && guestEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestEmail)) {
      return { error: 'Please provide a valid email address' }
    }
  }

  // If replying, verify parent exists and limit depth to 2 levels
  if (parentId) {
    const { data: parentComment } = await supabase
      .from('comments')
      .select('id, parent_id')
      .eq('id', parentId)
      .eq('status', 'approved')
      .single()

    if (!parentComment) {
      return { error: 'Parent comment not found' }
    }

    // Don't allow replies to replies (2 level max)
    if (parentComment.parent_id) {
      return { error: 'Cannot reply to a reply. Please reply to the original comment.' }
    }
  }

  // Determine status based on hybrid moderation
  // First-time commenters go to pending, returning commenters auto-approve
  const email = user?.email || guestEmail
  const isTrustedCommenter = await hasApprovedComments(supabase, email, user?.id)
  const status = isTrustedCommenter ? 'approved' : 'pending'

  // Prepare comment data
  const commentData = {
    article_id: articleId,
    user_id: user?.id || null,
    guest_name: user ? null : guestName.trim(),
    guest_email: user ? null : guestEmail.toLowerCase().trim(),
    parent_id: parentId || null,
    content: content.trim(),
    status,
    ip_address: ipAddress,
    user_agent: userAgent,
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select(`
      *,
      user:profiles(id, full_name, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return { error: 'Failed to submit comment. Please try again.' }
  }

  // Revalidate the article page
  const { data: article } = await supabase
    .from('articles')
    .select('slug')
    .eq('id', articleId)
    .single()

  if (article) {
    revalidatePath(`/blog/${article.slug}`)
  }
  revalidatePath('/admin/comments')

  return {
    success: true,
    comment,
    isPending: status === 'pending',
    message: status === 'pending'
      ? 'Your comment is awaiting moderation and will appear once approved.'
      : 'Comment posted successfully!'
  }
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update own comment (within 15 minute window)
 */
export async function updateComment(commentId, content) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the comment
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single()

  if (fetchError || !comment) {
    return { error: 'Comment not found' }
  }

  // Check ownership
  const isOwner = user
    ? comment.user_id === user.id
    : false // Guests can't edit (no way to verify identity)

  if (!isOwner) {
    return { error: 'You can only edit your own comments' }
  }

  // Check time limit
  const createdAt = new Date(comment.created_at).getTime()
  const now = Date.now()
  if (now - createdAt > EDIT_TIME_LIMIT) {
    return { error: 'Edit time limit (15 minutes) has expired' }
  }

  // Validate content
  if (!content || content.trim().length < 3) {
    return { error: 'Comment must be at least 3 characters' }
  }

  if (content.length > 2000) {
    return { error: 'Comment must be less than 2000 characters' }
  }

  const { data: updatedComment, error } = await supabase
    .from('comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating comment:', error)
    return { error: 'Failed to update comment' }
  }

  // Revalidate
  const { data: article } = await supabase
    .from('articles')
    .select('slug')
    .eq('id', comment.article_id)
    .single()

  if (article) {
    revalidatePath(`/blog/${article.slug}`)
  }

  return { success: true, comment: updatedComment }
}

/**
 * Delete own comment
 */
export async function deleteOwnComment(commentId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication required' }
  }

  // Verify ownership
  const { data: comment } = await supabase
    .from('comments')
    .select('article_id, user_id')
    .eq('id', commentId)
    .single()

  if (!comment || comment.user_id !== user.id) {
    return { error: 'Comment not found or access denied' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    return { error: 'Failed to delete comment' }
  }

  // Revalidate
  const { data: article } = await supabase
    .from('articles')
    .select('slug')
    .eq('id', comment.article_id)
    .single()

  if (article) {
    revalidatePath(`/blog/${article.slug}`)
  }
  revalidatePath('/admin/comments')

  return { success: true }
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Get all comments for admin (with filtering)
 */
export async function getAdminComments({
  page = 1,
  limit = 20,
  status = null,
  search = null,
} = {}) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('comments')
    .select(`
      *,
      user:profiles(id, full_name, avatar_url, email),
      article:articles(id, slug, title_en, title_fa)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(`content.ilike.%${search}%,guest_name.ilike.%${search}%,guest_email.ilike.%${search}%`)
  }

  query = query.range(offset, offset + limit - 1)

  const { data: comments, count, error } = await query

  if (error) {
    console.error('Error fetching admin comments:', error)
    return { comments: [], total: 0, totalPages: 0, error: error.message }
  }

  return {
    comments: comments || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Get comment statistics for dashboard
 */
export async function getCommentStats() {
  const supabase = await createClient()

  const [pending, approved, spam, total] = await Promise.all([
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'spam'),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
  ])

  return {
    pending: pending.count || 0,
    approved: approved.count || 0,
    spam: spam.count || 0,
    total: total.count || 0,
  }
}

/**
 * Update comment status (admin)
 */
export async function updateCommentStatus(commentId, status) {
  const supabase = await createClient()

  const validStatuses = ['pending', 'approved', 'spam', 'rejected']
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status' }
  }

  // Get comment first for revalidation
  const { data: comment } = await supabase
    .from('comments')
    .select('article_id')
    .eq('id', commentId)
    .single()

  const { error } = await supabase
    .from('comments')
    .update({ status })
    .eq('id', commentId)

  if (error) {
    console.error('Error updating comment status:', error)
    return { error: 'Failed to update comment' }
  }

  // Revalidate
  if (comment) {
    const { data: article } = await supabase
      .from('articles')
      .select('slug')
      .eq('id', comment.article_id)
      .single()

    if (article) {
      revalidatePath(`/blog/${article.slug}`)
    }
  }
  revalidatePath('/admin/comments')

  return { success: true }
}

/**
 * Bulk update comment status (admin)
 */
export async function bulkUpdateCommentStatus(commentIds, status) {
  const supabase = await createClient()

  const validStatuses = ['pending', 'approved', 'spam', 'rejected']
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status' }
  }

  // Get articles for revalidation
  const { data: comments } = await supabase
    .from('comments')
    .select('article_id')
    .in('id', commentIds)

  const { error } = await supabase
    .from('comments')
    .update({ status })
    .in('id', commentIds)

  if (error) {
    console.error('Error bulk updating comments:', error)
    return { error: 'Failed to update comments' }
  }

  // Revalidate affected articles
  if (comments?.length) {
    const articleIds = [...new Set(comments.map(c => c.article_id))]
    for (const articleId of articleIds) {
      const { data: article } = await supabase
        .from('articles')
        .select('slug')
        .eq('id', articleId)
        .single()

      if (article) {
        revalidatePath(`/blog/${article.slug}`)
      }
    }
  }
  revalidatePath('/admin/comments')

  return { success: true, count: commentIds.length }
}

/**
 * Delete comment (admin)
 */
export async function deleteComment(commentId) {
  const supabase = await createClient()

  // Get comment for revalidation
  const { data: comment } = await supabase
    .from('comments')
    .select('article_id')
    .eq('id', commentId)
    .single()

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    return { error: 'Failed to delete comment' }
  }

  // Revalidate
  if (comment) {
    const { data: article } = await supabase
      .from('articles')
      .select('slug')
      .eq('id', comment.article_id)
      .single()

    if (article) {
      revalidatePath(`/blog/${article.slug}`)
    }
  }
  revalidatePath('/admin/comments')

  return { success: true }
}

/**
 * Bulk delete comments (admin)
 */
export async function bulkDeleteComments(commentIds) {
  const supabase = await createClient()

  // Get articles for revalidation
  const { data: comments } = await supabase
    .from('comments')
    .select('article_id')
    .in('id', commentIds)

  const { error } = await supabase
    .from('comments')
    .delete()
    .in('id', commentIds)

  if (error) {
    console.error('Error bulk deleting comments:', error)
    return { error: 'Failed to delete comments' }
  }

  // Revalidate affected articles
  if (comments?.length) {
    const articleIds = [...new Set(comments.map(c => c.article_id))]
    for (const articleId of articleIds) {
      const { data: article } = await supabase
        .from('articles')
        .select('slug')
        .eq('id', articleId)
        .single()

      if (article) {
        revalidatePath(`/blog/${article.slug}`)
      }
    }
  }
  revalidatePath('/admin/comments')

  return { success: true, count: commentIds.length }
}

/**
 * Reply to comment as admin
 */
export async function adminReplyToComment(parentId, content) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication required' }
  }

  // Get parent comment
  const { data: parentComment, error: fetchError } = await supabase
    .from('comments')
    .select('id, article_id, parent_id')
    .eq('id', parentId)
    .single()

  if (fetchError || !parentComment) {
    return { error: 'Parent comment not found' }
  }

  // Don't allow replies to replies
  if (parentComment.parent_id) {
    return { error: 'Cannot reply to a reply' }
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      article_id: parentComment.article_id,
      user_id: user.id,
      parent_id: parentId,
      content: content.trim(),
      status: 'approved', // Admin replies are auto-approved
    })
    .select(`
      *,
      user:profiles(id, full_name, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error creating admin reply:', error)
    return { error: 'Failed to post reply' }
  }

  // Revalidate
  const { data: article } = await supabase
    .from('articles')
    .select('slug')
    .eq('id', parentComment.article_id)
    .single()

  if (article) {
    revalidatePath(`/blog/${article.slug}`)
  }
  revalidatePath('/admin/comments')

  return { success: true, comment }
}
