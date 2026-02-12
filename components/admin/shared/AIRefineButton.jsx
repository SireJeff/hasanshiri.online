'use client'

import { RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * AI Refine Button Component
 * Quick action button for refining/improving content with AI
 */
export function AIRefineButton({
  onClick,
  disabled = false,
  className = '',
}) {
  const { t } = useTranslation()
  const locale = t('ai.refine') || 'Refine'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700'
      } ${className}`}
      title={locale}
    >
      <RotateCw className="w-3 h-3" />
      <span className="hidden sm:inline">{locale}</span>
    </button>
  )
}
