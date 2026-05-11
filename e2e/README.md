# End-to-End Tests

SpendWise uses [Playwright](https://playwright.dev) for end-to-end testing. All tests run in a real Chromium browser against the live Next.js dev server, exercising the full stack from UI interaction through to localStorage persistence.

---

## Setup

### Prerequisites

Node modules must be installed and the Playwright browser must be available:

```bash
npm install
npx playwright install chromium
```

Both steps are only needed once. The browser binary is cached in `~/.cache/ms-playwright` and reused on subsequent runs.

### Project structure

```
e2e/
  helpers.ts            Shared test utilities (resetStorage, openAddForm, fillAndSubmitForm)
  dashboard.spec.ts     Dashboard page tests
  add-expense.spec.ts   Add and edit expense form tests
  expenses.spec.ts      Expenses page — filters, delete, pagination
  export.spec.ts        Export modal — format, filters, downloads, close behaviours
playwright.config.ts    Playwright configuration
```

### Configuration highlights (`playwright.config.ts`)

| Setting | Value | Effect |
|---|---|---|
| `testDir` | `./e2e` | Where Playwright looks for spec files |
| `fullyParallel` | `true` | All tests run in parallel by default |
| `workers` | system default (CI: 1) | Parallelism level |
| `retries` | 0 (CI: 2) | Automatic retries on failure in CI |
| `reporter` | `list` | One line per test in the terminal |
| `trace` | `on-first-retry` | Trace files captured only on retry |
| `baseURL` | `http://localhost:3000` | Base for all `page.goto('/')` calls |
| `webServer` | `npm run dev` | Auto-starts the dev server; reuses it if already running |

---

## Running the tests

### Run all tests (headless)

```bash
npm run test:e2e
```

Playwright starts (or reuses) the dev server automatically. All 60 tests run in parallel in a headless Chromium window. Results are printed to the terminal.

### Run with the interactive UI

```bash
npm run test:e2e:ui
```

Opens the Playwright UI — a graphical test runner where you can pick individual tests, watch them execute step by step, inspect the DOM, and replay traces. Recommended for debugging.

### Run a single file

```bash
npx playwright test e2e/export.spec.ts
```

### Run tests matching a name pattern

```bash
npx playwright test --grep "validation"
```

### Run headed (watch the browser)

```bash
npx playwright test --headed
```

### Debug a single test

```bash
npx playwright test e2e/add-expense.spec.ts --debug
```

Opens a Playwright Inspector window with step-by-step controls.

---

## Test isolation

Every test calls `resetStorage(page)` in its `beforeEach` hook (implemented in `e2e/helpers.ts`):

```ts
export async function resetStorage(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForLoadState('networkidle')
}
```

This clears `localStorage` before each test and reloads the page, which causes the app to re-seed 20 sample expenses. Every test therefore starts from a known, identical state regardless of what previous tests did.

---

## Functional areas covered

### Dashboard (`dashboard.spec.ts` — 7 tests)

- All four summary cards render with dollar values
- Card labels reflect the correct dynamic month name
- Recent expenses list is populated
- Navigation links (Dashboard / Expenses) are present
- Navigating to the Expenses page works
- Export Data and Add Expense buttons are visible

### Add and Edit Expense (`add-expense.spec.ts` — 18 tests)

**Happy path**
- Form opens with correct defaults (today's date, Food category, empty amount/description)
- Valid expense saves, closes the form, and shows a success toast
- Saved expense appears in the Expenses list

**Input behaviour**
- Selecting a category highlights it and deselects the previous one
- Character counter increments as description is typed
- Letters in the amount field are stripped automatically
- Multiple decimal points are collapsed to one

**Validation failures**
- Submitting an empty form shows errors on amount and description
- Amount of zero is rejected
- Amount above $1,000,000 is rejected
- Description over 200 characters is rejected
- Future dates are blocked via the `max` attribute on the date input

**Close behaviours**
- Cancel button, X button, Escape key, and backdrop click all close the form without saving

**Edit mode**
- Edit form opens pre-filled with the existing expense's values
- Saving an edit updates the value in the list and shows a success toast

### Expenses page (`expenses.spec.ts` — 15 tests)

**Page load**
- Expense list loads and shows all 20 sample expenses
- Column headers (Date, Category, Description, Amount) are visible

**Search filter**
- Narrows results to matching descriptions
- Also matches category names
- Shows empty state when no expenses match

**Category filter**
- Shows only expenses in the selected category
- Combining with search can produce an empty state

**Date range filter**
- Narrows results to the selected window
- Shows empty state for a date range with no expenses

**Clear filters**
- Restores all 20 expenses
- Clear button is hidden when no filters are active

**Delete expense**
- First click on the delete button shows a "click again to confirm" state
- Confirming the deletion removes the expense and shows a toast
- The confirmation state reverts after 3 seconds if not confirmed

**Total display**
- Shown total updates when a category filter is applied

### Export modal (`export.spec.ts` — 20 tests)

**Opening state**
- Opens with CSV selected and all 20 records shown
- Live preview shows the first 5 rows
- Total amount is displayed

**Format switching**
- Switching to JSON / PDF updates the export button label
- Switching back to CSV restores the CSV label

**Date range filter**
- Applying a date range reduces the record count
- An impossible date range shows "No data to export" and disables the export button

**Category filter**
- Selecting one category narrows the count
- Selecting two categories shows a combined count (greater than one alone)
- Clear button in the category section resets to all categories

**Filename**
- Defaults to `expenses-YYYY-MM-DD` (today's date)
- Field is editable

**Reset**
- Restores CSV format, all records, and the default filename

**Export triggered**
- Clicking Export CSV triggers a browser download with a `.csv` extension
- Clicking Export JSON triggers a download with a `.json` extension
- Modal stays open after export and shows an "Exported!" confirmation

**Close behaviours**
- X button, Escape key, and backdrop click all close the modal

---

## Viewing test results

### Terminal output

The `list` reporter prints one line per test:

```
✓  1 [chromium] › e2e/add-expense.spec.ts:22 › Add Expense — form › submitting a valid expense ... (2.0s)
✓  2 [chromium] › e2e/dashboard.spec.ts:11  › Dashboard › shows all four summary card values (1.0s)
✘  3 [chromium] › e2e/export.spec.ts:33     › Export modal › shows the total amount ... (1.2s)
```

A summary at the end shows total passed / failed counts and overall duration.

### HTML report

Generate a full HTML report with screenshots and traces:

```bash
npx playwright test --reporter=html
npx playwright show-report
```

This opens a browser tab with a filterable list of all tests, inline screenshots for failures, and step-by-step trace playback.

### Trace viewer

When a test fails on first retry (CI mode), a trace file is saved to `test-results/`. Open any trace file with:

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

The trace viewer shows a timeline of every action, network request, and DOM snapshot — useful for diagnosing intermittent failures.

### Locally generated artefacts

| Path | Contents |
|---|---|
| `test-results/` | Failure artefacts — screenshots, traces, error context |
| `playwright-report/` | HTML report (only when `--reporter=html` is used) |

Both directories are generated on demand and should be added to `.gitignore`.
