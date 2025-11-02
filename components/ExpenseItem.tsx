'use client';

import React, { useState } from 'react';
import { Expense } from '@/types/expense';
import { formatCurrency, formatDate, getCategoryColor, getCategoryIcon } from '@/utils/helpers';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ExpenseForm } from '@/components/ExpenseForm';
import { useExpenses } from '@/lib/ExpenseContext';

interface ExpenseItemProps {
  expense: Expense;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const { updateExpense, deleteExpense } = useExpenses();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = (formData: any) => {
    updateExpense(expense.id, formData);
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setIsDeleting(true);
      setTimeout(() => {
        deleteExpense(expense.id);
      }, 200);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 ${
          isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(
                      expense.category
                    )}`}
                  >
                    {expense.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(expense.date)}
                  </span>
                </div>
                <p className="text-gray-900 mt-1 truncate">{expense.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(expense.amount)}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit expense"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete expense"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Expense"
      >
        <ExpenseForm
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          initialData={expense}
          submitLabel="Update Expense"
        />
      </Modal>
    </>
  );
};
