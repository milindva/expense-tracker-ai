'use client'

import { useState, useEffect } from 'react'
import { Expense, Category } from '@/lib/types'
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

interface FormData {
  date: string
  amount: string
  category: Category
  description: string
}

interface FormErrors {
  date?: string
  amount?: string
  description?: string
}

interface ExpenseFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Expense, 'id' | 'createdAt'>) => void
  editingExpense?: Expense | null
}

export default function ExpenseForm({ isOpen, onClose, onSave, editingExpense }: ExpenseFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<FormData>({
    date: today,
    amount: '',
    category: 'Food',
    description: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingExpense) {
      setForm({
        date: editingExpense.date,
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        description: editingExpense.description,
      })
    } else {
      setForm({ date: today, amount: '', category: 'Food', description: '' })
    }
    setErrors({})
  }, [editingExpense, isOpen])

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Enter a valid amount greater than 0'
    }
    if (parseFloat(form.amount) > 1_000_000) {
      newErrors.amount = 'Amount seems too large'
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (form.description.trim().length > 200) {
      newErrors.description = 'Description must be under 200 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 200))

    onSave({
      date: form.date,
      amount: parseFloat(parseFloat(form.amount).toFixed(2)),
      category: form.category,
      description: form.description.trim(),
    })

    setIsSubmitting(false)
    onClose()
  }

  function handleAmountChange(value: string) {
    const cleaned = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setForm((prev) => ({ ...prev, amount: cleaned }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? 'Edit Expense' : 'Add Expense'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              max={today}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.date ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm text-slate-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                  form.category === cat
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            placeholder="What was this expense for?"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-xs text-red-600">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-slate-400 ml-auto">{form.description.length}/200</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : editingExpense ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
