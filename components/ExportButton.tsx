'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { Expense } from '@/types/expense';
import { ExportModal } from '@/components/ExportModal';

interface ExportButtonProps {
  expenses: Expense[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ expenses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="secondary"
        disabled={expenses.length === 0}
        className="flex items-center gap-2"
      >
        <Download size={18} />
        Export Data
      </Button>

      <ExportModal
        expenses={expenses}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
