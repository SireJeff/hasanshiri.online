'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createProject, updateProject, getProjectTags } from '@/lib/actions/projects'
import { LanguageTabs } from '@/components/admin/shared/language-tabs'
import { BilingualAIField } from '@/components/admin/shared/BilingualAIField'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { ArrowLeft, Save, Loader2, Github as GithubIcon, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// Dynamic import for TipTap to avoid SSR issues
const TipTapEditor = dynamic(
  () => import('@/components/editor/TipTapEditor').then(mod => mod.TipTapEditor),
  {
    ssr: false,
    loading: () => <div className="border border-border rounded-lg bg-card animate-pulse min-h-[500px]" />,
  }
)

export function ProjectForm({ tags, project, mode = 'create' }) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('en')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  // Tag management state
  const [allTags, setAllTags] = useState(tags || [])
  const [selectedTagIds, setSelectedTagIds] = useState(project?.tag_ids || [])

  // Form state
  const [formData, setFormData] = useState({
    title_en: project?.title_en || '',
    title_fa: project?.title_fa || '',
    description_en: project?.description_en || '',
    description_fa: project?.description_fa || '',
    long_description_en: project?.long_description_en || '',
    long_description_fa: project?.long_description_fa || '',
    demo_url: project?.demo_url || '',
    github_url: project?.github_url || '',
    docs_url: project?.docs_url || '',
    featured_image: project?.featured_image || '',
    github_repo_name: project?.github_repo_name || '',
    auto_sync: project?.auto_sync || false,
    status: project?.status || 'active',
    is_featured: project?.is_featured || false,
    sort_order: project?.sort_order || 0,
  })

  // Load all tags
  useEffect(() => {
    async function loadTags() {
      const { tags: loadedTags } = await getProjectTags()
      setAllTags(loadedTags || [])
    }
    loadTags()
  }, [tags])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }))
  }

  // Handle TipTap editor content change
  const handleContentChange = (locale, content) => {
    setFormData(prev => ({
      ...prev,
      [`long_description_${locale}`]: content
    }))
  }

  // Toggle tag selection
  const toggleTag = (tagId) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }

  // Auto-fill GitHub repo details
  const handleAutoFillGitHub = async () => {
    const repoName = formData.github_repo_name.trim()
    if (!repoName) {
      setMessage({ type: 'error', text: 'Please enter a GitHub repository name (e.g., "username/repo-name")' })
      return
    }

    try {
      // Normalize input - handle various formats
      let normalizedRepo = repoName

      // Remove GitHub URL prefix if present
      if (normalizedRepo.includes('github.com/')) {
        const parts = normalizedRepo.split('github.com/')
        normalizedRepo = parts[parts.length - 1]
      }

      // Remove leading slash if present
      normalizedRepo = normalizedRepo.replace(/^\/+/, '')

      // Remove .git suffix if present
      normalizedRepo = normalizedRepo.replace(/\.git$/, '')

      // Extract owner and repo
      const parts = normalizedRepo.split('/')
      const [owner, repo] = parts

      if (!owner || !repo || parts.length > 2) {
        throw new Error('Invalid GitHub repository format. Use "username/repo-name" format (e.g., "facebook/react")')
      }

      // Validate owner and repo don't contain invalid characters
      const validFormat = /^[a-zA-Z0-9_.-]+$/
      if (!validFormat.test(owner) || !validFormat.test(repo)) {
        throw new Error('Invalid repository name. Use only letters, numbers, hyphens, underscores, and dots.')
      }

      // Fetch from GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository "${owner}/${repo}" not found. Check the name and try again.`)
        }
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      const repoData = await response.json()

      // Auto-fill form fields
      setFormData(prev => ({
        ...prev,
        title_en: repoData.name || prev.title_en,
        title_fa: repoData.name || prev.title_fa,
        description_en: repoData.description || prev.description_en,
        description_fa: repoData.description || prev.description_fa,
        github_url: repoData.html_url || prev.github_url,
      }))

      setMessage({
        type: 'success',
        text: `Successfully loaded data from GitHub: ${repoData.full_name}`
      })
    } catch (error) {
      console.error('GitHub API error:', error)
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const submitData = {
        ...formData,
        tag_ids: selectedTagIds,
      }

      if (mode === 'create') {
        const result = await createProject(submitData)
        if (result.error) {
          throw new Error(result.error)
        }
      } else {
        const result = await updateProject(project.id, submitData)
        if (result.error) {
          throw new Error(result.error)
        }
      }

      toast({
        title: mode === 'create' ? 'Project created' : 'Project updated',
        description: mode === 'create' ? 'Your new project has been added successfully.' : 'The project has been updated successfully.',
      })
      router.push('/admin/projects')
      router.refresh()
    } catch (error) {
      console.error('Error saving project:', error)
      toast({
        title: 'Error',
        description: mode === 'create' ? 'Failed to create project' : 'Failed to update project',
      })
    }
  } finally {
    setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {project ? 'Edit Project' : 'New Project'}
            </h1>
            {project && (
              <p className="text-sm text-muted-foreground">/{project.slug}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSubmitting ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {mode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={cn(
            'p-4 rounded-lg',
            message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
          )}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Tabs */}
        <LanguageTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Project Title Fields */}
        <BilingualAIField
          label="Project Title"
          activeTab={activeTab}
          nameEn="title_en"
          nameFa="title_fa"
          valueEn={formData.title_en}
          valueFa={formData.title_fa}
          onChangeEn={(val) => setFormData(prev => ({ ...prev, title_en: val }))}
          onChangeFa={(val) => setFormData(prev => ({ ...prev, title_fa: val }))}
          required={true}
          enableTranslate={true}
          enableRefine={false}
        />

        {/* Short Description Fields */}
        <BilingualAIField
          label="Short Description"
          activeTab={activeTab}
          nameEn="description_en"
          nameFa="description_fa"
          valueEn={formData.description_en}
          valueFa={formData.description_fa}
          onChangeEn={(val) => setFormData(prev => ({ ...prev, description_en: val }))}
          onChangeFa={(val) => setFormData(prev => ({ ...prev, description_fa: val }))}
          type="textarea"
          rows={2}
          placeholderEn="Brief description for project cards..."
          placeholderFa="توضیح کوتاه درباره پروژه..."
          enableTranslate={true}
          enableRefine={false}
        />

        {/* Long Description - TipTap Editor */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Long Description ({activeTab === 'en' ? 'English' : 'فارسی'})
          </label>
          <div className="min-h-[200px] border border-border rounded-lg overflow-hidden">
            <TipTapEditor
              content={formData[`long_description_${activeTab}`] || ''}
              onChange={handleContentChange}
              editable={true}
              placeholder="Write detailed project description here..."
            />
          </div>
        </div>

        {/* URLs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Demo URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Demo URL
            </label>
            <div className="relative">
              <input
                type="url"
                name="demo_url"
                value={formData.demo_url}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
              {formData.demo_url && (
                <a
                  href={formData.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>

          {/* GitHub URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              GitHub URL
            </label>
            <div className="relative">
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          {/* Documentation URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Documentation URL
            </label>
            <div className="relative">
              <input
                type="url"
                name="docs_url"
                value={formData.docs_url}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* GitHub Integration */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <GithubIcon size={16} />
              GitHub Integration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Repository Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="github_repo_name"
                    value={formData.github_repo_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="username/repo-name"
                  />
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="button"
                    onClick={handleAutoFillGitHub}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm"
                    title="Auto-fill from GitHub"
                  >
                    Fetch from GitHub
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="auto_sync"
                    id="auto_sync"
                    checked={formData.auto_sync}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">
                    Enable daily auto-sync
                  </span>
                </label>
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                When auto-sync is enabled, projects marked with "Enable daily auto-sync" will have their GitHub data (stars, forks, language) updated automatically via a scheduled cron job.
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full transition-colors",
                    selectedTagIds.includes(tag.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                  >
                  {tag.name_en}
                </button>
              ))}
              {allTags.length === 0 && (
                <p className="text-sm text-muted-foreground">No tags available</p>
              )}
            </div>
          </div>

          {/* Status and Featured */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">
                    Featured project
                  </span>
                </label>
              </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                Display Order
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
            </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-opacity disabled:opacity-50"
              >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {mode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}