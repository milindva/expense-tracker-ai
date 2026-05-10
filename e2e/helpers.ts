import { Page } from '@playwright/test'

/** Clear localStorage so every test starts with the seeded sample data. */
export async function resetStorage(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForLoadState('networkidle')
}

/** Open the Add Expense modal via the nav bar button. */
export async function openAddForm(page: Page) {
  await page.click('button:has-text("Add Expense")')
  await page.waitForSelector('h2:has-text("Add Expense")', { state: 'visible' })
}

/** Fill and submit the Add Expense form with the supplied values. */
export async function fillAndSubmitForm(
  page: Page,
  opts: { date?: string; amount: string; category?: string; description: string }
) {
  if (opts.date) await page.fill('input[type="date"]', opts.date)
  await page.fill('input[inputmode="decimal"]', opts.amount)
  if (opts.category) await page.click(`button:has-text("${opts.category}")`)
  await page.fill('textarea', opts.description)
  await page.click('button[type="submit"]')
}
