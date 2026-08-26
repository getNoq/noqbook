const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/billing`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

export interface BillingStatus {
  plan: "free" | "business";
  isComped: boolean;
  subscription: { gateway: string; status: string; currentPeriodEnd: string | null; amount: number } | null;
}

export async function fetchBillingStatus(accessToken: string): Promise<BillingStatus> {
  const res = await fetch(`${API_BASE}/status/`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load billing status.");
  return res.json();
}

export async function startSubscription(accessToken: string, gateway: "paystack" | "flutterwave"): Promise<{ authorizationUrl: string }> {
  const res = await fetch(`${API_BASE}/subscribe/`, { method: "POST", headers: authHeaders(accessToken), body: JSON.stringify({ gateway }) });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't start checkout.");
  }
  return res.json();
}

export async function cancelSubscription(accessToken: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/cancel/`, { method: "POST", headers: authHeaders(accessToken) });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't cancel subscription.");
  }
  return res.json();
}

export async function verifyPayment(accessToken: string, gateway: string, reference: string): Promise<{ message: string; plan: string }> {
  const res = await fetch(`${API_BASE}/verify/`, { method: "POST", headers: authHeaders(accessToken), body: JSON.stringify({ gateway, reference }) });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't verify payment.");
  }
  return res.json();
}

export interface BillingHistoryRow {
  id: string;
  gateway: string;
  amount: number;
  status: string;
  createdAt: string;
}

export async function fetchBillingHistory(accessToken: string): Promise<BillingHistoryRow[]> {
  const res = await fetch(`${API_BASE}/history/`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load billing history.");
  return res.json();
}