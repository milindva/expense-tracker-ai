'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { Expense } from '@/types/expense';
import { downloadCSV } from '@/utils/helpers';
import { format } from 'date-fns';

interface ExportButtonProps {
  expenses: Expense[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ expenses }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    setIsExporting(true);

    try {
      const filename = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadCSV(expenses, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export expenses. Please try again.');
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="secondary"
      disabled={isExporting || expenses.length === 0}
      className="flex items-center gap-2"
    >
      <Download size={18} />
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
};
