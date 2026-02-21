# SEO Enhancement Research Report

**Feature:** AI & Search Engine Optimization Enhancement
**Date:** 2026-02-21
**Objective:** Enhance SEO so anyone searching for name/skills/projects/articles finds the site, and AI chatbots reference it

---

## Executive Summary

**Current SEO Score:** 75/100
**AI/LLM Optimization Score:** 4.1/10 (CRITICAL GAPS)

### Critical Finding
The site **ACTIVELY BLOCKS** all major AI crawlers (GPTBot, ChatGPT-User, Google-Extended, CCBot) in `app/robots.js` lines 18-33. This is the OPPOSITE of the goal to have AIs reference the site.

### Key Gaps Identified
1. AI crawlers blocked in robots.txt
2. Missing `llms.txt` (new AI standard)
3. No RSS feed for content syndication
4. Projects missing from sitemap
5. Skills/projects have no structured data
6. `knowsAbout` in Person schema is hardcoded (not dynamic)

---

## Chunk Manifest

| Chunk ID | Domain | Status | Files Analyzed | Ready for Planning |
|----------|--------|--------|----------------|-------------------|
| CHUNK-R1 | Technical SEO & AI Crawlers | PLANNED | 5 | ✅ → CHUNK-P1 |
| CHUNK-R2 | Structured Data & JSON-LD | PLANNED | 4 | ✅ → CHUNK-P4 |
| CHUNK-R3 | Content & Skills Discoverability | PLANNED | 6 | ✅ → CHUNK-P3 |
| CHUNK-R4 | AI/LLM Optimization | PLANNED | 5 | ✅ → CHUNK-P2 |
| CHUNK-R5 | External Signals & Authority | PLANNED | 7 | ✅ → CHUNK-P5, P6 |

**Plan Document:** `.ai-context/plans/active/seo-enhancement_plan.md`
**Plan Date:** 2026-02-21

---

## CHUNK-R1: Technical SEO & AI Crawler Configuration

### Current AI Crawler Access Status

**File:** `app/robots.js` (Lines 18-33)

| User Agent | Status | Purpose |
|------------|--------|---------|
| GPTBot | BLOCKED | OpenAI ChatGPT training |
| ChatGPT-User | BLOCKED | OpenAI browser crawler |
| Google-Extended | BLOCKED | Google AI training |
| CCBot | BLOCKED | Common Crawl (AI training) |

**Other AI crawlers NOT blocked:**
- Claude-Web (Anthropic)
- Perplexity-Bot
- Bytespider

### Recommended Changes to robots.js

```javascript
// REMOVE lines 18-33 (AI crawler blocks)
// OR change to allow:

// Option 1: Remove entirely (RECOMMENDED)
// Delete lines 18-33

// Option 2: Explicitly allow
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
  userAgent: 'Perplexity-Bot',
  allow: '/',
},
```

### Sitemap Gaps

**File:** `app/sitemap.js` (Lines 1-50)

**Missing:**
- Project detail pages (`/[locale]/projects/[slug]`)
- Category pages
- Tag pages

**Fix:** Add project entries after line 43:
```javascript
const projectEntries = i18nConfig.locales.flatMap((locale) =>
  projects.map((project) => ({
    url: `${baseUrl}/${locale}/projects/${project.slug}`,
    lastModified: project.updated_at,
    changeFrequency: 'monthly',
    priority: 0.7,
    alternates: {
      languages: i18nConfig.locales.reduce((acc, loc) => {
        acc[loc] = `${baseUrl}/${loc}/projects/${project.slug}`
        return acc
      }, {}),
    },
  }))
)
```

### Recommended llms.txt Structure

**Location:** `/public/llms.txt`

```markdown
# llms.txt for hasanshiri.online
# Protocol: https://llmstxt.org/

## Site Identity
Title: Mohammad Hassan Shiri - Portfolio & Blog
Description: Data Scientist & Complex Systems Researcher at Sharif University
Author: Mohammad Hassan Shiri
Languages: en, fa
BaseURL: https://hasanshiri.online

## AI Crawler Policy
# This site welcomes AI crawlers for training with attribution

## Content Structure
- Blog: https://hasanshiri.online/en/blog
- Portfolio: https://hasanshiri.online/en/projects
- About: https://hasanshiri.online/en

## Expertise Domains
Physics, Data Science, Machine Learning, Complex Systems, Python, Data Analysis

## Entity Information
Person: Mohammad Hassan Shiri
Alternate Names: Hasan Shiri, Hassan Shiri, MHS, M. H. Shiri
Affiliation: Sharif University of Technology
Social: github.com/SireJeff, linkedin.com/in/mohammadhasanshiri

## Content License
License: CC BY-SA 4.0
AI Training: Allowed with attribution
```

---

## CHUNK-R2: Structured Data & JSON-LD

### Currently Implemented Schemas

| Schema Type | Component | Location | Status |
|-------------|-----------|----------|--------|
| BlogPosting | `ArticleJsonLd` | JsonLd.jsx:22-79 | ✅ Complete |
| Person | `PersonJsonLd` | JsonLd.jsx:82-115 | ⚠️ Static knowsAbout |
| Organization | `OrganizationJsonLd` | JsonLd.jsx:118-129 | ✅ Complete |
| WebSite | `WebSiteJsonLd` | JsonLd.jsx:132-159 | ✅ Complete |
| Blog | `BlogJsonLd` | JsonLd.jsx:162-187 | ✅ Complete |
| FAQPage | `FAQJsonLd` | JsonLd.jsx:190-208 | ⚠️ Not used |
| BreadcrumbList | `Breadcrumbs.jsx` | components/seo/ | ✅ Complete |

### Missing Schemas for AI Discoverability

| Schema | Priority | Purpose |
|--------|----------|---------|
| SoftwareSourceCode | HIGH | Project code discoverability |
| Skill | HIGH | Skills expertise indexing |
| SpeakableSpecification | MEDIUM | Voice search optimization |
| EducationalOccupationalCredential | MEDIUM | Academic credentials |
| HowTo | LOW | Tutorial content markup |

### knowsAbout Analysis

**File:** `components/seo/JsonLd.jsx` (Lines 103-110)

**Current (HARDCODED):**
```javascript
knowsAbout: [
  'Physics',
  'Data Science',
  'Machine Learning',
  'Complex Systems',
  'Python',
  'Data Analysis',
],
```

**Issues:**
1. Not pulling from database skills table
2. No Persian equivalents
3. Missing many skills from database
4. No project tech stacks included

**Fix:** Make dynamic from skills database:
```javascript
// Fetch from lib/actions/skills.js
const skills = await getSkillsGroupedByCategory()
const knowsAbout = skills.flatMap(group =>
  group.skills.map(skill => [skill.name_en, skill.name_fa])
).flat()
```

---

## CHUNK-R3: Content & Skills Discoverability

### Skills Presentation Analysis

**File:** `components/SkillsSection.jsx` (Lines 72-137)

**Issues:**
- No JSON-LD structured data for skills
- Generic `<div>` markup instead of semantic elements
- Proficiency bars are visual-only
- No linking to projects that use each skill

**Database Schema:** `supabase/schema-portfolio-cms.sql` (Lines 10-91)
- Rich data available: `name_en`, `name_fa`, `proficiency_level`, `years_of_experience`
- Not exposed to search engines!

### Projects Presentation Analysis

**File:** `components/ProjectsSection.jsx` (Lines 61-212)

**Issues:**
- No `SoftwareSourceCode` or `CreativeWork` schema
- Tech stack displayed visually but not indexed
- No linking to related skills

**Project Detail Page:** `app/[locale]/projects/[slug]/page.jsx`
- Has metadata generation (Lines 12-61)
- NO JSON-LD schema for projects
- `tech_stack` array not in structured data

### Skills Currently in Database

**Data Science:**
- Python (95%), pandas (60%), NumPy (60%), Matplotlib (60%), Scikit-learn (60%), Power BI (70%), Advanced Excel (85%)

**Programming:**
- C/C++ (65%), Java (80%), FastAPI (75%), Django (40%), Web Scraping (80%)

**Tools:**
- Git/GitHub (90%), Docker (65%), Postman (80%), Linux/Bash (55%)

**Research:**
- Complex Systems Modeling (60%), Econophysics (55%), Machine Learning (70%), Business Process Modeling (85%), Market Research (85%)

**Languages:**
- Persian (100%), English (100%), French (85%), Spanish (75%), Russian (40%)

### Content Gaps - Skills Not Explicitly Tracked

1. Telegram Bot Development
2. Computational Physics
3. API Development
4. Data Visualization
5. Scientific Computing
6. Web Development (React, Tailwind)
7. Containerization (Docker in projects)
8. VPN/Networking

---

## CHUNK-R4: AI/LLM-Specific Optimization

### AI-Specific Files Status

| File | Status | Location |
|------|--------|----------|
| llms.txt | MISSING | /public/llms.txt |
| llms-full.txt | MISSING | /public/llms-full.txt |
| ai.txt | MISSING | /public/ai.txt |
| .well-known/ai-plugin.json | MISSING | /public/.well-known/ |

### AI Crawler Blocking (CRITICAL)

**File:** `app/robots.js` (Lines 18-33)

The site explicitly blocks:
- GPTBot (OpenAI)
- ChatGPT-User (OpenAI)
- Google-Extended (Google AI)
- CCBot (Common Crawl)

**This is the OPPOSITE of the user's goal!**

### Voice Search Optimization

**Status:** NOT IMPLEMENTED

**Missing:**
- `SpeakableSpecification` schema
- FAQ sections with question-based headings
- Natural language Q&A structure

### Knowledge Graph Gaps

**Missing Entity Connections:**
1. No `colleague` connections
2. No `award` or `honor` achievements
3. No `project` relationships with entities
4. No `publication` references
5. No skill proficiency levels (QuantitativeValue)

### Recommended Knowledge Graph Enhancement

```javascript
// Add to PersonJsonLd
hasCredential: {
  '@type': 'EducationalOccupationalCredential',
  credentialCategory: 'Bachelor Degree',
  recognizedBy: {
    '@type': 'Organization',
    name: 'Sharif University of Technology',
  },
  about: 'Physics',
},

hasSkill: [
  {
    '@type': 'Skill',
    name: 'Python',
    proficiency: {
      '@type': 'QuantitativeValue',
      value: '95',
      unitText: 'Percent',
    },
  },
  // ... more skills
],
```

---

## CHUNK-R5: External Signals & Authority

### Social Profiles Implementation

**File:** `lib/config/seo-config.js` (Lines 60-69)

**Configured:**
- GitHub: `https://github.com/SireJeff`
- LinkedIn: `https://www.linkedin.com/in/mohammadhasanshiri`
- Twitter: `https://x.com/MHasanshiri`
- YouTube: `https://www.youtube.com/@sire_jeff`
- Telegram: `https://t.me/Mhasanshiri`

**Missing:**
- Instagram: `https://www.instagram.com/mhasanshiri/` (used in contact but not in config)

### RSS Feed Status

**Status:** NOT IMPLEMENTED

No RSS/Atom feed exists. This is a major content distribution gap.

### sameAs Schema

**Status:** Properly implemented
- Used in PersonJsonLd and OrganizationJsonLd
- Automatically pulls from SOCIAL_PROFILES config

### Canonical URLs

**Status:** EXCELLENT
- Proper canonical URLs on all pages
- hreflang alternates implemented
- x-default set correctly

### API Discoverability

**Current APIs:**
- All protected with auth tokens
- No public content API
- AI crawlers blocked from HTML content too

---

## Inter-Phase Contract

```
EXPECTED_CONSUMER: rpi-plan
CHUNK_PROCESSING_ORDER: sequential (R1 → R2 → R3 → R4 → R5)
MARK_AS_PLANNED_WHEN: chunk todolist created
REQUIRED_OUTPUT: CHUNK-Pn per CHUNK-Rn
```

---

## Prioritized Action Items

### HIGH PRIORITY (Immediate)

1. **Remove AI crawler blocks** - `app/robots.js` lines 18-33
   - Impact: Enables AI training access
   - Effort: 5 minutes

2. **Create llms.txt** - `/public/llms.txt`
   - Impact: AI discoverability via new standard
   - Effort: 30 minutes

3. **Add projects to sitemap** - `app/sitemap.js`
   - Impact: Project discoverability
   - Effort: 15 minutes

4. **Add SoftwareSourceCode schema for projects** - `components/seo/JsonLd.jsx`
   - Impact: Code discoverability
   - Effort: 1 hour

### MEDIUM PRIORITY (This Week)

5. **Make knowsAbout dynamic** - Pull from skills database
   - Impact: Complete skill indexing
   - Effort: 2 hours

6. **Add Skill schema** - New component for skills
   - Impact: Skill discoverability
   - Effort: 1 hour

7. **Implement RSS feed** - `/api/feed` or `/rss.xml`
   - Impact: Content syndication
   - Effort: 2 hours

8. **Add Instagram to social config** - `lib/config/seo-config.js`
   - Impact: Complete social signals
   - Effort: 5 minutes

### LOW PRIORITY (Future)

9. **Add SpeakableSpecification** - Voice search
   - Impact: Voice assistant discoverability
   - Effort: 2 hours

10. **Create public content API** - `/api/articles`
    - Impact: AI structured access
    - Effort: 4 hours

11. **Add HowTo schema** - Tutorial content
    - Impact: Tutorial discoverability
    - Effort: 2 hours

---

## File References Summary

| File | Key Lines | Purpose |
|------|-----------|---------|
| `app/robots.js` | 18-33 | AI crawler blocking |
| `app/sitemap.js` | 1-50 | Sitemap generation |
| `components/seo/JsonLd.jsx` | 1-209 | All JSON-LD schemas |
| `lib/config/seo-config.js` | 1-151 | SEO configuration |
| `app/[locale]/layout.jsx` | 1-146 | Locale metadata |
| `components/SkillsSection.jsx` | 1-139 | Skills presentation |
| `components/ProjectsSection.jsx` | 1-214 | Projects presentation |
| `app/[locale]/projects/[slug]/page.jsx` | 1-259 | Project detail page |
| `lib/actions/skills.js` | 452-530 | Skills data |
| `lib/actions/projects.js` | 548-722 | Projects data |

---

## Expected Implementation Sequence for RPI-Plan

1. **CHUNK-P1:** Fix robots.js AI crawler access
2. **CHUNK-P2:** Create llms.txt file
3. **CHUNK-P3:** Update sitemap with projects
4. **CHUNK-P4:** Add ProjectJsonLd schema component
5. **CHUNK-P5:** Make PersonJsonLd.knowsAbout dynamic
6. **CHUNK-P6:** Add SkillsJsonLd schema component
7. **CHUNK-P7:** Implement RSS feed
8. **CHUNK-P8:** Add Instagram to social profiles

---

**Research Complete**
**Next Step:** Run `/rpi-plan seo-enhancement` to generate implementation plan
