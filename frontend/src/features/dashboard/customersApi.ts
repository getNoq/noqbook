import type { Customer } from "../../lib/customerTypes";
import type { Invoice } from "../../lib/invoiceTypes";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/customers`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

export interface PaginatedCustomers {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

export async function fetchCustomers(accessToken: string, search: string = "", page: number = 1): Promise<PaginatedCustomers> {
  const query = new URLSearchParams({ page: String(page) });
  if (search) query.set("search", search);
  const res = await fetch(`${API_BASE}/?${query.toString()}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load customers.");
  return res.json();
}

export interface CustomerDetail {
  customer: Customer;
  totalSalesCount: number;
  totalSpent: number;
  totalPaid: number;
  invoices: Invoice[];
}

export async function fetchCustomerDetail(accessToken: string, customerId: string): Promise<CustomerDetail> {
  const res = await fetch(`${API_BASE}/${customerId}/`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load this customer.");
  return res.json();
}

export async function updateCustomer(
  accessToken: string,
  customerId: string,
  payload: { name: string; phone?: string; note?: string }
): Promise<Customer> {
  const res = await fetch(`${API_BASE}/${customerId}/`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't update this customer.");
  }
  return res.json();
}