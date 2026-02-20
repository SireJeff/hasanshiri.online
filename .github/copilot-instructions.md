# hasanshiri.online - GitHub Copilot Instructions

## Project Identity

- **Name:** hasanshiri.online
- **Description:** Bilingual (English/Persian) Blog & Portfolio Platform with AI-powered content management
- **Domain:** https://hasanshiri.online
- **Tech Stack:** Next.js 14 (App Router), React, Tailwind CSS, Supabase, TipTap Editor
- **Primary Language:** JavaScript/JSX
- **Testing:** Jest (unit), Playwright (E2E)

---

## Architecture

**Pattern:** Next.js App Router with Server Components

### Key Directories
- `app/[locale]/` - Localized pages (en, fa)
- `app/admin/` - Admin dashboard
- `components/` - React components (ui, editor, admin, blog, seo)
- `lib/` - Utilities, actions, Supabase clients
- `lib/locales/` - Translation files (en.json, fa.json)
- `supabase/` - Database migrations and schema

---

## Bilingual Development

### RTL Support (Persian/fa)
- Use `dir="rtl"` for Persian content
- Conditional classes: `className={isRtl ? 'flex-row-reverse' : ''}`
- Rotate direction-aware icons: `className={isRtl ? 'rotate-180' : ''}`
- Test all features in both LTR (en) and RTL (fa) modes

### Translation Workflow
- Translation files: `lib/locales/en.json` and `lib/locales/fa.json`
- Always add translations to BOTH files
- Use bilingual AI fields for content translation

---

## Key Patterns

### Server vs Client Components
- Use Server Components by default
- Add `'use client'` only when needed (useState, useEffect, event handlers)

### Supabase Clients
- **Server Components:** `lib/supabase/server.js`
- **Client Components:** `lib/supabase/client.js`
- **Middleware:** `lib/supabase/middleware.js`

### Locale-Aware Routing
```jsx
// Always use locale in paths
href={`/${locale}/blog/${slug}`}
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm test` | Run Jest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Run ESLint |

---

## AI Integration

The project includes AI-powered features using OpenRouter:
- `lib/actions/ai.js` - AI server actions
- `lib/openrouter.js` - OpenRouter client
- `components/admin/shared/FloatingAIAssistant.jsx` - AI chat interface
- `components/admin/shared/BilingualAIField.jsx` - Bilingual AI input

---

## Critical Files

| File | Purpose |
|------|---------|
| `middleware.js` | i18n routing, auth protection |
| `lib/i18n-config.js` | i18n configuration |
| `components/editor/TipTapEditor.jsx` | Rich text editor |
| `app/[locale]/layout.jsx` | Root layout with providers |

---

*Last updated: 2026-02-18*
