'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, ExpenseFormData } from '@/types/expense';
import { storageUtils } from '@/utils/localStorage';
import { generateId } from '@/utils/helpers';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expenseData: ExpenseFormData) => void;
  updateExpense: (id: string, expenseData: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = () => {
      const storedExpenses = storageUtils.getExpenses();
      setExpenses(storedExpenses);
      setIsLoading(false);
    };

    loadExpenses();
  }, []);

  const addExpense = (expenseData: ExpenseFormData) => {
    const newExpense: Expense = {
      id: generateId(),
      date: expenseData.date,
      amount: parseFloat(expenseData.amount),
      category: expenseData.category,
      description: expenseData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedExpenses = storageUtils.addExpense(newExpense);
    setExpenses(updatedExpenses);
  };

  const updateExpense = (id: string, expenseData: ExpenseFormData) => {
    const updatedExpense = {
      date: expenseData.date,
      amount: parseFloat(expenseData.amount),
      category: expenseData.category,
      description: expenseData.description,
    };

    const updatedExpenses = storageUtils.updateExpense(id, updatedExpense);
    setExpenses(updatedExpenses);
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = storageUtils.deleteExpense(id);
    setExpenses(updatedExpenses);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        isLoading,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
