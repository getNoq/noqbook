interface Feature {
  title: string
  description: string
  bg: string
  image: string
}

const FEATURES: Feature[] = [
  {
    title: 'Log the sale',
    description:
      "Type the item, the amount, and the customer's name. Under a minute, even on a bad network day.",
    bg: 'bg-[#B8CAF4]',
    image: '/images/feature-image.svg',
  },
  {
    title: 'Send the receipt',
    description:
      "One tap sends it straight to WhatsApp, or download it as an image to forward yourself.",
    bg: 'bg-sky-100',
    image: '/images/feature-image-2.svg',
  },
  {
    title: 'Know where you stand',
    description:
      "Mark it paid when the money lands. NoqBook keeps the running total, so you always know your number.",
    bg: 'bg-[#D8F2DD]',
    image: '/images/feature-image-3.svg',
  },
]

export default function LogShareKnow() {
  return (
    <section id="products" className="px-5 py-20 md:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-heading flex flex-wrap flex-row items-center justify-center gap-2 max-w-5xl text-[36px] leading-[36px] tracking-[-2%] md:text-[64px] md:leading-[64px] mx-auto">
          LOG IT. SHARE IT. 
          <div className="inline-block rounded-[12px] h-[50px] md:h-[80px] font-heading bg-yolk px-3 flex items-center max-w-[500px]" style={{ transform: 'rotate(-2.05deg)' }}> 
            <span className="text-ink" style={{ transform: 'rotate(2.05deg)' }}>
              KNOW IT'S PAID. 
            </span> 
          </div>
        </h1>
        <p className="mx-auto mt-3 max-w-[678px] text-[#667085] text-[18px] leading-[28px]">
          If you can send a WhatsApp message, you already know how to use NoqBook.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className={`rounded-[32px] ${feature.bg} pt-8`}>
            <h3 className="font-medium text-center text-[20px] leading-[28px] text-[#030302] px-6">{feature.title}</h3>
            <p className="mt-4 text-[16px] leading-[24px] text-[#5D667B] text-center px-6">{feature.description}</p>
            <div className="mt-6 w-full rounded-[32px]">
              <img src={feature.image} alt={feature.title} style={{ width: "100%"}} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
