import { test, expect } from '@playwright/test'
import { resetStorage } from './helpers'

// The export modal renders the filtered count as two sibling spans:
//   <span class="text-3xl ...">N</span>
//   <span class="text-sm ...">of 20 records</span>
// Use these helpers to assert counts without relying on a single combined text node.
async function getFilteredCount(page: import('@playwright/test').Page): Promise<number> {
  const text = await page.locator('.fixed.inset-0.z-50 span.text-3xl').innerText()
  return parseInt(text, 10)
}

test.describe('Export modal', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page)
    await page.waitForSelector('text=Total Spending', { state: 'visible' })
    await page.click('button:has-text("Export Data")')
    await page.waitForSelector('h2:has-text("Export Data")', { state: 'visible' })
  })

  // ── Opening state ──────────────────────────────────────────────────────────

  test('opens with CSV selected and all 20 sample records', async ({ page }) => {
    expect(await getFilteredCount(page)).toBe(20)
    await expect(page.getByText('of 20 records')).toBeVisible()
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible()
  })

  test('shows a live preview of up to 5 rows', async ({ page }) => {
    await expect(page.getByText('Showing 5 of 20')).toBeVisible()
  })

  test('shows the total amount of all expenses', async ({ page }) => {
    await expect(page.getByText('Total amount')).toBeVisible()
    // The value sits in the sibling <p> inside the same parent <div> as the "Total amount" label
    await expect(page.getByText('Total amount').locator('..').locator('p').last()).toContainText('$')
  })

  // ── Format switching ───────────────────────────────────────────────────────

  test('switching to JSON updates the export button label', async ({ page }) => {
    await page.click('button:has-text("JSON")')
    await expect(page.getByRole('button', { name: /Export JSON/i })).toBeVisible()
  })

  test('switching to PDF updates the export button label', async ({ page }) => {
    await page.click('button:has-text("PDF")')
    await expect(page.getByRole('button', { name: /Export PDF/i })).toBeVisible()
  })

  test('switching back to CSV restores the CSV button', async ({ page }) => {
    await page.click('button:has-text("JSON")')
    await page.click('button:has-text("CSV")')
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible()
  })

  // ── Date range filter ──────────────────────────────────────────────────────

  test('applying a date range reduces the record count', async ({ page }) => {
    const dateInputs = page.locator('.fixed.inset-0.z-50 input[type="date"]')
    // From = today, To = today → only today's expenses
    await dateInputs.nth(0).fill('2026-05-10')
    await dateInputs.nth(1).fill('2026-05-10')
    const count = await getFilteredCount(page)
    expect(count).toBeLessThan(20)
  })

  test('an impossible date range shows no data and disables the export button', async ({ page }) => {
    const dateInputs = page.locator('.fixed.inset-0.z-50 input[type="date"]')
    await dateInputs.nth(0).fill('2099-01-01')
    await dateInputs.nth(1).fill('2099-12-31')
    expect(await getFilteredCount(page)).toBe(0)
    await expect(page.getByText('No data to export')).toBeVisible()
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeDisabled()
  })

  // ── Category filter ────────────────────────────────────────────────────────

  test('selecting a category narrows the record count', async ({ page }) => {
    await page.click('button:has-text("Food")')
    const count = await getFilteredCount(page)
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThan(20)
  })

  test('selecting multiple categories shows a combined count', async ({ page }) => {
    await page.click('button:has-text("Food")')
    const countOne = await getFilteredCount(page)
    await page.click('button:has-text("Bills")')
    const countTwo = await getFilteredCount(page)
    expect(countTwo).toBeGreaterThan(countOne)
  })

  test('Clear button in category section resets to all categories', async ({ page }) => {
    await page.click('button:has-text("Food")')
    await page.locator('.fixed.inset-0.z-50').getByRole('button', { name: 'Clear' }).click()
    expect(await getFilteredCount(page)).toBe(20)
  })

  // ── Filename ───────────────────────────────────────────────────────────────

  test('filename field defaults to expenses-{today}', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0]
    await expect(page.locator('.fixed.inset-0.z-50 input[type="text"]')).toHaveValue(`expenses-${today}`)
  })

  test('filename field is editable', async ({ page }) => {
    await page.locator('.fixed.inset-0.z-50 input[type="text"]').fill('my-export')
    await expect(page.locator('.fixed.inset-0.z-50 input[type="text"]')).toHaveValue('my-export')
  })

  // ── Reset ──────────────────────────────────────────────────────────────────

  test('Reset button restores defaults', async ({ page }) => {
    await page.click('button:has-text("JSON")')
    await page.click('button:has-text("Food")')
    const today = new Date().toISOString().split('T')[0]

    await page.getByRole('button', { name: 'Reset' }).click()

    expect(await getFilteredCount(page)).toBe(20)
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible()
    await expect(page.locator('.fixed.inset-0.z-50 input[type="text"]')).toHaveValue(`expenses-${today}`)
  })

  // ── Export triggered ───────────────────────────────────────────────────────

  test('clicking Export CSV triggers a file download with .csv extension', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Export CSV/i }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/\.csv$/)
  })

  test('clicking Export JSON triggers a file download with .json extension', async ({ page }) => {
    await page.click('button:has-text("JSON")')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Export JSON/i }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/\.json$/)
  })

  test('modal stays open after export and shows Exported! confirmation', async ({ page }) => {
    await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Export CSV/i }).click(),
    ])
    await expect(page.getByText('Exported!')).toBeVisible()
    await expect(page.locator('h2:has-text("Export Data")')).toBeVisible()
  })

  // ── Close behaviours ───────────────────────────────────────────────────────

  test('X button closes the modal', async ({ page }) => {
    // The close (×) button is the immediate sibling after the Reset button
    await page.locator('button:has-text("Reset") + button').click()
    await expect(page.locator('h2:has-text("Export Data")')).not.toBeVisible()
  })

  test('Escape key closes the modal', async ({ page }) => {
    await page.keyboard.press('Escape')
    await expect(page.locator('h2:has-text("Export Data")')).not.toBeVisible()
  })

  test('clicking the backdrop closes the modal', async ({ page }) => {
    await page.locator('.fixed.inset-0.z-50 .absolute.inset-0').click({ position: { x: 10, y: 10 } })
    await expect(page.locator('h2:has-text("Export Data")')).not.toBeVisible()
  })
})
