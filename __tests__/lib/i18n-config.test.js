import {
  i18nConfig,
  isValidLocale,
  getAlternateLocale,
  getLocaleName,
  getLocaleDirection,
  generateAlternateUrls,
} from '@/lib/i18n-config'

describe('i18n-config', () => {
  describe('i18nConfig', () => {
    it('should have correct default locale', () => {
      expect(i18nConfig.defaultLocale).toBe('en')
    })

    it('should have en and fa locales', () => {
      expect(i18nConfig.locales).toEqual(['en', 'fa'])
    })

    it('should have correct locale names', () => {
      expect(i18nConfig.localeNames.en).toBe('English')
      expect(i18nConfig.localeNames.fa).toBe('فارسی')
    })

    it('should have correct locale directions', () => {
      expect(i18nConfig.localeDirection.en).toBe('ltr')
      expect(i18nConfig.localeDirection.fa).toBe('rtl')
    })
  })

  describe('isValidLocale', () => {
    it('should return true for valid locales', () => {
      expect(isValidLocale('en')).toBe(true)
      expect(isValidLocale('fa')).toBe(true)
    })

    it('should return false for invalid locales', () => {
      expect(isValidLocale('de')).toBe(false)
      expect(isValidLocale('fr')).toBe(false)
      expect(isValidLocale('')).toBe(false)
      expect(isValidLocale(null)).toBe(false)
    })
  })

  describe('getAlternateLocale', () => {
    it('should return fa for en', () => {
      expect(getAlternateLocale('en')).toBe('fa')
    })

    it('should return en for fa', () => {
      expect(getAlternateLocale('fa')).toBe('en')
    })

    it('should return en for unknown locale', () => {
      expect(getAlternateLocale('de')).toBe('en')
    })
  })

  describe('getLocaleName', () => {
    it('should return English for en', () => {
      expect(getLocaleName('en')).toBe('English')
    })

    it('should return فارسی for fa', () => {
      expect(getLocaleName('fa')).toBe('فارسی')
    })

    it('should return the locale itself for unknown locale', () => {
      expect(getLocaleName('de')).toBe('de')
    })
  })

  describe('getLocaleDirection', () => {
    it('should return ltr for en', () => {
      expect(getLocaleDirection('en')).toBe('ltr')
    })

    it('should return rtl for fa', () => {
      expect(getLocaleDirection('fa')).toBe('rtl')
    })

    it('should return ltr for unknown locale', () => {
      expect(getLocaleDirection('de')).toBe('ltr')
    })
  })

  describe('generateAlternateUrls', () => {
    it('should generate correct alternate URLs for root path', () => {
      const result = generateAlternateUrls('/')
      expect(result.canonical).toBe('https://hasanshiri.online/en/')
      expect(result.languages.en).toBe('https://hasanshiri.online/en/')
      expect(result.languages.fa).toBe('https://hasanshiri.online/fa/')
      expect(result.languages['x-default']).toBe('https://hasanshiri.online/en/')
    })

    it('should generate correct alternate URLs for blog path', () => {
      const result = generateAlternateUrls('/blog')
      expect(result.canonical).toBe('https://hasanshiri.online/en/blog')
      expect(result.languages.en).toBe('https://hasanshiri.online/en/blog')
      expect(result.languages.fa).toBe('https://hasanshiri.online/fa/blog')
    })

    it('should strip existing locale prefix', () => {
      const result = generateAlternateUrls('/en/blog/my-article')
      expect(result.canonical).toBe('https://hasanshiri.online/en/blog/my-article')
      expect(result.languages.fa).toBe('https://hasanshiri.online/fa/blog/my-article')
    })

    it('should work with custom base URL', () => {
      const result = generateAlternateUrls('/blog', 'https://example.com')
      expect(result.canonical).toBe('https://example.com/en/blog')
    })
  })
})
