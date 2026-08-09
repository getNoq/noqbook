// import type { Invoice } from "./types";

// /**
//  * STUB — replace with a real call to your Django API, which should
//  * render/store a PDF or image (Cloudinary/S3) and return a public URL
//  * served with Content-Disposition: inline so it opens in-browser.
//  */
// export async function uploadInvoiceAndGetLink(invoice: Invoice): Promise<string> {
//   await new Promise((r) => setTimeout(r, 700));
//   const fakeId = invoice.businessName.slice(0, 3).toLowerCase() + Date.now().toString().slice(-5);
//   return `https://noqbook.com/i/${fakeId}`;
// }

export { uploadInvoiceAndGetLink } from "../../lib/invoiceClientApi";