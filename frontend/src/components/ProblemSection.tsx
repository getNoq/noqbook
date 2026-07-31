interface PainPoint {
  quote: string
  description: string
  image: string
}

const PAIN_POINTS: PainPoint[] = [
  {
    quote: 'Customer said he already paid',
    description: "Without a record, it's your word against theirs - every single time.",
    image: '/images/vector-2.svg'
  },
  {
    quote: "I made plenty sales but I'm still broke",
    description: "Revenue and profit aren't the same thing if you're not tracking what goes out too.",
    image: '/images/vector-2.svg'
  },
  {
    quote: 'Where did all my money go?',
    description: 'Cash, transfer, POS - money moves through three channels and nobody is adding it up.',
    image: '/images/vector-2.svg'
  },
]

export default function ProblemSection() {
  return (
    <section className="bg-neutral-50 px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[768px] text-center">
        <span className="font-heading mark inline-block text-[20px] uppercase leading-[24px] tracking-wide">
          The Problem
        </span>
        <h2 className="mt-2 text-[28px] font-semibold leading-[36px] md:text-[36px] md:leading-[44px] tracking-[-2%]">
          Your business runs on your phone. Your money doesn't add up anywhere.
        </h2>
        <p className="mx-auto text-[18px] leading-[28px] mt-3 max-w-[678px] text-[#667085]">
          Sales live in a notebook. Payments live in your head. And when a customer says
          "but I paid you already," you have nothing to show them.
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
            <p className="text-[18px] leading-[30px] text-[#101828] font-medium">"{point.quote}"</p>
            <p className="mt-3 text-[16px] leading-[24px] text-[#667085]">{point.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
