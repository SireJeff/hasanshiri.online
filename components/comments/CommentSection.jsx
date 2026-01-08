'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, LogIn } from 'lucide-react'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'
import { getArticleComments } from '@/lib/actions/comments'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function CommentSection({ articleId, locale = 'en' }) {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const isRtl = locale === 'fa'

  // Fetch current user
  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)
      const { comments: fetchedComments } = await getArticleComments(articleId)
      setComments(fetchedComments || [])
      setIsLoading(false)
    }

    fetchComments()
  }, [articleId])

  const handleCommentAdded = (newComment, isPending) => {
    if (!isPending) {
      // If auto-approved, add to list
      if (newComment.parent_id) {
        // Add reply to parent
        setComments(prev => prev.map(comment => {
          if (comment.id === newComment.parent_id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            }
          }
          return comment
        }))
      } else {
        // Add new root comment
        setComments(prev => [...prev, { ...newComment, replies: [] }])
      }
    }
    setReplyingTo(null)
  }

  const handleReply = (commentId) => {
    setReplyingTo(commentId)
    // Scroll to form
    setTimeout(() => {
      document.getElementById(`reply-form-${commentId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }, 100)
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  const commentCount = comments.reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  )

  return (
    <section
      className="mt-12 pt-8 border-t border-border"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">
          {isRtl ? 'نظرات' : 'Comments'}
          {commentCount > 0 && (
            <span className="text-muted-foreground font-normal text-lg ms-2">
              ({commentCount})
            </span>
          )}
        </h2>
      </div>

      {/* Comment Form - Main */}
      <div className="mb-10">
        <CommentForm
          articleId={articleId}
          user={user}
          locale={locale}
          onCommentAdded={handleCommentAdded}
        />

        {/* GitHub Login Prompt for Guests */}
        {!user && (
          <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-3">
              <LogIn className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isRtl
                  ? 'برای تجربه بهتر، با گیت‌هاب وارد شوید'
                  : 'For a better experience, sign in with GitHub'}
              </p>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary hover:underline ms-auto"
              >
                {isRtl ? 'ورود' : 'Sign in'}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-1/4" />
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <CommentList
          comments={comments}
          user={user}
          locale={locale}
          replyingTo={replyingTo}
          onReply={handleReply}
          onCancelReply={handleCancelReply}
          onCommentAdded={handleCommentAdded}
          articleId={articleId}
        />
      ) : (
        <div className="text-center py-12 bg-secondary/20 rounded-xl">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isRtl
              ? 'هنوز نظری ثبت نشده است. اولین نفر باشید!'
              : 'No comments yet. Be the first to share your thoughts!'}
          </p>
        </div>
      )}
    </section>
  )
}
