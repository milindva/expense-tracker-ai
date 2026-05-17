import { Category, CategorySummary, ComparisonData, DailyData, Expense, Insight, MonthlyData } from './types'

export const CATEGORIES: Category[] = [
  'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other',
]

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f97316',
  Transportation: '#3b82f6',
  Entertainment: '#8b5cf6',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Other: '#6b7280',
}

export const CATEGORY_STYLES: Record<Category, string> = {
  Food: 'bg-orange-100 text-orange-700 border-orange-200',
  Transportation: 'bg-blue-100 text-blue-700 border-blue-200',
  Entertainment: 'bg-purple-100 text-purple-700 border-purple-200',
  Shopping: 'bg-pink-100 text-pink-700 border-pink-200',
  Bills: 'bg-red-100 text-red-700 border-red-200',
  Other: 'bg-gray-100 text-gray-700 border-gray-200',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: '🍔',
  Transportation: '🚗',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '📦',
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export function getCategoryTotals(expenses: Expense[]): CategorySummary[] {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const categoryMap = new Map<Category, { total: number; count: number }>()

  expenses.forEach((expense) => {
    const existing = categoryMap.get(expense.category) || { total: 0, count: 0 }
    categoryMap.set(expense.category, {
      total: existing.total + expense.amount,
      count: existing.count + 1,
    })
  })

  return CATEGORIES.map((category) => {
    const data = categoryMap.get(category) || { total: 0, count: 0 }
    return {
      category,
      total: data.total,
      count: data.count,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
    }
  }).sort((a, b) => b.total - a.total)
}

export function getMonthlyData(expenses: Expense[], months: number = 6): MonthlyData[] {
  const result: MonthlyData[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

    const total = expenses
      .filter((e) => e.date.startsWith(monthKey))
      .reduce((sum, e) => sum + e.amount, 0)

    result.push({ month: monthLabel, total })
  }

  return result
}

export function getDailyData(expenses: Expense[], days: number = 7): DailyData[] {
  const result: DailyData[] = []
  const now = new Date()
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayName = DAY_NAMES[d.getDay()]
    const total = expenses
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0)
    result.push({ day: dayName, date: dateStr, total })
  }

  return result
}

export function getComparisonData(expenses: Expense[]): ComparisonData[] {
  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  const thisMonthMap = new Map<Category, number>()
  const lastMonthMap = new Map<Category, number>()

  expenses.forEach((e) => {
    if (e.date.startsWith(thisMonthKey)) {
      thisMonthMap.set(e.category, (thisMonthMap.get(e.category) ?? 0) + e.amount)
    } else if (e.date.startsWith(lastMonthKey)) {
      lastMonthMap.set(e.category, (lastMonthMap.get(e.category) ?? 0) + e.amount)
    }
  })

  return CATEGORIES
    .map((category) => ({
      category,
      thisMonth: thisMonthMap.get(category) ?? 0,
      lastMonth: lastMonthMap.get(category) ?? 0,
    }))
    .filter((d) => d.thisMonth > 0 || d.lastMonth > 0)
}

export function getTopExpenses(expenses: Expense[], count: number = 5): Expense[] {
  return [...expenses].sort((a, b) => b.amount - a.amount).slice(0, count)
}

export function generateInsights(
  expenses: Expense[],
  stats: { thisWeekTotal: number; thisMonthTotal: number }
): Insight[] {
  const insights: Insight[] = []
  const now = new Date()

  const dayOfWeek = now.getDay()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekExpenses = expenses.filter((e) => e.date >= weekStartStr)

  if (weekExpenses.length > 0) {
    const catMap = new Map<Category, number>()
    weekExpenses.forEach((e) => {
      catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.amount)
    })
    const [topCat, topAmount] = [...catMap.entries()].sort((a, b) => b[1] - a[1])[0]
    insights.push({
      icon: CATEGORY_ICONS[topCat as Category],
      text: `${topCat} was your biggest spend this week at ${formatCurrency(topAmount)}`,
      type: 'neutral',
    })
  }

  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(weekStart.getDate() - 7)
  const prevWeekEnd = new Date(weekStart)
  prevWeekEnd.setDate(weekStart.getDate() - 1)
  const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0]
  const prevWeekEndStr = prevWeekEnd.toISOString().split('T')[0]
  const lastWeekTotal = expenses
    .filter((e) => e.date >= prevWeekStartStr && e.date <= prevWeekEndStr)
    .reduce((sum, e) => sum + e.amount, 0)

  if (lastWeekTotal > 0 && stats.thisWeekTotal > 0) {
    const pct = Math.round(((stats.thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
    const more = pct >= 0
    insights.push({
      icon: more ? '📈' : '📉',
      text: `You spent ${Math.abs(pct)}% ${more ? 'more' : 'less'} this week vs last week`,
      type: more ? 'negative' : 'positive',
    })
  }

  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey))
  if (monthExpenses.length > 0) {
    const biggest = monthExpenses.reduce((max, e) => (e.amount > max.amount ? e : max))
    insights.push({
      icon: '💸',
      text: `Biggest expense this month: "${biggest.description}" at ${formatCurrency(biggest.amount)}`,
      type: 'neutral',
    })
  }

  const dayOfMonth = now.getDate()
  if (dayOfMonth > 0 && stats.thisMonthTotal > 0) {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const projected = Math.round((stats.thisMonthTotal / dayOfMonth) * daysInMonth)
    insights.push({
      icon: '📊',
      text: `On track to spend ~${formatCurrency(projected)} this month based on your daily average`,
      type: 'neutral',
    })
  }

  return insights
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Amount', 'Category', 'Description']
  const rows = expenses.map((e) => [
    e.date,
    e.amount.toFixed(2),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - dayOfWeek)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}
