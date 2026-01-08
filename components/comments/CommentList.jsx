'use client'

import { CommentItem } from './CommentItem'

export function CommentList({
  comments,
  user,
  locale = 'en',
  replyingTo,
  onReply,
  onCancelReply,
  onCommentAdded,
  articleId,
}) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          user={user}
          locale={locale}
          isReplyingTo={replyingTo === comment.id}
          onReply={onReply}
          onCancelReply={onCancelReply}
          onCommentAdded={onCommentAdded}
          articleId={articleId}
        />
      ))}
    </div>
  )
}
