'use client'

import { useState, useEffect } from 'react'
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  Grid,
  List,
  Copy,
  Check,
  X,
  Search,
  RefreshCw,
} from 'lucide-react'
import { listImages, uploadImage, deleteImage } from '@/lib/actions/storage'
import { cn } from '@/lib/utils'

export default function MediaLibraryPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [search, setSearch] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [copiedUrl, setCopiedUrl] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadImages()
  }, [])

  async function loadImages() {
    setLoading(true)
    const result = await listImages('articles', '')
    if (result.images) {
      setImages(result.images)
    }
    setLoading(false)
  }

  async function handleUpload(e) {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'articles')
      formData.append('folder', '')

      try {
        const result = await uploadImage(formData)
        if (result.error) {
          alert(`Error uploading ${file.name}: ${result.error}`)
        }
      } catch (error) {
        alert(`Error uploading ${file.name}: ${error.message}`)
      }
    }

    await loadImages()
    setUploading(false)
    e.target.value = '' // Reset input
  }

  async function handleDelete(image) {
    setDeleting(true)
    try {
      const result = await deleteImage(image.path, 'articles')
      if (result.error) {
        alert('Error deleting image: ' + result.error)
      } else {
        await loadImages()
        setSelectedImage(null)
      }
    } catch (error) {
      alert('Error deleting image: ' + error.message)
    }
    setDeleting(false)
    setDeleteConfirm(null)
  }

  function copyToClipboard(url) {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function formatSize(bytes) {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage your uploaded images ({images.length} files)
          </p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer w-fit">
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Upload size={20} />
          )}
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadImages}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
          <div className="flex bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Grid view"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title="List view"
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon size={48} className="mb-4" />
            {search ? (
              <p>No images matching "{search}"</p>
            ) : (
              <>
                <p>No images uploaded yet</p>
                <label className="mt-4 text-primary hover:underline cursor-pointer">
                  Upload your first image
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="group relative aspect-square bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm truncate px-2">{image.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Size</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredImages.map((image) => (
                <tr key={image.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-12 h-12 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                  </td>
                  <td className="px-4 py-3 text-foreground truncate max-w-[200px]">{image.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatSize(image.size)}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(image.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title="Copy URL"
                      >
                        {copiedUrl === image.url ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(image)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-medium text-foreground truncate">{selectedImage.name}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-h-[60vh] mx-auto rounded"
              />
            </div>
            <div className="p-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">Size:</span>{' '}
                  <span className="text-foreground">{formatSize(selectedImage.size)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>{' '}
                  <span className="text-foreground">{formatDate(selectedImage.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedImage.url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm font-mono text-muted-foreground"
                />
                <button
                  onClick={() => copyToClipboard(selectedImage.url)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {copiedUrl === selectedImage.url ? (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy URL
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeleteConfirm(selectedImage)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 mx-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">Delete Image</h2>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
