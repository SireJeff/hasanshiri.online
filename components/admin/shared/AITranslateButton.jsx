'use client'

import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * AI Translate Button Component
 * Quick action button for translating form fields
 */
export function AITranslateButton({
  sourceText,
  onTranslate,
  disabled = false,
  className = '',
}) {
  const { t } = useTranslation()
  const locale = t('ai.translate') || 'Translate'

  return (
    <button
      type="button"
      onClick={onTranslate}
      disabled={disabled || !sourceText?.trim()}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'bg-secondary text-secondary-foreground border-border hover:border-primary hover:bg-primary/50'
      } ${className}`}
      title={locale}
    >
      <Languages className="w-3 h-3" />
      <span className="hidden sm:inline">{locale}</span>
    </button>
  )
}
