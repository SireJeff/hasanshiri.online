'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { getUserPresets as fetchUserPresetsServer, updateUserPresets as saveUserPresetsServer } from '@/lib/actions/ai'

/**
 * AI Context for managing floating assistant state
 * Provides: panel open/close, chat history, current mode, and model settings
 */
const AIContext = createContext(null)

export function AIProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [currentMode, setCurrentMode] = useState(null) // 'translate' | 'generate' | 'refine' | 'chat'
  const [isStreaming] = useState(false)
  const [currentModel, setCurrentModel] = useState(null)
  const [userPresets, setUserPresets] = useState({})
  const [isLoadingPresets, setIsLoadingPresets] = useState(false)

  // Fetch user presets on mount
  useEffect(() => {
    const loadPresets = async () => {
      setIsLoadingPresets(true)
      try {
        const result = await fetchUserPresetsServer()
        if (result.success) {
          setUserPresets(result.presets || {})
        } else if (result.error) {
          console.error('Failed to load user presets:', result.error)
        }
      } catch (error) {
        console.error('Failed to load user presets:', error)
      } finally {
        setIsLoadingPresets(false)
      }
    }

    loadPresets()
  }, [])

  const value = {
    isOpen,
    setIsOpen,
    messages,
    setMessages,
    currentMode,
    setCurrentMode,
    isStreaming,
    currentModel,
    setCurrentModel,
    userPresets,
    setUserPresets,
    isLoadingPresets,
    // Helper functions
    openPanel: (mode = null) => {
      setCurrentMode(mode)
      setIsOpen(true)
    },
    closePanel: () => {
      setIsOpen(false)
      setCurrentMode(null)
    },
    addToHistory: (message) => {
      setMessages(prev => [...prev, message])
    },
    clearHistory: () => {
      setMessages([])
    },
    fetchUserPresets: async () => {
      setIsLoadingPresets(true)
      try {
        const result = await fetchUserPresetsServer()
        if (result.success) {
          setUserPresets(result.presets || {})
        }
        return result
      } catch (error) {
        console.error('Failed to fetch user presets:', error)
        return { error: error.message, success: false }
      } finally {
        setIsLoadingPresets(false)
      }
    },
    saveUserPresets: async (presets) => {
      setIsLoadingPresets(true)
      try {
        const result = await saveUserPresetsServer(presets)
        if (result.success) {
          setUserPresets(presets)
        }
        return result
      } catch (error) {
        console.error('Failed to save user presets:', error)
        return { error: error.message, success: false }
      } finally {
        setIsLoadingPresets(false)
      }
    },
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within AIProvider')
  }
  return context
}
