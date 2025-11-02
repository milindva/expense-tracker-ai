'use client';

import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';
import { ExpenseItem } from '@/components/ExpenseItem';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Search, Filter } from 'lucide-react';
import { parseISO, isWithinInterval } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ExpenseCategory>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        searchQuery === '' ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'All' || expense.category === categoryFilter;

      let matchesDateRange = true;
      if (startDate || endDate) {
        try {
          const expenseDate = parseISO(expense.date);
          const start = startDate ? parseISO(startDate) : new Date(0);
          const end = endDate ? parseISO(endDate) : new Date();

          matchesDateRange = isWithinInterval(expenseDate, { start, end });
        } catch {
          matchesDateRange = false;
        }
      }

      return matchesSearch && matchesCategory && matchesDateRange;
    });
  }, [expenses, searchQuery, categoryFilter, startDate, endDate]);

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredExpenses]);

  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    { value: 'Food', label: '🍔 Food' },
    { value: 'Transportation', label: '🚗 Transportation' },
    { value: 'Entertainment', label: '🎬 Entertainment' },
    { value: 'Shopping', label: '🛍️ Shopping' },
    { value: 'Bills', label: '💳 Bills' },
    { value: 'Other', label: '📌 Other' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-gray-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute left-3 top-[38px] text-gray-400">
              <Search size={18} />
            </div>
            <Input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              label="Search"
            />
          </div>

          <Select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            options={categoryOptions}
          />

          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {(searchQuery || categoryFilter !== 'All' || startDate || endDate) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {sortedExpenses.length} of {expenses.length} expenses
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setStartDate('');
                setEndDate('');
              }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div>
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 text-lg">
              {expenses.length === 0
                ? 'No expenses yet. Add your first expense to get started!'
                : 'No expenses match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedExpenses.map((expense) => (
              <ExpenseItem key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
