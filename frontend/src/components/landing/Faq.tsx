import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

// TODO: once your paid plans are finalized, add FAQs here for billing,
// changing plans, and cancellation to match what the Pricing section
// promises — left out for now since those specifics aren't set yet.
const FAQS: FaqItem[] = [
  {
    question: "Do I need to create an account to send an invoice?",
    answer:
      "No. Guest mode lets you fill out and share an invoice or receipt right away, no sign-up required. Your last 3 invoices are saved on that device automatically — create a free account any time to keep unlimited history and access it from any device.",
  },
  {
    question: "What happens when I reach the guest mode limit?",
    answer:
      "Guest mode keeps your 3 most recent invoices on your device. Once you hit that limit, creating a new one replaces the oldest — nothing is lost if you've already shared or downloaded it, but it won't be recoverable from the app.",
  },
  {
    question: "What do I get with a free account?",
    answer:
      "A free account removes the 3-invoice cap, backs up your invoice history across devices, and unlocks custom notes and brand colors on every invoice you send — plus automatic payment reminders for outstanding invoices.",
  },
  {
    question: "Can I add my own notes or brand color to invoices?",
    answer:
      "Yes, with a free account. Guests can preview what a custom note or brand color looks like, but adding your own is one of the things that comes with signing up.",
  },
  {
    question: "How do I share an invoice with my customer?",
    answer:
      "Share it straight to WhatsApp as an image or a link, download it as a PNG, or copy it as plain text — whichever is easiest for you and your customer.",
  },
  {
    question: "Do you support Nigerian phone numbers and Naira?",
    answer:
      "Yes. Customer phone numbers are validated as Nigerian numbers, and every invoice total is formatted in Naira automatically.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="bg-white py-16 px-6">
      <div className="mx-auto max-w-[768px] text-center">
        <span className="font-heading mark inline-block text-[20px] uppercase leading-[24px] tracking-wide">
          Got questions? We have answers.
        </span>
        <h2 className="mt-2 text-[28px] font-semibold leading-[36px] md:text-[36px] md:leading-[44px] tracking-[-2%]">
          Frequently asked questions
        </h2>
        <p className="mx-auto text-[18px] leading-[28px] mt-3 max-w-[678px] text-[#667085] mb-12">
          Everything you need to know about invoicing with Yousual.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question} className="border-b border-neutral-200">
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-neutral-900">{item.question}</span>
                <span className="shrink-0 w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center">
                  {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>
              {isOpen && (
                <p className="text-neutral-500 text-[16px] leading-relaxed pb-5 pr-10">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="max-w-[1216px] mx-auto mt-14 rounded-3xl bg-neutral-50 px-6 py-6 text-center">
        <div className="flex justify-center -space-x-3 mb-5">
          <img src="/images/avatar-group.svg" alt="avatar-group" height={24} width={96} />
        </div>
        <h3 className="font-semibold text-lg mb-1">Still have questions?</h3>
        <p className="text-neutral-500 text-sm">
          Can't find the answer you're looking for? Chat with our friendly team.
        </p>
        <a
          href="#get-started"
          className="font-heading mt-8 rounded-full inline-block bg-yolk px-6 py-2 text-[20px] border-2 border-yolk uppercase tracking-[5%] text-ink transition-transform hover:scale-[1.03]"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}