/**
 * Skills Actions Tests
 *
 * Tests for skills CRUD operations and category management
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  getSkills,
  getSkillsGroupedByCategory,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillCategories,
} from '../skills'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('Skills Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSkills', () => {
    it('should return skills with category information', async () => {
      const mockSkills = [
        {
          id: '1',
          name_en: 'Python',
          name_fa: 'پایتون',
          proficiency_level: 85,
          category: { id: 'cat1', name_en: 'Programming', color: '#3b82f6' },
        },
      ]

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockSkills, error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getSkills()

      expect(result).toEqual({ skills: mockSkills, error: null })
      expect(mockSupabase.from).toHaveBeenCalledWith('skills')
    })

    it('should handle errors gracefully', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getSkills()

      expect(result.error).toBeTruthy()
      expect(result.skills).toEqual([])
    })
  })

  describe('getSkillsGroupedByCategory', () => {
    it('should group skills by category', async () => {
      const mockSkills = [
        {
          id: '1',
          name_en: 'Python',
          category_id: 'cat1',
          category: { id: 'cat1', name_en: 'Programming', sort_order: 1 },
        },
        {
          id: '2',
          name_en: 'JavaScript',
          category_id: 'cat1',
          category: { id: 'cat1', name_en: 'Programming', sort_order: 1 },
        },
        {
          id: '3',
          name_en: 'Data Analysis',
          category_id: 'cat2',
          category: { id: 'cat2', name_en: 'Data Science', sort_order: 2 },
        },
      ]

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockSkills, error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getSkillsGroupedByCategory()

      expect(result).toHaveLength(2)
      expect(result[0].category.name_en).toBe('Programming')
      expect(result[0].skills).toHaveLength(2)
      expect(result[1].category.name_en).toBe('Data Science')
      expect(result[1].skills).toHaveLength(1)
    })

    it('should handle uncategorized skills', async () => {
      const mockSkills = [
        {
          id: '1',
          name_en: 'Custom Skill',
          category_id: null,
          category: null,
        },
      ]

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockSkills, error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getSkillsGroupedByCategory()

      expect(result).toHaveLength(1)
      expect(result[0].category).toBeDefined()
    })
  })

  describe('createSkill', () => {
    it('should create a new skill', async () => {
      const newSkill = {
        name_en: 'React',
        name_fa: 'ری‌اکت',
        proficiency_level: 80,
        category_id: 'cat1',
      }

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'new-id', ...newSkill },
          error: null,
        }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await createSkill(newSkill)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(mockSupabase.from).toHaveBeenCalledWith('skills')
    })
  })

  describe('updateSkill', () => {
    it('should update an existing skill', async () => {
      const skillId = 'skill-1'
      const updates = { proficiency_level: 90 }

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: skillId, ...updates },
          error: null,
        }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await updateSkill(skillId, updates)

      expect(result.error).toBeNull()
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', skillId)
    })
  })

  describe('deleteSkill', () => {
    it('should delete a skill', async () => {
      const skillId = 'skill-1'

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await deleteSkill(skillId)

      expect(result.error).toBeNull()
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', skillId)
    })
  })
})
