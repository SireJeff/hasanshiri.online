'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Session token cookie name
const SESSION_COOKIE_NAME = 'chat_session_token'

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Generate a unique session token
 */
function generateSessionToken() {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Get or create a chat session for the current visitor
 */
export async function getOrCreateChatSession(visitorInfo = {}) {
  const supabase = await createClient()
  const cookieStore = await cookies()

  // Check for existing session token
  let sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    // Try to find existing session
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('status', 'active')
      .single()

    if (existingSession) {
      return { session: existingSession }
    }
  }

  // Create new session
  sessionToken = generateSessionToken()

  const { data: session, error } = await supabase
    .from('chat_sessions')
    .insert({
      session_token: sessionToken,
      visitor_name: visitorInfo.name || null,
      visitor_email: visitorInfo.email || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating chat session:', error)
    return { error: 'Failed to start chat session' }
  }

  // Set session cookie (expires in 7 days)
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })

  return { session, isNew: true }
}

/**
 * Update visitor info for a session
 */
export async function updateVisitorInfo(sessionToken, visitorInfo) {
  const supabase = await createClient()

  const { data: session, error } = await supabase
    .from('chat_sessions')
    .update({
      visitor_name: visitorInfo.name,
      visitor_email: visitorInfo.email,
      updated_at: new Date().toISOString(),
    })
    .eq('session_token', sessionToken)
    .select()
    .single()

  if (error) {
    console.error('Error updating visitor info:', error)
    return { error: 'Failed to update info' }
  }

  return { session }
}

/**
 * Get current session from cookie
 */
export async function getCurrentSession() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return { session: null }
  }

  const { data: session } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('status', 'active')
    .single()

  return { session }
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

/**
 * Send a message from visitor
 */
export async function sendVisitorMessage(sessionToken, message) {
  const supabase = await createClient()

  if (!message || message.trim().length === 0) {
    return { error: 'Message cannot be empty' }
  }

  if (message.length > 2000) {
    return { error: 'Message is too long (max 2000 characters)' }
  }

  // Get session with visitor info
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id, visitor_name, visitor_email')
    .eq('session_token', sessionToken)
    .eq('status', 'active')
    .single()

  if (!session) {
    return { error: 'Chat session not found or expired' }
  }

  // Insert message
  const { data: newMessage, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: session.id,
      sender_type: 'visitor',
      message: message.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { error: 'Failed to send message' }
  }

  // Update session last_message_at
  await supabase
    .from('chat_sessions')
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.id)

  // Send notification (fire and forget - don't await)
  sendNotification({
    sessionId: session.id,
    message: message.trim(),
    visitorName: session.visitor_name,
    visitorEmail: session.visitor_email,
  }).catch((err) => console.error('Notification error:', err))

  revalidatePath('/admin/chat')

  return { message: newMessage }
}

/**
 * Send notification to admin about new message
 */
async function sendNotification({ sessionId, message, visitorName, visitorEmail }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const notifySecret = process.env.NOTIFICATION_SECRET || 'chat-notify-secret'

  try {
    await fetch(`${siteUrl}/api/notify/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${notifySecret}`,
      },
      body: JSON.stringify({
        sessionId,
        message,
        visitorName,
        visitorEmail,
      }),
    })
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}

/**
 * Get messages for a session (visitor side)
 */
export async function getSessionMessages(sessionToken) {
  const supabase = await createClient()

  // Get session
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('session_token', sessionToken)
    .single()

  if (!session) {
    return { messages: [] }
  }

  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return { messages: [], error: error.message }
  }

  return { messages: messages || [] }
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Get all chat sessions for admin
 */
export async function getAdminChatSessions({
  page = 1,
  limit = 20,
  status = null,
} = {}) {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('chat_sessions')
    .select(`
      *,
      messages:chat_messages(count)
    `, { count: 'exact' })
    .order('last_message_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  query = query.range(offset, offset + limit - 1)

  const { data: sessions, count, error } = await query

  if (error) {
    console.error('Error fetching chat sessions:', error)
    return { sessions: [], total: 0, error: error.message }
  }

  // Get unread counts for each session
  const sessionsWithUnread = await Promise.all(
    (sessions || []).map(async (session) => {
      const { count: unreadCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id)
        .eq('sender_type', 'visitor')
        .eq('is_read', false)

      return {
        ...session,
        unread_count: unreadCount || 0,
      }
    })
  )

  return {
    sessions: sessionsWithUnread,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Get messages for a specific session (admin)
 */
export async function getAdminSessionMessages(sessionId) {
  const supabase = await createClient()

  // Get session details
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    return { session: null, messages: [], error: 'Session not found' }
  }

  // Get messages
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:profiles(id, full_name, avatar_url)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return { session, messages: [], error: error.message }
  }

  return { session, messages: messages || [] }
}

/**
 * Send admin reply
 */
export async function sendAdminReply(sessionId, message) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication required' }
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Admin access required' }
  }

  if (!message || message.trim().length === 0) {
    return { error: 'Message cannot be empty' }
  }

  // Insert message
  const { data: newMessage, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      sender_type: 'admin',
      sender_id: user.id,
      message: message.trim(),
      is_read: true, // Admin messages are considered read
    })
    .select(`
      *,
      sender:profiles(id, full_name, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error sending admin reply:', error)
    return { error: 'Failed to send reply' }
  }

  // Update session timestamp
  await supabase
    .from('chat_sessions')
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  revalidatePath('/admin/chat')

  return { message: newMessage }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(sessionId) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('chat_messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('sender_type', 'visitor')
    .eq('is_read', false)

  if (error) {
    console.error('Error marking messages as read:', error)
    return { error: 'Failed to mark as read' }
  }

  revalidatePath('/admin/chat')

  return { success: true }
}

/**
 * Close/archive a chat session
 */
export async function updateSessionStatus(sessionId, status) {
  const supabase = await createClient()

  const validStatuses = ['active', 'closed', 'archived']
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status' }
  }

  const { error } = await supabase
    .from('chat_sessions')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error updating session status:', error)
    return { error: 'Failed to update session' }
  }

  revalidatePath('/admin/chat')

  return { success: true }
}

/**
 * Get chat statistics for dashboard
 */
export async function getChatStats() {
  const supabase = await createClient()

  const [active, closed, totalMessages, unreadMessages] = await Promise.all([
    supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
    supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
    supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_type', 'visitor')
      .eq('is_read', false),
  ])

  return {
    activeSessions: active.count || 0,
    closedSessions: closed.count || 0,
    totalMessages: totalMessages.count || 0,
    unreadMessages: unreadMessages.count || 0,
  }
}

/**
 * Delete a chat session (and its messages via cascade)
 */
export async function deleteSession(sessionId) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) {
    console.error('Error deleting session:', error)
    return { error: 'Failed to delete session' }
  }

  revalidatePath('/admin/chat')

  return { success: true }
}
