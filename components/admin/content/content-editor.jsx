'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { updatePageContent } from '@/lib/actions/page-content'
import { LanguageTabs, BilingualField } from '@/components/admin/shared/language-tabs'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function ContentEditor({ content, mode = 'create' }) {
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('en')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    page_slug: content?.page_slug || 'home',
    section_key: content?.section_key || '',
    title_en: content?.title_en || '',
    title_fa: content?.title_fa || '',
    content_en: content?.content_en || '',
    content_fa: content?.content_fa || '',
    field_1_en: content?.field_1_en || '',
    field_1_fa: content?.field_1_fa || '',
    field_2_en: content?.field_2_en || '',
    field_2_fa: content?.field_2_fa || '',
    field_3_en: content?.field_3_en || '',
    field_3_fa: content?.field_3_fa || '',
    image_url: content?.image_url || '',
    is_enabled: content?.is_enabled ?? true,
    sort_order: content?.sort_order || 0,
  })

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const submitData = {
        ...formData,
        // Ensure page_slug is set for new content
        page_slug: mode === 'create' ? 'home' : formData.page_slug,
      }

      if (mode === 'create') {
        const result = await createPageContent(submitData)
        if (result.error) {
          throw new Error(result.error)
        }
      } else {
        const result = await updatePageContent(content.id, submitData)
        if (result.error) {
          throw new Error(result.error)
        }
      }

      toast({
        title: mode === 'create' ? 'Content created' : 'Content updated',
        description: 'Page content has been saved successfully.',
      })

      router.push('/admin/content')
      router.refresh()
    } catch (error) {
      console.error('Error saving content:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine field labels based on section
  const getFieldLabels = () => {
    switch (formData.section_key) {
      case 'hero':
        return {
          title: 'Hero Section',
          field1: 'Greeting',
          field2: 'Name (First)',
          field3: 'Name (Last)',
        }
      case 'about-intro':
        return {
          title: 'About Introduction',
          field1: 'Subtitle/Tagline',
        }
      default:
        return {
          title: 'Content Section',
          field1: 'Field 1',
          field2: 'Field 2',
          field3: 'Field 3',
        }
    }
  }

  const fieldLabels = getFieldLabels()

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/content"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Page Content
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
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6 max-w-3xl">
        <div>
          <h2 className="text-xl font-semibold mb-4">{fieldLabels.title}</h2>
          <p className="text-sm text-muted-foreground">
            Page: {formData.page_slug} • Section: {formData.section_key}
          </p>
        </div>

        {/* Language Tabs */}
        <LanguageTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Title Fields */}
        <BilingualField
          label="Section Title"
          activeTab={activeTab}
          nameEn="title_en"
          nameFa="title_fa"
          valueEn={formData.title_en}
          valueFa={formData.title_fa}
          onChangeEn={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
          onChangeFa={(e) => setFormData(prev => ({ ...prev, title_fa: e.target.value }))}
          placeholderEn="e.g., Hero Section"
          placeholderFa="مثلاً: بخش هیرو"
          required
        />

        {/* Content Fields (TipTap for long content) */}
        {mode === 'edit' && (
          <BilingualField
            label="Content (Rich Text)"
            activeTab={activeTab}
            nameEn="content_en"
            nameFa="content_fa"
            valueEn={formData.content_en}
            valueFa={formData.content_fa}
            onChangeEn={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
            onChangeFa={(e) => setFormData(prev => ({ ...prev, content_fa: e.target.value }))}
            type="textarea"
            rows={6}
            placeholderEn="Content for this section..."
            placeholderFa="محتوا این بخش..."
          />
        )}

        {/* Field 1 */}
        {(formData.field_1_en || formData.field_1_fa) && (
          <BilingualField
            label={fieldLabels.field1}
            activeTab={activeTab}
            nameEn="field_1_en"
            nameFa="field_1_fa"
            valueEn={formData.field_1_en}
            valueFa={formData.field_1_fa}
            onChangeEn={(e) => setFormData(prev => ({ ...prev, field_1_en: e.target.value }))}
            onChangeFa={(e) => setFormData(prev => ({ ...prev, field_1_fa: e.target.value }))}
            placeholderEn={fieldLabels.field1}
          />
        )}

        {/* Field 2 */}
        {(formData.field_2_en || formData.field_2_fa) && (
          <BilingualField
            label={fieldLabels.field2}
            activeTab={activeTab}
            nameEn="field_2_en"
            nameFa="field_2_fa"
            valueEn={formData.field_2_en}
            valueFa={formData.field_2_fa}
            onChangeEn={(e) => setFormData(prev => ({ ...prev, field_2_en: e.target.value }))}
            onChangeFa={(e) => setFormData(prev => ({ ...prev, field_2_fa: e.target.value }))}
            placeholderEn={fieldLabels.field2}
          />
        )}

        {/* Field 3 */}
        {(formData.field_3_en || formData.field_3_fa) && (
          <BilingualField
            label={fieldLabels.field3}
            activeTab={activeTab}
            nameEn="field_3_en"
            nameFa="field_3_fa"
            valueEn={formData.field_3_en}
            valueFa={formData.field_3_fa}
            onChangeEn={(e) => setFormData(prev => ({ ...prev, field_3_en: e.target.value }))}
            onChangeFa={(e) => setFormData(prev => ({ ...prev, field_3_fa: e.target.value }))}
            placeholderEn={fieldLabels.field3}
          />
        )}

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Image URL (optional)
          </label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="/images/hero-bg.jpg"
          />
        </div>

        {/* Display Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_enabled"
              id="is_enabled"
              checked={formData.is_enabled}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="is_enabled" className="text-sm text-foreground">
              Visible on website
            </label>
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
                {mode === 'create' ? 'Create Content' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Import create function at the top
async function createPageContent(formData) {
  const { createPageContent } = await import('@/lib/actions/page-content')
  return await createPageContent(formData)
}
