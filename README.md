# Expense Tracker

A modern, professional expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS. Track your personal finances with an intuitive interface, powerful analytics, and comprehensive filtering capabilities.

## Features

### Core Functionality
- **Add Expenses**: Create new expenses with date, amount, category, and description
- **Edit Expenses**: Modify existing expenses through an intuitive modal interface
- **Delete Expenses**: Remove expenses with confirmation prompts
- **Data Persistence**: All data is stored locally using localStorage

### Dashboard & Analytics
- **Summary Cards**: View total spending, monthly spending, total expenses, and top spending category
- **Category Breakdown**: Visual progress bars showing spending distribution across categories
- **Interactive Charts**:
  - Pie chart showing spending by category
  - Bar chart displaying monthly spending trends over the last 6 months

### Filtering & Search
- **Search**: Find expenses by description or category
- **Category Filter**: Filter expenses by specific categories
- **Date Range**: Filter expenses by start and end dates
- **Real-time Results**: Instant filtering with result counts

### Export & Reporting
- **CSV Export**: Download all expenses as a CSV file for use in Excel or other tools
- **Formatted Data**: Properly formatted dates, categories, amounts, and descriptions

### Design & UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern Interface**: Clean, professional design with smooth animations
- **Visual Feedback**: Loading states, hover effects, and transitions
- **Intuitive Navigation**: Tab-based interface for Dashboard, Expenses, and Analytics views

## Categories

The app supports six expense categories:
- 🍔 **Food**: Groceries, restaurants, and dining
- 🚗 **Transportation**: Gas, public transit, and vehicle expenses
- 🎬 **Entertainment**: Movies, games, and recreational activities
- 🛍️ **Shopping**: Clothing, electronics, and general purchases
- 💳 **Bills**: Utilities, subscriptions, and recurring payments
- 📌 **Other**: Miscellaneous expenses

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API
- **Data Storage**: localStorage

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm or yarn package manager

### Installation

1. Clone or navigate to the project directory:
```bash
cd expense-tracker-ai
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

#### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

#### Production Build

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Usage Guide

### Adding an Expense

1. Click the "Add Expense" button in the top-right corner
2. Fill in the expense details:
   - **Date**: Select the date of the expense (defaults to today)
   - **Amount**: Enter the expense amount in dollars
   - **Category**: Choose from the six available categories
   - **Description**: Add a brief description of the expense
3. Click "Add Expense" to save

### Viewing Expenses

Navigate to the "Expenses" tab to see your complete list of expenses:
- Expenses are sorted by date (most recent first)
- Each expense shows category icon, date, description, and amount
- Use the filter panel to narrow down results

### Filtering Expenses

Use the filter panel at the top of the Expenses tab:
- **Search**: Type keywords to find specific expenses
- **Category**: Select a specific category or "All Categories"
- **Date Range**: Set start and/or end dates
- Click "Clear Filters" to reset all filters

### Editing an Expense

1. Find the expense you want to edit in the Expenses list
2. Click the pencil (edit) icon on the right side
3. Modify the details in the modal that appears
4. Click "Update Expense" to save changes

### Deleting an Expense

1. Find the expense you want to delete
2. Click the trash (delete) icon
3. Confirm the deletion when prompted

### Viewing Analytics

Navigate to the "Analytics" tab to see:
- **Pie Chart**: Distribution of spending across categories
- **Bar Chart**: Monthly spending trends for the last 6 months

### Exporting Data

1. Click the "Export CSV" button in the top-right corner
2. The file will download automatically with the current date in the filename
3. Open the CSV file in Excel, Google Sheets, or any spreadsheet application

## Project Structure

```
expense-tracker-ai/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Main page with tabs and navigation
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Select.tsx
│   ├── Dashboard.tsx        # Dashboard with summary cards
│   ├── ExpenseForm.tsx      # Form for adding/editing expenses
│   ├── ExpenseItem.tsx      # Individual expense display
│   ├── ExpenseList.tsx      # List with filtering
│   ├── ExportButton.tsx     # CSV export functionality
│   ├── SpendingCharts.tsx   # Analytics charts
│   └── SummaryCard.tsx      # Dashboard summary cards
├── lib/
│   └── ExpenseContext.tsx   # React Context for state management
├── types/
│   └── expense.ts           # TypeScript type definitions
├── utils/
│   ├── helpers.ts           # Helper functions and formatters
│   └── localStorage.ts      # localStorage utilities
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Key Features Explained

### Form Validation

The expense form includes comprehensive validation:
- Date is required and cannot be in the future
- Amount must be greater than 0
- Category must be selected
- Description is required and cannot be empty
- Real-time error messages appear below invalid fields

### LocalStorage Persistence

All expense data is stored in your browser's localStorage:
- Data persists across browser sessions
- No server or database required
- Data is specific to your browser and device
- Clear your browser data to reset all expenses

### Responsive Design

The application adapts to different screen sizes:
- **Mobile**: Stacked layouts, collapsible filters
- **Tablet**: Two-column grids for better space utilization
- **Desktop**: Full multi-column layouts with optimal spacing

### Error Handling

The application includes proper error handling:
- Form validation with user-friendly messages
- Confirmation prompts for destructive actions
- Graceful handling of empty states
- Loading indicators during operations

## Browser Compatibility

The application works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Note**: localStorage must be enabled for the application to function properly.

## Troubleshooting

### Data Not Persisting

If your expenses aren't saving:
1. Check that localStorage is enabled in your browser
2. Ensure you're not in private/incognito mode
3. Check browser console for errors

### Charts Not Displaying

If charts don't appear:
1. Make sure you have at least one expense added
2. Check that JavaScript is enabled
3. Try refreshing the page

### Styling Issues

If styles look broken:
1. Clear your browser cache
2. Ensure the dev server is running properly
3. Check browser console for CSS errors

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

The codebase is organized for easy extension:
- Add new categories in `types/expense.ts`
- Create new components in `components/`
- Add utility functions in `utils/helpers.ts`
- Extend the context in `lib/ExpenseContext.tsx`

## Future Enhancements

Potential features for future versions:
- Budget setting and tracking
- Recurring expenses
- Multiple user accounts
- Cloud sync
- Receipt photo uploads
- Advanced reporting
- Category customization
- Dark mode theme

## License

This project is open source and available for personal and commercial use.

## Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review the browser console for errors
3. Ensure you're using a modern browser with JavaScript enabled

---

Built with Next.js, TypeScript, and Tailwind CSS
