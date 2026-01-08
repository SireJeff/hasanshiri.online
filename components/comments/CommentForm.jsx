'use client'

import { useState } from 'react'
import { Send, Loader2, User, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { createComment } from '@/lib/actions/comments'
import Image from 'next/image'

export function CommentForm({
  articleId,
  user,
  locale = 'en',
  parentId = null,
  onCommentAdded,
  onCancel,
  placeholder,
}) {
  const isRtl = locale === 'fa'

  const [content, setContent] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!content.trim()) {
      setError(isRtl ? 'لطفا نظر خود را وارد کنید' : 'Please enter your comment')
      return
    }

    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      setError(isRtl ? 'نام و ایمیل الزامی است' : 'Name and email are required')
      return
    }

    setIsSubmitting(true)

    // Get honeypot value (should be empty)
    const honeypot = document.getElementById(`website_url_${parentId || 'main'}`)?.value

    const result = await createComment({
      articleId,
      content: content.trim(),
      parentId,
      guestName: user ? null : guestName.trim(),
      guestEmail: user ? null : guestEmail.trim(),
      website_url: honeypot, // Honeypot field
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.success) {
      setContent('')
      setGuestName('')
      setGuestEmail('')
      setSuccess(result.message)

      // Notify parent
      if (onCommentAdded) {
        onCommentAdded(result.comment, result.isPending)
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000)
    }
  }

  const defaultPlaceholder = parentId
    ? (isRtl ? 'پاسخ خود را بنویسید...' : 'Write your reply...')
    : (isRtl ? 'نظر خود را بنویسید...' : 'Share your thoughts...')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* User Info Display (if logged in) */}
      {user && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata?.full_name || 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
          <span>
            {isRtl ? 'نظر دادن به عنوان' : 'Commenting as'}{' '}
            <span className="font-medium text-foreground">
              {user.user_metadata?.full_name || user.email}
            </span>
          </span>
        </div>
      )}

      {/* Guest Fields (if not logged in) */}
      {!user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={isRtl ? 'نام شما *' : 'Your name *'}
              className="w-full ps-10 pe-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
              maxLength={100}
            />
          </div>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder={isRtl ? 'ایمیل شما *' : 'Your email *'}
              className="w-full ps-10 pe-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
              maxLength={255}
            />
          </div>
        </div>
      )}

      {/* Honeypot Field (hidden from users, visible to bots) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`website_url_${parentId || 'main'}`}>
          Website (leave empty)
        </label>
        <input
          type="text"
          id={`website_url_${parentId || 'main'}`}
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Comment Textarea */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          rows={parentId ? 3 : 4}
          className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground resize-none"
          maxLength={2000}
        />
        <div className="absolute bottom-2 end-2 text-xs text-muted-foreground">
          {content.length}/2000
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isRtl ? 'در حال ارسال...' : 'Posting...'}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {parentId
                ? (isRtl ? 'ارسال پاسخ' : 'Post Reply')
                : (isRtl ? 'ارسال نظر' : 'Post Comment')}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isRtl ? 'انصراف' : 'Cancel'}
          </button>
        )}
      </div>

      {/* Privacy Note */}
      {!user && !parentId && (
        <p className="text-xs text-muted-foreground">
          {isRtl
            ? 'ایمیل شما منتشر نخواهد شد. نظرات جدید پس از تایید نمایش داده می‌شوند.'
            : 'Your email will not be published. New comments are reviewed before appearing.'}
        </p>
      )}
    </form>
  )
}
