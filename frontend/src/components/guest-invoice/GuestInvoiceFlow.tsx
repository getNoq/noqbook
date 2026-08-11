import { useState, useMemo } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import type { Invoice, InvoiceItem, InvoiceStatus } from "./types";
import { MAX_GUEST_HISTORY } from "./constants";
import {
  emptyItem,
  guestStatusMessage,
  invoiceText,
  // reminderText,
  shareCaption,
  openWhatsApp,
  docLabel,
} from "./invoiceHelpers";
import { normalizeNGPhone } from "./phone";
import { loadInvoicesFromStorage, saveInvoicesToStorage, getNextInvoiceNumber } from "./invoiceStorage";
import { renderInvoiceImage } from "./invoiceImage";
import { uploadInvoiceAndGetLink } from "./invoiceApi";
import { AppHeader } from "./AppHeader";
import { InvoiceForm } from "./InvoiceForm";
import { InvoiceReceipt } from "./InvoiceReceipt";
import { InvoiceHistory } from "./InvoiceHistory";

type Step = "form" | "receipt" | "history";

export default function GuestInvoiceFlow() {
  const [step, setStep] = useState<Step>("form");
  const [businessName, setBusinessName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [status, setStatus] = useState<InvoiceStatus>("paid");
  const [savedInvoices, setSavedInvoicesState] = useState<Invoice[]>(() => loadInvoicesFromStorage());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [hostedLinks, setHostedLinks] = useState<Record<string, string>>({});
  const [linkLoading, setLinkLoading] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [showColorTeaser, setShowColorTeaser] = useState(false);

  const setSavedInvoices = (updater: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    setSavedInvoicesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveInvoicesToStorage(next);
      return next;
    });
  };

  const activeInvoice = savedInvoices.find((i) => i.id === activeId) || null;
  const hostedLink = activeInvoice ? hostedLinks[activeInvoice.id] : null;

  const total = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.unitPrice || 0), 0),
    [items]
  );

  const phoneCheck = useMemo(() => normalizeNGPhone(customerPhone), [customerPhone]);

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (id: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

  const canGenerate =
    businessName.trim().length > 0 &&
    customerName.trim().length > 0 &&
    items.some((it) => it.description.trim().length > 0) &&
    items
      .filter((it) => it.description.trim().length > 0)
      .every((it) => Number(it.qty) > 0 && Number(it.unitPrice) > 0) &&
    phoneCheck.valid;

  const generateInvoice = () => {
    const now = new Date().toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: getNextInvoiceNumber(),
      businessName,
      customerName,
      customerPhone: phoneCheck.local || "",
      items: items.filter((it) => it.description.trim().length > 0),
      total,
      status,
      createdAt: now,
      paidDate: status === "paid" ? now : null,
    };
    setSavedInvoices((prev) => [invoice, ...prev].slice(0, MAX_GUEST_HISTORY));
    setActiveId(invoice.id);
    setStep("receipt");
  };

  const markAsPaid = () => {
    const paidDate = new Date().toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
    setSavedInvoices((prev) =>
      prev.map((inv) => (inv.id === activeId ? { ...inv, status: "paid", paidDate } : inv))
    );
  };

  const shareAsImage = async (inv: Invoice) => {
    setImageBusy(true);
    try {
      const blob = await renderInvoiceImage(inv);
      const file = new File([blob], `${docLabel(inv.status).toLowerCase()}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareCaption(inv) });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${docLabel(inv.status).toLowerCase()}-${inv.customerName}-${inv.invoiceNumber}.png`;
        a.click();
        URL.revokeObjectURL(url);
        openWhatsApp(shareCaption(inv), inv.customerPhone);
      }
    } finally {
      setImageBusy(false);
    }
  };

  const downloadImage = async (inv: Invoice) => {
    const blob = await renderInvoiceImage(inv);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docLabel(inv.status).toLowerCase()}-${inv.customerName}-${inv.invoiceNumber}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getOrCreateLink = async (inv: Invoice): Promise<string> => {
    if (hostedLinks[inv.id]) return hostedLinks[inv.id];
    setLinkLoading(true);
    try {
      const link = await uploadInvoiceAndGetLink(inv);
      setHostedLinks((prev) => ({ ...prev, [inv.id]: link }));
      return link;
    } finally {
      setLinkLoading(false);
    }
  };

  const shareViaLink = async (inv: Invoice) => {
    const link = await getOrCreateLink(inv);
    openWhatsApp(shareCaption(inv, link), inv.customerPhone);
  };

  const copyLink = async (inv: Invoice) => {
    const link = await getOrCreateLink(inv);
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  };

  const copyText = async (inv: Invoice) => {
    try {
      await navigator.clipboard.writeText(invoiceText(inv));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — button remains for retry
    }
  };

  // const sendReminder = (inv: Invoice) => openWhatsApp(reminderText(inv), inv.customerPhone);

  const startNewInvoice = () => {
    setBusinessName(savedInvoices[0]?.businessName || "");
    setCustomerName("");
    setCustomerPhone("");
    setItems([emptyItem()]);
    setStatus("paid");
    setActiveId(null);
    setShowColorTeaser(false);
    setStep("form");
  };

  const openFromHistory = (id: string) => {
    setActiveId(id);
    setStep("receipt");
  };

  // TODO: wire to your real signup route. Stashes the invoice so your
  // signup success handler can attach it to the newly created account.
  const handleCreateAccount = () => {
    if (activeInvoice) {
      sessionStorage.setItem("owobook_pending_invoice", JSON.stringify(activeInvoice));
    }
    window.location.href = "/signup";
  };

  const atLimit = savedInvoices.length >= MAX_GUEST_HISTORY;

  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>

      <AppHeader onCreateAccount={handleCreateAccount} />

      <div className="max-w-xl mx-auto px-6 py-6">
        {/* Single consolidated guest-mode status line -- replaces the old
            separate "Guest mode" pill + "N saved" banner. Copy and color
            shift with how close the device is to the cap. */}
        <div
          className="flex flex-col items-start justify-between gap-3 rounded-2xl px-4 py-3 mb-4 text-sm"
          style={{ background: atLimit ? BRAND.peach : BRAND.lav, color: atLimit ? BRAND.red : BRAND.ink }}
        >
          <span className="flex items-center gap-2">
            <Clock size={15} className="shrink-0" />
            {guestStatusMessage(savedInvoices.length)}
          </span>
          {savedInvoices.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCreateAccount}
                className="whitespace-nowrap font-semibold underline underline-offset-2 flex items-center gap-1 shrink-0"
              >
                Create a free account
              </button>
            {step !== "history" && (
              <>
              <span className="text-sm px-1" style={{ color: BRAND.inkSoft }}>or</span>
              <button
                onClick={() => setStep("history")}
                className="whitespace-nowrap font-semibold underline underline-offset-2 flex items-center gap-1 shrink-0"
              >
                View all <ChevronRight size={14} />
              </button>
              </>
            )}
            </div>
          )}
        </div>

        {step === "history" && (
          <InvoiceHistory savedInvoices={savedInvoices} onOpenInvoice={openFromHistory} onStartNewInvoice={startNewInvoice} />
        )}

        {step === "form" && (
          <InvoiceForm
            businessName={businessName}
            onBusinessNameChange={setBusinessName}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            customerPhone={customerPhone}
            onCustomerPhoneChange={setCustomerPhone}
            phoneCheck={phoneCheck}
            items={items}
            onUpdateItem={updateItem}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            status={status}
            onStatusChange={setStatus}
            total={total}
            canGenerate={canGenerate}
            onGenerate={generateInvoice}
            hasSavedInvoices={savedInvoices.length > 0}
          />
        )}

        {step === "receipt" && activeInvoice && (
          <InvoiceReceipt
            invoice={activeInvoice}
            imageBusy={imageBusy}
            onShareAsImage={() => shareAsImage(activeInvoice)}
            onDownloadImage={() => downloadImage(activeInvoice)}
            linkLoading={linkLoading}
            onShareViaLink={() => shareViaLink(activeInvoice)}
            hostedLink={hostedLink}
            onCopyLink={() => copyLink(activeInvoice)}
            linkCopied={linkCopied}
            onCopyText={() => copyText(activeInvoice)}
            copied={copied}
            // onSendReminder={() => sendReminder(activeInvoice)}
            onMarkAsPaid={markAsPaid}
            showColorTeaser={showColorTeaser}
            onToggleColorTeaser={() => setShowColorTeaser((s) => !s)}
            onCreateAccount={handleCreateAccount}
            onStartNewInvoice={startNewInvoice}
            onViewHistory={() => setStep("history")}
            hasMultipleSavedInvoices={savedInvoices.length > 1}
          />
        )}
      </div>
    </div>
  );
}