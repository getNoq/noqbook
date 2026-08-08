import { useState } from "react";


const FREE_FEATURES = [
  'Unlimited invoices & receipts',
  'Unlimited sales logs',
  'Paid & unpaid tracking',
  'WhatsApp & PDF/image sharing',
  'Basic invoice customization',
]

const BUSINESS_FEATURES = [
  'Profit & cash flow dashboard',
  'Business reports - daily, weekly & monthly',
  'Automatic payment reminders',
  'Customer history - who bought what, when',
  'Expense tracking with receipt photos',
  'AI business insights',
  'Up to 3 team members',
  'Export to Excel/PDF',
  'Custom business profile & branded invoice links',
]

export default function Pricing() {

const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <section id="pricing" className="bg-neutral-50 px-5 py-20 md:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-heading flex flex-wrap flex-row items-center justify-center gap-2 max-w-5xl text-[36px] leading-[36px] tracking-[-2%] md:text-[64px] md:leading-[64px] mx-auto">
          YOUR PACE,
          <div className="inline-block rounded-[12px] h-[50px] md:h-[80px] font-heading bg-yolk px-3 flex items-center max-w-[500px]" style={{ transform: 'rotate(-2.05deg)' }}> 
            <span className="text-ink" style={{ transform: 'rotate(2.05deg)' }}>
              YOUR PLAN.
            </span> 
          </div>
        </h1>
        <p className="mx-auto mt-3 max-w-[678px] text-[#667085] text-[18px] leading-[28px]">
          Start free. Pay when it's saving you time. No card needed to try it. Upgrade once
          reminders and reports are worth it to you.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
        {/* Free plan */}
        <div className="rounded-2xl bg-white border border-neutral-200 p-8">
          <p className="font-heading text-[32px] uppercase">Free</p>
          <p className="text-[14px] leading-[20px] text-[#667085]">Get your business records organized.</p>
          <p className="font-heading mt-2 text-[48px] leading-[72px] tracking-[-2%]">
            ₦0<span className="text-[24px] text-[#667085]">/month</span>
          </p>

          <p className="mt-3 text-[14px] leading-[24px] font-semibold uppercase text-[#101828]">
            Features
          </p>
          <p className="text-[14px] leading-[24px] text-[#667085]">Essential tools to create and track your sales.</p>
          <ul className="mt-4 space-y-3 text-[15px] text-[#667085]">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="#D1FADF"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0964 7.39016L9.93641 14.3002L8.03641 12.2702C7.68641 11.9402 7.13641 11.9202 6.73641 12.2002C6.34641 12.4902 6.23641 13.0002 6.47641 13.4102L8.72641 17.0702C8.94641 17.4102 9.32641 17.6202 9.75641 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#12B76A"/>
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          {/* <a
            href="#get-started"
            className="mt-8 block rounded-full tracking-[2%] bg-ink px-5 py-3 text-center text-[20px] font-heading text-white transition-colors hover:bg-neutral-800"
          >
            It's Free - Get Started
          </a> */}
        </div>

        {/* Business plan */}
        <div className="relative rounded-2xl bg-ink p-8 text-white">
          <span className="absolute -top-3 right-8 rounded-[8px] bg-yolk px-3 py-1 text-[18px] font-heading uppercase tracking-wide text-ink">
            Most owners pick this
          </span>
          <div className="flex items-center gap-4">
            <p className="font-heading text-[32px] uppercase">Business</p>

            <div className="flex rounded-full bg-white/10 p-1">
              <button
                onClick={() => setBilling("monthly")}
                className={`rounded-full px-4 py-1 text-sm font-medium transition ${
                  billing === "monthly"
                    ? "bg-yolk text-ink"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Monthly
              </button>

              <button
                onClick={() => setBilling("annual")}
                className={`rounded-full px-4 py-1 text-sm font-medium transition ${
                  billing === "annual"
                    ? "bg-yolk text-ink"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Annual
              </button>
            </div>
          </div>
          <p className="text-[14px] leading-[24px]">
            Know exactly where your business stands -{" "}
            {billing === "monthly"
              ? "for less than ₦85/day, billed monthly."
              : "and save ₦5,000 every year."}
          </p>
          <p className="font-heading mt-2 text-[48px] leading-[72px] tracking-[-2%]">
            ₦{billing === "monthly" ? "2,500" : "25,000"}
            <span className="text-[24px] text-white/80">
              /{billing === "monthly" ? "month" : "year"}
            </span>
          </p>

          <p className="mt-3 text-[14px] leading-[24px] font-semibold uppercase text-white">
            Features
          </p>
          <p className="text-[14px] leading-[24px] text-white">Everything in Free, plus tools to understand and manage your business.</p>
          <ul className="mt-4 space-y-3 text-[15px]">
            {BUSINESS_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0964 7.39004L9.93641 14.3L8.03641 12.27C7.68641 11.94 7.13641 11.92 6.73641 12.2C6.34641 12.49 6.23641 13 6.47641 13.41L8.72641 17.07C8.94641 17.41 9.32641 17.62 9.75641 17.62C10.1664 17.62 10.5564 17.41 10.7764 17.07C11.1364 16.6 18.0064 8.41004 18.0064 8.41004C18.9064 7.49004 17.8164 6.68004 17.0964 7.38004V7.39004Z" fill="#12B76A"/>
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          {/* <a
            href="#get-started"
            className="mt-8 block rounded-full tracking-[2%] bg-yolk px-5 py-3 text-center text-[20px] font-heading text-ink transition-transform hover:scale-[1.02]"
          >
            Upgrade to Business Plan
          </a> */}
        </div>
      </div>
    </section>
  )
}
