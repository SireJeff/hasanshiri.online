import { i18nConfig, generateAlternateUrls } from '@/lib/i18n-config'
import { HomePage } from '../home-page'

// Generate static params for all locales
export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }))
}

// Generate metadata for home page
export async function generateMetadata({ params }) {
  const { locale } = await params
  const isRtl = locale === 'fa'
  const baseUrl = 'https://hasanshiri.online'
  const alternates = generateAlternateUrls('/', baseUrl)

  const titles = {
    en: 'Mohammad Hassan Shiri | Portfolio & Blog',
    fa: 'محمد حسن شیری | نمونه کارها و بلاگ',
  }

  const descriptions = {
    en: 'Mohammad Hassan Shiri (MHS) - Physics Student at Sharif University, Data Scientist & Complex Systems Researcher. Expertise in Data Analysis and Machine Learning.',
    fa: 'محمد حسن شیری - دانشجوی فیزیک دانشگاه صنعتی شریف، دانشمند داده و پژوهشگر سیستم‌های پیچیده.',
  }

  return {
    title: titles[locale],
    description: descriptions[locale],
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: alternates.languages,
    },
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      url: `${baseUrl}/${locale}`,
      locale: isRtl ? 'fa_IR' : 'en_US',
    },
  }
}

export default async function Page({ params }) {
  const { locale } = await params

  return <HomePage locale={locale} />
}
