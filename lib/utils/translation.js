/**
 * Translation Utility Module
 * Provides functions for translating text and HTML content using Google Cloud Translation API
 */

/**
 * Translate plain text using Google Cloud Translation API v2
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language code (en, fa, etc.)
 * @param {string} toLang - Target language code (en, fa, etc.)
 * @returns {Promise<string>} Translated text
 */
export async function translatePlainText(text, fromLang, toLang) {
  if (!text || !text.trim()) {
    return ''
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_TRANSLATE_API_KEY is not configured')
  }

  try {
    // Extract project ID from API key or use default
    // For Google Cloud Translation API v3, we need the project ID
    // The API key format is different from v2 - we need to use the endpoint format
    // For simplicity, using v2-compatible endpoint which works with API key directly

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: fromLang,
          target: toLang,
          format: 'text',
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Translation API error: ${response.status} ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data.data?.translations?.[0]?.translatedText || text
  } catch (error) {
    console.error('Translation error:', error)
    throw error
  }
}

/**
 * Translate HTML content while preserving HTML structure
 * Extracts text nodes, translates them, and reconstructs the HTML
 * @param {string} html - HTML content to translate
 * @param {string} fromLang - Source language code
 * @param {string} toLang - Target language code
 * @returns {Promise<string>} Translated HTML
 */
export async function translateHTML(html, fromLang, toLang) {
  if (!html || !html.trim()) {
    return ''
  }

  // Simple HTML translation - extract text content and translate
  // For TipTap content, we need to handle it carefully

  // Extract all text content while preserving tags
  const textPattern = />([^<]+)</g
  const textSegments = []
  let match

  while ((match = textPattern.exec(html)) !== null) {
    const text = match[1].trim()
    if (text && !/^\s*$/.test(text)) {
      textSegments.push({
        text,
        index: match.index,
        original: match[0],
      })
    }
  }

  // Translate each unique text segment
  const uniqueTexts = [...new Set(textSegments.map(s => s.text))]
  const translations = {}

  for (const text of uniqueTexts) {
    try {
      const translated = await translatePlainText(text, fromLang, toLang)
      translations[text] = translated
    } catch (error) {
      console.warn(`Failed to translate: "${text}"`, error)
      translations[text] = text // Keep original on error
    }
  }

  // Replace text in HTML
  let result = html
  for (const segment of textSegments) {
    const translated = translations[segment.text]
    const newTag = segment.original.replace(segment.text, translated)
    result = result.replace(segment.original, newTag)
  }

  return result
}

/**
 * Check which fields have existing translations
 * @param {Object} data - Article data object
 * @param {string} targetLang - Target language (en or fa)
 * @param {Array<string>} fields - Field names to check (without _en or _fa suffix)
 * @returns {Array<string>} Fields that have existing translations
 */
export function checkExistingTranslations(data, targetLang, fields) {
  const existing = []
  const suffix = targetLang === 'fa' ? '_fa' : '_en'

  for (const field of fields) {
    const fieldName = `${field}${suffix}`
    if (data[fieldName] && data[fieldName].trim()) {
      existing.push(field)
    }
  }

  return existing
}

/**
 * Translate article fields from one language to another
 * @param {Object} data - Article data with _en and _fa fields
 * @param {string} direction - 'en2fa' or 'fa2en'
 * @param {Array<string>} fields - Fields to translate (title, excerpt, content)
 * @returns {Promise<Object>} Translated fields
 */
export async function translateArticleFields(data, direction, fields) {
  const fromLang = direction === 'en2fa' ? 'en' : 'fa'
  const toLang = direction === 'en2fa' ? 'fa' : 'en'
  const fromSuffix = `_${fromLang}`
  const toSuffix = `_${toLang}`

  const translations = {}
  const errors = []

  for (const field of fields) {
    const sourceField = `${field}${fromSuffix}`
    const targetField = `${field}${toSuffix}`

    const sourceValue = data[sourceField]

    if (!sourceValue || !sourceValue.trim()) {
      errors.push({
        field,
        message: `Source field ${sourceField} is empty`,
      })
      continue
    }

    try {
      // For content field (TipTap HTML), use HTML translation
      // For title and excerpt, use plain text translation
      const isHTML = field === 'content'
      const translated = isHTML
        ? await translateHTML(sourceValue, fromLang, toLang)
        : await translatePlainText(sourceValue, fromLang, toLang)

      translations[targetField] = translated
    } catch (error) {
      console.error(`Failed to translate ${field}:`, error)
      errors.push({
        field,
        message: error.message,
      })
    }
  }

  return { translations, errors }
}

/**
 * Batch translate multiple articles
 * @param {Array<Object>} articles - Array of article data objects
 * @param {string} direction - 'en2fa' or 'fa2en'
 * @param {Array<string>} fields - Fields to translate
 * @returns {Promise<Array<Object>>} Array of translation results
 */
export async function translateArticlesBatch(articles, direction, fields) {
  const results = []

  for (const article of articles) {
    try {
      const { translations, errors } = await translateArticleFields(article, direction, fields)
      results.push({
        articleId: article.id,
        translations,
        errors,
        success: errors.length === 0,
      })
    } catch (error) {
      results.push({
        articleId: article.id,
        translations: {},
        errors: [{ field: 'all', message: error.message }],
        success: false,
      })
    }
  }

  return results
}
