export type Category = 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other'

export interface Expense {
  id: string
  date: string
  amount: number
  category: Category
  description: string
  createdAt: string
}

export interface ExpenseFilters {
  search: string
  category: Category | 'All'
  startDate: string
  endDate: string
}

export interface CategorySummary {
  category: Category
  total: number
  count: number
  percentage: number
}

export interface MonthlyData {
  month: string
  total: number
}

export interface DailyData {
  day: string
  date: string
  total: number
}

export interface ComparisonData {
  category: string
  thisMonth: number
  lastMonth: number
}

export interface Insight {
  text: string
  icon: string
  type: 'positive' | 'negative' | 'neutral'
}
