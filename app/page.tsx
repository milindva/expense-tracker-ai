'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useExpenses } from '@/hooks/useExpenses'
import { getCategoryTotals, getMonthlyData } from '@/lib/utils'
import { Expense } from '@/lib/types'
import Navigation from '@/components/Navigation'
import SummaryCards from '@/components/Dashboard/SummaryCards'
import RecentExpenses from '@/components/Dashboard/RecentExpenses'
import ExpenseForm from '@/components/Expenses/ExpenseForm'
import { ToastContainer, useToast } from '@/components/ui/Toast'

const SpendingChart = dynamic(() => import('@/components/Dashboard/SpendingChart'), { ssr: false })
const MonthlyTrend = dynamic(() => import('@/components/Dashboard/MonthlyTrend'), { ssr: false })

export default function DashboardPage() {
  const { expenses, stats, addExpense, updateExpense, isLoaded } = useExpenses()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { toasts, addToast, dismissToast } = useToast()

  const categoryData = getCategoryTotals(expenses)
  const monthlyData = getMonthlyData(expenses)

  function handleEdit(expense: Expense) {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  function handleFormClose() {
    setIsFormOpen(false)
    setEditingExpense(null)
  }

  function handleSave(data: Omit<Expense, 'id' | 'createdAt'>) {
    if (editingExpense) {
      updateExpense(editingExpense.id, data)
      addToast('Expense updated successfully', 'success')
    } else {
      addExpense(data)
      addToast('Expense added successfully', 'success')
    }
  }

  return (
    <>
      <Navigation onAddExpense={() => setIsFormOpen(true)} />

      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Your financial overview at a glance</p>
          </div>

          {!isLoaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-28 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-slate-100 rounded w-24" />
                      <div className="h-6 bg-slate-100 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <SummaryCards stats={stats} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {isLoaded ? (
              <>
                <SpendingChart data={categoryData} />
                <MonthlyTrend data={monthlyData} />
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse" />
                <div className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse" />
              </>
            )}
          </div>

          {isLoaded && (
            <RecentExpenses expenses={expenses} onEdit={handleEdit} />
          )}
        </div>
      </main>

      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleSave}
        editingExpense={editingExpense}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}
