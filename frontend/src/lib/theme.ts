// Shared design tokens — keep these in sync with the ones in
// GuestInvoiceFlow.tsx (or better: move both to one shared file once
// this module lives inside the same project).
export const BRAND = {
  bg: "#FBF8F2", ink: "#221D17", inkSoft: "rgba(34,29,23,0.62)",
  card: "#FFFFFF", line: "rgba(34,29,23,0.12)",
  peach: "#FFE4CD", lav: "#E7E2FF", lavStrong: "#9C8FFF",
  mint: "#DBF3E7", green: "#2E8F63", red: "#D96B57", brand: "#D7FF1A",
} as const;

// Remove this once Fraunces + Inter + Bebas Neue are linked in index.html.
export const FONT_IMPORT_BLOCK = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=Bebas+Neue&display=swap');
  .ob-serif{ font-family:'Fraunces',serif; }
`;
