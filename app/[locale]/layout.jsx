import { notFound } from 'next/navigation'
import { i18nConfig, getLocaleDirection, generateAlternateUrls } from '@/lib/i18n-config'
import { DirAttribute } from '@/components/DirAttribute'

// Generate static params for all locales
export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }))
}

// Generate metadata based on locale
export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!i18nConfig.locales.includes(locale)) {
    return {}
  }

  const isRtl = locale === 'fa'
  const baseUrl = 'https://hasanshiri.online'

  const titles = {
    en: 'Mohammad Hassan Shiri | Portfolio & Blog',
    fa: 'محمد حسن شیری | نمونه کارها و بلاگ',
  }

  const descriptions = {
    en: 'Mohammad Hassan Shiri (MHS) - Physics Student at Sharif University, Data Scientist & Complex Systems Researcher. Expertise in Data Analysis and Machine Learning.',
    fa: 'محمد حسن شیری - دانشجوی فیزیک دانشگاه صنعتی شریف، دانشمند داده و پژوهشگر سیستم‌های پیچیده. تخصص در تحلیل داده و یادگیری ماشین.',
  }

  const alternates = generateAlternateUrls('/', baseUrl)

  return {
    title: {
      default: titles[locale],
      template: `%s | ${isRtl ? 'محمد حسن شیری' : 'Mohammad Hassan Shiri'}`,
    },
    description: descriptions[locale],
    keywords: [
      'Mohammad Hassan Shiri',
      'Hasan Shiri',
      'محمد حسن شیری',
      'حسن شیری',
      'MHS',
      'Physics Student',
      'Data Scientist',
      'Sharif University',
      'Complex Systems',
      'Python',
      'Data Analysis',
      'Machine Learning',
      'Blog',
    ],
    authors: [{ name: isRtl ? 'محمد حسن شیری' : 'Mohammad Hassan Shiri' }],
    creator: 'Mohammad Hassan Shiri',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: alternates.languages,
    },
    openGraph: {
      type: 'website',
      locale: isRtl ? 'fa_IR' : 'en_US',
      alternateLocale: isRtl ? 'en_US' : 'fa_IR',
      url: `${baseUrl}/${locale}`,
      siteName: isRtl ? 'محمد حسن شیری' : 'Mohammad Hassan Shiri',
      title: titles[locale],
      description: descriptions[locale],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale],
      description: descriptions[locale],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params

  // Validate locale
  if (!i18nConfig.locales.includes(locale)) {
    notFound()
  }

  const direction = getLocaleDirection(locale)

  return (
    <>
      {/* Set dir attribute on html element for E2E tests and proper RTL support */}
      <DirAttribute locale={locale} direction={direction} />
      <div lang={locale} dir={direction}>
        {children}
      </div>
    </>
  )
}
