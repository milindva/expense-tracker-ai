'use client'

import { useState } from 'react'
import { useExpenses } from '@/hooks/useExpenses'
import { Expense } from '@/lib/types'
import Navigation from '@/components/Navigation'
import FilterBar from '@/components/Expenses/FilterBar'
import ExpenseList from '@/components/Expenses/ExpenseList'
import ExpenseForm from '@/components/Expenses/ExpenseForm'
import ExportModal from '@/components/Export/ExportModal'
import { ToastContainer, useToast } from '@/components/ui/Toast'

export default function ExpensesPage() {
  const {
    expenses,
    filteredExpenses,
    filters,
    setFilters,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoaded,
  } = useExpenses()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { toasts, addToast, dismissToast } = useToast()

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
      addToast('Expense added', 'success')
    }
  }

  function handleDelete(id: string) {
    deleteExpense(id)
    addToast('Expense deleted', 'info')
  }

  function handleExport() {
    setIsExportOpen(true)
  }

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <>
      <Navigation onAddExpense={() => setIsFormOpen(true)} />

      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
              <p className="text-slate-500 text-sm mt-1">Manage and track all your expenses</p>
            </div>
            {isLoaded && filteredExpenses.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-0.5">Total shown</p>
                <p className="text-xl font-bold text-slate-900">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalFiltered)}
                </p>
              </div>
            )}
          </div>

          {!isLoaded ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 h-36 animate-pulse" />
              <div className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              <FilterBar
                filters={filters}
                onChange={setFilters}
                resultCount={filteredExpenses.length}
                totalCount={expenses.length}
                onExport={handleExport}
              />
              <ExpenseList
                expenses={filteredExpenses}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        expenses={expenses}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}
