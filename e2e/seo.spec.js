import { test, expect } from '@playwright/test'

test.describe('SEO', () => {
  test('homepage has proper meta tags', async ({ page }) => {
    await page.goto('/en')

    // Check for essential meta tags
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)

    // Check viewport meta
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', /width=device-width/)
  })

  test('page has Open Graph tags', async ({ page }) => {
    await page.goto('/en')

    // Check OG tags - at least og:title should exist
    const ogTitle = page.locator('meta[property="og:title"]')
    const hasOgTitle = await ogTitle.count() > 0
    expect(hasOgTitle).toBeTruthy()
  })

  test('page has canonical URL', async ({ page }) => {
    await page.goto('/en')

    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href', /.+/)
  })

  test('page has hreflang tags', async ({ page }) => {
    await page.goto('/en')

    // Check for alternate language links
    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]')
    const hreflangFa = page.locator('link[rel="alternate"][hreflang="fa"]')

    // Should have at least one hreflang
    const hasHreflang = (await hreflangEn.count()) > 0 || (await hreflangFa.count()) > 0
    expect(hasHreflang).toBeTruthy()
  })

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')
    expect(response?.status()).toBe(200)

    // Check content type
    const contentType = response?.headers()['content-type']
    expect(contentType).toMatch(/xml/)
  })

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt')
    expect(response?.status()).toBe(200)

    // Check content
    const content = await page.content()
    expect(content).toMatch(/User-agent/i)
  })

  test('page has JSON-LD structured data', async ({ page }) => {
    await page.goto('/en')

    // Check for JSON-LD script
    const jsonLd = page.locator('script[type="application/ld+json"]')
    const count = await jsonLd.count()

    if (count > 0) {
      const content = await jsonLd.first().textContent()
      const parsed = JSON.parse(content || '{}')
      expect(parsed['@context']).toBe('https://schema.org')
    }
  })

  test('heading hierarchy is correct', async ({ page }) => {
    await page.goto('/en')

    // Wait for client-side hydration and animations
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1500) // Allow time for HeroSection to render with animations

    // Check that there's at least one H1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)

    // H1 should have content
    const h1Text = await page.locator('h1').first().textContent()
    expect(h1Text?.length).toBeGreaterThan(0)
  })

  test('images have alt text', async ({ page }) => {
    await page.goto('/en')

    // Get all images
    const images = page.locator('img')
    const count = await images.count()

    // Check that images have alt text (allow some without for decorative images)
    if (count > 0) {
      let imagesWithAlt = 0
      for (let i = 0; i < Math.min(count, 10); i++) {
        const alt = await images.nth(i).getAttribute('alt')
        if (alt !== null) imagesWithAlt++
      }
      // At least 50% should have alt text
      expect(imagesWithAlt / Math.min(count, 10)).toBeGreaterThanOrEqual(0.5)
    }
  })
})
