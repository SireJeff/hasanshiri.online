# AI Generation & Translation Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add "Generate Article" and "Translate All" buttons to article/project forms to enable full-content AI generation and batch translation.

**Architecture:** Create reusable modal components for AI generation prompts, add batch translation server actions, and integrate new buttons into form headers. Follow existing patterns from `BilingualAIField` and `FloatingAIAssistant`.

**Tech Stack:** Next.js 15, React, Server Actions, OpenRouter API, Tailwind CSS, lucide-react icons

---

## Overview

### Features to Build:
1. **Article Generator** - Modal with prompt input, generates all English fields, then user can "Translate All"
2. **Translate All Button** - Batch translates all English fields to Persian (or vice versa)
3. **Same features for Project form**

### Files to Modify/Create:
| File | Action |
|------|--------|
| `lib/actions/ai.js` | Modify - add `aiGenerateArticle`, `aiTranslateAll` |
| `components/admin/shared/AIGenerateModal.jsx` | Create - reusable modal for generation prompts |
| `app/admin/articles/article-form.jsx` | Modify - add Generate & Translate All buttons |
| `components/admin/projects/project-form.jsx` | Modify - add Generate & Translate All buttons |

---

## Task 1: Add Server Actions for Batch Operations

**Files:**
- Modify: `lib/actions/ai.js:200-420`

**Step 1: Add `aiGenerateArticle` server action**

Add this new function after `aiGenerateContent` (around line 206):

```javascript
/**
 * Generate complete article from a topic/prompt
 * Generates: title, excerpt, content, slug, meta fields (English only)
 * @param {Object} data - { topic: string, tone?: string }
 * @returns {Promise<Object>} Generated article fields
 */
export async function aiGenerateArticle(data) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Authentication required', success: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', success: false }
  }

  try {
    const { topic, tone = 'professional' } = data

    const presetsResult = await getUserPresets()
    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    const model = userPresets.generate

    if (!model) {
      return { error: 'No generation preset configured. Please set a preset in AI Settings.', success: false }
    }

    const systemPrompt = `You are a professional content writer for a bilingual portfolio website.

Generate a complete article based on the following topic: "${topic}"

IMPORTANT: Respond with ONLY a valid JSON object (no markdown, no code blocks). Include these exact fields:
{
  "title_en": "Engaging article title",
  "excerpt_en": "2-3 sentence compelling description",
  "content_en": "Full HTML content with proper headings, paragraphs, and formatting. Use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags as appropriate.",
  "slug": "url-friendly-slug-lowercase-with-hyphens",
  "meta_title_en": "SEO title (50-60 characters)",
  "meta_description_en": "SEO description (150-160 characters)"
}

Guidelines:
- Title should be engaging and clear
- Content should be well-structured with headings
- Write for a ${tone} audience
- Include practical, actionable information
- Slug must be lowercase, hyphen-separated, no special characters`

    const response = await callOpenRouter('/chat/completions', {
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Write an article about: ${topic}` },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    })

    const result = response.choices?.[0]?.message?.content

    let parsed = {}
    try {
      // Handle potential markdown code blocks
      let cleanResult = result
      if (result.includes('```json')) {
        cleanResult = result.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      } else if (result.includes('```')) {
        cleanResult = result.replace(/```\s*/g, '')
      }
      parsed = typeof cleanResult === 'string' ? JSON.parse(cleanResult.trim()) : cleanResult
    } catch (e) {
      console.error('Failed to parse AI response:', e, 'Raw:', result)
      return { error: 'Failed to parse generated content. Please try again.', success: false }
    }

    return { ...parsed, success: true }
  } catch (error) {
    console.error('AI article generation error:', error)
    return getActionableError(error)
  }
}
```

**Step 2: Add `aiTranslateAll` server action**

Add this new function after `aiGenerateArticle`:

```javascript
/**
 * Translate all article fields from one language to another
 * @param {Object} data - { fields: { title_en, excerpt_en, content_en, meta_title_en, meta_description_en }, direction: 'en2fa' | 'fa2en' }
 * @returns {Promise<Object>} Translated fields
 */
export async function aiTranslateAll(data) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Authentication required', success: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', success: false }
  }

  try {
    const { fields, direction = 'en2fa' } = data
    const isEnToFa = direction === 'en2fa'
    const sourceLang = isEnToFa ? 'English' : 'Persian'
    const targetLang = isEnToFa ? 'Persian' : 'English'

    const presetsResult = await getUserPresets()
    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    const model = userPresets.translateBalanced || userPresets.translateFast

    if (!model) {
      return { error: 'No translation preset configured. Please set a preset in AI Settings.', success: false }
    }

    // Build content to translate
    const contentParts = []
    const fieldMap = [
      { source: isEnToFa ? 'title_en' : 'title_fa', target: isEnToFa ? 'title_fa' : 'title_en', label: 'TITLE' },
      { source: isEnToFa ? 'excerpt_en' : 'excerpt_fa', target: isEnToFa ? 'excerpt_fa' : 'excerpt_en', label: 'EXCERPT' },
      { source: isEnToFa ? 'content_en' : 'content_fa', target: isEnToFa ? 'content_fa' : 'content_en', label: 'CONTENT' },
      { source: isEnToFa ? 'meta_title_en' : 'meta_title_fa', target: isEnToFa ? 'meta_title_fa' : 'meta_title_en', label: 'META_TITLE' },
      { source: isEnToFa ? 'meta_description_en' : 'meta_description_fa', target: isEnToFa ? 'meta_description_fa' : 'meta_description_en', label: 'META_DESCRIPTION' },
    ]

    for (const map of fieldMap) {
      const content = fields[map.source]
      if (content && content.trim()) {
        contentParts.push(`[${map.label}]\n${content}\n[/${map.label}]`)
      }
    }

    if (contentParts.length === 0) {
      return { error: 'No content to translate', success: false }
    }

    const systemPrompt = `You are a professional translator for a bilingual portfolio website.
Translate the following ${sourceLang} content to ${targetLang}.

IMPORTANT RULES:
- Preserve ALL HTML tags and structure exactly
- Preserve technical terms, code, and URLs
- Each section is marked with [LABEL]...[/LABEL] tags
- Return the translation with the SAME section labels
- Do not add explanations or commentary

Return format:
[LABEL]
translated content here
[/LABEL]
[next label]
translated content here
[/next label]`

    const response = await callOpenRouter('/chat/completions', {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contentParts.join('\n\n') },
      ],
      temperature: 0.3,
      max_tokens: 6000,
    })

    const translatedContent = response.choices?.[0]?.message?.content || ''

    // Parse the translated sections
    const translated = {}
    for (const map of fieldMap) {
      const regex = new RegExp(`\\[${map.label}\\]([\\s\\S]*?)\\[\\/${map.label}\\]`, 'i')
      const match = translatedContent.match(regex)
      if (match && match[1]) {
        translated[map.target] = match[1].trim()
      }
    }

    return { translated, success: true }
  } catch (error) {
    console.error('AI batch translation error:', error)
    return getActionableError(error)
  }
}
```

**Step 3: Add `aiGenerateProject` server action**

Add this new function after `aiTranslateAll`:

```javascript
/**
 * Generate complete project from a description/prompt
 * Generates: title, short description, long description (English only)
 * @param {Object} data - { description: string, techStack?: string }
 * @returns {Promise<Object>} Generated project fields
 */
export async function aiGenerateProject(data) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Authentication required', success: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', success: false }
  }

  try {
    const { description, techStack = '' } = data

    const presetsResult = await getUserPresets()
    if (!presetsResult.success) {
      return { error: presetsResult.error || 'Failed to get presets', success: false }
    }

    const userPresets = presetsResult.presets || {}
    const model = userPresets.projectGenerator || userPresets.generate

    if (!model) {
      return { error: 'No generation preset configured. Please set a preset in AI Settings.', success: false }
    }

    const systemPrompt = `You are a professional technical writer for a portfolio website.

Generate a complete project description based on: "${description}"
${techStack ? `Technologies: ${techStack}` : ''}

IMPORTANT: Respond with ONLY a valid JSON object (no markdown, no code blocks). Include these exact fields:
{
  "title_en": "Project name (concise)",
  "description_en": "Short description (1-2 sentences, under 160 characters)",
  "long_description_en": "Detailed HTML description with features, architecture, and highlights. Use <h3>, <p>, <ul>, <li>, <strong> tags."
}

Guidelines:
- Title should be catchy but professional
- Short description is for cards/previews
- Long description should cover: features, tech used, your role
- Write in first person ("I built...", "This project...")`

    const response = await callOpenRouter('/chat/completions', {
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a project description for: ${description}` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const result = response.choices?.[0]?.message?.content

    let parsed = {}
    try {
      let cleanResult = result
      if (result.includes('```json')) {
        cleanResult = result.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      } else if (result.includes('```')) {
        cleanResult = result.replace(/```\s*/g, '')
      }
      parsed = typeof cleanResult === 'string' ? JSON.parse(cleanResult.trim()) : cleanResult
    } catch (e) {
      console.error('Failed to parse AI response:', e, 'Raw:', result)
      return { error: 'Failed to parse generated content. Please try again.', success: false }
    }

    return { ...parsed, success: true }
  } catch (error) {
    console.error('AI project generation error:', error)
    return getActionableError(error)
  }
}
```

**Step 4: Verify file compiles**

Run: `npm run build 2>&1 | head -20`
Expected: No syntax errors (type errors are OK for now)

**Step 5: Commit**

```bash
git add lib/actions/ai.js
git commit -m "feat: add aiGenerateArticle, aiTranslateAll, aiGenerateProject actions"
```

---

## Task 2: Create AIGenerateModal Component

**Files:**
- Create: `components/admin/shared/AIGenerateModal.jsx`

**Step 1: Create the modal component**

```jsx
'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2, Languages } from 'lucide-react'

/**
 * Reusable modal for AI content generation
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onGenerate - Generate handler (async)
 * @param {Function} props.onTranslateAll - Translate all handler (async)
 * @param {string} props.title - Modal title (e.g., "Generate Article")
 * @param {string} props.placeholder - Prompt placeholder text
 * @param {string} props.label - Input label (e.g., "Topic" or "Description")
 * @param {boolean} props.showTranslateAll - Show "Translate All" button
 * @param {Object} props.hasContent - Which content exists { title: boolean, excerpt: boolean, content: boolean }
 */
export function AIGenerateModal({
  isOpen,
  onClose,
  onGenerate,
  onTranslateAll,
  title = 'Generate Content',
  placeholder = 'Enter a topic or description...',
  label = 'Topic',
  showTranslateAll = true,
  hasContent = {},
}) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a topic or description')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      await onGenerate(prompt.trim())
      setPrompt('')
      onClose()
    } catch (err) {
      setError(err.message || 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTranslateAll = async () => {
    setIsTranslating(true)
    setError(null)

    try {
      await onTranslateAll()
      onClose()
    } catch (err) {
      setError(err.message || 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  const hasAnyContent = hasContent.title || hasContent.excerpt || hasContent.content

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {label}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isTranslating || !prompt.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Content
                </>
              )}
            </button>

            {showTranslateAll && (
              <button
                onClick={handleTranslateAll}
                disabled={isGenerating || isTranslating || !hasAnyContent}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4" />
                    Translate All to Persian
                  </>
                )}
              </button>
            )}
          </div>

          {/* Hint */}
          {showTranslateAll && !hasAnyContent && (
            <p className="text-xs text-muted-foreground text-center">
              Generate content first, then use "Translate All" to create Persian version
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/admin/shared/AIGenerateModal.jsx
git commit -m "feat: add AIGenerateModal component for AI generation prompts"
```

---

## Task 3: Integrate AI Features into Article Form

**Files:**
- Modify: `app/admin/articles/article-form.jsx`

**Step 1: Add imports and state**

At the top of the file, add imports after line 9:

```jsx
import { Sparkles, Languages } from 'lucide-react'
import { AIGenerateModal } from '@/components/admin/shared/AIGenerateModal'
import { aiGenerateArticle, aiTranslateAll } from '@/lib/actions/ai'
```

Add state after line 28 (after `const [errors, setErrors] = useState({})`):

```jsx
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [isTranslatingAll, setIsTranslatingAll] = useState(false)
```

**Step 2: Add handler functions**

Add these functions after `handleGenerateSlug` (around line 63):

```jsx
  const handleGenerateArticle = async (topic) => {
    const result = await aiGenerateArticle({ topic })

    if (result.error) {
      throw new Error(result.error)
    }

    // Update form with generated content
    setFormData(prev => ({
      ...prev,
      title_en: result.title_en || prev.title_en,
      excerpt_en: result.excerpt_en || prev.excerpt_en,
      content_en: result.content_en || prev.content_en,
      slug: result.slug || prev.slug,
      meta_title_en: result.meta_title_en || prev.meta_title_en,
      meta_description_en: result.meta_description_en || prev.meta_description_en,
    }))
  }

  const handleTranslateAll = async () => {
    setIsTranslatingAll(true)

    try {
      const result = await aiTranslateAll({
        fields: {
          title_en: formData.title_en,
          excerpt_en: formData.excerpt_en,
          content_en: formData.content_en,
          meta_title_en: formData.meta_title_en,
          meta_description_en: formData.meta_description_en,
        },
        direction: 'en2fa',
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // Update form with translations
      setFormData(prev => ({
        ...prev,
        title_fa: result.translated?.title_fa || prev.title_fa,
        excerpt_fa: result.translated?.excerpt_fa || prev.excerpt_fa,
        content_fa: result.translated?.content_fa || prev.content_fa,
        meta_title_fa: result.translated?.meta_title_fa || prev.meta_title_fa,
        meta_description_fa: result.translated?.meta_description_fa || prev.meta_description_fa,
      }))
    } finally {
      setIsTranslatingAll(false)
    }
  }
```

**Step 3: Add buttons to header**

In the header section (after line 127, inside the `<div className="flex items-center gap-2">`), add:

```jsx
        <div className="flex items-center gap-2">
          {/* AI Buttons */}
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
            disabled={isTranslatingAll || (!formData.title_en && !formData.excerpt_en && !formData.content_en)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {isTranslatingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Languages className="w-4 h-4" />
            )}
            Translate All
          </button>
        </div>
```

**Step 4: Add modal at end of component**

Before the final `</div>` of the component (around line 380), add:

```jsx
      {/* AI Generate Modal */}
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
          title: !!formData.title_en,
          excerpt: !!formData.excerpt_en,
          content: !!formData.content_en,
        }}
      />
```

**Step 5: Verify and commit**

```bash
git add app/admin/articles/article-form.jsx
git commit -m "feat: add Generate Article and Translate All buttons to article form"
```

---

## Task 4: Integrate AI Features into Project Form

**Files:**
- Modify: `components/admin/projects/project-form.jsx`

**Step 1: Add imports and state**

Add imports after line 11:

```jsx
import { Sparkles, Languages, Loader2 } from 'lucide-react'
import { AIGenerateModal } from '@/components/admin/shared/AIGenerateModal'
import { aiGenerateProject, aiTranslateAll } from '@/lib/actions/ai'
```

Add state after line 28:

```jsx
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [isTranslatingAll, setIsTranslatingAll] = useState(false)
```

**Step 2: Add handler functions**

Add after `handleAutoFillGitHub` function (find a good spot around line 150+):

```jsx
  const handleGenerateProject = async (description) => {
    const result = await aiGenerateProject({ description })

    if (result.error) {
      throw new Error(result.error)
    }

    setFormData(prev => ({
      ...prev,
      title_en: result.title_en || prev.title_en,
      description_en: result.description_en || prev.description_en,
      long_description_en: result.long_description_en || prev.long_description_en,
    }))
  }

  const handleTranslateAll = async () => {
    setIsTranslatingAll(true)

    try {
      const result = await aiTranslateAll({
        fields: {
          title_en: formData.title_en,
          excerpt_en: formData.description_en,
          content_en: formData.long_description_en,
        },
        direction: 'en2fa',
      })

      if (result.error) {
        throw new Error(result.error)
      }

      setFormData(prev => ({
        ...prev,
        title_fa: result.translated?.title_fa || prev.title_fa,
        description_fa: result.translated?.excerpt_fa || prev.description_fa,
        long_description_fa: result.translated?.content_fa || prev.long_description_fa,
      }))
    } finally {
      setIsTranslatingAll(false)
    }
  }
```

**Step 3: Add buttons to project form header**

Find the header section with the back button and title, add buttons similar to article form.

**Step 4: Add modal at end of component**

```jsx
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
          title: !!formData.title_en,
          excerpt: !!formData.description_en,
          content: !!formData.long_description_en,
        }}
      />
```

**Step 5: Verify and commit**

```bash
git add components/admin/projects/project-form.jsx
git commit -m "feat: add Generate Project and Translate All buttons to project form"
```

---

## Task 5: Testing & Verification

**Step 1: Test Article Generation**
1. Navigate to `/admin/articles/new`
2. Click "Generate" button
3. Enter a topic
4. Verify English fields are populated
5. Click "Translate All"
6. Verify Persian fields are populated

**Step 2: Test Project Generation**
1. Navigate to `/admin/projects/new`
2. Click "Generate" button
3. Enter a project description
4. Verify English fields are populated
5. Click "Translate All"
6. Verify Persian fields are populated

**Step 3: Build verification**

```bash
npm run build
```

Expected: Build succeeds without errors

---

## Summary

| Feature | Component | Server Action |
|---------|-----------|---------------|
| Generate Article | `AIGenerateModal` | `aiGenerateArticle` |
| Generate Project | `AIGenerateModal` | `aiGenerateProject` |
| Translate All | Form handlers | `aiTranslateAll` |

### User Flow:
1. User clicks "Generate" button
2. Modal opens with prompt input
3. User enters topic/description
4. AI generates all English fields
5. User clicks "Translate All" button
6. AI translates all fields to Persian
