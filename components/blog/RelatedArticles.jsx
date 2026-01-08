import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'

export function RelatedArticles({ articles, locale = 'en' }) {
  const isRtl = locale === 'fa'

  if (!articles?.length) return null

  return (
    <section className="mt-16 pt-8 border-t border-border" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {isRtl ? 'مقالات مرتبط' : 'Related Articles'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map(article => {
          const title = isRtl ? (article.title_fa || article.title_en) : article.title_en
          const excerpt = isRtl ? (article.excerpt_fa || article.excerpt_en) : article.excerpt_en
          const categoryName = article.category
            ? (isRtl ? (article.category.name_fa || article.category.name_en) : article.category.name_en)
            : null

          return (
            <Link
              key={article.id}
              href={`/${locale}/blog/${article.slug}`}
              className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              {/* Image */}
              <div className="relative aspect-video">
                {article.featured_image ? (
                  <Image
                    src={article.featured_image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
                {article.category && (
                  <span
                    className={`absolute top-2 ${isRtl ? 'right-2' : 'left-2'} px-2 py-0.5 text-xs font-medium rounded text-white`}
                    style={{ backgroundColor: article.category.color || '#3b82f6' }}
                  >
                    {categoryName}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {title}
                </h3>
                {excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {excerpt}
                  </p>
                )}
                <div className={`flex items-center gap-1 text-xs text-muted-foreground ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Clock className="w-3 h-3" />
                  {article.reading_time_minutes} {isRtl ? 'دقیقه' : 'min read'}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
