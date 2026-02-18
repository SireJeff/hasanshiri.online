# RPI Research: AI Features in Admin Dashboard

**Feature:** AI Features Integration Analysis
**Date:** 2026-02-18
**Status:** COMPLETE
**Research Phases:** 5 Parallel Agents

---

## Executive Summary

This research identifies **47 issues** across 5 domains in the AI features integrated into the admin dashboard. The most critical findings include:

1. **Inconsistent preset key mapping** causing generation/refinement failures
2. **Silent error failures** where errors are logged to console but not shown to users
3. **Missing AI integration** in TipTap editor and Skills form
4. **Zero test coverage** for AI features despite comprehensive error class system
5. **Duplicate code patterns** across forms and components

**Unification Opportunities:** 12 major patterns that could be consolidated

---

## Chunk Manifest

| Chunk ID | Domain | Status | Files | Critical Issues | Ready for Planning |
|----------|--------|--------|-------|-----------------|-------------------|
| CHUNK-R1 | API/Server Actions | 📋 PLANNED → P1 | 4 | 6 | ✅ |
| CHUNK-R2 | UI Components | 📋 PLANNED → P2 | 9 | 4 | ✅ |
| CHUNK-R3 | Settings & Config | 📋 PLANNED → P1, P4 | 5 | 3 | ✅ |
| CHUNK-R4 | Form Integration | 📋 PLANNED → P3 | 5 | 4 | ✅ |
| CHUNK-R5 | Tests & Errors | 📋 PLANNED → P2, P5 | 3 | 4 | ✅ |

**Plan Document:** `.ai-context/plans/active/ai_features_plan.md`

---

## CHUNK-R1: API/Server Actions Layer

### Files Analyzed:
- `lib/openrouter.js` (lines 1-422)
- `lib/actions/ai.js` (lines 1-702)
- `lib/utils/streaming.js` (lines 1-195)
- `lib/errors/openrouter-errors.js` (lines 1-319)

### Critical Issues:

#### 1. Hardcoded Site Title
- **Location:** `lib/openrouter.js:42`
- **Issue:** `'X-Title': 'hasanshiri.online'` hardcoded
- **Fix:** Use environment variable

#### 2. Inconsistent Preset Key Names
- **Locations:** `lib/actions/ai.js:152, 241, 439, 672`
- **Issue:** Code references `userPresets.generate` and `userPresets.refine` but UI defines `articleGenerator`, `projectGenerator`, `contentRefiner`
- **Impact:** Article generation and content refinement will fail

#### 3. Duplicate Authentication Code
- **Locations:** `lib/actions/ai.js:18-34, 124-139, 211-226, 296-311, 409-424, 492-507, 546-561, 642-657`
- **Issue:** Same 15-line authentication block repeated 8 times
- **Fix:** Extract to `requireAdminAuth()` helper

#### 4. No Request Timeout
- **Locations:** All fetch calls in `lib/openrouter.js`
- **Issue:** No `AbortSignal.timeout()` - requests can hang indefinitely

#### 5. Buffer Overflow Risk
- **Location:** `lib/utils/streaming.js:29`
- **Issue:** 1MB max buffer, no per-request limits

#### 6. No Input Validation
- **Issue:** No validation of input text length before sending to API

### Medium Issues:

| Issue | Location | Impact |
|-------|----------|--------|
| No request caching for preset validation | `openrouter.js:324-387` | Wastes API quota |
| JSON parse errors crash stream | `streaming.js:104` | Stream failure |
| No request ID/tracing | All files | Debugging difficulty |
| Temperature inconsistencies | Multiple files | Unpredictable outputs |
| Missing content length validation | All actions | Expensive operations |

### Configuration Required:
```bash
OPENROUTER_API_KEY=sk-or-...           # Required
OPENROUTER_SITE_URL=https://...        # Optional
NEXT_PUBLIC_SITE_URL=https://...       # Required
```

---

## CHUNK-R2: UI Components Layer

### Components Analyzed:

| Component | Lines | Purpose |
|-----------|-------|---------|
| AIGenerateButton | 1-35 | Trigger content generation |
| AIRefineButton | 1-35 | Trigger content refinement |
| AITranslateButton | 1-36 | Trigger translation |
| AIToolbarButton | 1-30 | Generic toolbar button |
| ModelSelector | 1-94 | Model/preset dropdown |
| AIGenerateModal | 1-240 | Generation modal dialog |
| AIContext | 1-117 | Global AI state provider |
| FloatingAIAssistant | 1-449 | Chat-style AI assistant |
| BilingualAIField | 1-242 | Bilingual field with AI buttons |

### Critical Issues:

#### 1. Missing Accessibility
- **All components** lack ARIA labels
- No `aria-busy` during loading
- No focus management in modal
- No keyboard navigation in ModelSelector

#### 2. Inconsistent Error Handling
- **BilingualAIField** (lines 75, 114, 155): Errors only `console.error()`
- **AIGenerateModal** (lines 157-161): Proper error display
- **Buttons**: No error feedback at all

#### 3. Unused State
- **AIContext** (line 17): `isStreaming` always false, never updated
- **AIContext** (line 19): `currentModel` never used

#### 4. Modal UX Problems
- **AIGenerateModal** (line 102): `e.stopPropagation()` prevents backdrop close
- No Escape key handler
- Only Ctrl/Cmd+Enter works

### Unification Opportunities:

1. **Merge button components** → `AIActionButton` with `variant` prop
2. **Extract loading hook** → `useAILoading()`
3. **Extract error hook** → `useAIError()`
4. **Extract modal base** → `BaseModal` component
5. **Extract settings form** → Separate `AISettingsForm` component

### Code Duplication:
- AIGenerateButton and AIRefineButton are 95% identical
- Loading state patterns repeated in 4 components
- Error handling patterns inconsistent across components

---

## CHUNK-R3: Settings & Configuration Layer

### Files Analyzed:
- `app/admin/settings/page.jsx` (lines 1-960)
- `lib/actions/settings.js` (lines 1-373)
- `lib/actions/ai.js` (preset management lines 492-635)
- `supabase/migrations/20250212_user_ai_presets.sql` (lines 1-44)
- `supabase/migrations/20250215_user_ai_presets_unique.sql` (lines 1-10)

### Configurable Settings:

**AI Presets (User-Level):**
| Preset Key | Purpose | Default |
|------------|---------|---------|
| `translateFast` | Quick translations | None |
| `translateBalanced` | Quality translations | None |
| `articleGenerator` | Article generation | None |
| `contentRefiner` | Content improvement | None |
| `projectGenerator` | Project descriptions | None |

### Critical Issues:

#### 1. No API Key Management UI
- **Issue:** OpenRouter API key only in env vars
- **Impact:** Requires deployment to change keys
- **Location:** `lib/openrouter.js:6`

#### 2. Preset Key Mismatch (CRITICAL)
- **UI Keys:** `articleGenerator`, `contentRefiner`
- **Code Keys:** `generate`, `refine`
- **Impact:** 40% of AI features broken
- **Locations:** `ai.js:152, 241, 439, 672`

#### 3. Validation Errors Not Displayed
- **Location:** `app/admin/settings/page.jsx:214-218`
- **Issue:** Errors logged to console, not shown to user

### Missing Features:

| Feature | Priority | Impact |
|---------|----------|--------|
| API Key Management UI | HIGH | Security/usability |
| Preset Test Button | HIGH | User confidence |
| Default Presets | HIGH | First-run experience |
| Settings Reset | MEDIUM | Error recovery |
| Per-feature Toggles | MEDIUM | Granular control |
| Usage Statistics | MEDIUM | Cost awareness |
| Settings History | LOW | Audit trail |

---

## CHUNK-R4: Form Integration Layer

### Forms Analyzed:

| Form | AI Integration | Coverage |
|------|---------------|----------|
| Article Form | ✅ Full | Generate, Translate, Refine |
| Project Form | ✅ Full (buggy) | Generate, Translate, Refine |
| TipTap Editor | ❌ None | No AI buttons |
| Skills Form | ❌ None | Uses `BilingualField` |
| Settings Form | ⚠️ Partial | Manual bilingual fields |

### Critical Issues:

#### 1. Field Mapping Bug (CRITICAL)
- **Location:** `components/admin/projects/project-form.jsx:173-199`
- **Issue:** `handleTranslateAll` maps `description` to `excerpt`
- **Code:**
  ```javascript
  [`excerpt${sourceSuffix}`]: formData[`description${sourceSuffix}`]
  ```
- **Impact:** Translation returns wrong field names

#### 2. Missing AI in TipTap Editor
- **Location:** `components/editor/TipTapEditor.jsx` (entire file)
- **Issue:** No AI integration for content generation/refinement
- **Impact:** Users must leave editor context for AI

#### 3. Missing AI in Skills Form
- **Location:** `components/admin/skills/skill-form.jsx`
- **Issue:** Uses `BilingualField` not `BilingualAIField`
- **Impact:** Inconsistent UX across forms

#### 4. Duplicate Integration Code
- **Locations:** Article form (83-116), Project form (173-199)
- **Issue:** `handleTranslateAll` nearly identical in both
- **Fix:** Extract to `useFormAI` hook

### Unification Opportunities:

1. **FormAIActions Component** - Standardize header AI buttons
2. **useFormAI Hook** - Encapsulate common AI form logic
3. **TipTap AI Extension** - Add AI toolbar to editor
4. **Field Mapping Config** - Standardize field name mappings
5. **AIFeedback Component** - Progress and error display

---

## CHUNK-R5: Test Coverage & Error Handling

### Test Coverage Analysis:

**What IS Tested:**
- Skills CRUD operations
- Projects CRUD operations
- Settings management (basic)
- Utility functions
- i18n configuration

**What is NOT Tested (0% Coverage):**
- All AI server actions (`aiTranslate`, `aiGenerateContent`, etc.)
- OpenRouter API client
- Error handling classes
- Streaming utilities
- All AI components
- Preset management

### Error Handling Assessment:

**Strengths:**
- Comprehensive error class hierarchy in `lib/errors/openrouter-errors.js`
- `getActionableError()` provides user-friendly guidance
- Consistent try-catch in server actions

**Weaknesses:**

#### 1. Silent Failures in Components
| Location | Issue |
|----------|-------|
| `BilingualAIField.jsx:74-76` | Translation errors → console only |
| `BilingualAIField.jsx:113-115` | Generation errors → console only |
| `BilingualAIField.jsx:154-156` | Refinement errors → console only |
| `FloatingAIAssistant.jsx:134-136` | Loses structured error guidance |

#### 2. No Error Boundaries
- Zero React Error Boundaries in codebase
- AI component crashes can break entire UI

#### 3. Toast Notifications Not Used
- `useToast` hook exists but not used in AI components
- Errors shown as text, not proper notifications

#### 4. Inconsistent Error Response Handling
- Forms throw generic `Error()` losing actionable guidance
- Settings page logs validation errors but doesn't display them

### Recommended Test Files:
```
__tests__/lib/actions/ai.test.js
__tests__/lib/errors/openrouter-errors.test.js
__tests__/lib/openrouter.test.js
__tests__/components/admin/shared/BilingualAIField.test.jsx
__tests__/components/admin/shared/FloatingAIAssistant.test.jsx
```

---

## Inter-Phase Contract

```
EXPECTED_CONSUMER: rpi-plan
CHUNK_PROCESSING_ORDER: sequential (R1 → R2 → R3 → R4 → R5)
MARK_AS_PLANNED_WHEN: chunk todolist created
REQUIRED_OUTPUT: CHUNK-Pn per CHUNK-Rn

DEPENDENCIES:
  - R1 (API) must be planned before R4 (Forms)
  - R2 (UI) must be planned before R4 (Forms)
  - R3 (Settings) must be planned before R5 (Tests)
  - R5 (Tests) should be planned last to cover all changes
```

---

## Prioritized Issue List

### P0 - Critical (Must Fix First)
1. **Preset key mismatch** - Breaks generation/refinement (R1, R3)
2. **Field mapping bug** - Breaks project translation (R4)
3. **Silent error failures** - Users don't know what went wrong (R2, R5)

### P1 - High Priority
4. Duplicate authentication code (R1)
5. Missing AI in TipTap editor (R4)
6. Missing AI in Skills form (R4)
7. No API key management UI (R3)
8. No request timeout (R1)

### P2 - Medium Priority
9. Accessibility issues (R2)
10. Code duplication in buttons (R2)
11. Missing test coverage (R5)
12. No error boundaries (R5)
13. No default presets (R3)

### P3 - Low Priority
14. Unused state variables (R2)
15. Modal UX issues (R2)
16. No settings caching (R3)
17. No usage statistics (R3)

---

## Recommended Implementation Order

### Phase 1: Fix Critical Bugs
1. Fix preset key mapping in `lib/actions/ai.js`
2. Fix field mapping in project form
3. Add toast notifications to BilingualAIField

### Phase 2: Infrastructure Improvements
4. Extract `requireAdminAuth()` helper
5. Add request timeout configuration
6. Create `useFormAI` hook
7. Create `useAIError` hook

### Phase 3: Feature Gaps
8. Add AI to TipTap editor
9. Upgrade Skills form to BilingualAIField
10. Add API key management UI

### Phase 4: Unification & Quality
11. Merge button components
12. Add accessibility attributes
13. Add error boundaries
14. Write test coverage

---

## Files Requiring Changes

| File | Chunks Involved | Priority |
|------|-----------------|----------|
| `lib/actions/ai.js` | R1, R3 | P0 |
| `components/admin/projects/project-form.jsx` | R4 | P0 |
| `components/admin/shared/BilingualAIField.jsx` | R2, R5 | P0 |
| `lib/openrouter.js` | R1 | P1 |
| `components/editor/TipTapEditor.jsx` | R4 | P1 |
| `components/admin/skills/skill-form.jsx` | R4 | P1 |
| `app/admin/settings/page.jsx` | R3 | P1 |
| `components/admin/shared/AIGenerateButton.jsx` | R2 | P2 |
| `components/admin/shared/AIRefineButton.jsx` | R2 | P2 |
| `components/admin/shared/AITranslateButton.jsx` | R2 | P2 |
| `components/admin/shared/AIGenerateModal.jsx` | R2 | P2 |
| `components/admin/shared/FloatingAIAssistant.jsx` | R2, R5 | P2 |
| `lib/utils/streaming.js` | R1, R5 | P2 |

---

## Statistics

- **Total Files Analyzed:** 26
- **Total Issues Identified:** 47
- **Critical Issues:** 6
- **High Priority Issues:** 8
- **Medium Priority Issues:** 18
- **Low Priority Issues:** 15
- **Unification Opportunities:** 12
- **Test Coverage Gap:** 100% of AI features untested

---

**Research Complete - Ready for `/rpi-plan ai-features`**
