import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { Pagination } from "./Pagination";
import { fetchCustomers } from "./customersApi";
import type { Customer } from "../../lib/customerTypes";
import { BusinessPlanGate } from "./BusinessPlanGate";

const PAGE_SIZE = 10;

export function CustomersList() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    const handle = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCustomers(accessToken, search, page);
        setCustomers(data.results);
        setTotalCount(data.count);
      } catch (err: any) {
        setError(err?.message || "Couldn't load customers.");
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [accessToken, search, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="min-h-dvh flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8 mb-20">
        <h1 className="font-heading text-2xl md:text-3xl mb-1">Customers</h1>
        <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>Everyone you've recorded a sale for.</p>

        <BusinessPlanGate feature="Customer history" description="See who bought what and when — upgrade to unlock.">
        <div className="flex items-center gap-2 mb-5">
          <Search size={16} style={{ color: BRAND.inkSoft }} className="shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name…"
            className="w-full max-w-sm rounded-xl px-3 py-2 text-base md:text-sm outline-none"
            style={{ border: `1px solid ${BRAND.line}`, background: BRAND.card }}
          />
        </div>

        {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}

        {isLoading ? (
          <div className="rounded-2xl p-10 text-center text-sm" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Loading…</div>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl p-10 text-center text-sm" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
            No customers yet — they'll show up here the first time you record a sale for them.
          </div>
        ) : (
          <>
            <div className="rounded-2xl overflow-hidden" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
              {customers.map((c, i) => (
                <Link
                  key={c.id}
                  to={`/dashboard/customers/${c.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.02]"
                  style={{ borderBottom: i < customers.length - 1 ? `1px solid ${BRAND.line}` : "none" }}
                >
                  <span className="font-semibold text-sm">{c.name}</span>
                  <span className="text-xs" style={{ color: BRAND.inkSoft }}>{c.phone || "—"}</span>
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
        </BusinessPlanGate>
      </main>
    </div>
  );
}