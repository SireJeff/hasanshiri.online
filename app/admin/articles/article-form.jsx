'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createArticle, updateArticle, generateSlug } from '@/lib/actions/articles'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { TranslateButton, FieldTranslateButton, TranslationResult } from '@/components/admin/shared/translate-button'
import { Save, Eye, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

// Dynamic import for TipTap to avoid SSR issues
const TipTapEditor = dynamic(
  () => import('@/components/editor/TipTapEditor').then(mod => mod.TipTapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border border-border rounded-lg bg-card animate-pulse min-h-[500px]" />
    ),
  }
)

export function ArticleForm({ article = null, categories = [], tags = [] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('en')
  const [errors, setErrors] = useState({})
  const [translationErrors, setTranslationErrors] = useState([])

  // Determine translation direction based on active tab
  const translationDirection = activeTab === 'en' ? 'en2fa' : 'fa2en'

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

  const handleTranslationComplete = (translations, errors) => {
    // Update form data with translations
    for (const [field, value] of Object.entries(translations)) {
      updateField(field, value)
    }
    if (errors && errors.length > 0) {
      setTranslationErrors(errors)
    } else {
      setTranslationErrors([])
    }
  }

  const handleFieldTranslation = (field, translated) => {
    updateField(field, translated)
    // Clear translation errors when successful
    setTranslationErrors([])
  }

  const handleTranslationError = (error) => {
    setErrors({ submit: `Translation failed: ${error}` })
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
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            Publish
          </button>
          {/* Translate All Button */}
          <TranslateButton
            data={formData}
            direction={translationDirection}
            fields={['title', 'excerpt', 'content']}
            onTranslationComplete={handleTranslationComplete}
            onError={handleTranslationError}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Translation Result Display */}
      {translationErrors.length > 0 && (
        <TranslationResult errors={translationErrors} />
      )}

      {errors.submit && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Language Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('en')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'en'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveTab('fa')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'fa'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              فارسی (Persian)
            </button>
          </div>

          {/* English Content */}
          {activeTab === 'en' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    Title (English) *
                  </label>
                  <FieldTranslateButton
                    text={formData.title_en}
                    field="title_fa"
                    direction="en2fa"
                    onTranslationComplete={(translated) => handleFieldTranslation('title_fa', translated)}
                    onError={handleTranslationError}
                  />
                </div>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => updateField('title_en', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none ${
                    errors.title_en ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Enter article title"
                />
                {errors.title_en && (
                  <p className="mt-1 text-sm text-red-500">{errors.title_en}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    Excerpt (English)
                  </label>
                  <FieldTranslateButton
                    text={formData.excerpt_en}
                    field="excerpt_fa"
                    direction="en2fa"
                    onTranslationComplete={(translated) => handleFieldTranslation('excerpt_fa', translated)}
                    onError={handleTranslationError}
                  />
                </div>
                <textarea
                  value={formData.excerpt_en}
                  onChange={(e) => updateField('excerpt_en', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Brief description of the article"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    Content (English) *
                  </label>
                  <FieldTranslateButton
                    text={formData.content_en}
                    field="content_fa"
                    direction="en2fa"
                    isHTML={true}
                    onTranslationComplete={(translated) => handleFieldTranslation('content_fa', translated)}
                    onError={handleTranslationError}
                  />
                </div>
                <TipTapEditor
                  content={formData.content_en}
                  onChange={(html) => updateField('content_en', html)}
                  placeholder="Start writing your article..."
                />
                {errors.content_en && (
                  <p className="mt-1 text-sm text-red-500">{errors.content_en}</p>
                )}
              </div>
            </div>
          )}

          {/* Persian Content */}
          {activeTab === 'fa' && (
            <div className="space-y-4" dir="rtl">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    عنوان (فارسی) *
                  </label>
                  <FieldTranslateButton
                    text={formData.title_fa}
                    field="title_en"
                    direction="fa2en"
                    onTranslationComplete={(translated) => handleFieldTranslation('title_en', translated)}
                    onError={handleTranslationError}
                  />
                </div>
                <input
                  type="text"
                  value={formData.title_fa}
                  onChange={(e) => updateField('title_fa', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none ${
                    errors.title_fa ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="عنوان مقاله را وارد کنید"
                />
                {errors.title_fa && (
                  <p className="mt-1 text-sm text-red-500">{errors.title_fa}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    خلاصه (فارسی)
                  </label>
                  <FieldTranslateButton
                    text={formData.excerpt_fa}
                    field="excerpt_en"
                    direction="fa2en"
                    onTranslationComplete={(translated) => handleFieldTranslation('excerpt_en', translated)}
                    onError={handleTranslationError}
                  />
                </div>
                <textarea
                  value={formData.excerpt_fa}
                  onChange={(e) => updateField('excerpt_fa', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="توضیح کوتاه درباره مقاله"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    محتوا (فارسی)
                  </label>
                  <FieldTranslateButton
                    text={formData.content_fa}
                    field="content_en"
                    direction="fa2en"
                    isHTML={true}
                    onTranslationComplete={(translated) => handleFieldTranslation('content_en', translated)}
                    onError={handleTranslationError}
                  />
                </div>
                <TipTapEditor
                  content={formData.content_fa}
                  onChange={(html) => updateField('content_fa', html)}
                  placeholder="نوشتن مقاله را شروع کنید..."
                />
              </div>
            </div>
          )}
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
    </div>
  )
}
