import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut, Menu, Contact, X, BarChart3 } from "lucide-react";
import { BRAND } from "../../lib/theme";
import { useAuth } from "../auth/AuthContext";
import { TeamSwitcher } from "./TeamSwitcher";

const ALL_NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard", match: (path: string) => path === "/dashboard" },
  { label: "Who owes me", icon: Users, to: "/dashboard/owed", match: (path: string) => path === "/dashboard/owed" },
  { label: "Customers", icon: Contact, to: "/dashboard/customers", match: (path: string) => path.startsWith("/dashboard/customers") },
  { label: "Reports", icon: BarChart3, to: "/dashboard/reports", match: (path: string) => path.startsWith("/dashboard/reports"), ownerOrAdminOnly: true },
  { label: "Settings", icon: Settings, to: "/dashboard/settings", match: (path: string) => path.startsWith("/dashboard/settings") },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logOut } = useAuth();
  const location = useLocation();
  const NAV_ITEMS = ALL_NAV_ITEMS.filter((item) => !item.ownerOrAdminOnly || user?.role !== "staff");

  return (
    <div className="h-full flex flex-col px-4 py-6">
      <div className="font-heading text-lg px-2 mb-8" style={{ color: BRAND.ink }}>Yousual</div>
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.match(location.pathname);
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: active ? BRAND.lav : "transparent", color: active ? BRAND.ink : BRAND.inkSoft }}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t pt-4 mt-4" style={{ borderColor: BRAND.line }}>
        <TeamSwitcher />
        <div className="px-3 mb-3">
          <div className="text-sm font-semibold truncate">{user?.businessName}</div>
          <div className="text-xs truncate" style={{ color: BRAND.inkSoft }}>{user?.email}</div>
        </div>
        <button onClick={logOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" style={{ color: BRAND.inkSoft }}>
          <LogOut size={17} /> Log out
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:block w-64 shrink-0 border-r" style={{ borderColor: BRAND.line, background: BRAND.card }}>
        <SidebarContent />
      </aside>

      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b" style={{ background: BRAND.card, borderColor: BRAND.line }}>
        <span className="font-heading text-lg">Yousual</span>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" style={{ color: BRAND.ink }}>
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 md:w-72 h-full" style={{ background: BRAND.card }}>
            <div className="flex justify-end px-4 pt-4">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" style={{ color: BRAND.ink }}>
                <X size={22} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}