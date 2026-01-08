'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function CategoryFilter({ categories, activeCategory = null, locale = 'en' }) {
  const searchParams = useSearchParams()
  const isRtl = locale === 'fa'

  // Build URL preserving other params but updating category
  const buildUrl = (categorySlug) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page') // Reset to page 1 when changing category

    if (categorySlug) {
      params.set('category', categorySlug)
    } else {
      params.delete('category')
    }

    const queryString = params.toString()
    return queryString ? `/blog?${queryString}` : '/blog'
  }

  return (
    <div className="flex flex-wrap gap-2" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* All Categories */}
      <Link
        href={buildUrl(null)}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          !activeCategory
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        {isRtl ? 'همه' : 'All'}
      </Link>

      {/* Category Buttons */}
      {categories.map(category => {
        const isActive = activeCategory === category.slug
        const name = isRtl ? category.name_fa : category.name_en

        return (
          <Link
            key={category.id}
            href={buildUrl(category.slug)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              isActive
                ? 'text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            style={isActive ? { backgroundColor: category.color } : undefined}
          >
            {name}
            {category.article_count !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">
                ({category.article_count})
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function TagCloud({ tags, activeTag = null, locale = 'en' }) {
  const searchParams = useSearchParams()
  const isRtl = locale === 'fa'

  const buildUrl = (tagSlug) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')

    if (tagSlug && tagSlug !== activeTag) {
      params.set('tag', tagSlug)
    } else {
      params.delete('tag')
    }

    const queryString = params.toString()
    return queryString ? `/blog?${queryString}` : '/blog'
  }

  if (!tags?.length) return null

  return (
    <div className="space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
      <h3 className="text-sm font-semibold text-foreground">
        {isRtl ? 'برچسب‌ها' : 'Tags'}
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => {
          const isActive = activeTag === tag.slug
          const name = isRtl ? tag.name_fa : tag.name_en

          return (
            <Link
              key={tag.id}
              href={buildUrl(tag.slug)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              #{name}
              {tag.article_count !== undefined && tag.article_count > 0 && (
                <span className="ml-1 opacity-70">({tag.article_count})</span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
