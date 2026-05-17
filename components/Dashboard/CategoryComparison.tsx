'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ComparisonData } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface CategoryComparisonProps {
  data: ComparisonData[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-sm">
      <p className="font-semibold text-slate-900 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500 text-xs">{p.name}:</span>
          <span className="font-medium text-slate-800">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function CategoryComparison({ data }: CategoryComparisonProps) {
  const hasData = data.length > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-2">Category Comparison</h2>
      <p className="text-xs text-slate-400 mb-4">This month vs last month</p>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No data to display
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={10} barGap={2}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }}
            />
            <Bar dataKey="thisMonth" name="This Month" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lastMonth" name="Last Month" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
