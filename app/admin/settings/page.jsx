'use client'

import { useState, useEffect } from 'react'
import { User, Moon, Sun, Save, Loader2, HardDrive, Image as ImageIcon } from 'lucide-react'
import { getProfile, updateProfile, getStorageStats } from '@/lib/actions/settings'
import { uploadImage } from '@/lib/actions/storage'
import { useTheme } from '@/app/providers'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // Profile state
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    bio: '',
  })
  const [user, setUser] = useState(null)

  // Storage stats
  const [storageStats, setStorageStats] = useState(null)

  // Theme
  const { isDark, toggleDarkMode } = useTheme()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    // Load profile
    const profileResult = await getProfile()
    if (profileResult.profile) {
      setProfile({
        full_name: profileResult.profile.full_name || '',
        avatar_url: profileResult.profile.avatar_url || '',
        bio: profileResult.profile.bio || '',
      })
      setUser(profileResult.user)
    }

    // Load storage stats
    const storageResult = await getStorageStats()
    if (storageResult.stats) {
      setStorageStats(storageResult.stats)
    }

    setLoading(false)
  }

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const result = await updateProfile(profile)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'articles')
    formData.append('folder', 'avatars')

    try {
      const result = await uploadImage(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setProfile(prev => ({ ...prev, avatar_url: result.url }))
        setMessage({ type: 'success', text: 'Avatar uploaded. Don\'t forget to save!' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'appearance', name: 'Appearance', icon: Moon },
    { id: 'storage', name: 'Storage', icon: HardDrive },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and preferences
        </p>
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon size={18} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-secondary border border-border overflow-hidden flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors">
                    <ImageIcon size={18} />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: Square image, at least 200x200px
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="A short bio about yourself"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </form>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Theme</h3>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon size={24} className="text-blue-400" />
                  ) : (
                    <Sun size={24} className="text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isDark ? 'Using dark color scheme' : 'Using light color scheme'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={cn(
                    'relative w-14 h-8 rounded-full transition-colors',
                    isDark ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform',
                      isDark ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Color Theme</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The site uses a random accent color on each visit. This creates a unique experience for visitors.
              </p>
              <div className="flex gap-2 flex-wrap">
                {['Emerald', 'Purple', 'Blue', 'Rose', 'Amber', 'Indigo'].map((color) => (
                  <span
                    key={color}
                    className="px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Storage Usage</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ImageIcon size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {storageStats?.totalFiles || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Files</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <HardDrive size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {storageStats?.formattedSize || '0 B'}
                      </p>
                      <p className="text-sm text-muted-foreground">Storage Used</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Media Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your uploaded images and files in the Media Library.
              </p>
              <a
                href="/admin/media"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ImageIcon size={18} />
                Open Media Library
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
