'use client'

import { useState, useEffect } from 'react'
import { User, Moon, Sun, Save, Loader2, HardDrive, Image as ImageIcon, Mail, Phone, MapPin, Github, Linkedin, Twitter, Youtube, Send, MessageCircle, Instagram, Anchor, ExternalLink } from 'lucide-react'
import { getProfile, updateProfile, getStorageStats, getSiteSettings, updateSiteSettings } from '@/lib/actions/settings'
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

  // Site settings state
  const [siteSettings, setSiteSettings] = useState({
    contact: {},
    social: {},
    github: {},
  })
  const [settingsLoading, setSettingsLoading] = useState(false)

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

    // Load site settings
    const settingsResult = await getSiteSettings()
    if (settingsResult.settings) {
      const s = settingsResult.settings
      setSiteSettings({
        contact: {
          email: s.get('contact_email', '', 'en'),
          phone: s.get('contact_phone', '', 'en'),
          location_en: s.get('contact_location', '', 'en'),
          location_fa: s.get('contact_location', '', 'fa'),
        },
        social: {
          github: s.get('social_github', '', 'en'),
          linkedin: s.get('social_linkedin', '', 'en'),
          twitter: s.get('social_twitter', '', 'en'),
          youtube: s.get('social_youtube', '', 'en'),
          telegram: s.get('social_telegram', '', 'en'),
          whatsapp: s.get('social_whatsapp', '', 'en'),
          instagram: s.get('social_instagram', '', 'en'),
          dockerhub: s.get('social_dockerhub', '', 'en'),
          virgool: s.get('social_virgool', '', 'en'),
        },
        github: {
          username: s.get('github_username', '', 'en'),
          syncEnabled: s.get('github_sync_enabled', false, 'en') === true || s.get('github_sync_enabled', 'false', 'en') === 'true',
        },
      })
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

  async function handleSiteSettingsSubmit(category) {
    setSettingsLoading(true)
    setMessage(null)

    try {
      const updates = []

      if (category === 'contact') {
        updates.push(
          { key: 'contact_email', value_en: siteSettings.contact.email, value_fa: siteSettings.contact.email },
          { key: 'contact_phone', value_en: siteSettings.contact.phone, value_fa: siteSettings.contact.phone },
          { key: 'contact_location', value_en: siteSettings.contact.location_en, value_fa: siteSettings.contact.location_fa }
        )
      } else if (category === 'social') {
        updates.push(
          { key: 'social_github', value_en: siteSettings.social.github, value_fa: siteSettings.social.github },
          { key: 'social_linkedin', value_en: siteSettings.social.linkedin, value_fa: siteSettings.social.linkedin },
          { key: 'social_twitter', value_en: siteSettings.social.twitter, value_fa: siteSettings.social.twitter },
          { key: 'social_youtube', value_en: siteSettings.social.youtube, value_fa: siteSettings.social.youtube },
          { key: 'social_telegram', value_en: siteSettings.social.telegram, value_fa: siteSettings.social.telegram },
          { key: 'social_whatsapp', value_en: siteSettings.social.whatsapp, value_fa: siteSettings.social.whatsapp },
          { key: 'social_instagram', value_en: siteSettings.social.instagram, value_fa: siteSettings.social.instagram },
          { key: 'social_dockerhub', value_en: siteSettings.social.dockerhub, value_fa: siteSettings.social.dockerhub },
          { key: 'social_virgool', value_en: siteSettings.social.virgool, value_fa: siteSettings.social.virgool }
        )
      } else if (category === 'github') {
        updates.push(
          { key: 'github_username', value_en: siteSettings.github.username, value_fa: siteSettings.github.username },
          { key: 'github_sync_enabled', value_en: siteSettings.github.syncEnabled.toString(), value_fa: siteSettings.github.syncEnabled.toString(), type: 'boolean' }
        )
      }

      const result = await updateSiteSettings(updates)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Settings updated successfully' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSettingsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'appearance', name: 'Appearance', icon: Moon },
    { id: 'storage', name: 'Storage', icon: HardDrive },
    { id: 'contact', name: 'Contact', icon: Mail },
    { id: 'social', name: 'Social', icon: Anchor },
    { id: 'github', name: 'GitHub', icon: Github },
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

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSiteSettingsSubmit('contact'); }} className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                Manage your contact details displayed on the website.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={siteSettings.contact.email || ''}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="tel"
                  value={siteSettings.contact.phone || ''}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Location (English)
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={siteSettings.contact.location_en || ''}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    contact: { ...prev.contact, location_en: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Location (Persian)
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={siteSettings.contact.location_fa || ''}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    contact: { ...prev.contact, location_fa: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="تهران، ایران"
                  dir="rtl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={settingsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {settingsLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Contact Info
            </button>
          </form>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSiteSettingsSubmit('social'); }} className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Social Links</h3>
              <p className="text-sm text-muted-foreground">
                Manage your social media profile links displayed on the website.
              </p>
            </div>

            <SocialInput
              icon={<Github size={18} />}
              label="GitHub"
              value={siteSettings.social.github || ''}
              onChange={(value) => setSiteSettings(prev => ({
                ...prev,
                social: { ...prev.social, github: value }
              }))}
              placeholder="https://github.com/username"
            />

            <SocialInput
              icon={<Linkedin size={18} />}
              label="LinkedIn"
              value={siteSettings.social.linkedin || ''}
              onChange={(value) => setSiteSettings(prev => ({
                ...prev,
                social: { ...prev.social, linkedin: value }
              }))}
              placeholder="https://linkedin.com/in/username"
            />

            <SocialInput
              icon={<Twitter size={18} />}
              label="Twitter"
              value={siteSettings.social.twitter || ''}
              onChange={(value) => setSiteSettings(prev => ({
                ...prev,
                social: { ...prev.social, twitter: value }
              }))}
              placeholder="https://twitter.com/username"
            />

            <SocialInput
              icon={<Youtube size={18} />}
              label="YouTube"
              value={siteSettings.social.youtube || ''}
              onChange={(value) => setSiteSettings(prev => ({
                ...prev,
                social: { ...prev.social, youtube: value }
              }))}
              placeholder="https://youtube.com/@username"
            />

            <SocialInput
              icon={<Send size={18} />}
              label="Telegram"
              value={siteSettings.social.telegram || ''}
              onChange={(value) => setSiteSettings(prev => ({
                ...prev,
                social: { ...prev.social, telegram: value }
              }))}
              placeholder="https://t.me/username"
            />

            <SocialInput
              icon={<MessageCircle size={18} />}
              label="WhatsApp"
              value={siteSettings.social.whatsapp || ''}
              onChange={(value) => setSiteSettings(prev => ({
                ...prev,
                social: { ...prev.social, whatsapp: value }
              }))}
              placeholder="https://wa.me/1234567890"
            />

            <SocialInput
              icon={<Instagram size={18} />}
              label="Instagram"
              value={siteSettings.social.instagram || ''}
              onChange={(value) => setSiteSettings(prev => ({
                ...prev,
                social: { ...prev.social, instagram: value }
              }))}
              placeholder="https://instagram.com/username"
            />

            <SocialInput
              icon={<Anchor size={18} />}
              label="Docker Hub"
              value={siteSettings.social.dockerhub || ''}
              onChange={(value) => setSiteSettings(prev => ({
                ...prev,
                social: { ...prev.social, dockerhub: value }
              }))}
              placeholder="https://hub.docker.com/u/username"
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Virgool
              </label>
              <div className="relative">
                <ExternalLink size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="url"
                  value={siteSettings.social.virgool || ''}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    social: { ...prev.social, virgool: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://virgool.io/@username"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={settingsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {settingsLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Social Links
            </button>
          </form>
        )}

        {/* GitHub Tab */}
        {activeTab === 'github' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSiteSettingsSubmit('github'); }} className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">GitHub Integration</h3>
              <p className="text-sm text-muted-foreground">
                Configure GitHub integration for automatic project synchronization.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                GitHub Username
              </label>
              <div className="relative">
                <Github size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={siteSettings.github.username || ''}
                  onChange={(e) => setSiteSettings(prev => ({
                    ...prev,
                    github: { ...prev.github, username: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your GitHub username for fetching repository information
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Github size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Enable Auto-Sync
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync starred repositories daily
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSiteSettings(prev => ({
                  ...prev,
                  github: { ...prev.github, syncEnabled: !prev.github.syncEnabled }
                }))}
                className={cn(
                  'relative w-14 h-8 rounded-full transition-colors',
                  siteSettings.github.syncEnabled ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform',
                    siteSettings.github.syncEnabled ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="p-4 bg-secondary/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> When auto-sync is enabled, projects marked with "Enable daily auto-sync" will have their GitHub data (stars, forks, language) updated automatically via a scheduled cron job.
              </p>
            </div>

            <button
              type="submit"
              disabled={settingsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {settingsLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save GitHub Settings
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// Helper component for social inputs
function SocialInput({ icon, label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {icon}
        </span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
