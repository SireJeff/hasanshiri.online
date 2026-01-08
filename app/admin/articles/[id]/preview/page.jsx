import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Eye, Calendar, Clock, Tag } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Preview Article',
}

async function getArticleForPreview(id) {
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      article_tags(
        tag:tags(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching article:', error)
    return null
  }

  // Transform tags
  const tags = article.article_tags?.map(at => at.tag).filter(Boolean) || []

  return { ...article, tags }
}

function estimateReadingTime(content) {
  if (!content) return 1
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

function formatDate(dateString) {
  if (!dateString) return 'Not set'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function PreviewPage({ params, searchParams }) {
  const { id } = await params
  const { lang = 'en' } = await searchParams
  const article = await getArticleForPreview(id)

  if (!article) {
    notFound()
  }

  const title = lang === 'fa' ? article.title_fa : article.title_en
  const content = lang === 'fa' ? article.content_fa : article.content_en
  const excerpt = lang === 'fa' ? article.excerpt_fa : article.excerpt_en
  const readingTime = estimateReadingTime(content)
  const isRtl = lang === 'fa'

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="sticky top-0 z-10 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Preview Mode</h2>
              <p className="text-sm text-muted-foreground">
                {article.status === 'draft' && (
                  <span className="text-yellow-600 dark:text-yellow-400">This is a draft - not published yet</span>
                )}
                {article.status === 'published' && 'Viewing published article'}
                {article.status === 'archived' && (
                  <span className="text-red-500">This article is archived</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Language Switcher */}
            <div className="flex bg-card border border-border rounded-lg overflow-hidden">
              <Link
                href={`/admin/articles/${id}/preview?lang=en`}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                English
              </Link>
              <Link
                href={`/admin/articles/${id}/preview?lang=fa`}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  lang === 'fa' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                فارسی
              </Link>
            </div>
            <Link
              href={`/admin/articles/${id}/edit`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <Link
              href="/admin/articles"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Article Preview */}
      <article className={`max-w-4xl mx-auto ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Featured Image */}
        {article.featured_image && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img
              src={article.featured_image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          {article.category && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
              {lang === 'fa' ? article.category.name_fa : article.category.name_en}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(article.published_at || article.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {readingTime} min read
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            article.status === 'draft' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
            article.status === 'published' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
            'bg-red-500/20 text-red-600 dark:text-red-400'
          }`}>
            {article.status}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-4">{title || 'Untitled'}</h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {article.tags.map(tag => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-secondary text-muted-foreground rounded-full text-sm"
              >
                {lang === 'fa' ? tag.name_fa : tag.name_en}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:text-foreground
            prose-p:text-muted-foreground
            prose-a:text-primary
            prose-strong:text-foreground
            prose-code:text-primary prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-secondary prose-pre:border prose-pre:border-border
            prose-blockquote:border-primary prose-blockquote:text-muted-foreground
            prose-img:rounded-lg
          "
          dangerouslySetInnerHTML={{ __html: content || '<p class="text-muted-foreground italic">No content yet</p>' }}
        />
      </article>

      {/* SEO Preview */}
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-card border border-border rounded-xl">
        <h3 className="font-semibold text-foreground mb-4">SEO Preview</h3>
        <div className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">
              {article.meta_title_en || title || 'Article Title'} | Hasan Shiri
            </p>
            <p className="text-green-700 dark:text-green-500 text-sm">
              hasanshiri.online/blog/{article.slug}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {article.meta_description_en || excerpt || 'Article description will appear here...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
