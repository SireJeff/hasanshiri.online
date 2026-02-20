'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createProject, updateProject, getProjectTags } from '@/lib/actions/projects'
import { LanguageTabs } from '@/components/admin/shared/language-tabs'
import { BilingualAIField } from '@/components/admin/shared/BilingualAIField'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { ArrowLeft, Loader2, Github as GithubIcon, ExternalLink, Sparkles, Languages } from 'lucide-react'
import Link from 'next/link'
import { AIGenerateModal } from '@/components/admin/shared/AIGenerateModal'
import { AISeoButton } from '@/components/admin/shared/AISeoButton'
import { aiGenerateProject, aiTranslateAll, aiGenerateSEO } from '@/lib/actions/ai'
import { ImageUpload } from '@/components/editor/ImageUpload'

// Dynamic import for TipTap to avoid SSR issues
const TipTapEditor = dynamic(
  () => import('@/components/editor/TipTapEditor'),
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
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [isTranslatingAll, setIsTranslatingAll] = useState(false)
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false)

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
    meta_title_en: project?.meta_title_en || '',
    meta_title_fa: project?.meta_title_fa || '',
    meta_description_en: project?.meta_description_en || '',
    meta_description_fa: project?.meta_description_fa || '',
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

  const handleGenerateProject = async (description) => {
    try {
      const result = await aiGenerateProject({ description })
      if (result.error) {
        toast({
          title: 'Generation Failed',
          description: result.error,
          variant: 'destructive',
        })
        throw new Error(result.error)
      }
      setFormData(prev => ({
        ...prev,
        title_en: result.title_en || prev.title_en,
        description_en: result.description_en || prev.description_en,
        long_description_en: result.long_description_en || prev.long_description_en,
      }))
      toast({
        title: 'Project Generated',
        description: 'The project content has been generated successfully.',
      })
    } catch (error) {
      if (!error.message?.includes('Generation Failed')) {
        toast({
          title: 'Generation Failed',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        })
      }
      throw error
    }
  }

  const handleTranslateAll = async () => {
    setIsTranslatingAll(true)
    try {
      // Dynamic direction based on active tab
      const direction = activeTab === 'en' ? 'en2fa' : 'fa2en'
      const sourceSuffix = activeTab === 'en' ? '_en' : '_fa'
      const targetSuffix = activeTab === 'en' ? '_fa' : '_en'

      const result = await aiTranslateAll({
        fields: {
          [`title${sourceSuffix}`]: formData[`title${sourceSuffix}`],
          [`description${sourceSuffix}`]: formData[`description${sourceSuffix}`],
          [`content${sourceSuffix}`]: formData[`long_description${sourceSuffix}`],
          [`meta_title${sourceSuffix}`]: formData[`meta_title${sourceSuffix}`],
          [`meta_description${sourceSuffix}`]: formData[`meta_description${sourceSuffix}`],
        },
        direction,
      })
      if (result.error) {
        toast({
          title: 'Translation Failed',
          description: result.error,
          variant: 'destructive',
        })
        throw new Error(result.error)
      }
      setFormData(prev => ({
        ...prev,
        [`title${targetSuffix}`]: result.translated?.[`title${targetSuffix}`] || prev[`title${targetSuffix}`],
        [`description${targetSuffix}`]: result.translated?.[`description${targetSuffix}`] || prev[`description${targetSuffix}`],
        [`long_description${targetSuffix}`]: result.translated?.[`content${targetSuffix}`] || prev[`long_description${targetSuffix}`],
        [`meta_title${targetSuffix}`]: result.translated?.[`meta_title${targetSuffix}`] || prev[`meta_title${targetSuffix}`],
        [`meta_description${targetSuffix}`]: result.translated?.[`meta_description${targetSuffix}`] || prev[`meta_description${targetSuffix}`],
      }))
      toast({
        title: 'Translation Complete',
        description: `All fields have been translated to ${activeTab === 'en' ? 'Persian' : 'English'}.`,
      })
    } catch (error) {
      if (!error.message?.includes('Translation Failed')) {
        toast({
          title: 'Translation Failed',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        })
      }
    } finally {
      setIsTranslatingAll(false)
    }
  }

  /**
   * Generate SEO meta tags using AI
   * Analyzes project content and generates optimized titles and descriptions
   */
  const handleGenerateSEO = async () => {
    // Need at least a title to generate SEO
    if (!formData.title_en && !formData.title_fa) {
      toast({
        title: 'Cannot Generate SEO',
        description: 'Please add at least a title before generating SEO meta tags.',
        variant: 'destructive',
      })
      return
    }

    setIsGeneratingSEO(true)
    try {
      const result = await aiGenerateSEO({
        type: 'project',
        title_en: formData.title_en,
        title_fa: formData.title_fa,
        excerpt_en: formData.description_en,
        excerpt_fa: formData.description_fa,
        content_en: formData.long_description_en,
        content_fa: formData.long_description_fa,
      })

      if (result.error) {
        toast({
          title: 'SEO Generation Failed',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      // Update form with generated SEO fields
      setFormData(prev => ({
        ...prev,
        meta_title_en: result.meta_title_en || prev.meta_title_en,
        meta_title_fa: result.meta_title_fa || prev.meta_title_fa,
        meta_description_en: result.meta_description_en || prev.meta_description_en,
        meta_description_fa: result.meta_description_fa || prev.meta_description_fa,
      }))

      toast({
        title: 'SEO Generated',
        description: 'Meta titles and descriptions have been generated for both languages.',
      })
    } catch (error) {
      toast({
        title: 'SEO Generation Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingSEO(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    console.log('[ProjectForm] Submitting form...', { mode, projectId: project?.id })

    try {
      const submitData = {
        ...formData,
        tag_ids: selectedTagIds,
      }

      console.log('[ProjectForm] Submit data:', { title: submitData.title_en, tags: submitData.tag_ids?.length })

      if (mode === 'create') {
        const result = await createProject(submitData)
        console.log('[ProjectForm] Create result:', result)
        if (result.error) {
          throw new Error(result.error)
        }
      } else {
        const result = await updateProject(project.id, submitData)
        console.log('[ProjectForm] Update result:', result)
        if (result.error) {
          throw new Error(result.error)
        }
      }

      console.log('[ProjectForm] Success! Showing toast and redirecting...')
      toast({
        title: mode === 'create' ? 'Project created' : 'Project updated',
        description: mode === 'create' ? 'Your new project has been added successfully.' : 'The project has been updated successfully.',
      })
      router.push('/admin/projects')
      router.refresh()
    } catch (error) {
      console.error('[ProjectForm] Error saving project:', error)
      toast({
        title: 'Error',
        description: error.message || (mode === 'create' ? 'Failed to create project' : 'Failed to update project'),
        variant: 'destructive',
      })
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
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
          <button
            type="button"
            onClick={handleTranslateAll}
            disabled={isTranslatingAll || (!formData.title_en && !formData.description_en && !formData.long_description_en && !formData.title_fa && !formData.description_fa && !formData.long_description_fa)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {isTranslatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
            Translate All
          </button>
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

        {/* Featured Image / Thumbnail */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-4">
          <h3 className="font-medium text-foreground">Project Thumbnail</h3>
          <p className="text-sm text-muted-foreground">
            Upload a thumbnail image for the project card display.
          </p>
          <ImageUpload
            value={formData.featured_image}
            onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
            folder="projects"
          />
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
          </div>

          {/* SEO Settings */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">SEO Settings</h3>
              <AISeoButton
                onClick={handleGenerateSEO}
                loading={isGeneratingSEO}
                disabled={isGeneratingSEO || (!formData.title_en && !formData.title_fa)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Auto-generate optimized meta titles (50-60 chars) and descriptions (150-160 chars)
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                Meta Title (EN)
              </label>
              <input
                type="text"
                name="meta_title_en"
                value={formData.meta_title_en}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:border-primary outline-none"
                placeholder="Custom title for search engines"
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {formData.meta_title_en?.length || 0}/60
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                Meta Description (EN)
              </label>
              <textarea
                name="meta_description_en"
                value={formData.meta_description_en}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:border-primary outline-none resize-none"
                placeholder="Custom description for search engines"
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {formData.meta_description_en?.length || 0}/160
              </div>
            </div>
            <div className="border-t border-border pt-4 mt-4">
              <label className="block text-sm text-muted-foreground mb-1.5">
                Meta Title (FA)
              </label>
              <input
                type="text"
                name="meta_title_fa"
                value={formData.meta_title_fa}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:border-primary outline-none text-right"
                dir="rtl"
                placeholder="عنوان برای موتورهای جستجو"
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {formData.meta_title_fa?.length || 0}/60
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                Meta Description (FA)
              </label>
              <textarea
                name="meta_description_fa"
                value={formData.meta_description_fa}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:border-primary outline-none resize-none text-right"
                dir="rtl"
                placeholder="توضیحات برای موتورهای جستجو"
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {formData.meta_description_fa?.length || 0}/160
              </div>
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

      <AIGenerateModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateProject}
        onTranslateAll={handleTranslateAll}
        title="Generate Project"
        placeholder="Describe your project (e.g., 'E-commerce platform with React and Node.js')"
        label="Project Description"
        showTranslateAll={true}
        hasContent={{
          title: !!(formData.title_en || formData.title_fa),
          excerpt: !!(formData.description_en || formData.description_fa),
          content: !!(formData.long_description_en || formData.long_description_fa),
        }}
      />
    </div>
  )
}