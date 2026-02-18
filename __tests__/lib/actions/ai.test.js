/**
 * Tests for AI Actions
 *
 * These tests focus on key behaviors:
 * - Authentication requirements
 * - Preset key resolution (articleGenerator, projectGenerator, contentRefiner)
 * - Error handling
 */
import {
  aiTranslate,
  aiGenerateContent,
  aiGenerateArticle,
  aiTranslateAll,
  aiGenerateProject,
  aiRefineContent,
  getUserPresets,
  updateUserPresets,
} from '@/lib/actions/ai'
import { createClient } from '@/lib/supabase/server'
import { callOpenRouter, validatePresetSlug } from '@/lib/openrouter'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/openrouter', () => ({
  callOpenRouter: jest.fn(),
  validatePresetSlug: jest.fn(),
  getPresetExamples: jest.fn(() => []),
}))

describe('AI Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    callOpenRouter.mockResolvedValue({
      choices: [{ message: { content: 'Test response' } }],
    })
    // Default mock for validatePresetSlug
    validatePresetSlug.mockImplementation((preset) => {
      if (!preset) return { valid: false, error: 'Empty preset' }
      if (preset.startsWith('@preset/') || preset.includes('/')) {
        return { valid: true, error: null }
      }
      return { valid: false, error: 'Invalid preset format' }
    })
  })

  describe('Authentication', () => {
    it('returns error when no user is authenticated', async () => {
      createClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
        from: jest.fn(),
      })

      const result = await aiTranslate({ direction: 'en2fa', title_en: 'Test' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication required')
    })

    it('returns error when user is not admin', async () => {
      createClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-id' } },
            error: null,
          }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
            })),
          })),
        })),
      })

      const result = await aiTranslate({ direction: 'en2fa', title_en: 'Test' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Admin access required')
    })
  })

  describe('Preset Key Resolution', () => {
    // Helper to create a fully mocked admin client with presets
    const createAdminClientWithPresets = (presets = {}) => {
      return {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'admin-id' } },
            error: null,
          }),
        },
        from: jest.fn((table) => {
          if (table === 'profiles') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
                })),
              })),
            }
          }
          // user_ai_presets table
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { presets: JSON.stringify(presets) },
                  error: null,
                }),
              })),
            })),
          }
        }),
      }
    }

    it('aiTranslate uses translateFast preset key', async () => {
      createClient.mockResolvedValue(createAdminClientWithPresets({
        translateFast: '@preset/translate-fast',
      }))
      callOpenRouter.mockResolvedValue({
        choices: [{ message: { content: 'Translated' } }],
      })

      await aiTranslate({ direction: 'en2fa', title_en: 'Hello' })

      expect(callOpenRouter).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: '@preset/translate-fast',
        })
      )
    })

    it('aiGenerateContent uses articleGenerator preset key', async () => {
      createClient.mockResolvedValue(createAdminClientWithPresets({
        articleGenerator: '@preset/article-generator',
      }))
      callOpenRouter.mockResolvedValue({
        choices: [{ message: { content: '{"title_en": "Test"}' } }],
      })

      await aiGenerateContent({ topic: 'Test', targetLang: 'en' })

      expect(callOpenRouter).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: '@preset/article-generator',
        })
      )
    })

    it('aiGenerateArticle uses articleGenerator preset key', async () => {
      createClient.mockResolvedValue(createAdminClientWithPresets({
        articleGenerator: '@preset/article-generator',
      }))
      callOpenRouter.mockResolvedValue({
        choices: [{ message: { content: '{"title_en": "Test"}' } }],
      })

      await aiGenerateArticle({ topic: 'Test' })

      expect(callOpenRouter).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: '@preset/article-generator',
        })
      )
    })

    it('aiGenerateProject uses projectGenerator preset key', async () => {
      createClient.mockResolvedValue(createAdminClientWithPresets({
        projectGenerator: '@preset/project-generator',
      }))
      callOpenRouter.mockResolvedValue({
        choices: [{ message: { content: '{"title_en": "Test"}' } }],
      })

      await aiGenerateProject({ prompt: 'Test' })

      expect(callOpenRouter).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: '@preset/project-generator',
        })
      )
    })

    it('aiRefineContent uses contentRefiner preset key', async () => {
      createClient.mockResolvedValue(createAdminClientWithPresets({
        contentRefiner: '@preset/content-refiner',
      }))
      callOpenRouter.mockResolvedValue({
        choices: [{ message: { content: 'Refined' } }],
      })

      await aiRefineContent({ content: 'Original', instructions: 'Improve' })

      expect(callOpenRouter).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: '@preset/content-refiner',
        })
      )
    })

    it('returns error when no preset is configured', async () => {
      createClient.mockResolvedValue(createAdminClientWithPresets({}))

      const result = await aiTranslate({ direction: 'en2fa', title_en: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('No translation preset configured')
    })
  })

  describe('aiTranslateAll', () => {
    const createAdminClientForTranslateAll = (presets = {}) => {
      return {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'admin-id' } },
            error: null,
          }),
        },
        from: jest.fn((table) => {
          if (table === 'profiles') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
                })),
              })),
            }
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { presets: JSON.stringify(presets) },
                  error: null,
                }),
              })),
            })),
          }
        }),
      }
    }

    it('uses translateFast preset and handles batch translation', async () => {
      createClient.mockResolvedValue(createAdminClientForTranslateAll({
        translateFast: '@preset/translate-fast',
      }))
      callOpenRouter.mockResolvedValue({
        choices: [{
          message: {
            content: '[LABEL]title[/LABEL]\nTranslated\n\n[LABEL]description[/LABEL]\nDesc'
          }
        }],
      })

      const result = await aiTranslateAll({
        fields: { title_en: 'Title', description_en: 'Description' },
        direction: 'en2fa',
      })

      expect(result.success).toBe(true)
      expect(callOpenRouter).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: '@preset/translate-fast',
        })
      )
    })
  })

  describe('updateUserPresets', () => {
    it('validates preset format and rejects invalid formats', async () => {
      createClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'admin-id' } },
            error: null,
          }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            })),
          })),
        })),
      })

      const result = await updateUserPresets({
        translateFast: 'invalid-no-prefix',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid preset format')
    })

    it('accepts valid @preset/ format', async () => {
      createClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'admin-id' } },
            error: null,
          }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest
                .fn()
                .mockResolvedValueOnce({ data: { role: 'admin' }, error: null })
                .mockResolvedValueOnce({ data: null, error: null }),
            })),
          })),
          insert: jest.fn().mockResolvedValue({ error: null }),
        })),
      })

      const result = await updateUserPresets({
        translateFast: '@preset/translate-fast',
      })

      expect(result.success).toBe(true)
    })

    it('accepts valid provider/model format', async () => {
      createClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'admin-id' } },
            error: null,
          }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest
                .fn()
                .mockResolvedValueOnce({ data: { role: 'admin' }, error: null })
                .mockResolvedValueOnce({ data: null, error: null }),
            })),
          })),
          insert: jest.fn().mockResolvedValue({ error: null }),
        })),
      })

      const result = await updateUserPresets({
        translateFast: 'openai/gpt-4o-mini',
      })

      expect(result.success).toBe(true)
    })
  })
})
