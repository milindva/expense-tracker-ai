import { Category, Expense } from './types'
import { CATEGORY_ICONS, formatCurrency } from './utils'

export type ExportFormat = 'csv' | 'json' | 'pdf'

export interface ExportConfig {
  format: ExportFormat
  startDate: string
  endDate: string
  categories: Category[]
  filename: string
}

export function filterExpenses(expenses: Expense[], config: ExportConfig): Expense[] {
  return expenses.filter((e) => {
    if (config.startDate && e.date < config.startDate) return false
    if (config.endDate && e.date > config.endDate) return false
    if (config.categories.length > 0 && !config.categories.includes(e.category)) return false
    return true
  })
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function runExport(expenses: Expense[], config: ExportConfig): void {
  const ext = config.format
  const filename = `${config.filename}.${ext}`

  if (config.format === 'csv') {
    const headers = ['Date', 'Category', 'Amount', 'Description']
    const rows = expenses.map((e) => [
      e.date,
      e.category,
      e.amount.toFixed(2),
      `"${e.description.replace(/"/g, '""')}"`,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    triggerDownload(csv, filename, 'text/csv;charset=utf-8;')
    return
  }

  if (config.format === 'json') {
    const data = expenses.map((e) => ({
      date: e.date,
      category: e.category,
      amount: e.amount,
      description: e.description,
    }))
    triggerDownload(JSON.stringify(data, null, 2), filename, 'application/json')
    return
  }

  if (config.format === 'pdf') {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    const rows = expenses
      .map(
        (e) => `
        <tr>
          <td>${e.date}</td>
          <td>${CATEGORY_ICONS[e.category]} ${e.category}</td>
          <td style="text-align:right">${formatCurrency(e.amount)}</td>
          <td>${e.description}</td>
        </tr>`
      )
      .join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${config.filename}</title>
  <style>
    body { font-family: -apple-system, sans-serif; color: #1e293b; padding: 32px; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f8fafc; text-align: left; padding: 8px 12px; border-bottom: 2px solid #e2e8f0; font-weight: 600; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:last-child td { border-bottom: none; }
    .total-row td { font-weight: 600; border-top: 2px solid #e2e8f0; padding-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Expense Report</h1>
  <p class="meta">Exported ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} &bull; ${expenses.length} records</p>
  <table>
    <thead>
      <tr><th>Date</th><th>Category</th><th style="text-align:right">Amount</th><th>Description</th></tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td colspan="2">Total</td>
        <td style="text-align:right">${formatCurrency(total)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }
}
