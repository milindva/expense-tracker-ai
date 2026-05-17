'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CategorySummary } from '@/lib/types'
import { CATEGORY_COLORS, CATEGORY_ICONS, formatCurrency } from '@/lib/utils'

interface SpendingChartProps {
  data: CategorySummary[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: CategorySummary }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span>{CATEGORY_ICONS[d.category]}</span>
        <span className="font-semibold text-slate-900">{d.category}</span>
      </div>
      <p className="text-slate-600">{formatCurrency(d.total)}</p>
      <p className="text-slate-400 text-xs">{d.percentage.toFixed(1)}% of total</p>
    </div>
  )
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const chartData = data.filter((d) => d.total > 0)

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Spending by Category</h2>
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No data to display
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-2">Spending by Category</h2>
      <p className="text-xs text-slate-400 mb-4">All-time breakdown</p>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="total"
            nameKey="category"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {chartData.slice(0, 4).map((d) => (
          <div key={d.category} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-slate-700">{d.category}</span>
                <span className="text-xs text-slate-500">{formatCurrency(d.total)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${d.percentage}%`,
                    backgroundColor: CATEGORY_COLORS[d.category],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
