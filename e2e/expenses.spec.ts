import { test, expect } from '@playwright/test'
import { resetStorage } from './helpers'

test.describe('Expenses page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page)
    await page.goto('/expenses')
    // Wait for the list to hydrate — the filter bar result count is the reliable signal
    await page.waitForSelector('text=Showing', { state: 'visible' })
  })

  // ── Page load ──────────────────────────────────────────────────────────────

  test('loads and displays the expense list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible()
    // Sample data has 20 expenses — the filter bar shows "Showing 20 of 20"
    await expect(page.getByText('Showing')).toBeVisible()
    await expect(page.getByText(/Showing 20 of 20/)).toBeVisible()
  })

  test('shows column headers', async ({ page }) => {
    // Headers are inside the hidden-sm:grid header row (visible at 1280px)
    const headerRow = page.locator('.hidden.sm\\:grid')
    await expect(headerRow.getByText('Date')).toBeVisible()
    await expect(headerRow.getByText('Category')).toBeVisible()
    await expect(headerRow.getByText('Description')).toBeVisible()
    await expect(headerRow.getByText('Amount')).toBeVisible()
  })

  // ── Search filter ──────────────────────────────────────────────────────────

  test('search filter narrows results to matching descriptions', async ({ page }) => {
    await page.fill('input[placeholder="Search expenses..."]', 'groceries')
    await expect(page.getByText('Weekly groceries')).toBeVisible()
    await expect(page.getByText('Filtered')).toBeVisible()
  })

  test('search filter also matches category names', async ({ page }) => {
    await page.fill('input[placeholder="Search expenses..."]', 'food')
    // "Filtered" badge confirms the filter is active, meaning count < 20
    await expect(page.getByText('Filtered')).toBeVisible()
    // Result count span should not show the full 20
    await expect(page.getByText(/Showing 20 of 20/)).not.toBeVisible()
  })

  test('search with no match shows empty state', async ({ page }) => {
    await page.fill('input[placeholder="Search expenses..."]', 'xyznonexistent123')
    await expect(page.getByText('No expenses found')).toBeVisible()
  })

  // ── Category filter ────────────────────────────────────────────────────────

  test('category filter shows only matching expenses', async ({ page }) => {
    await page.selectOption('select', 'Bills')
    await expect(page.getByText('Filtered')).toBeVisible()
    await expect(page.getByText('Electric bill')).toBeVisible()
  })

  test('selecting a category with search shows combined empty state', async ({ page }) => {
    await page.fill('input[placeholder="Search expenses..."]', 'xyznonexistent')
    await page.selectOption('select', 'Bills')
    await expect(page.getByText('No expenses found')).toBeVisible()
  })

  // ── Date range filter ──────────────────────────────────────────────────────

  test('date range filter narrows results', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]')
    await dateInputs.nth(0).fill('2026-05-10')
    await dateInputs.nth(1).fill('2026-05-10')
    await expect(page.getByText('Filtered')).toBeVisible()
    const resultText = await page.locator('text=/Showing \\d+ of 20 expenses/').innerText()
    const shown = parseInt(resultText.match(/Showing (\d+)/)?.[1] ?? '20')
    expect(shown).toBeLessThan(20)
  })

  test('impossible date range shows empty state', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]')
    await dateInputs.nth(0).fill('2099-01-01')
    await dateInputs.nth(1).fill('2099-12-31')
    await expect(page.getByText('No expenses found')).toBeVisible()
  })

  // ── Clear filters ──────────────────────────────────────────────────────────

  test('Clear button restores all expenses', async ({ page }) => {
    await page.fill('input[placeholder="Search expenses..."]', 'groceries')
    await expect(page.getByText('Filtered')).toBeVisible()
    await page.getByRole('button', { name: /Clear/ }).click()
    await expect(page.getByText('Filtered')).not.toBeVisible()
    await expect(page.getByText(/Showing 20 of 20/)).toBeVisible()
  })

  test('Clear button does not appear when no filters are active', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Clear' })).not.toBeVisible()
  })

  // ── Delete expense ─────────────────────────────────────────────────────────

  test('first delete click shows confirmation state on the button', async ({ page }) => {
    const firstRow = page.locator('[class*="divide-y"] > div').first()
    await firstRow.hover()
    await firstRow.getByTitle('Delete expense').click()
    await expect(firstRow.getByTitle('Click again to confirm')).toBeVisible()
  })

  test('confirming delete removes the expense and shows a toast', async ({ page }) => {
    const firstRow = page.locator('[class*="divide-y"] > div').first()
    const descText = await firstRow.locator('p.text-sm').innerText()

    await firstRow.hover()
    await firstRow.getByTitle('Delete expense').click()
    await firstRow.getByTitle('Click again to confirm').click()

    await expect(page.getByText('Expense deleted')).toBeVisible()
    await expect(page.getByText(descText)).not.toBeVisible()
  })

  test('delete confirmation reverts if not confirmed within 3 seconds', async ({ page }) => {
    const firstRow = page.locator('[class*="divide-y"] > div').first()
    await firstRow.hover()
    await firstRow.getByTitle('Delete expense').click()
    await expect(firstRow.getByTitle('Click again to confirm')).toBeVisible()
    await page.waitForTimeout(3200)
    await expect(firstRow.getByTitle('Delete expense')).toBeVisible()
    await expect(firstRow.getByTitle('Click again to confirm')).not.toBeVisible()
  })

  // ── Total shown ────────────────────────────────────────────────────────────

  test('total shown updates when a category filter is applied', async ({ page }) => {
    const totalEl = page.locator('p.text-xl.font-bold')
    const fullTotal = await totalEl.innerText()
    await page.selectOption('select', 'Food')
    const filteredTotal = await totalEl.innerText()
    expect(filteredTotal).not.toBe(fullTotal)
  })
})

test.describe('Export from Expenses page', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page)
    await page.goto('/expenses')
    await page.waitForSelector('text=Showing', { state: 'visible' })
  })

  test('Export button is visible in the filter bar', async ({ page }) => {
    await expect(page.locator('button:has-text("Export")')).toBeVisible()
  })

  test('clicking Export opens the ExportModal with all records', async ({ page }) => {
    await page.click('button:has-text("Export")')
    await expect(page.locator('h2:has-text("Export Data")')).toBeVisible()
    await expect(page.locator('.fixed.inset-0.z-50 span.text-3xl')).toHaveText('20')
  })

  test('ExportModal can be closed with Escape key', async ({ page }) => {
    await page.click('button:has-text("Export")')
    await expect(page.locator('h2:has-text("Export Data")')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('h2:has-text("Export Data")')).not.toBeVisible()
  })
})
