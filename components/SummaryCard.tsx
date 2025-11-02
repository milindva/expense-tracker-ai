import React from 'react';
import { Card } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  iconColor = 'text-primary-600',
}) => {
  return (
    <Card className="hover:scale-105 transition-transform duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div
              className={`inline-flex items-center text-sm font-medium mt-2 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-3 bg-gray-50 rounded-lg ${iconColor}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};
