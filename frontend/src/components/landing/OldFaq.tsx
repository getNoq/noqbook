import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Minus, ArrowRight } from "lucide-react";

interface FaqLink {
  label: string;
  href: string;
}

interface FaqItem {
  question: string;
  // One or more paragraphs — rendered as separate <p> tags.
  answer: string[];
  // Optional — only add where there's a clear next step. Not every
  // answer needs one; overusing this turns the FAQ into a CTA wall.
  link?: FaqLink;
}

// TODO: once your paid plans are finalized, add FAQs here for billing,
// changing plans, and cancellation to match what the Pricing section
// promises — left out for now since those specifics aren't set yet.
const FAQS: FaqItem[] = [
  {
    question: "Do I need to create an account to record a sale??",
    answer: [
      "No. You can record a sale, create and share an invoice or receipt instantly in guest mode — no sign-up required. Your 3 most recent invoices are saved on your device.",
      "Create a free account whenever you're ready to keep your full history and access your records across devices.",
    ],
    link: { label: "Try it without an account", href: "/start" },
  },
  {
    question: "What happens when I reach the guest mode limit?",
    answer: [
      "Guest mode keeps your 3 most recent invoices, receipts, and sales records on your device. When you create a new record after reaching the limit, your oldest record is replaced.",
      "Any invoice or receipt you've already downloaded or shared is still yours, but it can no longer be recovered from Yousual.",
    ],
    link: { label: "Create a free account to keep your full history.", href: "/signup" },
  },
  {
    question: "What can I record on Yousual?",
    answer: [
      "Yousual helps you keep track of the money coming into and going out of your business.",
      "You can record sales, create invoices and receipts, track paid and outstanding amounts, and record business expenses. You can also keep customer records and see your business activity in one place.",
    ],
  },
  {
    question: "How is Yousual different from my bank app?",
    answer: [
      "Your bank shows you money moving through your account. Yousual helps you track the business behind that money.",
      "A customer may pay you by bank transfer, cash, or another method — but your bank doesn't know what they paid for. Yousual lets you record the sale, link it to the customer, track what is still owed, and record the expenses that came out of the business.",
      "Think of your bank as where your money moves and Yousual as where you keep track of your business.",
    ],
  },
  {
    question: "How do I record a sale?",
    answer: [
      "You can record a sale by adding what was sold, the amount, and the customer's details if needed. You can mark the sale as paid or outstanding and generate a receipt or invoice to share with your customer.",
      "This means you can keep a record whether the customer paid by bank transfer, cash, or another payment method.",
    ],
  },
  {
    question: "Can I record business expenses?",
    answer: [
      "Yes. Business customers can record expenses such as stock purchases, transport, rent, supplies, or other business costs.",
      "You can also attach a photo of the receipt so you have a record of what the expense was for. Your expenses can then be used alongside your sales to understand where your business stands.",
    ],
  },
  {
    question: "How do I share an invoice or receipt with my customer?",
    answer: [
      "Once your invoice or receipt is ready, you can share it directly through WhatsApp, download it as an image or PDF, or use the available sharing options on your device.",
      "Your customer doesn't need a Yousual account to receive or view an invoice or receipt.",
    ],
  },
  {
    question: "Can I customize my invoices and receipts?",
    answer: [
      "Yes. Free accounts can choose from preset brand colors and add custom notes to their invoices and receipts.",
      "Business customers get more advanced branding options, including greater customization for their business identity and branded invoice links.",
      "Guests can preview the customization experience before signing up.",
    ],
    link: { label: "Create a free account to personalize your invoices.", href: "/signup" },
  },
  {
    question: "Do you support Nigerian businesses?",
    answer: [
      "Yes. Yousual is built with Nigerian businesses in mind. Invoices and receipts use Naira (₦) formatting, Nigerian phone numbers are supported, and the platform is designed around how many Nigerian businesses sell, receive payments, record expenses, and communicate with customers.",
    ],
  },
];

export default function OldFaq() {
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
                <div className="pb-5 pr-10">
                  {item.answer.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className={`text-neutral-500 text-[16px] leading-relaxed ${
                        pIndex < item.answer.length - 1 ? "mb-3" : ""
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                  {item.link && (
                    <Link
                      to={item.link.href}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline underline-offset-2 hover:opacity-70"
                    >
                      {item.link.label} <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
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
        
        <a href="#get-started"
          className="font-heading mt-8 rounded-full inline-block bg-yolk px-6 py-2 text-[20px] border-2 border-yolk uppercase tracking-[5%] text-ink transition-transform hover:scale-[1.03]"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}