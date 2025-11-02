import { Expense } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-expenses';

export const storageUtils = {
  getExpenses: (): Expense[] => {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveExpenses: (expenses: Expense[]): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  addExpense: (expense: Expense): Expense[] => {
    const expenses = storageUtils.getExpenses();
    const updatedExpenses = [expense, ...expenses];
    storageUtils.saveExpenses(updatedExpenses);
    return updatedExpenses;
  },

  updateExpense: (id: string, updatedExpense: Partial<Expense>): Expense[] => {
    const expenses = storageUtils.getExpenses();
    const updatedExpenses = expenses.map((expense) =>
      expense.id === id
        ? { ...expense, ...updatedExpense, updatedAt: new Date().toISOString() }
        : expense
    );
    storageUtils.saveExpenses(updatedExpenses);
    return updatedExpenses;
  },

  deleteExpense: (id: string): Expense[] => {
    const expenses = storageUtils.getExpenses();
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    storageUtils.saveExpenses(updatedExpenses);
    return updatedExpenses;
  },

  clearAll: (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
