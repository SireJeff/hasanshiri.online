'use client'

import { X } from 'lucide-react'

export function ChatHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-lg font-semibold">
          H
        </div>
        <div>
          <h3 className="font-semibold">Hasan Shiri</h3>
          <p className="text-xs text-primary-foreground/80">
            Usually replies within a few hours
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors"
        aria-label="Close chat"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
