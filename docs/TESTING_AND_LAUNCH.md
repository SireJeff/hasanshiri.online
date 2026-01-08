# Testing, Polish & Launch Guide

This document covers the testing setup, pre-launch checklist, and maintenance procedures for hasanshiri.online.

## Testing Infrastructure

### Unit Tests (Jest + React Testing Library)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

**Test Files Location:**
- `__tests__/lib/` - Utility function tests
- `__tests__/components/` - Component tests
- `__tests__/utils/` - Test utilities and mock data

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run with UI mode (for debugging)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed
```

**E2E Test Files:**
- `e2e/homepage.spec.js` - Homepage functionality
- `e2e/blog.spec.js` - Blog listing and articles
- `e2e/admin.spec.js` - Admin authentication
- `e2e/seo.spec.js` - SEO and meta tags
- `e2e/accessibility.spec.js` - Accessibility compliance

---

## Cross-Browser Testing Checklist

### Desktop Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | ⬜ | Primary target |
| Firefox | Latest | ⬜ | |
| Safari | Latest | ⬜ | macOS only |
| Edge | Latest | ⬜ | Chromium-based |

### Mobile Browsers

| Browser | Platform | Status | Notes |
|---------|----------|--------|-------|
| Chrome | Android | ⬜ | |
| Safari | iOS | ⬜ | |
| Samsung Internet | Android | ⬜ | |

### Testing Checklist Per Browser

#### Core Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Language toggle (EN/FA) works
- [ ] Theme toggle works
- [ ] Blog listing displays
- [ ] Article pages render
- [ ] Comments load and submit
- [ ] Chat widget opens/closes
- [ ] Search functionality works
- [ ] Forms submit correctly

#### Visual/Layout
- [ ] Fonts render correctly
- [ ] RTL layout (Persian) displays properly
- [ ] Images load and display
- [ ] Responsive breakpoints work
- [ ] Dark/Light themes display correctly
- [ ] Animations are smooth

#### Performance
- [ ] Page loads within 3 seconds
- [ ] No layout shifts during load
- [ ] Images lazy load
- [ ] Scrolling is smooth

---

## Pre-Launch Checklist

### Functionality
- [x] All pages load without errors
- [x] Forms submit correctly
- [x] Authentication works
- [x] Blog CRUD operations work
- [x] Comments system functional
- [x] Chat widget functional
- [x] Search works
- [x] Bilingual content displays correctly

### SEO
- [x] Meta tags on all pages
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] sitemap.xml generated
- [x] robots.txt configured
- [x] JSON-LD structured data
- [x] Hreflang tags for bilingual content
- [x] Canonical URLs set

### Performance
- [x] Font optimization (next/font)
- [x] Image optimization (Next.js Image)
- [x] Security headers configured
- [x] Compression enabled
- [ ] Lighthouse score 90+ (verify after deploy)

### Security
- [x] HTTPS enforced (via hosting)
- [x] Security headers set (HSTS, X-Frame-Options, etc.)
- [x] Input validation on forms
- [x] Honeypot spam protection on comments
- [x] Admin routes protected
- [x] Environment variables secured

### Accessibility
- [x] Semantic HTML structure
- [x] Proper heading hierarchy
- [x] Alt text on images
- [x] Keyboard navigation works
- [x] RTL support for Persian
- [x] Focus indicators visible
- [ ] Screen reader testing (manual)

### Monitoring
- [x] Sentry error tracking configured
- [x] Vercel Analytics enabled
- [x] Speed Insights enabled
- [ ] UptimeRobot setup (manual - see below)

---

## Monitoring Setup

### Sentry Error Tracking

1. Create account at [sentry.io](https://sentry.io)
2. Create a new Next.js project
3. Copy DSN to environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
   SENTRY_ORG=your_org
   SENTRY_PROJECT=your_project
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

### UptimeRobot (Free Uptime Monitoring)

1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: hasanshiri.online
   - URL: https://hasanshiri.online
   - Monitoring Interval: 5 minutes
3. Set up alert contacts:
   - Add your email address
   - (Optional) Add Telegram/Slack webhook

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. **Lint** - ESLint check
2. **Unit Tests** - Jest with coverage
3. **E2E Tests** - Playwright on Chromium
4. **Build** - Next.js production build

### Required GitHub Secrets

Add these in GitHub repo Settings > Secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (Optional) `CODECOV_TOKEN` for coverage reports

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy triggers automatically on push to main

### Environment Variables for Production

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://hasanshiri.online

# Optional but recommended
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_token
```

---

## Post-Launch Tasks

### Week 1
- [ ] Monitor Sentry for errors
- [ ] Check Vercel Analytics
- [ ] Review uptime reports
- [ ] Test all forms in production
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools

### Month 1
- [ ] Review analytics data
- [ ] Check for slow pages
- [ ] Review error trends in Sentry
- [ ] Gather user feedback
- [ ] Optimize based on real usage

### Ongoing
- [ ] Weekly dependency updates check
- [ ] Monthly security review
- [ ] Quarterly performance audit
- [ ] Regular content backup

---

## Maintenance Commands

```bash
# Check for dependency updates
npm outdated

# Update dependencies (minor/patch)
npm update

# Run security audit
npm audit

# Fix security issues
npm audit fix

# Build production bundle
npm run build

# Start production server (for testing)
npm start
```

---

## Troubleshooting

### Common Issues

**Build fails with Supabase error**
- Ensure environment variables are set
- Check that Supabase project is active

**Tests fail in CI**
- Check if environment variables are configured as GitHub secrets
- Verify Playwright browsers are installed

**Sentry not capturing errors**
- Verify DSN is correct
- Check that `enabled: true` in production config
- Ensure SENTRY_AUTH_TOKEN is set for source map upload

**Images not loading**
- Check Supabase storage permissions
- Verify image URLs are in allowed domains (next.config.js)

---

## Contact

For issues with this project, contact:
- GitHub Issues: [repository-url]/issues
- Email: [your-email]
