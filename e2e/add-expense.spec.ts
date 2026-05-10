import { test, expect } from '@playwright/test'
import { resetStorage, openAddForm, fillAndSubmitForm } from './helpers'

test.describe('Add Expense — form', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page)
    await openAddForm(page)
  })

  // ── Happy path ─────────────────────────────────────────────────────────────

  test('form opens with correct default values', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0]
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput).toHaveValue(today)
    await expect(page.locator('input[inputmode="decimal"]')).toHaveValue('')
    await expect(page.locator('textarea')).toHaveValue('')
    // Food is the default category — its tile should have the indigo border
    await expect(page.locator('button:has-text("Food")')).toHaveClass(/border-indigo-500/)
  })

  test('submitting a valid expense closes the form and shows a success toast', async ({ page }) => {
    await fillAndSubmitForm(page, {
      amount: '25.00',
      category: 'Entertainment',
      description: 'Cinema tickets',
    })
    await expect(page.locator('h2:has-text("Add Expense")')).not.toBeVisible()
    await expect(page.getByText('Expense added')).toBeVisible()
  })

  test('new expense appears in the expenses list after saving', async ({ page }) => {
    await fillAndSubmitForm(page, {
      amount: '99.99',
      category: 'Shopping',
      description: 'Unique item for test purposes',
    })
    await page.getByRole('link', { name: 'Expenses' }).click()
    await page.waitForURL('**/expenses')
    await expect(page.getByText('Unique item for test purposes')).toBeVisible()
  })

  test('selecting a category highlights it', async ({ page }) => {
    await page.click('button:has-text("Bills")')
    await expect(page.locator('button:has-text("Bills")')).toHaveClass(/border-indigo-500/)
    await expect(page.locator('button:has-text("Food")')).not.toHaveClass(/border-indigo-500/)
  })

  test('character counter increments as description is typed', async ({ page }) => {
    await page.fill('textarea', 'Hello')
    await expect(page.getByText('5/200')).toBeVisible()
  })

  // ── Validation failures ────────────────────────────────────────────────────

  test('submitting an empty form shows amount and description errors', async ({ page }) => {
    await page.click('button[type="submit"]')
    await expect(page.getByText('Enter a valid amount greater than 0')).toBeVisible()
    await expect(page.getByText('Description is required')).toBeVisible()
  })

  test('amount of zero is rejected', async ({ page }) => {
    await page.fill('input[inputmode="decimal"]', '0')
    await page.fill('textarea', 'Some description')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Enter a valid amount greater than 0')).toBeVisible()
  })

  test('amount above $1,000,000 is rejected', async ({ page }) => {
    await page.fill('input[inputmode="decimal"]', '1000001')
    await page.fill('textarea', 'Some description')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Amount seems too large')).toBeVisible()
  })

  test('description over 200 characters is rejected', async ({ page }) => {
    const longText = 'a'.repeat(201)
    await page.fill('input[inputmode="decimal"]', '10')
    await page.fill('textarea', longText)
    await page.click('button[type="submit"]')
    await expect(page.getByText('Description must be under 200 characters')).toBeVisible()
  })

  test('letters in the amount field are stripped automatically', async ({ page }) => {
    await page.fill('input[inputmode="decimal"]', 'abc12.34xyz')
    await expect(page.locator('input[inputmode="decimal"]')).toHaveValue('12.34')
  })

  test('only the first decimal point is kept in the amount field', async ({ page }) => {
    await page.fill('input[inputmode="decimal"]', '12.3.4')
    await expect(page.locator('input[inputmode="decimal"]')).toHaveValue('12.34')
  })

  test('future dates are blocked by the date input max attribute', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0]
    const dateInput = page.locator('input[type="date"]')
    const maxAttr = await dateInput.getAttribute('max')
    expect(maxAttr).toBe(today)
  })

  // ── Close behaviours ───────────────────────────────────────────────────────

  test('Cancel button closes the form without saving', async ({ page }) => {
    await page.fill('input[inputmode="decimal"]', '50')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.locator('h2:has-text("Add Expense")')).not.toBeVisible()
  })

  test('X button closes the form', async ({ page }) => {
    // The close (×) button is the only button in the modal header's justify-between row
    await page.locator('.fixed.inset-0.z-50 .flex.items-center.justify-between button').click()
    await expect(page.locator('h2:has-text("Add Expense")')).not.toBeVisible()
  })

  test('Escape key closes the form', async ({ page }) => {
    await page.keyboard.press('Escape')
    await expect(page.locator('h2:has-text("Add Expense")')).not.toBeVisible()
  })

  test('clicking the backdrop closes the form', async ({ page }) => {
    await page.locator('.fixed.inset-0 .absolute.inset-0').click({ position: { x: 10, y: 10 } })
    await expect(page.locator('h2:has-text("Add Expense")')).not.toBeVisible()
  })
})

test.describe('Edit Expense', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page)
    await page.goto('/expenses')
    await page.waitForLoadState('networkidle')
  })

  test('edit form opens pre-filled with the existing expense values', async ({ page }) => {
    // Hover first row to reveal edit button, then click it
    const firstRow = page.locator('[class*="divide-y"] > div').first()
    await firstRow.hover()
    await firstRow.getByTitle('Edit expense').click()

    await page.waitForSelector('h2:has-text("Edit Expense")', { state: 'visible' })
    // Amount and description should not be empty
    await expect(page.locator('input[inputmode="decimal"]')).not.toHaveValue('')
    await expect(page.locator('textarea')).not.toHaveValue('')
  })

  test('editing an expense updates the value and shows a success toast', async ({ page }) => {
    const firstRow = page.locator('[class*="divide-y"] > div').first()
    await firstRow.hover()
    await firstRow.getByTitle('Edit expense').click()
    await page.waitForSelector('h2:has-text("Edit Expense")', { state: 'visible' })

    await page.fill('textarea', 'Updated description for e2e test')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Expense updated successfully')).toBeVisible()
    await expect(page.getByText('Updated description for e2e test')).toBeVisible()
  })
})
