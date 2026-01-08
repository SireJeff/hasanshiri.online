'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessagesSquare, Inbox, Archive, MessageCircle } from 'lucide-react'
import { ChatSessionList } from './chat-session-list'
import { ChatConversation } from './chat-conversation'
import { getAdminChatSessions } from '@/lib/actions/chat'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function ChatDashboard({ initialSessions, stats }) {
  const [sessions, setSessions] = useState(initialSessions)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [filter, setFilter] = useState('active')
  const [isMobileListVisible, setIsMobileListVisible] = useState(true)

  // Refresh sessions on filter change
  useEffect(() => {
    const refreshSessions = async () => {
      const { sessions: newSessions } = await getAdminChatSessions({
        status: filter === 'all' ? null : filter,
        limit: 50,
      })
      setSessions(newSessions)
    }
    refreshSessions()
  }, [filter])

  // Subscribe to new sessions and messages
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('admin-chat-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
        },
        async () => {
          // Refresh sessions list
          const { sessions: newSessions } = await getAdminChatSessions({
            status: filter === 'all' ? null : filter,
            limit: 50,
          })
          setSessions(newSessions)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async () => {
          // Refresh sessions to update unread counts
          const { sessions: newSessions } = await getAdminChatSessions({
            status: filter === 'all' ? null : filter,
            limit: 50,
          })
          setSessions(newSessions)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  const handleSelectSession = useCallback((sessionId) => {
    setSelectedSessionId(sessionId)
    setIsMobileListVisible(false)
  }, [])

  const handleBackToList = useCallback(() => {
    setIsMobileListVisible(true)
    setSelectedSessionId(null)
  }, [])

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chat Messages</h1>
        <p className="text-muted-foreground mt-1">
          Manage conversations with your visitors
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MessagesSquare}
          label="Active Chats"
          value={stats.activeSessions}
          color="text-green-500"
          bgColor="bg-green-500/10"
        />
        <StatCard
          icon={Inbox}
          label="Unread Messages"
          value={stats.unreadMessages}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={Archive}
          label="Closed"
          value={stats.closedSessions}
          color="text-gray-500"
          bgColor="bg-gray-500/10"
        />
        <StatCard
          icon={MessageCircle}
          label="Total Messages"
          value={stats.totalMessages}
          color="text-purple-500"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {['active', 'closed', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Chat Interface */}
      <div className="bg-card border border-border rounded-xl overflow-hidden h-[600px] flex">
        {/* Sessions List */}
        <div
          className={cn(
            'w-full md:w-80 border-r border-border flex-shrink-0',
            !isMobileListVisible && 'hidden md:block'
          )}
        >
          <ChatSessionList
            sessions={sessions}
            selectedId={selectedSessionId}
            onSelect={handleSelectSession}
          />
        </div>

        {/* Conversation View */}
        <div
          className={cn(
            'flex-1 flex flex-col',
            isMobileListVisible && 'hidden md:flex'
          )}
        >
          {selectedSession ? (
            <ChatConversation
              session={selectedSession}
              onBack={handleBackToList}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessagesSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="p-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}
