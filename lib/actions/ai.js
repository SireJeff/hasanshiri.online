'use server'

import { createClient } from '@/lib/supabase/server'
import {
  callOpenRouter,
  validatePresetSlug,
  getPresetExamples
} from '@/lib/openrouter'
import { getActionableError } from '@/lib/errors/openrouter-errors'

/**
 * Require admin authentication for AI operations
 * @returns {Promise<{user: object, profile: object} | {error: string, success: false}>}
 */
async function requireAdminAuth() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Authentication required', success: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', success: false }
  }

  return { user, profile }
}

/**
 * Translate content using AI
 * @param {Object} data - Article data with source fields
 * @param {string} model - Model to use for translation
 * @returns {Promise<Object>} Translated fields
 */
export async function aiTranslate(data) {
  const authResult = await requireAdminAuth()
  if (authResult.error) {
    return { error: authResult.error, success: false }
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

    // Find which field was actually sent for translation (flexible - any field with _en or _fa suffix)
    let sourceContent = null
    let sourceField = null
    let targetField = null

    const sourceSuffix = isEnToFa ? '_en' : '_fa'
    const targetSuffix = isEnToFa ? '_fa' : '_en'

    for (const [key, value] of Object.entries(data)) {
      if (key === 'direction' || key === 'model') continue
      if (typeof value === 'string' && value.trim() && key.endsWith(sourceSuffix)) {
        sourceContent = value
        sourceField = key
        targetField = key.replace(sourceSuffix, targetSuffix)
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
      maxTokens: 12288, // Token limit for single field translation (doubled)
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
  const authResult = await requireAdminAuth()
  if (authResult.error) {
    return { error: authResult.error, success: false }
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
      maxTokens: 24576, // Token limit for content generation (doubled)
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
  const authResult = await requireAdminAuth()
  if (authResult.error) {
    return { error: authResult.error, success: false }
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
      maxTokens: 24576, // Token limit for article generation (doubled)
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
  const authResult = await requireAdminAuth()
  if (authResult.error) {
    return { error: authResult.error, success: false }
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

    const sourceSuffix = isEnToFa ? '_en' : '_fa'
    const targetSuffix = isEnToFa ? '_fa' : '_en'

    // Dynamically find all fields with the source suffix
    for (const [key, value] of Object.entries(sourceData)) {
      if (typeof value === 'string' && value.trim() && key.endsWith(sourceSuffix)) {
        // Extract base field name (e.g., 'title' from 'title_en')
        const baseFieldName = key.replace(sourceSuffix, '')
        contentToTranslate += `[LABEL]${baseFieldName}[/LABEL]\n${value}\n\n`
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
      maxTokens: 24576, // Token limit for batch translations (doubled)
    })

    // Debug: Log the full response structure
    console.log('OpenRouter translateAll response:', JSON.stringify(response)?.substring(0, 500))

    const translatedContent = response.choices?.[0]?.message?.content || ''

    if (!translatedContent || !translatedContent.trim()) {
      console.error('Empty translation response. Full response:', JSON.stringify(response))
      return {
        error: 'AI returned empty response. Please check your preset configuration in AI Settings.',
        success: false
      }
    }

    // Parse the labeled response with multiple regex patterns for robustness
    const translated = {}

    // Try multiple regex patterns to handle different AI response formats
    const patterns = [
      // Standard format: [LABEL]name[/LABEL]content
      /\[LABEL\](\w+)\[\/LABEL\]\s*([\s\S]*?)(?=\n\s*\[LABEL\]|\n*$)/gi,
      // Format with possible whitespace: [LABEL]name[/LABEL]\ncontent
      /\[LABEL\](\w+)\[\/LABEL\]\n([\s\S]*?)(?=\n\s*\[LABEL\]|$)/gi,
      // Format with colon: [LABEL]name[/LABEL]: content
      /\[LABEL\](\w+)\[\/LABEL\]:?\s*([\s\S]*?)(?=\n\s*\[LABEL\]|$)/gi,
    ]

    for (const regex of patterns) {
      let match
      regex.lastIndex = 0 // Reset regex state
      while ((match = regex.exec(translatedContent)) !== null) {
        const fieldName = match[1].toLowerCase()
        const fieldValue = match[2].trim()
        if (fieldName && fieldValue) {
          translated[`${fieldName}${targetSuffix}`] = fieldValue
        }
      }
      if (Object.keys(translated).length > 0) break
    }

    // If no labels found, try parsing as key-value pairs
    if (Object.keys(translated).length === 0) {
      console.log('No labels found, attempting fallback parsing. Response:', translatedContent.substring(0, 500))

      // Fallback: Try to split by double newlines and parse each section
      const sections = translatedContent.split(/\n\n+/)
      const fieldNames = ['title', 'description', 'content', 'excerpt', 'meta_title', 'meta_description']

      for (let i = 0; i < sections.length && i < fieldNames.length; i++) {
        const section = sections[i].trim()
        if (section) {
          translated[`${fieldNames[i]}${targetSuffix}`] = section
        }
      }
    }

    if (Object.keys(translated).length === 0) {
      console.error('Failed to parse translation response:', translatedContent)
      return {
        error: 'Failed to parse translated content. Please try again.',
        success: false,
        debug: translatedContent.substring(0, 200)
      }
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
  const authResult = await requireAdminAuth()
  if (authResult.error) {
    return { error: authResult.error, success: false }
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
      maxTokens: 24576, // Token limit for project generation (doubled)
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
  const authResult = await requireAdminAuth()
  if (authResult.error) {
    return { error: authResult.error, success: false }
  }

  const supabase = await createClient()
  const { data: existingPresets, error } = await supabase
    .from('user_ai_presets')
    .select('presets')
    .eq('user_id', authResult.user.id)
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
  const authResult = await requireAdminAuth()
  if (authResult.error) {
    return { error: authResult.error, success: false }
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

  const supabase = await createClient()

  // First check if user already has a presets record
  const { data: existingRecord } = await supabase
    .from('user_ai_presets')
    .select('id')
    .eq('user_id', authResult.user.id)
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
      user_id: authResult.user.id,
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
  const authResult = await requireAdminAuth()
  if (authResult.error) {
    return { error: authResult.error, success: false }
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
      maxTokens: 12288, // Token limit for content refinement (doubled)
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

/**
 * Generate SEO meta tags for articles or projects
 * Analyzes content and generates optimized meta titles and descriptions
 * @param {Object} data - Content data to analyze
 * @param {string} data.type - 'article' or 'project'
 * @param {string} data.title_en - English title
 * @param {string} data.title_fa - Persian title (optional)
 * @param {string} data.excerpt_en - English excerpt/description
 * @param {string} data.excerpt_fa - Persian excerpt/description (optional)
 * @param {string} data.content_en - English content (optional, for articles)
 * @param {string} data.content_fa - Persian content (optional, for articles)
 * @returns {Promise<Object>} Generated SEO fields
 */
export async function aiGenerateSEO(data) {
  const authResult = await requireAdminAuth()
  if (authResult.error) {
    return { error: authResult.error, success: false }
  }

  try {
    const { type = 'article' } = data

    // Get user's preset preferences
    const presetsResult = await getUserPresets()

    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    // Use appropriate preset based on type (article, project, etc.)
    let model
    if (type === 'project') {
      model = userPresets.projectGenerator || userPresets.articleGenerator || userPresets.contentRefiner
    } else {
      model = userPresets.articleGenerator || userPresets.contentRefiner
    }

    if (!model) {
      return { error: 'No preset configured for SEO generation. Please set Article Generator or Project Generator preset in AI Settings.', success: false }
    }

    console.log(`[aiGenerateSEO] Using model: ${model} for type: ${type}`)

    // Build content summary for analysis
    let contentSummary = ''
    if (data.title_en) contentSummary += `Title (EN): ${data.title_en}\n`
    if (data.title_fa) contentSummary += `Title (FA): ${data.title_fa}\n`
    if (data.excerpt_en) contentSummary += `Excerpt (EN): ${data.excerpt_en}\n`
    if (data.excerpt_fa) contentSummary += `Excerpt (FA): ${data.excerpt_fa}\n`
    if (data.description_en) contentSummary += `Description (EN): ${data.description_en}\n`
    if (data.description_fa) contentSummary += `Description (FA): ${data.description_fa}\n`

    // For articles, include a truncated version of content
    if (data.content_en) {
      const truncatedContent = data.content_en.replace(/<[^>]*>/g, '').substring(0, 1000)
      contentSummary += `Content Preview (EN): ${truncatedContent}...\n`
    }
    if (data.content_fa) {
      const truncatedContent = data.content_fa.replace(/<[^>]*>/g, '').substring(0, 1000)
      contentSummary += `Content Preview (FA): ${truncatedContent}...\n`
    }

    if (!contentSummary.trim()) {
      return { error: 'No content provided for SEO analysis', success: false }
    }

    const systemPrompt = `You are an SEO expert specializing in creating optimized meta tags for a bilingual (English/Persian) portfolio website.

Analyze the provided content and generate SEO-optimized meta titles and descriptions for BOTH languages.

SEO BEST PRACTICES:
- Meta titles should be 50-60 characters (max 70)
- Meta descriptions should be 150-160 characters (max 170)
- Include primary keywords naturally
- Make titles compelling and click-worthy
- Descriptions should summarize content and include a call-to-action
- For Persian (Farsi), ensure proper RTL considerations in text structure

RESPONSE FORMAT (JSON):
{
  "meta_title_en": "SEO-optimized English title (50-60 chars)",
  "meta_description_en": "Compelling English description (150-160 chars)",
  "meta_title_fa": "SEO-optimized Persian title (50-60 chars)",
  "meta_description_fa": "Compelling Persian description (150-160 chars)"
}

IMPORTANT:
- If English content is provided, generate English SEO fields
- If Persian content is provided, generate Persian SEO fields
- Generate BOTH languages even if only one is provided (translate appropriately)
- Never leave any field empty - always provide all 4 fields`

    const response = await callOpenRouter('/chat/completions', {
      model,
      response_format: { type: 'json_object' },
      maxTokens: 2048, // SEO content is short
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate SEO meta tags for this ${type}:\n\n${contentSummary}` },
      ],
      temperature: 0.7,
    })

    const result = response.choices?.[0]?.message?.content

    if (!result) {
      console.error('Empty SEO AI response:', response)
      return { error: 'No response from AI model. Please try again.', success: false }
    }

    // Parse JSON response with markdown cleanup
    let parsed = {}
    try {
      const cleanedResult = result.replace(/^```json\n?|\n?```$/g, '').trim()
      parsed = typeof cleanedResult === 'string' ? JSON.parse(cleanedResult) : cleanedResult
    } catch (e) {
      console.error('Failed to parse SEO AI response:', e, 'Raw result:', result)
      return { error: 'Failed to parse generated SEO content. The model may have returned an unexpected format.', success: false }
    }

    return { ...parsed, success: true }
  } catch (error) {
    console.error('AI SEO generation error:', error)
    return getActionableError(error)
  }
}
