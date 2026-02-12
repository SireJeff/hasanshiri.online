'use client'

import { useState, useEffect, useRef } from 'react'
import { Minimize2, Maximize2, X, Send, Sparkles, Languages, RotateCw, Trash2, Settings } from 'lucide-react'
import { useAI } from '@/components/admin/shared/AIContext'
import { useTranslation } from 'react-i18next'
import { aiTranslate, aiGenerateContent, aiRefineContent } from '@/lib/actions/ai'

/**
 * Floating AI Assistant Panel
 * Provides quick access to AI translation, generation, and refinement
 * Positioned: Bottom-right corner, expandable/collapsible
 */
export function FloatingAIAssistant() {
  const { t } = useTranslation()
  const {
    isOpen,
    messages,
    currentMode,
    isStreaming,
    openPanel,
    closePanel,
    addToHistory,
    clearHistory,
    userPresets,
    saveUserPresets,
  } = useAI()

  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsPresets, setSettingsPresets] = useState({
    translateFast: '',
    translateBalanced: '',
    generate: '',
    refine: '',
  })
  const messagesEndRef = useRef(null)

  const locale = t('ai.assistant') || 'AI Assistant'

  // Load settings from user presets on mount
  useEffect(() => {
    setSettingsPresets({
      translateFast: userPresets.translateFast || '',
      translateBalanced: userPresets.translateBalanced || '',
      generate: userPresets.generate || '',
      refine: userPresets.refine || '',
    })
  }, [userPresets])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return

    addToHistory({ role: 'user', content: inputValue })
    setInputValue('')

    // Call appropriate server action based on current mode
    let result
    try {
      switch (currentMode) {
        case 'translate':
          result = await aiTranslate({
            direction: 'en2fa',
            title: inputValue,
            excerpt: inputValue,
            content: inputValue,
            model: userPresets.translateFast,
          })
          break
        case 'generate':
          result = await aiGenerateContent({
            topic: inputValue,
            targetLang: 'en',
            tone: 'professional',
            model: userPresets.generate,
          })
          break
        case 'refine':
          result = await aiRefineContent({
            content: inputValue,
            instructions: 'Improve clarity, grammar, and readability.',
            model: userPresets.refine,
          })
          break
        default:
          // Chat mode - simulate for now
          result = { success: true }
          setTimeout(() => {
            addToHistory({ role: 'assistant', content: `Chat mode: ${inputValue}` })
          }, 1000)
          return
      }

      if (result.error) {
        addToHistory({ role: 'assistant', content: `Error: ${result.error}` })
      } else if (currentMode !== 'chat') {
        // Format success response based on mode
        if (currentMode === 'translate') {
          addToHistory({ role: 'assistant', content: `Translation:\n${JSON.stringify(result.translated || {}, null, 2)}` })
        } else if (currentMode === 'generate') {
          addToHistory({ role: 'assistant', content: `Generated:\n${JSON.stringify(result, null, 2)}` })
        } else if (currentMode === 'refine') {
          addToHistory({ role: 'assistant', content: `Refined:\n${result.refined || ''}` })
        }
      }
    }
  } catch (error) {
    addToHistory({ role: 'assistant', content: `Error: ${error.message}` })
  }
  }

  const handleQuickAction = (mode) => {
    openPanel(mode)
    if (mode === 'translate') {
      setInputValue(t('ai.translatePlaceholder'))
    } else if (mode === 'generate') {
      setInputValue(t('ai.generatePlaceholder'))
    } else if (mode === 'refine') {
      setInputValue(t('ai.refinePlaceholder'))
    }
  }

  const handleSaveSettings = async () => {
    const result = await saveUserPresets(settingsPresets)
    if (result.success) {
      addToHistory({ role: 'assistant', content: t('ai.presetSaved') })
      setTimeout(() => setShowSettings(false), 500)
    } else {
      addToHistory({ role: 'assistant', content: `${t('ai.presetError')}: ${result.error}` })
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  return (
    <>
      {/* Floating Button (when minimized) */}
      {isMinimized ? (
        <button
          onClick={toggleMinimize}
          className="fixed bottom-6 right-6 z-50 w-14 h-14
            bg-primary text-primary-foreground rounded-full
            shadow-lg hover:scale-105 animate-bounce
            transition-all duration-300"
          title={locale}
        >
          <Sparkles className="w-5 h-5" />
        </button>
      ) : (
        <>
          {/* Panel */}
          <div
            className={`fixed bottom-6 right-6 z-50 w-[400px]
              max-h-[calc(100vh-8rem)] bg-card border border-border
              rounded-lg shadow-xl flex flex-col transition-all duration-300
              ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">{locale}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleSettings}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                  title={t('ai.presetSettings')}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleMinimize}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                  title={t('ai.minimize')}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={closePanel}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                  title={t('ai.close')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 border-b border-border bg-secondary/50">
                <h4 className="text-sm font-semibold mb-3">{t('ai.presetSettings')}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('ai.translate')} (Fast)
                    </label>
                    <input
                      type="text"
                      value={settingsPresets.translateFast || ''}
                      onChange={(e) => setSettingsPresets({...settingsPresets, translateFast: e.target.value})}
                      placeholder="@preset/translate-fast"
                      className="w-full px-2 py-1 text-xs bg-card border border-border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('ai.translate')} (Balanced)
                    </label>
                    <input
                      type="text"
                      value={settingsPresets.translateBalanced || ''}
                      onChange={(e) => setSettingsPresets({...settingsPresets, translateBalanced: e.target.value})}
                      placeholder="@preset/translate-balanced"
                      className="w-full px-2 py-1 text-xs bg-card border border-border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('ai.generate')}
                    </label>
                    <input
                      type="text"
                      value={settingsPresets.generate || ''}
                      onChange={(e) => setSettingsPresets({...settingsPresets, generate: e.target.value})}
                      placeholder="@preset/article-generator"
                      className="w-full px-2 py-1 text-xs bg-card border border-border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('ai.refine')}
                    </label>
                    <input
                      type="text"
                      value={settingsPresets.refine || ''}
                      onChange={(e) => setSettingsPresets({...settingsPresets, refine: e.target.value})}
                      placeholder="@preset/content-refiner"
                      className="w-full px-2 py-1 text-xs bg-card border border-border rounded"
                    />
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="w-full px-3 py-2 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
                  >
                    {t('ai.save')}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-3 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2">{t('ai.quickActions')}</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickAction('translate')}
                  className={`p-2 text-xs rounded border transition-colors ${
                    currentMode === 'translate'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-secondary-foreground border-border hover:border-primary'
                  }`}
                >
                  {t('ai.translate')}
                </button>
                <button
                  onClick={() => handleQuickAction('generate')}
                  className={`p-2 text-xs rounded border transition-colors ${
                    currentMode === 'generate'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-secondary-foreground border-border hover:border-primary'
                  }`}
                >
                  {t('ai.generate')}
                </button>
                <button
                  onClick={() => handleQuickAction('refine')}
                  className={`p-2 text-xs rounded border transition-colors ${
                    currentMode === 'refine'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-secondary-foreground border-border hover:border-primary'
                  }`}
                >
                  {t('ai.refine')}
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex gap-2">
                  <div className="bg-secondary text-secondary-foreground rounded-lg p-2">
                    <div className="flex space-x-1">
                      <span className="animate-pulse">Thinking</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder={t('ai.inputPlaceholder')}
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg
                    text-foreground placeholder-muted-foreground
                    focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  disabled={isStreaming}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isStreaming}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90
                    transition-opacity disabled:opacity-50"
                  title={t('ai.send')}
                >
                  {isStreaming ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-3 pb-3">
                <button
                  onClick={clearHistory}
                  className="p-2 hover:bg-secondary rounded transition-colors text-xs"
                  title={t('ai.clearHistory')}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
