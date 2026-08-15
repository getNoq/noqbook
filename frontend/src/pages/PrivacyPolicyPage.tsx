import { BRAND, FONT_IMPORT_BLOCK } from "../lib/theme";

const SECTION_CLASS = "mb-8";
const H2_CLASS = "font-heading text-xl mb-3";
const P_CLASS = "text-sm leading-relaxed mb-3";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <div className="max-w-2xl mx-auto px-6 py-14">
        <h1 className="font-heading text-3xl mb-2">Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: BRAND.inkSoft }}>
          Effective date: [INSERT DATE]. This policy explains what Yousual ("we", "us") collects, why, and the
          rights you have over it under Nigeria's Data Protection Act / NDPR.
        </p>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>1. Who we are</h2>
          <p className={P_CLASS}>
            Yousual is operated by [INSERT LEGAL ENTITY NAME], [INSERT REGISTERED ADDRESS]. For any question about
            this policy or your data, contact us at [INSERT DPO/PRIVACY EMAIL].
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>2. What we collect</h2>
          <p className={P_CLASS}><strong>Account information:</strong> email address, phone number, business name, first and last name, and your password (stored as an irreversible hash — we never see or store your plain-text password).</p>
          <p className={P_CLASS}><strong>Business records you create:</strong> sales, invoices, receipts, customer names and phone numbers, expenses, and any receipt photos or PDFs you upload.</p>
          <p className={P_CLASS}><strong>Guest mode data:</strong> if you use Yousual without an account, sales you record are stored only in your browser's local storage on your device — not on our servers — unless and until you create an account, at which point that data is uploaded and attached to your new account.</p>
          <p className={P_CLASS}><strong>Technical data:</strong> IP address, browser type, and basic access logs, collected automatically for security and abuse prevention.</p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>3. Why we collect it</h2>
          <p className={P_CLASS}>To create and secure your account, to provide the core service (recording and tracking your sales and expenses), to send you account-related emails (password resets, email verification), and to prevent fraud and abuse. We do not sell your personal data, and we do not use your business records for advertising.</p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>4. Who we share it with</h2>
          <p className={P_CLASS}>We share data with infrastructure providers who host the app and store data on our behalf, strictly to run the service — not for their own independent use. When you use a "Share" feature (e.g. sending an invoice via WhatsApp), you are choosing to share that specific document with the recipient you select; we don't share your other records as part of that action.</p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>5. How long we keep it</h2>
          <p className={P_CLASS}>We retain your account and business records for as long as your account is active. If you delete your account, we will delete your personal data within a reasonable period, except where we're required to retain certain records by law.</p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>6. Your rights</h2>
          <p className={P_CLASS}>Under the Nigeria Data Protection Act, you have the right to access the personal data we hold about you, correct inaccurate data, request deletion, object to or restrict certain processing, and request a copy of your data in a portable format. To exercise any of these, contact [INSERT PRIVACY EMAIL]. You may also lodge a complaint with the Nigeria Data Protection Commission (NDPC).</p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>7. Security</h2>
          <p className={P_CLASS}>We use industry-standard measures — encrypted connections (HTTPS), hashed passwords, and access controls — to protect your data. No system is perfectly secure, and we encourage using a strong, unique password for your account.</p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>8. Children's privacy</h2>
          <p className={P_CLASS}>Yousual is intended for business owners aged 18 and over. We do not knowingly collect data from anyone under 18.</p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>9. Changes to this policy</h2>
          <p className={P_CLASS}>We may update this policy as the product changes. Material changes will be communicated by email or an in-app notice before they take effect.</p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>10. Contact</h2>
          <p className={P_CLASS}>Questions about this policy: [INSERT PRIVACY EMAIL].</p>
        </div>
      </div>
    </div>
  );
}