'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteArticle, toggleArticleFeatured } from '@/lib/actions/articles'
import { Edit, Trash2, Eye, Star, ExternalLink, MoreHorizontal, Loader2 } from 'lucide-react'

export function ArticleActions({ article }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    startTransition(async () => {
      await deleteArticle(article.id)
      setShowDeleteConfirm(false)
      router.refresh()
    })
  }

  const handleToggleFeatured = async () => {
    startTransition(async () => {
      await toggleArticleFeatured(article.id, !article.is_featured)
      setShowMenu(false)
      router.refresh()
    })
  }

  return (
    <div className="relative flex items-center justify-end gap-1">
      {/* Quick Actions */}
      <Link
        href={`/admin/articles/${article.id}/edit`}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </Link>

      {article.status === 'published' && (
        <Link
          href={`/blog/${article.slug}`}
          target="_blank"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          title="View"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      )}

      {/* More Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
              <button
                onClick={handleToggleFeatured}
                disabled={isPending}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <Star className={`w-4 h-4 ${article.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {article.is_featured ? 'Remove from featured' : 'Add to featured'}
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowDeleteConfirm(true)
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete article
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Delete Article
            </h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{article.title_en}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
