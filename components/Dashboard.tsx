'use client';

import React, { useMemo } from 'react';
import { Expense } from '@/types/expense';
import { SummaryCard } from '@/components/SummaryCard';
import { calculateSummary, formatCurrency, getCategoryIcon } from '@/utils/helpers';
import { DollarSign, Calendar, TrendingUp, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface DashboardProps {
  expenses: Expense[];
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const summary = useMemo(() => calculateSummary(expenses), [expenses]);

  const topCategories = useMemo(() => {
    return Object.entries(summary.categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .filter(([, amount]) => amount > 0);
  }, [summary.categoryBreakdown]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Spending"
          value={formatCurrency(summary.totalSpending)}
          icon={DollarSign}
          subtitle="All time"
          iconColor="text-primary-600"
        />

        <SummaryCard
          title="This Month"
          value={formatCurrency(summary.monthlySpending)}
          icon={Calendar}
          subtitle="Current month"
          iconColor="text-blue-600"
        />

        <SummaryCard
          title="Total Expenses"
          value={summary.expenseCount.toString()}
          icon={Receipt}
          subtitle="All entries"
          iconColor="text-purple-600"
        />

        <SummaryCard
          title="Top Category"
          value={summary.topCategory || 'N/A'}
          icon={TrendingUp}
          subtitle={
            summary.topCategory
              ? formatCurrency(summary.categoryBreakdown[summary.topCategory])
              : 'No data'
          }
          iconColor="text-green-600"
        />
      </div>

      {topCategories.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Spending Categories
          </h3>
          <div className="space-y-4">
            {topCategories.map(([category, amount]) => {
              const percentage =
                summary.totalSpending > 0
                  ? ((amount / summary.totalSpending) * 100).toFixed(1)
                  : 0;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {getCategoryIcon(category as any)}
                      </span>
                      <span className="font-medium text-gray-900">{category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(amount)}
                      </p>
                      <p className="text-sm text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {expenses.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-2">No expenses yet</p>
            <p className="text-gray-400 text-sm">
              Start tracking your expenses to see analytics here
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
