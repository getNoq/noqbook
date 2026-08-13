export type ExpenseCategory =
  | "inventory" | "transport" | "rent" | "utilities" | "salaries" | "supplies" | "marketing" | "other";

export interface Expense {
  id: string;
  expenseNumber: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  categoryDisplay: string;
  note: string;
  expenseDate: string; // "YYYY-MM-DD"
  receiptUrl: string | null;
  recordedAt: string;
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "inventory", label: "Inventory / stock" },
  { value: "transport", label: "Transport" },
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "salaries", label: "Salaries / wages" },
  { value: "supplies", label: "Supplies" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

export function formatExpenseDateDisplay(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}