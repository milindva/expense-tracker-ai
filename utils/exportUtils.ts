import { Expense } from '@/types/expense';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format date for export
 */
const formatExportDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch {
    return dateString;
  }
};

/**
 * Export expenses to CSV format
 */
export const exportToCSV = (expenses: Expense[], filename: string): void => {
  const headers = ['Date', 'Category', 'Amount', 'Description'];

  const rows = expenses.map((expense) => [
    formatExportDate(expense.date),
    expense.category,
    expense.amount.toFixed(2),
    `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export expenses to JSON format
 */
export const exportToJSON = (expenses: Expense[], filename: string): void => {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalRecords: expenses.length,
    totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    expenses: expenses.map((expense) => ({
      id: expense.id,
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    })),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
};

/**
 * Export expenses to PDF format
 */
export const exportToPDF = async (expenses: Expense[], filename: string): Promise<void> => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Report', 14, 20);

  // Add metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 28);
  doc.text(`Total Records: ${expenses.length}`, 14, 34);

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 14, 40);

  // Add table
  const tableData = expenses.map((expense) => [
    formatExportDate(expense.date),
    expense.category,
    `$${expense.amount.toFixed(2)}`,
    expense.description,
  ]);

  autoTable(doc, {
    head: [['Date', 'Category', 'Amount', 'Description']],
    body: tableData,
    startY: 48,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [79, 70, 229], // primary-600
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(filename);
};

/**
 * Helper function to download file
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
