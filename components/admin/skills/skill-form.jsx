'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createSkill, updateSkill } from '@/lib/actions/skills'
import { LanguageTabs, BilingualField } from '@/components/admin/shared/language-tabs'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function SkillForm({ categories, skill, mode = 'create' }) {
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('en')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name_en: skill?.name_en || '',
    name_fa: skill?.name_fa || '',
    description_en: skill?.description_en || '',
    description_fa: skill?.description_fa || '',
    proficiency_level: skill?.proficiency_level || 50,
    category_id: skill?.category_id || '',
    years_of_experience: skill?.years_of_experience || '',
    url: skill?.url || '',
    is_featured: skill?.is_featured || false,
    sort_order: skill?.sort_order || 0,
  })

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (type === 'checkbox' ? e.target.checked : value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const submitData = {
        ...formData,
        slug: formData.name_en.toLowerCase().replace(/\s+/g, '-'),
      }

      if (mode === 'create') {
        const result = await createSkill(submitData)
        if (result.error) {
          throw new Error(result.error)
        }
      } else {
        const result = await updateSkill(skill.id, submitData)
        if (result.error) {
          throw new Error(result.error)
        }
      }

      toast({
        title: mode === 'create' ? 'Skill created' : 'Skill updated',
        description: mode === 'create'
          ? 'Your new skill has been added successfully.'
          : 'The skill has been updated successfully.',
      })

      router.push('/admin/skills')
      router.refresh()
    } catch (error) {
      console.error('Error saving skill:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/skills"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Skills
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
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6 max-w-2xl">
        {/* Language Tabs */}
        <LanguageTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Name Fields */}
        <BilingualField
          label="Skill Name"
          activeTab={activeTab}
          nameEn="name_en"
          nameFa="name_fa"
          valueEn={formData.name_en}
          valueFa={formData.name_fa}
          onChangeEn={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
          onChangeFa={(e) => setFormData(prev => ({ ...prev, name_fa: e.target.value }))}
          placeholderEn="e.g., Python, JavaScript"
          placeholderFa="مثلاً: پایتون، جاوا اسکریپت"
          required
        />

        {/* Description Fields */}
        <BilingualField
          label="Description"
          activeTab={activeTab}
          nameEn="description_en"
          nameFa="description_fa"
          valueEn={formData.description_en}
          valueFa={formData.description_fa}
          onChangeEn={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
          onChangeFa={(e) => setFormData(prev => ({ ...prev, description_fa: e.target.value }))}
          type="textarea"
          rows={3}
          placeholderEn="Brief description of this skill..."
          placeholderFa="توضیح مختصر این مهارت..."
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_en} / {category.name_fa}
              </option>
            ))}
          </select>
        </div>

        {/* Proficiency Level */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Proficiency Level: {formData.proficiency_level}%
          </label>
          <input
            type="range"
            name="proficiency_level"
            min="0"
            max="100"
            value={formData.proficiency_level}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Beginner</span>
            <span>Expert</span>
          </div>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            name="years_of_experience"
            value={formData.years_of_experience}
            onChange={handleChange}
            step="0.1"
            min="0"
            max="50"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., 3.5"
          />
        </div>

        {/* Documentation/Certification URL */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Documentation/Certification URL (optional)
          </label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://..."
          />
        </div>

        {/* Featured Toggle */}
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
            Featured skill (show on homepage)
          </label>
        </div>

        {/* Sort Order */}
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
          <p className="text-xs text-muted-foreground mt-1">
            Lower numbers appear first
          </p>
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
                {mode === 'create' ? 'Create Skill' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
