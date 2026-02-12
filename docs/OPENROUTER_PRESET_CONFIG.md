# OpenRouter Preset Configuration Guide

## Overview

OpenRouter Presets allow you to separate your LLM configuration from your code. You create and manage presets through the OpenRouter web application, then reference them in API requests using the `@preset/` syntax.

## Benefits of Using Presets

1. **Separation of Concerns**: Keep your code clean and semantic
2. **Rapid Iteration**: Update models, prompts, and parameters without code deployment
3. **Team Sharing**: Organization presets are shared across all team members
4. **Version History**: Roll back to previous configurations if needed

---

## How to Configure Presets on OpenRouter

### Step 1: Access the Presets Dashboard

1. Go to [OpenRouter.ai](https://openrouter.ai) and log in
2. Navigate to the **Presets** section in the dashboard
3. Click **"Create New Preset"**

### Step 2: Configure Your Preset

Each preset can include:

| Setting | Description | Example |
|----------|-------------|----------|
| **Name/Slug** | Unique identifier for API calls | `article-translator` |
| **Description** | What this preset does | "Fast translation for articles" |
| **Provider Routing** | How to select providers | Sort by: Price, Latency, Uptime |
| **Models** | Primary model + fallbacks | `google/gemma-3-35b-it:free` → `meta-llama/llama-3.1-70b-instruct:free` |
| **System Prompt** | Pre-configured instruction | "You are a professional translator..." |
| **Temperature** | Response creativity | 0.3 for translation, 0.7 for generation |
| **Max Tokens** | Response length limit | 2048 |
| **Other Parameters** | top_p, top_k, etc. | As needed |

---

## Recommended Presets for Your Portfolio

### 1. Translation Presets

#### `translate-fast`
- **Purpose**: Quick translations for drafts and previews
- **Model**: `google/gemma-3-35b-it:free` or `meta-llama/llama-3.1-8b-instruct:free`
- **Temperature**: 0.2
- **System Prompt**:
  ```
  You are a professional translator. Translate the given text while preserving all HTML tags, formatting, and technical terms. Only return the translated text without any explanation.
  ```
- **Max Tokens**: 2048

#### `translate-balanced`
- **Purpose**: Quality translations for published content
- **Model**: `meta-llama/llama-3.1-70b-instruct:free` or `mistralai/mistral-7b-instruct:free`
- **Temperature**: 0.3
- **System Prompt**:
  ```
  You are a professional translator specializing in Persian and English content. Translate accurately while preserving meaning, tone, and all HTML formatting. Return only the translated text.
  ```
- **Max Tokens**: 4096

#### `translate-premium`
- **Purpose**: High-quality translations for important content
- **Model**: `openai/gpt-4o-mini:free` or `anthropic/claude-3.5-sonnet:free`
- **Temperature**: 0.3
- **System Prompt**:
  ```
  You are an expert translator with deep knowledge of both Persian and English languages, including idioms, cultural nuances, and technical terminology. Translate while preserving HTML structure and formatting. Return only the translation.
  ```

### 2. Content Generation Presets

#### `article-generator`
- **Purpose**: Generate article content from topic
- **Model**: `anthropic/claude-3.5-sonnet:free` or `openai/gpt-4o-mini:free`
- **Temperature**: 0.7
- **Response Format**: `json_object`
- **System Prompt**:
  ```
  You are a professional content writer for a technical portfolio website. Generate article content in JSON format with the following structure:
  {
    "title_en": "SEO-optimized English title",
    "title_fa": "Persian translation of title",
    "slug": "url-friendly-slug",
    "excerpt_en": "Brief English excerpt (100-150 chars)",
    "excerpt_fa": "Persian excerpt",
    "content_en": "Full article content in HTML with proper heading tags",
    "content_fa": "Persian translation of content",
    "meta_description": "SEO meta description",
    "tags": ["tag1", "tag2"]
  }
  ```
- **Max Tokens**: 4096

### 3. Content Refinement Presets

#### `content-refiner`
- **Purpose**: Improve clarity, grammar, and readability
- **Model**: `meta-llama/llama-3.1-70b-instruct:free` or `anthropic/claude-3.5-sonnet:free`
- **Temperature**: 0.7
- **System Prompt**:
  ```
  You are a professional editor. Review and improve the given content for clarity, grammar, flow, and readability while maintaining the original meaning and tone. Preserve all HTML formatting.
  ```

### 4. Project Description Presets

#### `project-generator`
- **Purpose**: Generate project descriptions and documentation
- **Model**: `anthropic/claude-3.5-sonnet:free` or `openai/gpt-4o-mini:free`
- **Temperature**: 0.7
- **System Prompt**:
  ```
  You are a technical writer specializing in software project documentation. Generate clear, professional descriptions for software projects, highlighting technical stack, key features, and outcomes.
  ```

---

## How to Use Presets in API Calls

### Method 1: Direct Preset Reference (Recommended)

```javascript
{
  "model": "@preset/translate-fast",
  "messages": [
    {
      "role": "user",
      "content": "Translate this text..."
    }
  ]
}
```

### Method 2: Preset Field

```javascript
{
  "model": "google/gemma-3-35b-it:free",
  "preset": "translate-fast",
  "messages": [...]
}
```

### Method 3: Combined Model and Preset

```javascript
{
  "model": "google/gemma-3-35b-it:free@preset/translate-fast",
  "messages": [...]
}
```

---

## Database Schema for User Presets

Your application should store the **preset slugs** (not full configurations) in the database:

```sql
CREATE TABLE user_ai_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  presets JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Example stored value:
```json
{
  "translateFast": "@preset/translate-fast",
  "translateBalanced": "@preset/translate-balanced",
  "translatePremium": "@preset/translate-premium",
  "generate": "@preset/article-generator",
  "refine": "@preset/content-refiner",
  "projectGenerate": "@preset/project-generator"
}
```

---

## Creating Your Presets on OpenRouter

1. Go to https://openrouter.ai/presets
2. For each preset above, click "New Preset"
3. Configure the settings as listed
4. Save and note the preset slug
5. Update your user preferences in the admin panel to use the new preset slugs

---

## API Integration Example

```javascript
// Server Action using preset
export async function aiTranslate(data) {
  const { user, profile } = await checkAdminAuth()
  if (!user || !profile) return { error: 'Authentication required', success: false }

  // Get user's preferred preset SLUG from database
  const userPresets = await getUserPresets(user.id)
  const presetSlug = userPresets?.translateFast || '@preset/translate-fast'

  return callOpenRouter('/chat/completions', {
    model: presetSlug,  // Uses @preset/translate-fast
    messages: [
      { role: 'system', content: 'You are a professional translator...' },
      { role: 'user', content: `Translate: ${data.text}` }
    ],
    temperature: 0.3,
  })
}
```

---

## Troubleshooting

### Preset Not Found Error
- **Cause**: Preset slug doesn't exist or wrong format
- **Solution**: Verify the preset is created on OpenRouter dashboard and use exact slug

### Using Wrong Model
- **Cause**: Preset references a model you don't have access to
- **Solution**: Check preset configuration on OpenRouter, verify model access

### Parameters Not Applied
- **Cause**: Conflicting parameters in API request override preset
- **Solution**: Remove conflicting parameters from API call if they're set in preset

---

## Best Practices

1. **Name presets descriptively**: Use kebab-case with clear purpose (e.g., `translate-fast`, not `preset1`)
2. **Version important presets**: If you need to change settings significantly, create a new preset
3. **Test preset behavior**: Use OpenRouter's test feature before deploying
4. **Document changes**: Keep track of why and when presets were modified
5. **Use fallback models**: Configure fallback models in preset for reliability
6. **Set appropriate token limits**: Prevent over-spending by limiting max_tokens per preset

---

## Quick Reference

| Action | Preset Slug | Model Suggestion | Temperature | Use Case |
|---------|--------------|-------------------|---------------|-----------|
| Quick Translate | `@preset/translate-fast` | gemma-3-35b-it:free | 0.2 | Drafts, previews |
| Quality Translate | `@preset/translate-balanced` | llama-3.1-70b:free | 0.3 | Published content |
| Premium Translate | `@preset/translate-premium` | gpt-4o-mini:free | 0.3 | Important pages |
| Generate Article | `@preset/article-generator` | claude-3.5-sonnet:free | 0.7 | Content creation |
| Refine Content | `@preset/content-refiner` | llama-3.1-70b:free | 0.7 | Editing |
| Generate Project | `@preset/project-generator` | claude-3.5-sonnet:free | 0.7 | Documentation |
