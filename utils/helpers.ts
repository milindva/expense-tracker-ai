import { Expense, ExpenseCategory, ExpenseSummary } from '@/types/expense';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    return dateString;
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const validateExpenseForm = (
  date: string,
  amount: string,
  category: ExpenseCategory,
  description: string
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!date) {
    errors.date = 'Date is required';
  }

  if (!amount || parseFloat(amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!category) {
    errors.category = 'Category is required';
  }

  if (!description.trim()) {
    errors.description = 'Description is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const calculateSummary = (expenses: Expense[]): ExpenseSummary => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const monthlyExpenses = expenses.filter((expense) => {
    try {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
    } catch {
      return false;
    }
  });

  const monthlySpending = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryBreakdown: Record<ExpenseCategory, number> = {
    Food: 0,
    Transportation: 0,
    Entertainment: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0,
  };

  expenses.forEach((expense) => {
    categoryBreakdown[expense.category] += expense.amount;
  });

  let topCategory: ExpenseCategory | null = null;
  let maxAmount = 0;

  (Object.entries(categoryBreakdown) as [ExpenseCategory, number][]).forEach(
    ([category, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        topCategory = category;
      }
    }
  );

  return {
    totalSpending,
    monthlySpending,
    categoryBreakdown,
    topCategory,
    expenseCount: expenses.length,
  };
};

export const exportToCSV = (expenses: Expense[]): string => {
  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const rows = expenses.map((expense) => [
    formatDate(expense.date, 'yyyy-MM-dd'),
    expense.category,
    expense.amount.toString(),
    `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes in description
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (expenses: Expense[], filename: string = 'expenses.csv'): void => {
  const csvContent = exportToCSV(expenses);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const getCategoryColor = (category: ExpenseCategory): string => {
  const colors: Record<ExpenseCategory, string> = {
    Food: 'bg-green-500',
    Transportation: 'bg-blue-500',
    Entertainment: 'bg-purple-500',
    Shopping: 'bg-pink-500',
    Bills: 'bg-red-500',
    Other: 'bg-gray-500',
  };

  return colors[category];
};

export const getCategoryIcon = (category: ExpenseCategory): string => {
  const icons: Record<ExpenseCategory, string> = {
    Food: '🍔',
    Transportation: '🚗',
    Entertainment: '🎬',
    Shopping: '🛍️',
    Bills: '💳',
    Other: '📌',
  };

  return icons[category];
};
