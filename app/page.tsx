'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/lib/ExpenseContext';
import { Dashboard } from '@/components/Dashboard';
import { ExpenseList } from '@/components/ExpenseList';
import { SpendingCharts } from '@/components/SpendingCharts';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExportButton } from '@/components/ExportButton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, List, BarChart3, Plus } from 'lucide-react';

type Tab = 'dashboard' | 'expenses' | 'analytics';

export default function Home() {
  const { expenses, addExpense, isLoading } = useExpenses();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddExpense = (data: any) => {
    addExpense(data);
    setShowAddForm(false);
  };

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses' as Tab, label: 'Expenses', icon: List },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Expense Tracker
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your personal finances with ease
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ExportButton expenses={expenses} />
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Expense
                </Button>
              </div>
            </div>
          </div>

          <nav className="flex space-x-8 border-t border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddForm && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Expense
            </h2>
            <ExpenseForm
              onSubmit={handleAddExpense}
              onCancel={() => setShowAddForm(false)}
            />
          </Card>
        )}

        {activeTab === 'dashboard' && <Dashboard expenses={expenses} />}
        {activeTab === 'expenses' && <ExpenseList expenses={expenses} />}
        {activeTab === 'analytics' && <SpendingCharts expenses={expenses} />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
