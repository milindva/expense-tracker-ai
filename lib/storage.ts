import { Expense } from './types'
import { generateId } from './utils'

const STORAGE_KEY = 'expense-tracker-data'

function getSampleExpenses(): Expense[] {
  const today = new Date()
  const fmt = (offset: number) => {
    const d = new Date(today)
    d.setDate(today.getDate() - offset)
    return d.toISOString().split('T')[0]
  }

  return [
    { id: generateId(), date: fmt(0), amount: 67.50, category: 'Food', description: 'Weekly groceries at Whole Foods', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(1), amount: 14.99, category: 'Entertainment', description: 'Netflix subscription', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(1), amount: 32.00, category: 'Transportation', description: 'Uber to downtown', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(2), amount: 145.00, category: 'Shopping', description: 'New running shoes', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(3), amount: 89.99, category: 'Bills', description: 'Electric bill', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(4), amount: 24.50, category: 'Food', description: 'Lunch with coworkers', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(5), amount: 9.99, category: 'Entertainment', description: 'Spotify Premium', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(6), amount: 55.00, category: 'Bills', description: 'Internet bill', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(8), amount: 18.75, category: 'Food', description: 'Coffee shop — remote work session', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(10), amount: 120.00, category: 'Shopping', description: 'Winter jacket', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(12), amount: 45.00, category: 'Transportation', description: 'Monthly bus pass', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(14), amount: 75.00, category: 'Entertainment', description: 'Concert tickets', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(20), amount: 210.00, category: 'Bills', description: 'Phone bill', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(25), amount: 38.50, category: 'Food', description: 'Dinner at Italian restaurant', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(30), amount: 299.00, category: 'Shopping', description: 'Headphones', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(35), amount: 62.00, category: 'Food', description: 'Grocery run', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(40), amount: 25.00, category: 'Transportation', description: 'Parking', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(45), amount: 15.00, category: 'Other', description: 'Haircut tip', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(50), amount: 500.00, category: 'Bills', description: 'Rent partial', createdAt: new Date().toISOString() },
    { id: generateId(), date: fmt(55), amount: 42.00, category: 'Food', description: 'Farmers market', createdAt: new Date().toISOString() },
  ]
}

export function loadExpenses(): Expense[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data) as Expense[]
    }
    const sample = getSampleExpenses()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample))
    return sample
  } catch {
    return []
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
  } catch {
    // localStorage might be full or unavailable
  }
}
