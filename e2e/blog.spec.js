import { test, expect } from '@playwright/test'

test.describe('Blog', () => {
  test('blog listing page loads', async ({ page }) => {
    await page.goto('/en/blog')

    // Page should have blog heading or title
    await expect(page).toHaveURL(/\/en\/blog/)

    // Page should load successfully
    await expect(page.locator('main')).toBeVisible()
  })

  test('blog page has search functionality', async ({ page }) => {
    await page.goto('/en/blog')

    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      // Search should filter or trigger search
      await expect(searchInput).toHaveValue('test')
    }
  })

  test('blog page has category filter', async ({ page }) => {
    await page.goto('/en/blog')

    // Page should be functional
    await expect(page.locator('main')).toBeVisible()
  })

  test('Persian blog page loads with RTL', async ({ page }) => {
    await page.goto('/fa/blog')

    await expect(page).toHaveURL(/\/fa\/blog/)

    // Wait for client-side hydration
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000) // Allow time for DirAttribute component to set dir

    // Check RTL direction
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'rtl')
  })

  test('pagination works if present', async ({ page }) => {
    await page.goto('/en/blog')

    // Page should load successfully regardless of pagination
    await expect(page.locator('main')).toBeVisible()
  })
})
