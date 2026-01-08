'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'

export function SearchBar({ locale = 'en' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(searchParams.get('search') || '')
  const isRtl = locale === 'fa'

  // Update query when URL changes
  useEffect(() => {
    setQuery(searchParams.get('search') || '')
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())
    params.delete('page') // Reset to page 1

    if (query.trim()) {
      params.set('search', query.trim())
    } else {
      params.delete('search')
    }

    const queryString = params.toString()
    const url = queryString ? `/blog?${queryString}` : '/blog'

    startTransition(() => {
      router.push(url)
    })
  }

  const clearSearch = () => {
    setQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('page')

    const queryString = params.toString()
    const url = queryString ? `/blog?${queryString}` : '/blog'

    startTransition(() => {
      router.push(url)
    })
  }

  return (
    <form onSubmit={handleSearch} className="relative" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isRtl ? 'جستجو در مقالات...' : 'Search articles...'}
          className="w-full pl-10 pr-10 py-2.5 bg-secondary text-foreground placeholder-muted-foreground rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        {/* Clear / Loading */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isPending ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={clearSearch}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </form>
  )
}

// Compact search for mobile/sidebar
export function SearchInput({ value, onChange, onSubmit, placeholder, locale = 'en' }) {
  const isRtl = locale === 'fa'

  return (
    <div className="relative" dir={isRtl ? 'rtl' : 'ltr'}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder || (isRtl ? 'جستجو...' : 'Search...')}
        className="w-full pl-9 pr-3 py-2 text-sm bg-secondary text-foreground placeholder-muted-foreground rounded-lg border border-border focus:border-primary outline-none transition-colors"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    </div>
  )
}
