import { Outlet } from "react-router-dom";
import { BRAND, FONT_IMPORT_BLOCK } from "../../../lib/theme";
import { Sidebar } from "../Sidebar";
import { SettingsTabs } from "./SettingsTabs";

export function SettingsLayout() {
  return (
    <div
      className="min-h-dvh flex flex-col md:flex-row"
      style={{
        background: BRAND.bg,
        fontFamily: "Inter, sans-serif",
        color: BRAND.ink,
      }}
    >
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8">
        <h1 className="font-heading text-2xl md:text-3xl mb-1">Settings</h1>
        <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>
          Manage your account and business details.
        </p>
        <SettingsTabs />
        <div className="mt-6 max-w-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
