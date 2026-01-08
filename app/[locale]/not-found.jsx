'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function NotFound() {
  const params = useParams()
  const locale = params?.locale || 'en'
  const isRtl = locale === 'fa'

  const content = {
    en: {
      title: '404',
      heading: 'Page Not Found',
      description: 'The page you are looking for does not exist or has been moved.',
      button: 'Go Home',
    },
    fa: {
      title: '۴۰۴',
      heading: 'صفحه یافت نشد',
      description: 'صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.',
      button: 'بازگشت به خانه',
    },
  }

  const t = content[locale] || content.en

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">{t.title}</h1>
        <h2 className="text-2xl font-semibold text-foreground">{t.heading}</h2>
        <p className="text-muted-foreground max-w-md">
          {t.description}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          {t.button}
        </Link>
      </div>
    </div>
  )
}
