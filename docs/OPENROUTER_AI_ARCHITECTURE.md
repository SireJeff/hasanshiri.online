# OpenRouter AI Integration Architecture

## Overview

Refactor the translation system to use **OpenRouter's smart LLM models** instead of Google Cloud Translation API. Add a **Floating AI Panel** accessible throughout the admin area for translation, content creation, and refinement.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI ASSISTANT SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────┐    ┌─────────────────────────────────┐   │
│  │   Floating AI Panel       │    │   OpenRouter Service         │   │
│  │   (Client Component)      │───▶│   │   (API Layer)               │   │
│  │                          │    │                                  │   │
│  │ Features:               │    │  Functions:                   │   │
│  │ - Translation            │    │  - callOpenRouter()          │   │
│  │ - Content Generation      │    │  - streamCompletion()        │   │
│  │ - Content Refinement    │    │  - chatWithHistory()        │   │
│  │ - Model Presets         │    │  - getAvailableModels()      │   │
│  │ - Chat History           │    │                                  │   │
│  └──────────────────────────┘    └──────────────┬──────────────────┘   │
│                                                  │                          │
│  ┌───────────────────────────┐            │
│  │   Admin Forms             │            │
│  │   (Article, Project, etc.)  │            │
│  │                          │            │
│  │ Features:               │            │
│  │ - Model Selector         │            │
│  │ - Quick Translate Buttons  │            │
│  │ - Generate Button        │            │
│  │ - Refine Button          │            │
│  └───────────────────────────┘            │
│                                                  │
│  ┌───────────────────────────┐            │
│  │   Server Actions          │            │
│  │   (API Layer)              │            │
│  │                          │            │
│  │ Functions:               │            │
│  │ - aiTranslate()         │            │
│  │ - aiGenerateContent()   │            │
│  │ - aiRefineContent()     │            │
│  │ - getModels()           │            │
│  │ - updatePreset()         │            │
│  └───────────────────────────┘            │
│                                                  │
│  ┌───────────────────────────┐            │
│  │   OpenRouter API          │            │
│  │                          │            │
│  └───────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
app/admin/layout.jsx
│
├── AdminSidebar (z-40)
├── FloatingAIAssistant (z-50) ← NEW
└── Main Content (z-0)
    │
    └── {children}
        ├── articles/article-form.jsx
        │   ├── Model Selector (3 presets)
        │   ├── Quick Translate Buttons
        │   ├── Generate Content Button
        │   └── Refine Button
        └── projects/form.jsx
            └── (similar structure)
```

---

## Key Features

### 1. Floating AI Panel

**Location**: Bottom-right corner, expandable/collapsible

**Features**:
- 🎯 **Model Presets** (3 quality levels):
  - **Fast/Cheap** (Gemma-3-35B-it) - Quick translations, UI strings
  - **Balanced** (Llama-3.1-70B-Instruct) - Quality translations, articles
  - **Creative** (Qwen-2.5-72B-Instruct) - Literary content, nuanced
  - **Premium** (GPT-4o) - Highest quality, complex content (use sparingly)

- 🌐 **Translation Mode**: Translate existing content between languages
- ✨ **Content Generation**: Generate new article from topic/prompt
- 🔧 **Content Refinement**: Improve/polish existing content
- 💬 **Chat Interface**: Conversation history for iterative refinement

**UI Pattern**: Follows existing `ChatWidget.jsx` pattern
```jsx
// Floating button (bottom-right)
className="fixed bottom-6 right-6 z-50 w-14 h-14
           bg-primary text-primary-foreground rounded-full
           hover:scale-105 animate-bounce"

// Panel (bottom-right, expanded)
className="fixed bottom-24 right-6 z-50 w-[400px]
           h-[600px] max-h-[calc(100vh-8rem)]"
```

### 2. Model Preset System

User manages presets themselves - these are **not hardcoded**:

**Preset Configuration** (stored in user preferences/database):
```typescript
interface ModelPreset {
  id: string
  name: string
  model: string        // OpenRouter model ID
  provider: string     // openrouter, google, anthropic, etc.
  contextLimit: number // Token limit for context
  temperature?: number
  maxTokens?: number
}

interface UserPresets {
  translateFast: ModelPreset      // Gemma-3
  translateBalanced: ModelPreset   // Llama-3.1
  translateCreative: ModelPreset   // Qwen-2.5
  translatePremium: ModelPreset    // GPT-4o
  generate: ModelPreset            // User-selected default
  refine: ModelPreset              // User-selected default
}
```

**Default Presets**:
```javascript
const defaultPresets: UserPresets = {
  translateFast: {
    id: 'preset-translate-fast',
    name: 'Fast & Cheap',
    model: 'google/gemma-3-35b-it:free',
    provider: 'google',
    temperature: 0.3,
    maxTokens: 4096,
    contextLimit: 8000,
  },
  translateBalanced: {
    id: 'preset-translate-balanced',
    name: 'Balanced',
    model: 'meta-llama/llama-3.1-70b-instruct:free',
    provider: 'meta',
    temperature: 0.5,
    maxTokens: 8192,
    contextLimit: 16000,
  },
  translateCreative: {
    id: 'preset-translate-creative',
    name: 'Creative',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    provider: 'qwen',
    temperature: 0.8,
    maxTokens: 8192,
    contextLimit: 16000,
  },
  translatePremium: {
    id: 'preset-translate-premium',
    name: 'Premium',
    model: 'openai/gpt-4o-mini:free',
    provider: 'openai',
    temperature: 0.7,
    maxTokens: 16384,
    contextLimit: 32000,
  },
  generate: {
    id: 'preset-generate',
    name: 'Content Generation',
    model: 'anthropic/claude-3.5-sonnet:free',
    provider: 'anthropic',
    temperature: 1.0,
    maxTokens: 16384,
    contextLimit: 100000,
  },
  refine: {
    id: 'preset-refine',
    name: 'Refinement',
    model: 'meta-llama/llama-3.1-70b-instruct:free',
    provider: 'meta',
    temperature: 0.7,
    maxTokens: 4096,
    contextLimit: 8000,
  },
}
```

### 3. Admin Form Integration

**Article Form** - Quick actions under each field:
```jsx
<div className="flex items-center justify-between mb-1.5">
  <label>Title (English) *</label>
  <div className="flex gap-2">
    <ModelSelector currentPreset="translateFast" onChange={handlePresetChange} />
    <AITranslateButton field="title_en" targetField="title_fa" mode="translate" />
    <AIGenerateButton field="title_en" mode="generate" />
    <AIRefineButton field="title_en" mode="refine" />
  </div>
</div>
```

**TipTap Editor** - Toolbar button:
```jsx
<ToolbarGroup>
  <ToolbarButton
    onClick={() => setShowAIPanel(true)}
    title="AI Generate Content"
  >
    <Sparkles className="w-4 h-4" />
  </ToolbarButton>
</ToolbarGroup>
```

---

## OpenRouter Integration

### API Client Structure

**File**: `lib/openrouter.js`

```javascript
import { createClient } from '@/lib/supabase/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://openrouter.ai/api/v1'

export async function callOpenRouter(endpoint, options = {}) {
  const response = await fetch(`${OPENROUTER_SITE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages || [{ role: 'user', content: options.prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
      stream: options.stream || false,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

// Translation functions
export async function translateText(text, fromLang, toLang, options = {}) {
  const prompt = `Translate the following text to ${toLang}. Preserve all formatting, HTML tags, and technical terms.\n\nText: ${text}`

  return callOpenRouter('/chat/completions', {
    model: options.model,
    messages: [
      { role: 'system', content: 'You are a professional translator...' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  })
}

// Content generation
export async function generateArticleContent(topic, contentType, options = {}) {
  const systemPrompt = `You are a professional content writer...`

  return callOpenRouter('/chat/completions', {
    model: options.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Write an article about: ${topic}...` },
    ],
    temperature: options.temperature || 1.0,
    max_tokens: options.maxTokens || 4000,
  })
}

// Streaming support for chat
export async function* streamChatCompletion(messages, options = {}) {
  const response = await fetch(`${OPENROUTER_SITE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      stream: true,
    }),
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, delta } = JSON.parse(await reader.read())
    if (done) break
    yield delta.content || delta.text || ''
  }
}
```

---

## Server Actions

**File**: `lib/actions/ai.js` (NEW)

```javascript
'use server'

import { createClient } from '@/lib/supabase/server'
import { callOpenRouter } from '@/lib/openrouter'

// Translate field(s)
export async function aiTranslate(data) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ... auth check ...

  const result = await callOpenRouter('/chat/completions', {
    model: data.model,
    messages: data.messages,
  })

  return { translated: result.choices[0].message.content }
}

// Generate article content
export async function aiGenerateContent(data) {
  // ... auth check ...

  const result = await callOpenRouter('/chat/completions', {
    model: data.model,
    messages: data.messages,
  })

  return {
    title_en: result.choices[0].message.content,
    excerpt_en: ...,
    content_en: ...,
    slug: ..., // generated from title
  }
}

// Refine content
export async function aiRefineContent(data) {
  // ... auth check ...

  const result = await callOpenRouter('/chat/completions', {
    model: data.model,
    messages: data.messages,
  })

  return { refined: result.choices[0].message.content }
}

// User presets management
export async function getUserPresets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: presets } = await supabase
    .from('user_ai_presets')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return presets || defaultPresets
}

export async function updateUserPresets(presets) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('user_ai_presets')
    .upsert({
      user_id: user.id,
      presets: JSON.stringify(presets),
      updated_at: new Date().toISOString(),
    })

  return { success: true }
}
```

---

## New Files to Create

| File | Purpose |
|------|---------|
| `lib/openrouter.js` | OpenRouter API client |
| `lib/actions/ai.js` | AI server actions |
| `components/admin/shared/FloatingAIAssistant.jsx` | Floating AI panel |
| `components/admin/shared/AIContext.jsx` | AI context provider |
| `components/admin/shared/ModelSelector.jsx` | Model preset dropdown |
| `components/admin/shared/AITranslateButton.jsx` | Single translate button |
| `components/admin/shared/AIGenerateButton.jsx` | Generate content button |
| `components/admin/shared/AIRefineButton.jsx` | Refine content button |
| `components/admin/shared/AIToolbarButton.jsx` | Base toolbar button component |
| `app/admin/admin-layout-client.jsx` | Client wrapper for floating panel |

---

## Migration Steps

1. **Create new files** (listed above)
2. **Update admin layout** - Add `FloatingAIAssistant`
3. **Update article form** - Replace Google Translate with AI buttons
4. **Update TipTap editor** - Add AI generation button to toolbar
5. **Update project form** - Add AI buttons
6. **Add environment variable** - `OPENROUTER_API_KEY`
7. **Remove old files**:
   - `lib/utils/translation.js`
   - `lib/actions/translation.js`
   - `components/admin/shared/translate-button.jsx`
8. **Update `.env.example`** - Remove `GOOGLE_TRANSLATE_API_KEY`, add `OPENROUTER_API_KEY`

---

## UI Mockup

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                               │
│                    FLOATING AI PANEL                            │
│                                                               │
│   ┌─────────────────────────────────────────────────────────────┐     │
│   │ Model: [Balanced ▾]                        │     │
│   ├──────────────────────────────────────────────────────────┤     │
│   │ Modes: ○ Translate  ✨ Generate  🔧 Refine      │     │
│   ├──────────────────────────────────────────────────────────┤     │
│   │                                                │     │
│   │ ┌─────────────────────────────────────────────┐       │     │
│   │ │ Chat & History                   │       │     │
│   │ │                                    │       │     │
│   │ │ [Recent]                     │       │     │
│   │ │ ────────────────────────────────       │       │     │
│   │ │ User: Translate this title...  │       │     │
│   │ │ AI: Sure, here's the Persian...  │       │     │
│   │ │                                    │       │     │
│   │ └───────────────────────────────────────       │     │
│   │                                    │       │     │
│   └───────────────────────────────────────────────       │     │
│                                                │     │
│   ───────────────────────────────────────────────────────── │     │
│           [−]                            [Expand]   │     │
└────────────────────────────────────────────────────────────────┘     │
                                                │
                                                │
┌────────────────────────────────────────────────────────────────┐
│              ADMIN FORM WITH AI BUTTONS                  │
├──────────────────────────────────────────────────────────────────┤
│                                                        │
│  Title (English) *                    [Generate] [Refine]     │
│  ┌─────────────────────┬──────────────────────────┐       │
│  │ [Fast ▾] [Translate] [Generate] [Refine]      │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                        │
│  Excerpt (English)                   [Generate] [Refine]     │
│  ┌─────────────────────┬──────────────────────────┐       │
│  │ [Balanced ▾] [Translate] [Generate] [Refine]       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                        │
│  Content (English) *                 [Generate] [Refine]     │
│  ┌─────────────────────┬──────────────────────────┐       │
│  │ [Creative ▾] [Translate] [Generate] [Refine]       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                        │
└────────────────────────────────────────────────────────────────┘
                                                │
```

---

## Key Design Decisions

### Why OpenRouter vs Direct APIs?

| Aspect | OpenRouter | Direct API |
|---------|-------------|-------------|
| **Model Access** | 100+ models via single API | 1 model, provider lock-in |
| **Cost** | Pay per usage | Usage limits, potential quota |
| **Flexibility** | Switch models dynamically | Need API key per provider |
| **Streaming** | Built-in support | Must implement manually |
| **Future** | Easy model additions | Provider may add/remove models |

### Architecture Trade-offs

| Approach | Pros | Cons |
|-----------|------|-------|
| **Context Provider** | Shared state, easy testing | More complex, TypeScript overhead |
| **Individual Props** | Simple, explicit | Drilling props through tree |
| **Server Action** | Secure, cacheable | More client-server round trips |

**Decision**: Use **React Context** for shared AI state (panel open/close, history, current mode) combined with **Server Actions** for API calls.

---

## Color Scheme (Dark Mode Compatible)

```css
/* Floating AI Panel */
--ai-panel-bg: rgba(var(--background), 0.9);
--ai-panel-border: rgba(var(--border), 0.2);
--ai-panel-text: var(--foreground);

/* Button Colors */
--ai-translate-bg: #3b82f6;    /* Blue */
--ai-generate-bg: #8b5cf6;     /* Purple */
--ai-refine-bg: #10b981;      /* Teal */
--ai-streaming-bg: #22c55e;    /* Animated gradient */
```

---

## Database Schema Changes

```sql
-- User AI Presets Table
CREATE TABLE user_ai_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  presets JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_user_ai_presets_user_id ON user_ai_presets(user_id);

-- RLS Policy
ALTER TABLE user_ai_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_presets_insert ON user_ai_presets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );
```

---

## Implementation Checklist

- [ ] OpenRouter service client (`lib/openrouter.js`)
- [ ] AI context provider (`components/admin/shared/AIContext.jsx`)
- [ ] Floating AI panel (`components/admin/shared/FloatingAIAssistant.jsx`)
- [ ] Model selector component (`components/admin/shared/ModelSelector.jsx`)
- [ ] AI button components (Translate/Generate/Refine)
- [ ] AI server actions (`lib/actions/ai.js`)
- [ ] Update article form with new AI buttons
- [ ] Add AI button to TipTap editor toolbar
- [ ] Update admin layout to include floating panel
- [ ] User presets management (database + API)
- [ ] Environment variables setup
- [ ] Remove old Google Translate files
- [ ] CSS animations for panel
- [ ] Testing and documentation

---

**Resources:**
- OpenRouter Docs: https://openrouter.ai/docs
- OpenRouter Models: https://openrouter.ai/models
- Streaming Pattern: https://sdk.vercel.ai/docs/ai-sdk/core/streaming
