import { NavLink } from "react-router-dom";
import { BRAND } from "../../../lib/theme";
import { useAuth } from "../../auth/AuthContext";

const ALL_TABS = [
  { to: "/dashboard/settings/profile", label: "Profile" },
  { to: "/dashboard/settings/password", label: "Password" },
  { to: "/dashboard/settings/plan", label: "Plan", ownerOnly: true },
  { to: "/dashboard/settings/billing", label: "Billing", ownerOnly: true },
  { to: "/dashboard/settings/team", label: "Team" },
];

export function SettingsTabs() {
  const { user } = useAuth();
  const tabs = ALL_TABS.filter((tab) => !tab.ownerOnly || user?.role !== "staff");

  return (
    <div className="flex gap-2 overflow-x-auto border-b" style={{ borderColor: BRAND.line }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px"
          style={({ isActive }) => ({ color: isActive ? BRAND.ink : BRAND.inkSoft, borderColor: isActive ? BRAND.ink : "transparent" })}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}