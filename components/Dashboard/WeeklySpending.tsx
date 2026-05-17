'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DailyData } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface WeeklySpendingProps {
  data: DailyData[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-sm">
      <p className="font-semibold text-slate-900 mb-0.5">{label}</p>
      <p className="text-indigo-600">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function WeeklySpending({ data }: WeeklySpendingProps) {
  const hasData = data.some((d) => d.total > 0)
  const maxTotal = hasData ? Math.max(...data.map((d) => d.total)) : 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-2">Weekly Spending</h2>
      <p className="text-xs text-slate-400 mb-4">Last 7 days</p>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No data to display
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
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
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#weeklyGradient)"
              dot={(props) => {
                const { cx, cy, payload } = props as { cx: number; cy: number; payload: DailyData }
                const isPeak = payload.total === maxTotal && maxTotal > 0
                if (!isPeak) return <g key={`dot-${payload.date}`} />
                return (
                  <circle
                    key={`dot-${payload.date}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#6366f1"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                )
              }}
              activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
