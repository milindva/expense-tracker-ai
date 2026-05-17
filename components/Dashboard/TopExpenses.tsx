'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Expense } from '@/lib/types'
import { CATEGORY_COLORS, CATEGORY_ICONS, formatCurrency } from '@/lib/utils'

interface TopExpensesProps {
  data: Expense[]
}

interface ChartItem {
  name: string
  amount: number
  category: string
  icon: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: ChartItem }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-sm">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span>{d.icon}</span>
        <span className="font-semibold text-slate-900">{d.name}</span>
      </div>
      <p className="text-indigo-600">{formatCurrency(d.amount)}</p>
    </div>
  )
}

export default function TopExpenses({ data }: TopExpensesProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Top Expenses</h2>
        <p className="text-xs text-slate-400 mb-4">Your 5 largest transactions</p>
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No data to display
        </div>
      </div>
    )
  }

  const chartData: ChartItem[] = data.map((e) => ({
    name: e.description.length > 20 ? e.description.slice(0, 18) + '…' : e.description,
    amount: e.amount,
    category: e.category,
    icon: CATEGORY_ICONS[e.category],
  }))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-2">Top Expenses</h2>
      <p className="text-xs text-slate-400 mb-4">Your 5 largest transactions</p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          barSize={14}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
