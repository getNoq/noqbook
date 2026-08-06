import { useState, useMemo } from "react";
import {
  Plus, Trash2, Share2, Copy, RefreshCw, Check,
  Download, Link as LinkIcon, Bell, CheckCircle2, Clock, ChevronRight, FilePlus,
  Palette, Lock, Menu, X,
} from "lucide-react";

/**
 * GuestInvoiceFlow (TypeScript)
 * ------------------------------------------------------------------
 * Client-side guest mode for Yousual — no account, no auth.
 *
 * This version adds:
 *  1. Sequential invoice numbers (INV-001, INV-002, ...), persisted
 *     separately from the invoice list itself so numbering keeps
 *     climbing even after old invoices age out of MAX_GUEST_HISTORY.
 *  2. A written WhatsApp caption instead of letting WhatsApp's own
 *     generic share sheet text stand in -- see shareCaption().
 *  3 & 4. Brand color and Notes are shown as locked previews for guests
 *     (swatches + example note text, both disabled) with a gentle
 *     "create a free account" prompt -- neither is actually functional
 *     here, since both are explicitly account-gated. The real color
 *     picker and note editor belong in the signed-in app, not this file.
 *  5. Minimal sticky app header (logo + exit link + account CTA), and
 *     a single consolidated guest-mode status line (replaces the old
 *     pill + separate "N saved" banner) that changes copy based on how
 *     many invoices are on this device -- see guestStatusMessage().
 *
 * Setup required in your project:
 *  1. `npm install lucide-react`.
 *  2. Add Fraunces + Inter + Bebas Neue <link> tags to index.html and
 *     delete the inline @import fallback below once you do.
 *  3. Replace `uploadInvoiceAndGetLink()` with a real Django API call.
 *  4. Wire `handleCreateAccount()` to your real signup route.
 *  5. Point MARKETING_SITE_URL at the real marketing site / exit route.
 */

// ---------- Types ----------

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number | "";
  unitPrice: number | "";
}

export type InvoiceStatus = "paid" | "due";

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-001"
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

// Where the header logo / "Exit guest mode" link should send people.
// Point this at the real marketing site root or app route.
const MARKETING_SITE_URL = "/";

// Guest mode is capped on purpose: unlimited local history would remove
// the reason to ever create an account. Unlimited history + cross-device
// backup stays a genuine paid/free-account benefit. Raise this if you want
// guest mode to feel more generous, but keep some cap.
const MAX_GUEST_HISTORY = 3;
const STORAGE_KEY = "owobook_guest_invoices";
const INVOICE_COUNTER_KEY = "owobook_invoice_counter";

// Free accounts get to pick from these; guests only get to look. Values
// are illustrative -- swap for whatever the real signed-in picker uses.
const PRESET_COLORS: { name: string; value: string }[] = [
  { name: "Yousual Green", value: BRAND.green },
  { name: "Blue", value: "#3B82F6" },
  { name: "Black", value: "#141414" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Orange", value: "#F97316" },
];

// Default note text by document type. "Quote" isn't a status this app
// tracks yet (only paid/due exist) -- left here as a ready slot for when
// a quote/estimate document type gets added, rather than wired up now.
const NOTE_DEFAULTS: Record<InvoiceStatus, string> = {
  due: "Payment due within 7 days.",
  paid: "Thank you for your payment!",
};

// ---------- Helpers ----------

const emptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: "",
  qty: 1,
  unitPrice: 0,
});

const formatNaira = (
  n: number,
  currency: "symbol" | "code" = "symbol"
): string => {
  const amount = Number(n || 0).toLocaleString("en-NG");
  return currency === "code" ? `NGN ${amount}` : `₦${amount}`;
};
const docLabel = (status: InvoiceStatus): string => (status === "paid" ? "Receipt" : "Invoice");

/**
 * Single source of truth for the guest-mode status line shown under the
 * header. One message, three states, instead of a separate "guest mode"
 * pill plus a separate "N saved" banner saying overlapping things.
 */
function guestStatusMessage(count: number): string {
  if (count === 0) return "Guest Mode — invoices stay on this device only.";
  if (count >= MAX_GUEST_HISTORY) {
    return `${count} of ${MAX_GUEST_HISTORY} saved on this device (limit reached). Creating another invoice will replace your oldest one.`;
  }
  return `${count} of ${MAX_GUEST_HISTORY} used on this device. Create a free account to save unlimited ones.`;
}

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

/**
 * Sequential invoice numbers, stored separately from the invoice list so
 * numbering keeps climbing even once old invoices fall off the capped
 * history array. Falls back to a timestamp-derived number if storage is
 * unavailable (private browsing etc.) so generation never hard-fails.
 */
function getNextInvoiceNumber(): string {
  let n: number;
  try {
    const raw = localStorage.getItem(INVOICE_COUNTER_KEY);
    n = raw ? parseInt(raw, 10) + 1 : 1;
    localStorage.setItem(INVOICE_COUNTER_KEY, String(n));
  } catch {
    n = Number(String(Date.now()).slice(-4));
  }
  return `INV-${String(n).padStart(3, "0")}`;
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;

    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);

  return lines;
}

async function renderInvoiceImage(invoice: Invoice): Promise<Blob> {
  // Custom web fonts aren't guaranteed to be ready just because they're linked
  // in index.html -- canvas will silently fall back to a system font if the
  // face hasn't finished loading. Explicitly wait for the exact families/weights
  // used below before drawing anything.
  try {
    await Promise.all([
      document.fonts.load('400 44px "Bebas Neue"'),
      document.fonts.load('400 20px "Inter"'),
      document.fonts.load('500 20px "Inter"'),
      document.fonts.load('600 26px "Inter"'),
      document.fonts.load('700 30px "Inter"'),
    ]);
  } catch {
    // fonts failed to load (offline, not linked, etc.) -- proceed with
    // whatever the browser falls back to rather than blocking the export
  }

  const width = 600;
  const padX = 56;
  const topPad = 60;
  // const bottomPad = 56;

  const businessNameH = 50;
  const gapNameToDate = 30;
  const dateH = 22;
  const gapDateToIntro = 24;
  const introH = 24;
  const gapIntroToDivider = 34;

  const gapDividerToCustomer = 48;
  const customerH = 30;
  const gapCustomerToItems = 34;

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d")!;
  measureCtx.font = '400 22px "Inter", Arial, sans-serif';

  const priceColumnWidth = 130;
  const columnGap = 24; // gap between description and price

  const descriptionWidth =
    width - padX * 2 - priceColumnWidth - columnGap;

  const wrappedItems = invoice.items.map((item) => ({
    ...item,
    lines: wrapText(
      measureCtx,
      `${item.qty} × ${item.description}`,
      descriptionWidth
    ),
  }));

  const lineHeight = 30;
  const rowSpacing = 20;

  const itemsH = wrappedItems.reduce(
    (sum, item) => sum + item.lines.length * lineHeight + rowSpacing,
    0
  );

  const gapItemsToDivider2 = 24;
  const gapDivider2ToTotal = 58;
  const totalH = 44;
  const gapTotalToStamp = 44;
  const stampH = 40;
  const gapStampToFooter = 38;
  const footerH = 22;
  const bottomPad = 56;

  const height =
    topPad +
    businessNameH + gapNameToDate + dateH + gapDateToIntro + introH + gapIntroToDivider +
    gapDividerToCustomer + customerH + gapCustomerToItems +
    itemsH +
    gapItemsToDivider2 + gapDivider2ToTotal + totalH + gapTotalToStamp + stampH + gapStampToFooter + footerH +
    bottomPad;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  let y = topPad;

  // Business name -- Bebas Neue, a condensed display face designed for
  // uppercase, so the source string is upper-cased for it to read correctly.
  ctx.fillStyle = BRAND.ink;
  ctx.textAlign = "center";
  ctx.font = '400 56px "Bebas Neue", Georgia, serif';
  ctx.fillText(invoice.businessName.toUpperCase(), width / 2, y + businessNameH - 14);
  y += businessNameH + gapNameToDate;

  // A plain-language line explaining what this document is, worded from
  // the doc's own status so it never says the wrong thing.
  ctx.font = '400 24px "Inter", Arial, sans-serif';
  ctx.fillStyle = "rgba(34,29,23,0.5)";
  ctx.fillText(`Here's your ${docLabel(invoice.status).toLowerCase()} for this purchase`, width / 2, y);
  y += introH + gapIntroToDivider;

  // Doc type · invoice number · date, all in one meta line
  ctx.font = '500 20px "Inter", Arial, sans-serif';
  ctx.fillStyle = "rgba(34,29,23,0.55)";
  ctx.fillText(
    `${docLabel(invoice.status)} · ${invoice.invoiceNumber} · ${invoice.createdAt}`,
    width / 2,
    y
  );
  y += dateH + gapDateToIntro;

  ctx.strokeStyle = "rgba(34,29,23,0.15)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padX, y);
  ctx.lineTo(width - padX, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += gapDividerToCustomer;

  ctx.textAlign = "left";
  ctx.font = '600 24px "Inter", Arial, sans-serif';
  ctx.fillStyle = BRAND.ink;
  ctx.fillText(`Customer: ${invoice.customerName}`, padX, y);
  y += customerH + gapCustomerToItems;

  ctx.font = '400 22px "Inter", Arial, sans-serif';
  wrappedItems.forEach((it) => {
    ctx.textAlign = "left";
    ctx.fillStyle = BRAND.ink;

    it.lines.forEach((line, index) => {
      ctx.fillText(line, padX, y + index * lineHeight);
    });

    ctx.textAlign = "right";
    ctx.fillText(formatNaira(Number(it.qty) * Number(it.unitPrice)), width - padX, y);

    y += it.lines.length * lineHeight + rowSpacing;
  });
  y += gapItemsToDivider2;

  ctx.strokeStyle = "rgba(34,29,23,0.15)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padX, y);
  ctx.lineTo(width - padX, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += gapDivider2ToTotal;

  ctx.textAlign = "left";
  ctx.font = '400 44px "Bebas Neue", Arial, sans-serif';
  ctx.fillStyle = BRAND.ink;
  ctx.fillText("Total", padX, y);
  ctx.textAlign = "right";
  ctx.font = '400 48px "Bebas Neue", Georgia, serif';
  ctx.fillText(formatNaira(invoice.total, "code"), width - padX, y);
  y += totalH + gapTotalToStamp;

  const paid = invoice.status === "paid";
  ctx.fillStyle = paid ? "#DBF3E7" : "#FFE4CD";
  const stampText = paid ? `PAID${invoice.paidDate ? " · " + invoice.paidDate : ""}` : "OUTSTANDING";
  ctx.font = '700 18px "Inter", Arial, sans-serif';
  const stampWidth = ctx.measureText(stampText).width + 40;
  ctx.beginPath();
  ctx.roundRect(width / 2 - stampWidth / 2, y - stampH / 2 - 4, stampWidth, stampH, stampH / 2);
  ctx.fill();
  ctx.fillStyle = paid ? BRAND.green : BRAND.red;
  ctx.textAlign = "center";
  ctx.fillText(stampText, width / 2, y + 2);
  y += stampH / 2 + gapStampToFooter;

  ctx.fillStyle = "rgba(34,29,23,0.4)";
  ctx.font = '400 20px "Inter", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("Powered by Yousual", width / 2, y);

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
  await new Promise((r) => setTimeout(r, 700));
  const fakeId = invoice.businessName.slice(0, 3).toLowerCase() + Date.now().toString().slice(-5);
  return `https://noqbook.com/i/${fakeId}`;
}

// ---------- Header ----------

/**
 * Minimal, app-style header: logo (left, links out) and exit / account
 * actions (right), always on one line. Kept deliberately quiet -- its
 * job is orientation ("where am I, how do I leave"), not selling.
 */
function AppHeader({ onCreateAccount }: { onCreateAccount: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <a href={MARKETING_SITE_URL} className="shrink-0" aria-label="Yousual">
          <img src="/images/yousual-logomark.svg" alt="NOQ logomark" height={56} width={160} />
        </a>

        <div className="flex items-center gap-4">
          
          <a href={MARKETING_SITE_URL}
            className="text-sm font-medium whitespace-nowrap"
            style={{ color: BRAND.inkSoft }}
          >
            <span className="hidden sm:inline">Exit guest mode</span>
            <span className="sm:hidden">Exit</span>
          </a>

          {/* Desktop: full button, hidden below sm */}
          <button
            onClick={onCreateAccount}
            className="hidden sm:inline-flex font-heading rounded-full bg-ink px-6 py-3 text-[14px] tracking-[10%] text-white transition-colors hover:bg-neutral-800"
          >
            Create free account
          </button>

          {/* Mobile: hamburger toggle, hidden at sm and up */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden p-2 -mr-2 rounded-lg"
            style={{ color: BRAND.ink }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel — only the account CTA lives here */}
      {menuOpen && (
        <div
          className="sm:hidden border-t px-6 py-4 border-black/5 bg-white"
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              onCreateAccount();
            }}
            className="w-full font-heading rounded-full bg-ink px-6 py-3 text-[14px] tracking-[10%] text-white transition-colors hover:bg-neutral-800"
          >
            Create free account
          </button>
        </div>
      )}
    </header>
  );
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

  const invoiceText = (inv: Invoice): string => {
    const lines = inv.items.map((it) => `• ${it.description} — ${formatNaira((Number(it.qty) * Number(it.unitPrice)))}`).join("\n");
    return `${docLabel(inv.status)} ${inv.invoiceNumber} from ${inv.businessName}\nCustomer: ${inv.customerName}\n\n${lines}\n\nTotal: ${formatNaira(inv.total)}\nStatus: ${inv.status === "paid" ? "PAID" : "OUTSTANDING"}\n\nCreated with Yousual (https://yousual.com)`;
  };

  const reminderText = (inv: Invoice): string =>
    `Hi ${inv.customerName}, just a friendly reminder — ${formatNaira(inv.total)} for ${inv.items
      .map((i) => i.description)
      .join(", ")} (${inv.invoiceNumber}) is still outstanding. Thank you!\n\n— ${inv.businessName}, via Yousual`;

  /**
   * The friendly WhatsApp caption, replacing whatever generic text WhatsApp's
   * own share sheet would otherwise show. Wording is chosen by status so it
   * never says the wrong thing (a paid receipt never asks to be paid, etc).
   */
  const shareCaption = (inv: Invoice, link?: string): string => {
    const base =
      inv.status === "paid"
        ? `Thanks for your payment! Here's your receipt from ${inv.businessName}.`
        : `Hi ${inv.customerName}, here's your invoice from ${inv.businessName}. You can view or download it using the link below.`;
    return link ? `${base}\n${link}` : base;
  };

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

  const sendReminder = (inv: Invoice) => openWhatsApp(reminderText(inv), inv.customerPhone);

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

  const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });

  const atLimit = savedInvoices.length >= MAX_GUEST_HISTORY;

  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      {/* Remove this block once Fraunces + Inter + Bebas Neue are linked in index.html */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=Bebas+Neue&display=swap');
        .ob-serif{ font-family:'Fraunces',serif; }
      `}</style>

      <AppHeader onCreateAccount={handleCreateAccount} />

      <div className="max-w-xl mx-auto px-6 py-6">
        {/* Single consolidated guest-mode status line -- replaces the old
            separate "Guest mode" pill + "N saved" banner. Copy and color
            shift with how close the device is to the cap. */}
        <div
          className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 mb-4 text-sm"
          style={{
            background: atLimit ? BRAND.peach : BRAND.lav,
            color: atLimit ? BRAND.red : BRAND.ink,
          }}
        >
          <span className="flex items-center gap-2">
            <Clock size={15} className="shrink-0" />
            {guestStatusMessage(savedInvoices.length)}
          </span>
          {savedInvoices.length > 0 && step !== "history" && (
            <button
              onClick={() => setStep("history")}
              className="whitespace-nowrap font-semibold underline underline-offset-2 flex items-center gap-1 shrink-0"
            >
              View all <ChevronRight size={14} />
            </button>
          )}
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
              {/* Only your last {MAX_GUEST_HISTORY} stay here. Create a free account for unlimited history across devices. */}
              Guest mode keeps your last {MAX_GUEST_HISTORY} records on this device only. Create a free account for unlimited history and backup that follows you across devices.
            </p>
            <div className="flex flex-col gap-2">
              {savedInvoices.map((inv) => (
                <button key={inv.id} onClick={() => openFromHistory(inv.id)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-left" style={{ border: `1px solid ${BRAND.line}` }}>
                  <div>
                    <div className="font-semibold text-sm">{inv.customerName}</div>
                    <div className="text-xs" style={{ color: BRAND.inkSoft }}>{inv.invoiceNumber} · {inv.createdAt} · {docLabel(inv.status)}</div>
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
            <h1 className="font-heading text-[28px] md:text-[40px]">Create {savedInvoices.length > 0 ? "another" : "your first"} invoice</h1>
            <p className="text-sm mb-7" style={{ color: BRAND.inkSoft }}>Fill this out like paper. Nothing is saved until you say so.</p>

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
            <div className="mb-2 min-h-[18px]">
              {!phoneCheck.empty && !phoneCheck.valid && (
                <div className="text-xs mt-1.5" style={{ color: BRAND.red }}>Enter a valid Nigerian number, e.g. 0803 123 4567 or +234 803 123 4567.</div>
              )}
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Items</label>
            <div className="flex flex-col gap-3 mb-3">
              {items.map((it) => (
                <div key={it.id} className="flex flex-wrap md:flex-nowrap gap-2 items-center w-full">
                  <input
                    value={it.description}
                    onChange={(e) => updateItem(it.id, "description", e.target.value)}
                    placeholder="Item or service"
                    className="w-full md:flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={inputStyle(false)}
                  />
                  <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
                    <input 
                      type="number" 
                      min={1} 
                      value={it.qty || ""} 
                      placeholder="Qty" 
                      onChange={(e) => updateItem(it.id, "qty", e.target.value === "" ? "" : Number(e.target.value))} 
                      className="w-16 rounded-xl px-2 py-2.5 text-sm outline-none text-center" 
                      style={inputStyle(false)} 
                      required 
                    /> 

                    <input 
                      type="number" 
                      min={0} 
                      value={it.unitPrice || ""} 
                      placeholder="Price" 
                      onChange={(e) => updateItem(it.id, "unitPrice", e.target.value === "" ? "" : Number(e.target.value))} 
                      className="flex-1 md:w-28 rounded-xl px-3 py-2.5 text-sm outline-none" 
                      style={inputStyle(false)} 
                      required 
                    />
                    <button
                      onClick={() => removeItem(it.id)}
                      className="p-2 rounded-lg shrink-0"
                      style={{ color: BRAND.red }}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: BRAND.lavStrong }}><Plus size={15} /> Add another item</button>

            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Payment status</label>
            <div className="flex gap-2 mb-6">
              <button onClick={() => setStatus("paid")} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ background: status === "paid" ? BRAND.mint : BRAND.card, border: `1px solid ${status === "paid" ? BRAND.green : BRAND.line}`, color: status === "paid" ? BRAND.green : BRAND.inkSoft }}>Paid</button>
              <button onClick={() => setStatus("due")} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ background: status === "due" ? BRAND.peach : BRAND.card, border: `1px solid ${status === "due" ? BRAND.red : BRAND.line}`, color: status === "due" ? BRAND.red : BRAND.inkSoft }}>Outstanding</button>
            </div>

            {/* Notes — account-gated. Guests see a preview of the default text
                (matched to the current status) but can't type, edit, or remove
                it. This is intentionally a locked preview, not a disabled
                form field, so it reads as "here's what you'd get" rather than
                a broken input. */}
            <div className="rounded-xl px-4 py-3.5 mb-6 flex items-start gap-3" style={{ border: `1px dashed ${BRAND.line}` }}>
              <Lock size={15} style={{ color: BRAND.inkSoft, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: BRAND.inkSoft }}>
                  Notes (optional)
                </div>
                <div className="text-sm italic mb-1.5" style={{ color: BRAND.inkSoft }}>
                  "{NOTE_DEFAULTS[status]}"
                </div>
                <div className="text-xs" style={{ color: BRAND.inkSoft }}>
                  Add custom notes with a free account.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold" style={{ color: BRAND.inkSoft }}>Total</span>
              <span className="font-heading text-[32px]">{formatNaira(total)}</span>
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
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: BRAND.inkSoft }}>
                  {docLabel(activeInvoice.status)} · {activeInvoice.invoiceNumber}
                </div>
                <div className="font-heading text-[32px]">{activeInvoice.businessName}</div>
                <div className="text-xs mt-1" style={{ color: BRAND.inkSoft }}>
                  {activeInvoice.status === "paid" ? `Paid ${activeInvoice.paidDate}` : `Issued ${activeInvoice.createdAt}`}
                </div>
              </div>
              <div className="flex justify-between text-sm mb-4 gap-4">
                <span style={{ color: BRAND.inkSoft }}>Customer</span>
                <span className="font-semibold">{activeInvoice.customerName}</span>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {activeInvoice.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm gap-4">
                    <span>{it.qty} × {it.description}</span>
                    <span>{formatNaira(Number(it.qty) * Number(it.unitPrice))}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: BRAND.line }}>
                <span className="font-semibold">Total</span>
                <span className="font-heading text-[32px]">{formatNaira(activeInvoice.total, "code")}</span>
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

            {/* Brand color — account-gated. Swatches are shown but locked, so
                the feature is visible and desirable rather than hidden, per
                "gentle, value-based prompt rather than a hard block". */}
            <div className="rounded-2xl p-5 mb-5" style={{ border: `1px solid ${BRAND.line}` }}>
              <button onClick={() => setShowColorTeaser((s) => !s)} className="w-full flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Palette size={16} /> Customize color
                </span>
                <span className="text-xs font-semibold" style={{ color: BRAND.inkSoft }}>
                  {showColorTeaser ? "Hide" : "Show"}
                </span>
              </button>
              {showColorTeaser && (
                <div className="mt-4">
                  <div className="flex gap-3 mb-4">
                    {PRESET_COLORS.map((c) => (
                      <div
                        key={c.name}
                        title={c.name}
                        className="relative w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: c.value, opacity: 0.45 }}
                      >
                        <Lock size={13} color="#FFFFFF" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm mb-3" style={{ color: BRAND.inkSoft }}>
                    Personalize your records with brand colors when you sign up for free.
                  </div>
                  {/* <button onClick={handleCreateAccount} className="rounded-full px-5 py-2 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
                    Sign up for free
                  </button> */}
                </div>
              )}
            </div>

            <div className="rounded-2xl p-5 mb-5 text-sm" style={{ background: BRAND.lav }}>
              <div className="font-semibold mb-1">Want to track whether this gets paid?</div>
              <div style={{ color: BRAND.inkSoft }} className="mb-3">Save this {docLabel(activeInvoice.status).toLowerCase()}, see customer history, and get automatic reminders — for free.</div>
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