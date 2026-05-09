'use client'

import { useState } from 'react'
import { Expense } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

const PAGE_SIZE = 15

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const [page, setPage] = useState(1)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const totalPages = Math.ceil(expenses.length / PAGE_SIZE)
  const paged = expenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleDelete(id: string) {
    if (confirmDeleteId === id) {
      onDelete(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-slate-900 font-semibold mb-1">No expenses found</h3>
        <p className="text-slate-500 text-sm">Try adjusting your filters or add a new expense.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1" />
        </div>

        <div className="divide-y divide-slate-100">
          {paged.map((expense) => (
            <div
              key={expense.id}
              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="col-span-12 sm:col-span-2 flex sm:block items-center justify-between">
                <span className="text-sm text-slate-600">{formatDate(expense.date)}</span>
                <span className="sm:hidden text-base font-bold text-slate-900">
                  {formatCurrency(expense.amount)}
                </span>
              </div>

              <div className="col-span-12 sm:col-span-3 flex items-center">
                <Badge category={expense.category} />
              </div>

              <div className="col-span-12 sm:col-span-4 flex items-center">
                <p className="text-sm text-slate-700 line-clamp-2">{expense.description}</p>
              </div>

              <div className="hidden sm:flex col-span-2 items-center justify-end">
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(expense.amount)}
                </span>
              </div>

              <div className="col-span-12 sm:col-span-1 flex items-center justify-end sm:justify-center gap-1">
                <button
                  onClick={() => onEdit(expense)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                  title="Edit expense"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100 ${
                    confirmDeleteId === expense.id
                      ? 'text-white bg-red-500 hover:bg-red-600'
                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title={confirmDeleteId === expense.id ? 'Click again to confirm' : 'Delete expense'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-slate-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
