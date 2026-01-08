'use client'

import { useState } from 'react'
import { Reply, Clock, User, MoreVertical, Pencil, Trash2, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { CommentForm } from './CommentForm'
import { updateComment, deleteOwnComment } from '@/lib/actions/comments'

export function CommentItem({
  comment,
  user,
  locale = 'en',
  isReplyingTo,
  onReply,
  onCancelReply,
  onCommentAdded,
  articleId,
  isReply = false,
}) {
  const isRtl = locale === 'fa'

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Get author info
  const authorName = comment.user?.full_name || comment.guest_name || 'Anonymous'
  const authorAvatar = comment.user?.avatar_url
  const isOwn = user && comment.user_id === user.id
  const isAdmin = comment.user?.role === 'admin'

  // Check if within edit window (15 minutes)
  const createdAt = new Date(comment.created_at)
  const now = new Date()
  const canEdit = isOwn && (now - createdAt) < 15 * 60 * 1000

  // Format date
  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return isRtl ? 'همین الان' : 'Just now'
    if (diffMins < 60) return isRtl ? `${diffMins} دقیقه پیش` : `${diffMins}m ago`
    if (diffHours < 24) return isRtl ? `${diffHours} ساعت پیش` : `${diffHours}h ago`
    if (diffDays < 7) return isRtl ? `${diffDays} روز پیش` : `${diffDays}d ago`

    return d.toLocaleDateString(isRtl ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowActions(false)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return

    setIsSaving(true)
    const result = await updateComment(comment.id, editContent)
    setIsSaving(false)

    if (result.success) {
      comment.content = editContent
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(isRtl ? 'آیا مطمئن هستید؟' : 'Are you sure you want to delete this comment?')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteOwnComment(comment.id)
    setIsDeleting(false)

    if (result.success) {
      // Refresh page to update comments
      window.location.reload()
    }
  }

  return (
    <div className={`${isReply ? 'ms-8 md:ms-12' : ''}`}>
      <div className={`p-4 rounded-xl ${isReply ? 'bg-secondary/30' : 'bg-card border border-border'}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={authorName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            )}

            {/* Author Info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {authorName}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    {isRtl ? 'نویسنده' : 'Author'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(comment.created_at)}
                {comment.updated_at !== comment.created_at && (
                  <span className="ms-1">({isRtl ? 'ویرایش شده' : 'edited'})</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {isOwn && !isEditing && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute end-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                    {canEdit && (
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        {isRtl ? 'ویرایش' : 'Edit'}
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isRtl ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
              rows={3}
              maxLength={2000}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editContent.trim()}
                className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? (isRtl ? 'ذخیره...' : 'Saving...') : (isRtl ? 'ذخیره' : 'Save')}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }}
                className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-foreground whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}

        {/* Reply Button (only for root comments) */}
        {!isReply && !isEditing && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <button
              onClick={() => onReply(comment.id)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="w-4 h-4" />
              {isRtl ? 'پاسخ' : 'Reply'}
            </button>
          </div>
        )}
      </div>

      {/* Reply Form */}
      {isReplyingTo && (
        <div id={`reply-form-${comment.id}`} className="mt-4 ms-8 md:ms-12">
          <CommentForm
            articleId={articleId}
            user={user}
            locale={locale}
            parentId={comment.id}
            onCommentAdded={onCommentAdded}
            onCancel={onCancelReply}
            placeholder={isRtl ? `پاسخ به ${authorName}...` : `Reply to ${authorName}...`}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              user={user}
              locale={locale}
              articleId={articleId}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
