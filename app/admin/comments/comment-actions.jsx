'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'
import { updateCommentStatus, deleteComment, adminReplyToComment } from '@/lib/actions/comments'

export function CommentActions({ comment }) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStatusChange = async (status) => {
    setIsSubmitting(true)
    await updateCommentStatus(comment.id, status)
    setIsSubmitting(false)
    setShowMenu(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    await deleteComment(comment.id)
    setIsSubmitting(false)
    setShowMenu(false)
    router.refresh()
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    const result = await adminReplyToComment(comment.id, replyContent)
    setIsSubmitting(false)

    if (result.success) {
      setReplyContent('')
      setShowReplyModal(false)
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Quick Actions */}
      {comment.status === 'pending' && (
        <>
          <button
            onClick={() => handleStatusChange('approved')}
            disabled={isSubmitting}
            className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
            title="Approve"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStatusChange('spam')}
            disabled={isSubmitting}
            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Mark as Spam"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Reply button (only for root comments) */}
      {!comment.parent_id && (
        <button
          onClick={() => setShowReplyModal(true)}
          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="Reply"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      )}

      {/* More Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[160px]">
              {/* View on site */}
              {comment.article && (
                <a
                  href={`/blog/${comment.article.slug}#comment-${comment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Site
                </a>
              )}

              {/* Status changes */}
              {comment.status !== 'approved' && (
                <button
                  onClick={() => handleStatusChange('approved')}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-500 hover:bg-green-500/10 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              )}

              {comment.status !== 'rejected' && (
                <button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              )}

              {comment.status !== 'spam' && (
                <button
                  onClick={() => handleStatusChange('spam')}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-500 hover:bg-orange-500/10 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Mark as Spam
                </button>
              )}

              <hr className="border-border my-1" />

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Reply to Comment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Reply to {comment.user?.full_name || comment.guest_name || 'Anonymous'}
              </p>
            </div>

            {/* Original comment */}
            <div className="p-4 bg-secondary/30">
              <p className="text-sm text-muted-foreground line-clamp-3">
                "{comment.content}"
              </p>
            </div>

            <form onSubmit={handleReply} className="p-4 space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={4}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                maxLength={2000}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyModal(false)
                    setReplyContent('')
                  }}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !replyContent.trim()}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
