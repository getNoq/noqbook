interface Stat {
  label: string
  value: string
  color: string
}

const STATS: Stat[] = [
  { label: 'Money In — Today', value: '₦128,400', color: 'text-emerald-600' },
  { label: 'Money Out — Today', value: '₦34,100', color: 'text-red-500' },
  { label: 'Still Owed to You', value: '₦47,000', color: 'text-neutral-400 line-through' },
]

export default function DailyGlance() {
  return (
    <section className="px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[768px] text-center">
        <span className="font-heading mark inline-block text-[20px] uppercase leading-[24px] tracking-wide">
          Your Day, At A Glance
        </span>
        <h2 className="mt-2 text-[28px] font-semibold leading-[36px] md:text-[36px] md:leading-[44px] tracking-[-2%]">
          One screen. The whole story.
        </h2>
        <p className="mx-auto text-[18px] leading-[28px] mt-3 max-w-[678px] text-[#667085]">
          Every sale, every expense, every naira owed - in one place, not five.
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
