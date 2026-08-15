import { Link } from "react-router-dom";
import { BRAND, FONT_IMPORT_BLOCK } from "../lib/theme";

export default function NotFoundPage() {
  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="font-heading text-6xl mb-4" style={{ color: BRAND.inkSoft }}>404</div>
        <h1 className="font-heading text-2xl mb-2">Page not found</h1>
        <p className="text-sm mb-8" style={{ color: BRAND.inkSoft }}>The page you're looking for doesn't exist or may have moved.</p>
        <Link to="/" className="inline-block rounded-full px-6 py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
          Back to home
        </Link>
      </div>
    </div>
  );
}