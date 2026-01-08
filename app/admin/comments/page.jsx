import Link from 'next/link'
import { getAdminComments, getCommentStats } from '@/lib/actions/comments'
import { MessageSquare, Search, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { CommentActions } from './comment-actions'

export const metadata = {
  title: 'Comments | Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage({ searchParams }) {
  const page = Number(searchParams?.page) || 1
  const status = searchParams?.status || null
  const search = searchParams?.search || null

  const [{ comments, totalPages }, stats] = await Promise.all([
    getAdminComments({ page, limit: 20, status, search }),
    getCommentStats(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Comments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Moderate and manage article comments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="text-yellow-500"
          bgColor="bg-yellow-500/10"
          href="/admin/comments?status=pending"
          active={status === 'pending'}
        />
        <StatsCard
          label="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="text-green-500"
          bgColor="bg-green-500/10"
          href="/admin/comments?status=approved"
          active={status === 'approved'}
        />
        <StatsCard
          label="Spam"
          value={stats.spam}
          icon={AlertTriangle}
          color="text-red-500"
          bgColor="bg-red-500/10"
          href="/admin/comments?status=spam"
          active={status === 'spam'}
        />
        <StatsCard
          label="Total"
          value={stats.total}
          icon={MessageSquare}
          color="text-primary"
          bgColor="bg-primary/10"
          href="/admin/comments"
          active={!status}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex gap-2">
          <FilterLink href="/admin/comments" active={!status}>All</FilterLink>
          <FilterLink href="/admin/comments?status=pending" active={status === 'pending'}>
            Pending
          </FilterLink>
          <FilterLink href="/admin/comments?status=approved" active={status === 'approved'}>
            Approved
          </FilterLink>
          <FilterLink href="/admin/comments?status=spam" active={status === 'spam'}>
            Spam
          </FilterLink>
          <FilterLink href="/admin/comments?status=rejected" active={status === 'rejected'}>
            Rejected
          </FilterLink>
        </div>

        {/* Search */}
        <form className="flex-1 max-w-sm">
          <div className="relative">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Search comments..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-lg focus:border-primary outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </form>
      </div>

      {/* Comments Table */}
      {comments.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {status === 'pending'
              ? 'No pending comments to review'
              : 'No comments found'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Author
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Comment
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Article
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {comment.user?.full_name || comment.guest_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {comment.user?.email || comment.guest_email || '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-md">
                    <p className="text-sm text-foreground line-clamp-2">
                      {comment.content}
                    </p>
                    {comment.parent_id && (
                      <span className="text-xs text-muted-foreground">
                        (reply)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {comment.article ? (
                      <Link
                        href={`/blog/${comment.article.slug}`}
                        className="text-sm text-primary hover:underline line-clamp-1"
                        target="_blank"
                      >
                        {comment.article.title_en}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={comment.status} />
                  </td>
                  <td className="px-4 py-3">
                    <CommentActions comment={comment} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/comments?page=${p}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StatsCard({ label, value, icon: Icon, color, bgColor, href, active }) {
  return (
    <Link
      href={href}
      className={`p-4 rounded-xl border transition-colors ${
        active
          ? 'bg-primary/5 border-primary'
          : 'bg-card border-border hover:border-primary/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </Link>
  )
}

function FilterLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </Link>
  )
}

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-green-500/10 text-green-500',
    pending: 'bg-yellow-500/10 text-yellow-500',
    spam: 'bg-red-500/10 text-red-500',
    rejected: 'bg-gray-500/10 text-gray-500',
  }

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
