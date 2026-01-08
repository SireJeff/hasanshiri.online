'use client'

import { useState } from 'react'
import { Share2, Twitter, Linkedin, Link2, Check, Facebook } from 'lucide-react'

export function ShareButtons({ title, url, locale = 'en' }) {
  const [copied, setCopied] = useState(false)
  const isRtl = locale === 'fa'

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2]/10 hover:text-[#1877F2]',
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex items-center gap-1" dir={isRtl ? 'rtl' : 'ltr'}>
      <span className="text-sm text-muted-foreground mr-2">
        <Share2 className="w-4 h-4 inline mr-1" />
        {isRtl ? 'اشتراک:' : 'Share:'}
      </span>

      {shareLinks.map(({ name, icon: Icon, url, color }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-lg text-muted-foreground transition-colors ${color}`}
          title={`Share on ${name}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}

      <button
        onClick={copyToClipboard}
        className={`p-2 rounded-lg transition-colors ${
          copied
            ? 'bg-green-500/10 text-green-500'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  )
}

// Vertical share buttons for sidebar
export function ShareButtonsVertical({ title, url, locale = 'en' }) {
  const [copied, setCopied] = useState(false)

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      bg: 'bg-[#1DA1F2]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'bg-[#0A66C2]',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[#1877F2]',
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {shareLinks.map(({ name, icon: Icon, url, bg }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-lg text-white transition-opacity hover:opacity-80 ${bg}`}
          title={`Share on ${name}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}

      <button
        onClick={copyToClipboard}
        className={`p-2.5 rounded-lg transition-colors ${
          copied
            ? 'bg-green-500 text-white'
            : 'bg-secondary text-foreground hover:bg-secondary/80'
        }`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  )
}
