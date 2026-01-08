// Internationalization configuration for URL-based locale routing

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
export function generateAlternateUrls(path, baseUrl = 'https://hasanshiri.online') {
  const cleanPath = path.replace(/^\/(en|fa)/, '') // Remove locale prefix if present

  return {
    canonical: `${baseUrl}/en${cleanPath}`,
    languages: {
      en: `${baseUrl}/en${cleanPath}`,
      fa: `${baseUrl}/fa${cleanPath}`,
      'x-default': `${baseUrl}/en${cleanPath}`,
    },
  }
}
