'use client'

import { useState, useEffect } from 'react'
import { FolderOpen, Plus, Pencil, Trash2, GripVertical, Loader2 } from 'lucide-react'
import { getCategoriesWithCount, createCategory, updateCategory, deleteCategory } from '@/lib/actions/categories'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name_en: '',
    name_fa: '',
    slug: '',
    description_en: '',
    description_fa: '',
    sort_order: 0,
  })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoading(true)
    const data = await getCategoriesWithCount()
    setCategories(data)
    setLoading(false)
  }

  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  function handleNameChange(e) {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name_en: name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }))
  }

  function resetForm() {
    setFormData({
      name_en: '',
      name_fa: '',
      slug: '',
      description_en: '',
      description_fa: '',
      sort_order: categories.length,
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  function handleEdit(category) {
    setFormData({
      name_en: category.name_en || '',
      name_fa: category.name_fa || '',
      slug: category.slug || '',
      description_en: category.description_en || '',
      description_fa: category.description_fa || '',
      sort_order: category.sort_order || 0,
    })
    setEditingCategory(category)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, formData)
        if (result.error) {
          alert('Error updating category: ' + result.error)
        }
      } else {
        const result = await createCategory(formData)
        if (result.error) {
          alert('Error creating category: ' + result.error)
        }
      }
      await loadCategories()
      resetForm()
    } catch (error) {
      alert('An error occurred: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      const result = await deleteCategory(id)
      if (result.error) {
        alert('Error deleting category: ' + result.error)
      } else {
        await loadCategories()
      }
    } catch (error) {
      alert('An error occurred: ' + error.message)
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage article categories
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={handleNameChange}
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name (Persian)
                  </label>
                  <input
                    type="text"
                    value={formData.name_fa}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_fa: e.target.value }))}
                    dir="rtl"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL-friendly identifier (e.g., "web-development")
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description (English)
                  </label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description (Persian)
                  </label>
                  <textarea
                    value={formData.description_fa}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_fa: e.target.value }))}
                    rows={3}
                    dir="rtl"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-24 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 mx-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">Delete Category</h2>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "{deleteConfirm.name_en}"?
              {deleteConfirm.article_count > 0 && (
                <span className="text-destructive block mt-2">
                  Warning: This category has {deleteConfirm.article_count} article(s) assigned to it.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FolderOpen size={48} className="mb-4" />
            <p>No categories yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-primary hover:underline"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="text-muted-foreground cursor-grab">
                  <GripVertical size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{category.name_en}</h3>
                    {category.name_fa && (
                      <span className="text-muted-foreground">/ {category.name_fa}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="font-mono">{category.slug}</span>
                    <span>•</span>
                    <span>{category.article_count} article{category.article_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(category)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
