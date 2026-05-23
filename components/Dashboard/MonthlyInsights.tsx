'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Expense, CategorySummary } from '@/lib/types'
import { CATEGORY_COLORS, CATEGORY_ICONS, formatCurrency } from '@/lib/utils'

interface MonthlyInsightsProps {
  expenses: Expense[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: CategorySummary }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <span className="font-semibold text-slate-900">{CATEGORY_ICONS[d.category]} {d.category}</span>
      <p className="text-slate-500 text-xs mt-0.5">{formatCurrency(d.total)} · {d.percentage.toFixed(1)}%</p>
    </div>
  )
}

function computeBudgetStreak(expenses: Expense[]): number {
  const now = new Date()
  const dayOfMonth = now.getDate()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey))
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
  const dailyAvg = dayOfMonth > 0 ? monthTotal / dayOfMonth : 0

  if (dailyAvg === 0) return 0

  let streak = 0
  for (let i = 0; i < dayOfMonth; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayTotal = monthExpenses
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0)
    if (dayTotal <= dailyAvg) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export default function MonthlyInsights({ expenses }: MonthlyInsightsProps) {
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey))
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0)

  const categoryMap = new Map<string, number>()
  monthExpenses.forEach((e) => {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + e.amount)
  })

  const chartData: CategorySummary[] = Array.from(categoryMap.entries())
    .map(([category, total]) => ({
      category: category as CategorySummary['category'],
      total,
      count: monthExpenses.filter((e) => e.category === category).length,
      percentage: monthTotal > 0 ? (total / monthTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  const top3 = chartData.slice(0, 3)
  const budgetStreak = computeBudgetStreak(expenses)

  if (monthExpenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Monthly Insights</h2>
        <p className="text-xs text-slate-400 mb-6">{monthName}</p>
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No expenses this month
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Monthly Insights</h2>
      <p className="text-xs text-slate-400 mb-4">{monthName}</p>

      {/* Donut chart */}
      <div className="relative mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={2}
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
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-medium text-slate-500">Spending</span>
        </div>
      </div>

      {/* Top 3 categories */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Top categories</p>
        <div className="space-y-2">
          {top3.map((d) => (
            <div key={d.category} className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
              />
              <span className="text-sm text-slate-700 flex-1">
                {CATEGORY_ICONS[d.category]} {d.category}
              </span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(d.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Streak */}
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Budget Streak</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-3xl font-bold text-emerald-500">{budgetStreak}</span>
            <span className="text-sm text-slate-500">days!</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-6 rounded-sm ${i < Math.min(budgetStreak, 5) ? 'bg-emerald-400' : 'bg-slate-100'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
