import { notFound } from 'next/navigation'
import { i18nConfig, getLocaleDirection, generateAlternateUrls } from '@/lib/i18n-config'
import { DirAttribute } from '@/components/DirAttribute'
import {
  NAME_VARIANTS,
  TWITTER_HANDLE,
  getCreatorName,
  getAllNameVariants,
} from '@/lib/config/seo-config'

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

  // Get all name variants from centralized config
  const allNameVariants = getAllNameVariants(locale)

  return {
    title: {
      default: titles[locale],
      template: `%s | ${NAME_VARIANTS.primary[locale]}`,
    },
    description: descriptions[locale],
    keywords: isRtl ? [
      // نام و تغییرات آن (Name Variations)
      ...allNameVariants,
      // تخصصی اصلی (Core Technical)
      'دیتاساینتیست', 'علم داده', 'دانشمند داده', 'تحلیلگر داده', 'محقق فیزیک', 'تحلیلگر سیستم‌های پیچیده',
      // ابزارها و فناوری‌ها (Tools & Technologies)
      'پایتون', 'Python', 'داکر', 'کوبرنتیس', 'گیت‌هاب', 'گیت', 'لینوکس',
      'یادگیری ماشین', 'هوش مصنوعی', 'یادگیری عمیق', 'شبکه‌های عصبی',
      // آموزش و affiliations (Education & Affiliation)
      'دانشجوی فیزیک', 'دانشگاه شریف', 'دانشگاه صنعتی شریف', 'دانشگاه اصفهان',
      // مکان‌محور (Location-Based)
      'دیتاساینتیست ایران', 'دیتاساینتیست تهران', 'دانشجوی فیزیک ایران', 'تحلیلگر داده تهران',
      // صنعت (Industry)
      'دستیار پژوهشی', 'هوش تجاری', 'تحلیلگر بازار', 'فیزیک محاسباتی', 'مهندسی داده',
      // انواع محتوا (Content Types)
      'بلاگ', 'نمونه کار', 'وبلاگ فنی', 'بلاگ علم داده',
    ] : [
      // Name Variations (from centralized config)
      ...allNameVariants,
      // Core Technical
      'Data Scientist', 'Machine Learning Engineer', 'Data Analyst', 'Physics Researcher', 'Complex Systems Analyst',
      // Tools & Technologies
      'Python Developer', 'Docker', 'Kubernetes', 'Git', 'Linux', 'SQL',
      'Data Science', 'Artificial Intelligence', 'Deep Learning', 'Neural Networks',
      // Education & Affiliation
      'Sharif University', 'Sharif University of Technology', 'University of Isfahan', 'Physics Student',
      // Location-Based
      'Data Scientist Iran', 'Data Scientist Tehran', 'Iran Data Scientist', 'Tehran Data Analyst', 'Remote Data Scientist',
      // Industry
      'Research Assistant', 'Business Intelligence', 'Market Research Analyst', 'Computational Physics',
      // Content Types
      'Blog', 'Portfolio', 'Tech Blog', 'Data Science Blog',
    ],
    authors: [{ name: NAME_VARIANTS.primary[locale] }],
    creator: getCreatorName(locale),
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
      siteName: NAME_VARIANTS.primary[locale],
      title: titles[locale],
      description: descriptions[locale],
      creator: getCreatorName(locale),
      images: [
        {
          url: '/og-image-default.png',
          width: 1200,
          height: 630,
          alt: titles[locale],
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale],
      description: descriptions[locale],
      creator: TWITTER_HANDLE, // No @ symbol - from centralized config
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
