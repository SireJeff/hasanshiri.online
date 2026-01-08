'use client'

import { Check, CheckCheck } from 'lucide-react'

export function ChatBubble({ message }) {
  const isVisitor = message.sender_type === 'visitor'
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
          isVisitor
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-secondary text-foreground rounded-bl-md'
        }`}
      >
        {/* Message Text */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>

        {/* Timestamp and Status */}
        <div
          className={`flex items-center gap-1 mt-1 text-xs ${
            isVisitor ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'
          }`}
        >
          <span>{time}</span>
          {isVisitor && (
            message.is_read ? (
              <CheckCheck className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )
          )}
        </div>
      </div>
    </div>
  )
}
