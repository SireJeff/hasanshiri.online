# SEO Analysis and Recommendations

**Date**: 2026-02-09
**Website**: https://hasanshiri.online
**Analysis Scope**: Technical SEO, Meta Tags, Structured Data, Performance

---

## Executive Summary

Your portfolio website has a **solid SEO foundation** with:
- ✅ Comprehensive bilingual metadata (English/Persian)
- ✅ Proper hreflang implementation
- ✅ Dynamic sitemap generation
- ✅ Rich structured data (JSON-LD)
- ✅ Good robots.txt configuration

**Overall SEO Score**: 75/100

**Priority Actions**:
1. Fix image alt text accessibility (5 min)
2. Add default OG images (10 min)
3. Optimize Core Web Vitals (30 min)
4. Add missing meta descriptions (15 min)

---

## 1. Critical Issues (Fix Immediately)

### 1.1 ProjectsSection Alt Text Missing RTL Support

**File**: `components/ProjectsSection.jsx:79`

**Issue**: Project images only use English title for alt text, ignoring Persian locale.

```jsx
// BEFORE
<img
  src={project.featured_image || '/placeholder-project.jpg'}
  alt={project.title_en}  // ❌ Always English
  className="..."
/>

// AFTER
<img
  src={project.featured_image || '/placeholder-project.jpg'}
  alt={project[`title_${locale}`] || project.title_en}  // ✅ Locale-aware
  className="..."
/>
```

**Impact**: Medium - Accessibility and SEO for Persian searches

---

### 1.2 Root Layout Missing Persian Description

**File**: `app/layout.jsx:14-15`

**Issue**: Root metadata only includes English description.

```javascript
// CURRENT
export const metadata = {
  description: 'Mohammad Hassan Shiri (MHS) - Physics Student...',  // English only
}

// RECOMMENDED: This is actually OK since locale layout overrides it
// But consider adding Persian as fallback
```

**Note**: The locale layout (`app/[locale]/layout.jsx`) correctly provides bilingual descriptions, so this is less critical. The root layout acts as a fallback.

---

### 1.3 Missing Default OG Images

**File**: `app/[locale]/layout.jsx`

**Issue**: No default Open Graph image configured. If pages don't have images, social shares will look broken.

```javascript
// ADD to openGraph object in generateMetadata():
openGraph: {
  type: 'website',
  locale: isRtl ? 'fa_IR' : 'en_US',
  alternateLocale: isRtl ? 'en_US' : 'fa_IR',
  url: `${baseUrl}/${locale}`,
  siteName: isRtl ? 'محمد حسن شیری' : 'Mohammad Hassan Shiri',
  title: titles[locale],
  description: descriptions[locale],
  images: [  // ✅ ADD THIS
    {
      url: '/og-image-default.png',  // Create this 1200x630 image
      width: 1200,
      height: 630,
      alt: titles[locale],
    }
  ],
}
```

**Action Required**:
1. Create a default OG image: `/public/og-image-default.png` (1200x630px)
2. Update `app/[locale]/layout.jsx` with images array
3. Update `app/layout.jsx` with default images array

---

## 2. Medium Priority Improvements

### 2.1 Core Web Vitals Optimization

**Issue**: No explicit LCP (Largest Contentful Paint) optimization beyond basic `priority` prop.

**Recommendations**:

```jsx
// home-page.jsx - Add fetchPriority to profile image
<img
  src="/your-photo.jpg"
  alt={isRtl ? 'محمد حسن شیری' : 'Mohammad Hassan Shiri'}
  className="..."
  priority  // ✅ Already present
  fetchPriority="high"  // ✅ ADD THIS
/>

// Add explicit width/height to prevent layout shift
<Image
  src="/your-photo.jpg"
  alt={isRtl ? 'محمد حسن شیری' : 'Mohammad Hassan Shiri'}
  width={400}
  height={400}
  priority
  fetchPriority="high"
/>
```

---

### 2.2 Add Schema.org Person JSON-LD to Root Layout

**File**: `app/layout.jsx`

**Current**: Person JSON-LD only on locale-specific pages

**Recommendation**: Add to root layout for better coverage

```jsx
import { PersonJsonLd } from '@/components/seo'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Existing head content */}
      </head>
      <body>
        <PersonJsonLd
          name="Mohammad Hassan Shiri"
          alternateName="محمد حسن شیری"
          url="https://hasanshiri.online"
          sameAs={[
            "https://github.com/hasanshirionline",
            "https://linkedin.com/in/hasanshirionline"
          ]}
          knowsAbout={[
            "Data Science",
            "Machine Learning",
            "Physics",
            "Complex Systems"
          ]}
        />
        {/* Rest of body */}
      </body>
    </html>
  )
}
```

---

### 2.3 Add Article Modified Time

**File**: `app/[locale]/blog/[slug]/page.jsx`

**Current**: Uses `updated_at` if available

**Recommendation**: Ensure all articles have proper modified time for freshness signals

```javascript
// Add to article metadata:
const modifiedTime = article.updated_at || article.published_at
```

---

### 2.4 Optimize Meta Description Lengths

**Issue**: Some descriptions may be too long (>160 chars) or too short (<50 chars)

**Guidelines**:
- **Optimal**: 120-158 characters
- **Minimum**: 50 characters
- **Maximum**: 160 characters (truncated in SERPs)

**Current descriptions**:
- English: 148 characters ✅ Good
- Persian: 142 characters ✅ Good

---

## 3. Low Priority Enhancements

### 3.1 Add FAQ Schema

If you have FAQ section, add FAQPage schema:

```jsx
<FAQJsonLd
  questions={[
    {
      question: "What is your background?",
      answer: "I am a Physics Student at Sharif University..."
    }
  ]}
/>
```

---

### 3.2 Add BreadcrumbList JSON-LD

**File**: `components/seo/Breadcrumbs.jsx` already has this ✅

---

### 3.3 Add Article Reading Time

**File**: `app/[locale]/blog/[slug]/page.jsx`

```javascript
// Calculate reading time
const words = content_en.split(' ').length
const readingTime = Math.ceil(words / 200) // 200 words per minute

// Add to metadata:
metadata: {
  ...otherMetadata,
  'article:reading_time': `${readingTime} min read`,
}
```

---

### 3.4 Add Author Profile URL

```javascript
// Add to article metadata:
authors: [{
  name: 'Mohammad Hassan Shiri',
  url: 'https://hasanshiri.online/about'
}]
```

---

## 4. Technical SEO Audit

### 4.1 Sitemap Analysis

**File**: `app/sitemap.js`

✅ **Good**:
- Dynamic generation
- Includes alternates for hreflang
- Proper priorities and change frequencies

**Recommendation**: Add projects and skills to sitemap

```javascript
// ADD to sitemap.js:
async function getProjectsEntries() {
  const { getProjects } = await import('@/lib/actions/projects')
  const projects = await getProjects({ status: 'active' })

  return projects.flatMap((project) => [
    {
      url: `https://hasanshiri.online/en/projects/${project.slug}`,
      lastModified: project.updated_at,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `https://hasanshiri.online/en/projects/${project.slug}`,
          fa: `https://hasanshiri.online/fa/projects/${project.slug}`,
          'x-default': `https://hasanshiri.online/en/projects/${project.slug}`,
        }
      }
    },
    // Persian version
    {
      url: `https://hasanshiri.online/fa/projects/${project.slug}`,
      lastModified: project.updated_at,
      changeFrequency: 'monthly',
      priority: 0.7,
    }
  ])
}
```

---

### 4.2 Robots.txt Analysis

**File**: `app/robots.js`

✅ **Good**:
- Blocks admin, auth, API routes
- Blocks AI crawlers (GPTBot, ChatGPT-User, Google-Extended, CCBot)
- Sitemap reference included

**No changes needed**

---

### 4.3 Canonical URLs

✅ **Good**: All pages have proper canonical URLs

```javascript
alternates: {
  canonical: `${baseUrl}/${locale}`,  // ✅ Correct
}
```

---

### 4.4 Hreflang Implementation

✅ **Good**: Proper hreflang with x-default

```javascript
languages: {
  en: 'https://hasanshiri.online/en',
  fa: 'https://hasanshiri.online/fa',
  'x-default': 'https://hasanshiri.online/en',
}
```

---

## 5. Structured Data Audit

### Implemented Schemas ✅

| Schema | Location | Status |
|--------|----------|--------|
| Person | components/seo/JsonLd.jsx | ✅ Complete |
| Organization | components/seo/JsonLd.jsx | ✅ Complete |
| WebSite | components/seo/JsonLd.jsx | ✅ Complete |
| BlogPosting | components/seo/JsonLd.jsx | ✅ Complete |
| Blog | components/seo/JsonLd.jsx | ✅ Complete |
| BreadcrumbList | components/seo/Breadcrumbs.jsx | ✅ Complete |
| FAQPage | components/seo/JsonLd.jsx | ⚠️ Not used |

---

## 6. Performance-Related SEO

### Current Performance Config

**File**: `next.config.js`

✅ **Good**:
- Image optimization enabled
- Compression enabled
- Security headers configured

**Recommendations**:

```javascript
// ADD to next.config.js:
const nextConfig = {
  // ... existing config

  // Optimize images for better LCP
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],  // ✅ ADD modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimize font loading
  optimizeFonts: true,  // ✅ ADD
}
```

---

## 7. Missing SEO Elements

### 7.1 Favicon

✅ **Status**: Present - `app/favicon.ico`

### 7.2 Apple Touch Icon

✅ **Status**: Present - `/icons/icon-152x152.png`

### 7.3 Theme Color

✅ **Status**: Present - Configured in viewport

### 7.4 Schema Validation

**Action Required**: Test your JSON-LD at [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## 8. Mobile SEO

### Viewport Configuration

✅ **Good**: Proper viewport meta tag

```javascript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}
```

---

## 9. International SEO

### Language Tags

✅ **Good**: Proper lang attribute

```jsx
<html lang="en">  // or "fa" for Persian
```

### RTL Support

✅ **Good**: Proper dir attribute

```jsx
<div lang={locale} dir={direction}>
```

---

## 10. Action Checklist

### Immediate (Today)

- [ ] Fix ProjectsSection alt text for RTL support
- [ ] Create default OG image (1200x630px)
- [ ] Add default OG images to layouts
- [ ] Test JSON-LD in Google Rich Results Test

### Short Term (This Week)

- [ ] Add fetchPriority to LCP images
- [ ] Add projects to sitemap
- [ ] Add Person JSON-LD to root layout
- [ ] Optimize image formats (AVIF/WebP)
- [ ] Run Lighthouse audit

### Long Term (This Month)

- [ ] Implement reading time for articles
- [ ] Add FAQ schema if FAQ section exists
- [ ] Monitor Core Web Vitals in Search Console
- [ ] A/B test meta descriptions
- [ ] Add structured data for skills/projects

---

## 11. Monitoring & Tools

### Required Tools Setup

- [ ] **Google Search Console**: Verify ownership
- [ ] **Google Analytics**: Already integrated (Vercel Analytics)
- [ ] **Bing Webmaster Tools**: Submit sitemap
- [ ] **Lighthouse CI**: Set up performance monitoring

### Key Metrics to Track

1. **Core Web Vitals**:
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

2. **Search Performance**:
   - Click-through rate (CTR)
   - Average position
   - Impressions
   - Top queries

3. **Indexing Status**:
   - Pages indexed vs submitted
   - Coverage errors
   - Blocked resources

---

## 12. Content SEO Recommendations

### Blog Optimization

1. **Title Tags**:
   - Use power words (Ultimate, Complete, Guide)
   - Include numbers where appropriate
   - Keep under 60 characters

2. **Meta Descriptions**:
   - Include call-to-action
   - Use target keywords naturally
   - Keep between 120-158 characters

3. **Heading Structure**:
   - H1: One per page, includes main keyword
   - H2: Section breaks, related keywords
   - H3: Subsections, long-tail keywords

4. **Internal Linking**:
   - Link to related articles
   - Link to projects/skills mentioned
   - Use descriptive anchor text

### Portfolio Pages

1. **Project Pages**:
   - Add meta titles/descriptions from database
   - Include tech stack in keywords
   - Add case study schema

2. **Skills Section**:
   - Add skill-level schema
   - Link to relevant projects
   - Include certification info

---

## 13. Link Building Opportunities

### Internal Linking Structure

```
Home
├── About
├── Skills → Link to relevant projects
├── Projects → Link to skills used
├── Blog → Link to skills/projects mentioned
└── Contact
```

### External Link Ideas

- Guest posts on tech blogs
- Open source contributions (GitHub links)
- Conference presentations
- Academic publications
- Stack Overflow activity

---

## 14. Common SEO Pitfalls to Avoid

❌ **Don't**:
- Block CSS/JS in robots.txt
- Use hash-only URLs (#)
- Have orphan pages (no internal links)
- Duplicate content across locales
- Ignore mobile usability
- Slow page speed (>3s LCP)

✅ **Do**:
- Use semantic HTML
- Implement proper redirects
- Monitor 404 errors
- Regular content updates
- Optimize images before upload
- Use descriptive URLs

---

## 15. SEO Testing Checklist

### On-Page SEO Tests

- [ ] All pages have unique titles
- [ ] All pages have unique meta descriptions
- [ ] All images have alt text
- [ ] H1 tags are unique per page
- [ ] Internal links use descriptive anchor text
- [ ] URLs are clean and descriptive
- [ ] Canonical tags point to correct version
- [ ] Hreflang tags point to correct locales
- [ ] Structured data validates without errors
- [ ] Mobile-friendly test passes

### Technical SEO Tests

- [ ] Sitemap.xml is accessible
- [ ] Robots.txt is accessible
- [ ] No crawl errors in Search Console
- [ ] Page speed score >90 on mobile
- [ ] No mixed content warnings
- [ ] SSL certificate valid
- [ ] No broken links (404s)
- [ ] Redirect chains don't exist
- [ ] Core Web Vitals pass
- [ ] Mobile Usability pass

---

## 16. Sample SEO Files

### robots.txt Example

```
# Current file at: app/robots.js
✅ Already properly configured
```

### sitemap.xml Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://hasanshiri.online/en</loc>
    <lastmod>2025-02-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://hasanshiri.online/en"/>
    <xhtml:link rel="alternate" hreflang="fa" href="https://hasanshiri.online/fa"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://hasanshiri.online/en"/>
  </url>
</urlset>
```

---

## 17. Recommended SEO Plugins/Integrations

### For Next.js

1. **@next/bundle-analyzer**: Analyze bundle size
2. **next-seo**: Enhanced SEO component (optional, you have good setup already)
3. **microdata-js**: Extract structured data

### For Development

1. **Lighthouse CI**: Performance monitoring
2. **Playwright**: E2E testing for SEO
3. **Pa11y**: Accessibility testing (affects SEO)

---

## 18. Quarterly SEO Tasks

### Every 3 Months

- [ ] Review Search Console for new issues
- [ ] Update old blog content with new info
- [ ] Check for broken links
- [ ] Audit internal linking structure
- [ ] Review competitor keywords
- [ ] Test Core Web Vitals
- [ ] Update sitemap if new sections added

---

## 19. Success Metrics

### SEO KPIs to Track

| Metric | Current | Target | Timeframe |
|--------|---------|--------|-----------|
| Organic Traffic | TBD | 500/mo | 6 months |
| Avg Position | TBD | Top 20 | 6 months |
| Indexed Pages | TBD | 50+ | 3 months |
| Backlinks | TBD | 20+ | 12 months |
| Domain Authority | TBD | 30+ | 12 months |

---

## 20. Additional Resources

### Official Documentation

- [Next.js SEO Documentation](https://nextjs.org/docs/app/building-your-application/optimizing seo)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)

### Useful Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Schema Markup Validator](https://validator.schema.org/)

---

**Last Updated**: 2026-02-09
**Next Review**: 2026-05-09 (3 months)
