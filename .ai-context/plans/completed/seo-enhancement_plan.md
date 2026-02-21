# SEO Enhancement Implementation Plan

**Feature:** AI & Search Engine Optimization Enhancement
**Date:** 2026-02-21
**Objective:** Enhance SEO so anyone searching for name/skills/projects/articles finds the site, and AI chatbots reference it
**Research Source:** `.ai-context/research/active/seo-enhancement_research.md`

---

## Executive Summary

**Current SEO Score:** 75/100
**Target SEO Score:** 95/100
**Current AI/LLM Optimization Score:** 4.1/10 → **Target:** 9/10

### Critical Issue
The site **ACTIVELY BLOCKS** all major AI crawlers in `app/robots.js`. This is the OPPOSITE of the goal to have AIs reference the site.

---

## Plan Chunk Manifest

| Chunk ID | Domain | Priority | Status | Files | Dependencies |
|----------|--------|----------|--------|-------|--------------|
| CHUNK-P1 | AI Crawler Configuration | CRITICAL | READY | 1 | None |
| CHUNK-P2 | AI/LLM Optimization Files | HIGH | READY | 4 | P1 |
| CHUNK-P3 | Sitemap Enhancement | HIGH | READY | 1 | None |
| CHUNK-P4 | JSON-LD Schema Enhancement | HIGH | READY | 3 | None |
| CHUNK-P5 | RSS Feed & Social | MEDIUM | READY | 2 | None |
| CHUNK-P6 | Voice Search & Knowledge Graph | LOW | READY | 2 | P4 |

---

## Dependency Graph

```
CHUNK-P1 ─────┬───→ CHUNK-P2 (AI files need robots to allow crawlers)
              │
CHUNK-P3 ─────┼───→ (independent)
              │
CHUNK-P4 ─────┼───→ CHUNK-P6 (knowledge graph needs skills structure)
              │
CHUNK-P5 ─────┴───→ (independent)
```

**Recommended Execution Order:** P1 → P2 → P3 → P5 → P4 → P6

---

## CHUNK-P1: AI Crawler Configuration

### Domain: Technical SEO & AI Crawler Access

### Priority: CRITICAL (Must be done first)

### Files to Modify:
- `app/robots.js` (Lines 18-33)

### Current State:
The site blocks these AI crawlers:
```javascript
{
  userAgent: 'GPTBot',
  disallow: '/',
},
{
  userAgent: 'ChatGPT-User',
  disallow: '/',
},
{
  userAgent: 'Google-Extended',
  disallow: '/',
},
{
  userAgent: 'CCBot',
  disallow: '/',
},
```

### Atomic Actions:

#### Action 1.1: Remove AI Crawler Blocks
- **File:** `app/robots.js`
- **Lines:** 18-33
- **Change:** DELETE lines 18-33 entirely OR change to `allow: '/'`

#### Action 1.2: Add Explicit AI Crawler Allows
- **File:** `app/robots.js`
- **Location:** After existing rules, before the return statement
- **Add:**
```javascript
// AI Crawlers - Explicitly allowed for training/reference
{
  userAgent: 'GPTBot',
  allow: '/',
},
{
  userAgent: 'ChatGPT-User',
  allow: '/',
},
{
  userAgent: 'Google-Extended',
  allow: '/',
},
{
  userAgent: 'CCBot',
  allow: '/',
},
{
  userAgent: 'Claude-Web',
  allow: '/',
},
{
  userAgent: 'Claude-User',
  allow: '/',
},
{
  userAgent: 'Perplexity-Bot',
  allow: '/',
},
{
  userAgent: 'Bytespider',
  allow: '/',
},
{
  userAgent: 'Amazonbot',
  allow: '/',
},
```

### Testing:
```bash
# Local test
curl http://localhost:3000/robots.txt

# After deployment
curl https://hasanshiri.online/robots.txt
```

### Rollback:
```bash
git checkout HEAD -- app/robots.js
```

---

## CHUNK-P2: AI/LLM Optimization Files

### Domain: AI-Specific Standards (llms.txt, ai.txt)

### Priority: HIGH
### Dependencies: CHUNK-P1 (robots must allow AI crawlers)

### Files to Create:

#### 2.1: `/public/llms.txt` (Main AI crawler file - STATIC)

```markdown
# llms.txt for hasanshiri.online
# Protocol: https://llmstxt.org/
# Last Updated: 2026-02-21

## Site Identity
Title: Mohammad Hassan Shiri - Portfolio & Blog
Description: Data Scientist & Complex Systems Researcher at Sharif University of Technology
Author: Mohammad Hassan Shiri
Languages: en, fa
BaseURL: https://hasanshiri.online

## AI Crawler Policy
# This site WELCOMES AI crawlers for training with attribution
# Content License: CC BY-SA 4.0
# AI Training: Allowed with attribution to hasanshiri.online

## Content Structure
- Blog: https://hasanshiri.online/en/blog
- Portfolio: https://hasanshiri.online/en/projects
- About: https://hasanshiri.online/en
- Persian (RTL): https://hasanshiri.online/fa

## Dynamic Content (Always Current)
# For live skills, projects, and articles data:
- Full Context: https://hasanshiri.online/api/llms-full
- RSS Feed: https://hasanshiri.online/api/feed
- Sitemap: https://hasanshiri.online/sitemap.xml

## Entity Information
Person: Mohammad Hassan Shiri
Alternate Names: Hasan Shiri, Hassan Shiri, MHS, M. H. Shiri, محمد حسن شیری
Affiliation: Sharif University of Technology
Role: Physics Student & Data Scientist

## Expertise Domains
- Physics
- Data Science
- Machine Learning
- Complex Systems
- Python
- Data Analysis
- Computational Physics
- Econophysics
- Statistical Analysis

## Social Profiles
- GitHub: https://github.com/SireJeff
- LinkedIn: https://www.linkedin.com/in/mohammadhasanshiri
- Twitter: https://x.com/MHasanshiri
- YouTube: https://www.youtube.com/@sire_jeff
- Telegram: https://t.me/Mhasanshiri

## Contact
Email: sandmanshiri@gmail.com
Location: Tehran, Iran
```

#### 2.2: `/app/api/llms-full/route.js` (DYNAMIC - Always Current)

**Purpose:** Dynamic endpoint that always returns current skills, projects, and articles from the database.

```javascript
// app/api/llms-full/route.js
import { getSkillsGroupedByCategory } from '@/lib/actions/skills'
import { getAllProjectSlugs } from '@/lib/actions/projects'
import { getAllArticlesForSitemap } from '@/lib/actions/articles'
import { NAME_VARIANTS, ORGANIZATIONS, SOCIAL_PROFILES } from '@/lib/config/seo-config'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const isRtl = locale === 'fa'
  const baseUrl = 'https://hasanshiri.online'

  // Fetch all dynamic data in parallel
  const [skillsGrouped, projectSlugs, articles] = await Promise.all([
    getSkillsGroupedByCategory(),
    getAllProjectSlugs(),
    getAllArticlesForSitemap(),
  ])

  // Build skills section
  const skillsSection = skillsGrouped.map(group => {
    const categoryName = isRtl ? group.name_fa : group.name_en
    const skills = group.skills.map(skill => {
      const name = isRtl ? (skill.name_fa || skill.name_en) : skill.name_en
      const proficiency = skill.proficiency_level ? ` (${skill.proficiency_level}%)` : ''
      return `- ${name}${proficiency}`
    }).join('\n')

    return `### ${categoryName}\n${skills}`
  }).join('\n\n')

  // Build projects section
  const projectsSection = projectSlugs.length > 0
    ? `### Active Projects\n${projectSlugs.map(slug =>
        `- ${baseUrl}/${locale}/projects/${slug}`
      ).join('\n')}`
    : '### Active Projects\n(No projects yet)'

  // Build recent articles section
  const articlesSection = articles.length > 0
    ? `### Recent Articles\n${articles.slice(0, 10).map(article =>
        `- ${baseUrl}/${locale}/blog/${article.slug}`
      ).join('\n')}`
    : '### Recent Articles\n(No articles yet)'

  // Generate markdown content
  const content = `# llms-full.txt for hasanshiri.online
# Generated dynamically on ${new Date().toISOString()}
# This file is ALWAYS CURRENT - fetches live data from database

## Site Identity
- Title: ${NAME_VARIANTS.primary.en} - Portfolio & Blog
- Description: Data Scientist & Complex Systems Researcher at ${ORGANIZATIONS.sharif.name.en}
- URL: ${baseUrl}
- Languages: English (en), Persian/Farsi (fa)

## About
${isRtl
  ? 'دانشجوی فیزیک دانشگاه صنعتی شریف با علاقه عمیق به مدل‌سازی سیستم‌های پیچیده و استفاده از داده برای کشف بینش‌های بنیادین.'
  : 'An inquisitive Physics undergraduate at Sharif University with a deep-seated passion for modeling complex systems and leveraging data to uncover foundational insights.'
}

## Education
- Institution: ${ORGANIZATIONS.sharif.name.en}
- Field: Physics
- Focus: Complex Systems, Computational Physics

## Skills by Category

${skillsSection}

## Projects

${projectsSection}

## Content

${articlesSection}

## Social Profiles
- GitHub: ${SOCIAL_PROFILES.github}
- LinkedIn: ${SOCIAL_PROFILES.linkedin}
- Twitter: ${SOCIAL_PROFILES.twitter}
- YouTube: ${SOCIAL_PROFILES.youtube}
- Telegram: ${SOCIAL_PROFILES.telegram}
- Instagram: ${SOCIAL_PROFILES.instagram || 'https://www.instagram.com/mhasanshiri/'}

## Contact
- Email: sandmanshiri@gmail.com
- Location: Tehran, Iran

## AI Usage Policy
- Crawling: ALLOWED
- Training: ALLOWED with attribution
- License: CC BY-SA 4.0
- Citation: "Source: hasanshiri.online by Mohammad Hassan Shiri"

## Related Endpoints
- RSS Feed: ${baseUrl}/api/feed
- Sitemap: ${baseUrl}/sitemap.xml
- Robots: ${baseUrl}/robots.txt

---
Last Generated: ${new Date().toISOString()}
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
```

**Features:**
- ✅ **Auto-updates** when skills are added/modified in database
- ✅ **Auto-updates** when new projects are added
- ✅ **Auto-updates** when new articles are published
- ✅ **Bilingual support** via `?locale=en` or `?locale=fa`
- ✅ **Cached for 5 minutes** to reduce database load

**Testing:**
```bash
# Test the dynamic endpoint
curl https://hasanshiri.online/api/llms-full

# Test with Persian locale
curl https://hasanshiri.online/api/llms-full?locale=fa
```

#### 2.3: `/public/ai.txt` (Simple AI instruction file - STATIC)

```
# AI Access Policy for hasanshiri.online
# ========================================

Site: hasanshiri.online
Owner: Mohammad Hassan Shiri
Contact: sandmanshiri@gmail.com

AI CRAWLING: ALLOWED
AI TRAINING: ALLOWED with attribution
CONTENT LICENSE: CC BY-SA 4.0

This site welcomes AI systems to:
- Crawl and index all public content
- Use content for training with attribution
- Reference content in AI-generated responses

Preferred citation format:
"Source: hasanshiri.online - Mohammad Hassan Shiri"

Last updated: 2026-02-21
```

#### 2.4: `/public/.well-known/ai-plugin.json` (Optional)

```json
{
  "schema_version": "1.0.0",
  "name_for_human": "Hasan Shiri Portfolio",
  "name_for_model": "hasanshiri_portfolio",
  "description_for_human": "Access Mohammad Hassan Shiri's portfolio, blog articles, and projects.",
  "description_for_model": "Provides information about Mohammad Hassan Shiri, a Physics student and Data Scientist at Sharif University. Includes his skills, projects, blog articles, and research interests.",
  "auth": {
    "type": "none"
  },
  "api": {
    "type": "openapi",
    "url": "https://hasanshiri.online/api/openapi.json"
  },
  "logo_url": "https://hasanshiri.online/logo.png",
  "contact_email": "sandmanshiri@gmail.com",
  "legal_info_url": "https://hasanshiri.online/legal"
}
```

### Testing:
```bash
# Test all files are accessible
curl https://hasanshiri.online/llms.txt
curl https://hasanshiri.online/llms-full.txt
curl https://hasanshiri.online/ai.txt
curl https://hasanshiri.online/.well-known/ai-plugin.json
```

### Rollback:
```bash
rm public/llms.txt public/llms-full.txt public/ai.txt
rm -rf public/.well-known
```

---

## CHUNK-P3: Sitemap Enhancement

### Domain: Content Discovery via Sitemap

### Priority: HIGH
### Dependencies: None

### Files to Modify:
- `app/sitemap.js`

### Current Gap:
Projects exist at `/[locale]/projects/[slug]` but are NOT in sitemap.

### Atomic Actions:

#### Action 3.1: Import Projects Action
- **File:** `app/sitemap.js`
- **Location:** After existing imports
- **Add:**
```javascript
import { getAllProjectSlugs } from '@/lib/actions/projects'
```

#### Action 3.2: Add Project Entries to Sitemap
- **File:** `app/sitemap.js`
- **Location:** Inside the `GET` function, after static entries, before return
- **Add:**
```javascript
// Add project entries
const projectSlugs = await getAllProjectSlugs()
const projectEntries = i18nConfig.locales.flatMap((locale) =>
  projectSlugs.map((slug) => ({
    url: `${baseUrl}/${locale}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
    alternates: {
      languages: i18nConfig.locales.reduce((acc, loc) => {
        acc[loc] = `${baseUrl}/${loc}/projects/${slug}`
        return acc
      }, {}),
    },
  }))
)

// Add to entries array
entries.push(...projectEntries)
```

### Testing:
```bash
# Verify projects appear in sitemap
curl https://hasanshiri.online/sitemap.xml | grep -i projects

# Should show entries like:
# <loc>https://hasanshiri.online/en/projects/project-slug</loc>
```

### Rollback:
```bash
git checkout HEAD -- app/sitemap.js
```

---

## CHUNK-P4: JSON-LD Schema Enhancement

### Domain: Structured Data & AI Discoverability

### Priority: HIGH
### Dependencies: None

### Files to Modify:
- `components/seo/JsonLd.jsx` (Add new components)
- `app/[locale]/projects/[slug]/page.jsx` (Use ProjectJsonLd)
- `app/home-page.jsx` (Switch to PersonJsonLdDynamic)

### Atomic Actions:

#### Action 4.1: Add ProjectJsonLd Component
- **File:** `components/seo/JsonLd.jsx`
- **Location:** After line 208 (after FAQJsonLd)
- **Add:**
```jsx
// Project JSON-LD for SoftwareSourceCode schema
export function ProjectJsonLd({ project, locale = 'en' }) {
  const isRtl = locale === 'fa'
  const baseUrl = 'https://hasanshiri.online'
  const projectUrl = `${baseUrl}/${locale}/projects/${project.slug}`

  const title = isRtl
    ? (project.title_fa || project.title_en)
    : project.title_en
  const description = isRtl
    ? (project.description_fa || project.description_en)
    : project.description_en

  const keywords = [
    ...(project.tech_stack || []),
    ...(project.tags?.map(t => isRtl ? (t.name_fa || t.name_en) : t.name_en) || [])
  ]

  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: title,
    description: description,
    url: projectUrl,
    codeRepository: project.github_url,
    ...(project.demo_url && { screenshot: project.demo_url }),
    ...(project.github_language && { programmingLanguage: project.github_language }),
    ...(keywords.length > 0 && { keywords: keywords.join(', ') }),
    ...(project.created_at && { dateCreated: project.created_at }),
    ...(project.updated_at && { dateModified: project.updated_at }),
    author: {
      '@type': 'Person',
      name: 'Mohammad Hassan Shiri',
      url: baseUrl
    },
  }

  return <JsonLdScript data={data} />
}
```

#### Action 4.2: Add PersonJsonLdDynamic Component (Async)
- **File:** `components/seo/JsonLd.jsx`
- **Location:** After PersonJsonLd function
- **Add:**
```jsx
// Dynamic Person JSON-LD with database skills
export async function PersonJsonLdDynamic({ locale = 'en' }) {
  const isRtl = locale === 'fa'

  // Dynamic import to avoid issues
  const { getSkillsGroupedByCategory } = await import('@/lib/actions/skills')
  const skillsGrouped = await getSkillsGroupedByCategory()

  const skillNames = skillsGrouped.flatMap(group =>
    group.skills.map(skill => isRtl ? skill.name_fa : skill.name_en)
  )

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: NAME_VARIANTS.primary[locale],
    alternateName: getPersonSchemaAlternateNames(),
    url: 'https://hasanshiri.online',
    image: 'https://hasanshiri.online/your-photo.jpg',
    jobTitle: isRtl ? 'دانشجوی فیزیک و دانشمند داده' : 'Physics Student & Data Scientist',
    worksFor: {
      '@type': 'Organization',
      name: ORGANIZATIONS.sharif.name[locale],
      url: ORGANIZATIONS.sharif.url,
    },
    alumniOf: {
      '@type': 'Organization',
      name: ORGANIZATIONS.sharif.name.en,
      url: ORGANIZATIONS.sharif.url,
    },
    knowsAbout: skillNames,
    sameAs: getSameAsArray(),
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Bachelor Degree',
      recognizedBy: {
        '@type': 'Organization',
        name: ORGANIZATIONS.sharif.name[locale],
      },
      about: 'Physics',
    },
  }

  return <JsonLdScript data={data} />
}
```

#### Action 4.3: Add ProjectJsonLd to Project Detail Page
- **File:** `app/[locale]/projects/[slug]/page.jsx`
- **Location:** Line 5 (after imports)
- **Add import:**
```jsx
import { ProjectJsonLd } from '@/components/seo/JsonLd'
```
- **Location:** Line 97 (inside return, before div)
- **Add:**
```jsx
{/* JSON-LD Structured Data */}
<ProjectJsonLd project={project} locale={locale} />
```

#### Action 4.4: Update exports in components/seo/index.js
- **File:** `components/seo/index.js`
- **Add exports:**
```jsx
export { ProjectJsonLd, PersonJsonLdDynamic } from './JsonLd'
```

### Testing:
```bash
# Validate JSON-LD with Google Rich Results Test
# Visit: https://search.google.com/test/rich-results
# Enter project URL and verify SoftwareSourceCode schema appears

# Validate with Schema.org
# Visit: https://validator.schema.org/
```

### Rollback:
```bash
git checkout HEAD -- components/seo/JsonLd.jsx
git checkout HEAD -- app/[locale]/projects/[slug]/page.jsx
git checkout HEAD -- components/seo/index.js
```

---

## CHUNK-P5: RSS Feed & Social Enhancement

### Domain: Content Syndication & Social Signals

### Priority: MEDIUM
### Dependencies: None

### Files to Modify:
- `lib/config/seo-config.js` (Add Instagram)
- `app/api/feed/route.js` (Create new)

### Atomic Actions:

#### Action 5.1: Add Instagram to SOCIAL_PROFILES
- **File:** `lib/config/seo-config.js`
- **Location:** Line 69 (after Telegram)
- **Add:**
```javascript
{
  name: 'Instagram',
  handle: '@mhasanshiri',
  url: 'https://www.instagram.com/mhasanshiri/',
  icon: 'instagram',
},
```

#### Action 5.2: Create RSS Feed Endpoint
- **File:** `app/api/feed/route.js` (NEW FILE)
- **Content:**
```javascript
import { getArticles } from '@/lib/actions/articles'
import { NAME_VARIANTS } from '@/lib/config/seo-config'

const BASE_URL = 'https://hasanshiri.online'

export async function GET(request) {
  const { articles } = await getArticles({ limit: 50 })

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${NAME_VARIANTS.short.en} Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Articles about technology, data science, physics, and complex systems by Mohammad Hassan Shiri</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/api/feed" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${articles.map(article => `
    <item>
      <title>${escapeXml(article.title_en)}</title>
      <link>${BASE_URL}/en/blog/${article.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/en/blog/${article.slug}</guid>
      <description>${escapeXml(article.excerpt_en || '')}</description>
      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
      <author>sandmanshiri@gmail.com (${NAME_VARIANTS.primary.en})</author>
      ${article.category ? `<category>${article.category.name_en}</category>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function escapeXml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
```

#### Action 5.3: Add RSS Link to Layout
- **File:** `app/[locale]/layout.jsx`
- **Location:** Inside `<head>` or metadata
- **Add:**
```jsx
// In generateMetadata, add to return object:
links: {
  other: [
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'Hasan Shiri Blog RSS Feed',
      href: 'https://hasanshiri.online/api/feed',
    },
  ],
},
```

### Testing:
```bash
# Test RSS feed
curl https://hasanshiri.online/api/feed

# Validate RSS
# Visit: https://validator.w3.org/feed/
```

### Rollback:
```bash
git checkout HEAD -- lib/config/seo-config.js
rm -rf app/api/feed
git checkout HEAD -- app/[locale]/layout.jsx
```

---

## CHUNK-P6: Voice Search & Knowledge Graph

### Domain: Voice Assistant & Enhanced Knowledge Graph

### Priority: LOW
### Dependencies: CHUNK-P4 (needs skills structure)

### Files to Modify:
- `components/seo/JsonLd.jsx`

### Atomic Actions:

#### Action 6.1: Add SpeakableSpecification Schema
- **File:** `components/seo/JsonLd.jsx`
- **Add new component:**
```jsx
// SpeakableSpecification for voice search
export function SpeakableJsonLd({ locale = 'en' }) {
  const baseUrl = 'https://hasanshiri.online'

  const data = {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    cssSelector: [
      '#hero h1',
      '#hero p',
      '#about h2',
      '#about p',
      '#skills h2',
    ],
    xpath: [
      '/html/body/main/section[@id="hero"]/h1',
      '/html/body/main/section[@id="hero"]/p',
      '/html/body/main/section[@id="about"]/div/h2',
      '/html/body/main/section[@id="about"]/div/p',
    ],
  }

  return <JsonLdScript data={data} />
}
```

#### Action 6.2: Enhance PersonJsonLd with hasSkill Array
- **File:** `components/seo/JsonLd.jsx`
- **Location:** Inside PersonJsonLdDynamic, after knowsAbout
- **Add:**
```jsx
hasSkill: skillsGrouped.flatMap(group =>
  group.skills.slice(0, 10).map(skill => ({
    '@type': 'Skill',
    name: isRtl ? skill.name_fa : skill.name_en,
    ...(skill.proficiency_level && {
      proficiency: {
        '@type': 'QuantitativeValue',
        value: skill.proficiency_level,
        unitText: 'Percent',
      },
    }),
  }))
),
```

#### Action 6.3: Add HowTo Schema Component (Future Use)
- **File:** `components/seo/JsonLd.jsx`
- **Add:**
```jsx
// HowTo schema for tutorial content
export function HowToJsonLd({ howTo, locale = 'en' }) {
  const isRtl = locale === 'fa'

  if (!howTo?.steps?.length) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: isRtl ? (howTo.name_fa || howTo.name_en) : howTo.name_en,
    description: isRtl ? (howTo.description_fa || howTo.description_en) : howTo.description_en,
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: isRtl ? (step.name_fa || step.name_en) : step.name_en,
      text: isRtl ? (step.text_fa || step.text_en) : step.text_en,
    })),
  }

  return <JsonLdScript data={data} />
}
```

### Testing:
- Use Google Assistant or Alexa to query site information
- Validate with Schema.org validator

### Rollback:
```bash
git checkout HEAD -- components/seo/JsonLd.jsx
```

---

## Testing Strategy

### Per-Chunk Testing:

| Chunk | Test Method | Command/Tool |
|-------|-------------|--------------|
| P1 | curl robots.txt | `curl https://hasanshiri.online/robots.txt` |
| P2 | curl AI files | `curl https://hasanshiri.online/llms.txt` |
| P3 | Check sitemap | `curl https://hasanshiri.online/sitemap.xml \| grep projects` |
| P4 | Rich Results Test | https://search.google.com/test/rich-results |
| P5 | RSS Validator | https://validator.w3.org/feed/ |
| P6 | Schema Validator | https://validator.schema.org/ |

### Full Integration Testing:

```bash
# 1. Build and verify no errors
npm run build

# 2. Run existing tests
npm test

# 3. Check linting
npm run lint

# 4. Start dev server and manually test
npm run dev
```

### E2E Testing:
```bash
# Run E2E tests
npm run test:e2e
```

---

## Rollback Strategy

### Full Rollback:
```bash
# Restore all modified files
git checkout HEAD -- app/robots.js
git checkout HEAD -- app/sitemap.js
git checkout HEAD -- components/seo/JsonLd.jsx
git checkout HEAD -- components/seo/index.js
git checkout HEAD -- app/[locale]/projects/[slug]/page.jsx
git checkout HEAD -- app/[locale]/layout.jsx
git checkout HEAD -- lib/config/seo-config.js

# Remove created files
rm -f public/llms.txt public/llms-full.txt public/ai.txt
rm -rf public/.well-known
rm -rf app/api/feed
```

### Per-Chunk Rollback:
See individual chunk sections for specific rollback commands.

---

## Commit Strategy

### Recommended Commit Order:

```bash
# Commit 1: AI Crawler Access (Critical)
git add app/robots.js
git commit -m "feat(seo): allow AI crawlers for training/reference

- Remove GPTBot, ChatGPT-User, Google-Extended, CCBot blocks
- Add explicit allow rules for Claude-Web, Perplexity-Bot, etc.
- Enables AI chatbots to reference site content

Refs: CHUNK-P1"

# Commit 2: AI Optimization Files
git add public/llms.txt public/llms-full.txt public/ai.txt public/.well-known/
git commit -m "feat(seo): add llms.txt and AI optimization files

- Add llms.txt with site identity and expertise
- Add llms-full.txt with extended content
- Add ai.txt with simple AI policy
- Add .well-known/ai-plugin.json for AI integration

Refs: CHUNK-P2"

# Commit 3: Sitemap Enhancement
git add app/sitemap.js
git commit -m "feat(seo): add project pages to sitemap

- Include all active projects in sitemap
- Add hreflang alternates for project URLs

Refs: CHUNK-P3"

# Commit 4: JSON-LD Schemas
git add components/seo/JsonLd.jsx components/seo/index.js app/[locale]/projects/[slug]/page.jsx
git commit -m "feat(seo): add SoftwareSourceCode and dynamic Person schemas

- Add ProjectJsonLd for SoftwareSourceCode schema
- Add PersonJsonLdDynamic with database skills
- Add EducationalOccupationalCredential
- Enable JSON-LD on project detail pages

Refs: CHUNK-P4"

# Commit 5: RSS Feed & Social
git add lib/config/seo-config.js app/api/feed/ app/[locale]/layout.jsx
git commit -m "feat(seo): add RSS feed and Instagram social profile

- Create /api/feed RSS endpoint
- Add Instagram to social profiles
- Add RSS autodiscovery link

Refs: CHUNK-P5"

# Commit 6: Voice Search & Knowledge Graph
git add components/seo/JsonLd.jsx
git commit -m "feat(seo): add voice search and enhanced knowledge graph

- Add SpeakableSpecification for voice assistants
- Add hasSkill array with proficiency levels
- Add HowTo schema for tutorial content

Refs: CHUNK-P6"
```

---

## Inter-Phase Contract

```
EXPECTED_CONSUMER: rpi-implement
CHUNK_PROCESSING_ORDER: P1 → P2 → P3 → P5 → P4 → P6
MARK_AS_IMPLEMENTED_WHEN: all chunk todos complete and tests pass
UPDATE_RESEARCH_STATUS: true
COMMIT_PER_CHUNK: recommended
```

---

## Success Metrics

### After Implementation:

| Metric | Before | Target | How to Verify |
|--------|--------|--------|---------------|
| AI Crawler Access | Blocked | Allowed | robots.txt |
| llms.txt | Missing | Present | curl llms.txt |
| Projects in Sitemap | 0 | All | sitemap.xml |
| Project JSON-LD | Missing | SoftwareSourceCode | Schema validator |
| Person.knowsAbout | 6 hardcoded | Dynamic from DB | View source |
| RSS Feed | Missing | Present | /api/feed |
| Voice Search | None | SpeakableSpec | Schema validator |
| SEO Score | 75/100 | 95/100 | Lighthouse |
| AI Optimization | 4.1/10 | 9/10 | Manual review |

---

## File Changes Summary

### Files to Modify:
1. `app/robots.js` - Remove AI blocks
2. `app/sitemap.js` - Add projects
3. `components/seo/JsonLd.jsx` - Add new schemas
4. `components/seo/index.js` - Export new components
5. `app/[locale]/projects/[slug]/page.jsx` - Add ProjectJsonLd
6. `app/[locale]/layout.jsx` - Add RSS link
7. `lib/config/seo-config.js` - Add Instagram

### Files to Create:
1. `public/llms.txt`
2. `public/llms-full.txt`
3. `public/ai.txt`
4. `public/.well-known/ai-plugin.json`
5. `app/api/feed/route.js`

---

**Plan Complete**
**Ready for Implementation**
**Run:** `/rpi-implement seo-enhancement`
