'use client'

import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatSessionList({ sessions, selectedId, onSelect }) {
  if (sessions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-muted-foreground">
        <div>
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">New messages will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {sessions.map((session) => {
        const isSelected = session.id === selectedId
        const hasUnread = session.unread_count > 0
        const lastMessageTime = formatRelativeTime(session.last_message_at)

        return (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={cn(
              'w-full p-4 text-left border-b border-border transition-colors hover:bg-secondary/50',
              isSelected && 'bg-primary/10',
              hasUnread && 'bg-primary/5'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                {session.visitor_name?.[0]?.toUpperCase() || '?'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'font-medium truncate',
                      hasUnread && 'text-foreground',
                      !hasUnread && 'text-muted-foreground'
                    )}
                  >
                    {session.visitor_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {lastMessageTime}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">
                    {session.visitor_email || 'No email'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full capitalize',
                      session.status === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-gray-500/10 text-gray-500'
                    )}
                  >
                    {session.status}
                  </span>

                  {hasUnread && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                      {session.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function formatRelativeTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}
