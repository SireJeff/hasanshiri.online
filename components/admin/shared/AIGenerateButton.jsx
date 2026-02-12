'use client'

import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * AI Generate Button Component
 * Quick action button for generating content with AI
 */
export function AIGenerateButton({
  onClick,
  disabled = false,
  className = '',
}) {
  const { t } = useTranslation()
  const locale = t('ai.generate') || 'Generate'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
      } ${className}`}
      title={locale}
    >
      <Sparkles className="w-3 h-3" />
      <span className="hidden sm:inline">{locale}</span>
    </button>
  )
}
