'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ currentPage, totalPages, locale = 'en' }) {
  const searchParams = useSearchParams()
  const isRtl = locale === 'fa'
  const basePath = `/${locale}/blog`

  if (totalPages <= 1) return null

  // Build URL with preserved search params
  const buildUrl = (page) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    const queryString = params.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const showPages = 5 // Number of pages to show
    const halfShow = Math.floor(showPages / 2)

    let start = Math.max(1, currentPage - halfShow)
    let end = Math.min(totalPages, start + showPages - 1)

    // Adjust start if end is at max
    if (end === totalPages) {
      start = Math.max(1, end - showPages + 1)
    }

    // Add first page and ellipsis
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add last page and ellipsis
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      className={`flex items-center justify-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}
      aria-label="Pagination"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className={`flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span className="hidden sm:inline">{isRtl ? 'قبلی' : 'Previous'}</span>
        </Link>
      ) : (
        <span className={`flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed ${isRtl ? 'flex-row-reverse' : ''}`}>
          <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span className="hidden sm:inline">{isRtl ? 'قبلی' : 'Previous'}</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className={`flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            )
          }

          const isActive = page === currentPage
          const displayPage = isRtl ? page.toLocaleString('fa-IR') : page

          return isActive ? (
            <span
              key={page}
              className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg"
            >
              {displayPage}
            </span>
          ) : (
            <Link
              key={page}
              href={buildUrl(page)}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {displayPage}
            </Link>
          )
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className={`flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          <span className="hidden sm:inline">{isRtl ? 'بعدی' : 'Next'}</span>
          <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </Link>
      ) : (
        <span className={`flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed ${isRtl ? 'flex-row-reverse' : ''}`}>
          <span className="hidden sm:inline">{isRtl ? 'بعدی' : 'Next'}</span>
          <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </span>
      )}
    </nav>
  )
}
