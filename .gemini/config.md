# hasanshiri.online - Gemini Context

## Project Overview
Bilingual (English/Persian) Blog & Portfolio Platform with AI-powered content management.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **UI:** React, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Editor:** TipTap rich text editor
- **Testing:** Jest (unit), Playwright (E2E)

## Bilingual Architecture

### Supported Locales
- `en` - English (LTR)
- `fa` - Persian/Farsi (RTL)

### RTL Considerations
- Use `dir="rtl"` for Persian content
- Conditional Tailwind classes for layout direction
- Rotate directional icons for RTL
- Test all features in both locales

### Translation Files
- `lib/locales/en.json`
- `lib/locales/fa.json`

## Component Patterns

### Server Components (Default)
```jsx
// No directive needed
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}
```

### Client Components (When needed)
```jsx
'use client'
// For useState, useEffect, event handlers
```

### Supabase Clients
- Server: `import { createClient } from '@/lib/supabase/server'`
- Client: `import { createClient } from '@/lib/supabase/client'`

## Routing Structure
```
/[locale]           # Homepage (en/fa)
/[locale]/blog      # Blog listing
/[locale]/blog/[slug] # Article detail
/admin              # Admin dashboard
/admin/articles     # Article management
```

## Key Files
| File | Purpose |
|------|---------|
| `middleware.js` | i18n routing, auth protection |
| `lib/i18n-config.js` | Locale configuration |
| `lib/locales/*.json` | Translations |
| `components/editor/TipTapEditor.jsx` | Rich text editor |
| `lib/actions/` | Server actions |

## Development Commands
```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm test           # Run unit tests
npm run test:e2e   # Run E2E tests
npm run lint       # Run ESLint
```

## AI Integration
- OpenRouter API for AI features
- Server actions: `lib/actions/ai.js`
- UI components: `components/admin/shared/`

## Best Practices
1. Always add translations to both locale files
2. Test RTL layout for Persian
3. Use Server Components by default
4. Follow RLS policies for data access
5. Use locale-aware routing

*Last updated: 2026-02-18*
