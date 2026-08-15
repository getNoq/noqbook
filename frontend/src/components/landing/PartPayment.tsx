interface Stat {
  label: string
  value: string
  color: string
}

const STATS: Stat[] = [
  { label: 'Total', value: '₦150,000', color: 'text-gray-700' },
  { label: 'Paid', value: '₦100,000', color: 'text-emerald-600' },
  { label: 'Still Owed', value: '₦50,000', color: 'text-red-500' },
]

export default function PartPayment() {
  return (
    <section className="px-5 py-20 md:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-heading flex flex-wrap flex-row items-center justify-center gap-2 max-w-5xl text-[36px] leading-[36px] tracking-[-2%] md:text-[64px] md:leading-[64px] mx-auto">
          Got paid part of it? 
          <div className="inline-block rounded-[12px] h-[50px] md:h-[80px] font-heading bg-yolk px-3 flex items-center max-w-[500px]" style={{ transform: 'rotate(-2.05deg)' }}> 
            <span className="text-ink" style={{ transform: 'rotate(2.05deg)' }}>
              Keep track.
            </span> 
          </div>
        </h1>
        <p className="mx-auto mt-3 max-w-[678px] text-[#667085] text-[18px] leading-[28px]">
          Customers don't always pay everything at once. Record each payment and always know what's been paid and what's still outstanding.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1216px] gap-6 rounded-2xl bg-amber-50 p-[64px] text-center sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className={`font-heading text-[56px] leading-[48px] md:text-[72px] md:leading-[64px] ${stat.color}`}>{stat.value}</p>
            <p className="font-heading mt-2 text-[18px] leading-[24px] uppercase tracking-wide text-neutral-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}