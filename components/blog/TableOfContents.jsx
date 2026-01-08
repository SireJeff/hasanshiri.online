'use client'

import { useState, useEffect } from 'react'
import { List } from 'lucide-react'

export function TableOfContents({ content, locale = 'en' }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState('')
  const isRtl = locale === 'fa'

  // Extract headings from HTML content
  useEffect(() => {
    if (!content) return

    // Parse HTML content to find headings
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headingElements = doc.querySelectorAll('h2, h3')

    const items = Array.from(headingElements).map((heading, index) => {
      const id = heading.id || `heading-${index}`
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1]),
      }
    })

    setHeadings(items)
  }, [content])

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0px -66%',
        threshold: 0,
      }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  const scrollToHeading = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      })
    }
  }

  return (
    <nav
      className="p-4 bg-card border border-border rounded-xl"
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-label="Table of contents"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
        <List className="w-4 h-4" />
        {isRtl ? 'فهرست مطالب' : 'Table of Contents'}
      </h3>

      <ul className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <button
              onClick={() => scrollToHeading(id)}
              className={`block w-full text-left text-sm py-1 transition-colors hover:text-primary ${
                level === 3 ? 'pl-4' : ''
              } ${
                activeId === id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Compact version for sidebar
export function TableOfContentsCompact({ content, locale = 'en' }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)
  const isRtl = locale === 'fa'

  useEffect(() => {
    if (!content) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headingElements = doc.querySelectorAll('h2, h3')

    const items = Array.from(headingElements).map((heading, index) => {
      const id = heading.id || `heading-${index}`
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1]),
      }
    })

    setHeadings(items)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -66%' }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  const scrollToHeading = (id) => {
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 100,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="sticky top-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3"
      >
        <List className="w-3.5 h-3.5" />
        {isRtl ? 'فهرست' : 'Contents'}
      </button>

      {isExpanded && (
        <ul className="space-y-1 border-l border-border pl-3">
          {headings.map(({ id, text, level }) => (
            <li key={id}>
              <button
                onClick={() => scrollToHeading(id)}
                className={`block text-left text-sm py-0.5 transition-colors hover:text-primary ${
                  level === 3 ? 'text-xs pl-2' : ''
                } ${
                  activeId === id
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
