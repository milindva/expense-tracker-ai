import { Category, Expense } from './types'
import { CATEGORIES, CATEGORY_ICONS, formatCurrency } from './utils'

// ─── Core types ──────────────────────────────────────────────────────────────

export type TemplateId = 'tax-report' | 'monthly-summary' | 'category-analysis' | 'full-export'
export type DestinationId = 'download' | 'email' | 'google-sheets' | 'dropbox' | 'onedrive'
export type Frequency = 'daily' | 'weekly' | 'monthly'

export interface ExportRecord {
  id: string
  templateId: TemplateId
  destination: DestinationId
  timestamp: string
  recordCount: number
  fileSizeKb: number
  emailAddress?: string
}

export interface ScheduledExport {
  id: string
  templateId: TemplateId
  destination: DestinationId
  frequency: Frequency
  nextRun: string
  enabled: boolean
}

export interface ShareLink {
  id: string
  token: string
  createdAt: string
  expiresAt: string | null
  views: number
}

export type Connections = Partial<Record<DestinationId, boolean>>

// ─── Template definitions ─────────────────────────────────────────────────────

export const TEMPLATES: Record<TemplateId, {
  label: string
  icon: string
  tagline: string
  description: string
  color: string
  bg: string
  filter: (e: Expense[]) => Expense[]
}> = {
  'tax-report': {
    label: 'Tax Report',
    icon: '📋',
    tagline: 'Year-end filing',
    description: 'All expenses for the current tax year, grouped by category with subtotals — ready for your accountant.',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    filter: (expenses) => {
      const year = new Date().getFullYear().toString()
      return expenses.filter((e) => e.date.startsWith(year))
    },
  },
  'monthly-summary': {
    label: 'Monthly Summary',
    icon: '📅',
    tagline: 'This month at a glance',
    description: "Current month's spending by category. Great for monthly budget reviews.",
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    filter: (expenses) => {
      const now = new Date()
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      return expenses.filter((e) => e.date.startsWith(key))
    },
  },
  'category-analysis': {
    label: 'Category Analysis',
    icon: '📊',
    tagline: 'Deep breakdown',
    description: 'Spending percentages, per-category totals, and transaction counts across all time.',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
    filter: (expenses) => expenses,
  },
  'full-export': {
    label: 'Full Export',
    icon: '🗄️',
    tagline: 'Everything, everywhere',
    description: 'Complete raw dataset — every expense ever recorded. Best for migrations or backups.',
    color: 'text-slate-700',
    bg: 'bg-slate-50 border-slate-200',
    filter: (expenses) => expenses,
  },
}

// ─── Destination definitions ──────────────────────────────────────────────────

export const DESTINATIONS: Record<DestinationId, {
  label: string
  requiresConnect: boolean
  connectLabel: string
  logo: string
}> = {
  download: { label: 'Download', requiresConnect: false, connectLabel: '', logo: '⬇' },
  email: { label: 'Email', requiresConnect: false, connectLabel: '', logo: '✉' },
  'google-sheets': { label: 'Google Sheets', requiresConnect: true, connectLabel: 'Connect Google', logo: 'G' },
  dropbox: { label: 'Dropbox', requiresConnect: true, connectLabel: 'Connect Dropbox', logo: '◫' },
  onedrive: { label: 'OneDrive', requiresConnect: true, connectLabel: 'Connect OneDrive', logo: '☁' },
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const KEYS = {
  history: 'spendwise-export-history',
  schedules: 'spendwise-schedules',
  connections: 'spendwise-connections',
  shareLinks: 'spendwise-share-links',
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) ?? '') } catch { return fallback }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadHistory(): ExportRecord[] { return load(KEYS.history, []) }
export function saveHistory(h: ExportRecord[]) { save(KEYS.history, h) }
export function addHistory(entry: Omit<ExportRecord, 'id'>) {
  const records = loadHistory()
  records.unshift({ ...entry, id: Date.now().toString(36) })
  saveHistory(records.slice(0, 50))
}

export function loadSchedules(): ScheduledExport[] { return load(KEYS.schedules, []) }
export function saveSchedules(s: ScheduledExport[]) { save(KEYS.schedules, s) }

export function loadConnections(): Connections { return load(KEYS.connections, {}) }
export function saveConnections(c: Connections) { save(KEYS.connections, c) }

export function loadShareLinks(): ShareLink[] { return load(KEYS.shareLinks, []) }
export function saveShareLinks(l: ShareLink[]) { save(KEYS.shareLinks, l) }

// ─── Schedule next-run calculator ────────────────────────────────────────────

export function nextRunLabel(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const hours = Math.round(diff / 3_600_000)
  if (hours < 1) return 'less than an hour'
  if (hours < 24) return `in ${hours}h`
  return `in ${Math.round(hours / 24)}d`
}

export function calcNextRun(freq: Frequency): string {
  const d = new Date()
  if (freq === 'daily') d.setDate(d.getDate() + 1)
  else if (freq === 'weekly') d.setDate(d.getDate() + 7)
  else d.setMonth(d.getMonth() + 1)
  return d.toISOString()
}

// ─── File generators ──────────────────────────────────────────────────────────

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function expensesToCSV(expenses: Expense[]): string {
  const rows = expenses.map((e) => [
    e.date, e.category, e.amount.toFixed(2), `"${e.description.replace(/"/g, '""')}"`,
  ])
  return ['Date,Category,Amount,Description', ...rows.map((r) => r.join(','))].join('\n')
}

function categoryAnalysisJSON(expenses: Expense[]): string {
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const analysis = CATEGORIES.map((cat) => {
    const items = expenses.filter((e) => e.category === cat)
    const catTotal = items.reduce((s, e) => s + e.amount, 0)
    return {
      category: cat,
      icon: CATEGORY_ICONS[cat],
      transactions: items.length,
      total: parseFloat(catTotal.toFixed(2)),
      percentage: total > 0 ? parseFloat(((catTotal / total) * 100).toFixed(1)) : 0,
    }
  }).sort((a, b) => b.total - a.total)
  return JSON.stringify({ generatedAt: new Date().toISOString(), summary: { total, count: expenses.length }, categories: analysis }, null, 2)
}

function taxReportCSV(expenses: Expense[]): string {
  const lines: string[] = ['Tax Year Expense Report', `Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, '']
  const byCategory = new Map<Category, Expense[]>()
  expenses.forEach((e) => byCategory.set(e.category, [...(byCategory.get(e.category) ?? []), e]))
  byCategory.forEach((items, cat) => {
    lines.push(`--- ${CATEGORY_ICONS[cat]} ${cat} ---`)
    lines.push('Date,Amount,Description')
    items.forEach((e) => lines.push(`${e.date},${e.amount.toFixed(2)},"${e.description.replace(/"/g, '""')}"`))
    const sub = items.reduce((s, e) => s + e.amount, 0)
    lines.push(`Subtotal,,${sub.toFixed(2)}`, '')
  })
  const grand = expenses.reduce((s, e) => s + e.amount, 0)
  lines.push(`GRAND TOTAL,,${grand.toFixed(2)}`)
  return lines.join('\n')
}

export function executeDownload(templateId: TemplateId, expenses: Expense[]) {
  const today = new Date().toISOString().split('T')[0]
  if (templateId === 'category-analysis') {
    triggerDownload(categoryAnalysisJSON(expenses), `category-analysis-${today}.json`, 'application/json')
  } else if (templateId === 'tax-report') {
    triggerDownload(taxReportCSV(expenses), `tax-report-${today}.csv`, 'text/csv')
  } else {
    triggerDownload(expensesToCSV(expenses), `${templateId}-${today}.csv`, 'text/csv')
  }
}

export function estimateFileSizeKb(templateId: TemplateId, expenses: Expense[]): number {
  const content = templateId === 'category-analysis'
    ? categoryAnalysisJSON(expenses)
    : templateId === 'tax-report'
    ? taxReportCSV(expenses)
    : expensesToCSV(expenses)
  return parseFloat((new Blob([content]).size / 1024).toFixed(1))
}

// ─── QR code grid generator ───────────────────────────────────────────────────

export function generateQRGrid(seed: string): boolean[][] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0

  const N = 25
  const g: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false))

  function finder(r0: number, c0: number) {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++)
        g[r0 + r][c0 + c] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)
  }
  finder(0, 0); finder(0, N - 7); finder(N - 7, 0)

  for (let i = 8; i < N - 8; i++) { g[6][i] = i % 2 === 0; g[i][6] = i % 2 === 0 }

  let s = h
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8)) continue
      if (r === 6 || c === 6) continue
      s = (s * 1664525 + 1013904223) | 0
      g[r][c] = (s >>> 16) % 2 === 0
    }
  }
  return g
}

// ─── Share token ──────────────────────────────────────────────────────────────

export function generateToken(): string {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}

export function fakeShareUrl(token: string): string {
  return `https://spendwise.app/share/${token}`
}
