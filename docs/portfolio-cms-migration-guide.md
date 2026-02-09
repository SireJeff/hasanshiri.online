# Portfolio CMS Migration Guide

This guide walks you through migrating your portfolio to the new database-driven CMS system.

## Overview

The migration consists of three main steps:
1. **Database Schema Setup** - Create new tables and relationships
2. **Data Migration** - Migrate existing hardcoded skills and projects
3. **PWA Setup** - Generate icons and verify PWA configuration

## Prerequisites

- Supabase project access
- Node.js and npm installed
- Git (for version control)

---

## Step 1: Database Schema Setup

### 1.1 Run the Schema SQL

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/schema-portfolio-cms.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

**What this creates:**
- `skill_categories` table with 5 seeded categories
- `skills` table with RLS policies
- `projects` table with GitHub integration columns
- `project_tags` and `project_tag_relations` tables
- `site_settings` table with default contact and social links
- `page_content` table for home/about sections
- `github_sync_logs` table for tracking sync operations
- All necessary indexes and triggers

### 1.2 Verify Schema Creation

Run this query to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'skill_categories',
    'skills',
    'projects',
    'project_tags',
    'project_tag_relations',
    'site_settings',
    'page_content',
    'github_sync_logs'
  )
ORDER BY table_name;
```

Expected result: 8 tables

---

## Step 2: Data Migration

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Migrate Skills

The migration script will migrate your 26 existing hardcoded skills to the database.

1. Create a temporary migration file at the root of your project:

```javascript
// migrate-skills.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for migrations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Your existing hardcoded skills (from SkillsSection.jsx)
const hardcodedSkills = [
  // ... your existing skills array ...
]

async function migrateSkills() {
  console.log('Migrating skills to database...\n')

  // Get category mapping
  const { data: categories } = await supabase
    .from('skill_categories')
    .select('slug, id')

  const categoryMap = Object.fromEntries(
    categories.map(c => [c.slug, c.id])
  )

  let migrated = 0
  let errors = 0

  for (const skill of hardcodedSkills) {
    try {
      // Map category name to slug
      const categorySlug = skill.category?.toLowerCase().replace(/\s+/g, '-') || 'programming'
      const categoryId = categoryMap[categorySlug]

      const { error } = await supabase.from('skills').insert({
        slug: skill.name.toLowerCase().replace(/\s+/g, '-'),
        name_en: skill.name,
        name_fa: skill.name_fa || skill.name,
        description_en: skill.description,
        description_fa: skill.description_fa || skill.description,
        category_id: categoryId,
        proficiency_level: skill.level || 50,
        icon: skill.icon,
        is_featured: skill.featured || false,
        sort_order: skill.order || 0,
      })

      if (error) throw error
      migrated++
      console.log(`✓ Migrated: ${skill.name}`)
    } catch (error) {
      errors++
      console.error(`✗ Failed: ${skill.name} - ${error.message}`)
    }
  }

  console.log(`\nMigration complete: ${migrated} succeeded, ${errors} failed`)
}

migrateSkills()
```

2. Run the migration:

```bash
node migrate-skills.js
```

### 2.3 Migrate Projects

Similar process for projects. Create `migrate-projects.js`:

```javascript
// migrate-projects.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Your existing hardcoded projects
const hardcodedProjects = [
  // ... your existing projects array ...
]

async function migrateProjects() {
  console.log('Migrating projects to database...\n')

  let migrated = 0
  let errors = 0

  for (const project of hardcodedProjects) {
    try {
      const { error } = await supabase.from('projects').insert({
        slug: project.title.toLowerCase().replace(/\s+/g, '-'),
        title_en: project.title,
        title_fa: project.title_fa || project.title,
        description_en: project.description,
        description_fa: project.description_fa || project.description,
        long_description_en: project.longDescription || '',
        long_description_fa: project.longDescription_fa || '',
        demo_url: project.demoUrl || '',
        github_url: project.githubUrl || '',
        featured_image: project.image || '',
        status: 'active',
        is_featured: project.featured || false,
        sort_order: project.order || 0,
      })

      if (error) throw error
      migrated++
      console.log(`✓ Migrated: ${project.title}`)
    } catch (error) {
      errors++
      console.error(`✗ Failed: ${project.title} - ${error.message}`)
    }
  }

  console.log(`\nMigration complete: ${migrated} succeeded, ${errors} failed`)
}

migrateProjects()
```

3. Run the migration:

```bash
node migrate-projects.js
```

### 2.4 Verify Migration

Check your data in Supabase:

```sql
-- Count skills
SELECT COUNT(*) as skill_count FROM skills;

-- Count projects
SELECT COUNT(*) as project_count FROM projects;

-- View sample data
SELECT s.name_en, c.name_en as category
FROM skills s
LEFT JOIN skill_categories c ON s.category_id = c.id
ORDER BY s.sort_order;
```

---

## Step 3: PWA Setup

### 3.1 Generate PWA Icons

Install sharp for image processing:

```bash
npm install --save-dev sharp
```

Run the icon generator:

```bash
node scripts/generate-pwa-icons.js
```

This generates icons in all required sizes (72x72 to 512x512).

### 3.2 Verify PWA Configuration

1. Check that icons exist in `public/icons/`
2. Verify `public/manifest.json` is present
3. Verify `public/sw.js` is present

### 3.3 Test PWA Installation

1. Start your dev server: `npm run dev`
2. Open Chrome DevTools
3. Go to **Application** tab
4. Check **Manifest** - should show your app info
5. Check **Service Workers** - should show active worker

---

## Step 4: Environment Configuration

### 4.1 Add Cron Secret

Generate a secure random string for cron authentication:

```bash
openssl rand -base64 32
```

Add to your `.env.local`:

```env
# Cron Job Security
CRON_SECRET=your-generated-secret-here

# Optional: GitHub Personal Access Token (for higher API limits)
GITHUB_TOKEN=ghp_your-token-here
```

### 4.2 Configure Vercel Cron

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Cron Jobs**
3. Add a new cron job:
   - **Schedule**: `0 2 * * *` (runs daily at 2 AM UTC)
   - **URL**: `https://your-domain.com/api/cron`
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

---

## Step 5: Testing

### 5.1 Test Admin Interface

1. Run `npm run dev`
2. Navigate to `/admin`
3. Test each admin section:
   - **Skills**: Create, edit, delete skills
   - **Projects**: Create, edit, delete projects
   - **Content**: Edit page sections
   - **Settings**: Update contact info and social links

### 5.2 Test Frontend Display

1. Visit your homepage
2. Verify skills display correctly
3. Verify projects display correctly
4. Test language switching (English/Persian)

### 5.3 Test GitHub Integration

1. In admin, create a project with GitHub repo name (e.g., `facebook/react`)
2. Enable auto-sync
3. Click "Auto-fill from GitHub"
4. Verify data populates correctly

### 5.4 Test Scheduled Publishing

1. Create a draft article with `published_at` set to past date
2. Manually trigger the cron endpoint:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron
   ```
3. Verify the article status changes to "published"

---

## Troubleshooting

### Issue: "relation does not exist"

**Solution:** Make sure you ran the complete schema SQL in Supabase SQL Editor.

### Issue: RLS policy errors

**Solution:** Check that you're authenticated as an admin user in the admin panel.

### Issue: Icons not showing

**Solution:**
1. Make sure you ran `npm install --save-dev sharp`
2. Make sure you ran the icon generator script
3. Clear browser cache

### Issue: Service worker not registering

**Solution:**
1. Check browser console for errors
2. Make sure `public/sw.js` exists
3. Try in incognito mode (bypasses existing cache)

---

## Rollback Plan

If you need to rollback:

1. **Database:** Drop the new tables in Supabase SQL Editor:
   ```sql
   DROP TABLE IF EXISTS public.github_sync_logs CASCADE;
   DROP TABLE IF EXISTS public.page_content CASCADE;
   DROP TABLE IF EXISTS public.site_settings CASCADE;
   DROP TABLE IF EXISTS public.project_tag_relations CASCADE;
   DROP TABLE IF EXISTS public.project_tags CASCADE;
   DROP TABLE IF EXISTS public.projects CASCADE;
   DROP TABLE IF EXISTS public.skills CASCADE;
   DROP TABLE IF EXISTS public.skill_categories CASCADE;
   ```

2. **Code:** Revert to previous commit before CMS changes
3. **Environment:** Remove new env variables

---

## Next Steps

After migration:

1. Delete the temporary migration files (`migrate-skills.js`, `migrate-projects.js`)
2. Remove hardcoded data from frontend components
3. Add custom tags to your projects
4. Set up GitHub auto-sync for your repositories
5. Customize your PWA icons (replace the generated ones)

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Review the implementation status document
4. Test each component individually before testing the whole system
