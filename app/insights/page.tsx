'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useExpenses } from '@/hooks/useExpenses'
import { Expense } from '@/lib/types'
import Navigation from '@/components/Navigation'
import ExpenseForm from '@/components/Expenses/ExpenseForm'
import { ToastContainer, useToast } from '@/components/ui/Toast'

const MonthlyInsights = dynamic(() => import('@/components/Dashboard/MonthlyInsights'), { ssr: false })

export default function InsightsPage() {
  const { expenses, addExpense, updateExpense, isLoaded } = useExpenses()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { toasts, addToast, dismissToast } = useToast()

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
            <h1 className="text-2xl font-bold text-slate-900">Monthly Insights</h1>
            <p className="text-slate-500 text-sm mt-1">A snapshot of your spending this month</p>
          </div>

          {!isLoaded ? (
            <div className="max-w-sm">
              <div className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse" />
            </div>
          ) : (
            <div className="max-w-sm">
              <MonthlyInsights expenses={expenses} />
            </div>
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
