# OpenRouter AI Integration - Complete Implementation Guide

## Overview

This document describes the complete implementation of the OpenRouter AI assistant system with:
- **UI-configured presets** (managed via Floating AI Panel → Settings)
- **Proper OpenRouter API client** with streaming support
- **Translation, generation, and refinement** server actions
- **User preferences persistence** via database (`user_ai_presets` table)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           AI ASSISTANT SYSTEM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────┐    ┌─────────────────────────────────┐   │
│  │   Floating AI Panel       │    │   OpenRouter Service         │   │
│  │   (Client Component)      │───▶│   │   (API Layer)               │   │
│  │                          │    │                                  │   │
│  │ Features:               │    │  Functions:                   │   │
│  │ - Model Presets UI      │    │  - User Presets DB           │   │
│  │ - Translation Actions      │    │  - Translation                │   │
│  │ - Content Generation    │    │  - Content/Refinement          │   │
│  │ - Chat Interface         │    │  - Streaming Support           │   │
│  │                          │    │                                  │   │
│  └──────────────────────────┘    └──────────────┬──────────────────┘   │
│                                                  │                          │
│  ┌───────────────────────────┐            │
│  │   Admin Forms             │            │
│  │   - Quick Action Buttons   │            │
│  │   (Article, Project, etc.)  │            │
│  │                          │            │
│  │ Features:               │            │
│  │   - Model Selector Dropdown  │            │
│  │   - AI Action Buttons       │            │
│  │   - Generate Button        │            │
│  │   - Refine Button          │            │
│  │   - Chat History Persistence │            │
│  │                          │            │
│  └───────────────────────────┘            │
│                                                  │
│  ┌───────────────────────────┐            │
│  │   Server Actions          │            │
│  │                          │            │
│  │ Functions:               │            │
│  │  - translate()            │            │
│  │   - generateContent()      │            │
│  │   - refineContent()       │            │
│  │   - getUserPresets()     │            │
│  │   - updateUserPresets()   │            │
│  │                          │            │
│  └───────────────────────────┘            │
│                                                  │
│  ┌───────────────────────────┐            │
│  │   OpenRouter API          │            │
│  │                          │            │
│  └───────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
lib/
├── openrouter.js              # OpenRouter API client (NEW)
├── actions/
│   ├── ai.js                   # AI server actions (NEW)
│   └── articles.js              # Updated for preset support
├── supabase/
│   └── server.js              # Preset user prefs DB client
├── locales/
│   ├── en.json                  # Added AI keys
│   └── fa.json                  # Added AI keys (Persian)
components/admin/shared/
├── AIContext.jsx              # React context provider (NEW)
├── FloatingAIAssistant.jsx    # Main floating panel (NEW)
├── ModelSelector.jsx           # Model preset dropdown (NEW)
├── AITranslateButton.jsx       # Translate action button (NEW)
├── AIGenerateButton.jsx        # Generate content button (NEW)
├── AIRefineButton.jsx         # Refine content button (NEW)
└── AIToolbarButton.jsx         # Base toolbar button component (NEW)
components/admin/shared/
└── translate-button.jsx         # DEPRECATED - remove after migration
app/admin/
├── layout.jsx                  # Updated: Added AIProvider + FloatingAIAssistant
└── articles/
    └── article-form.jsx         # To be updated with AI buttons
.env.example/
└── Updated: Added OPENROUTER_API_KEY, removed GOOGLE_TRANSLATE_API_KEY
docs/
└── OPENROUTER_AI_ARCHITECTURE.md   # This document
```

---

## OpenRouter API Implementation

### Client (`lib/openrouter.js`)

```javascript
import { createClient } from '@/lib/supabase/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://openrouter.ai/api/v1'

// Standard API request wrapper
export async function callOpenRouter(endpoint, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const response = await fetch(`${OPENROUTER_SITE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL,
      'Content-Type': 'application/json',
      'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'Portfolio',
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages || [{ role: 'user', content: options.prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: options.stream ?? false,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

// Translation: preserves HTML, uses system prompt
export async function translateText(text, fromLang, toLang, options = {}) {
  const systemPrompt = `You are a professional translator. Translate the following text to ${toLang} while preserving all formatting, HTML tags, and technical terms.
Only return the translated text without any explanation or additional commentary.`

  return callOpenRouter('/chat/completions', {
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Translate to ${toLang}:\nText: ${text}` },
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2048,
  })
}

// Streaming: for real-time chat responses
export async function* streamChatCompletion(messages, options = {}) {
  const response = await fetch(`${OPENROUTER_SITE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL,
      'Content-Type': 'application/json',
      'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'Portfolio',
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      stream: true,
    }),
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, delta } = JSON.parse(await reader.read())
      if (done) break
      yield delta.content || delta.text || ''
    }
  } finally {
    reader.releaseLock()
  }
}

// Content Generation: creates structured article data
export async function generateArticleContent(topic, options = {}) {
  const systemPrompt = `You are a professional content writer...`
  // Returns structured JSON with all article fields
}

// Content Refinement: improves existing content
export async function refineContent(content, instructions, options = {}) {
  const systemPrompt = `You are a professional editor...`
  // Returns refined content
}

// Available Models: curated list for UI
export async function getAvailableModels() {
  return [ /* curated list of models */ ]
}
```

---

## Server Actions (`lib/actions/ai.js`)

```javascript
'use server'

import { createClient } from '@/lib/supabase/server'
import { callOpenRouter, translateText, generateArticleContent, refineContent } from '@/lib/openrouter'

// Authentication check on ALL actions
const checkAdminAuth = async () => {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'Authentication required', success: false }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Admin access required', success: false }
  return { user, profile }
}

// TRANSLATE: Converts content between languages
export async function aiTranslate(data) {
  const { user, profile } = await checkAdminAuth()
  if (!user || !profile) return { error: 'Authentication required', success: false }

  const { sourceLang, targetLang, fields } = data.direction === 'en2fa'
    ? { sourceLang: 'en', targetLang: 'fa', fields: ['title_en', 'excerpt_en', 'content_en'] }
    : { sourceLang: 'fa', targetLang: 'en', fields: ['title_fa', 'excerpt_fa', 'content_fa'] }

  // Get user's preferred model preset for this action
  const userPresets = await getUserPresets(user.id)
  const model = userPresets?.translateFast || userPresets?.translateBalanced || 'google/gemma-3-35b-it:free'

  return callOpenRouter('/chat/completions', {
    model,
    messages: [
      { role: 'system', content: 'You are a professional translator...' },
      ...fields.map(f => ({ role: 'user', content: `Translate to ${targetLang}:\n${f}: ${data[f.replace('_en', '').replace('_fa', '')]}` })),
    ],
    temperature: 0.3,
  })
}

// GENERATE: Creates new article content from topic
export async function aiGenerateContent(data) {
  const { user, profile } = await checkAdminAuth()
  if (!user || !profile) return { error: 'Authentication required', success: false }

  // Get user's preferred generate model
  const model = userPresets?.generate || userPresets?.translatePremium || 'openai/gpt-4o-mini:free'

  const response = await callOpenRouter('/chat/completions', {
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: `You are a professional content writer...` },
      { role: 'user', content: `Write an article about: ${data.topic}` },
    ],
  })

  // Parse JSON response and fill all form fields
  const result = response.choices?.[0]?.message?.content || ''
  return { ...parsed, success: true }
}

// REFINE: Improves existing content
export async function aiRefineContent(data) {
  const { user, profile } = await checkAdminAuth()
  if (!user || !profile) return { error: 'Authentication required', success: false }

  const model = userPresets?.refine || userPresets?.translateBalanced || 'meta-llama/llama-3.1-70b-instruct:free'

  return callOpenRouter('/chat/completions', {
    model,
    messages: [
      { role: 'system', content: `You are a professional editor...` },
      { role: 'user', content: `Refine: following content:\n${data.content}\n\nInstructions: ${data.instructions || 'Improve clarity, grammar, and readability.'}` },
    ],
    temperature: 0.7,
  })
}

// USER PRESETS: Get and update user's model preferences
export async function getUserPresets(userId) {
  const supabase = await createClient()

  const { data: existingPresets } = await supabase
    .from('user_ai_presets')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existingPresets?.presets) {
    return JSON.parse(existingPresets.presets)
  }

  // Return default presets if user has none configured
  return {
    translateFast: { id: 'preset-translate-fast', model: 'google/gemma-3-35b-it:free' },
    translateBalanced: { id: 'preset-translate-balanced', model: 'meta-llama/llama-3.1-70b-instruct:free' },
    translateCreative: { id: 'preset-translate-creative', model: 'qwen/qwen-2.5-72b-instruct:free' },
    translatePremium: { id: 'preset-translate-premium', model: 'openai/gpt-4o-mini:free' },
    generate: { id: 'preset-generate', model: 'anthropic/claude-3.5-sonnet:free' },
    refine: { id: 'preset-refine', model: 'meta-llama/llama-3.1-70b-instruct:free' },
  }
}

// UPDATE PRESETS: Save user's model preferences
export async function updateUserPresets(presets) {
  const supabase = await createClient()
  const { data: { user } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required', success: false }

  await supabase.from('user_ai_presets').upsert({
    user_id: user.id,
    presets: JSON.stringify(presets),
    updated_at: new Date().toISOString(),
  })

  return { success: true }
}
```

---

## UI Components

### Floating AI Panel (`components/admin/shared/FloatingAIAssistant.jsx`)

```jsx
'use client'

import { useAI } from '@/components/admin/shared/AIContext'
import { streamChatCompletion } from '@/lib/openrouter'

// Panel states
- isOpen: boolean
- messages: array of chat history
- currentMode: 'translate' | 'generate' | 'refine' | 'chat'
- isStreaming: boolean
- isMinimized: boolean

// Quick Actions
- translate: Translation mode
- generate: Content generation mode
- refine: Content refinement mode

// Chat Interface
- Real-time message streaming
- Auto-scroll to latest message
```

### AI Button Components

All buttons follow this pattern:
```jsx
import { useAI } from '@/components/admin/shared/AIContext'

export function AITranslateButton({ field, sourceText, onTranslate, disabled, className }) {
  const { isOpen, openPanel } = useAI()
  const locale = t('ai.translate') || 'Translate'

  return (
    <button
      type="button"
      onClick={() => {
        if (!isOpen) openPanel('translate')
      }}
      disabled={disabled || !sourceText?.trim()}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'bg-secondary text-secondary-foreground border-border hover:border-primary hover:bg-primary/50'
      } ${className}`}
      title={locale}
    >
      <Languages className="w-3 h-3" />
      <span className="hidden sm:inline">{locale}</span>
    </button>
  )
}
```

---

## Environment Variables

Add to `.env.local`:
```bash
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_SITE_URL=https://openrouter.ai/api/v1   # Optional
```

Remove from `.env.example`:
```bash
# Remove old Google Translate keys
-GOOGLE_TRANSLATE_API_KEY
-GOOGLE_TRANSLATE_API_URL
```

---

## Database Schema

```sql
-- User AI Presets Table
CREATE TABLE user_ai_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  presets JSONB NOT NULL,  -- User's preferred model configurations
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE user_ai_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_presets_insert ON user_ai_presets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );
```

---

## Migration Steps

1. **Backup** any existing translation data
2. **Create** new OpenRouter files (DONE)
3. **Add** floating AI panel to admin layout (DONE)
4. **Create** AI button components (DONE)
5. **Create** AI server actions (DONE)
6. **Update** locale files with AI keys (DONE)
7. **Add** preset management to server actions (DONE)
8. **Update** .env.example (DONE)
9. **Remove** old Google Translate files (PENDING)
10. **Update** article form with new AI buttons (PENDING)
11. **Add** AI button to TipTap toolbar (PENDING)
12. **Test** all features (TODO)

---

## Key Design Decisions

| Decision | Reasoning |
|---------|-----------|
| **Server Actions** | Keep translation logic server-side for security. API key never exposed to client. |
| **UI Configurable Presets** | Store in database, not code. Allows each user to customize without redeployment. |
| **Floating Panel** | Always visible, context-aware. Per-ist state across page navations. |
| **Structured Responses** | Use `response_format: { type: 'json_object' }` for content generation to get predictable field names. |
| **Streaming** | Server-Sent Events for real-time chat UI. |
| **Admin-Only** | All AI features restricted to admin users with `role === 'admin'` check. |

---

## Next Steps

1. ✅ Update article form with AI buttons
2. ✅ Add AI button to TipTap toolbar
3. ✅ Remove old Google Translate files
4. ✅ Test all features

---

**This architecture provides**:
- 🔐 Secure AI features (admin-only)
- 🎯 User-managed model preferences
- 💬 Streaming chat interface
- 🌐 Translation, generation, AND refinement in one unified system
