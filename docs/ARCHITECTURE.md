# 🏗️ Architecture Snapshot: hasanshiri.online

**Generated:** 2026-02-11
**Project Version:** 1.0.0
**Framework:** Next.js 14.2.21 (App Router)

---

## Executive Summary

| Aspect | Details |
|--------|---------|
| **Project Name** | hasanshiri.online (Portfolio & Blog) |
| **Type** | Full-stack Portfolio CMS |
| **Framework** | Next.js 14.2.21 (App Router) |
| **Database** | Supabase (PostgreSQL) |
| **Deployment** | Vercel (recommended) |
| **Languages** | English (en), Persian/Farsi (fa) |
| **Authentication** | Supabase Auth with RLS |
| **Testing** | Jest (Unit), Playwright (E2E) |

---

## 1. Technology Stack Matrix

### Frontend Layer
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 14.2.21 | App Router, Server Actions, Edge Runtime |
| **UI Library** | React | 18.2.0 | Component framework |
| **Styling** | Tailwind CSS | 3.3.3 | Utility-first styling |
| **Icons** | Lucide React | 0.279.0 | Icon library |
| **Rich Text** | TipTap | 3.15.3 | WYSIWYG editor |
| **i18n** | i18next | 23.5.1 | Internationalization |

### Backend Layer
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Database** | Supabase | - | PostgreSQL + Auth + Storage |
| **Client** | @supabase/supabase-js | 2.47.10 | Database client |
| **SSR** | @supabase/ssr | 0.5.2 | Server-side rendering |
| **Email** | EmailJS | 3.11.0 | Contact forms |

### DevOps Layer
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Deployment** | Vercel | - | Hosting platform |
| **CI/CD** | GitHub Actions | - | Automated testing |
| **Error Tracking** | Sentry | 10.32.1 | Error monitoring |
| **Analytics** | Vercel Analytics | 1.6.1 | Performance insights |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Browser     │  │  PWA Cache   │  │  Service     │  │  IndexedDB   │  │
│  │              │  │              │  │  Worker      │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS APP ROUTER                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  middleware.js → Locale routing + Auth protection                    │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  [locale]/ → Public pages (en/fa)                                   │  │
│  │  admin/   → CMS dashboard (protected)                               │  │
│  │  auth/    → Authentication                                          │  │
│  │  api/     → Server functions (cron, notifications)                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
┌─────────────────────────────┐         ┌─────────────────────────────────────┐
│      SERVER ACTIONS          │         │         EXTERNAL SERVICES           │
│  (lib/actions/*.js)          │         │  ┌─────────────┐  ┌─────────────┐  │
│  ┌───────────────────────┐  │         │  │  Supabase   │  │   GitHub    │  │
│  │ articles.js           │  │         │  │  Auth/DB    │  │    API      │  │
│  │ projects.js           │  │         │  │  Storage    │  │             │  │
│  │ skills.js             │  │         │  └─────────────┘  └─────────────┘  │
│  │ page-content.js       │  │         │  ┌─────────────┐  ┌─────────────┐  │
│  │ settings.js           │  │         │  │  EmailJS    │  │  Vercel     │  │
│  │ comments.js           │  │         │  │  (Contact)  │  │  (Deploy)   │  │
│  │ chat.js               │  │         │  └─────────────┘  └─────────────┘  │
│  │ storage.js            │  │         └─────────────────────────────────────┘
│  └───────────────────────┘  │
│            │                  │
└────────────┼──────────────────┘
             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE DATA LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  POSTGRESQL DATABASE                                               │   │
│  │  ┌─────┐ ┌──────┐ ┌─────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │   │
│  │  │ prof│ articles│categ│ tags│proj│skill│comm│ chat│ set│ page│      │   │
│  │  │ iles│        │ories│     │ects│    │ents│    │ting│     │      │   │
│  │  └─────┘ └──────┘ └─────┘ └──────┘ └──────┘ └──────┘ └──────┘      │   │
│  │                                                                     │   │
│  │  Row Level Security (RLS) Policies on all tables                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  STORAGE BUCKETS                                                             │
│  ┌────────────────┐  ┌────────────────┐                                    │
│  │  articles      │  │  avatars        │                                    │
│  │  (images)      │  │  (profile pics) │                                    │
│  └────────────────┘  └────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
beautiful-react-tailwind-portfolio-main/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Localized routes (en/fa)
│   │   ├── blog/            # Blog pages
│   │   ├── page.jsx         # Home
│   │   └── layout.jsx       # Locale layout
│   ├── admin/               # CMS dashboard (protected)
│   │   ├── articles/        # Article management
│   │   ├── projects/        # Project management
│   │   ├── skills/          # Skills management
│   │   ├── content/         # Page content CMS
│   │   ├── media/           # Media library
│   │   └── settings/        # Site settings
│   ├── api/                 # API routes
│   │   ├── cron/            # Scheduled tasks
│   │   └── notify/          # Notifications
│   ├── auth/                # Authentication
│   ├── layout.jsx           # Root layout
│   └── providers.jsx        # App providers
├── components/              # React components
│   ├── admin/               # Admin UI components
│   ├── blog/                # Blog components
│   ├── chat/                # Chat widget
│   ├── comments/            # Comment system
│   ├── editor/              # TipTap editor
│   ├── seo/                 # SEO components
│   └── ui/                  # UI primitives
├── lib/                     # Server-side utilities
│   ├── actions/             # Server Actions (data layer)
│   ├── locales/             # i18n translations
│   ├── supabase/            # Supabase clients
│   └── utils.js             # Utilities
├── supabase/               # Database schema
│   ├── schema.sql           # Blog schema
│   └── schema-portfolio-cms.sql  # Portfolio CMS schema
├── e2e/                    # Playwright E2E tests
├── scripts/                # Build/migration scripts
├── public/                 # Static assets + PWA files
├── middleware.js           # Auth + i18n middleware
└── next.config.js          # Next.js configuration
```

---

## 4. Database Schema (Supabase)

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| **profiles** | User profiles | id, email, role, avatar_url |
| **articles** | Blog posts | slug, title_en/fa, status, published_at |
| **categories** | Article categories | slug, name_en/fa, color |
| **tags** | Article tags | slug, name_en/fa |
| **article_tags** | Article↔Tag junction | article_id, tag_id |
| **comments** | Article comments | article_id, content, status |
| **projects** | Portfolio projects | slug, title_en/fa, github_repo_name |
| **project_tags** | Project tags | slug, name_en/fa |
| **project_tag_relations** | Project↔Tag junction | project_id, tag_id |
| **skills** | Skills | slug, name_en/fa, proficiency_level |
| **skill_categories** | Skill categories | slug, name_en/fa |
| **page_content** | CMS page sections | page_slug, section_key, content_en/fa |
| **site_settings** | Key-value settings | key, value_en/fa, category |
| **chat_sessions** | Chat history | session_token, status |
| **article_views** | Analytics | article_id, ip_address |

### RLS Policy Summary
- **Public**: SELECT on published content
- **Authenticated**: INSERT comments, chat sessions
- **Admin**: Full CRUD on all tables

---

## 5. Production Deployment Specifications

### Platform: Vercel

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Start Command** | `npm run start` |
| **Node Version** | 20.x |
| **Environment** | Production (Node.js) |
| **Output Directory** | `.next` |

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# EmailJS (Contact Form)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Admin
ADMIN_EMAILS=admin@example.com
ADMIN_EMAIL=admin@example.com

# Cron Security
CRON_SECRET=random_secret_string

# Optional (GitHub Sync)
GITHUB_TOKEN=github_pat_token

# Optional (Sentry)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

### CI/CD Pipeline (GitHub Actions)

```yaml
Triggers: Push/PR to main branch
Jobs:
  ├─ lint      (ESLint validation)
  ├─ test      (Unit tests with coverage)
  ├─ typecheck (TypeScript validation)
  ├─ build     (Production build)
  └─ e2e       (Playwright tests)
```

### Vercel Configuration

```json
{
  "crons": [{ "path": "/api/cron", "schedule": "0 2 * * *" }],
  "headers": [
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
  ]
}
```

---

## 6. Data Flow Patterns

### Public Content Retrieval
```
User Request → Middleware (locale) → Server Component
→ Server Action (get*) → Supabase Query (RLS filtered)
→ Component Render → HTML Response
```

### Admin Operations
```
Admin Dashboard → Auth Check → Server Action
→ Supabase Mutation (service role) → revalidatePath()
→ Cache Refresh → Success Response
```

### Authentication Flow
```
Login → Supabase Auth → Session Cookie → Middleware Refresh
→ Protected Route Access → Dashboard
```

---

## 7. Key Features

| Feature | Description | Location |
|---------|-------------|----------|
| **Blog System** | Articles with categories, tags, comments | `/admin/articles` |
| **Portfolio** | Projects with GitHub auto-sync | `/admin/projects` |
| **Skills** | Categorized skills with proficiency | `/admin/skills` |
| **CMS** | Editable page content | `/admin/content` |
| **Media Library** | Image upload/management | `/admin/media` |
| **Comments** | Threaded comments with moderation | Built into articles |
| **Chat Widget** | Visitor chat with email notifications | Floating widget |
| **Bilingual** | English + Persian (RTL support) | All content |
| **SEO** | Sitemap, robots.txt, structured data | Auto-generated |
| **PWA** | Offline support, installable | Service worker |

---

## 8. Security Configuration

| Layer | Security Measure |
|-------|-----------------|
| **Headers** | HSTS, X-Frame-Options, CSP |
| **Auth** | Supabase Auth + middleware protection |
| **RLS** | Row-level security on all tables |
| **API** | Service role key (server-side only) |
| **Cron** | Bearer token authentication |
| **Admin** | Email allowlist verification |

---

## 9. Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Images** | AVIF/WebP formats, responsive sizes |
| **Fonts** | Automatic optimization |
| **Code Splitting** | Next.js automatic splitting |
| **Edge Runtime** | API routes on global CDN |
| **Caching** | Image cache TTL: 60s minimum |

---

## 10. NPM Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Start development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run ESLint |
| `test` | `jest` | Run unit tests |
| `test:ci` | `jest --ci --coverage` | CI testing |
| `test:e2e` | `playwright test` | Run E2E tests |

---

**End of Architecture Snapshot**
