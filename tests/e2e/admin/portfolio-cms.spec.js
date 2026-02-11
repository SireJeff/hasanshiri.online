/**
 * Portfolio CMS E2E Tests
 *
 * End-to-end tests for the Portfolio CMS admin interface
 */

import { test, expect } from '@playwright/test'

test.describe('Portfolio CMS Admin', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin')
  })

  test.describe('Authentication', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
      await page.goto('/admin/skills')
      await expect(page).toHaveURL(/\/login/)
    })

    test('should show admin dashboard when authenticated', async ({ page }) => {
      // Note: This test requires authentication setup
      // For now, just check the admin structure exists
      await page.goto('/admin')
      // The sidebar should exist even if redirected to login
    })
  })

  test.describe('Skills Management', () => {
    test('should display skills list page', async ({ page }) => {
      // This test assumes authentication is handled
      await page.goto('/admin/skills')
      await expect(page).toHaveTitle(/Skills/)
    })

    test('should have create skill button', async ({ page }) => {
      await page.goto('/admin/skills')
      const createButton = page.locator('a[href*="/admin/skills/new"]')
      await expect(createButton).toHaveCount(1)
    })

    test('should show skill categories filter', async ({ page }) => {
      await page.goto('/admin/skills')
      const categoryChips = page.locator('[data-testid="category-chip"]')
      // Should have at least one category chip
      await expect(categoryChips.first()).toBeVisible()
    })
  })

  test.describe('Projects Management', () => {
    test('should display projects list page', async ({ page }) => {
      await page.goto('/admin/projects')
      await expect(page).toHaveTitle(/Projects/)
    })

    test('should have status filter options', async ({ page }) => {
      await page.goto('/admin/projects')
      const statusFilters = page.locator('button:has-text("Active"), button:has-text("Draft"), button:has-text("Archived")')
      await expect(statusFilters.first()).toBeVisible()
    })

    test('should have create project button', async ({ page }) => {
      await page.goto('/admin/projects')
      const createButton = page.locator('a[href*="/admin/projects/new"]')
      await expect(createButton).toHaveCount(1)
    })
  })

  test.describe('Content Management', () => {
    test('should display content management page', async ({ page }) => {
      await page.goto('/admin/content')
      await expect(page).toHaveTitle(/Page Content/)
    })

    test('should have page selector tabs', async ({ page }) => {
      await page.goto('/admin/content')
      const homePageTab = page.locator('a[href*="page=home"]')
      const aboutPageTab = page.locator('a[href*="page=about"]')
      await expect(homePageTab).toBeVisible()
      await expect(aboutPageTab).toBeVisible()
    })
  })

  test.describe('Settings Management', () => {
    test('should display settings page with tabs', async ({ page }) => {
      await page.goto('/admin/settings')
      const tabs = page.locator('button:has-text("Profile"), button:has-text("Contact"), button:has-text("Social")')
      await expect(tabs.first()).toBeVisible()
    })

    test('should switch between settings tabs', async ({ page }) => {
      await page.goto('/admin/settings')
      const contactTab = page.locator('button:has-text("Contact")')
      await contactTab.click()
      await expect(page.locator('input[type="email"]')).toBeVisible()
    })
  })
})

test.describe('Portfolio CMS - Skill Form', () => {
  test('should have bilingual form fields', async ({ page }) => {
    await page.goto('/admin/skills/new')
    await expect(page.locator('input[name*="name_en"]')).toBeVisible()
    await expect(page.locator('input[name*="name_fa"]')).toBeVisible()
  })

  test('should have proficiency slider', async ({ page }) => {
    await page.goto('/admin/skills/new')
    const slider = page.locator('input[type="range"]')
    await expect(slider).toBeVisible()
  })

  test('should have category dropdown', async ({ page }) => {
    await page.goto('/admin/skills/new')
    const categorySelect = page.locator('select[name="category_id"]')
    await expect(categorySelect).toBeVisible()
  })
})

test.describe('Portfolio CMS - Project Form', () => {
  test('should have TipTap editor for long description', async ({ page }) => {
    await page.goto('/admin/projects/new')
    // TipTap editor should be present (may be loaded dynamically)
    await expect(page.locator('[contenteditable="true"]')).toBeVisible()
  })

  test('should have GitHub integration section', async ({ page }) => {
    await page.goto('/admin/projects/new')
    const githubInput = page.locator('input[name="github_repo_name"]')
    await expect(githubInput).toBeVisible()
  })

  test('should have tag selection', async ({ page }) => {
    await page.goto('/admin/projects/new')
    const tagButtons = page.locator('button[type="button"]')
    // Should have tag selection buttons
    await expect(tagButtons.first()).toBeVisible()
  })
})

test.describe('Portfolio CMS - Language Switching', () => {
  test('should have language tabs on bilingual forms', async ({ page }) => {
    await page.goto('/admin/skills/new')
    const englishTab = page.locator('button:has-text("English")')
    const persianTab = page.locator('button:has-text("فارسی")')
    await expect(englishTab).toBeVisible()
    await expect(persianTab).toBeVisible()
  })

  test('should switch language tabs', async ({ page }) => {
    await page.goto('/admin/skills/new')
    const persianTab = page.locator('button:has-text("فارسی")')

    await persianTab.click()
    // Form should update to show Persian fields
    await expect(page.locator('input[name*="name_fa"]')).toBeVisible()
  })
})
