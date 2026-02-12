'use server'

import { createClient } from '@/lib/supabase/server'
import { callOpenRouter, translateText, generateArticleContent, refineContent } from '@/lib/openrouter'

/**
 * Translate content using AI
 * @param {Object} data - Article data with source fields
 * @param {string} model - Model to use for translation
 * @returns {Promise<Object>} Translated fields
 */
export async function aiTranslate(data) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Authentication required', success: false }
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', success: false }
  }

  try {
    const { sourceLang, targetLang, fields } = data.direction === 'en2fa'
      ? { sourceLang: 'en', targetLang: 'fa', fields: ['title_en', 'excerpt_en', 'content_en'] }
      : { sourceLang: 'fa', targetLang: 'en', fields: ['title_fa', 'excerpt_fa', 'content_fa'] }

    // Get user's preset preferences - no fallback defaults
    const userPresets = await getUserPresets(user.id)
    const model = data.model || userPresets.translateFast

    if (!model) {
      return { error: 'No translation preset configured. Please set a preset in AI Settings.', success: false }
    }

    // Prepare translation messages with existing content as context
    const messages = [
      {
        role: 'system',
        content: 'You are a professional translator for a bilingual portfolio website. Translate following field(s) accurately while preserving HTML structure, technical terms, and formatting.',
      },
    ]

    // Add each field's content for translation
    for (const field of fields) {
      const sourceContent = data[field.replace('_en', '').replace('_fa', '')]
      if (sourceContent && sourceContent.trim()) {
        messages.push({
          role: 'user',
          content: `Translate to ${targetLang}:\n${field}: ${sourceContent}`,
        })
      }
    }

    const response = await callOpenRouter('/chat/completions', {
      model,
      messages,
      temperature: 0.3,
    })

    const translatedContent = response.choices?.[0]?.message?.content || ''

    // Parse response - expected format: "title_fa: [translated title]"
    const translations = {}
    for (const field of fields) {
      const regex = new RegExp(`${field.replace('_', '_')}: \\s*([^\\n]+)`)
      const match = translatedContent.match(regex)
      if (match && match[1]) {
        translations[field] = match[1].trim()
      }
    }

    return { translated: translations, success: true }
  } catch (error) {
    console.error('AI translation error:', error)
    return { error: error.message, success: false }
  }
}

/**
 * Generate article content using AI
 * @param {Object} data - Generation parameters
 * @returns {Promise<Object>} Generated article fields
 */
export async function aiGenerateContent(data) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Authentication required', success: false }
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', success: false }
  }

  try {
    const topic = data.topic || ''

    // Get user's preset preferences - no fallback defaults
    const userPresets = await getUserPresets(user.id)
    const model = data.model || userPresets.generate

    if (!model) {
      return { error: 'No generation preset configured. Please set a preset in AI Settings.', success: false }
    }

    const systemPrompt = `You are a professional content writer for a bilingual portfolio website.
Write an article about: ${topic}

The article should include:
- An engaging title (in ${data.targetLang || 'target'})
- A compelling excerpt (2-3 sentences)
- Well-structured content with headings, paragraphs, and proper formatting
- SEO-friendly slug based on title
- Meta title and description for SEO

Respond with a JSON object containing these fields:
title_${data.targetLang || 'target'}, title_${data.targetLang === 'en' ? 'fa' : 'en'}
excerpt_${data.targetLang || 'target'}, excerpt_${data.targetLang === 'en' ? 'fa' : 'en'}
content_${data.targetLang || 'target'}, content_${data.targetLang === 'en' ? 'fa' : 'en'}
slug (URL-friendly, lowercase, hyphen-separated)
meta_title_${data.targetLang || 'target'}, meta_title_${data.targetLang === 'en' ? 'fa' : 'en'}
meta_description_${data.targetLang || 'target'}, meta_description_${data.targetLang === 'en' ? 'fa' : 'en'}

Use appropriate tone for: ${data.tone || 'professional'} audience.
Maintain bilingual context where applicable.`

    const response = await callOpenRouter('/chat/completions', {
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Write an article about: ${topic}` },
      ],
    })

    const result = response.choices?.[0]?.message?.content

    // Parse JSON response
    let parsed = {}
    try {
      parsed = typeof result === 'string' ? JSON.parse(result) : result
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      return { error: 'Failed to parse generated content', success: false }
    }

    return { ...parsed, success: true }
  } catch (error) {
    console.error('AI generation error:', error)
    return { error: error.message, success: false }
  }
}

/**
 * Get user's preset preferences from database (ADMIN ONLY)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's preset slugs
 */
export async function getUserPresets(userId) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Authentication required', success: false }
  }

  // Check admin role before accessing presets
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', success: false }
  }

  // Ensure userId matches authenticated user (security check)
  if (userId !== user.id) {
    return { error: 'Access denied', success: false }
  }

  const { data: existingPresets, error } = await supabase
    .from('user_ai_presets')
    .select('presets')
    .eq('user_id', userId)
    .single()

  if (error || !existingPresets?.presets) {
    // Return empty object - user must configure presets via OpenRouter dashboard
    // No fallback defaults - presets must be explicitly configured
    return {}
  }

  // Parse JSON if stored as string
  const presets = typeof existingPresets.presets === 'string'
    ? JSON.parse(existingPresets.presets)
    : existingPresets.presets

  return presets
}

/**
 * Save user's preset preferences to database (ADMIN ONLY)
 * @param {Object} presets - Preset object with slugs (e.g., { translateFast: '@preset/translate-fast' })
 * @returns {Promise<Object>} Result with success flag
 */
export async function updateUserPresets(presets) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Authentication required', success: false }
  }

  // Check admin role before modifying presets
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', success: false }
  }

  const { error } = await supabase.from('user_ai_presets').upsert({
    user_id: user.id,
    presets: JSON.stringify(presets),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    return { error: error.message, success: false }
  }

  return { success: true }
}

/**
 * Refine/improve existing content using AI
 * @param {Object} data - Content to refine
 * @returns {Promise<Object>} Refined content
 */
export async function aiRefineContent(data) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Authentication required', success: false }
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', success: false }
  }

  try {
    const { content, instructions } = data

    // Get user's preset preferences - no fallback defaults
    const userPresets = await getUserPresets(user.id)
    const model = data.model || userPresets.refine

    if (!model) {
      return { error: 'No refinement preset configured. Please set a preset in AI Settings.', success: false }
    }

    const systemPrompt = `You are a professional editor improving content for a bilingual portfolio website.
Focus on: clarity, grammar, flow, tone, and engagement.
Preserve all HTML structure and formatting.
Make only necessary changes to improve the content.

Instructions: ${instructions || 'Improve clarity, grammar, and readability.'}

    const response = await callOpenRouter('/chat/completions', {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Refine the following content:\n\n${content}\n\nInstructions: ${instructions || 'Improve clarity, grammar, and readability.'}` },
      ],
      temperature: 0.7,
    })

    const refinedContent = response.choices?.[0]?.message?.content || content

    return { refined: refinedContent, success: true }
  } catch (error) {
    console.error('AI refinement error:', error)
    return { error: error.message, success: false }
  }
}
