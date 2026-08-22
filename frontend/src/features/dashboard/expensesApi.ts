import type { Expense } from "../../lib/expenseTypes";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/expenses`;

export interface CreateExpensePayload {
  title: string;
  amount: number;
  category: string;
  note?: string;
  expenseDate?: string;
  receipt?: File | null;
}

export interface UpdateExpensePayload {
  title: string;
  amount: number;
  category: string;
  note?: string;
  expenseDate?: string;
  receipt?: File | null;
}

export async function createExpense(accessToken: string, payload: CreateExpensePayload): Promise<Expense> {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("amount", String(payload.amount));
  form.append("category", payload.category);
  if (payload.note) form.append("note", payload.note);
  if (payload.expenseDate) form.append("expenseDate", payload.expenseDate);
  if (payload.receipt) form.append("receipt", payload.receipt);

  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't record the expense. Try again.");
  }
  return res.json();
}

export async function fetchExpenseDetail(accessToken: string, expenseId: string): Promise<Expense> {
  const res = await fetch(`${API_BASE}/${expenseId}/`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error("Couldn't load this expense.");
  return res.json();
}

export interface ExpenseEditLogEntry {
  id: string;
  action: "edited" | "deleted";
  changedBy: string;
  changes: Record<string, { old: any; new: any }>;
  createdAt: string;
}

export interface ExpenseDetail extends Expense {
  editHistory: ExpenseEditLogEntry[];
  lastEditedByEmail: string | null;
  lastEditedAt: string | null;
}

export async function updateExpense(accessToken: string, expenseId: string, payload: Partial<CreateExpensePayload>): Promise<ExpenseDetail> {
  const form = new FormData();
  if (payload.title !== undefined) form.append("title", payload.title);
  if (payload.amount !== undefined) form.append("amount", String(payload.amount));
  if (payload.category !== undefined) form.append("category", payload.category);
  if (payload.note !== undefined) form.append("note", payload.note);
  if (payload.expenseDate !== undefined) form.append("expenseDate", payload.expenseDate);
  if (payload.receipt) form.append("receipt", payload.receipt);

  const res = await fetch(`${API_BASE}/${expenseId}/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't save changes.");
  }
  return res.json();
}

export async function deleteExpense(accessToken: string, expenseId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${expenseId}/`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't delete this expense.");
  }
}