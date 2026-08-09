// import { BRAND } from "../../lib/theme";
// import type { Invoice } from "./types";
// import { docLabel, formatNaira } from "./invoiceHelpers";

// function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
//   const words = text.split(" ");
//   const lines: string[] = [];
//   let line = "";

//   for (const word of words) {
//     const test = line ? `${line} ${word}` : word;

//     if (ctx.measureText(test).width <= maxWidth) {
//       line = test;
//     } else {
//       if (line) lines.push(line);
//       line = word;
//     }
//   }

//   if (line) lines.push(line);

//   return lines;
// }

// export async function renderInvoiceImage(invoice: Invoice): Promise<Blob> {
//   // Custom web fonts aren't guaranteed to be ready just because they're linked
//   // in index.html -- canvas will silently fall back to a system font if the
//   // face hasn't finished loading. Explicitly wait for the exact families/weights
//   // used below before drawing anything.
//   try {
//     await Promise.all([
//       document.fonts.load('400 44px "Bebas Neue"'),
//       document.fonts.load('400 20px "Inter"'),
//       document.fonts.load('500 20px "Inter"'),
//       document.fonts.load('600 26px "Inter"'),
//       document.fonts.load('700 30px "Inter"'),
//     ]);
//   } catch {
//     // fonts failed to load (offline, not linked, etc.) -- proceed with
//     // whatever the browser falls back to rather than blocking the export
//   }

//   const width = 600;
//   const padX = 56;
//   const topPad = 60;

//   const businessNameH = 50;
//   const gapNameToDate = 30;
//   const dateH = 22;
//   const gapDateToIntro = 24;
//   const introH = 24;
//   const gapIntroToDivider = 34;

//   const gapDividerToCustomer = 48;
//   const customerH = 30;
//   const gapCustomerToItems = 34;

//   const measureCanvas = document.createElement("canvas");
//   const measureCtx = measureCanvas.getContext("2d")!;
//   measureCtx.font = '400 22px "Inter", Arial, sans-serif';

//   const priceColumnWidth = 130;
//   const columnGap = 24; // gap between description and price

//   const descriptionWidth = width - padX * 2 - priceColumnWidth - columnGap;

//   const wrappedItems = invoice.items.map((item) => ({
//     ...item,
//     lines: wrapText(measureCtx, `${item.qty} × ${item.description}`, descriptionWidth),
//   }));

//   const lineHeight = 30;
//   const rowSpacing = 20;

//   const itemsH = wrappedItems.reduce((sum, item) => sum + item.lines.length * lineHeight + rowSpacing, 0);

//   const gapItemsToDivider2 = 24;
//   const gapDivider2ToTotal = 58;
//   const totalH = 44;
//   const gapTotalToStamp = 44;
//   const stampH = 40;
//   const gapStampToFooter = 38;
//   const footerH = 22;
//   const bottomPad = 56;

//   const height =
//     topPad +
//     businessNameH + gapNameToDate + dateH + gapDateToIntro + introH + gapIntroToDivider +
//     gapDividerToCustomer + customerH + gapCustomerToItems +
//     itemsH +
//     gapItemsToDivider2 + gapDivider2ToTotal + totalH + gapTotalToStamp + stampH + gapStampToFooter + footerH +
//     bottomPad;

//   const canvas = document.createElement("canvas");
//   canvas.width = width;
//   canvas.height = height;
//   const ctx = canvas.getContext("2d");
//   if (!ctx) throw new Error("Canvas context unavailable");

//   ctx.fillStyle = "#FFFFFF";
//   ctx.fillRect(0, 0, width, height);

//   let y = topPad;

//   // Business name -- Bebas Neue, a condensed display face designed for
//   // uppercase, so the source string is upper-cased for it to read correctly.
//   ctx.fillStyle = BRAND.ink;
//   ctx.textAlign = "center";
//   ctx.font = '400 56px "Bebas Neue", Georgia, serif';
//   ctx.fillText(invoice.businessName.toUpperCase(), width / 2, y + businessNameH - 14);
//   y += businessNameH + gapNameToDate;

//   // A plain-language line explaining what this document is, worded from
//   // the doc's own status so it never says the wrong thing.
//   ctx.font = '400 24px "Inter", Arial, sans-serif';
//   ctx.fillStyle = "rgba(34,29,23,0.5)";
//   ctx.fillText(`Here's your ${docLabel(invoice.status).toLowerCase()} for this purchase`, width / 2, y);
//   y += introH + gapIntroToDivider;

//   // Doc type · invoice number · date, all in one meta line
//   ctx.font = '500 20px "Inter", Arial, sans-serif';
//   ctx.fillStyle = "rgba(34,29,23,0.55)";
//   ctx.fillText(`${docLabel(invoice.status)} · ${invoice.invoiceNumber} · ${invoice.createdAt}`, width / 2, y);
//   y += dateH + gapDateToIntro;

//   ctx.strokeStyle = "rgba(34,29,23,0.15)";
//   ctx.setLineDash([4, 4]);
//   ctx.beginPath();
//   ctx.moveTo(padX, y);
//   ctx.lineTo(width - padX, y);
//   ctx.stroke();
//   ctx.setLineDash([]);
//   y += gapDividerToCustomer;

//   ctx.textAlign = "left";
//   ctx.font = '600 24px "Inter", Arial, sans-serif';
//   ctx.fillStyle = BRAND.ink;
//   ctx.fillText(`Customer: ${invoice.customerName}`, padX, y);
//   y += customerH + gapCustomerToItems;

//   ctx.font = '400 22px "Inter", Arial, sans-serif';
//   wrappedItems.forEach((it) => {
//     ctx.textAlign = "left";
//     ctx.fillStyle = BRAND.ink;

//     it.lines.forEach((line, index) => {
//       ctx.fillText(line, padX, y + index * lineHeight);
//     });

//     ctx.textAlign = "right";
//     ctx.fillText(formatNaira(Number(it.qty) * Number(it.unitPrice)), width - padX, y);

//     y += it.lines.length * lineHeight + rowSpacing;
//   });
//   y += gapItemsToDivider2;

//   ctx.strokeStyle = "rgba(34,29,23,0.15)";
//   ctx.setLineDash([4, 4]);
//   ctx.beginPath();
//   ctx.moveTo(padX, y);
//   ctx.lineTo(width - padX, y);
//   ctx.stroke();
//   ctx.setLineDash([]);
//   y += gapDivider2ToTotal;

//   ctx.textAlign = "left";
//   ctx.font = '400 44px "Bebas Neue", Arial, sans-serif';
//   ctx.fillStyle = BRAND.ink;
//   ctx.fillText("Total", padX, y);
//   ctx.textAlign = "right";
//   ctx.font = '400 48px "Bebas Neue", Georgia, serif';
//   ctx.fillText(formatNaira(invoice.total, "code"), width - padX, y);
//   y += totalH + gapTotalToStamp;

//   const paid = invoice.status === "paid";
//   ctx.fillStyle = paid ? "#DBF3E7" : "#FFE4CD";
//   const stampText = paid ? `PAID${invoice.paidDate ? " · " + invoice.paidDate : ""}` : "OUTSTANDING";
//   ctx.font = '700 18px "Inter", Arial, sans-serif';
//   const stampWidth = ctx.measureText(stampText).width + 40;
//   ctx.beginPath();
//   ctx.roundRect(width / 2 - stampWidth / 2, y - stampH / 2 - 4, stampWidth, stampH, stampH / 2);
//   ctx.fill();
//   ctx.fillStyle = paid ? BRAND.green : BRAND.red;
//   ctx.textAlign = "center";
//   ctx.fillText(stampText, width / 2, y + 2);
//   y += stampH / 2 + gapStampToFooter;

//   ctx.fillStyle = "rgba(34,29,23,0.4)";
//   ctx.font = '400 20px "Inter", Arial, sans-serif';
//   ctx.textAlign = "center";
//   ctx.fillText("Powered by Yousual", width / 2, y);

//   return new Promise<Blob>((resolve, reject) => {
//     canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png");
//   });
// }

export { renderInvoiceImage } from "../../lib/invoiceImage";