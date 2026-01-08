'use client'

import { useState } from 'react'
import { Mail, User, Loader2, ArrowRight } from 'lucide-react'

export function ChatEmailForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      })
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background rounded-xl p-4 shadow-sm border border-border mt-2">
      <p className="text-sm text-muted-foreground mb-4">
        Please share your info so I can get back to you:
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name Input */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground text-sm"
            disabled={isSubmitting}
          />
        </div>

        {/* Email Input */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground text-sm"
            disabled={isSubmitting}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting chat...
            </>
          ) : (
            <>
              Start Chat
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Your email is only used to reply to you
      </p>
    </div>
  )
}
