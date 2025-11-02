import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ExpenseProvider } from '@/lib/ExpenseContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Expense Tracker - Manage Your Finances',
  description: 'A modern, professional expense tracking application built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ExpenseProvider>{children}</ExpenseProvider>
      </body>
    </html>
  );
}
