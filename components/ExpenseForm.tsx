'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ExpenseCategory, ExpenseFormData, Expense } from '@/types/expense';
import { validateExpenseForm } from '@/utils/helpers';
import { format } from 'date-fns';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel?: () => void;
  initialData?: Expense;
  submitLabel?: string;
}

const categoryOptions: { value: ExpenseCategory; label: string }[] = [
  { value: 'Food', label: '🍔 Food' },
  { value: 'Transportation', label: '🚗 Transportation' },
  { value: 'Entertainment', label: '🎬 Entertainment' },
  { value: 'Shopping', label: '🛍️ Shopping' },
  { value: 'Bills', label: '💳 Bills' },
  { value: 'Other', label: '📌 Other' },
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Add Expense',
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    amount: initialData?.amount.toString() || '',
    category: initialData?.category || 'Food',
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateExpenseForm(
      formData.date,
      formData.amount,
      formData.category,
      formData.description
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    onSubmit(formData);

    if (!initialData) {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        category: 'Food',
        description: '',
      });
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="date"
        name="date"
        label="Date"
        value={formData.date}
        onChange={handleChange}
        error={errors.date}
        max={format(new Date(), 'yyyy-MM-dd')}
        required
      />

      <Input
        type="number"
        name="amount"
        label="Amount"
        value={formData.amount}
        onChange={handleChange}
        error={errors.amount}
        placeholder="0.00"
        step="0.01"
        min="0"
        required
      />

      <Select
        name="category"
        label="Category"
        value={formData.category}
        onChange={handleChange}
        error={errors.category}
        options={categoryOptions}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => handleChange(e as any)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={3}
          placeholder="Enter expense description..."
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
