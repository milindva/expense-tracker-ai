'use client';

import React, { useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';
import { Card } from '@/components/ui/Card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/utils/helpers';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface SpendingChartsProps {
  expenses: Expense[];
}

const COLORS: Record<ExpenseCategory, string> = {
  Food: '#10b981',
  Transportation: '#3b82f6',
  Entertainment: '#8b5cf6',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Other: '#6b7280',
};

export const SpendingCharts: React.FC<SpendingChartsProps> = ({ expenses }) => {
  const categoryData = useMemo(() => {
    const breakdown: Record<ExpenseCategory, number> = {
      Food: 0,
      Transportation: 0,
      Entertainment: 0,
      Shopping: 0,
      Bills: 0,
      Other: 0,
    };

    expenses.forEach((expense) => {
      breakdown[expense.category] += expense.amount;
    });

    return Object.entries(breakdown)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: COLORS[name as ExpenseCategory],
      }));
  }, [expenses]);

  const monthlyData = useMemo(() => {
    if (expenses.length === 0) return [];

    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: startOfMonth(now),
    });

    return months.map((month) => {
      const monthKey = format(month, 'yyyy-MM');
      const monthExpenses = expenses.filter((expense) => {
        const expenseMonth = format(parseISO(expense.date), 'yyyy-MM');
        return expenseMonth === monthKey;
      });

      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      return {
        month: format(month, 'MMM yyyy'),
        total,
      };
    });
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No data to display</p>
          <p className="text-gray-400 text-sm mt-2">
            Add expenses to see spending visualizations
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Spending by Category
        </h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) =>
                  `${props.name} ${(props.percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            No category data
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Spending Trend
        </h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Bar dataKey="total" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            No monthly data
          </div>
        )}
      </Card>
    </div>
  );
};
