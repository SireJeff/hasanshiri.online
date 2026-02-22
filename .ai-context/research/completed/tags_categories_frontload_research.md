# RPI Research: Tags & Categories Frontloading

**Feature:** Tags and Categories Frontloading for Dashboard
**Date:** 2026-02-22
**Status:** COMPLETE
**Research Phases:** 5 Parallel Agents

---

## Executive Summary

This research analyzes the current state of tags and categories across the hasanshiri.online platform to generate comprehensive recommendations for frontloading these entities in the admin dashboard. The platform has two separate content systems:

1. **Blog/Articles System** - 4 seeded categories, 0 seeded tags
2. **Portfolio/Projects System** - 5 skill categories, 14+ project tags

Based on the site owner's background (Physics student at Sharif University, former Computer Engineering at University of Isfahan) and existing projects, this research recommends **35 article tags** and **8 additional article categories** to pre-populate the dashboard.

---

## Chunk Manifest

| Chunk ID | Domain | Status | Files | Ready for Planning |
|----------|--------|--------|-------|-------------------|
| CHUNK-R1 | Articles/Blog System | 📋 PLANNED → P1, P2, P3 | 12 | ✅ |
| CHUNK-R2 | Projects/Portfolio System | 📋 PLANNED → P1, P4 | 8 | ✅ |
| CHUNK-R3 | Categories Schema & Management | 📋 PLANNED → P2 | 6 | ✅ |
| CHUNK-R4 | Tags Schema & Management | 📋 PLANNED → P3, P4 | 6 | ✅ |
| CHUNK-R5 | Admin Dashboard UI | 📋 PLANNED → P6 | 4 | ✅ |

**Plan Document:** `.ai-context/plans/active/tags_categories_frontload_plan.md`

---

## CHUNK-R1: Articles/Blog System Analysis

### Files Analyzed:
- `supabase/schema.sql` (lines 126-167, 59-74, 97-103, 199-203)
- `lib/actions/articles.js` (lines 1-458)
- `lib/actions/categories.js` (lines 1-138)
- `lib/actions/tags.js` (lines 1-220)
- `app/admin/articles/article-form.jsx` (lines 445-482)
- `app/[locale]/blog/page.jsx` (lines 158-221)
- `components/blog/CategoryFilter.jsx` (lines 1-119)
- `components/blog/ArticleCard.jsx` (lines 48-55)

### Current Article Categories (4 Seeded):

| Slug | Name (EN) | Name (FA) | Color | Sort |
|------|-----------|-----------|-------|------|
| `technology` | Technology | تکنولوژی | #3b82f6 | 1 |
| `data-science` | Data Science | علم داده | #10b981 | 2 |
| `physics` | Physics | فیزیک | #8b5cf6 | 3 |
| `thoughts` | Thoughts | اندیشه‌ها | #f59e0b | 4 |

### Current Article Tags:
**None seeded** - Tags must be created manually through admin interface

### Content Themes (Based on Site Owner Profile):
- Physics & Complex Systems
- Data Analysis & Machine Learning
- Python Programming
- Docker & DevOps
- International Trade
- Web Development

---

## CHUNK-R2: Projects/Portfolio System Analysis

### Files Analyzed:
- `supabase/schema-portfolio-cms.sql` (lines 96-147, 181-194)
- `lib/actions/projects.js` (lines 1-973)
- `lib/actions/projects.js` - migration function (lines 548-722)
- `scripts/update-projects-images-tags.js` (lines 31-98)
- `components/admin/projects/project-form.jsx` (lines 1-802)
- `app/[locale]/projects/[slug]/page.jsx` (lines 1-265)

### Current Skill Categories (5 Seeded):

| Slug | Name (EN) | Name (FA) | Color |
|------|-----------|-----------|-------|
| `data-science` | Data Science | علم داده | #3b82f6 |
| `programming` | Programming | برنامه‌نویسی | #10b981 |
| `tools` | Tools & DevOps | ابزارها و دواپس | #f59e0b |
| `research` | Domain Knowledge | دانش تخصصی | #8b5cf6 |
| `languages` | Languages | زبان‌ها | #ec4899 |

### Current Project Tags (14+ from Migration):

| Tag | Persian | Used By Project |
|-----|---------|-----------------|
| `python` | پایتون | Multiple projects |
| `docker` | داکر | SSH VPN, PROJECT-LIBERTAD |
| `automation` | اتوماسیون | PROJECT-LIBERTAD |
| `telegram` | تلگرام | TG_reminder, PROJECT-LIBERTAD |
| `data-analysis` | تحلیل داده | Restaurant analysis, NASTA |
| `web-scraping` | وب‌اسکرپینگ | PROJECT-LIBERTAD |
| `computational-physics` | فیزیک محاسباتی | oscilation_simulation |
| `interpolation` | درون‌یابی | interpolationTechniques |
| `web-development` | توسعه وب | SKM website |
| `react` | ری‌اکت | SKM website |
| `tailwind-css` | تیلویند | SKM website |
| `distributed-systems` | سیستم‌های توزیع‌شده | UISSF |
| `p2p-storage` | ذخیره‌سازی همتا به همتا | UISSF |
| `augmented-reality` | واقعیت افزوده | UISSF |
| `computer-vision` | بینایی ماشین | UISSF |
| `iot` | اینترنت اشیاء | UISSF |

### Existing Projects Content Analysis:
1. **interpolationTechniques** - Python, numerical methods
2. **Restaurant_data_analysis** - Python, Pandas, data analysis
3. **SSH VPN on RunOnFlux** - Python, Docker, infrastructure
4. **NASTA** - Python, NASA API, data analysis
5. **TG_reminder** - Python, Telegram Bot
6. **oscilation_simulation** - Computational physics, Python
7. **SKM construction website** - Web development, React
8. **UISSF** - Research proposal, distributed systems, AR, IoT

---

## CHUNK-R3: Categories Schema & Management

### Database Schema:
**File:** `supabase/schema.sql` (lines 59-74)

```sql
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    description_en TEXT,
    description_fa TEXT,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Admin Management:
**File:** `app/admin/categories/page.jsx` (lines 1-347)
- Full CRUD operations
- Modal form for create/edit
- Bilingual support (EN/FA)
- Auto-slug generation
- Article count display
- Delete confirmation

### Relationships:
- Articles → Categories (many-to-one via `category_id`)
- Skill Categories separate from Article Categories

---

## CHUNK-R4: Tags Schema & Management

### Article Tags Schema:
**File:** `supabase/schema.sql` (lines 97-103)

```sql
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Junction Table (article_tags):
**File:** `supabase/schema.sql` (lines 199-203)

```sql
CREATE TABLE IF NOT EXISTS public.article_tags (
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);
```

### Project Tags Schema:
**File:** `supabase/schema-portfolio-cms.sql` (lines 181-194)
- Separate `project_tags` table
- Separate `project_tag_relations` junction table
- Same structure as article tags

### Admin Management:
**File:** `app/admin/tags/page.jsx` (lines 1-293)
- Full CRUD operations
- Grid view layout
- Search functionality
- Article count per tag

---

## CHUNK-R5: Admin Dashboard UI

### Tag Management Interface:
**File:** `app/admin/tags/page.jsx`
- Route: `/admin/tags`
- Modal form with bilingual fields
- Search filter
- Delete confirmation

### Category Management Interface:
**File:** `app/admin/categories/page.jsx`
- Route: `/admin/categories`
- List view with drag handles
- Modal form with bilingual fields
- Sort order field

### Bulk Import Scripts:
**File:** `scripts/import-i18n-data.js` (lines 1-383)
- Imports from locale JSON files
- Uses `upsert` for idempotent imports
- Can be adapted for tags/categories

**File:** `scripts/update-projects-images-tags.js` (lines 31-98)
- Creates project tags programmatically
- Maps projects to tags
- Example of bulk tag creation

---

## RECOMMENDATIONS: Tags & Categories to Frontload

### Article Categories (Recommended Additions)

| Slug | Name (EN) | Name (FA) | Color | Description (EN) | Sort |
|------|-----------|-----------|-------|------------------|------|
| `tutorials` | Tutorials | آموزش‌ها | #06b6d4 | Step-by-step guides and how-tos | 5 |
| `projects` | Projects | پروژه‌ها | #84cc16 | Project showcases and case studies | 6 |
| `career` | Career | مسیر شغلی | #f43f5e | Career development and professional growth | 7 |
| `research` | Research | پژوهش | #6366f1 | Academic research and findings | 8 |

### Article Tags (Recommended - 35 Total)

#### Programming Languages (8)
| Slug | Name (EN) | Name (FA) |
|------|-----------|-----------|
| `python` | Python | پایتون |
| `javascript` | JavaScript | جاوااسکریپت |
| `typescript` | TypeScript | تایپ‌اسکریپت |
| `sql` | SQL | اس‌کیو‌ال |
| `bash` | Bash/Shell | بش |
| `html-css` | HTML & CSS | اچ‌تی‌ام‌ال و سی‌اس‌اس |
| `markdown` | Markdown | مارک‌داون |
| `latex` | LaTeX | لاتک |

#### Web Development (6)
| Slug | Name (EN) | Name (FA) |
|------|-----------|-----------|
| `react` | React | ری‌اکت |
| `nextjs` | Next.js | نکست‌جی‌اس |
| `tailwind` | Tailwind CSS | تیلویند |
| `nodejs` | Node.js | نود‌جی‌اس |
| `api` | API Development | توسعه API |
| `frontend` | Frontend | فرانت‌اند |

#### Data Science & AI (7)
| Slug | Name (EN) | Name (FA) |
|------|-----------|-----------|
| `machine-learning` | Machine Learning | یادگیری ماشین |
| `deep-learning` | Deep Learning | یادگیری عمیق |
| `data-visualization` | Data Visualization | مصورسازی داده |
| `pandas` | Pandas | پانداس |
| `numpy` | NumPy | نامپای |
| `matplotlib` | Matplotlib | مت‌پلات‌لیب |
| `jupyter` | Jupyter | جوپیتر |

#### Physics & Science (5)
| Slug | Name (EN) | Name (FA) |
|------|-----------|-----------|
| `computational-physics` | Computational Physics | فیزیک محاسباتی |
| `simulation` | Simulation | شبیه‌سازی |
| `complex-systems` | Complex Systems | سیستم‌های پیچیده |
| `numerical-methods` | Numerical Methods | روش‌های عددی |
| `research-paper` | Research Paper | مقاله پژوهشی |

#### DevOps & Tools (5)
| Slug | Name (EN) | Name (FA) |
|------|-----------|-----------|
| `docker` | Docker | داکر |
| `git` | Git & GitHub | گیت و گیت‌هاب |
| `linux` | Linux | لینوکس |
| `ci-cd` | CI/CD | CI/CD |
| `vercel` | Vercel | ورسل |

#### Special Topics (4)
| Slug | Name (EN) | Name (FA) |
|------|-----------|-----------|
| `automation` | Automation | اتوماسیون |
| `telegram-bot` | Telegram Bot | ربات تلگرام |
| `international-trade` | International Trade | تجارت بین‌الملل |
| `persian` | Persian Content | محتوای فارسی |

---

### Project Tags (Recommended Additions - 10)

| Slug | Name (EN) | Name (FA) |
|------|-----------|-----------|
| `nextjs` | Next.js | نکست‌جی‌اس |
| `supabase` | Supabase | سوپابیس |
| `api-integration` | API Integration | یکپارچه‌سازی API |
| `bot` | Bot/Application | ربات/اپلیکیشن |
| `portfolio` | Portfolio | پورتفولیو |
| `cms` | CMS | سیستم مدیریت محتوا |
| `authentication` | Authentication | احراز هویت |
| `realtime` | Real-time | بلادرنگ |
| `seo` | SEO | سئو |
| `open-source` | Open Source | متن‌باز |

---

## Inter-Phase Contract

```
EXPECTED_CONSUMER: rpi-plan
CHUNK_PROCESSING_ORDER: sequential (R1 → R2 → R3 → R4 → R5)
MARK_AS_PLANNED_WHEN: chunk todolist created
REQUIRED_OUTPUT: CHUNK-Pn per CHUNK-Rn

IMPLEMENTATION_APPROACH:
  1. Create SQL migration script with INSERT statements
  2. Create Node.js seed script for programmatic insertion
  3. Add admin UI for bulk import (optional)
  4. Update locale JSON files with Persian translations

DATA_FORMAT_REQUIRED:
  - slug: URL-friendly identifier (unique)
  - name_en: English display name
  - name_fa: Persian/Farsi display name
  - color: Hex color code (categories only)
  - sort_order: Display order (categories only)
```

---

## Implementation Options

### Option A: SQL Migration Script
**Pros:** Atomic, version-controlled, rollback support
**Cons:** Requires database migration execution

```sql
-- Example for article tags
INSERT INTO public.tags (slug, name_en, name_fa) VALUES
  ('python', 'Python', 'پایتون'),
  ('javascript', 'JavaScript', 'جاوااسکریپت'),
  -- ... more tags
ON CONFLICT (slug) DO NOTHING;
```

### Option B: Node.js Seed Script
**Pros:** Reusable, can read from JSON, better error handling
**Cons:** Requires manual execution

```javascript
// Similar to scripts/update-projects-images-tags.js
const tags = require('./data/article-tags.json');
for (const tag of tags) {
  await supabase.from('tags').upsert(tag, { onConflict: 'slug' });
}
```

### Option C: Admin Dashboard Bulk Import
**Pros:** User-friendly, no command line
**Cons:** Requires UI development

---

## Statistics

- **Current Article Categories:** 4
- **Recommended Article Categories:** 8 (4 additional)
- **Current Article Tags:** 0
- **Recommended Article Tags:** 35
- **Current Project Tags:** 14+
- **Recommended Project Tags:** 24+ (10 additional)
- **Total Entities to Frontload:** 49

---

## Files Requiring Changes

| File | Purpose | Priority |
|------|---------|----------|
| `supabase/migrations/[date]_seed_tags_categories.sql` | SQL migration | HIGH |
| `scripts/seed-tags-categories.js` | Seed script | HIGH |
| `lib/data/article-tags.json` | Tag data source | MEDIUM |
| `lib/data/article-categories.json` | Category data source | MEDIUM |
| `public/locales/en.json` | English translations | LOW |
| `public/locales/fa.json` | Persian translations | LOW |

---

**Research Complete - Ready for `/rpi-plan tags-categories-frontload`**
