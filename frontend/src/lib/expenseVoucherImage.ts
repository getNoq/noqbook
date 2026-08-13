import { BRAND } from "./theme";
import { wrapParagraphs } from "./canvasText";

export interface VoucherData {
  amount: number;
  categoryDisplay: string;
  expenseDateDisplay: string;
  title?: string;
  note?: string;
}

export async function renderExpenseVoucherImage(
  data: VoucherData,
  businessName: string
): Promise<Blob> {
  try {
    await Promise.all([
      document.fonts.load('400 40px "Bebas Neue"'),
      document.fonts.load('400 16px "Inter"'),
      document.fonts.load('600 16px "Inter"'),
      document.fonts.load('600 20px "Inter"'),
    ]);
  } catch {
    // fonts failed to load — proceed with browser fallback
  }

  const width = 520;
  const padX = 48;

  // =========================
  // MEASURE CONTENT
  // =========================

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d")!;

  measureCtx.font = '400 16px "Inter", Arial, sans-serif';

  const noteLines = data.note
    ? wrapParagraphs(measureCtx, data.note, width - padX * 2)
    : [];

  const noteLineHeight = 22;

  // Heights are based on the actual content.
  const noteBlockH = noteLines.length
    ? noteLines.length * noteLineHeight
    : 0;

  const hasTitle = !!data.title?.trim();

  // =========================
  // CALCULATE TOTAL HEIGHT
  // =========================

  const topPadding = 56;
  const businessNameH = 40;
  const subtitleH = 40;

  const titleH = hasTitle ? 36 : 0;
  const titleBottomSpacing = hasTitle ? 5 : 0;

  const dividerTopSpacing = 0;
  const dividerBottomSpacing = 20;

  const detailsH = 30;

  // Only add note spacing when a note actually exists.
  const noteSpacingBefore = noteLines.length ? 0 : 0;
  const noteSpacingAfter = noteLines.length ? 40 : 0;

  const amountH = 40;
  const amountBottomSpacing = 20;

  const bottomDividerSpacing = 30;
  const footerH = 20;
  const bottomPadding = 30;

  const height =
    topPadding +
    businessNameH +
    subtitleH +
    titleH +
    titleBottomSpacing +
    dividerTopSpacing +
    dividerBottomSpacing +
    detailsH +
    noteSpacingBefore +
    noteBlockH +
    noteSpacingAfter +
    amountH +
    amountBottomSpacing +
    bottomDividerSpacing +
    footerH +
    bottomPadding;

  // =========================
  // CREATE CANVAS
  // =========================

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  let y = topPadding;

  // =========================
  // BUSINESS NAME
  // =========================

  ctx.textAlign = "center";
  ctx.fillStyle = BRAND.ink;
  ctx.font = '400 40px "Bebas Neue", Georgia, serif';
  ctx.fillText(businessName.toUpperCase(), width / 2, y);

  y += businessNameH - 10;

  // =========================
  // EXPENSE VOUCHER
  // =========================

  ctx.font = '600 14px "Inter", Arial, sans-serif';
  ctx.fillStyle = "rgba(34,29,23,0.5)";
  ctx.fillText("EXPENSE VOUCHER", width / 2, y);

  y += subtitleH;

  // =========================
  // TITLE — ONLY IF PRESENT
  // =========================

  if (hasTitle) {
    ctx.font = '600 20px "Inter", Arial, sans-serif';
    ctx.fillStyle = BRAND.ink;
    ctx.fillText(data.title!.trim(), width / 2, y);

    y += titleH;
    y += titleBottomSpacing;
  }

  // =========================
  // DIVIDER
  // =========================

  ctx.strokeStyle = "rgba(34,29,23,0.15)";
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(padX, y);
  ctx.lineTo(width - padX, y);
  ctx.stroke();

  ctx.setLineDash([]);

  y += dividerBottomSpacing + 20;

  // =========================
  // CATEGORY + DATE
  // =========================

  ctx.textAlign = "left";
  ctx.font = '600 16px "Inter", Arial, sans-serif';
  ctx.fillStyle = BRAND.ink;
  ctx.fillText(data.categoryDisplay, padX, y);

  ctx.textAlign = "right";
  ctx.font = '400 15px "Inter", Arial, sans-serif';
  ctx.fillStyle = "rgba(34,29,23,0.55)";
  ctx.fillText(data.expenseDateDisplay, width - padX, y);

  y += detailsH;

  // =========================
  // NOTE — GROWS WITH CONTENT
  // =========================

  if (noteLines.length) {
    y += noteSpacingBefore;

    ctx.textAlign = "left";
    ctx.font = '400 16px "Inter", Arial, sans-serif';
    ctx.fillStyle = "rgba(34,29,23,0.6)";

    noteLines.forEach((line, i) => {
      ctx.fillText(line, padX, y + i * noteLineHeight);
    });

    y += noteBlockH;
    y += noteSpacingAfter;
  }

  // =========================
  // AMOUNT
  // =========================

  ctx.textAlign = "center";
  ctx.font = '400 44px "Bebas Neue", Georgia, serif';
  ctx.fillStyle = BRAND.red;

  ctx.fillText(
    `NGN ${Number(data.amount).toLocaleString("en-NG")}`,
    width / 2,
    y
  );

  y += amountH - 20;
  y += amountBottomSpacing;

  // =========================
  // BOTTOM DIVIDER
  // =========================

  ctx.strokeStyle = "rgba(34,29,23,0.15)";
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(padX, y);
  ctx.lineTo(width - padX, y);
  ctx.stroke();

  ctx.setLineDash([]);

  y += bottomDividerSpacing;

  // =========================
  // FOOTER
  // =========================

  ctx.textAlign = "center";
  ctx.font = '400 16px "Inter", Arial, sans-serif';
  ctx.fillStyle = "rgba(34,29,23,0.4)";
  ctx.fillText("Powered by Yousual", width / 2, y);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("toBlob failed")),
      "image/png"
    );
  });
}