/**
 * OpenRouter API Client
 * Provides functions for calling OpenRouter API with various LLM models
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://openrouter.ai/api/v1'

/**
 * Make a non-streaming request to OpenRouter
 * @param {string} endpoint - API endpoint (e.g., '/chat/completions')
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
export async function callOpenRouter(endpoint, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${OPENROUTER_SITE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'Content-Type': 'application/json',
        'X-Title': 'hasanshiri.online',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages || [{ role: 'user', content: options.prompt }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: options.stream ?? false,
        ...(options.top_p !== undefined && { top_p: options.top_p }),
        ...(options.top_k !== undefined && { top_k: options.top_k }),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error('OpenRouter API error:', error)
    throw error
  }
}

/**
 * Translate text using OpenRouter
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language code (en, fa, etc.)
 * @param {string} toLang - Target language code (en, fa, etc.)
 * @param {Object} options - Additional options (model, temperature, etc.)
 * @returns {Promise<Object>} Translation result with translated text
 */
export async function translateText(text, fromLang, toLang, options = {}) {
  const systemPrompt = 'You are a professional translator. Translate the following text to ' +
    `${toLang} while preserving all formatting, HTML tags, and technical terms. ` +
    'Only return the translated text without any explanation or additional commentary.'

  return callOpenRouter('/chat/completions', {
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Translate to ${toLang}:\n\nText: ${text}` },
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2048,
  })
}

/**
 * Stream chat completion from OpenRouter
 * @param {Array} messages - Chat messages array
 * @param {Object} options - Stream options (model, temperature, maxTokens)
 * @returns {AsyncGenerator} Stream of response chunks
 */
export async function* streamChatCompletion(messages, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${OPENROUTER_SITE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'Content-Type': 'application/json',
        'X-Title': 'hasanshiri.online',
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        stream: true,
        ...(options.top_p !== undefined && { top_p: options.top_p }),
        ...(options.top_k !== undefined && { top_k: options.top_k }),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`)
    }

    const reader = response.body.getReader()

    try {
      while (true) {
        const { done, delta } = JSON.parse(await reader.read())

        if (done) {
          // Send final chunk if needed
          if (delta?.content) {
            yield delta.content
          }
          break
        }

        if (delta?.content) {
          yield delta.content
        }

        if (delta?.text) {
          yield delta.text
        }
      }
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    console.error('OpenRouter streaming error:', error)
    throw error
  }
}

/**
 * Generate article content using OpenRouter
 * @param {string} topic - Article topic or prompt
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated article content
 */
export async function generateArticleContent(topic, options = {}) {
  const systemPrompt = `You are a professional content writer for a bilingual portfolio website.
Write an article about: ${topic}

The article should include:
- An engaging title (in the target language)
- A compelling excerpt (2-3 sentences)
- Well-structured content with headings, paragraphs, and proper formatting
- SEO-friendly language

Respond with a JSON object containing:
- title_en, title_fa
- excerpt_en, excerpt_fa
- content_en, content_fa
- slug (URL-friendly, based on title)
- meta_title_en, meta_title_fa
- meta_description_en, meta_description_fa

Use appropriate tone for the ${options.tone || 'professional'} audience.`

  return callOpenRouter('/chat/completions', {
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Write an article about: ${topic}` },
    ],
    temperature: options.temperature ?? 1.0,
    max_tokens: options.maxTokens ?? 4000,
    response_format: { type: 'json_object' },
  })
}

/**
 * Refine/improve existing content using OpenRouter
 * @param {string} content - Content to refine
 * @param {string} instructions - Refinement instructions
 * @param {Object} options - Refinement options
 * @returns {Promise<Object>} Refined content
 */
export async function refineContent(content, instructions, options = {}) {
  const systemPrompt = `You are a professional editor. Improve the following content based on the instructions provided.
Focus on: clarity, grammar, flow, tone, and engagement.
Preserve HTML formatting and structure.
Make minimal changes - only improve what needs improvement.

Instructions: ${instructions}

Respond with the refined content only, maintaining the original structure and formatting.`

  return callOpenRouter('/chat/completions', {
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Refine the following content:\n\n${content}\n\nInstructions: ${instructions}` },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
  })
}

// Note: Models are now configured via OpenRouter web dashboard
// Users create and manage presets at: https://openrouter.ai/presets
// Presets are referenced using @preset/ syntax (e.g., @preset/translate-fast)
// No hardcoded model list - use UI-configurable presets instead
