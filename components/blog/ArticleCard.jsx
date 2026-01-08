'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Eye, ArrowRight } from 'lucide-react'

export function ArticleCard({ article, locale = 'en' }) {
  const isRtl = locale === 'fa'
  const title = isRtl ? article.title_fa : article.title_en
  const excerpt = isRtl ? article.excerpt_fa : article.excerpt_en
  const categoryName = article.category
    ? (isRtl ? article.category.name_fa : article.category.name_en)
    : null

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString(
        isRtl ? 'fa-IR' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      )
    : null

  return (
    <article
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Featured Image */}
      <Link href={`/blog/${article.slug}`} className="block relative aspect-video overflow-hidden">
        {article.featured_image ? (
          <Image
            src={article.featured_image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl text-primary/30">📝</span>
          </div>
        )}
        {/* Category Badge */}
        {article.category && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full text-white"
            style={{ backgroundColor: article.category.color || '#3b82f6' }}
          >
            {categoryName}
          </span>
        )}
        {/* Featured Badge */}
        {article.is_featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500 text-white">
            ⭐ Featured
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.reading_time_minutes} {isRtl ? 'دقیقه' : 'min read'}
          </span>
          {article.view_count > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.view_count.toLocaleString()}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/blog/${article.slug}`}>{title}</Link>
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 3).map(tag => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                #{isRtl ? tag.name_fa : tag.name_en}
              </Link>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 text-muted-foreground">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Read More */}
        <Link
          href={`/blog/${article.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {isRtl ? 'ادامه مطلب' : 'Read more'}
          <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </Link>
      </div>
    </article>
  )
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-5 space-y-3">
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="h-6 w-3/4 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-14 bg-muted rounded" />
          <div className="h-5 w-14 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}
