// interface Stat {
//   label: string
//   value: string
//   color: string
// }

// const STATS: Stat[] = [
//   { label: 'Money In — Today', value: '₦128,400', color: 'text-emerald-600' },
//   { label: 'Money Out — Today', value: '₦34,100', color: 'text-red-500' },
//   { label: 'Still Owed to You', value: '₦47,000', color: 'text-neutral-400' },
// ]

export default function DailyGlance() {
  return (
    <section className="px-5 pt-20 pb-10 md:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-heading flex flex-wrap flex-row items-center justify-center gap-2 max-w-5xl text-[36px] leading-[36px] tracking-[-2%] md:text-[64px] md:leading-[64px] mx-auto">
          One screen.
          <div className="inline-block rounded-[12px] h-[50px] md:h-[80px] font-heading bg-yolk px-3 flex items-center max-w-[500px]" style={{ transform: 'rotate(-2.05deg)' }}> 
            <span className="text-ink" style={{ transform: 'rotate(2.05deg)' }}>
              The whole story.
            </span> 
          </div>
        </h1>
        <p className="mx-auto mt-3 max-w-[678px] text-[#667085] text-[18px] leading-[28px]">
          View every sale, every expense, every naira owed — all in one place.
        </p>
      </div>

      {/* <div className="mx-auto mt-12 grid max-w-[1216px] gap-6 rounded-2xl bg-amber-50 p-[64px] text-center sm:grid-cols-3"> */}
        <div className="mt-6 w-full rounded-[32px] hidden md:block">
          <img src="/images/dashboard-content.svg" alt="dashboard" style={{ width: "100%"}} />
        </div>
        <div className="mt-6 w-full rounded-[32px] block md:hidden">
          <img src="/images/dashboard-content-mobile.svg" alt="dashboard" style={{ width: "100%"}} />
        </div>
      {/* </div> */}
    </section>
  )
}
