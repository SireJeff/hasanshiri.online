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
  syncGitHubProjects,
  getProjectTags,
} from '../projects'

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
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
        },
        {
          id: '2',
          title_en: 'Project B',
          status: 'active',
          is_featured: false,
        },
      ]

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockProjects, error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getProjects()

      expect(result).toEqual({ projects: mockProjects, error: null })
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'active')
    })

    it('should filter by status when provided', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      await getProjects({ status: 'draft' })

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'draft')
    })
  })

  describe('getProjectBySlug', () => {
    it('should return project by slug', async () => {
      const mockProject = {
        id: '1',
        slug: 'my-project',
        title_en: 'My Project',
      }

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProject, error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getProjectBySlug('my-project')

      expect(result).toEqual({ project: mockProject, error: null })
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

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'new-id', ...newProject },
          error: null,
        }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await createProject(newProject)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
    })
  })

  describe('syncGitHubProjects', () => {
    it('should sync projects from GitHub API', async () => {
      const mockRepoData = {
        id: 12345,
        name: 'test-repo',
        description: 'A test repository',
        html_url: 'https://github.com/user/test-repo',
        stargazers_count: 42,
        forks_count: 10,
        language: 'TypeScript',
      }

      const mockSettings = {
        settings: {
          get: jest.fn().mockReturnValue('testuser'),
        },
      }

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ id: 'proj1', github_repo_name: 'user/test-repo' }],
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }
      createClient.mockResolvedValue(mockSupabase)

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRepoData,
      })

      // Mock getSiteSettings
      jest.doMock('../settings', () => ({
        getSiteSettings: jest.fn().mockResolvedValue(mockSettings),
      }))

      const result = await syncGitHubProjects('test-token')

      expect(result).toHaveProperty('synced')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.github.com'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('should handle GitHub API errors', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      })

      const result = await syncGitHubProjects('invalid-token')

      expect(result).toHaveProperty('error')
    })
  })

  describe('getProjectTags', () => {
    it('should return all tags', async () => {
      const mockTags = [
        { id: '1', name_en: 'React', name_fa: 'ری‌اکت' },
        { id: '2', name_en: 'Node.js', name_fa: 'نود.جی‌اس' },
      ]

      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockTags, error: null }),
      }
      createClient.mockResolvedValue(mockSupabase)

      const result = await getProjectTags()

      expect(result).toEqual({ tags: mockTags, error: null })
    })
  })
})
