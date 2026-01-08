'use client'

import { useEffect, useRef } from 'react'

export function ArticleContent({ content, locale = 'en' }) {
  const contentRef = useRef(null)
  const isRtl = locale === 'fa'

  useEffect(() => {
    if (!contentRef.current) return

    // Add IDs to headings for TOC
    const headings = contentRef.current.querySelectorAll('h2, h3, h4')
    headings.forEach((heading, index) => {
      if (!heading.id) {
        const slug = heading.textContent
          ?.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
        heading.id = slug || `heading-${index}`
      }
    })

    // Make links open in new tab for external links
    const links = contentRef.current.querySelectorAll('a')
    links.forEach((link) => {
      if (link.hostname !== window.location.hostname) {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      }
    })
  }, [content])

  if (!content) {
    return (
      <div className="text-muted-foreground text-center py-12">
        No content available.
      </div>
    )
  }

  return (
    <div
      ref={contentRef}
      className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:scroll-mt-24
        prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
        prose-p:text-foreground/90 prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-border
        prose-blockquote:border-l-primary prose-blockquote:bg-secondary/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
        prose-img:rounded-xl prose-img:shadow-lg
        prose-ul:list-disc prose-ol:list-decimal
        prose-li:text-foreground/90
        prose-table:border-collapse
        prose-th:bg-secondary prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-border
        prose-td:p-3 prose-td:border prose-td:border-border
        prose-hr:border-border"
      dir={isRtl ? 'rtl' : 'ltr'}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

// For rendering embedded videos
export function VideoEmbed({ url, title }) {
  // Extract video ID based on platform
  const getEmbedUrl = (url) => {
    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/
    )
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }

    return url
  }

  const embedUrl = getEmbedUrl(url)

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden my-8">
      <iframe
        src={embedUrl}
        title={title || 'Video'}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
