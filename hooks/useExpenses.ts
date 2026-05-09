'use client'

import { useState, useEffect, useCallback } from 'react'
import { Expense, Category, ExpenseFilters } from '@/lib/types'
import { loadExpenses, saveExpenses } from '@/lib/storage'
import { generateId } from '@/lib/utils'

const defaultFilters: ExpenseFilters = {
  search: '',
  category: 'All',
  startDate: '',
  endDate: '',
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setExpenses(loadExpenses())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      saveExpenses(expenses)
    }
  }, [expenses, isLoaded])

  const addExpense = useCallback((data: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setExpenses((prev) => [newExpense, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
  }, [])

  const updateExpense = useCallback((id: string, data: Omit<Expense, 'id' | 'createdAt'>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e)).sort((a, b) => b.date.localeCompare(a.date))
    )
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const filteredExpenses = expenses.filter((expense) => {
    if (
      filters.search &&
      !expense.description.toLowerCase().includes(filters.search.toLowerCase()) &&
      !expense.category.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }
    if (filters.category !== 'All' && expense.category !== filters.category) {
      return false
    }
    if (filters.startDate && expense.date < filters.startDate) {
      return false
    }
    if (filters.endDate && expense.date > filters.endDate) {
      return false
    }
    return true
  })

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

  const thisMonthTotal = (() => {
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return expenses.filter((e) => e.date.startsWith(monthKey)).reduce((sum, e) => sum + e.amount, 0)
  })()

  const thisWeekTotal = (() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - dayOfWeek)
    start.setHours(0, 0, 0, 0)
    const startStr = start.toISOString().split('T')[0]
    return expenses.filter((e) => e.date >= startStr).reduce((sum, e) => sum + e.amount, 0)
  })()

  const avgTransaction =
    expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0

  return {
    expenses,
    filteredExpenses,
    filters,
    setFilters,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoaded,
    stats: {
      totalAmount,
      thisMonthTotal,
      thisWeekTotal,
      avgTransaction,
      count: expenses.length,
    },
  }
}
