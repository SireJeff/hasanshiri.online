'use client'

import { useState } from 'react'
import { Languages, Loader2, AlertCircle } from 'lucide-react'
import { translateArticle, translateField } from '@/lib/actions/translation'

/**
 * Translate All Button Component
 * Translates all specified fields at once
 */
export function TranslateButton({
  data,
  direction = 'en2fa',
  fields = ['title', 'excerpt', 'content'],
  onTranslationComplete,
  onError,
  disabled = false,
  className = '',
}) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [existingTranslations, setExistingTranslations] = useState(null)

  const handleTranslate = async () => {
    setLoading(true)
    try {
      const result = await translateArticle({
        data,
        direction,
        fields,
        overwrite: false,
      })

      if (result.requiresConfirmation) {
        setExistingTranslations(result.existingTranslations)
        setShowConfirm(true)
        setLoading(false)
        return
      }

      if (result.error) {
        onError?.(result.error)
      } else if (result.translations) {
        onTranslationComplete?.(result.translations, result.errors)
      }
    } catch (error) {
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOverwrite = async () => {
    setLoading(true)
    setShowConfirm(false)
    try {
      const result = await translateArticle({
        data,
        direction,
        fields,
        overwrite: true,
      })

      if (result.error) {
        onError?.(result.error)
      } else if (result.translations) {
        onTranslationComplete?.(result.translations, result.errors)
      }
    } catch (error) {
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  const isEnglishToPersian = direction === 'en2fa'
  const buttonText = isEnglishToPersian ? 'ترجمه به فارسی' : 'Translate to English'

  return (
    <>
      <button
        type="button"
        onClick={handleTranslate}
        disabled={disabled || loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Languages className="w-4 h-4" />
        )}
        <span>{buttonText}</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && existingTranslations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Existing Translations</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The following fields already have translations and will be overwritten:
                </p>
                <ul className="mt-2 text-sm">
                  {existingTranslations.map(field => (
                    <li key={field} className="capitalize text-muted-foreground">
                      • {field}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverwrite}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Overwrite & Translate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Field Translate Button Component
 * Translates a single field
 */
export function FieldTranslateButton({
  text,
  field,
  direction = 'en2fa',
  isHTML = false,
  onTranslationComplete,
  onError,
  disabled = false,
  className = '',
  size = 'sm',
}) {
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    if (!text || !text.trim()) {
      onError?.('No text to translate')
      return
    }

    setLoading(true)
    try {
      const result = await translateField({
        text,
        field,
        direction,
        isHTML,
      })

      if (result.error) {
        onError?.(result.error)
      } else if (result.translated) {
        onTranslationComplete?.(result.translated)
      }
    } catch (error) {
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  const isEnglishToPersian = direction === 'en2fa'
  const buttonText = isEnglishToPersian ? 'فارسی' : 'EN'
  const titleText = isEnglishToPersian ? 'Translate to Persian' : 'Translate to English'

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-xs'
    : 'px-3 py-1.5 text-sm'

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={disabled || loading}
      title={titleText}
      className={`inline-flex items-center gap-1.5 rounded border border-border bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Languages className="w-3 h-3" />
      )}
      <span>{buttonText}</span>
    </button>
  )
}

/**
 * Translation Result Display
 * Shows translation errors and warnings
 */
export function TranslationResult({ errors, className = '' }) {
  if (!errors || errors.length === 0) return null

  return (
    <div className={`rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-yellow-500">Translation Warnings</p>
          <ul className="mt-1 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-yellow-500/80">
                {error.field && <span className="capitalize">{error.field}: </span>}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
