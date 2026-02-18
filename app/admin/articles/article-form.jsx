'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createArticle, updateArticle, generateSlug } from '@/lib/actions/articles'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { BilingualAIField } from '@/components/admin/shared/BilingualAIField'
import { LanguageTabs } from '@/components/admin/shared/language-tabs'
import { Save, Eye, ArrowLeft, Loader2, RefreshCw, Sparkles, Languages } from 'lucide-react'
import { AIGenerateModal } from '@/components/admin/shared/AIGenerateModal'
import { aiGenerateArticle, aiTranslateAll } from '@/lib/actions/ai'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

// Dynamic import for TipTap to avoid SSR issues
const TipTapEditor = dynamic(
  () => import('@/components/editor/TipTapEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="border border-border rounded-lg bg-card animate-pulse min-h-[500px]" />
    ),
  }
)

export function ArticleForm({ article = null, categories = [], tags = [] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('en')
  const [errors, setErrors] = useState({})
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [isTranslatingAll, setIsTranslatingAll] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    slug: article?.slug || '',
    title_en: article?.title_en || '',
    title_fa: article?.title_fa || '',
    excerpt_en: article?.excerpt_en || '',
    excerpt_fa: article?.excerpt_fa || '',
    content_en: article?.content_en || '',
    content_fa: article?.content_fa || '',
    featured_image: article?.featured_image || '',
    og_image: article?.og_image || '',
    category_id: article?.category_id || '',
    tag_ids: article?.tag_ids || [],
    status: article?.status || 'draft',
    published_at: article?.published_at || '',
    is_featured: article?.is_featured || false,
    meta_title_en: article?.meta_title_en || '',
    meta_title_fa: article?.meta_title_fa || '',
    meta_description_en: article?.meta_description_en || '',
    meta_description_fa: article?.meta_description_fa || '',
  })

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleGenerateSlug = async () => {
    if (!formData.title_en) return
    const slug = await generateSlug(formData.title_en)
    updateField('slug', slug)
  }

  const handleGenerateArticle = async (topic) => {
    try {
      const result = await aiGenerateArticle({ topic })
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
        excerpt_en: result.excerpt_en || prev.excerpt_en,
        content_en: result.content_en || prev.content_en,
        slug: result.slug || prev.slug,
        meta_title_en: result.meta_title_en || prev.meta_title_en,
        meta_description_en: result.meta_description_en || prev.meta_description_en,
      }))
      toast({
        title: 'Article Generated',
        description: 'The article content has been generated successfully.',
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

      const result = await aiTranslateAll({
        fields: {
          [`title${sourceSuffix}`]: formData[`title${sourceSuffix}`],
          [`excerpt${sourceSuffix}`]: formData[`excerpt${sourceSuffix}`],
          [`content${sourceSuffix}`]: formData[`content${sourceSuffix}`],
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

      // Target suffix is opposite of source
      const targetSuffix = activeTab === 'en' ? '_fa' : '_en'

      setFormData(prev => ({
        ...prev,
        [`title${targetSuffix}`]: result.translated?.[`title${targetSuffix}`] || prev[`title${targetSuffix}`],
        [`excerpt${targetSuffix}`]: result.translated?.[`excerpt${targetSuffix}`] || prev[`excerpt${targetSuffix}`],
        [`content${targetSuffix}`]: result.translated?.[`content${targetSuffix}`] || prev[`content${targetSuffix}`],
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

  const handleTagToggle = (tagId) => {
    const newTags = formData.tag_ids.includes(tagId)
      ? formData.tag_ids.filter(id => id !== tagId)
      : [...formData.tag_ids, tagId]
    updateField('tag_ids', newTags)
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title_en.trim()) newErrors.title_en = 'English title is required'
    if (!formData.title_fa.trim()) newErrors.title_fa = 'Persian title is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    if (!formData.content_en.trim()) newErrors.content_en = 'English content is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (status = null) => {
    if (!validate()) return

    const submitData = {
      ...formData,
      status: status || formData.status,
    }

    startTransition(async () => {
      let result
      if (article) {
        result = await updateArticle(article.id, submitData)
      } else {
        result = await createArticle(submitData)
      }

      if (result.error) {
        setErrors({ submit: result.error })
      } else {
        router.push('/admin/articles')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {article ? 'Edit Article' : 'New Article'}
            </h1>
            {article && (
              <p className="text-sm text-muted-foreground">/{article.slug}</p>
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
            disabled={isTranslatingAll || (!formData.title_en && !formData.excerpt_en && !formData.content_en && !formData.title_fa && !formData.excerpt_fa && !formData.content_fa)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {isTranslatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
            Translate All
          </button>
          {article && (
            <Link
              href={`/admin/articles/${article.id}/preview`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
          )}
          {article?.status === 'published' && (
            <Link
              href={`/blog/${article.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="View live article"
            >
              View Live
            </Link>
          )}
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-opacity disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Language Tabs */}
          <LanguageTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Title Fields */}
          <BilingualAIField
            label="Title"
            activeTab={activeTab}
            nameEn="title_en"
            nameFa="title_fa"
            valueEn={formData.title_en}
            valueFa={formData.title_fa}
            onChangeEn={(val) => updateField('title_en', val)}
            onChangeFa={(val) => updateField('title_fa', val)}
            required={true}
            enableTranslate={true}
            enableRefine={true}
          />

          {/* Excerpt Fields */}
          <BilingualAIField
            label="Short Description"
            activeTab={activeTab}
            nameEn="excerpt_en"
            nameFa="excerpt_fa"
            valueEn={formData.excerpt_en}
            valueFa={formData.excerpt_fa}
            onChangeEn={(val) => updateField('excerpt_en', val)}
            onChangeFa={(val) => updateField('excerpt_fa', val)}
            type="textarea"
            rows={2}
            placeholderEn="Brief description of the article..."
            placeholderFa="توضیح کوتاه درباره مقاله"
            enableTranslate={true}
            enableRefine={true}
          />

          {/* Content - TipTap Editor */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Content ({activeTab === 'en' ? 'English' : 'فارسی'})
            </label>
            <div className="min-h-[200px] border border-border rounded-lg overflow-hidden">
              <TipTapEditor
                content={formData[`content_${activeTab}`] || ''}
                onChange={(html) => updateField(`content_${activeTab}`, html)}
                editable={true}
                placeholder={activeTab === 'en' ? 'Start writing your article...' : 'نوشتن مقاله را شروع کنید...'}
              />
            </div>
            {errors.content_en && (
              <p className="mt-1 text-sm text-red-500">{errors.content_en}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Slug */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <h3 className="font-medium text-foreground">URL Slug</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className={`flex-1 px-3 py-2 text-sm bg-secondary border rounded-lg text-foreground focus:border-primary outline-none ${
                  errors.slug ? 'border-red-500' : 'border-border'
                }`}
                placeholder="article-slug"
              />
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                title="Generate from title"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug}</p>
            )}
            <p className="text-xs text-muted-foreground">
              /blog/{formData.slug || 'your-slug'}
            </p>
          </div>

          {/* Featured Image */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <h3 className="font-medium text-foreground">Featured Image</h3>
            <ImageUpload
              value={formData.featured_image}
              onChange={(url) => updateField('featured_image', url)}
              folder="articles"
            />
          </div>

          {/* Category */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <h3 className="font-medium text-foreground">Category</h3>
            <select
              value={formData.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:border-primary outline-none"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name_en}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <h3 className="font-medium text-foreground">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    formData.tag_ids.includes(tag.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tag.name_en}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground">No tags available</p>
              )}
            </div>
          </div>

          {/* Publishing */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <h3 className="font-medium text-foreground">Publishing</h3>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:border-primary outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                Publish Date (optional - for scheduling)
              </label>
              <input
                type="datetime-local"
                value={formData.published_at ? formData.published_at.slice(0, 16) : ''}
                onChange={(e) => updateField('published_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:border-primary outline-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => updateField('is_featured', e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Featured article</span>
            </label>
          </div>

          {/* SEO */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <h3 className="font-medium text-foreground">SEO Settings</h3>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                Meta Title (EN)
              </label>
              <input
                type="text"
                value={formData.meta_title_en}
                onChange={(e) => updateField('meta_title_en', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:border-primary outline-none"
                placeholder="Custom title for search engines"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                Meta Description (EN)
              </label>
              <textarea
                value={formData.meta_description_en}
                onChange={(e) => updateField('meta_description_en', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:border-primary outline-none resize-none"
                placeholder="Custom description for search engines"
              />
            </div>
          </div>
        </div>
      </div>

      <AIGenerateModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateArticle}
        onTranslateAll={handleTranslateAll}
        title="Generate Article"
        placeholder="Enter a topic for your article (e.g., 'How to build a REST API with Node.js')"
        label="Article Topic"
        showTranslateAll={true}
        hasContent={{
          title: !!(formData.title_en || formData.title_fa),
          excerpt: !!(formData.excerpt_en || formData.excerpt_fa),
          content: !!(formData.content_en || formData.content_fa),
        }}
      />
    </div>
  )
}
