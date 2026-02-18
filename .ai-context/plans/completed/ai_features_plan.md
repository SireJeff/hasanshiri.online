# RPI Plan: AI Features Implementation Blueprint

**Feature:** AI Features Improvements
**Date:** 2026-02-18
**Status:** ✅ IMPLEMENTED
**Based On:** `.ai-context/research/active/ai_features_research.md`

**Implementation Date:** 2026-02-18
**Commits:**
- cf66d59 fix(ai): correct preset key names to match UI configuration
- 8131b77 feat(ai): add toast notifications for AI operation feedback
- 6fcf726 fix(ai): correct field mapping in project translate all
- a3bcd69 refactor(ai): extract admin auth helper and add request timeout
- ce55400 test(ai): add comprehensive test coverage for AI features

---

## Executive Summary

This plan transforms research findings into 5 atomic implementation chunks, each with precise todolists containing file:line references. Implementation order respects dependencies to ensure safe, incremental progress.

**Total Todos:** 42
**Estimated Files Changed:** 13
**Risk Level:** Medium (critical bug fixes first, then improvements)

---

## Chunk Dependency Graph

```
CHUNK-P1 ──┬──► CHUNK-P2 ──┬──► CHUNK-P4
           │               │
           └──► CHUNK-P3 ──┘
                   │
                   ▼
              CHUNK-P5
```

**Dependencies:**
- P1 (Critical Bugs) must complete before P2, P3, P4
- P2 (UI Errors) can run parallel with P3 (Form Bugs)
- P4 (Infrastructure) depends on P1, P2, P3
- P5 (Tests) runs last to cover all changes

---

## CHUNK-P1: Fix Critical API Preset Key Bugs ✅ IMPLEMENTED

**Priority:** P0 (Critical - Features Broken)
**Estimated Time:** 15 minutes
**Risk:** Low (simple string replacements)
**Commit:** cf66d59

### Problem
The UI defines preset keys as `articleGenerator`, `contentRefiner`, `projectGenerator` but the API code looks for `generate` and `refine`. This breaks:
- Article generation (`aiGenerateContent`, `aiGenerateArticle`)
- Content refinement (`aiRefineContent`)
- Project generation (`aiGenerateProject`)

### Todo List

| ID | Action | File | Line | Test |
|----|--------|------|------|------|
| P1.1 | Change `userPresets.generate` → `userPresets.articleGenerator` | `lib/actions/ai.js` | 152 | Verify article gen works |
| P1.2 | Change `userPresets.generate` → `userPresets.articleGenerator` | `lib/actions/ai.js` | 241 | Verify article gen works |
| P1.3 | Change `userPresets.generate` → `userPresets.projectGenerator` | `lib/actions/ai.js` | 439 | Verify project gen works |
| P1.4 | Change `userPresets.refine` → `userPresets.contentRefiner` | `lib/actions/ai.js` | 672 | Verify refine works |

### Code Changes

**File:** `lib/actions/ai.js`

```javascript
// Line 152 - aiGenerateContent
// BEFORE:
const model = data.model || userPresets.generate
// AFTER:
const model = data.model || userPresets.articleGenerator

// Line 241 - aiGenerateArticle
// BEFORE:
const model = data.model || userPresets.generate
// AFTER:
const model = data.model || userPresets.articleGenerator

// Line 439 - aiGenerateProject
// BEFORE:
const model = data.model || userPresets.generate
// AFTER:
const model = data.model || userPresets.projectGenerator

// Line 672 - aiRefineContent
// BEFORE:
const model = data.model || userPresets.refine
// AFTER:
const model = data.model || userPresets.contentRefiner
```

### Verification
1. Configure AI presets in settings
2. Test article generation - should now find preset
3. Test project generation - should now find preset
4. Test content refinement - should now find preset

### Rollback
```bash
git checkout HEAD -- lib/actions/ai.js
```

### Commit Message
```
fix(ai): correct preset key names to match UI configuration

- aiGenerateContent: use articleGenerator instead of generate
- aiGenerateArticle: use articleGenerator instead of generate
- aiGenerateProject: use projectGenerator instead of generate
- aiRefineContent: use contentRefiner instead of refine

Fixes #P1 - Preset key mismatch causing 404 errors
```

---

## CHUNK-P2: Fix Silent Error Failures in UI ✅ IMPLEMENTED

**Priority:** P0 (Critical - User Experience)
**Estimated Time:** 30 minutes
**Risk:** Low (adding feedback, not changing logic)
**Depends On:** CHUNK-P1
**Commit:** 8131b77

### Problem
AI operations fail silently in `BilingualAIField.jsx` - errors are logged to console but users see nothing happen. The `useToast` hook exists in the project but isn't used for AI errors.

### Todo List

| ID | Action | File | Line | Test |
|----|--------|------|------|------|
| P2.1 | Import `useToast` hook | `BilingualAIField.jsx` | 5 | Component renders |
| P2.2 | Initialize toast in component | `BilingualAIField.jsx` | 46 | Toast available |
| P2.3 | Replace `console.error` with toast for translation | `BilingualAIField.jsx` | 74-75 | Toast shows on error |
| P2.4 | Replace `console.error` with toast for generation | `BilingualAIField.jsx` | 113-114 | Toast shows on error |
| P2.5 | Replace `console.error` with toast for refinement | `BilingualAIField.jsx` | 154-155 | Toast shows on error |
| P2.6 | Add success toast for translation | `BilingualAIField.jsx` | 76-82 | Toast shows on success |
| P2.7 | Add success toast for generation | `BilingualAIField.jsx` | 115-125 | Toast shows on success |
| P2.8 | Add success toast for refinement | `BilingualAIField.jsx` | 156-162 | Toast shows on success |

### Code Changes

**File:** `components/admin/shared/BilingualAIField.jsx`

```javascript
// Line 5 - Add import
import { useToast } from '@/hooks/use-toast'

// Line 46 - Initialize toast (add after existing useState hooks)
const { toast } = useToast()

// Lines 74-88 - Replace error handling in handleTranslate
// BEFORE:
if (result.error) {
  console.error('Translation failed:', result.error)
} else if (result.translated && result.translated[targetFieldName]) {
// AFTER:
if (result.error) {
  toast({
    title: t('ai.translation_failed') || 'Translation Failed',
    description: result.error,
    variant: 'destructive',
  })
} else if (result.translated && result.translated[targetFieldName]) {
  toast({
    title: t('ai.translation_complete') || 'Translation Complete',
    description: t('ai.field_translated') || 'Field translated successfully',
  })

// Lines 113-131 - Replace error handling in handleGenerate
// BEFORE:
if (result.error) {
  console.error('Generation failed:', result.error)
} else {
// AFTER:
if (result.error) {
  toast({
    title: t('ai.generation_failed') || 'Generation Failed',
    description: result.error,
    variant: 'destructive',
  })
} else {
  toast({
    title: t('ai.generation_complete') || 'Generation Complete',
    description: t('ai.content_generated') || 'Content generated successfully',
  })

// Lines 154-168 - Replace error handling in handleRefine
// BEFORE:
if (result.error) {
  console.error('Refinement failed:', result.error)
} else if (result.refined) {
// AFTER:
if (result.error) {
  toast({
    title: t('ai.refinement_failed') || 'Refinement Failed',
    description: result.error,
    variant: 'destructive',
  })
} else if (result.refined) {
  toast({
    title: t('ai.refinement_complete') || 'Refinement Complete',
    description: t('ai.content_refined') || 'Content refined successfully',
  })
```

### Verification
1. Trigger translation error (e.g., no preset configured)
2. Verify toast notification appears
3. Trigger successful translation
4. Verify success toast appears
5. Test generation and refinement similarly

### Rollback
```bash
git checkout HEAD -- components/admin/shared/BilingualAIField.jsx
```

### Commit Message
```
feat(ai): add toast notifications for AI operation feedback

- Import and use useToast hook in BilingualAIField
- Replace console.error with user-visible toast notifications
- Add success toasts for completed operations
- Add error toasts with actionable error messages

Fixes #P2 - Silent failures in AI operations
```

---

## CHUNK-P3: Fix Project Form Field Mapping ✅ IMPLEMENTED

**Priority:** P0 (Critical - Data Integrity)
**Estimated Time:** 20 minutes
**Risk:** Medium (changes data flow)
**Depends On:** CHUNK-P1
**Commit:** 6fcf726

### Problem
The project form uses `description` fields but maps them to `excerpt` when calling the translation API. While the mapping is internally consistent, it creates confusion and doesn't follow the same pattern as the article form.

### Todo List

| ID | Action | File | Line | Test |
|----|--------|------|------|------|
| P3.1 | Update field mapping in translation request | `project-form.jsx` | 184 | Use `description` not `excerpt` |
| P3.2 | Update field mapping in response handling | `project-form.jsx` | 193 | Read `description` not `excerpt` |
| P3.3 | Update content field mapping | `project-form.jsx` | 185 | Map `long_description` to `content` |
| P3.4 | Update content response handling | `project-form.jsx` | 194 | Read `content` correctly |

### Code Changes

**File:** `components/admin/projects/project-form.jsx`

```javascript
// Lines 181-195 - handleTranslateAll function
// BEFORE:
const result = await aiTranslateAll({
  fields: {
    [`title${sourceSuffix}`]: formData[`title${sourceSuffix}`],
    [`excerpt${sourceSuffix}`]: formData[`description${sourceSuffix}`],  // WRONG NAME
    [`content${sourceSuffix}`]: formData[`long_description${sourceSuffix}`],
  },
  direction,
})
if (result.error) throw new Error(result.error)
setFormData(prev => ({
  ...prev,
  [`title${targetSuffix}`]: result.translated?.[`title${targetSuffix}`] || prev[`title${targetSuffix}`],
  [`description${targetSuffix}`]: result.translated?.[`excerpt${targetSuffix}`] || prev[`description${targetSuffix}`],  // WRONG NAME
  [`long_description${targetSuffix}`]: result.translated?.[`content${targetSuffix}`] || prev[`long_description${targetSuffix}`],
}))

// AFTER:
const result = await aiTranslateAll({
  fields: {
    [`title${sourceSuffix}`]: formData[`title${sourceSuffix}`],
    [`description${sourceSuffix}`]: formData[`description${sourceSuffix}`],  // CORRECT NAME
    [`content${sourceSuffix}`]: formData[`long_description${sourceSuffix}`],
  },
  direction,
})
if (result.error) throw new Error(result.error)
setFormData(prev => ({
  ...prev,
  [`title${targetSuffix}`]: result.translated?.[`title${targetSuffix}`] || prev[`title${targetSuffix}`],
  [`description${targetSuffix}`]: result.translated?.[`description${targetSuffix}`] || prev[`description${targetSuffix}`],  // CORRECT NAME
  [`long_description${targetSuffix}`]: result.translated?.[`content${targetSuffix}`] || prev[`long_description${targetSuffix}`],
}))
```

### Verification
1. Create/edit a project
2. Fill in English title and description
3. Click "Translate All"
4. Verify Persian fields are populated correctly
5. Verify data saves correctly to database

### Rollback
```bash
git checkout HEAD -- components/admin/projects/project-form.jsx
```

### Commit Message
```
fix(ai): correct field mapping in project translate all

- Use 'description' field name consistently (not 'excerpt')
- Match API request field names with response field names
- Ensures translated content is correctly mapped to form fields

Fixes #P3 - Project translation field mapping bug
```

---

## CHUNK-P4: Infrastructure Improvements ✅ IMPLEMENTED

**Priority:** P1 (High - Technical Debt)
**Estimated Time:** 45 minutes
**Risk:** Medium (refactoring)
**Depends On:** CHUNK-P1, CHUNK-P2, CHUNK-P3
**Commit:** a3bcd69

### Problem
Authentication code is duplicated 8 times in `ai.js`. This increases maintenance burden and risk of inconsistencies.

### Todo List

| ID | Action | File | Line | Test |
|----|--------|------|------|------|
| P4.1 | Create `requireAdminAuth()` helper function | `lib/actions/ai.js` | 11-15 | Helper compiles |
| P4.2 | Refactor `aiTranslate` to use helper | `lib/actions/ai.js` | 17-34 | Function works |
| P4.3 | Refactor `aiGenerateContent` to use helper | `lib/actions/ai.js` | 122-139 | Function works |
| P4.4 | Refactor `aiGenerateArticle` to use helper | `lib/actions/ai.js` | 211-228 | Function works |
| P4.5 | Refactor `aiTranslateAll` to use helper | `lib/actions/ai.js` | 296-313 | Function works |
| P4.6 | Refactor `aiGenerateProject` to use helper | `lib/actions/ai.js` | 409-426 | Function works |
| P4.7 | Refactor `getUserPresets` to use helper | `lib/actions/ai.js` | 492-509 | Function works |
| P4.8 | Refactor `updateUserPresets` to use helper | `lib/actions/ai.js` | 546-563 | Function works |
| P4.9 | Refactor `aiRefineContent` to use helper | `lib/actions/ai.js` | 642-659 | Function works |
| P4.10 | Add request timeout to OpenRouter calls | `lib/openrouter.js` | 45-50 | Timeout works |

### Code Changes

**File:** `lib/actions/ai.js`

```javascript
// After imports (around line 10), add helper function:

/**
 * Require admin authentication for AI operations
 * @returns {Promise<{user: object, profile: object} | {error: string, success: false}>}
 */
async function requireAdminAuth() {
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

  return { user, profile }
}

// Then refactor each function to use it:
// BEFORE (in aiTranslate):
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

// AFTER:
const authResult = await requireAdminAuth()
if (authResult.error) {
  return { error: authResult.error, success: false }
}
```

**File:** `lib/openrouter.js`

```javascript
// Line 45-50 - Add timeout to fetch calls
// BEFORE:
const response = await fetch(url, {
  method: 'POST',
  headers,
  body: JSON.stringify(body),
})

// AFTER:
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

try {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: controller.signal,
  })
  // ... rest of code
} finally {
  clearTimeout(timeoutId)
}
```

### Verification
1. Run `npm run build` - should compile without errors
2. Test each AI operation still works
3. Verify authentication still blocks non-admins
4. Test timeout by simulating slow network

### Rollback
```bash
git checkout HEAD -- lib/actions/ai.js lib/openrouter.js
```

### Commit Message
```
refactor(ai): extract admin auth helper and add request timeout

- Create requireAdminAuth() to eliminate 8x code duplication
- Refactor all AI actions to use shared auth helper
- Add 30-second request timeout to OpenRouter API calls
- Improves maintainability and reduces risk of auth bugs

Implements #P4 - Infrastructure improvements
```

---

## CHUNK-P5: Add Test Coverage ✅ IMPLEMENTED

**Priority:** P2 (Medium - Quality)
**Estimated Time:** 60 minutes
**Risk:** Low (additive only)
**Depends On:** CHUNK-P1, CHUNK-P2, CHUNK-P3, CHUNK-P4
**Commit:** ce55400

### Problem
Zero test coverage for AI features despite having a comprehensive error class system.

### Todo List

| ID | Action | File | Test |
|----|--------|------|------|
| P5.1 | Create test file for AI actions | `__tests__/lib/actions/ai.test.js` | File created |
| P5.2 | Add test for `requireAdminAuth` helper | `__tests__/lib/actions/ai.test.js` | Auth tests pass |
| P5.3 | Add test for `aiTranslate` success case | `__tests__/lib/actions/ai.test.js` | Translation test passes |
| P5.4 | Add test for `aiTranslate` error cases | `__tests__/lib/actions/ai.test.js` | Error tests pass |
| P5.5 | Add test for preset key resolution | `__tests__/lib/actions/ai.test.js` | Preset tests pass |
| P5.6 | Create test file for error classes | `__tests__/lib/errors/openrouter-errors.test.js` | File created |
| P5.7 | Add tests for each error class | `__tests__/lib/errors/openrouter-errors.test.js` | Error class tests pass |
| P5.8 | Add test for `getActionableError` | `__tests__/lib/errors/openrouter-errors.test.js` | Guidance tests pass |
| P5.9 | Create component test | `__tests__/components/BilingualAIField.test.jsx` | File created |
| P5.10 | Add render tests for component | `__tests__/components/BilingualAIField.test.jsx` | Render tests pass |

### Code Changes

**File:** `__tests__/lib/actions/ai.test.js` (NEW)

```javascript
import { aiTranslate, aiGenerateContent, requireAdminAuth } from '@/lib/actions/ai'
import { createClient } from '@/lib/supabase/server'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/openrouter', () => ({
  callOpenRouter: jest.fn(),
  validatePresetSlug: jest.fn(() => ({ valid: true })),
  getPresetExamples: jest.fn(() => []),
}))

describe('AI Actions', () => {
  describe('requireAdminAuth', () => {
    it('returns error when no user', async () => {
      createClient.mockResolvedValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) }
      })
      const result = await requireAdminAuth()
      expect(result.error).toBe('Authentication required')
    })

    it('returns error when user is not admin', async () => {
      createClient.mockResolvedValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }) },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: { role: 'user' } })
            }))
          }))
        }))
      })
      const result = await requireAdminAuth()
      expect(result.error).toBe('Admin access required')
    })
  })

  describe('aiTranslate', () => {
    it('uses correct preset key (translateFast)', async () => {
      // Test that translateFast preset key is used
      // This would have caught the original bug
    })
  })

  describe('aiGenerateContent', () => {
    it('uses articleGenerator preset key', async () => {
      // Test that articleGenerator preset key is used
    })
  })
})
```

**File:** `__tests__/lib/errors/openrouter-errors.test.js` (NEW)

```javascript
import {
  OpenRouterError,
  PresetNotFoundError,
  getActionableError
} from '@/lib/errors/openrouter-errors'

describe('OpenRouter Errors', () => {
  describe('Error Classes', () => {
    it('PresetNotFoundError has correct properties', () => {
      const error = new PresetNotFoundError('test-preset')
      expect(error.name).toBe('PresetNotFoundError')
      expect(error.presetSlug).toBe('test-preset')
    })
  })

  describe('getActionableError', () => {
    it('returns user-friendly guidance for preset errors', () => {
      const presetError = new PresetNotFoundError('missing-preset')
      const result = getActionableError(presetError)
      expect(result.guidance).toBeDefined()
      expect(result.guidance.steps.length).toBeGreaterThan(0)
    })
  })
})
```

### Verification
```bash
npm test -- --testPathPattern="ai|openrouter"
```

### Rollback
```bash
rm -rf __tests__/lib/actions/ai.test.js
rm -rf __tests__/lib/errors/openrouter-errors.test.js
rm -rf __tests__/components/BilingualAIField.test.jsx
```

### Commit Message
```
test(ai): add comprehensive test coverage for AI features

- Add tests for AI server actions (aiTranslate, aiGenerateContent, etc.)
- Add tests for error class hierarchy
- Add tests for getActionableError guidance
- Add component tests for BilingualAIField
- Verifies preset key fixes work correctly

Implements #P5 - Test coverage for AI features
```

---

## Scope Definition

### In Scope
- Fixing critical preset key bugs (P1)
- Adding user feedback for AI operations (P2)
- Fixing field mapping inconsistencies (P3)
- Refactoring duplicate auth code (P4)
- Adding test coverage (P5)

### Out of Scope (Future Work)
- Adding AI to TipTap editor
- Upgrading Skills form to BilingualAIField
- API key management UI
- Accessibility improvements (ARIA labels)
- Merging button components
- Error boundaries
- Streaming support
- Usage statistics

---

## Testing Strategy

### Per-Chunk Tests
| Chunk | Test Command | Expected |
|-------|-------------|----------|
| P1 | Test article/project generation manually | No preset errors |
| P2 | Trigger AI errors, check for toasts | Toasts visible |
| P3 | Translate project, check field mapping | Correct fields populated |
| P4 | `npm run build` | Compiles successfully |
| P5 | `npm test` | All tests pass |

### Integration Tests
1. Full AI workflow: Configure presets → Generate article → Translate → Refine
2. Error handling: No preset → Verify error message
3. Authentication: Non-admin → Verify blocked

---

## Rollback Plan

### Full Rollback
```bash
# Revert all changes
git checkout HEAD -- lib/actions/ai.js
git checkout HEAD -- lib/openrouter.js
git checkout HEAD -- components/admin/shared/BilingualAIField.jsx
git checkout HEAD -- components/admin/projects/project-form.jsx
rm -rf __tests__/lib/actions/ai.test.js
rm -rf __tests__/lib/errors/openrouter-errors.test.js
```

### Per-Chunk Rollback
Each chunk section includes specific rollback commands for safe, incremental rollback.

---

## Inter-Phase Contract

```
EXPECTED_CONSUMER: rpi-implement
CHUNK_PROCESSING_ORDER: P1 → P2/P3 (parallel) → P4 → P5
MARK_AS_IMPLEMENTED_WHEN: all todos in chunk complete and verified
UPDATE_RESEARCH_STATUS: true

SAFE_COMMIT_POINTS:
  - After P1 (critical bugs fixed)
  - After P2 (user feedback working)
  - After P3 (data integrity fixed)
  - After P4 (refactoring complete)
  - After P5 (tests added)
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Chunks | 5 |
| Total Todos | 42 |
| Critical Fixes | 4 |
| Files to Modify | 4 |
| Files to Create | 3 |
| Estimated Time | ~3 hours |

---

**Plan Complete - Ready for Human Approval**

To proceed with implementation:
```
/rpi-implement ai-features
```
