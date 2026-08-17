interface PainPoint {
  quote: string
  description: string
  image: string
}

const PAIN_POINTS: PainPoint[] = [
  {
    quote: 'Your business runs on your phone.',
    description: "Sales live in a notebook or WhatsApp. Payments live in your bank — or your head.",
    image: '/images/shopping-online.png'
  },
  {
    quote: "Your bank shows where money moved.",
    description: "A bank transaction can tell you ₦50,000 came in. It can't tell you who paid, what they bought, what they still owe, or what you spent to make the sale.",
    image: '/images/mobile-banking.png'
  },
  {
    quote: 'Yousual shows what happened.',
    description: 'Yousual brings the details together, so you can see what happened behind the money.',
    image: '/images/online-payment.png'
  },
]

export default function ProblemSection() {
  return (
    <section className="bg-neutral-50 border border-black/5 px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[768px] text-center">
        <span className="font-heading mark inline-block text-[20px] uppercase leading-[24px] tracking-wide">
          The Problem
        </span>
        <h2 className="mt-2 text-[28px] font-semibold leading-[36px] md:text-[36px] md:leading-[44px] tracking-[-2%]">
            Your money moves. But do you know the whole story?
        </h2>
        <p className="mx-auto text-[18px] leading-[28px] mt-3 max-w-[678px] text-[#667085]">
          Sales, expenses and customer payments can end up in different places — your notebook, WhatsApp, bank account, or your head. Yousual keeps the business behind the money in one place.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1216px] gap-6 sm:grid-cols-3">
        {PAIN_POINTS.map((point) => (
          <div key={point.quote} className="relative mt-[30px] rounded-[16px] border-2 border-[#DDF0FA] bg-[#F6FBFE] p-6 pt-10 text-center shadow-sm overflow-visible">
            <img 
              src={point.image} 
              alt={point.quote} 
              className="absolute left-1/2 -translate-x-1/2 -top-[30px] h-[60px] w-[60px] object-cover" 
            />
            <p className="text-[18px] leading-[24px] text-[#101828] font-medium">{point.quote}</p>
            <p className="mt-3 text-[16px] leading-[24px] text-[#667085]">{point.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
