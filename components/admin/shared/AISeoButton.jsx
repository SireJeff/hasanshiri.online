'use client'

import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * AI SEO Button Component
 * Button for generating SEO meta tags with AI
 */
export function AISeoButton({
  onClick,
  disabled = false,
  loading = false,
  className = '',
}) {
  const { t } = useTranslation()
  const label = t('ai.generate_seo') || 'SEO'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors ${
        disabled || loading
          ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-muted'
          : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
      } ${className}`}
      title="Generate SEO meta tags with AI"
    >
      {loading ? (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <Search className="w-3 h-3" />
      )}
      <span className="hidden sm:inline">{loading ? 'Generating...' : label}</span>
    </button>
  )
}
