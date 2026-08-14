import { BRAND } from "../../../lib/theme";

interface ComingSoonSettingsProps {
  title: string;
  description: string;
}

export function ComingSoonSettings({ title, description }: ComingSoonSettingsProps) {
  return (
    <div className="rounded-3xl p-10 text-center" style={{ background: BRAND.card, border: `1px dashed ${BRAND.line}` }}>
      <h2 className="font-heading text-xl mb-2">{title}</h2>
      <p className="text-sm" style={{ color: BRAND.inkSoft }}>{description}</p>
    </div>
  );
}