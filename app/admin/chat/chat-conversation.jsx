'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ArrowLeft,
  Send,
  Loader2,
  Mail,
  Clock,
  MoreVertical,
  Archive,
  Trash2,
  CheckCheck,
} from 'lucide-react'
import {
  getAdminSessionMessages,
  sendAdminReply,
  markMessagesAsRead,
  updateSessionStatus,
  deleteSession,
} from '@/lib/actions/chat'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function ChatConversation({ session, onBack }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef(null)
  const menuRef = useRef(null)

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true)
      const { messages: loadedMessages } = await getAdminSessionMessages(session.id)
      setMessages(loadedMessages)
      setIsLoading(false)

      // Mark as read
      await markMessagesAsRead(session.id)
    }
    loadMessages()
  }, [session.id])

  // Subscribe to new messages
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`admin-conversation-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new]
          })
          // Mark as read
          markMessagesAsRead(session.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session.id])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSendReply = useCallback(async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)

    // Optimistic update
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      session_id: session.id,
      sender_type: 'admin',
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_read: true,
    }
    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage('')

    const { message: sentMessage, error } = await sendAdminReply(
      session.id,
      newMessage.trim()
    )

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      console.error('Failed to send reply:', error)
    } else if (sentMessage) {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? sentMessage : m))
      )
    }

    setIsSending(false)
  }, [newMessage, session.id, isSending])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  const handleCloseSession = async () => {
    await updateSessionStatus(session.id, 'closed')
    setShowMenu(false)
  }

  const handleDeleteSession = async () => {
    if (confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      await deleteSession(session.id)
      onBack()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-secondary rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {session.visitor_name?.[0]?.toUpperCase() || '?'}
          </div>

          <div>
            <h3 className="font-semibold text-foreground">
              {session.visitor_name || 'Anonymous'}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {session.visitor_email || 'No email'}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-secondary rounded-lg"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
              {session.status === 'active' && (
                <button
                  onClick={handleCloseSession}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-secondary"
                >
                  <Archive className="w-4 h-4" />
                  Close Conversation
                </button>
              )}
              <button
                onClick={handleDeleteSession}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Session Info */}
      <div className="px-4 py-2 bg-secondary/20 text-xs text-muted-foreground flex items-center gap-4 border-b border-border">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Started: {new Date(session.created_at).toLocaleString()}
        </span>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full capitalize',
            session.status === 'active'
              ? 'bg-green-500/10 text-green-500'
              : 'bg-gray-500/10 text-gray-500'
          )}
        >
          {session.status}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Input */}
      {session.status === 'active' && (
        <div className="p-4 border-t border-border">
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply..."
              rows={1}
              className="flex-1 px-4 py-2.5 bg-secondary/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm max-h-[120px]"
              disabled={isSending}
            />
            <button
              onClick={handleSendReply}
              disabled={!newMessage.trim() || isSending}
              className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}

      {session.status === 'closed' && (
        <div className="p-4 border-t border-border bg-secondary/30 text-center text-sm text-muted-foreground">
          This conversation is closed. Reopen to reply.
        </div>
      )}
    </div>
  )
}

function MessageBubble({ message }) {
  const isAdmin = message.sender_type === 'admin'
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div
        className={cn(
          'max-w-[75%] px-4 py-2.5 rounded-2xl',
          isAdmin
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-secondary text-foreground rounded-bl-md'
        )}
      >
        {/* Sender label for admin */}
        {isAdmin && message.sender?.full_name && (
          <p className="text-xs text-primary-foreground/70 mb-1">
            {message.sender.full_name}
          </p>
        )}

        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>

        <div
          className={`flex items-center gap-1 mt-1 text-xs ${
            isAdmin ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'
          }`}
        >
          <span>{time}</span>
          {!isAdmin && message.is_read && (
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          )}
        </div>
      </div>
    </div>
  )
}
