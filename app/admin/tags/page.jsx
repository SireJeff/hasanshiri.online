'use client'

import { useState, useEffect } from 'react'
import { Tags, Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react'
import { getTagsWithCount, createTag, updateTag, deleteTag } from '@/lib/actions/tags'

export default function TagsPage() {
  const [tags, setTags] = useState([])
  const [filteredTags, setFilteredTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [formData, setFormData] = useState({
    name_en: '',
    name_fa: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadTags()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = tags.filter(
        tag =>
          tag.name_en.toLowerCase().includes(search.toLowerCase()) ||
          (tag.name_fa && tag.name_fa.includes(search)) ||
          tag.slug.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredTags(filtered)
    } else {
      setFilteredTags(tags)
    }
  }, [search, tags])

  async function loadTags() {
    setLoading(true)
    const data = await getTagsWithCount()
    setTags(data)
    setFilteredTags(data)
    setLoading(false)
  }

  function resetForm() {
    setFormData({
      name_en: '',
      name_fa: '',
    })
    setEditingTag(null)
    setShowForm(false)
  }

  function handleEdit(tag) {
    setFormData({
      name_en: tag.name_en || '',
      name_fa: tag.name_fa || '',
    })
    setEditingTag(tag)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingTag) {
        const result = await updateTag(editingTag.id, formData)
        if (result.error) {
          alert('Error updating tag: ' + result.error)
        }
      } else {
        const result = await createTag(formData)
        if (result.error) {
          alert('Error creating tag: ' + result.error)
        }
      }
      await loadTags()
      resetForm()
    } catch (error) {
      alert('An error occurred: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      const result = await deleteTag(id)
      if (result.error) {
        alert('Error deleting tag: ' + result.error)
      } else {
        await loadTags()
      }
    } catch (error) {
      alert('An error occurred: ' + error.message)
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tags</h1>
          <p className="text-muted-foreground mt-1">
            Manage article tags ({tags.length} total)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-fit"
        >
          <Plus size={20} />
          Add Tag
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 mx-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {editingTag ? 'Edit Tag' : 'New Tag'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., JavaScript"
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
                  placeholder="مثلاً: جاوااسکریپت"
                />
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
                  {editingTag ? 'Update' : 'Create'}
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
            <h2 className="text-xl font-semibold text-foreground mb-2">Delete Tag</h2>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "{deleteConfirm.name_en}"?
              {deleteConfirm.article_count > 0 && (
                <span className="text-yellow-500 block mt-2">
                  Note: This tag is used by {deleteConfirm.article_count} article(s). They will be untagged.
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

      {/* Tags Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Tags size={48} className="mb-4" />
            {search ? (
              <p>No tags matching "{search}"</p>
            ) : (
              <>
                <p>No tags yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-primary hover:underline"
                >
                  Create your first tag
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">{tag.name_en}</span>
                  {tag.name_fa && (
                    <span className="text-muted-foreground truncate">/ {tag.name_fa}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="font-mono">{tag.slug}</span>
                  <span>•</span>
                  <span>{tag.article_count} article{tag.article_count !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => handleEdit(tag)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(tag)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
