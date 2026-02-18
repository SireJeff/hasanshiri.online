'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BilingualField } from '@/components/admin/shared/language-tabs'
import { AITranslateButton } from '@/components/admin/shared/AITranslateButton'
import { AIGenerateButton } from '@/components/admin/shared/AIGenerateButton'
import { AIRefineButton } from '@/components/admin/shared/AIRefineButton'
import { aiTranslate, aiGenerateContent, aiRefineContent } from '@/lib/actions/ai'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

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
  const { t } = useTranslation()
  const { toast } = useToast()
  const [translateLoading, setTranslateLoading] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [refineLoading, setRefineLoading] = useState(false)

  // Determine which field is currently active
  const activeFieldName = activeTab === 'en' ? nameEn : nameFa
  const activeValue = activeTab === 'en' ? valueEn : valueFa

  // Determine translation direction based on active tab
  const translateDirection = activeTab === 'en' ? 'en2fa' : 'fa2en'
  const targetFieldName = activeTab === 'en' ? nameFa : nameEn

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
        toast({
          title: t('ai.translation_failed') || 'Translation Failed',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result.translated && result.translated[targetFieldName]) {
        // Update the target field with translated value
        if (activeTab === 'en') {
          onChangeFa(result.translated[targetFieldName])
        } else {
          onChangeEn(result.translated[targetFieldName])
        }
        toast({
          title: t('ai.translation_complete') || 'Translation Complete',
          description: t('ai.field_translated') || 'Field translated successfully',
        })
      }
    } catch (error) {
      toast({
        title: t('ai.translation_failed') || 'Translation Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
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
        toast({
          title: t('ai.generation_failed') || 'Generation Failed',
          description: result.error,
          variant: 'destructive',
        })
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
        toast({
          title: t('ai.generation_complete') || 'Generation Complete',
          description: t('ai.content_generated') || 'Content generated successfully',
        })
      }
    } catch (error) {
      toast({
        title: t('ai.generation_failed') || 'Generation Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
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
        toast({
          title: t('ai.refinement_failed') || 'Refinement Failed',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result.refined) {
        // Update the active field with refined content
        if (activeTab === 'en') {
          onChangeEn(result.refined)
        } else {
          onChangeFa(result.refined)
        }
        toast({
          title: t('ai.refinement_complete') || 'Refinement Complete',
          description: t('ai.content_refined') || 'Content refined successfully',
        })
      }
    } catch (error) {
      toast({
        title: t('ai.refinement_failed') || 'Refinement Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
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
