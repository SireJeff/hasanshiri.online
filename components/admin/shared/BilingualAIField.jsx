'use client'

import { useState } from 'react'
import { Languages, Sparkles, RotateCw, Loader2 } from 'lucide-react'
import { BilingualField } from '@/components/admin/shared/language-tabs'
import { AITranslateButton, AIGenerateButton, AIRefineButton } from '@/components/admin/shared'
import { aiTranslate, aiGenerateContent, aiRefineContent } from '@/lib/actions/ai'
import { useAI } from '@/components/admin/shared/AIContext'
import { cn } from '@/lib/utils'

/**
 * BilingualAIField Component
 * Wraps BilingualField with integrated AI action buttons
 * Provides translate, generate, and refine functionality for bilingual form fields
 *
 * Preset Configuration (from docs/OPENROUTER_PRESET_CONFIG.md):
 * - translateFast: @preset/translate-fast (Quick translations)
 * - translateBalanced: @preset/translate-balanced (Quality translations)
 * - articleGenerator: @preset/article-generator (Content generation)
 * - contentRefiner: @preset/content-refiner (Content refinement)
 * - projectGenerator: @preset/project-generator (Project descriptions)
 */
export function BilingualAIField({
  label,
  activeTab,
  nameEn,
  nameFa,
  valueEn,
  valueFa,
  onChangeEn,
  onChangeFa,
  type = 'text',
  placeholderEn = '',
  placeholderFa = '',
  rows = 3,
  required = false,
  // AI-specific props
  enableTranslate = true,
  enableGenerate = false,
  enableRefine = false,
  className = '',
}) {
  const { t } = useAI()
  const [translateLoading, setTranslateLoading] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [refineLoading, setRefineLoading] = useState(false)

  // Determine which field is currently active
  const activeFieldName = activeTab === 'en' ? nameEn : nameFa
  const activeValue = activeTab === 'en' ? valueEn : valueFa

  // Determine translation direction based on active tab
  const translateDirection = activeTab === 'en' ? 'en2fa' : 'fa2en'
  const targetFieldName = activeTab === 'en' ? nameFa : nameEn

  // Determine preset based on action type
  const getTranslatePreset = () => {
    // For faster translation, use the faster preset
    return '@preset/translate-fast'
  }

  const getGeneratePreset = () => {
    // For article content generation
    if (nameEn.includes('title') || nameEn.includes('excerpt') || nameEn.includes('content')) {
      return '@preset/article-generator'
    }
    // For project descriptions
    if (nameEn.includes('description')) {
      return '@preset/project-generator'
    }
    return '@preset/article-generator'
  }

  const getRefinePreset = () => {
    return '@preset/content-refiner'
  }

  /**
   * Handle AI translation
   * Translates the currently active field to the other language
   */
  const handleTranslate = async () => {
    if (!activeValue || !activeValue.trim()) {
      return
    }

    setTranslateLoading(true)
    try {
      const result = await aiTranslate({
        direction: translateDirection,
        [activeFieldName]: activeValue,
      })

      if (result.error) {
        console.error('Translation failed:', result.error)
      } else if (result.translated && result.translated[targetFieldName]) {
        // Update the target field with translated value
        if (activeTab === 'en') {
          onChangeFa(result.translated[targetFieldName])
        } else {
          onChangeEn(result.translated[targetFieldName])
        }
      }
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setTranslateLoading(false)
    }
  }

  /**
   * Handle AI content generation
   * Generates content for the current field based on the other language's value
   */
  const handleGenerate = async () => {
    const sourceValue = activeTab === 'en' ? valueFa : valueEn
    if (!sourceValue || !sourceValue.trim()) {
      return
    }

    setGenerateLoading(true)
    try {
      const topic = activeTab === 'en'
        ? `Generate ${nameEn.replace('_', ' ')} content (English) based on: ${sourceValue}`
        : `تولید محتوای ${nameFa.replace('_', ' ')} (فارسی) بر اساس: ${sourceValue}`

      const result = await aiGenerateContent({
        topic,
        targetLang: activeTab,
        tone: 'professional',
      })

      if (result.error) {
        console.error('Generation failed:', result.error)
      } else {
        // Update both languages with generated content
        const fieldNameEn = nameEn
        const fieldNameFa = nameFa

        if (result[fieldNameEn]) {
          onChangeEn(result[fieldNameEn])
        }
        if (result[fieldNameFa]) {
          onChangeFa(result[fieldNameFa])
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setGenerateLoading(false)
    }
  }

  /**
   * Handle AI content refinement
   * Improves the currently active field's content
   */
  const handleRefine = async () => {
    if (!activeValue || !activeValue.trim()) {
      return
    }

    setRefineLoading(true)
    try {
      const instructions = activeTab === 'en'
        ? 'Improve clarity, grammar, flow, and engagement.'
        : 'بهبودن وضوح، دستور زبان، جریان و جذابیت محتوا'

      const result = await aiRefineContent({
        content: activeValue,
        instructions,
      })

      if (result.error) {
        console.error('Refinement failed:', result.error)
      } else if (result.refined) {
        // Update the active field with refined content
        if (activeTab === 'en') {
          onChangeEn(result.refined)
        } else {
          onChangeFa(result.refined)
        }
      }
    } catch (error) {
      console.error('Refinement error:', error)
    } finally {
      setRefineLoading(false)
    }
  }

  /**
   * Check if any AI action is in progress
   */
  const isAILoading = translateLoading || generateLoading || refineLoading

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label with AI Actions */}
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>

        {/* AI Action Buttons */}
        <div className="flex items-center gap-1.5">
          {enableTranslate && (
            <AITranslateButton
              sourceText={activeValue}
              onTranslate={handleTranslate}
              disabled={isAILoading || !activeValue?.trim()}
            />
          )}

          {enableGenerate && (
            <AIGenerateButton
              onClick={handleGenerate}
              disabled={isAILoading}
            />
          )}

          {enableRefine && (
            <AIRefineButton
              onClick={handleRefine}
              disabled={isAILoading || !activeValue?.trim()}
            />
          )}
        </div>
      </div>

      {/* Bilingual Field Input */}
      <BilingualField
        label=""
        activeTab={activeTab}
        nameEn={nameEn}
        nameFa={nameFa}
        valueEn={valueEn}
        valueFa={valueFa}
        onChangeEn={onChangeEn}
        onChangeFa={onChangeFa}
        type={type}
        placeholderEn={placeholderEn}
        placeholderFa={placeholderFa}
        rows={rows}
        required={required}
      />

      {/* Loading Indicator */}
      {isAILoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>
            {translateLoading && t('ai.translate')}
            {generateLoading && t('ai.generate')}
            {refineLoading && t('ai.refine')}
          </span>
        </div>
      )}
    </div>
  )
}
