'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Sparkles, Languages, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/**
 * AIGenerateModal Component
 * Modal for AI content generation and translation
 * Provides a prompt textarea for content generation and translation options
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Close handler function
 * @param {Function} props.onGenerate - Async generate handler (receives prompt string)
 * @param {Function} props.onTranslateAll - Async translate all handler
 * @param {string} props.title - Modal title (e.g., "Generate Article")
 * @param {string} props.placeholder - Textarea placeholder text
 * @param {string} props.label - Input label (e.g., "Topic")
 * @param {boolean} props.showTranslateAll - Whether to show translate all button
 * @param {Object} props.hasContent - Object with content status { title: boolean, excerpt: boolean, content: boolean }
 */
export function AIGenerateModal({
  isOpen,
  onClose,
  onGenerate,
  onTranslateAll,
  title = 'Generate Content',
  placeholder = 'Enter a topic or description...',
  label = 'Topic',
  showTranslateAll = true,
  hasContent = { title: false, excerpt: false, content: false },
}) {
  const { t } = useTranslation()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState(null)

  // Reset state when modal opens/closes
  const handleClose = () => {
    setPrompt('')
    setError(null)
    onClose()
  }

  // Handle content generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      await onGenerate(prompt)
      setPrompt('')
    } catch (err) {
      setError(err.message || t('ai.generateError') || 'Failed to generate content')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle translate all
  const handleTranslateAll = async () => {
    setIsTranslating(true)
    setError(null)

    try {
      await onTranslateAll()
    } catch (err) {
      setError(err.message || t('ai.translateError') || 'Failed to translate content')
    } finally {
      setIsTranslating(false)
    }
  }

  // Check if there's any content to translate
  const hasAnyContent = hasContent.title || hasContent.excerpt || hasContent.content

  // Check if any operation is in progress
  const isLoading = isGenerating || isTranslating

  // Modal content
  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-200',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-card border border-border rounded-lg shadow-xl w-full max-w-lg',
          'transform transition-all duration-200',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
            title={t('ai.close') || 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {label}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                setError(null)
              }}
              placeholder={placeholder}
              rows={4}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg
                text-foreground placeholder-muted-foreground
                focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none
                resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                'font-medium text-white transition-colors',
                'bg-purple-600 hover:bg-purple-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('ai.generating') || 'Generating...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('ai.generateContent') || 'Generate Content'}</span>
                </>
              )}
            </button>

            {/* Translate All Button */}
            {showTranslateAll && (
              <button
                type="button"
                onClick={handleTranslateAll}
                disabled={isLoading || !hasAnyContent}
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                  'font-medium transition-colors',
                  'bg-secondary text-secondary-foreground border border-border',
                  'hover:bg-secondary/80 hover:border-primary',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('ai.translating') || 'Translating...'}</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t('ai.translateAll') || 'Translate All to Persian'}
                    </span>
                    <span className="sm:hidden">
                      {t('ai.translate') || 'Translate'}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground text-center">
            {t('ai.modalHelper') || 'Press Ctrl/Cmd + Enter to generate'}
          </p>
        </div>
      </div>
    </div>
  )

  // Use portal to render modal outside of parent component hierarchy
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return null
}
