# How to Add and Edit Expenses

SpendWise lets you record expenses in seconds. Each expense captures a date, an amount, a category, and a short description. Once saved, it appears in your expense list and updates your dashboard charts immediately.

---

## Opening the Add Expense Dialog

Click the **Add Expense** button in the top-right corner of the navigation bar. It is available on every page.

```
SpendWise   Dashboard   Expenses              [ + Add Expense ]
```

On smaller screens the button label shortens to **Add**.

---

## Filling In the Form

The form has four fields:

### Date

Defaults to today. Click the field to pick a different date from the calendar.

- You can record expenses for any past date.
- Future dates are not allowed — the calendar will not let you select them.

### Amount

Type the expense amount. The `$` symbol is shown automatically — you do not need to type it.

- Use a decimal point for cents (e.g., `12.50`).
- Letters and special characters are ignored as you type.
- The maximum supported amount is $1,000,000.

### Category

Choose one of the six category tiles:

| Category | Icon |
|---|---|
| Food | 🍔 |
| Transportation | 🚗 |
| Entertainment | 🎬 |
| Shopping | 🛍️ |
| Bills | 📄 |
| Other | 📦 |

The selected category is highlighted in indigo. Click a different tile to change your selection.

### Description

Enter a short note about what the expense was for (e.g., "Lunch with the team" or "Monthly Netflix subscription").

- A character counter in the bottom-right corner of the field shows how many characters you have used out of the 200-character limit.

---

## Saving the Expense

Click **Add Expense** to save.

- The button shows a spinner and "Saving…" for a moment while the expense is recorded.
- The dialog closes automatically once saved.
- A confirmation message appears briefly at the bottom of the screen: **"Expense added"**.

Your new expense appears at the top of the expense list and is immediately reflected in the dashboard totals and charts.

---

## Validation — What Happens if a Field Is Invalid

If any field is missing or incorrect, the form will not submit. Error messages appear in red directly below the affected field:

| Field | What triggers an error |
|---|---|
| Date | Left empty |
| Amount | Left empty, contains only letters/symbols, is zero or negative, or exceeds $1,000,000 |
| Description | Left empty, or longer than 200 characters |

Fix the highlighted fields and click **Add Expense** again to retry.

---

## Editing an Existing Expense

To change an expense you already saved:

1. Go to the **Expenses** page (or find the expense in **Recent Expenses** on the Dashboard).
2. Click the **Edit** (pencil) icon on the expense row.

The same form opens, pre-filled with the existing values. Make your changes and click **Save Changes**.

A confirmation message appears: **"Expense updated successfully"**.

> **Note:** Editing an expense does not change the date it was originally recorded — only the fields you modify are updated.

---

## Closing the Dialog Without Saving

Close the dialog at any time without saving by:

- Clicking **Cancel**
- Clicking the **×** button in the top-right corner of the dialog
- Clicking anywhere on the dark background outside the dialog
- Pressing the **Escape** key

No changes are made if you close without clicking **Add Expense** or **Save Changes**.

---

## Frequently Asked Questions

**Can I record an expense for a past date?**
Yes. Click the date field and select any past date.

**Can I record an expense for a future date?**
No. The date picker does not allow future dates.

**What if I enter letters in the Amount field?**
They are automatically removed as you type — only numbers and a decimal point are kept.

**Can I add more than one decimal point in the amount?**
No — the second decimal point is ignored as you type.

**Is there a maximum amount I can record?**
Yes — the maximum is $1,000,000 per expense. Amounts above this will show an error.

**Can I add my own categories?**
Not currently. The six categories (Food, Transportation, Entertainment, Shopping, Bills, Other) are fixed.

**Where is my data stored?**
All expenses are saved in your browser's local storage. They remain available when you return to SpendWise, but are tied to this browser and device. Clearing your browser data will erase them.

**Does adding an expense affect any exports?**
Yes — any future export will include the new expense. Existing downloaded files are not changed.
