'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { ChatWindow } from './ChatWindow'
import { getCurrentSession } from '@/lib/actions/chat'
import { createClient } from '@/lib/supabase/client'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load existing session on mount
  useEffect(() => {
    const loadSession = async () => {
      const { session: existingSession } = await getCurrentSession()
      if (existingSession) {
        setSession(existingSession)
      }
      setIsLoading(false)
    }
    loadSession()
  }, [])

  // Subscribe to new messages for this session
  useEffect(() => {
    if (!session?.id) return

    const supabase = createClient()

    const channel = supabase
      .channel(`chat-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          // Only notify for admin messages when chat is closed
          if (payload.new.sender_type === 'admin' && !isOpen) {
            setHasNewMessage(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.id, isOpen])

  // Clear notification when opening chat
  const handleToggle = useCallback(() => {
    if (!isOpen) {
      setHasNewMessage(false)
    }
    setIsOpen(!isOpen)
  }, [isOpen])

  const handleSessionCreated = useCallback((newSession) => {
    setSession(newSession)
  }, [])

  if (isLoading) return null

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          session={session}
          onClose={() => setIsOpen(false)}
          onSessionCreated={handleSessionCreated}
        />
      )}

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {/* Notification Badge */}
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-xs text-white font-medium">
                  !
                </span>
              </span>
            )}
          </>
        )}
      </button>
    </>
  )
}
