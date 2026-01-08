import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import en from './locales/en.json'
import fa from './locales/fa.json'

// Check if we're on the client side
const isClient = typeof window !== 'undefined'

// Only initialize if not already initialized
if (!i18n.isInitialized) {
  const config = {
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      fa: { translation: fa },
    },
  }

  // Add browser detection only on client side
  if (isClient) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        ...config,
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
      })
  } else {
    i18n.use(initReactI18next).init(config)
  }
}

export default i18n
