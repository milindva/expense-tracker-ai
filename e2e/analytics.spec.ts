import { test, expect } from '@playwright/test'
import { resetStorage } from './helpers'

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page)
    await page.waitForSelector('text=Total Spending', { state: 'visible' })
  })

  // ── Section visibility ──────────────────────────────────────────────────────

  test('shows Spending Insights panel', async ({ page }) => {
    await expect(page.getByText('Spending Insights')).toBeVisible()
    await expect(page.getByText('Personalized summaries from your data')).toBeVisible()
  })

  test('shows Weekly Spending chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Weekly Spending' })).toBeVisible()
    await expect(page.getByText('Last 7 days')).toBeVisible()
  })

  test('shows Category Comparison chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Category Comparison' })).toBeVisible()
    await expect(page.getByText('This month vs last month')).toBeVisible()
  })

  test('shows Top Expenses chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Top Expenses' })).toBeVisible()
    await expect(page.getByText('Your 5 largest transactions')).toBeVisible()
  })

  // ── Data rendering with sample data ────────────────────────────────────────

  test('weekly spending renders a chart (not empty state) with sample data', async ({ page }) => {
    // Sample data has expenses from today through 6 days ago — all within the 7-day window
    const card = page.locator('h2:has-text("Weekly Spending")').locator('xpath=..')
    await expect(card.getByText('No data to display')).not.toBeVisible()
    await expect(card.locator('svg[role="application"]')).toBeVisible()
  })

  test('category comparison renders a chart with sample data', async ({ page }) => {
    // Sample data spans current and previous month
    const card = page.locator('h2:has-text("Category Comparison")').locator('xpath=..')
    await expect(card.getByText('No data to display')).not.toBeVisible()
    // Use role="application" to target the main chart SVG (not the legend icon SVGs)
    await expect(card.locator('svg[role="application"]')).toBeVisible()
  })

  test('top expenses renders a chart with sample data', async ({ page }) => {
    const card = page.locator('h2:has-text("Top Expenses")').locator('xpath=..')
    await expect(card.getByText('No data to display')).not.toBeVisible()
    await expect(card.locator('svg[role="application"]')).toBeVisible()
  })

  // ── Insights panel content ──────────────────────────────────────────────────

  test('insights panel shows at least one insight card', async ({ page }) => {
    const insightCards = page.locator('[class*="border-l-4"]')
    await expect(insightCards.first()).toBeVisible()
  })

  test('insight cards contain spending dollar amounts', async ({ page }) => {
    const insightCards = page.locator('[class*="border-l-4"]')
    const count = await insightCards.count()
    expect(count).toBeGreaterThan(0)
    // At least one insight card should reference a $ amount
    let foundDollar = false
    for (const card of await insightCards.all()) {
      const text = await card.textContent()
      if (text?.includes('$')) {
        foundDollar = true
        break
      }
    }
    expect(foundDollar).toBe(true)
  })

  // ── Empty state ─────────────────────────────────────────────────────────────

  test('all new charts show empty state and insights panel hides when no expenses', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('expense-tracker-data', JSON.stringify([]))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // InsightsPanel returns null when there are no insights
    await expect(page.getByText('Spending Insights')).not.toBeVisible()

    // Each new chart card shows its empty state
    const weeklyCard = page.locator('h2:has-text("Weekly Spending")').locator('xpath=..')
    await expect(weeklyCard.getByText('No data to display')).toBeVisible()

    const comparisonCard = page.locator('h2:has-text("Category Comparison")').locator('xpath=..')
    await expect(comparisonCard.getByText('No data to display')).toBeVisible()

    const topCard = page.locator('h2:has-text("Top Expenses")').locator('xpath=..')
    await expect(topCard.getByText('No data to display')).toBeVisible()
  })
})
