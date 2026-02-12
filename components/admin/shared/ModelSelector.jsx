'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

/**
 * Model Selector Component
 * Dropdown for selecting AI model preset slug
 * Works with OpenRouter preset slugs (e.g., @preset/translate-fast)
 */
export function ModelSelector({
  currentPreset,
  presetConfig,
  onChange,
  className = '',
}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  // Get current preset name from config
  const getCurrentPresetName = () => {
    if (!currentPreset || !presetConfig) return t('ai.selectModel')

    // Find preset by slug in config
    const presetEntry = Object.entries(presetConfig || {}).find(([key, value]) => value.slug === currentPreset)
    return presetEntry?.[1]?.name || currentPreset
  }

  // Get display name for a preset slug
  const getPresetDisplayName = (slug) => {
    const presetEntry = Object.entries(presetConfig || {}).find(([key, value]) => value.slug === slug)
    return presetEntry?.[1]?.name || slug
  }

  // Get provider for a preset slug
  const getPresetProvider = (slug) => {
    const presetEntry = Object.entries(presetConfig || {}).find(([key, value]) => value.slug === slug)
    return presetEntry?.[1]?.provider || ''
  }

  const currentPresetData = Object.values(presetConfig || {}).find(p => p.slug === currentPreset)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-colors ${
          isOpen
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card border-border hover:border-primary'
        } ${className || ''}`}
      >
        <span className="font-medium">
          {getCurrentPresetName()}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border border rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
          <div className="p-2">
            {Object.values(presetConfig || {}).map(preset => (
              <button
                key={preset.slug}
                onClick={() => {
                  onChange(preset.slug)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  currentPreset === preset.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
              >
                {/* Provider Badge */}
                {preset.provider && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {preset.provider}
                  </span>
                )}

                {/* Preset Name */}
                <div className="flex-1 text-left">
                  <div className="flex-1">
                    <span className="font-medium">{preset.name}</span>
                  </div>

                  {/* Slug for advanced users */}
                  <div className="flex-1 text-xs text-muted-foreground gap-2">
                    <span className="font-mono opacity-70">
                      {preset.slug}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
