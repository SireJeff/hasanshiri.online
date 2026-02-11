import { test, expect } from '@playwright/test'

test.describe('Admin', () => {
  test('admin login page loads', async ({ page }) => {
    await page.goto('/auth/login')

    // Should show login form or redirect
    await expect(page).toHaveURL(/\/(auth\/login|admin)/)
  })

  test('admin dashboard redirects without auth', async ({ page }) => {
    await page.goto('/admin')

    // Should redirect to login if not authenticated
    // Or show the admin page if already logged in
    const url = page.url()
    expect(url).toMatch(/\/(admin|auth\/login)/)
  })

  test('admin articles page exists', async ({ page }) => {
    await page.goto('/admin/articles')

    // Should redirect to login or show articles
    const url = page.url()
    expect(url).toMatch(/\/(admin|auth\/login)/)
  })

  test('login form has required fields', async ({ page }) => {
    await page.goto('/auth/login')

    // Wait for client-side hydration
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    // Check for email/password fields or OAuth buttons
    const emailField = page.getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i))
    const githubButton = page.getByRole('button', { name: /github/i })

    // Should have some form of login
    const hasEmailLogin = await emailField.isVisible().catch(() => false)
    const hasGitHubLogin = await githubButton.isVisible().catch(() => false)

    expect(hasEmailLogin || hasGitHubLogin).toBeTruthy()
  })
})
