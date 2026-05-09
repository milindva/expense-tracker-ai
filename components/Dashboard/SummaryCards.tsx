import { formatCurrency } from '@/lib/utils'

interface Stats {
  totalAmount: number
  thisMonthTotal: number
  thisWeekTotal: number
  avgTransaction: number
  count: number
}

interface SummaryCardsProps {
  stats: Stats
}

interface CardProps {
  label: string
  value: string
  subtext?: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

function Card({ label, value, subtext, icon, color, bgColor }: CardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
        <div className={color}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  )
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  const now = new Date()
  const monthName = now.toLocaleDateString('en-US', { month: 'long' })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card
        label="Total Spending"
        value={formatCurrency(stats.totalAmount)}
        subtext={`${stats.count} transactions`}
        color="text-indigo-600"
        bgColor="bg-indigo-50"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <Card
        label={`${monthName} Spending`}
        value={formatCurrency(stats.thisMonthTotal)}
        subtext="This month"
        color="text-emerald-600"
        bgColor="bg-emerald-50"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
      <Card
        label="This Week"
        value={formatCurrency(stats.thisWeekTotal)}
        subtext="Sun–Sat"
        color="text-amber-600"
        bgColor="bg-amber-50"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />
      <Card
        label="Avg. Transaction"
        value={formatCurrency(stats.avgTransaction)}
        subtext="Per expense"
        color="text-violet-600"
        bgColor="bg-violet-50"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  )
}
