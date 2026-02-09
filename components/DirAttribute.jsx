'use client'

import { useEffect } from 'react'

export function DirAttribute({ locale, direction }) {
  useEffect(() => {
    // Set dir and lang attributes on the html element immediately on mount
    const html = document.documentElement
    html.setAttribute('dir', direction)
    html.setAttribute('lang', locale)

    // Cleanup function to reset to default
    return () => {
      html.setAttribute('dir', 'ltr')
      html.setAttribute('lang', 'en')
    }
  }, [locale, direction])

  return null
}
