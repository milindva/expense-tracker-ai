# Export Feature — Developer Documentation

## Overview

The export feature lets users download their expenses as CSV, JSON, or a print-to-PDF report. It is implemented as a self-contained modal (`ExportModal`) backed by a framework-agnostic engine module (`exportEngine`). All processing is client-side; no server round-trip is involved.

---

## File Map

```
lib/
  exportEngine.ts              Pure export logic — filters, generators, download trigger
components/
  Export/
    ExportModal.tsx            Modal UI — configuration panel + live preview
app/
  page.tsx                     Mounts the modal and owns isExportOpen state
```

---

## `lib/exportEngine.ts`

The engine has no React dependency and can be used in any JavaScript environment that has access to the browser `Blob` and `URL` APIs (and `window` for PDF).

### Types

```ts
export type ExportFormat = 'csv' | 'json' | 'pdf'

export interface ExportConfig {
  format: ExportFormat   // which generator to invoke
  startDate: string      // ISO date string, e.g. "2024-01-01"; empty = no lower bound
  endDate: string        // ISO date string; empty = no upper bound
  categories: Category[] // empty array = all categories included
  filename: string       // desired filename without extension
}
```

### `filterExpenses(expenses, config): Expense[]`

Pure function. Returns a new array containing only expenses that satisfy all active filter predicates.

```ts
filterExpenses(expenses: Expense[], config: ExportConfig): Expense[]
```

Filter logic (all conditions are ANDed):
- If `config.startDate` is non-empty: drop expenses where `e.date < config.startDate`
- If `config.endDate` is non-empty: drop expenses where `e.date > config.endDate`
- If `config.categories` is non-empty: drop expenses whose `e.category` is not in the array

Date comparison uses lexicographic string ordering, which is correct for ISO `YYYY-MM-DD` strings.

### `runExport(expenses, config): void`

Side-effectful. Takes an already-filtered expense array and the config, generates the file content for the requested format, and triggers a browser download.

```ts
runExport(expenses: Expense[], config: ExportConfig): void
```

#### CSV generation

Produces RFC 4180–compliant CSV with a header row:

```
Date,Category,Amount,Description
2024-01-15,Food,12.50,"Lunch at Pret"
```

- `Amount` is formatted with `.toFixed(2)` — always two decimal places
- `Description` is always double-quoted; internal double-quotes are escaped as `""`
- Other fields are not quoted (they are guaranteed clean by the app's type system)
- MIME type: `text/csv;charset=utf-8;`

#### JSON generation

Produces a pretty-printed JSON array. Each element contains only the four user-facing fields — `id` and `createdAt` are excluded:

```json
[
  {
    "date": "2024-01-15",
    "category": "Food",
    "amount": 12.50,
    "description": "Lunch at Pret"
  }
]
```

- `amount` is a native JSON number (not a string)
- MIME type: `application/json`

#### PDF generation

Opens a new browser window (`window.open('', '_blank')`), writes a complete HTML document to it, and calls `window.print()` after a 400ms delay. The delay is required for the browser to finish rendering before the print dialog opens.

The HTML document includes:
- System font stack (`-apple-system, sans-serif`)
- A styled table with all expense rows and a grand total row
- `@media print { body { padding: 0; } }` for clean printed output

**Popup blocker caveat**: `window.open` returns `null` if the browser blocks the popup. The function guards against this with `if (!win) return` — the export silently fails with no user feedback. If reliable PDF support is needed, a client-side library (e.g., jsPDF) or a server-side renderer should be used instead.

### `triggerDownload(content, filename, mimeType)` (private)

Internal helper that creates a `Blob`, generates an object URL, mounts a temporary `<a>` element, programmatically clicks it, and immediately revokes the object URL.

```
Blob(content, mimeType)
  → URL.createObjectURL
    → <a href=url download=filename>.click()
      → URL.revokeObjectURL
```

This is the standard cross-browser approach for client-side file downloads.

---

## `components/Export/ExportModal.tsx`

A `'use client'` component. Rendered in `app/page.tsx` and controlled via `isOpen` / `onClose` props. The component unmounts when closed (`if (!isOpen) return null`), which resets all local state automatically on each open.

### Props

```ts
interface ExportModalProps {
  isOpen: boolean       // controls visibility + mount
  onClose: () => void   // called on backdrop click, X button, or Escape key
  expenses: Expense[]   // full unfiltered expense list from useExpenses()
}
```

### State

| State variable | Type | Default | Purpose |
|---|---|---|---|
| `format` | `ExportFormat` | `'csv'` | Selected output format |
| `startDate` | `string` | `''` | Filter lower bound (empty = none) |
| `endDate` | `string` | today | Filter upper bound |
| `selectedCategories` | `Category[]` | `[]` | Active category filter (empty = all) |
| `filename` | `string` | `expenses-{today}` | Output filename without extension |
| `isExporting` | `boolean` | `false` | Loading state during export |
| `exportDone` | `boolean` | `false` | Success state (auto-clears after 2.5s) |

### Derived state

```ts
// Recomputed only when config or expenses change
const config = useMemo(() => ({ format, startDate, endDate, categories: selectedCategories, filename }), [...])
const filtered = useMemo(() => filterExpenses(expenses, config), [expenses, config])
```

`filtered` is never stored in state — it is always derived. This eliminates the possibility of stale filter results.

### Effects

A single `useEffect` gated on `isOpen`:
- Attaches an `Escape` keydown listener
- Sets `document.body.style.overflow = 'hidden'` to prevent background scroll
- Cleans up both on modal close or component unmount

### Export flow

```
handleExport()
  → setIsExporting(true)
  → setTimeout(600ms)          ← synthetic delay for perceived progress
    → runExport(filtered, config)
    → setIsExporting(false)
    → setExportDone(true)
    → setTimeout(2500ms)       ← success state auto-dismiss
      → setExportDone(false)
```

The 600ms delay before download is intentional UX — it prevents the button state from flickering for fast operations.

### Layout

The modal uses a two-panel flex layout within a `max-w-4xl` centered container:

```
┌─────────────────────────────────────────────────────┐
│ Header: title + Reset button + Close button          │
├──────────────────┬──────────────────────────────────┤
│  Left panel      │  Right panel                     │
│  (w-72, fixed)   │  (flex-1, scrollable)            │
│                  │                                  │
│  • Format        │  Summary bar                     │
│  • Date range    │  ─────────────────────────────── │
│  • Categories    │  Preview table (first 5 rows)    │
│  • Filename      │  "+ N more" overflow note        │
│                  │                                  │
├──────────────────┴──────────────────────────────────┤
│ Footer: filename.ext · N records · $total  [Export] │
└─────────────────────────────────────────────────────┘
```

Both panels scroll independently. The header and footer are `shrink-0` to remain visible at all viewport heights.

### Export button states

| Condition | Appearance | Behaviour |
|---|---|---|
| `filtered.length === 0` | Gray, `cursor-not-allowed` | Disabled |
| `isExporting === true` | Spinner + "Exporting…" | Disabled |
| `exportDone === true` | Green + checkmark + "Exported!" | Disabled (auto-clears 2.5s) |
| Default | Indigo + download icon | Enabled |

---

## Integration in `app/page.tsx`

```tsx
const [isExportOpen, setIsExportOpen] = useState(false)

// Trigger button in dashboard header
<button onClick={() => setIsExportOpen(true)}>Export Data</button>

// Modal mount (always in tree; unmounts when isOpen=false)
<ExportModal
  isOpen={isExportOpen}
  onClose={() => setIsExportOpen(false)}
  expenses={expenses}
/>
```

`expenses` comes from `useExpenses()` — the full unfiltered list. Any filters the user applies inside the modal are local to the modal's own state and do not affect the dashboard.

---

## Adding a New Export Format

1. Add the new value to the `ExportFormat` union in `exportEngine.ts`:
   ```ts
   export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx'
   ```

2. Add a generation branch in `runExport`:
   ```ts
   if (config.format === 'xlsx') {
     // generate content, call triggerDownload(...)
   }
   ```

3. Add an entry to `FORMAT_OPTIONS` in `ExportModal.tsx`:
   ```ts
   { id: 'xlsx', label: 'Excel', icon: '⊟', desc: 'Native Excel workbook format' }
   ```

No other changes are needed — the format selector, filename suffix, and export button label all derive from the selected format automatically.

---

## Adding a New Filter

1. Add the field to `ExportConfig`:
   ```ts
   export interface ExportConfig {
     // ...existing fields
     minAmount: number   // 0 = no lower bound
     maxAmount: number   // Infinity = no upper bound
   }
   ```

2. Add the filter predicate in `filterExpenses`:
   ```ts
   if (config.minAmount > 0 && e.amount < config.minAmount) return false
   if (config.maxAmount < Infinity && e.amount > config.maxAmount) return false
   ```

3. Add the corresponding state and UI control in `ExportModal`, and include the new field in the `config` useMemo dependency.

---

## Known Limitations

| Issue | Location | Severity |
|---|---|---|
| PDF silently fails if browser blocks popups | `runExport` — PDF branch | Medium |
| CSV does not escape formula-injection characters (`=`, `+`, `-`, `@`) | `runExport` — CSV branch | Low (personal app) |
| PDF inserts `description` into HTML without escaping — XSS if app ever handles untrusted data | `runExport` — PDF HTML template | Low (currently user's own data only) |
| Synthetic 600ms export delay is not tied to any real async operation | `ExportModal.handleExport` | Low |

---

## Testing

`lib/exportEngine.ts` is fully unit-testable without a browser (except `triggerDownload` and the PDF branch, which require DOM/`window`):

```ts
// Example: test filterExpenses
import { filterExpenses } from '@/lib/exportEngine'

const expenses = [
  { id: '1', date: '2024-01-10', category: 'Food', amount: 10, description: 'a', createdAt: '' },
  { id: '2', date: '2024-03-01', category: 'Bills', amount: 50, description: 'b', createdAt: '' },
]

const result = filterExpenses(expenses, {
  format: 'csv', filename: 'test',
  startDate: '2024-01-01', endDate: '2024-02-28',
  categories: [],
})
// result.length === 1, result[0].id === '1'
```

`ExportModal` requires a React testing environment (e.g., React Testing Library). The key things to test are:
- Preview table updates when filters change
- Export button is disabled when `filtered.length === 0`
- `onClose` is called on backdrop click and Escape key
- `runExport` is called with the correct filtered array and config on export
