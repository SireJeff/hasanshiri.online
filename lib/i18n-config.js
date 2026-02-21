// Internationalization configuration for URL-based locale routing

// Helper function to get base URL from environment with fallback
const getDefaultBaseUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://hasanshiri.online'
}

export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'fa'],
  localeNames: {
    en: 'English',
    fa: 'فارسی',
  },
  localeDirection: {
    en: 'ltr',
    fa: 'rtl',
  },
}

// Check if a locale is valid
export function isValidLocale(locale) {
  return i18nConfig.locales.includes(locale)
}

// Get the opposite locale (for language switcher)
export function getAlternateLocale(locale) {
  return locale === 'en' ? 'fa' : 'en'
}

// Get locale display name
export function getLocaleName(locale) {
  return i18nConfig.localeNames[locale] || locale
}

// Get text direction for locale
export function getLocaleDirection(locale) {
  return i18nConfig.localeDirection[locale] || 'ltr'
}

// Generate alternate URLs for hreflang
export function generateAlternateUrls(path, baseUrl) {
  const finalBaseUrl = baseUrl || getDefaultBaseUrl()
  const cleanPath = path.replace(/^\/(en|fa)/, '') // Remove locale prefix if present

  return {
    canonical: `${finalBaseUrl}/en${cleanPath}`,
    languages: {
      en: `${finalBaseUrl}/en${cleanPath}`,
      fa: `${finalBaseUrl}/fa${cleanPath}`,
      'x-default': `${finalBaseUrl}/en${cleanPath}`,
    },
  }
}
