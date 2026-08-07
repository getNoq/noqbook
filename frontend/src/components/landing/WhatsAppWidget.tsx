import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

// TODO: replace with your real WhatsApp Business number, international
// format, no "+" or leading zeros — e.g. Nigerian 0803 123 4567 becomes
// "2348031234567".
const WHATSAPP_NUMBER = "2348029196194";
const DEFAULT_MESSAGE = "Hi Yousual! I have a question about the app.";

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function WhatsAppWidget() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {expanded && (
        <div className="w-72 rounded-2xl bg-white shadow-xl border border-neutral-200 overflow-hidden">
          <div className="bg-[#000] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/90" />
              <span className="text-white text-sm font-semibold">Yousual Support</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close chat widget"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-neutral-600 mb-4">
              Got a question? Chat with our team directly on WhatsApp — usually a quick reply away.
            </p>
            <a
              href={buildWhatsAppUrl(DEFAULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#000] text-white text-sm font-semibold py-2.5 hover:bg-[#1fb958] transition-colors"
            >
              <MessageCircle size={16} /> Start chat
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="relative w-14 h-14 rounded-full bg-[#000] shadow-lg flex items-center justify-center hover:bg-[#1fb958] transition-colors"
        aria-label={expanded ? "Close WhatsApp chat" : "Chat with us on WhatsApp"}
        aria-expanded={expanded}
      >
        {!expanded && (
          <span className="absolute inset-0 rounded-full bg-[#000] animate-ping opacity-40" />
        )}
        {expanded ? <X size={24} color="white" /> : <MessageCircle size={26} color="white" />}
      </button>
    </div>
  );
}