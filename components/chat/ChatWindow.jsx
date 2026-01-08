'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChatHeader } from './ChatHeader'
import { ChatBubble } from './ChatBubble'
import { ChatInput } from './ChatInput'
import { ChatEmailForm } from './ChatEmailForm'
import {
  getOrCreateChatSession,
  getSessionMessages,
  sendVisitorMessage,
} from '@/lib/actions/chat'
import { createClient } from '@/lib/supabase/client'

const AUTO_GREETING = "Hi there! I'm Hasan. Leave me a message and I'll get back to you as soon as possible."

export function ChatWindow({ session: initialSession, onClose, onSessionCreated }) {
  const [session, setSession] = useState(initialSession)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [needsEmail, setNeedsEmail] = useState(!initialSession?.visitor_email)
  const messagesEndRef = useRef(null)

  // Load messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      if (session?.session_token) {
        const { messages: loadedMessages } = await getSessionMessages(session.session_token)
        setMessages(loadedMessages)
      }
      setIsLoading(false)
    }
    loadMessages()
  }, [session?.session_token])

  // Subscribe to new messages via Supabase Realtime
  useEffect(() => {
    if (!session?.id) return

    const supabase = createClient()

    const channel = supabase
      .channel(`chat-window-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          // Add new message to the list (avoid duplicates)
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle email form submission
  const handleEmailSubmit = useCallback(async (visitorInfo) => {
    const { session: newSession } = await getOrCreateChatSession(visitorInfo)

    if (newSession) {
      setSession(newSession)
      setNeedsEmail(false)
      onSessionCreated?.(newSession)

      // Load existing messages if any
      const { messages: loadedMessages } = await getSessionMessages(newSession.session_token)
      setMessages(loadedMessages)
    }
  }, [onSessionCreated])

  // Handle sending message
  const handleSendMessage = useCallback(async (content) => {
    if (!session?.session_token || !content.trim()) return

    setIsSending(true)

    // Optimistically add the message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      session_id: session.id,
      sender_type: 'visitor',
      message: content.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setMessages((prev) => [...prev, optimisticMessage])

    const { message: sentMessage, error } = await sendVisitorMessage(
      session.session_token,
      content
    )

    if (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      console.error('Failed to send message:', error)
    } else if (sentMessage) {
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? sentMessage : m))
      )
    }

    setIsSending(false)
  }, [session])

  // Build messages with auto-greeting
  const displayMessages = [
    // Auto-greeting as first message
    {
      id: 'greeting',
      sender_type: 'admin',
      message: AUTO_GREETING,
      created_at: session?.created_at || new Date().toISOString(),
      is_greeting: true,
    },
    ...messages,
  ]

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <ChatHeader onClose={onClose} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : needsEmail ? (
          <>
            {/* Show greeting before email form */}
            <ChatBubble
              message={{
                id: 'greeting',
                sender_type: 'admin',
                message: AUTO_GREETING,
                created_at: new Date().toISOString(),
              }}
            />
            <ChatEmailForm onSubmit={handleEmailSubmit} />
          </>
        ) : (
          <>
            {displayMessages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      {!needsEmail && !isLoading && (
        <ChatInput onSend={handleSendMessage} isSending={isSending} />
      )}
    </div>
  )
}
