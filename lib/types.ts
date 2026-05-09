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
