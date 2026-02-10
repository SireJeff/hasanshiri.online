'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Github as GithubIcon, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createProject, updateProject, getProjectTags } from '@/lib/actions/projects'
import { LanguageTabs, BilingualField } from '@/components/admin/shared/language-tabs'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Dynamic imports for components that shouldn't be SSR
const TipTapEditor = dynamic(() => import('@/components/editor/TipTapEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-secondary/20 animate-pulse rounded-lg" />
})

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
      // Normalize the input - handle various formats:
      // - https://github.com/username/repo
      // - github.com/username/repo
      // - username/repo
      let normalizedRepo = repoName

      // Remove GitHub URL prefix if present
      if (normalizedRepo.includes('github.com/')) {
        const parts = normalizedRepo.split('github.com/')
        normalizedRepo = parts[parts.length - 1]
      }

      // Remove leading slash if present
      normalizedRepo = normalizedRepo.replace(/^\/+/, '')

      // Remove trailing slash if present
      normalizedRepo = normalizedRepo.replace(/\/+$/, '')

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
        github_repo_name: `${owner}/${repo}`, // Store normalized format
        title_en: repoData.name || prev.title_en,
        description_en: repoData.description || prev.description_en,
        github_url: repoData.html_url || prev.github_url,
        demo_url: repoData.homepage || prev.demo_url,
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
        slug: formData.title_en.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
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
        description: mode === 'create'
          ? 'Your new project has been added successfully.'
          : 'The project has been updated successfully.',
      })

      router.push('/admin/projects')
      router.refresh()
    } catch (error) {
      console.error('Error saving project:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

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

        {/* Title Fields */}
        <BilingualField
          label="Project Title"
          activeTab={activeTab}
          nameEn="title_en"
          nameFa="title_fa"
          valueEn={formData.title_en}
          valueFa={formData.title_fa}
          onChangeEn={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
          onChangeFa={(e) => setFormData(prev => ({ ...prev, title_fa: e.target.value }))}
          placeholderEn="e.g., My Awesome Project"
          placeholderFa="مثلاً: پروژه فوق‌العاده من"
          required
        />

        {/* Short Description Fields */}
        <BilingualField
          label="Short Description"
          activeTab={activeTab}
          nameEn="description_en"
          nameFa="description_fa"
          valueEn={formData.description_en}
          valueFa={formData.description_fa}
          onChangeEn={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
          onChangeFa={(e) => setFormData(prev => ({ ...prev, description_fa: e.target.value }))}
          type="textarea"
          rows={2}
          placeholderEn="Brief description for project cards..."
          placeholderFa="توضیح کوت برای کارت پروژه..."
        />

        {/* Long Description - TipTap Editor */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Long Description ({activeTab === 'en' ? 'English' : 'فارسی'})
          </label>
          <div className="min-h-[200px] border border-border rounded-lg overflow-hidden">
            <TipTapEditor
              content={formData[`long_description_${activeTab}`] || ''}
              onChange={(content) => handleContentChange(activeTab, content)}
              editable={true}
              placeholder="Write detailed project description here..."
            />
          </div>
        </div>

        {/* URLs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Documentation URL
            </label>
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
              <input
                type="text"
                name="github_repo_name"
                value={formData.github_repo_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="username/repo-name"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: username/repository-name
              </p>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAutoFillGitHub}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/70 transition-colors text-sm"
              >
                Auto-fill from GitHub
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="auto_sync"
              id="auto_sync"
              checked={formData.auto_sync}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="auto_sync" className="text-sm text-foreground">
              Enable daily auto-sync
            </label>
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Featured Image
          </label>
          <input
            type="text"
            name="featured_image"
            value={formData.featured_image}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="/projects/my-project.png"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Path to project image (upload via Media Library)
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-secondary/20 rounded-lg min-h-[60px]">
            {allTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "px-3 py-1 text-sm rounded-full transition-colors",
                  selectedTagIds.includes(tag.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                )}
              >
                {tag.name_en}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Status and Featured */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_featured"
              id="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="is_featured" className="text-sm text-foreground">
              Featured project
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Display Order
            </label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {mode === 'create' ? 'Create Project' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
