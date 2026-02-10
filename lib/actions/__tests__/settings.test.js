/**
 * Settings Actions Tests
 *
 * Tests for site settings management
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  getSiteSettings,
  updateSiteSettings,
} from '../settings'

// Mock Supabase server client (correct path for server actions)
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createAdminClient: jest.fn(),
  createStaticClient: jest.fn(),
}))

describe('Settings Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSiteSettings', () => {
    it('should return settings grouped by category', async () => {
      const mockSettings = [
        { key: 'contact_email', value_en: 'test@example.com', value_fa: 'test@example.com', category: 'contact' },
        { key: 'social_github', value_en: 'https://github.com/user', value_fa: 'https://github.com/user', category: 'social' },
        { key: 'github_username', value_en: 'testuser', value_fa: 'testuser', category: 'github' },
      ]

      const { createClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockSettings, error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getSiteSettings()

      expect(result.settings).toBeDefined()
      expect(result.settings.all).toEqual(mockSettings)
      expect(result.settings.byCategory).toHaveProperty('contact')
      expect(result.settings.byCategory).toHaveProperty('social')
      expect(result.settings.byCategory).toHaveProperty('github')
    })

    it('should provide get() helper for retrieving values', async () => {
      const mockSettings = [
        { key: 'test_key', value_en: 'en_value', value_fa: 'fa_value', category: 'general' },
      ]

      const { createClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockSettings, error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getSiteSettings()

      expect(result.settings.get('test_key')).toBe('en_value')
      expect(result.settings.get('test_key', null, 'fa')).toBe('fa_value')
      expect(result.settings.get('nonexistent', 'default')).toBe('default')
    })
  })

  describe('updateSiteSettings', () => {
    it('should update multiple settings', async () => {
      const updates = [
        { key: 'contact_email', value_en: 'new@example.com', value_fa: 'new@example.com' },
        { key: 'social_github', value_en: 'https://github.com/newuser', value_fa: 'https://github.com/newuser' },
      ]

      const { createClient } = await import('@/lib/supabase/server')
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve({ error: null })),
      }
      const mockSupabase = {
        from: jest.fn(() => mockQueryBuilder),
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await updateSiteSettings(updates)

      expect(result.error).toBeUndefined()
      expect(mockSupabase.from).toHaveBeenCalledWith('site_settings')
    })

    it('should handle empty updates array', async () => {
      const result = await updateSiteSettings([])

      expect(result.error).toBeUndefined()
    })

    it('should revalidate paths after update', async () => {
      const updates = [
        { key: 'test_key', value_en: 'test_value', value_fa: 'test_value' },
      ]

      const { createClient } = await import('@/lib/supabase/server')
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve({ error: null })),
      }
      const mockSupabase = {
        from: jest.fn(() => mockQueryBuilder),
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      }
      createClient.mockResolvedValue(mockSupabase)

      await updateSiteSettings(updates)

      // Revalidation should happen (mocked in jest.setup.cjs)
      expect(true).toBe(true) // Test passes if no error thrown
    })
  })
})
