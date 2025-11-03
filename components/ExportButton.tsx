'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Cloud } from 'lucide-react';
import { Expense } from '@/types/expense';
import { CloudExportHub } from '@/components/CloudExportHub';

interface ExportButtonProps {
  expenses: Expense[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ expenses }) => {
  const [isHubOpen, setIsHubOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsHubOpen(true)}
        variant="secondary"
        disabled={expenses.length === 0}
        className="flex items-center gap-2"
      >
        <Cloud size={18} />
        Export & Share
      </Button>

      <CloudExportHub
        expenses={expenses}
        isOpen={isHubOpen}
        onClose={() => setIsHubOpen(false)}
      />
    </>
  );
};
