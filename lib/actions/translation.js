'use server'

import { createClient } from '@/lib/supabase/server'
import { translateArticleFields, checkExistingTranslations } from '@/lib/utils/translation'

/**
 * Translate article fields (server action)
 * Keeps API key secure on server side
 * @param {Object} params - Translation parameters
 * @param {Object} params.data - Article data
 * @param {string} params.direction - Translation direction ('en2fa' or 'fa2en')
 * @param {Array<string>} params.fields - Fields to translate
 * @param {boolean} params.overwrite - Whether to overwrite existing translations
 * @returns {Promise<Object>} Translation result
 */
export async function translateArticle({ data, direction, fields = ['title', 'excerpt', 'content'], overwrite = false }) {
  // Verify user is authenticated admin
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      error: 'Authentication required',
      success: false,
    }
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return {
      error: 'Admin access required',
      success: false,
    }
  }

  // Determine target language
  const targetLang = direction === 'en2fa' ? 'fa' : 'en'

  // Check for existing translations if not overwriting
  if (!overwrite) {
    const existing = checkExistingTranslations(data, targetLang, fields)
    if (existing.length > 0) {
      return {
        existingTranslations: existing,
        requiresConfirmation: true,
        success: false,
      }
    }
  }

  try {
    const { translations, errors } = await translateArticleFields(data, direction, fields)

    return {
      translations,
      errors,
      success: errors.length === 0 || errors.length < fields.length,
    }
  } catch (error) {
    console.error('Translation server action error:', error)
    return {
      error: error.message,
      success: false,
    }
  }
}

/**
 * Translate a single field (server action)
 * @param {Object} params - Translation parameters
 * @param {string} params.text - Text to translate
 * @param {string} params.field - Field name (for context)
 * @param {string} params.direction - Translation direction
 * @param {boolean} params.isHTML - Whether the text is HTML (for TipTap content)
 * @returns {Promise<Object>} Translation result
 */
export async function translateField({ text, field, direction, isHTML = false }) {
  // Verify user is authenticated admin
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      error: 'Authentication required',
      success: false,
    }
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return {
      error: 'Admin access required',
      success: false,
    }
  }

  if (!text || !text.trim()) {
    return {
      error: 'No text provided',
      success: false,
    }
  }

  try {
    const { translatePlainText, translateHTML } = await import('@/lib/utils/translation')

    const fromLang = direction === 'en2fa' ? 'en' : 'fa'
    const toLang = direction === 'en2fa' ? 'fa' : 'en'

    const translated = isHTML
      ? await translateHTML(text, fromLang, toLang)
      : await translatePlainText(text, fromLang, toLang)

    return {
      translated,
      field,
      success: true,
    }
  } catch (error) {
    console.error('Field translation error:', error)
    return {
      error: error.message,
      success: false,
    }
  }
}

/**
 * Batch translate multiple articles
 * @param {Object} params - Batch translation parameters
 * @param {Array<number>} params.articleIds - Article IDs to translate
 * @param {string} params.direction - Translation direction
 * @param {Array<string>} params.fields - Fields to translate
 * @param {boolean} params.overwrite - Whether to overwrite existing translations
 * @returns {Promise<Object>} Batch translation result
 */
export async function translateArticlesBatchServer({ articleIds, direction, fields = ['title', 'excerpt', 'content'], overwrite = false }) {
  // Verify user is authenticated admin
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      error: 'Authentication required',
      success: false,
    }
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return {
      error: 'Admin access required',
      success: false,
    }
  }

  // Fetch articles
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, title_en, title_fa, excerpt_en, excerpt_fa, content_en, content_fa')
    .in('id', articleIds)

  if (fetchError) {
    return {
      error: `Failed to fetch articles: ${fetchError.message}`,
      success: false,
    }
  }

  if (!articles || articles.length === 0) {
    return {
      error: 'No articles found',
      success: false,
    }
  }

  // Check for existing translations if not overwriting
  const targetLang = direction === 'en2fa' ? 'fa' : 'en'
  if (!overwrite) {
    for (const article of articles) {
      const existing = checkExistingTranslations(article, targetLang, fields)
      if (existing.length > 0) {
        return {
          existingTranslations: { articleId: article.id, fields: existing },
          requiresConfirmation: true,
          success: false,
        }
      }
    }
  }

  // Translate all articles
  const results = []
  for (const article of articles) {
    try {
      const { translations, errors } = await translateArticleFields(article, direction, fields)

      // Update the article with translations
      if (Object.keys(translations).length > 0) {
        const { error: updateError } = await supabase
          .from('articles')
          .update(translations)
          .eq('id', article.id)

        if (updateError) {
          results.push({
            articleId: article.id,
            success: false,
            error: updateError.message,
          })
        } else {
          results.push({
            articleId: article.id,
            success: errors.length === 0,
            translations,
            errors,
          })
        }
      } else {
        results.push({
          articleId: article.id,
          success: false,
          errors,
        })
      }
    } catch (error) {
      results.push({
        articleId: article.id,
        success: false,
        error: error.message,
      })
    }
  }

  return {
    results,
    success: results.some(r => r.success),
  }
}
