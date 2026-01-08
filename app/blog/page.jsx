import { Suspense } from 'react'
import Link from 'next/link'
import { getArticles, getFeaturedArticles } from '@/lib/actions/articles'
import { getCategoriesWithCount } from '@/lib/actions/categories'
import { getPopularTags } from '@/lib/actions/tags'
import { ArticleCard, ArticleCardSkeleton } from '@/components/blog/ArticleCard'
import { Pagination } from '@/components/blog/Pagination'
import { CategoryFilter, TagCloud } from '@/components/blog/CategoryFilter'
import { SearchBar } from '@/components/blog/SearchBar'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Blog | Hasan Shiri',
  description: 'Articles about technology, data science, physics, and more.',
}

// Force dynamic for search params
export const dynamic = 'force-dynamic'

async function FeaturedArticles({ locale }) {
  const { articles } = await getFeaturedArticles(3)

  if (!articles?.length) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Featured</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>
    </section>
  )
}

async function ArticleGrid({ searchParams, locale }) {
  const page = Number(searchParams?.page) || 1
  const category = searchParams?.category || null
  const tag = searchParams?.tag || null
  const search = searchParams?.search || null

  const { articles, total, totalPages } = await getArticles({
    page,
    limit: 9,
    category,
    tag,
    search,
  })

  const hasFilters = category || tag || search

  if (!articles?.length) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {hasFilters ? 'No articles found' : 'No articles yet'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {hasFilters
            ? 'Try adjusting your filters or search query.'
            : 'Check back soon for new content!'}
        </p>
        {hasFilters && (
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Clear filters
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Results info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {articles.length} of {total} articles
          {search && <span className="ml-1">for "{search}"</span>}
        </p>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} />
    </>
  )
}

function ArticleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  )
}

async function Sidebar({ searchParams, locale }) {
  const [categories, tags] = await Promise.all([
    getCategoriesWithCount(),
    getPopularTags(15),
  ])

  const activeCategory = searchParams?.category || null
  const activeTag = searchParams?.tag || null

  return (
    <aside className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Search</h3>
        <SearchBar locale={locale} />
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
        <div className="flex flex-col gap-2">
          <Link
            href="/blog"
            className={`text-sm px-3 py-2 rounded-lg transition-colors ${
              !activeCategory
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            All Articles
          </Link>
          {categories.map(category => (
            <Link
              key={category.id}
              href={`/blog?category=${category.slug}`}
              className={`text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                activeCategory === category.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name_en}
              </span>
              <span className="text-xs opacity-60">{category.article_count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Tags */}
      <TagCloud tags={tags} activeTag={activeTag} locale={locale} />
    </aside>
  )
}

export default async function BlogPage({ searchParams }) {
  const locale = 'en' // TODO: Get from i18n context

  const hasFilters = searchParams?.category || searchParams?.tag || searchParams?.search

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Header */}
        <header className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-3">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Exploring technology, data science, physics, and complex systems.
            Thoughts and insights from my journey.
          </p>
        </header>

        {/* Featured (only on main blog page without filters) */}
        {!hasFilters && (
          <Suspense fallback={<ArticleGridSkeleton />}>
            <FeaturedArticles locale={locale} />
          </Suspense>
        )}

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-10">
          {/* Articles */}
          <main>
            {/* Mobile Category Filter */}
            <div className="lg:hidden mb-6">
              <Suspense fallback={<div className="h-10 bg-muted rounded-lg animate-pulse" />}>
                <MobileCategoryFilter searchParams={searchParams} locale={locale} />
              </Suspense>
            </div>

            <Suspense fallback={<ArticleGridSkeleton />}>
              <ArticleGrid searchParams={searchParams} locale={locale} />
            </Suspense>
          </main>

          {/* Sidebar (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Suspense fallback={<SidebarSkeleton />}>
                <Sidebar searchParams={searchParams} locale={locale} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

async function MobileCategoryFilter({ searchParams, locale }) {
  const categories = await getCategoriesWithCount()
  return (
    <CategoryFilter
      categories={categories}
      activeCategory={searchParams?.category}
      locale={locale}
    />
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-4 w-16 bg-muted rounded mb-3" />
        <div className="h-10 bg-muted rounded-lg" />
      </div>
      <div>
        <div className="h-4 w-20 bg-muted rounded mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
      <div>
        <div className="h-4 w-12 bg-muted rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-muted rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
