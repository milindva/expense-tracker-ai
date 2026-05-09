'use client'

import Link from 'next/link'
import { Expense } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface RecentExpensesProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
}

export default function RecentExpenses({ expenses, onEdit }: RecentExpensesProps) {
  const recent = expenses.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">Recent Expenses</h2>
        <Link
          href="/expenses"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View all →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No expenses yet. Add your first one!
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {recent.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group cursor-pointer"
              onClick={() => onEdit(expense)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-slate-800 truncate">{expense.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge category={expense.category} size="sm" showIcon={false} />
                  <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(expense.amount)}
                </span>
                <svg
                  className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
