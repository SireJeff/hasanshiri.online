'use server'

import { createClient } from '@/lib/supabase/server'
import {
  callOpenRouter,
  validatePresetSlug,
  getPresetExamples
} from '@/lib/openrouter'
import { getActionableError } from '@/lib/errors/openrouter-errors'

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
    const isEnToFa = data.direction === 'en2fa'
    const sourceLang = isEnToFa ? 'en' : 'fa'
    const targetLang = isEnToFa ? 'fa' : 'en'

    // Source and target field names
    const sourceFields = isEnToFa
      ? ['title_en', 'excerpt_en', 'content_en']
      : ['title_fa', 'excerpt_fa', 'content_fa']
    const targetFields = isEnToFa
      ? ['title_fa', 'excerpt_fa', 'content_fa']
      : ['title_en', 'excerpt_en', 'content_en']

    // Get user's preset preferences
    const presetsResult = await getUserPresets()

    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    const model = data.model || userPresets.translateFast

    if (!model) {
      return { error: 'No translation preset configured. Please set a preset in AI Settings.', success: false }
    }

    // Find which field was actually sent for translation
    let sourceContent = null
    let targetField = null

    for (let i = 0; i < sourceFields.length; i++) {
      const field = sourceFields[i]
      if (data[field] && data[field].trim()) {
        sourceContent = data[field]
        targetField = targetFields[i]
        break
      }
    }

    if (!sourceContent) {
      return { error: 'No content provided for translation', success: false }
    }

    // Prepare translation messages
    const messages = [
      {
        role: 'system',
        content: `You are a professional translator for a bilingual portfolio website. Translate the following ${sourceLang === 'en' ? 'English' : 'Persian'} text to ${targetLang === 'en' ? 'English' : 'Persian'}.

IMPORTANT RULES:
- Preserve all HTML tags and structure exactly as they are
- Preserve technical terms, code, and URLs
- Only return the translated text, nothing else
- Do not add explanations or commentary`,
      },
      {
        role: 'user',
        content: sourceContent,
      },
    ]

    const response = await callOpenRouter('/chat/completions', {
      model,
      messages,
      temperature: 0.3,
    })

    const translatedContent = response.choices?.[0]?.message?.content || ''

    // Return the translation with the correct target field name
    return {
      translated: { [targetField]: translatedContent },
      success: true
    }
  } catch (error) {
    console.error('AI translation error:', error)
    return getActionableError(error)
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
    const presetsResult = await getUserPresets()

    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    const model = data.model || userPresets.articleGenerator

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
    return getActionableError(error)
  }
}

/**
 * Generate complete article from topic/prompt
 * @param {Object} data - Generation parameters
 * @returns {Promise<Object>} Generated article fields
 */
export async function aiGenerateArticle(data) {
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

    // Get user's preset preferences
    const presetsResult = await getUserPresets()

    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    const model = data.model || userPresets.articleGenerator

    if (!model) {
      return { error: 'No generation preset configured. Please set a preset in AI Settings.', success: false }
    }

    const systemPrompt = `You are a professional content writer for a bilingual portfolio website.
Write a complete article about: ${topic}

The article should include:
- An engaging title (in English)
- A compelling excerpt (2-3 sentences, in English)
- Well-structured content with headings, paragraphs, and proper formatting (in English)
- SEO-friendly slug based on title (URL-friendly, lowercase, hyphen-separated)
- Meta title and description for SEO (in English)

Respond with a JSON object containing these fields:
title_en, excerpt_en, content_en, slug, meta_title_en, meta_description_en

Use appropriate tone for: ${data.tone || 'professional'} audience.`

    const response = await callOpenRouter('/chat/completions', {
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Write a complete article about: ${topic}` },
      ],
    })

    const result = response.choices?.[0]?.message?.content

    // Parse JSON response with markdown cleanup
    let parsed = {}
    try {
      // Clean up markdown code blocks if present
      const cleanedResult = result.replace(/^```json\n?|\n?```$/g, '').trim()
      parsed = typeof cleanedResult === 'string' ? JSON.parse(cleanedResult) : cleanedResult
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      return { error: 'Failed to parse generated content', success: false }
    }

    return { ...parsed, success: true }
  } catch (error) {
    console.error('AI article generation error:', error)
    return getActionableError(error)
  }
}

/**
 * Batch translate all fields from one language to another
 * @param {Object} data - Translation data with source fields and direction
 * @returns {Promise<Object>} Translated fields
 */
export async function aiTranslateAll(data) {
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
    const isEnToFa = data.direction === 'en2fa'
    const sourceLang = isEnToFa ? 'en' : 'fa'
    const targetLang = isEnToFa ? 'fa' : 'en'

    // Get user's preset preferences
    const presetsResult = await getUserPresets()

    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    const model = data.model || userPresets.translateFast

    if (!model) {
      return { error: 'No translation preset configured. Please set a preset in AI Settings.', success: false }
    }

    // Build the content to translate with labels
    // Support both direct field access and nested fields object
    const sourceData = data.fields || data
    let contentToTranslate = ''
    const fields = ['title', 'excerpt', 'content', 'meta_title', 'meta_description']

    const sourceSuffix = isEnToFa ? '_en' : '_fa'
    const targetSuffix = isEnToFa ? '_fa' : '_en'

    for (const field of fields) {
      const sourceField = field + sourceSuffix
      if (sourceData[sourceField] && sourceData[sourceField].trim()) {
        contentToTranslate += `[LABEL]${field}[/LABEL]\n${sourceData[sourceField]}\n\n`
      }
    }

    if (!contentToTranslate.trim()) {
      return { error: 'No content provided for translation', success: false }
    }

    // Prepare translation messages
    const messages = [
      {
        role: 'system',
        content: `You are a professional translator for a bilingual portfolio website. Translate the following ${sourceLang === 'en' ? 'English' : 'Persian'} text to ${targetLang === 'en' ? 'English' : 'Persian'}.

IMPORTANT RULES:
- Preserve all HTML tags and structure exactly as they are
- Preserve technical terms, code, and URLs
- Use the [LABEL]...[/LABEL] format to identify each field
- Translate only the content within each label, not the labels themselves
- Maintain the exact same label structure in your response
- Do not add explanations or commentary`,
      },
      {
        role: 'user',
        content: contentToTranslate,
      },
    ]

    const response = await callOpenRouter('/chat/completions', {
      model,
      messages,
      temperature: 0.3,
    })

    const translatedContent = response.choices?.[0]?.message?.content || ''

    // Parse the labeled response
    const translated = {}
    const labelRegex = /\[LABEL\](\w+)\[\/LABEL\]\s*([\s\S]*?)(?=\n\[LABEL\]|\n*$)/g
    let match

    while ((match = labelRegex.exec(translatedContent)) !== null) {
      const fieldName = match[1]
      const fieldValue = match[2].trim()
      translated[`${fieldName}${targetSuffix}`] = fieldValue
    }

    if (Object.keys(translated).length === 0) {
      return { error: 'Failed to parse translated content', success: false }
    }

    return { translated, success: true }
  } catch (error) {
    console.error('AI batch translation error:', error)
    return getActionableError(error)
  }
}

/**
 * Generate project description from prompt
 * @param {Object} data - Generation parameters
 * @returns {Promise<Object>} Generated project fields
 */
export async function aiGenerateProject(data) {
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
    const prompt = data.prompt || ''

    // Get user's preset preferences
    const presetsResult = await getUserPresets()

    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    const model = data.model || userPresets.projectGenerator

    if (!model) {
      return { error: 'No generation preset configured. Please set a preset in AI Settings.', success: false }
    }

    const systemPrompt = `You are a professional content writer for a bilingual portfolio website.
Write a project description based on: ${prompt}

The project description should include:
- An engaging title (in English)
- A brief description (2-3 sentences, in English)
- A detailed long description with sections like: Overview, Technologies Used, Key Features, Challenges, and Results (in English, with proper HTML formatting)

Respond with a JSON object containing these fields:
title_en, description_en, long_description_en

Use appropriate tone for: ${data.tone || 'professional'} audience.`

    const response = await callOpenRouter('/chat/completions', {
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Write a project description based on: ${prompt}` },
      ],
    })

    const result = response.choices?.[0]?.message?.content

    // Parse JSON response with markdown cleanup
    let parsed = {}
    try {
      // Clean up markdown code blocks if present
      const cleanedResult = result.replace(/^```json\n?|\n?```$/g, '').trim()
      parsed = typeof cleanedResult === 'string' ? JSON.parse(cleanedResult) : cleanedResult
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      return { error: 'Failed to parse generated content', success: false }
    }

    return { ...parsed, success: true }
  } catch (error) {
    console.error('AI project generation error:', error)
    return getActionableError(error)
  }
}

/**
 * Get user's preset preferences from database (ADMIN ONLY)
 * Fetches presets for the currently authenticated user
 * @returns {Promise<Object>} Object with { success: boolean, presets?: object, error?: string }
 */
export async function getUserPresets() {
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

  const { data: existingPresets, error } = await supabase
    .from('user_ai_presets')
    .select('presets')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // Log the error for debugging but don't crash - return empty presets
    console.error('Error fetching user presets:', error)
    // Check if table exists (PGRST116 = no rows found, which is fine)
    if (error.code !== 'PGRST116') {
      // This is a real error (table missing, RLS issue, etc.)
      console.error('User presets query failed with code:', error.code, error.message)
    }
    return { success: true, presets: {} }
  }

  if (!existingPresets?.presets) {
    // No presets configured yet
    return { success: true, presets: {} }
  }

  // Parse JSON if stored as string
  const presets = typeof existingPresets.presets === 'string'
    ? JSON.parse(existingPresets.presets)
    : existingPresets.presets

  return { success: true, presets }
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

  // Validate each preset format
  const validationErrors = {}
  const validatedPresets = {}

  for (const [key, value] of Object.entries(presets)) {
    if (!value) {
      validatedPresets[key] = ''
      continue
    }

    const validation = validatePresetSlug(value)
    if (!validation.valid) {
      validationErrors[key] = validation.error
    } else {
      validatedPresets[key] = value.trim()
    }
  }

  if (Object.keys(validationErrors).length > 0) {
    return {
      error: 'Invalid preset format',
      success: false,
      validationErrors,
      examples: getPresetExamples(),
    }
  }

  // First check if user already has a presets record
  const { data: existingRecord } = await supabase
    .from('user_ai_presets')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let error
  if (existingRecord?.id) {
    // Update existing record
    const result = await supabase
      .from('user_ai_presets')
      .update({
        presets: JSON.stringify(validatedPresets),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRecord.id)
    error = result.error
  } else {
    // Insert new record
    const result = await supabase.from('user_ai_presets').insert({
      user_id: user.id,
      presets: JSON.stringify(validatedPresets),
      updated_at: new Date().toISOString(),
    })
    error = result.error
  }

  if (error) {
    console.error('Error saving user presets:', error)
    // Check for common issues
    if (error.code === '42P01') {
      return { error: 'Database table not found. Please run migrations.', success: false }
    }
    if (error.code === '42501' || error.code === 'PGRST301') {
      return { error: 'Permission denied. Check RLS policies.', success: false }
    }
    return { error: error.message, success: false }
  }

  console.log('User presets saved successfully:', validatedPresets)

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
    const presetsResult = await getUserPresets()

    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    const model = data.model || userPresets.contentRefiner

    if (!model) {
      return { error: 'No refinement preset configured. Please set a preset in AI Settings.', success: false }
    }

    const systemPrompt = `You are a professional editor improving content for a bilingual portfolio website.
Focus on: clarity, grammar, flow, tone, and engagement.
Preserve all HTML structure and formatting.
Make only necessary changes to improve the content.

Instructions: ${instructions || 'Improve clarity, grammar, and readability.'}`

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
    return getActionableError(error)
  }
}
