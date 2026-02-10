/**
 * Projects Actions Tests
 *
 * Tests for projects CRUD operations, GitHub sync, and tag management
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  getProjects,
  getProjectBySlug,
  createProject,
  // updateProject, - Not yet tested
  // deleteProject, - Not yet tested
  // eslint-disable-next-line no-unused-vars -- GitHub sync tests skipped (require complex external API mocking)
  syncGitHubProjects,
  getProjectTags,
} from '../projects'

// Mock Supabase server client (correct path for server actions)
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createAdminClient: jest.fn(),
  createStaticClient: jest.fn(),
}))

describe('Projects Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock fetch for GitHub API calls
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getProjects', () => {
    it('should return active projects by default', async () => {
      const mockProjects = [
        {
          id: '1',
          title_en: 'Project A',
          status: 'active',
          is_featured: true,
          project_tags: [],
        },
        {
          id: '2',
          title_en: 'Project B',
          status: 'active',
          is_featured: false,
          project_tags: [],
        },
      ]

      const { createClient } = await import('@/lib/supabase/server')
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        then: jest.fn((resolve) => resolve({ data: mockProjects, error: null })),
      }
      const mockSupabase = {
        from: jest.fn(() => mockQueryBuilder),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getProjects()

      expect(result).toEqual(mockProjects.map(p => ({ ...p, tags: [], project_tags: undefined })))
      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
    })

    it('should filter by status when provided', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        then: jest.fn((resolve) => resolve({ data: [], error: null })),
      }
      const mockSupabase = {
        from: jest.fn(() => mockQueryBuilder),
      }
      createClient.mockResolvedValue(mockSupabase)

      await getProjects({ status: 'draft' })

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('status', 'draft')
    })
  })

  describe('getProjectBySlug', () => {
    it('should return project by slug', async () => {
      const mockProject = {
        id: '1',
        slug: 'my-project',
        title_en: 'My Project',
        project_tags: [],
      }

      const { createClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProject, error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getProjectBySlug('my-project')

      expect(result.project).toBeDefined()
      expect(result.project.slug).toBe('my-project')
      expect(mockSupabase.eq).toHaveBeenCalledWith('slug', 'my-project')
    })
  })

  describe('createProject', () => {
    it('should create a new project with tags', async () => {
      const newProject = {
        title_en: 'New Project',
        slug: 'new-project',
        tag_ids: ['tag1', 'tag2'],
      }

      const { createClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'new-id', ...newProject },
          error: null,
        }),
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await createProject(newProject)

      expect(result.error).toBeUndefined()
      expect(result.project).toBeDefined()
    })
  })

  describe('syncGitHubProjects', () => {
    // Skip these tests - they require complex mocking of external GitHub API
    // and multiple Supabase queries. These tests should be run in integration tests.
    it.skip('should sync projects from GitHub API', async () => {
      // Test implementation requires GitHub API mocking and settings service
    })

    it.skip('should handle GitHub API errors', async () => {
      // Test implementation requires GitHub API error mocking
    })
  })

  describe('getProjectTags', () => {
    it('should return all tags', async () => {
      const mockTags = [
        { id: '1', name_en: 'React', name_fa: 'ری‌اکت' },
        { id: '2', name_en: 'Node.js', name_fa: 'نود.جی‌اس' },
      ]

      const { createClient } = await import('@/lib/supabase/server')
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve({ data: mockTags, error: null })),
      }
      const mockSupabase = {
        from: jest.fn(() => mockQueryBuilder),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getProjectTags()

      expect(result).toEqual(mockTags)
    })
  })
})
