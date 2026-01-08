import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getArticleBySlug, getRelatedArticles, recordArticleView } from '@/lib/actions/articles'
import { ArticleContent } from '@/components/blog/ArticleContent'
import { TableOfContentsCompact } from '@/components/blog/TableOfContents'
import { ShareButtons, ShareButtonsVertical } from '@/components/blog/ShareButtons'
import { RelatedArticles } from '@/components/blog/RelatedArticles'
import { ArrowLeft, Calendar, Clock, Eye, User } from 'lucide-react'
import { headers } from 'next/headers'

// Generate metadata
export async function generateMetadata({ params }) {
  const { article } = await getArticleBySlug(params.slug)

  if (!article) {
    return { title: 'Article Not Found' }
  }

  const title = article.meta_title_en || article.title_en
  const description = article.meta_description_en || article.excerpt_en || ''

  return {
    title: `${title} | Hasan Shiri`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author?.full_name || 'Hasan Shiri'],
      images: article.og_image || article.featured_image ? [
        {
          url: article.og_image || article.featured_image,
          width: 1200,
          height: 630,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.og_image || article.featured_image ? [article.og_image || article.featured_image] : [],
    },
  }
}

export default async function ArticlePage({ params }) {
  const { article, error } = await getArticleBySlug(params.slug)

  if (error || !article) {
    notFound()
  }

  // Check if article is published (for non-admin users)
  if (article.status !== 'published') {
    notFound()
  }

  // Record view
  const headersList = await headers()
  await recordArticleView(article.id, {
    userAgent: headersList.get('user-agent'),
    referrer: headersList.get('referer'),
  })

  // Get related articles
  const relatedArticles = await getRelatedArticles(
    article.id,
    article.category_id,
    article.tags?.map(t => t.id) || [],
    3
  )

  const locale = 'en' // TODO: Get from i18n
  const isRtl = locale === 'fa'
  const title = isRtl ? article.title_fa : article.title_en
  const content = isRtl ? article.content_fa : article.content_en
  const excerpt = isRtl ? article.excerpt_fa : article.excerpt_en
  const categoryName = article.category
    ? (isRtl ? article.category.name_fa : article.category.name_en)
    : null

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString(
        isRtl ? 'fa-IR' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : null

  const articleUrl = `https://hasanshiri.online/blog/${article.slug}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Hero */}
      <header className="relative">
        {/* Featured Image */}
        {article.featured_image && (
          <div className="relative h-[40vh] md:h-[50vh] w-full">
            <Image
              src={article.featured_image}
              alt={title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}

        {/* Title area */}
        <div className="container relative">
          <div className={`max-w-3xl mx-auto ${article.featured_image ? '-mt-32 relative z-10' : 'pt-12'}`}>
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to blog
            </Link>

            {/* Category */}
            {article.category && (
              <Link
                href={`/blog?category=${article.category.slug}`}
                className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white mb-4"
                style={{ backgroundColor: article.category.color || '#3b82f6' }}
              >
                {categoryName}
              </Link>
            )}

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {title}
            </h1>

            {/* Excerpt */}
            {excerpt && (
              <p
                className="text-xl text-muted-foreground mb-6"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              {/* Author */}
              {article.author && (
                <div className="flex items-center gap-2">
                  {article.author.avatar_url ? (
                    <Image
                      src={article.author.avatar_url}
                      alt={article.author.full_name || 'Author'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="font-medium text-foreground">
                    {article.author.full_name || 'Anonymous'}
                  </span>
                </div>
              )}

              <span className="text-border">•</span>

              {/* Date */}
              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
              )}

              <span className="text-border">•</span>

              {/* Reading time */}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.reading_time_minutes} min read
              </span>

              {/* Views */}
              {article.view_count > 0 && (
                <>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {article.view_count.toLocaleString()} views
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    #{isRtl ? tag.name_fa : tag.name_en}
                  </Link>
                ))}
              </div>
            )}

            {/* Share */}
            <ShareButtons title={title} url={articleUrl} locale={locale} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,200px] gap-12 max-w-5xl mx-auto">
          {/* Article Content */}
          <article className="min-w-0">
            <ArticleContent content={content} locale={locale} />

            {/* Bottom Share */}
            <div className="mt-12 pt-6 border-t border-border">
              <ShareButtons title={title} url={articleUrl} locale={locale} />
            </div>

            {/* Author Bio */}
            {article.author?.bio && (
              <div className="mt-8 p-6 bg-card border border-border rounded-xl">
                <div className="flex items-start gap-4">
                  {article.author.avatar_url ? (
                    <Image
                      src={article.author.avatar_url}
                      alt={article.author.full_name || 'Author'}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {article.author.full_name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {article.author.bio}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Related Articles */}
            <RelatedArticles articles={relatedArticles} locale={locale} />
          </article>

          {/* Sidebar - TOC & Share */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              {/* Table of Contents */}
              <TableOfContentsCompact content={content} locale={locale} />

              {/* Share Buttons Vertical */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Share
                </h4>
                <ShareButtonsVertical title={title} url={articleUrl} locale={locale} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
