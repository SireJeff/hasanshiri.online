import { getAdminPageContent } from '@/lib/actions/page-content'
import { Edit } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Page Content | Admin',
}

export const dynamic = 'force-dynamic'

export default async function ContentAdminPage({
  searchParams,
}) {
  const pageSlug = searchParams.page || 'home'
  const { content } = await getAdminPageContent(pageSlug)

  // Group by section
  const contentBySection = content.reduce((acc, item) => {
    if (!acc[item.section_key]) {
      acc[item.section_key] = []
    }
    acc[item.section_key].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page Content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage home page and about section content
          </p>
        </div>
      </div>

      {/* Page Selector */}
      <div className="flex gap-2">
        <Link
          href="/admin/content?page=home"
          className={cn(
            "px-4 py-2 rounded-lg transition-colors",
            pageSlug === 'home'
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/70"
          )}
        >
          Home Page
        </Link>
        <Link
          href="/admin/content?page=about"
          className={cn(
            "px-4 py-2 rounded-lg transition-colors",
            pageSlug === 'about'
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/70"
          )}
        >
          About Page
        </Link>
      </div>

      {/* Content Sections */}
      {Object.keys(contentBySection).length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">No content sections found for this page.</p>
          <p className="text-sm text-muted-foreground">
            Run the database schema to create default sections, or add them manually.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(contentBySection).map(([sectionKey, items]) => (
            <div key={sectionKey} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold capitalize">
                  {sectionKey.replace(/_/g, ' ')} Section
                </h2>
              </div>

              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg mb-2 last:mb-0">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {item.title_en || '(No title)'} / {item.title_fa || '(بدون عنوان)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.section_key} • {item.is_enabled ? (
                        <span className="text-green-500">Visible</span>
                      ) : (
                        <span className="text-muted-foreground">Hidden</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/content/${item.id}/edit`}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
