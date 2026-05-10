import { test, expect } from '@playwright/test'
import { resetStorage } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page)
    // Wait for the hydrated summary cards, not just networkidle
    await page.waitForSelector('text=Total Spending', { state: 'visible' })
  })

  test('shows all four summary card values', async ({ page }) => {
    // Each card value is a p.text-2xl element — all should contain a $ amount
    const values = page.locator('p.text-2xl')
    await expect(values).toHaveCount(4)
    for (const v of await values.all()) {
      await expect(v).toContainText('$')
    }
  })

  test('summary card labels are all present', async ({ page }) => {
    const monthName = new Date().toLocaleDateString('en-US', { month: 'long' })
    await expect(page.getByText('Total Spending')).toBeVisible()
    await expect(page.getByText(`${monthName} Spending`)).toBeVisible()
    await expect(page.getByText('This Week')).toBeVisible()
    await expect(page.getByText('Avg. Transaction')).toBeVisible()
  })

  test('recent expenses list is visible and non-empty', async ({ page }) => {
    await expect(page.getByText('Recent Expenses')).toBeVisible()
    await expect(page.getByText('Weekly groceries')).toBeVisible()
  })

  test('navigation links are visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Expenses' })).toBeVisible()
  })

  test('navigating to Expenses page works', async ({ page }) => {
    await page.getByRole('link', { name: 'Expenses' }).click()
    await page.waitForURL('**/expenses')
    await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible()
  })

  test('Export Data button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Export Data/i })).toBeVisible()
  })

  test('Add Expense button is visible in the nav bar', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add Expense/i })).toBeVisible()
  })
})
