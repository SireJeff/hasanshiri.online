'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import { Toaster } from '@/components/ui/toaster'

// Theme colors configuration
const themeColors = [
  { name: 'Emerald', class: 'theme-emerald', hue: 158 },
  { name: 'Purple', class: 'theme-purple', hue: 265 },
  { name: 'Blue', class: 'theme-blue', hue: 220 },
  { name: 'Rose', class: 'theme-rose', hue: 350 },
  { name: 'Amber', class: 'theme-amber', hue: 45 },
  { name: 'Indigo', class: 'theme-indigo', hue: 240 },
]

const getRandomTheme = () => {
  const randomIndex = Math.floor(Math.random() * themeColors.length)
  return themeColors[randomIndex]
}

// Theme Context
const ThemeContext = createContext({
  currentTheme: null,
  setTheme: () => {},
  isDark: false,
  toggleDarkMode: () => {},
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme Provider Component
function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Apply random color theme on mount
  useEffect(() => {
    setMounted(true)
    const theme = getRandomTheme()
    applyTheme(theme)

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('theme') === 'dark'
    setIsDark(savedDarkMode)
    document.documentElement.classList.toggle('dark', savedDarkMode)
  }, [])

  const applyTheme = (theme) => {
    if (!theme) return

    if (currentTheme) {
      document.documentElement.classList.remove(currentTheme.class)
    }
    document.documentElement.classList.add(theme.class)
    document.documentElement.style.setProperty('--primary-hue', theme.hue.toString())
    setCurrentTheme(theme)
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: applyTheme, isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Combined Providers
export function Providers({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </I18nextProvider>
  )
}
