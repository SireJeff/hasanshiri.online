/**
 * OpenRouter API Client
 * Provides functions for calling OpenRouter API with various LLM models
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://openrouter.ai/api/v1'

// Import error classes
import {
  OpenRouterError,
  PresetNotFoundError,
  PresetValidationError,
  AuthenticationError,
  RateLimitError,
  StreamParseError,
  NetworkError,
} from '@/lib/errors/openrouter-errors'
import { parseSSEChunks } from '@/lib/utils/streaming'

/**
 * Make a non-streaming request to OpenRouter
 * @param {string} endpoint - API endpoint (e.g., '/chat/completions')
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
export async function callOpenRouter(endpoint, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new AuthenticationError({
      hint: 'Add OPENROUTER_API_KEY to your environment variables'
    })
  }

  // Debug: Log the model being used
  console.log('OpenRouter request - model:', options.model, 'endpoint:', endpoint)

  // 30 second timeout for API calls
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  let response
  try {
    response = await fetch(`${OPENROUTER_SITE_URL}${endpoint}`, {
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
      signal: controller.signal,
    })
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new NetworkError(new Error('Request timed out after 30 seconds'), {
        details: { endpoint, options }
      })
    }
    throw new NetworkError(error, {
      details: { endpoint, options }
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('OpenRouter error response:', response.status, errorData)
    throw OpenRouterError.fromResponse(response, errorData)
  }

  const data = await response.json()
  console.log('OpenRouter success - response has choices:', !!data.choices, 'content length:', data.choices?.[0]?.message?.content?.length || 0)
  return data
}

// Helper to create error from HTTP response
OpenRouterError.fromResponse = function(response, errorData) {
  const status = response.status
  const errorMessage = errorData.error?.message || response.statusText

  // Map common HTTP errors to specific types
  if (status === 401) {
    return new AuthenticationError({ apiError: errorMessage })
  }

  if (status === 429) {
    return new RateLimitError({ apiError: errorMessage })
  }

  if (status === 404) {
    const model = errorData.error?.message || 'unknown'
    return new PresetNotFoundError(model, { apiError: errorMessage })
  }

  // Generic API error
  return new OpenRouterError(
    `OpenRouter API error: ${errorMessage}`,
    'API_ERROR',
    { statusCode: status, apiError: errorMessage }
  )
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
 * Stream chat completion from OpenRouter (FIXED)
 * @param {Array} messages - Chat messages array
 * @param {Object} options - Stream options (model, temperature, maxTokens)
 * @returns {AsyncGenerator} Stream of response chunks
 */
export async function* streamChatCompletion(messages, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new AuthenticationError()
  }

  let response
  try {
    response = await fetch(`${OPENROUTER_SITE_URL}/chat/completions`, {
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
  } catch (error) {
    throw new NetworkError(error, { endpoint: '/chat/completions' })
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw OpenRouterError.fromResponse(response, errorData)
  }

  try {
    let fullContent = ''

    // Use proper SSE parsing
    for await (const chunk of parseSSEChunks(response.body, {
      onError: (error) => {
        console.error('SSE parse error:', error)
        throw new StreamParseError(error)
      }
    })) {
      // Extract content from OpenRouter format
      // OpenRouter returns: { id, choices: [{ delta: { content } }] }
      if (chunk.choices?.[0]?.delta?.content) {
        const content = chunk.choices[0].delta.content
        fullContent += content
        yield content
      }

      // Handle finish reason
      if (chunk.choices?.[0]?.finish_reason) {
        break
      }
    }

    return { fullContent }
  } catch (error) {
    if (error instanceof StreamParseError || error instanceof NetworkError) {
      throw error
    }
    throw new StreamParseError(error)
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

/**
 * Validate a preset slug format
 * Does NOT check if preset exists - only validates format
 * @param {string} preset - Preset slug to validate
 * @returns {Object} Validation result with { valid, error, suggestion }
 */
export function validatePresetSlug(preset) {
  if (!preset || typeof preset !== 'string') {
    return {
      valid: false,
      error: 'Preset cannot be empty',
      suggestion: null,
    };
  }

  const trimmed = preset.trim()

  // Check format: @preset/name or direct model id
  if (!trimmed.startsWith('@preset/')) {
    // Direct model ID (provider/model-name)
    if (trimmed.includes('/')) {
      return {
        valid: true,
        error: null,
        suggestion: null,
      };
    }
    return {
      valid: false,
      error: 'Invalid preset format',
      suggestion: 'Use format: @preset/your-preset-name or provider/model-name',
    };
  }

  // Extract preset name
  const presetName = trimmed.slice(8); // Remove '@preset/'

  if (!presetName) {
    return {
      valid: false,
      error: 'Preset name cannot be empty',
      suggestion: 'Example: @preset/translate-fast',
    };
  }

  // Check for valid characters (letters, numbers, hyphen, underscore)
  if (!/^[a-zA-Z0-9-_]+$/.test(presetName)) {
    return {
      valid: false,
      error: 'Preset name contains invalid characters',
      suggestion: 'Use only letters, numbers, hyphens, and underscores',
    };
  }

  return {
    valid: true,
    error: null,
    suggestion: null,
  };
}

/**
 * Validate a preset exists on OpenRouter before using it
 * @param {string} presetSlug - The preset slug (e.g., '@preset/translate-fast')
 * @returns {Promise<Object>} Validation result
 */
export async function validatePreset(presetSlug) {
  if (!OPENROUTER_API_KEY) {
    throw new AuthenticationError();
  }

  if (!presetSlug?.startsWith('@preset/')) {
    throw new PresetValidationError(presetSlug, [
      'Preset slug must start with @preset/'
    ]);
  }

  try {
    // Make a minimal request to validate preset exists
    const response = await fetch(`${OPENROUTER_SITE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'Content-Type': 'application/json',
        'X-Title': 'hasanshiri.online',
      },
      body: JSON.stringify({
        model: presetSlug,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1, // Minimal token usage
      }),
    });

    if (response.status === 404) {
      throw new PresetNotFoundError(presetSlug);
    }

    if (response.status === 401) {
      throw new AuthenticationError();
    }

    if (!response.ok) {
      const error = await response.json();
      if (error.error?.message?.includes('preset')) {
        throw new PresetNotFoundError(presetSlug, {
          apiError: error.error?.message
        });
      }
      throw new PresetValidationError(presetSlug, [
        error.error?.message || 'Unknown validation error'
      ]);
    }

    return { valid: true, preset: presetSlug };
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof PresetNotFoundError ||
        error instanceof PresetValidationError ||
        error instanceof AuthenticationError ||
        error instanceof NetworkError) {
      throw error;
    }

    // Wrap unknown errors
    throw new PresetValidationError(presetSlug, [
      error?.message || 'Unknown validation error'
    ]);
  }
}

/**
 * Helper to get common preset examples for users
 * @returns {Object} Example presets with descriptions
 */
export function getPresetExamples() {
  return {
    translateFast: {
      slug: '@preset/translate-fast',
      description: 'Fast translation for UI strings, simple text',
      suggestedModel: 'google/gemma-3-35b-it:free',
    },
    translateBalanced: {
      slug: '@preset/translate-balanced',
      description: 'Quality translation for articles, content',
      suggestedModel: 'meta-llama/llama-3.1-70b-instruct:free',
    },
    generate: {
      slug: '@preset/article-generator',
      description: 'Generate new articles from topics',
      suggestedModel: 'anthropic/claude-3.5-sonnet:free',
    },
    refine: {
      slug: '@preset/content-refiner',
      description: 'Improve and refine existing content',
      suggestedModel: 'meta-llama/llama-3.1-70b-instruct:free',
    },
  };
}

// Note: Models are now configured via OpenRouter web dashboard
// Users create and manage presets at: https://openrouter.ai/presets
// Presets are referenced using @preset/ syntax (e.g., @preset/translate-fast)
// No hardcoded model list - use UI-configurable presets instead
