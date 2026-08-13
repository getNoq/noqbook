import { BRAND } from "./theme";
import type { Invoice } from "./invoiceTypes";
import { docLabel, formatNaira } from "./invoiceHelpers";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

function wrapParagraphs(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split("\n");
  const allLines: string[] = [];
  paragraphs.forEach((paragraph) => {
    if (paragraph.trim().length === 0) {
      allLines.push(""); // preserves a blank line between paragraphs
    } else {
      allLines.push(...wrapText(ctx, paragraph, maxWidth));
    }
  });
  return allLines;
}

export async function renderInvoiceImage(invoice: Invoice): Promise<Blob> {
  try {
    await Promise.all([
      document.fonts.load('400 44px "Bebas Neue"'),
      document.fonts.load('400 20px "Inter"'),
      document.fonts.load('500 20px "Inter"'),
      document.fonts.load('600 26px "Inter"'),
      document.fonts.load('700 30px "Inter"'),
    ]);
  } catch {
    // fonts failed to load — proceed with whatever the browser falls back to
  }

  // Same accent color the on-screen receipt uses — falls back to the
  // default ink color when no brand color was set (guest invoices, or
  // an account invoice created before this field existed).
  const accentColor = invoice.brandColor || BRAND.ink;
  const hasNote = !!invoice.note && invoice.note.trim().length > 0;
  const partiallyPaid = invoice.status === "partially_paid";
  const paid = invoice.status === "paid";

  const width = 640;
  const padX = 56;
  const topPad = 60;
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
  const columnGap = 24;
  const descriptionWidth = width - padX * 2 - priceColumnWidth - columnGap;

  const wrappedItems = invoice.items.map((item) => ({
    ...item,
    lines: wrapText(measureCtx, `${item.qty} × ${item.description}`, descriptionWidth),
  }));

  const lineHeight = 30;
  const rowSpacing = 20;
  const itemsH = wrappedItems.reduce((sum, item) => sum + item.lines.length * lineHeight + rowSpacing, 0);

  const gapItemsToDivider2 = 24;
  const gapDivider2ToTotal = 58;
  const totalH = 44;
  const gapTotalToStamp = 24;
  // Two lines (status + amounts) for partially-paid, single-line pill
  // for everything else.
  const stampH = partiallyPaid ? 66 : 40;

  // Note block, only reserved when there's actually a note to draw.
  const gapStampToNote = hasNote ? 28 : 0;
  const noteMaxWidth = width - padX * 2;
  measureCtx.font = '400 18px "Inter", Arial, sans-serif';
//   const noteLines = hasNote ? wrapText(measureCtx, invoice.note!.trim(), noteMaxWidth) : [];
  const noteLines = hasNote ? wrapParagraphs(measureCtx, invoice.note!.trim(), noteMaxWidth) : [];
  const noteLineHeight = 36;
  const noteH = noteLines.length * noteLineHeight;

  const gapStampOrNoteToFooter = 38;
  const footerH = 22;
  const bottomPad = 56;

  const height =
    topPad +
    businessNameH + gapNameToDate + dateH + gapDateToIntro + introH + gapIntroToDivider +
    gapDividerToCustomer + customerH + gapCustomerToItems +
    itemsH +
    gapItemsToDivider2 + gapDivider2ToTotal + totalH + gapTotalToStamp + stampH +
    gapStampToNote + noteH +
    gapStampOrNoteToFooter + footerH +
    bottomPad;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  let y = topPad;

  // Business name — now uses the invoice's accent color instead of a
  // hardcoded BRAND.ink, matching the on-screen receipt.
  ctx.fillStyle = accentColor;
  ctx.textAlign = "center";
  ctx.font = '400 56px "Bebas Neue", Georgia, serif';
  ctx.fillText(invoice.businessName.toUpperCase(), width / 2, y + businessNameH - 14);
  y += businessNameH + gapNameToDate;

  ctx.font = '400 24px "Inter", Arial, sans-serif';
  ctx.fillStyle = "rgba(34,29,23,0.5)";
  ctx.fillText(`Here's your ${docLabel(invoice.status).toLowerCase()} for this purchase`, width / 2, y);
  y += introH + gapIntroToDivider - 14;

  ctx.font = '500 20px "Inter", Arial, sans-serif';
  ctx.fillStyle = "rgba(34,29,23,0.55)";
  ctx.fillText(`${docLabel(invoice.status)} · ${invoice.invoiceNumber} · ${invoice.createdAt}`, width / 2, y);
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
  // y += gapItemsToDivider2;

  ctx.strokeStyle = "rgba(34,29,23,0.15)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padX, y);
  ctx.lineTo(width - padX, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += gapDivider2ToTotal;

  ctx.textAlign = "left";
  ctx.font = '400 36px "Bebas Neue", Arial, sans-serif';
//   ctx.fillStyle = accentColor;
  ctx.fillStyle = "#000";
  ctx.fillText("Total", padX, y);
  ctx.textAlign = "right";
  ctx.font = '400 56px "Bebas Neue", Georgia, serif';
  // Total amount — same accentColor swap as the business name above.
  ctx.fillStyle = accentColor;
  ctx.fillText(formatNaira(invoice.total, "code"), width - padX, y);
  y += totalH + gapTotalToStamp;

  if (partiallyPaid) {
    const amountPaid = invoice.amountPaid ?? 0;
    const amountDue = invoice.amountDue ?? invoice.total - amountPaid;
    const line1 = "PARTIALLY PAID";
    const line2 = `${formatNaira(amountPaid)} paid · ${formatNaira(amountDue)} outstanding`;

    // =========================
    // ADJUST PADDING HERE
    // =========================
    const line1PaddingX = 22; // Left/right breathing room for line 1
    const line1PaddingY = 8;  // Top/bottom breathing room for line 1

    const line2PaddingX = 22; // Left/right breathing room for line 2
    const line2PaddingY = 6;  // Top/bottom breathing room for line 2

    const gap = 16; // Space between line 1 and line 2

    // Measure line 1
    ctx.font = '700 18px "Inter", Arial, sans-serif';
    const line1Width = ctx.measureText(line1).width;

    // Measure line 2
    ctx.font = '600 15px "Inter", Arial, sans-serif';
    const line2Width = ctx.measureText(line2).width;

    // Heights based on text + vertical padding
    const line1H = 18 + line1PaddingY * 2;
    const line2H = 15 + line2PaddingY * 2;

    // Each background fits its own content
    const line1W = line1Width + line1PaddingX * 2;
    const line2W = line2Width + line2PaddingX * 2;

    // =========================
    // LINE 1 — PARTIALLY PAID
    // =========================
    const line1X = width / 2 - line1W / 2;
    const line1Y = y - (line1H + gap + line2H) / 2;

    ctx.fillStyle = "#FDECC8";
    ctx.beginPath();
    ctx.roundRect(
      line1X,
      line1Y,
      line1W,
      line1H,
      16
    );
    ctx.fill();

    // Line 1 text
    ctx.fillStyle = "#B7791F";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 18px "Inter", Arial, sans-serif';

    ctx.fillText(
      line1,
      width / 2,
      line1Y + line1H / 2
    );

    // =========================
    // LINE 2 — PAYMENT DETAILS
    // =========================
    const line2X = width / 2 - line2W / 2;
    const line2Y = line1Y + line1H + gap;

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(
      line2X,
      line2Y,
      line2W,
      line2H,
      14
    );
    ctx.fill();

    // Line 2 text
    ctx.fillStyle = "rgba(34,29,23,0.55)";
    ctx.font = '400 22px "Inter", Arial, sans-serif';

    ctx.fillText(
      line2,
      width / 2,
      line2Y + line2H / 2
    );
  } else {
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
  }
  y += stampH + 8;

  if (hasNote) {
    y += gapStampToNote;

    ctx.textAlign = "left";
    ctx.font = '400 28px "Bebas Neue", Arial, sans-serif';
    ctx.fillStyle = "#374151";
    ctx.fillText("Note:", padX, y);
    // y += noteH;
  }

  // Note — italic, centered, wrapped, drawn only when present. Sits
  // between the paid/outstanding stamp and the "Powered by" footer.
  if (hasNote) {
    y += gapStampToNote;
    ctx.font = '400 22px "Inter", Arial, sans-serif';
    ctx.fillStyle = "rgba(34,29,23,0.55)";
    ctx.textAlign = "left";
    noteLines.forEach((line, index) => {
      ctx.fillText(line, padX, y + index * noteLineHeight);
    });
    y += noteH;
  }

//   y += gapStampOrNoteToFooter

  ctx.strokeStyle = "rgba(34,29,23,0.15)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padX, y);
  ctx.lineTo(width - padX, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += gapDivider2ToTotal - 16;

  ctx.fillStyle = "rgba(34,29,23,0.4)";
  ctx.font = '400 20px "Inter", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("Powered by Yousual", width / 2, y);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png");
  });
}