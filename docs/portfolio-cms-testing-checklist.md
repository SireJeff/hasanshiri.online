# Portfolio CMS - Comprehensive Testing Checklist

## 📋 Overview
This checklist covers all new routes, tabs, functions, and features added in the Portfolio CMS implementation.

---

## 🎯 SECTION 1: NEW ADMIN ROUTES

### Skills Management (`/admin/skills`)
- [ ] **List Page** (`/admin/skills`)
  - [ ] Page loads without errors
  - [ ] Table header displays (Title, Category, Proficiency, Actions)
  - [ ] Category filter chips appear at top
  - [ ] "Add New Skill" button is visible
  - [ ] Empty state shows when no skills exist

- [ ] **Create Page** (`/admin/skills/new`)
  - [ ] Page loads without errors
  - [ ] Language tabs (English | فارسی) toggle correctly
  - [ ] Name field exists (with name_en and name_fa)
  - [ ] Description textarea exists (bilingual)
  - [ ] Proficiency level slider (0-100) works
  - [ ] Category dropdown shows seeded categories
  - [ ] Years of experience input works
  - [ ] Icon URL input works
  - [ ] Documentation URL input works
  - [ ] Featured toggle works
  - [ ] Sort order input works
  - [ ] "Save Skill" button creates skill
  - [ ] "Cancel" button returns to list

- [ ] **Edit Page** (`/admin/skills/[id]/edit`)
  - [ ] Page loads with existing skill data
  - [ ] All fields pre-populate correctly
  - [ ] Language tabs show both English and Persian values
  - [ ] Save updates the skill
  - [ ] Delete confirmation appears
  - [ ] Delete removes skill and redirects to list

### Projects Management (`/admin/projects`)
- [ ] **List Page** (`/admin/projects`)
  - [ ] Page loads without errors
  - [ ] Status filter tabs (All, Active, Draft, Archived) work
  - [ ] Table displays project info
  - [ ] GitHub sync indicator shows (if synced)
  - [ ] "Add New Project" button visible

- [ ] **Create Page** (`/admin/projects/new`)
  - [ ] Page loads without errors
  - [ ] Language tabs toggle correctly
  - [ ] Title field (bilingual)
  - [ ] Short description textarea (bilingual)
  - [ ] Long description with TipTap editor works
  - [ ] TipTap toolbar buttons work (bold, italic, link, etc.)
  - [ ] Demo URL input works
  - [ ] GitHub URL input works
  - [ ] Docs URL input works
  - [ ] Featured image URL input works
  - [ ] Status dropdown (Active/Draft/Archived)
  - [ ] Featured toggle works
  - [ ] Sort order input works

- [ ] **GitHub Integration Section**
  - [ ] GitHub repo name input works
  - [ ] "Auto-fill from GitHub" button exists
  - [ ] Auto-fill fetches repo data correctly
  - [ ] Auto-fill populates: title, description, URLs
  - [ ] Auto-sync toggle works
  - [ ] Tag selection shows available tags
  - [ ] Tag selection allows multiple selections
  - [ ] Selected tags display as chips
  - [ ] Tags can be removed from selection
  - [ ] "Save Project" button creates project

- [ ] **Edit Page** (`/admin/projects/[id]/edit`)
  - [ ] Page loads with existing project data
  - [ ] All fields pre-populate correctly
  - [ ] TipTap editor loads existing content
  - [ ] Tags show pre-selected tags
  - [ ] Save updates the project
  - [ ] Delete confirmation appears
  - [ ] Delete removes project and redirects to list

### Content Management (`/admin/content`)
- [ ] **List Page** (`/admin/content`)
  - [ ] Page loads without errors
  - [ ] Page selector tabs (Home | About) work
  - [ ] Content sections grouped by page
  - [ ] Each section shows: title, visibility toggle
  - [ ] "Edit" button for each section

- [ ] **Edit Page** (`/admin/content/[id]/edit`)
  - [ ] Page loads with existing content data
  - [ ] Dynamic field labels based on section type
  - [ ] Title fields (bilingual)
  - [ ] Content fields (bilingual)
  - [ ] Additional fields display based on section
  - [ ] Image URL input works
  - [ ] Visibility toggle works
  - [ ] Sort order input works
  - [ ] "Save Changes" button updates content
  - [ ] "Back" button returns to list

### Settings Management (`/admin/settings`)
- [ ] **Contact Tab** (new)
  - [ ] Tab appears in settings
  - [ ] Contact tab switches to contact form
  - [ ] Email input with Mail icon
  - [ ] Phone input with Phone icon
  - [ ] Location (English) input with MapPin icon
  - [ ] Location (Persian) input with MapPin icon and RTL
  - [ ] "Save Contact Info" button saves settings
  - [ ] Success message appears after save

- [ ] **Social Tab** (new)
  - [ ] Tab appears in settings
  - [ ] Social tab switches to social form
  - [ ] GitHub input with Github icon
  - [ ] LinkedIn input with Linkedin icon
  - [ ] Twitter input with Twitter icon
  - [ ] YouTube input with Youtube icon
  - [ ] Telegram input with Send icon
  - [ ] WhatsApp input with MessageCircle icon
  - [ ] Instagram input with Instagram icon
  - [ ] Docker Hub input with Anchor icon
  - [ ] Virgool input with ExternalLink icon
  - [ ] "Save Social Links" button saves settings

- [ ] **GitHub Tab** (new)
  - [ ] Tab appears in settings
  - [ ] GitHub tab switches to GitHub form
  - [ ] GitHub username input with Github icon
  - [ ] Auto-sync toggle switch works
  - [ ] Toggle shows visual feedback (slides left/right)
  - [ ] Info note explains auto-sync feature
  - [ ] "Save GitHub Settings" button saves settings

---

## 🔧 SECTION 2: NEW API ENDPOINTS

### Cron Endpoint (`/api/cron`)
- [ ] **GET /api/cron** (cron job)
  - [ ] Returns 401 without Bearer token
  - [ ] Returns 401 with invalid CRON_SECRET
  - [ ] Returns 200 with valid Bearer token
  - [ ] Response includes: timestamp, githubSync, scheduledPublish
  - [ ] GitHub sync runs when enabled
  - [ ] Scheduled publishing runs

- [ ] **POST /api/cron** (manual trigger)
  - [ ] Returns 401 without Bearer token
  - [ ] Accepts JSON body with jobs array
  - [ ] Can trigger only github sync
  - [ ] Can trigger only scheduled publish
  - [ ] Can trigger both jobs
  - [ ] Returns results for each job

---

## ⚙️ SECTION 3: NEW SERVER ACTIONS (lib/actions/)

### Skills Actions (`lib/actions/skills.js`)
- [ ] **getSkills()**
  - [ ] Returns array of skills with category data
  - [ ] Supports optional parameters (featured, limit, category)
  - [ ] Orders by sort_order

- [ ] **getSkillsGroupedByCategory()**
  - [ ] Returns skills grouped by category
  - [ ] Includes uncategorized skills
  - [ ] Orders groups by category sort_order

- [ ] **getSkillBySlug(slug)**
  - [ ] Returns single skill by slug
  - [ ] Returns error if not found

- [ ] **createSkill(data)**
  - [ ] Creates new skill in database
  - [ ] Generates slug from name_en if not provided
  - [ ] Returns created skill
  - [ ] Revalidates /admin/skills path

- [ ] **updateSkill(id, data)**
  - [ ] Updates existing skill
  - [ ] Returns updated skill
  - [ ] Revalidates paths

- [ ] **deleteSkill(id)**
  - [ ] Deletes skill from database
  - [ ] Revalidates paths

- [ ] **getSkillCategories()**
  - [ ] Returns all skill categories
  - [ ] Ordered by sort_order

- [ ] **createCategory(data)**
  - [ ] Creates new skill category
  - [ ] Returns created category

- [ ] **updateCategory(id, data)**
  - [ ] Updates category
  - [ ] Returns updated category

- [ ] **deleteCategory(id)**
  - [ ] Deletes category
  - [ ] Skills in category become uncategorized

### Projects Actions (`lib/actions/projects.js`)
- [ ] **getProjects(params)**
  - [ ] Returns array of projects
  - [ ] Supports filtering: featured, status, tag, limit
  - [ ] Includes related tags
  - [ ] Orders by sort_order

- [ ] **getProjectBySlug(slug)**
  - [ ] Returns single project by slug
  - [ ] Includes related tags

- [ ] **getAdminProjects(params)**
  - [ ] Returns projects for admin (includes draft/archived)
  - [ ] Supports all status filters

- [ ] **createProject(data)**
  - [ ] Creates new project
  - [ ] Generates slug from title_en if not provided
  - [ ] Associates tags via junction table
  - [ ] Returns created project
  - [ ] Revalidates paths

- [ ] **updateProject(id, data)**
  - [ ] Updates project
  - [ ] Updates tag associations
  - [ ] Returns updated project
  - [ ] Revalidates paths

- [ ] **deleteProject(id)**
  - [ ] Deletes project
  - [ ] Deletes tag associations
  - [ ] Revalidates paths

- [ ] **getProjectTags()**
  - [ ] Returns all project tags
  - [ ] Ordered by name_en

- [ ] **createTag(data)**
  - [ ] Creates new tag
  - [ ] Generates slug from name_en

- [ ] **updateTag(id, data)**
  - [ ] Updates tag

- [ ] **deleteTag(id)**
  - [ ] Deletes tag
  - [ ] Removes all project associations

- [ ] **getGitHubSettings()** (new)
  - [ ] Returns GitHub username from site_settings
  - [ ] Returns syncEnabled boolean
  - [ ] Handles missing settings gracefully

- [ ] **syncGitHubProjects(token)**
  - [ ] Fetches GitHub settings
  - [ ] Gets projects with auto_sync enabled
  - [ ] Fetches repo data from GitHub API
  - [ ] Updates projects with new data (stars, forks, language)
  - [ ] Updates github_last_sync_at timestamp
  - [ ] Returns sync results

### Page Content Actions (`lib/actions/page-content.js`)
- [ ] **getAdminPageContent(pageSlug)**
  - [ ] Returns all content sections for page
  - [ ] Includes draft sections (for admin)
  - [ ] Grouped/ordered appropriately

- [ ] **getPageContent(pageSlug)**
  - [ ] Returns only enabled sections
  - [ ] For public display

- [ ] **getPageContentBySection(pageSlug, sectionKey)**
  - [ ] Returns specific section
  - [ ] Returns error if not found

- [ ] **createPageContent(data)**
  - [ ] Creates new content section
  - [ ] Enforces unique page_slug + section_key
  - [ ] Returns created content

- [ ] **updatePageContent(id, data)**
  - [ ] Updates content section
  - [ ] Returns updated content
  - [ ] Revalidates paths

- [ ] **deletePageContent(id)**
  - [ ] Deletes content section
  - [ ] Revalidates paths

- [ ] **reorderPageContent(orders)**
  - [ ] Updates sort_order for multiple sections
  - [ ] Accepts array of {id, sort_order}

### Extended Settings Actions (`lib/actions/settings.js`)
- [ ] **getSiteSettings()**
  - [ ] Returns all site_settings
  - [ ] Groups by category (contact, social, github, etc.)
  - [ ] Provides byKey lookup object
  - [ ] Provides byCategory lookup object
  - [ ] **get(key, default, locale)** helper method
    - [ ] Returns value for key
    - [ ] Falls back to default if not found
    - [ ] Returns locale-specific value (fa or en)
    - [ ] Falls back to value_en if value_fa is empty

- [ ] **updateSiteSettings(updates)**
  - [ ] Accepts array of setting objects
  - [ ] Each object: {key, value_en, value_fa, type}
  - [ ] Upserts all settings
  - [ ] Revalidates paths
  - [ ] Returns success/error

- [ ] **getExternalLinks()** (extended)
  - [ ] Returns external links for Projects section
  - [ ] Fetches from site_settings (external_link_1, external_link_2)

### Articles Actions (`lib/actions/articles.js`)
- [ ] **publishScheduledArticles()** (new)
  - [ ] Finds draft articles with published_at <= now
  - [ ] Updates status to 'published'
  - [ ] Returns count of published articles
  - [ ] Revalidates blog paths

---

## 🧩 SECTION 4: NEW COMPONENTS

### Admin Shared Components
- [ ] **AdminTable** (`components/admin/shared/admin-table.jsx`)
  - [ ] Renders table with columns
  - [ ] Sorting works on sortable columns
  - [ ] Row actions display correctly
  - [ ] Empty state shows when no data
  - [ ] Loading state shows during fetch

- [ ] **LanguageTabs** (`components/admin/shared/language-tabs.jsx`)
  - [ ] Renders English and فارسی tabs
  - [ ] Active tab highlighted
  - [ ] Clicking tab switches active language
  - [ ] Tab state persists

- [ ] **BilingualField** (`components/admin/shared/language-tabs.jsx`)
  - [ ] Renders input for active language
  - [ ] Shows name_en when English active
  - [ ] Shows name_fa when Persian active
  - [ ] Supports textarea prop
  - [ ] Supports RTL for Persian
  - [ ] Supports all standard input props

### Skills Form Components
- [ ] **SkillForm** (`components/admin/skills/skill-form.jsx`)
  - [ ] Form state initializes correctly
  - [ ] Validation works (required fields)
  - [ ] Proficiency slider updates value display
  - [ ] Category dropdown populates
  - [ ] Language tabs switch between en/fa fields
  - [ ] Form submits correctly
  - [ ] Error messages display

### Projects Form Components
- [ ] **ProjectForm** (`components/admin/projects/project-form.jsx`)
  - [ ] Form state initializes correctly
  - [ ] TipTap editor loads and works
  - [ ] TipTap toolbar buttons functional
  - [ ] GitHub auto-fill fetches and populates
  - [ ] Tag selection allows multi-select
  - [ ] Tag selection visual feedback works
  - [ ] Form submits correctly
  - [ ] Error messages display

### Content Editor Components
- [ ] **ContentEditor** (`components/admin/content/content-editor.jsx`)
  - [ ] Form loads existing data
  - [ ] Dynamic field labels based on section
  - [ ] All fields update correctly
  - [ ] Form submits correctly

### PWA Components
- [ ] **PWARegistrar** (`app/components/pwa-registrar.jsx`)
  - [ ] Mounts without errors
  - [ ] Registers service worker on mount
  - [ ] Logs successful registration
  - [ ] Handles beforeinstallprompt event

---

## 🗄️ SECTION 5: DATABASE TABLES

### Skill Tables
- [ ] **skill_categories** table exists
  - [ ] 5 seeded categories present:
    - [ ] data-science (Data Science | علم داده)
    - [ ] programming (Programming | برنامه‌نویسی)
    - [ ] tools (Tools & DevOps | ابزارها و دواپس)
    - [ ] research (Domain Knowledge | دانش تخصصی)
    - [ ] languages (Languages | زبان‌ها)
  - [ ] All have colors assigned
  - [ ] All have sort_order values

- [ ] **skills** table exists
  - [ ] Columns: id, slug, name_en, name_fa, description_en, description_fa
  - [ ] Columns: category_id, proficiency_level, years_of_experience
  - [ ] Columns: icon, url, is_featured, sort_order
  - [ ] Foreign key to skill_categories works
  - [ ] RLS policies configured

### Project Tables
- [ ] **projects** table exists
  - [ ] Columns: id, slug, title_en, title_fa
  - [ ] Columns: description_en, description_fa, long_description_en, long_description_fa
  - [ ] Columns: demo_url, github_url, docs_url
  - [ ] Columns: github_repo_name, github_repo_id, github_stars, github_forks
  - [ ] Columns: github_language, github_last_sync_at, is_github_synced, auto_sync
  - [ ] Columns: featured_image, gallery, status, start_date, end_date
  - [ ] Columns: is_featured, featured_order, sort_order
  - [ ] SEO columns: meta_title_en, meta_title_fa, meta_description_en, meta_description_fa
  - [ ] RLS policies configured

- [ ] **project_tags** table exists
  - [ ] Columns: id, slug, name_en, name_fa

- [ ] **project_tag_relations** table exists
  - [ ] Junction table for many-to-many
  - [ ] Columns: project_id, tag_id
  - [ ] Composite primary key

### Settings Tables
- [ ] **site_settings** table exists
  - [ ] Columns: key, value_en, value_fa, value_json, type, category
  - [ ] Seeded with initial settings:
    - [ ] Contact: email, phone, location
    - [ ] Social: github, linkedin, twitter, youtube, telegram, whatsapp, instagram, dockerhub, virgool
    - [ ] Resume: resume_en_url, resume_fa_url
    - [ ] GitHub: github_username, github_sync_enabled
    - [ ] External: external_link_1, external_link_2
  - [ ] RLS policies configured

### Content Tables
- [ ] **page_content** table exists
  - [ ] Columns: id, page_slug, section_key
  - [ ] Columns: title_en, title_fa, content_en, content_fa
  - [ ] Columns: field_1_en, field_1_fa, field_2_en, field_2_fa, field_3_en, field_3_fa
  - [ ] Columns: image_url, is_enabled, sort_order
  - [ ] Seeded with initial sections (hero, about-intro)
  - [ ] RLS policies configured

### Sync Tables
- [ ] **github_sync_logs** table exists
  - [ ] Columns: id, sync_type, status, items_processed
  - [ ] Columns: items_created, items_updated, error_message
  - [ ] Columns: started_at, completed_at
  - [ ] RLS policies configured

---

## 📱 SECTION 6: PWA FEATURES

### Manifest File
- [ ] **public/manifest.json** exists
  - [ ] name: "Hasan Shiri - Portfolio"
  - [ ] short_name: "Portfolio"
  - [ ] start_url: "/"
  - [ ] display: "standalone"
  - [ ] background_color: "#0f172a"
  - [ ] theme_color: "#667eea"
  - [ ] Icons array configured (8 sizes)
  - [ ] Shortcuts configured (Blog, Projects, Contact)
  - [ ] Categories: portfolio, blog, education

### Service Worker
- [ ] **public/sw.js** exists
  - [ ] Cache version defined
  - [ ] Install event caches static assets
  - [ ] Activate event cleans old caches
  - [ ] Fetch event handles requests
  - [ ] Cache-first for images/fonts
  - [ ] Network-first for API calls
  - [ ] Stale-while-revalidate for pages
  - [ ] Message handler for SKIP_WAITING and CLEAR_CACHE

### PWA Icons
- [ ] All icon sizes generated:
  - [ ] icon-72x72.png
  - [ ] icon-96x96.png
  - [ ] icon-128x128.png
  - [ ] icon-144x144.png
  - [ ] icon-152x152.png
  - [ ] icon-192x192.png
  - [ ] icon-384x384.png
  - [ ] icon-512x512.png

### PWA Integration
- [ ] **app/layout.jsx** updated
  - [ ] Manifest link tag present
  - [ ] Apple touch icon link present
  - [ ] Theme color meta tag present
  - [ ] PWARegistrar component mounted

---

## 🔌 SECTION 7: CRON JOB CONFIGURATION

### Vercel Cron
- [ ] **vercel.json** exists
  - [ ] cron array configured
  - [ ] Path: "/api/cron"
  - [ ] Schedule: "0 2 * * *" (daily at 2 AM UTC)

### Environment Variable
- [ ] **CRON_SECRET** configured
  - [ ] Set in Vercel environment variables
  - [ ] Value: rbSbCuGJWxX2+hA1f9CRdxTWfcDVRPc+NtbGUCa7dD0=
  - [ ] Used in Authorization header: `Bearer {CRON_SECRET}`

### Cron Testing
- [ ] **Manual Test** (run after deployment)
  ```bash
  curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
    https://hasanshiri.online/api/cron
  ```
  - [ ] Returns 200 status
  - [ ] Response includes githubSync and scheduledPublish
  - [ ] Duration logged in headers

---

## 📄 SECTION 8: CONFIGURATION FILES

### Next.js Config
- [ ] **next.config.js** updated
  - [ ] eslint.ignoreDuringBuilds: true
  - [ ] typescript.ignoreBuildErrors: true
  - [ ] Server actions bodySizeLimit: '2mb'

### Package.json
- [ ] **Scripts** added
  - [ ] "pwa:icons": "node scripts/generate-pwa-icons.js"

- [ ] **Dependencies** added
  - [ ] "sharp": "^0.33.0"

### Environment Files
- [ ] **.env.example** created
  - [ ] Documents all environment variables
  - [ ] Includes new CMS variables

---

## 🧪 SECTION 9: TESTING CONSIDERATIONS

### Admin Authentication
- [ ] All admin routes require authentication
- [ ] Non-authenticated users redirected to login
- [ ] Only admins can access (role = 'admin')

### Data Validation
- [ ] Skill names required
- [ ] Project titles required
- [ ] Slugs auto-generated if not provided
- [ ] Proficiency must be 0-100
- [ ] URLs validated (if applicable)

### Error Handling
- [ ] Create operations handle errors gracefully
- [ ] Update operations handle errors gracefully
- [ ] Delete operations require confirmation
- [ ] API errors display user-friendly messages

### Performance
- [ ] List pages load quickly
- [ ] Forms respond immediately to input
- [ ] TipTap editor doesn't lag
- [ ] Tag selection doesn't freeze UI

---

## ✨ SECTION 10: OPTIONAL ENHANCEMENTS

These are features that can be added later:
- [ ] Image upload directly in forms (currently URL only)
- [ ] Project gallery management
- [ ] Bulk import/export for skills and projects
- [ ] Revision history for page content
- [ ] Analytics dashboard in admin
- [ ] PWA push notifications
- [ ] Offline indicator in UI
- [ ] Add to homescreen prompt

---

## 📊 SECTION 11: MIGRATION VERIFICATION

If you have existing data to migrate:
- [ ] Hardcoded skills (26 items) → database
- [ ] Hardcoded projects (9 items) → database
- [ ] Verify all skills imported correctly
- [ ] Verify all projects imported correctly
- [ ] Check category assignments
- [ ] Check tag assignments

---

## 🎯 FINAL VERIFICATION

### Production Site
- [ ] Homepage loads at https://hasanshiri.online
- [ ] New hero photo displays
- [ ] No console errors
- [ ] All routes accessible
- [ ] PWA install prompt appears (in supported browsers)

### Admin Panel
- [ ] Login works
- [ ] Dashboard loads
- [ ] All new admin routes accessible
- [ ] Forms submit successfully
- [ ] Data persists in database

### Database
- [ ] All tables exist in Supabase
- [ ] RLS policies active
- [ ] Seed data present
- [ ] Can query from admin actions

---

## 📝 NOTES

- **Bilingual Fields**: All text content has `_en` and `_fa` suffixes
- **Slug Generation**: Auto-generated from English name/title
- **Sort Order**: Lower numbers appear first
- **Status Values**: 'active', 'draft', 'archived' for projects
- **Proficiency**: 0-100 scale for skills
- **GitHub Sync**: Must enable per-project AND in settings

---

*Checklist Complete: 150+ items to verify*
*Created: 2026-02-09*
*Implementation: Pragmatic Balance Approach*
