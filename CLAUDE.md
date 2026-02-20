# CLAUDE.md - hasanshiri.online

This file provides guidance to Claude Code when working with code in this repository.

---

## Project Identity

**Platform:** hasanshiri.online - Bilingual Blog & Portfolio Platform
**Domain:** https://hasanshiri.online
**Tech Stack:** Next.js 14 (App Router), React, Tailwind CSS, Supabase
**Status:** Production

**Quick Reference:**
- **Live Site:** https://hasanshiri.online
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **API:** `npm run dev` (localhost:3000)

---

## Key Features

- **Bilingual Support** - English and Persian (Farsi) with RTL support
- **Blog Platform** - Full CRUD for articles with TipTap rich text editor
- **Comments System** - Threaded comments with guest and authenticated users
- **Real-time Chat** - Floating chat widget with admin dashboard
- **Admin Dashboard** - Manage articles, comments, categories, tags, media, settings
- **SEO Optimized** - Dynamic sitemap, robots.txt, JSON-LD structured data
- **Dark/Light Mode** - Theme toggle with system preference detection
- **Analytics** - Vercel Analytics and Speed Insights
- **Error Tracking** - Sentry integration

---

## Essential Commands

### Development
```bash
npm install
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run Jest tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e     # Playwright E2E tests
```

### PWA
```bash
npm run pwa:icons    # Generate PWA icons
```

---

## Project Structure

```
hasanshiri.online/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Localized pages (en, fa)
│   │   ├── page.jsx        # Home page
│   │   ├── blog/           # Blog pages
│   │   ├── article/        # Article detail
│   │   └── layout.jsx      # Locale layout
│   ├── admin/              # Admin dashboard
│   ├── auth/               # Authentication pages
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # UI primitives (toasts, etc.)
│   ├── editor/             # TipTap editor components
│   ├── seo/                # SEO components
│   └── icons/              # Custom icons
├── lib/                    # Utilities
│   ├── actions/            # Server actions
│   └── supabase/           # Supabase clients
├── supabase/               # Database schema & migrations
├── public/                 # Static assets
├── __tests__/              # Unit tests
├── e2e/                    # E2E tests (Playwright)
└── docs/                   # Documentation
```

---

## Navigation Rules

### Feature Implementation
1. Check existing patterns in `components/` and `lib/actions/`
2. Follow i18n patterns for bilingual support
3. Use Server Components by default, Client Components when needed
4. Follow Supabase RLS policies for data access

### Bug Fixes
1. Check tests in `__tests__/` for existing coverage
2. Run `npm test` before committing
3. Verify both locales (en/fa) work correctly

---

## Critical Files

| File | Purpose |
|------|---------|
| `middleware.js` | i18n routing, auth protection |
| `lib/supabase/` | Server and browser clients |
| `components/editor/` | TipTap rich text editor |
| `app/[locale]/layout.jsx` | Root layout with providers |
| `tailwind.config.js` | Tailwind + RTL configuration |
| `next.config.js` | Next.js configuration |
| `sentry.client.config.js` | Sentry error tracking |

---

## Database Schema (Supabase)

**Tables:**
- `profiles` - User profiles
- `articles` - Blog articles
- `comments` - Threaded comments
- `categories` - Article categories
- `tags` - Article tags
- `chat_messages` - Real-time chat
- `media` - Uploaded media files
- `settings` - Site settings

**Location:** `supabase/` directory

---

## i18n Configuration

**Locales:** `en` (English), `fa` (Persian/Farsi)
**RTL:** Persian uses right-to-left layout
**Translation files:** JSON in `public/locales/`

```jsx
// locale pattern in routes
app/[locale]/page.jsx  // accessed via /en or /fa
```

---

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
SENTRY_DSN= (optional)
```

---

## Gotchas

### RTL Support
- Use `dir="rtl"` for Persian content
- Tailwind RTL plugin handles directional utilities
- Test layout in both directions

### Supabase
- Use server client for server components
- Use browser client for client components
- RLS policies protect data access

### Deployment
- Vercel automatically detects Next.js
- Environment variables set in Vercel dashboard
- Edge functions for middleware

---

## Testing Strategy

**Unit Tests:** Jest + React Testing Library
- Location: `__tests__/`
- Run: `npm test`

**E2E Tests:** Playwright
- Location: `e2e/`
- Run: `npm run test:e2e`

---

## k0ntext Commands

```bash
k0ntext index                    # Index codebase
k0ntext search <query>           # Semantic search
k0ntext generate --force         # Regenerate AI context
k0ntext template-status          # Check template version
k0ntext sync-templates           # Sync latest templates
k0ntext stats                    # Database statistics
```

---

## Contact & Links

- **Live Site:** https://hasanshiri.online
- **GitHub:** Repository owner
- **Author:** Hasan Shiri

---

**Version:** 3.8.1 | **Last Updated:** 2026-02-17 | **Context Target:** 200k
