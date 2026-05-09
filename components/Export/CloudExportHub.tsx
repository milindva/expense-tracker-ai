'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Expense } from '@/lib/types'
import {
  TemplateId, DestinationId, Frequency,
  ExportRecord, ScheduledExport, ShareLink, Connections,
  TEMPLATES, DESTINATIONS,
  loadHistory, saveHistory, loadSchedules, saveSchedules,
  loadConnections, saveConnections, loadShareLinks, saveShareLinks,
  addHistory, executeDownload, estimateFileSizeKb,
  calcNextRun, nextRunLabel, generateQRGrid, generateToken, fakeShareUrl,
} from '@/lib/cloudExport'
import { formatCurrency } from '@/lib/utils'

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = 'export' | 'schedule' | 'history' | 'share'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'export', label: 'Export', icon: '↑' },
  { id: 'schedule', label: 'Schedule', icon: '⏱' },
  { id: 'history', label: 'History', icon: '◷' },
  { id: 'share', label: 'Share', icon: '⤡' },
]

// ─── QR Code ──────────────────────────────────────────────────────────────────

function QRCode({ token }: { token: string }) {
  const grid = useMemo(() => generateQRGrid(token), [token])
  const mod = 7
  const pad = 8
  const size = 25 * mod + pad * 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" />
      {grid.flatMap((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={pad + c * mod} y={pad + r * mod} width={mod - 1} height={mod - 1} rx={0.5} fill="#1e293b" /> : null
        )
      )}
    </svg>
  )
}

// ─── Connection pill ──────────────────────────────────────────────────────────

function ConnectionPill({ connected, connecting, onConnect }: { connected: boolean; connecting: boolean; onConnect: () => void }) {
  if (connected) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
      Connected
    </span>
  )
  return (
    <button onClick={onConnect} disabled={connecting} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
      {connecting ? 'Connecting…' : 'Connect ↗'}
    </button>
  )
}

// ─── Export Tab ───────────────────────────────────────────────────────────────

function ExportTab({ expenses, connections, onConnect, onExported }: {
  expenses: Expense[]
  connections: Connections
  onConnect: (d: DestinationId) => void
  onExported: (r: Omit<ExportRecord, 'id'>) => void
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null)
  const [selectedDest, setSelectedDest] = useState<DestinationId>('download')
  const [emailInput, setEmailInput] = useState('')
  const [connectingDest, setConnectingDest] = useState<DestinationId | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')

  const templateData = selectedTemplate ? TEMPLATES[selectedTemplate] : null
  const filtered = useMemo(
    () => (selectedTemplate ? TEMPLATES[selectedTemplate].filter(expenses) : []),
    [selectedTemplate, expenses]
  )

  function handleConnect(dest: DestinationId) {
    setConnectingDest(dest)
    setTimeout(() => { onConnect(dest); setConnectingDest(null) }, 1600)
  }

  function handleExport() {
    if (!selectedTemplate) return
    setStatus('running')
    setTimeout(() => {
      if (selectedDest === 'download') executeDownload(selectedTemplate, filtered)
      const sizeKb = estimateFileSizeKb(selectedTemplate, filtered)
      onExported({
        templateId: selectedTemplate,
        destination: selectedDest,
        timestamp: new Date().toISOString(),
        recordCount: filtered.length,
        fileSizeKb: sizeKb,
        ...(selectedDest === 'email' ? { emailAddress: emailInput } : {}),
      })
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2800)
    }, 1400)
  }

  const canExport =
    selectedTemplate !== null &&
    filtered.length > 0 &&
    (selectedDest !== 'email' || emailInput.includes('@')) &&
    (!DESTINATIONS[selectedDest].requiresConnect || connections[selectedDest])

  return (
    <div className="p-5 space-y-6">
      {/* Templates */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Choose Template</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(TEMPLATES) as [TemplateId, typeof TEMPLATES[TemplateId]][]).map(([id, t]) => {
            const count = t.filter(expenses).length
            const active = selectedTemplate === id
            return (
              <button
                key={id}
                onClick={() => { setSelectedTemplate(id); setStatus('idle') }}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  active ? `border-indigo-500 bg-indigo-50` : `border-slate-200 hover:border-slate-300 bg-white`
                }`}
              >
                <div className="text-xl mb-1">{t.icon}</div>
                <p className={`text-xs font-semibold ${active ? 'text-indigo-700' : 'text-slate-700'}`}>{t.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.tagline}</p>
                <p className={`text-xs font-medium mt-1.5 ${active ? 'text-indigo-500' : 'text-slate-400'}`}>{count} records</p>
              </button>
            )
          })}
        </div>
        {templateData && (
          <div className={`mt-2 px-3 py-2.5 rounded-xl border text-xs ${templateData.bg} ${templateData.color}`}>
            {templateData.description}
          </div>
        )}
      </div>

      {/* Destination */}
      {selectedTemplate && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Send To</p>
          <div className="space-y-1.5">
            {(Object.entries(DESTINATIONS) as [DestinationId, typeof DESTINATIONS[DestinationId]][]).map(([id, d]) => {
              const needsConnect = d.requiresConnect && !connections[id]
              const isConnecting = connectingDest === id
              return (
                <label
                  key={id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedDest === id ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
                  } ${needsConnect ? 'opacity-70' : ''}`}
                >
                  <input
                    type="radio"
                    name="dest"
                    value={id}
                    checked={selectedDest === id}
                    onChange={() => setSelectedDest(id)}
                    className="accent-indigo-600"
                  />
                  <span className="text-base w-5 text-center font-mono">{d.logo}</span>
                  <span className="flex-1 text-sm font-medium text-slate-700">{d.label}</span>
                  {d.requiresConnect && (
                    <ConnectionPill
                      connected={!!connections[id]}
                      connecting={isConnecting}
                      onConnect={() => handleConnect(id)}
                    />
                  )}
                </label>
              )
            })}
          </div>

          {selectedDest === 'email' && (
            <input
              type="email"
              placeholder="recipient@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="mt-2 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          )}
          {selectedDest === 'google-sheets' && connections['google-sheets'] && (
            <p className="mt-2 text-xs text-slate-400 px-1">
              Will sync to a new sheet in your connected Google Drive account.
            </p>
          )}
        </div>
      )}

      {/* Export CTA */}
      {selectedTemplate && (
        <div className="pt-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              This template has no records to export.
            </p>
          ) : (
            <button
              onClick={handleExport}
              disabled={!canExport || status === 'running'}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                status === 'done'
                  ? 'bg-emerald-500 text-white'
                  : !canExport
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {status === 'running' ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Processing…</>
              ) : status === 'done' ? (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {selectedDest === 'email' ? `Sent to ${emailInput}` : selectedDest === 'download' ? 'Downloaded!' : 'Synced!'}</>
              ) : (
                <>Export {filtered.length} records · {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────

function ScheduleTab({ connections, onConnect }: { connections: Connections; onConnect: (d: DestinationId) => void }) {
  const [schedules, setSchedules] = useState<ScheduledExport[]>([])
  const [form, setForm] = useState<{ template: TemplateId; dest: DestinationId; freq: Frequency }>({
    template: 'monthly-summary', dest: 'download', freq: 'monthly',
  })
  const [adding, setAdding] = useState(false)

  useEffect(() => { setSchedules(loadSchedules()) }, [])

  function addSchedule() {
    const s: ScheduledExport = {
      id: Date.now().toString(36),
      templateId: form.template,
      destination: form.dest,
      frequency: form.freq,
      nextRun: calcNextRun(form.freq),
      enabled: true,
    }
    const next = [s, ...schedules]
    setSchedules(next)
    saveSchedules(next)
    setAdding(false)
  }

  function toggleSchedule(id: string) {
    const next = schedules.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s)
    setSchedules(next)
    saveSchedules(next)
  }

  function deleteSchedule(id: string) {
    const next = schedules.filter((s) => s.id !== id)
    setSchedules(next)
    saveSchedules(next)
  }

  return (
    <div className="p-5 space-y-5">
      {/* Active schedules */}
      {schedules.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Active Schedules</p>
          <div className="space-y-2">
            {schedules.map((s) => {
              const t = TEMPLATES[s.templateId]
              const d = DESTINATIONS[s.destination]
              return (
                <div key={s.id} className={`flex items-center gap-3 px-3 py-3 rounded-xl border ${s.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                  <span className="text-lg">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.label}</p>
                    <p className="text-xs text-slate-400">
                      {s.frequency.charAt(0).toUpperCase() + s.frequency.slice(1)} · {d.label} · next {nextRunLabel(s.nextRun)}
                    </p>
                  </div>
                  <button onClick={() => toggleSchedule(s.id)} className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${s.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${s.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <button onClick={() => deleteSchedule(s.id)} className="text-slate-300 hover:text-slate-500 transition-colors text-lg leading-none">×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add schedule */}
      {adding ? (
        <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-700">New Schedule</p>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Template</label>
            <select value={form.template} onChange={(e) => setForm((f) => ({ ...f, template: e.target.value as TemplateId }))} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {(Object.entries(TEMPLATES) as [TemplateId, typeof TEMPLATES[TemplateId]][]).map(([id, t]) => (
                <option key={id} value={id}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Destination</label>
            <select value={form.dest} onChange={(e) => setForm((f) => ({ ...f, dest: e.target.value as DestinationId }))} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {(Object.entries(DESTINATIONS) as [DestinationId, typeof DESTINATIONS[DestinationId]][]).map(([id, d]) => (
                <option key={id} value={id} disabled={d.requiresConnect && !connections[id]}>{d.logo} {d.label}{d.requiresConnect && !connections[id] ? ' (not connected)' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Frequency</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['daily', 'weekly', 'monthly'] as Frequency[]).map((f) => (
                <button key={f} onClick={() => setForm((prev) => ({ ...prev, freq: f }))} className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${form.freq === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={addSchedule} className="flex-1 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Save Schedule</button>
            <button onClick={() => setAdding(false)} className="px-3 py-2 text-slate-500 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-400 text-sm font-medium rounded-xl hover:border-indigo-300 hover:text-indigo-500 transition-colors">
          + Add schedule
        </button>
      )}

      {schedules.length === 0 && !adding && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">⏱</p>
          <p className="text-sm font-medium text-slate-600">No schedules yet</p>
          <p className="text-xs text-slate-400 mt-1">Automate recurring exports to your inbox or cloud storage.</p>
        </div>
      )}
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab({ expenses, onReExport }: { expenses: Expense[]; onReExport: () => void }) {
  const [history, setHistory] = useState<ExportRecord[]>([])

  useEffect(() => { setHistory(loadHistory()) }, [])

  function clearHistory() { setHistory([]); saveHistory([]) }

  const destEmoji: Record<DestinationId, string> = {
    download: '⬇', email: '✉', 'google-sheets': 'G', dropbox: '◫', onedrive: '☁',
  }

  function timeAgo(iso: string): string {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (secs < 60) return 'just now'
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
    return `${Math.floor(secs / 86400)}d ago`
  }

  if (history.length === 0) return (
    <div className="p-5 text-center py-16">
      <p className="text-3xl mb-2">◷</p>
      <p className="text-sm font-medium text-slate-600">No export history yet</p>
      <p className="text-xs text-slate-400 mt-1">Your exports will appear here.</p>
    </div>
  )

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{history.length} exports</p>
        <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Clear all</button>
      </div>
      <div className="space-y-2">
        {history.map((r) => {
          const t = TEMPLATES[r.templateId]
          return (
            <div key={r.id} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors group">
              <span className="text-xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{t.label}</p>
                <p className="text-xs text-slate-400">
                  {destEmoji[r.destination]} {DESTINATIONS[r.destination].label}
                  {r.emailAddress ? ` → ${r.emailAddress}` : ''} · {r.recordCount} records · {r.fileSizeKb} KB
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400">{timeAgo(r.timestamp)}</p>
                <button
                  onClick={() => { executeDownload(r.templateId, TEMPLATES[r.templateId].filter(expenses)); onReExport() }}
                  className="text-xs text-indigo-500 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                >
                  Re-export ↓
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Share Tab ────────────────────────────────────────────────────────────────

function ShareTab({ expenses }: { expenses: Expense[] }) {
  const [links, setLinks] = useState<ShareLink[]>([])
  const [expiry, setExpiry] = useState<'1d' | '7d' | '30d' | 'never'>('7d')
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [qrToken, setQrToken] = useState<string | null>(null)

  useEffect(() => { setLinks(loadShareLinks()) }, [])

  function expiryDate(key: typeof expiry): string | null {
    if (key === 'never') return null
    const d = new Date()
    const days = key === '1d' ? 1 : key === '7d' ? 7 : 30
    d.setDate(d.getDate() + days)
    return d.toISOString()
  }

  function expiryLabel(iso: string | null): string {
    if (!iso) return 'Never expires'
    const diff = new Date(iso).getTime() - Date.now()
    if (diff < 0) return 'Expired'
    const days = Math.ceil(diff / 86_400_000)
    return `Expires in ${days}d`
  }

  function generate() {
    setGenerating(true)
    setTimeout(() => {
      const token = generateToken()
      const link: ShareLink = {
        id: Date.now().toString(36),
        token,
        createdAt: new Date().toISOString(),
        expiresAt: expiryDate(expiry),
        views: 0,
      }
      const next = [link, ...links]
      setLinks(next)
      saveShareLinks(next)
      setGenerating(false)
      setQrToken(token)
    }, 1000)
  }

  function copyLink(token: string, id: string) {
    navigator.clipboard.writeText(fakeShareUrl(token))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function revokeLink(id: string) {
    const next = links.filter((l) => l.id !== id)
    setLinks(next)
    saveShareLinks(next)
    if (qrToken && links.find((l) => l.id === id)?.token === qrToken) setQrToken(null)
  }

  const totalValue = formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))

  return (
    <div className="p-5 space-y-5">
      {/* Generate new link */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-indigo-900">Generate Share Link</p>
          <p className="text-xs text-indigo-600 mt-0.5">Share read-only access to {expenses.length} expenses ({totalValue})</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-2">Link expires</p>
          <div className="grid grid-cols-4 gap-1">
            {(['1d', '7d', '30d', 'never'] as const).map((e) => (
              <button key={e} onClick={() => setExpiry(e)} className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${expiry === e ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {e === 'never' ? '∞' : e}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {generating ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Generating…</>
          ) : 'Generate link + QR code'}
        </button>
      </div>

      {/* QR viewer */}
      {qrToken && (
        <div className="border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">QR Code</p>
          <div className="flex items-start gap-4">
            <QRCode token={qrToken} />
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-xs font-mono break-all text-slate-600 bg-slate-50 rounded-lg px-2 py-1.5">{fakeShareUrl(qrToken)}</p>
              <p className="text-xs text-slate-400">Scan or share the URL above. Anyone with this link can view a read-only snapshot of your expenses.</p>
            </div>
          </div>
        </div>
      )}

      {/* Active links */}
      {links.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Active Links</p>
          <div className="space-y-2">
            {links.map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-100 bg-white group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-slate-700 truncate">/share/{l.token}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{expiryLabel(l.expiresAt)} · {l.views} views</p>
                </div>
                <button onClick={() => setQrToken(l.token)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">QR</button>
                <button
                  onClick={() => copyLink(l.token, l.id)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${copiedId === l.id ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  {copiedId === l.id ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => revokeLink(l.id)} className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Hub shell ────────────────────────────────────────────────────────────────

interface CloudExportHubProps {
  isOpen: boolean
  onClose: () => void
  expenses: Expense[]
}

export default function CloudExportHub({ isOpen, onClose, expenses }: CloudExportHubProps) {
  const [tab, setTab] = useState<Tab>('export')
  const [connections, setConnections] = useState<Connections>({})
  const [historyKey, setHistoryKey] = useState(0)

  useEffect(() => { setConnections(loadConnections()) }, [])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [isOpen, onClose])

  const handleConnect = useCallback((dest: DestinationId) => {
    const next = { ...connections, [dest]: true }
    setConnections(next)
    saveConnections(next)
  }, [connections])

  const handleExported = useCallback((entry: Omit<ExportRecord, 'id'>) => {
    addHistory(entry)
    setHistoryKey((k) => k + 1)
  }, [])

  const historyCount = useMemo(() => loadHistory().length, [historyKey])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 pt-5 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">↑</span>
                </div>
                <h2 className="text-white font-bold text-base">Export Hub</h2>
              </div>
              <p className="text-indigo-200 text-xs">Connect · Automate · Share</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
                  tab === t.id
                    ? 'bg-white text-indigo-700'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-xs">{t.icon}</span>
                {t.label}
                {t.id === 'history' && historyCount > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'bg-white/20 text-white'}`}>
                    {historyCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'export' && (
            <ExportTab expenses={expenses} connections={connections} onConnect={handleConnect} onExported={handleExported} />
          )}
          {tab === 'schedule' && (
            <ScheduleTab connections={connections} onConnect={handleConnect} />
          )}
          {tab === 'history' && (
            <HistoryTab key={historyKey} expenses={expenses} onReExport={() => setHistoryKey((k) => k + 1)} />
          )}
          {tab === 'share' && (
            <ShareTab expenses={expenses} />
          )}
        </div>
      </div>
    </>
  )
}
