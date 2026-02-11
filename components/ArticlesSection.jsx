'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { ArticleCard, ArticleCardSkeleton } from '@/components/blog/ArticleCard'
import { getHomepageArticles } from '@/lib/actions/articles'

export const ArticlesSection = () => {
  const { t, i18n } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const locale = i18n.language || 'en'
  const isRtl = locale === 'fa'

  // Display counts: 6 on desktop, 3 on mobile
  const articlesToDisplay = isExpanded ? articles : articles.slice(0, 6)

  // Fetch articles
  useEffect(() => {
    async function loadArticles() {
      setLoading(true)
      try {
        const { articles: articlesData } = await getHomepageArticles(12)
        setArticles(articlesData || [])
      } catch (error) {
        console.error('Failed to load articles:', error)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }
    loadArticles()
  }, [])

  if (loading) {
    return (
      <section id="articles" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  // Don't render section if no articles
  if (articles.length === 0) {
    return null
  }

  return (
    <section id="articles" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('articles.title')} <span className="text-primary">{t('articles.articles')}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('articles.description')}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articlesToDisplay.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} />
          ))}
        </div>

        {/* Show More/Less Button */}
        {articles.length > 6 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity ${isRtl ? 'font-persian' : ''}`}
            >
              {isExpanded ? t('common.showLess') : t('common.showMore')}
            </button>
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-6">
          <Link
            href={`/${locale}/blog`}
            className={`inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ${isRtl ? 'flex-row-reverse font-persian' : ''}`}
          >
            {isRtl ? 'مشاهده همه مقالات' : 'View all articles'}
            <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
