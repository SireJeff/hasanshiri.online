'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

// Breadcrumbs component with JSON-LD schema markup
export function Breadcrumbs({ items, locale = 'en' }) {
  const isRtl = locale === 'fa'

  if (!items?.length) return null

  // Generate JSON-LD for breadcrumbs
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && {
        item: `https://hasanshiri.online${item.href}`,
      }),
    })),
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Visual Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`mb-4 ${isRtl ? 'text-right' : 'text-left'}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <ol
          className={`flex flex-wrap items-center gap-1 text-sm text-muted-foreground ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <li
                key={index}
                className={`flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                {index > 0 && (
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground/50 ${isRtl ? 'rotate-180' : ''}`}
                  />
                )}
                {isLast || !item.href ? (
                  <span
                    className={`${isLast ? 'text-foreground font-medium' : ''} truncate max-w-[200px]`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors truncate max-w-[200px]"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

export default Breadcrumbs
