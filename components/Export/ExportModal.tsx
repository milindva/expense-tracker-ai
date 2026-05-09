'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Expense, Category } from '@/lib/types'
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_STYLES, formatCurrency, formatDate } from '@/lib/utils'
import { ExportFormat, ExportConfig, filterExpenses, runExport } from '@/lib/exportEngine'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  expenses: Expense[]
}

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: string; desc: string }[] = [
  { id: 'csv', label: 'CSV', icon: '⊞', desc: 'Spreadsheet-ready, works in Excel & Sheets' },
  { id: 'json', label: 'JSON', icon: '{ }', desc: 'Structured data for developers & APIs' },
  { id: 'pdf', label: 'PDF', icon: '⎙', desc: 'Print-ready report with totals' },
]

const PREVIEW_LIMIT = 5

export default function ExportModal({ isOpen, onClose, expenses }: ExportModalProps) {
  const today = new Date().toISOString().split('T')[0]

  const [format, setFormat] = useState<ExportFormat>('csv')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState(today)
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [filename, setFilename] = useState(`expenses-${today}`)
  const [isExporting, setIsExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const config: ExportConfig = useMemo(() => ({
    format,
    startDate,
    endDate,
    categories: selectedCategories,
    filename,
  }), [format, startDate, endDate, selectedCategories, filename])

  const filtered = useMemo(() => filterExpenses(expenses, config), [expenses, config])

  const toggleCategory = useCallback((cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }, [])

  function handleExport() {
    setIsExporting(true)
    setExportDone(false)
    setTimeout(() => {
      runExport(filtered, config)
      setIsExporting(false)
      setExportDone(true)
      setTimeout(() => setExportDone(false), 2500)
    }, 600)
  }

  function handleReset() {
    setFormat('csv')
    setStartDate('')
    setEndDate(today)
    setSelectedCategories([])
    setFilename(`expenses-${today}`)
    setExportDone(false)
  }

  if (!isOpen) return null

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0)
  const previewRows = filtered.slice(0, PREVIEW_LIMIT)
  const overflowCount = filtered.length - PREVIEW_LIMIT

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Export Data</h2>
            <p className="text-xs text-slate-400 mt-0.5">Configure your export and preview the data</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left panel — configuration */}
          <div className="w-72 shrink-0 border-r border-slate-100 overflow-y-auto p-5 space-y-6">

            {/* Format */}
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Format</h3>
              <div className="space-y-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormat(opt.id)}
                    className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      format === opt.id
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-sm font-mono font-bold mt-0.5 ${format === opt.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {opt.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${format === opt.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Date range */}
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Date Range</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                  />
                </div>
              </div>
            </section>

            {/* Categories */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</h3>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-2">
                {selectedCategories.length === 0 ? 'All categories included' : `${selectedCategories.length} selected`}
              </p>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                        active
                          ? `${CATEGORY_STYLES[cat]} border-current`
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{CATEGORY_ICONS[cat]}</span>
                      <span className="flex-1 text-left">{cat}</span>
                      {active && (
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Filename */}
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Filename</h3>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value || `expenses-${today}`)}
                  className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
                <span className="text-xs text-slate-400 shrink-0">.{format}</span>
              </div>
            </section>
          </div>

          {/* Right panel — summary + preview */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Summary bar */}
            <div className="shrink-0 px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-slate-900">{filtered.length}</span>
                <span className="text-sm text-slate-400">of {expenses.length} records</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-xs text-slate-400">Total amount</p>
                <p className="text-sm font-semibold text-slate-700">{formatCurrency(totalAmount)}</p>
              </div>
              {selectedCategories.length > 0 && (
                <>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <p className="text-xs text-slate-400">Categories</p>
                    <div className="flex gap-1 mt-0.5">
                      {selectedCategories.map((c) => (
                        <span key={c} className="text-sm">{CATEGORY_ICONS[c]}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {filtered.length === 0 && (
                <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  No records match these filters
                </span>
              )}
            </div>

            {/* Preview table */}
            <div className="flex-1 overflow-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">No data to export</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting the date range or category filters</p>
                </div>
              ) : (
                <div>
                  <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Preview
                    </p>
                    <p className="text-xs text-slate-400">
                      Showing {Math.min(PREVIEW_LIMIT, filtered.length)} of {filtered.length}
                    </p>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/50">
                        <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500">Date</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Category</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500">Amount</th>
                        <th className="text-left px-3 py-2.5 pr-6 text-xs font-semibold text-slate-500">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRows.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{formatDate(e.date)}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[e.category]}`}>
                              {CATEGORY_ICONS[e.category]} {e.category}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                            {formatCurrency(e.amount)}
                          </td>
                          <td className="px-3 py-3 pr-6 text-slate-500 max-w-[180px] truncate">{e.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {overflowCount > 0 && (
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-xs text-slate-400 text-center">
                        + {overflowCount} more record{overflowCount !== 1 ? 's' : ''} not shown in preview
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer — export action */}
            <div className="shrink-0 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                {filtered.length > 0
                  ? `${filename}.${format} · ${filtered.length} record${filtered.length !== 1 ? 's' : ''} · ${formatCurrency(totalAmount)}`
                  : 'No records selected'}
              </p>
              <button
                onClick={handleExport}
                disabled={isExporting || filtered.length === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  exportDone
                    ? 'bg-green-500 text-white'
                    : filtered.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {isExporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Exporting…
                  </>
                ) : exportDone ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Exported!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export {format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
