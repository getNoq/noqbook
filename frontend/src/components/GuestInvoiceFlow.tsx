import { useState, useMemo } from "react";
import {
  Plus, Trash2, Share2, Copy, RefreshCw, Check,
  Download, Link as LinkIcon, Bell, CheckCircle2, Clock, ChevronRight, FilePlus,
} from "lucide-react";

/**
 * GuestInvoiceFlow (TypeScript)
 * ------------------------------------------------------------------
 * Client-side guest mode for OwoBook — no account, no auth.
 *
 * Setup required in your project:
 *  1. `npm install lucide-react` (only real dependency; canvas + Web
 *     Share API + clipboard are native browser APIs, nothing else needed).
 *  2. Add the Fraunces + Inter Google Fonts <link> tags to your index.html
 *     (reuse the same tags from the landing page) and delete the
 *     `fontsInjected` block below once you do — it's a fallback so this
 *     still renders correctly if dropped in before you've done that.
 *  3. Replace `uploadInvoiceAndGetLink()` with a real call to your Django
 *     API once the hosted PDF/image endpoint exists — everything else
 *     already calls through this one function, nothing else changes.
 *  4. Wire the "Create free account" button to your signup route (see
 *     bottom of file for the handoff pattern).
 *
 * Persistence: reads/writes localStorage under STORAGE_KEY, so a guest's
 * invoices survive a refresh. Capped at MAX_GUEST_HISTORY on purpose —
 * see comment above the constant.
 */

// ---------- Types ----------

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export type InvoiceStatus = "paid" | "due";

export interface Invoice {
  id: string;
  businessName: string;
  customerName: string;
  customerPhone: string; // local format, e.g. "08031234567", or "" if not given
  items: InvoiceItem[];
  total: number;
  status: InvoiceStatus;
  createdAt: string;
  paidDate: string | null;
}

interface PhoneCheck {
  empty: boolean;
  valid: boolean;
  intl: string | null; // "234XXXXXXXXXX" — required format for wa.me links
  local: string | null; // "0XXXXXXXXXX"
}

// ---------- Constants ----------

const BRAND = {
  bg: "#FBF8F2", ink: "#221D17", inkSoft: "rgba(34,29,23,0.62)",
  card: "#FFFFFF", line: "rgba(34,29,23,0.12)",
  peach: "#FFE4CD", lav: "#E7E2FF", lavStrong: "#9C8FFF",
  mint: "#DBF3E7", green: "#2E8F63", red: "#D96B57",
} as const;

// Guest mode is capped on purpose: unlimited local history would remove
// the reason to ever create an account. Unlimited history + cross-device
// backup stays a genuine paid/free-account benefit. Raise this if you want
// guest mode to feel more generous, but keep some cap.
const MAX_GUEST_HISTORY = 5;
const STORAGE_KEY = "owobook_guest_invoices";

// ---------- Helpers ----------

const emptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: "",
  qty: 1,
  unitPrice: 0,
});

const formatNaira = (n: number): string => "₦" + Number(n || 0).toLocaleString("en-NG");
const docLabel = (status: InvoiceStatus): string => (status === "paid" ? "Receipt" : "Invoice");

function loadInvoicesFromStorage(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Invoice[]) : [];
  } catch {
    return [];
  }
}

function saveInvoicesToStorage(invoices: Invoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch {
    // storage full or unavailable (private browsing) — fail silently,
    // guest just loses persistence for this session
  }
}

/** Validates + normalizes a Nigerian phone number. Empty input is "valid" (field is optional). */
function normalizeNGPhone(raw: string): PhoneCheck {
  const trimmed = (raw || "").trim();
  if (!trimmed) return { empty: true, valid: true, intl: null, local: null };

  const cleaned = trimmed.replace(/[^\d+]/g, "");
  let rest: string | null = null;

  if (cleaned.startsWith("+234")) rest = cleaned.slice(4);
  else if (cleaned.startsWith("234") && cleaned.length === 13) rest = cleaned.slice(3);
  else if (cleaned.startsWith("0") && cleaned.length === 11) rest = cleaned.slice(1);

  const ok = !!rest && /^[7-9]\d{9}$/.test(rest);
  return {
    empty: false,
    valid: ok,
    intl: ok ? "234" + rest : null,
    local: ok ? "0" + rest : null,
  };
}

/** Draws the receipt/invoice onto a canvas and returns a PNG Blob. No image library needed. */
async function renderInvoiceImage(invoice: Invoice): Promise<Blob> {
  const width = 640, lineHeight = 34, headerH = 150, footerH = 160;
  const height = headerH + invoice.items.length * lineHeight + footerH;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = BRAND.ink;
  ctx.textAlign = "center";
  ctx.font = "600 26px Georgia, serif";
  ctx.fillText(invoice.businessName, width / 2, 52);

  ctx.font = "500 13px Arial, sans-serif";
  ctx.fillStyle = "rgba(34,29,23,0.55)";
  ctx.fillText(`${docLabel(invoice.status)} · ${invoice.createdAt}`, width / 2, 76);

  ctx.strokeStyle = "rgba(34,29,23,0.15)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(40, headerH - 20);
  ctx.lineTo(width - 40, headerH - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = "left";
  ctx.font = "600 15px Arial, sans-serif";
  ctx.fillStyle = BRAND.ink;
  ctx.fillText(`Customer: ${invoice.customerName}`, 40, headerH + 10);

  let y = headerH + 46;
  ctx.font = "14px Arial, sans-serif";
  invoice.items.forEach((it) => {
    ctx.textAlign = "left";
    ctx.fillStyle = BRAND.ink;
    ctx.fillText(`${it.qty} × ${it.description}`, 40, y);
    ctx.textAlign = "right";
    ctx.fillText(formatNaira(it.qty * it.unitPrice), width - 40, y);
    y += lineHeight;
  });

  ctx.strokeStyle = "rgba(34,29,23,0.15)";
  ctx.beginPath();
  ctx.moveTo(40, y);
  ctx.lineTo(width - 40, y);
  ctx.stroke();
  y += 40;

  ctx.textAlign = "left";
  ctx.font = "700 16px Arial, sans-serif";
  ctx.fillText("Total", 40, y);
  ctx.textAlign = "right";
  ctx.font = "700 24px Georgia, serif";
  ctx.fillText(formatNaira(invoice.total), width - 40, y);

  y += 44;
  const paid = invoice.status === "paid";
  ctx.fillStyle = paid ? "#DBF3E7" : "#FFE4CD";
  const stampText = paid ? `PAID${invoice.paidDate ? " · " + invoice.paidDate : ""}` : "OUTSTANDING";
  ctx.font = "700 12px Arial, sans-serif";
  const stampWidth = ctx.measureText(stampText).width + 28;
  ctx.beginPath();
  ctx.roundRect(width / 2 - stampWidth / 2, y - 18, stampWidth, 28, 14);
  ctx.fill();
  ctx.fillStyle = paid ? BRAND.green : BRAND.red;
  ctx.textAlign = "center";
  ctx.fillText(stampText, width / 2, y);

  ctx.fillStyle = "rgba(34,29,23,0.4)";
  ctx.font = "12px Arial, sans-serif";
  ctx.fillText("Created with OwoBook", width / 2, height - 24);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png");
  });
}

/**
 * STUB — replace with a real call to your Django API, which should
 * render/store a PDF or image (Cloudinary/S3) and return a public URL
 * served with Content-Disposition: inline so it opens in-browser.
 */
async function uploadInvoiceAndGetLink(invoice: Invoice): Promise<string> {
  // Real version, once your endpoint exists:
  //
  // const res = await fetch("/api/guest-invoices/", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(invoice),
  // });
  // const data = await res.json();
  // return data.url;

  await new Promise((r) => setTimeout(r, 700));
  const fakeId = invoice.businessName.slice(0, 3).toLowerCase() + Date.now().toString().slice(-5);
  return `https://owobook.com/i/${fakeId}`;
}

// ---------- Component ----------

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

  // Every update to savedInvoices persists to localStorage in the same call —
  // no separate "save" step to forget elsewhere in the component.
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
    phoneCheck.valid;

  const generateInvoice = () => {
    const now = new Date().toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
    const invoice: Invoice = {
      id: crypto.randomUUID(),
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

  const invoiceText = (inv: Invoice): string => {
    const lines = inv.items.map((it) => `• ${it.description} — ${formatNaira(it.qty * it.unitPrice)}`).join("\n");
    return `${docLabel(inv.status)} from ${inv.businessName}\nCustomer: ${inv.customerName}\n\n${lines}\n\nTotal: ${formatNaira(inv.total)}\nStatus: ${inv.status === "paid" ? "PAID" : "OUTSTANDING"}\n\nCreated with OwoBook`;
  };

  const reminderText = (inv: Invoice): string =>
    `Hi ${inv.customerName}, just a friendly reminder — ${formatNaira(inv.total)} for ${inv.items
      .map((i) => i.description)
      .join(", ")} is still outstanding. Thank you!\n\n— ${inv.businessName}, via OwoBook`;

  const openWhatsApp = (text: string, phone: string) => {
    const encoded = encodeURIComponent(text);
    const { intl } = normalizeNGPhone(phone);
    const url = intl ? `https://wa.me/${intl}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  const shareAsImage = async (inv: Invoice) => {
    setImageBusy(true);
    try {
      const blob = await renderInvoiceImage(inv);
      const file = new File([blob], `${docLabel(inv.status).toLowerCase()}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: `${docLabel(inv.status)} from ${inv.businessName}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${docLabel(inv.status).toLowerCase()}-${inv.customerName}.png`;
        a.click();
        URL.revokeObjectURL(url);
        openWhatsApp(invoiceText(inv), inv.customerPhone);
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
    a.download = `${docLabel(inv.status).toLowerCase()}-${inv.customerName}.png`;
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
    openWhatsApp(`${docLabel(inv.status)} from ${inv.businessName}: ${link}`, inv.customerPhone);
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

  const sendReminder = (inv: Invoice) => openWhatsApp(reminderText(inv), inv.customerPhone);

  const startNewInvoice = () => {
    setBusinessName(savedInvoices[0]?.businessName || "");
    setCustomerName("");
    setCustomerPhone("");
    setItems([emptyItem()]);
    setStatus("paid");
    setActiveId(null);
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

  const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });

  return (
    <div style={{ background: BRAND.bg, minHeight: "100%", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      {/* Remove this block once Fraunces + Inter are linked in index.html */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&display=swap');
        .ob-serif{ font-family:'Fraunces',serif; }
      `}</style>

      <div className="max-w-xl mx-auto px-6 py-10">
        {savedInvoices.length > 0 && step === "form" && (
          <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 mb-6 text-sm" style={{ background: BRAND.lav }}>
            <span className="flex items-center gap-2">
              <Clock size={15} /> {savedInvoices.length} saved on this device{savedInvoices.length >= MAX_GUEST_HISTORY ? " (limit reached)" : ""}.
            </span>
            <button onClick={() => setStep("history")} className="whitespace-nowrap font-semibold underline underline-offset-2 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
        )}

        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full mb-5" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND.green }} />
          Guest mode — no account needed
        </div>

        {step === "history" && (
          <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
            <div className="flex items-center justify-between mb-1">
              <h1 className="ob-serif text-2xl">Saved on this device</h1>
              <button onClick={startNewInvoice} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND.lavStrong }}>
                <FilePlus size={15} /> New
              </button>
            </div>
            <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>
              Guest mode keeps your last {MAX_GUEST_HISTORY} invoices on this device only. Create a free account for unlimited history and backup that follows you across devices.
            </p>
            <div className="flex flex-col gap-2">
              {savedInvoices.map((inv) => (
                <button key={inv.id} onClick={() => openFromHistory(inv.id)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-left" style={{ border: `1px solid ${BRAND.line}` }}>
                  <div>
                    <div className="font-semibold text-sm">{inv.customerName}</div>
                    <div className="text-xs" style={{ color: BRAND.inkSoft }}>{inv.createdAt} · {docLabel(inv.status)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{formatNaira(inv.total)}</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: inv.status === "paid" ? BRAND.mint : BRAND.peach, color: inv.status === "paid" ? BRAND.green : BRAND.red }}>
                      {inv.status === "paid" ? "Paid" : "Due"}
                    </span>
                    <ChevronRight size={16} style={{ color: BRAND.inkSoft }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "form" && (
          <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
            <h1 className="ob-serif text-3xl mb-1">Create {savedInvoices.length > 0 ? "another" : "your first"} invoice</h1>
            <p className="text-sm mb-7" style={{ color: BRAND.inkSoft }}>Fill this in like you would on paper. Nothing is saved anywhere until you say so.</p>

            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Your business name</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Adunni Fashion House" className="w-full rounded-xl px-4 py-3 mb-5 text-sm outline-none" style={inputStyle(false)} />

            <div className="grid grid-cols-2 gap-4 mb-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Customer name</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Chidinma" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle(false)} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Phone (optional)</label>
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0803 123 4567" maxLength={17} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle(!phoneCheck.empty && !phoneCheck.valid)} />
              </div>
            </div>
            <div className="mb-5 min-h-[18px]">
              {!phoneCheck.empty && !phoneCheck.valid && (
                <div className="text-xs mt-1.5" style={{ color: BRAND.red }}>Enter a valid Nigerian number, e.g. 0803 123 4567 or +234 803 123 4567.</div>
              )}
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Items</label>
            <div className="flex flex-col gap-3 mb-3">
              {items.map((it) => (
                <div key={it.id} className="flex gap-2 items-center">
                  <input value={it.description} onChange={(e) => updateItem(it.id, "description", e.target.value)} placeholder="Item or service" className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle(false)} />
                  <input type="number" min={1} value={it.qty} onChange={(e) => updateItem(it.id, "qty", Number(e.target.value))} className="w-16 rounded-xl px-2 py-2.5 text-sm outline-none text-center" style={inputStyle(false)} />
                  <input type="number" min={0} value={it.unitPrice} onChange={(e) => updateItem(it.id, "unitPrice", Number(e.target.value))} placeholder="Price" className="w-28 rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle(false)} />
                  <button onClick={() => removeItem(it.id)} className="p-2 rounded-lg" style={{ color: BRAND.red }} aria-label="Remove item"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: BRAND.lavStrong }}><Plus size={15} /> Add another item</button>

            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Payment status</label>
            <div className="flex gap-2 mb-7">
              <button onClick={() => setStatus("paid")} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ background: status === "paid" ? BRAND.mint : BRAND.card, border: `1px solid ${status === "paid" ? BRAND.green : BRAND.line}`, color: status === "paid" ? BRAND.green : BRAND.inkSoft }}>Paid</button>
              <button onClick={() => setStatus("due")} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ background: status === "due" ? BRAND.peach : BRAND.card, border: `1px solid ${status === "due" ? BRAND.red : BRAND.line}`, color: status === "due" ? BRAND.red : BRAND.inkSoft }}>Outstanding</button>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold" style={{ color: BRAND.inkSoft }}>Total</span>
              <span className="ob-serif text-2xl">{formatNaira(total)}</span>
            </div>

            <button onClick={generateInvoice} disabled={!canGenerate} className="w-full rounded-full py-3.5 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: canGenerate ? 1 : 0.4, cursor: canGenerate ? "pointer" : "not-allowed" }}>
              Generate {docLabel(status).toLowerCase()}
            </button>
          </div>
        )}

        {step === "receipt" && activeInvoice && (
          <div>
            <div className="rounded-3xl p-7 mb-5" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
              <div className="text-center border-b pb-4 mb-4" style={{ borderColor: BRAND.line }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: BRAND.inkSoft }}>{docLabel(activeInvoice.status)}</div>
                <div className="ob-serif text-xl">{activeInvoice.businessName}</div>
                <div className="text-xs mt-1" style={{ color: BRAND.inkSoft }}>
                  {activeInvoice.status === "paid" ? `Paid ${activeInvoice.paidDate}` : `Issued ${activeInvoice.createdAt}`}
                </div>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span style={{ color: BRAND.inkSoft }}>Customer</span>
                <span className="font-semibold">{activeInvoice.customerName}</span>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {activeInvoice.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span>{it.qty} × {it.description}</span>
                    <span>{formatNaira(it.qty * it.unitPrice)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: BRAND.line }}>
                <span className="font-semibold">Total</span>
                <span className="ob-serif text-2xl">{formatNaira(activeInvoice.total)}</span>
              </div>
              <div className="mt-4 flex justify-center">
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: activeInvoice.status === "paid" ? BRAND.mint : BRAND.peach, color: activeInvoice.status === "paid" ? BRAND.green : BRAND.red }}>
                  {activeInvoice.status === "paid" ? "PAID" : "OUTSTANDING"}
                </span>
              </div>
              {activeInvoice.status === "due" && (
                <button onClick={markAsPaid} className="w-full mt-4 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold" style={{ border: `1px solid ${BRAND.green}`, color: BRAND.green }}>
                  <CheckCircle2 size={15} /> Mark as paid
                </button>
              )}
            </div>

            <div className="flex gap-3 mb-3">
              <button onClick={() => shareAsImage(activeInvoice)} disabled={imageBusy} className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg, opacity: imageBusy ? 0.6 : 1 }}>
                <Share2 size={16} /> {imageBusy ? "Preparing image…" : "Share as image"}
              </button>
              <button onClick={() => downloadImage(activeInvoice)} className="flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }} aria-label="Download image"><Download size={16} /></button>
            </div>

            <div className="flex gap-3 mb-5">
              <button onClick={() => shareViaLink(activeInvoice)} disabled={linkLoading} className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }}>
                <LinkIcon size={16} /> {linkLoading ? "Creating link…" : "Share link on WhatsApp"}
              </button>
              <button onClick={() => copyLink(activeInvoice)} className="flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }} aria-label="Copy link">
                {linkCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {hostedLink && (
              <div className="text-xs mb-5 px-1" style={{ color: BRAND.inkSoft }}>
                Link (opens in browser, savable): <span className="underline">{hostedLink}</span>
              </div>
            )}

            <button onClick={() => copyText(activeInvoice)} className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 mb-5 text-sm font-semibold" style={{ color: BRAND.inkSoft }}>
              {copied ? <Check size={14} /> : <Copy size={14} />} Copy as plain text
            </button>

            {activeInvoice.status === "due" && activeInvoice.customerPhone && (
              <button onClick={() => sendReminder(activeInvoice)} className="w-full flex items-center justify-center gap-2 rounded-full py-3 mb-5 text-sm font-semibold" style={{ background: BRAND.peach, color: BRAND.red }}>
                <Bell size={15} /> Send payment reminder
              </button>
            )}

            <div className="rounded-2xl p-5 mb-5 text-sm" style={{ background: BRAND.lav }}>
              <div className="font-semibold mb-1">Want to track whether this gets paid?</div>
              <div style={{ color: BRAND.inkSoft }} className="mb-3">Create a free account to save this {docLabel(activeInvoice.status).toLowerCase()}, see customer history, and get automatic reminders — for free.</div>
              <button onClick={handleCreateAccount} className="rounded-full px-5 py-2.5 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>Create free account</button>
            </div>

            <div className="flex items-center justify-center gap-5">
              <button onClick={startNewInvoice} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND.inkSoft }}><RefreshCw size={14} /> New invoice</button>
              {savedInvoices.length > 1 && (
                <button onClick={() => setStep("history")} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND.inkSoft }}><Clock size={14} /> View all saved</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
