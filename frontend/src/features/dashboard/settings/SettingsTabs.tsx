import { NavLink } from "react-router-dom";
import { BRAND } from "../../../lib/theme";

const TABS = [
  { to: "/dashboard/settings/profile", label: "Profile" },
  { to: "/dashboard/settings/password", label: "Password" },
  { to: "/dashboard/settings/plan", label: "Plan" },
  { to: "/dashboard/settings/billing", label: "Billing" },
  { to: "/dashboard/settings/team", label: "Team" },
];

export function SettingsTabs() {
  return (
    <div className="flex gap-2 overflow-x-auto border-b" style={{ borderColor: BRAND.line }}>
      {TABS.map((tab) => (
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