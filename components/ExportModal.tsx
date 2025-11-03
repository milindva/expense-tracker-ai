'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Expense, ExpenseCategory } from '@/types/expense';
import {
  Download,
  FileText,
  FileJson,
  FileSpreadsheet,
  Calendar,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/exportUtils';

interface ExportModalProps {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'json' | 'pdf';

const CATEGORIES: (ExpenseCategory | 'All')[] = [
  'All',
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other'
];

export const ExportModal: React.FC<ExportModalProps> = ({
  expenses,
  isOpen,
  onClose,
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState(`expenses-${format(new Date(), 'yyyy-MM-dd')}`);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<ExpenseCategory | 'All'>>(
    new Set(['All'])
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filter expenses based on selected criteria
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Category filter
      if (!selectedCategories.has('All')) {
        if (!selectedCategories.has(expense.category)) {
          return false;
        }
      }

      // Date range filter
      if (startDate && expense.date < startDate) {
        return false;
      }
      if (endDate && expense.date > endDate) {
        return false;
      }

      return true;
    });
  }, [expenses, selectedCategories, startDate, endDate]);

  const handleCategoryToggle = (category: ExpenseCategory | 'All') => {
    const newCategories = new Set(selectedCategories);

    if (category === 'All') {
      newCategories.clear();
      newCategories.add('All');
    } else {
      newCategories.delete('All');
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }

      // If no categories selected, default to All
      if (newCategories.size === 0) {
        newCategories.add('All');
      }
    }

    setSelectedCategories(newCategories);
  };

  const handleExport = async () => {
    if (filteredExpenses.length === 0) {
      alert('No expenses to export with current filters');
      return;
    }

    setIsExporting(true);

    try {
      const fullFilename = `${filename}.${exportFormat}`;

      switch (exportFormat) {
        case 'csv':
          exportToCSV(filteredExpenses, fullFilename);
          break;
        case 'json':
          exportToJSON(filteredExpenses, fullFilename);
          break;
        case 'pdf':
          await exportToPDF(filteredExpenses, fullFilename);
          break;
      }

      // Close modal after successful export
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const resetForm = () => {
    setExportFormat('csv');
    setFilename(`expenses-${format(new Date(), 'yyyy-MM-dd')}`);
    setStartDate('');
    setEndDate('');
    setSelectedCategories(new Set(['All']));
    setShowPreview(false);
  };

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Expenses">
      <div className="space-y-6">
        {/* Export Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'csv', icon: FileSpreadsheet, label: 'CSV' },
              { value: 'json', icon: FileJson, label: 'JSON' },
              { value: 'pdf', icon: FileText, label: 'PDF' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setExportFormat(value as ExportFormat)}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                  exportFormat === value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon size={24} className="mb-2" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filename Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filename
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              className="flex-1"
            />
            <span className="text-gray-500 font-mono">.{exportFormat}</span>
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} />
            Date Range (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Filter size={16} />
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.has(category)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Export Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Records:</span>
              <span className="ml-2 font-semibold text-blue-900">
                {filteredExpenses.length}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Total Amount:</span>
              <span className="ml-2 font-semibold text-blue-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Preview Toggle */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye size={16} />
          <span className="text-sm font-medium">
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </span>
        </button>

        {/* Data Preview */}
        {showPreview && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">Preview</h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredExpenses.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExpenses.slice(0, 10).map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">
                          {formatDate(expense.date, 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 py-2 text-gray-900">{expense.category}</td>
                        <td className="px-4 py-2 text-right text-gray-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-2 text-gray-600 truncate max-w-xs">
                          {expense.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No expenses match current filters
                </div>
              )}
              {filteredExpenses.length > 10 && (
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 text-center border-t border-gray-200">
                  Showing 10 of {filteredExpenses.length} records
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2"
            disabled={isExporting || filteredExpenses.length === 0}
          >
            <Download size={18} />
            {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
