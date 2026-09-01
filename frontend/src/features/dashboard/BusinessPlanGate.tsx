import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { BRAND } from "../../lib/theme";
import { useAuth } from "../auth/AuthContext";

interface BusinessPlanGateProps {
  feature: string;
  description?: string;
  children: ReactNode;
}

export function BusinessPlanGate({ feature, description, children }: BusinessPlanGateProps) {
  const { user } = useAuth();
  if (user?.teamPlan === "business") return <>{children}</>;

  return (
    <div className="rounded-3xl p-10 text-center max-w-md mx-auto" style={{ background: BRAND.card, border: `1px dashed ${BRAND.line}` }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: BRAND.peach }}>
        <Lock size={22} style={{ color: BRAND.red }} />
      </div>
      <h2 className="font-heading text-xl mb-2">{feature} is a Business Plan feature</h2>
      <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>{description || `Upgrade to Business Plan to unlock ${feature.toLowerCase()}.`}</p>
      <Link to="/dashboard/settings/plan" className="inline-block rounded-full px-6 py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
        View Business Plan
      </Link>
    </div>
  );
}