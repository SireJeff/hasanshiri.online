import Link from 'next/link'
import { getAdminArticles, deleteArticle, toggleArticleFeatured } from '@/lib/actions/articles'
import { Plus, Edit, Trash2, Eye, Star, ExternalLink, Search } from 'lucide-react'
import { ArticleActions } from './article-actions'

export const metadata = {
  title: 'Articles | Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage({ searchParams }) {
  const page = Number(searchParams?.page) || 1
  const status = searchParams?.status || null
  const search = searchParams?.search || null

  const { articles, total, totalPages } = await getAdminArticles({
    page,
    limit: 20,
    status,
    search,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your blog articles ({total} total)
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex gap-2">
          <FilterLink href="/admin/articles" active={!status}>All</FilterLink>
          <FilterLink href="/admin/articles?status=published" active={status === 'published'}>
            Published
          </FilterLink>
          <FilterLink href="/admin/articles?status=draft" active={status === 'draft'}>
            Drafts
          </FilterLink>
          <FilterLink href="/admin/articles?status=archived" active={status === 'archived'}>
            Archived
          </FilterLink>
        </div>

        {/* Search */}
        <form className="flex-1 max-w-sm">
          <div className="relative">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-lg focus:border-primary outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </form>
      </div>

      {/* Articles Table */}
      {articles.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground mb-4">No articles found</p>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Plus className="w-4 h-4" />
            Create your first article
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Author
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Views
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {article.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {article.title_en}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          /{article.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {article.category ? (
                      <span
                        className="inline-block px-2 py-0.5 text-xs rounded text-white"
                        style={{ backgroundColor: article.category.color }}
                      >
                        {article.category.name_en}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {article.author?.full_name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {article.view_count?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ArticleActions article={article} />
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
              href={`/admin/articles?page=${p}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}
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
    published: 'bg-green-500/10 text-green-500',
    draft: 'bg-yellow-500/10 text-yellow-500',
    archived: 'bg-gray-500/10 text-gray-500',
  }

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${styles[status] || styles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
