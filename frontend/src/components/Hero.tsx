import { Play } from 'lucide-react'

const CHECKS = ['No card required', 'Works on slow data', 'Naira, by default']

export default function Hero() {
  return (
    <section id="home" className="px-5 pt-4 md:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[24px] bg-neutral-900 text-white">
        {/* Background image — replace with your own asset later */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: "url('/images/hero-asset-2.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        <div className="relative z-10 flex flex-col items-center px-6 pt-10 text-center md:pt-[64px]">
          <h1 className="font-heading max-w-3xl text-[48px] leading-[48px] tracking-[-2%] md:text-[80px] md:leading-[80px]">
            KNOW WHERE
            <br />
            <div className="inline-block rounded-[12px] h-[60px] md:h-[90px] font-heading bg-yolk px-3 flex items-center" style={{ transform: 'rotate(-2.05deg)' }}>
              <span className="text-ink" style={{ transform: 'rotate(2.05deg)' }}>
                YOUR MONEY IS.
              </span>
            </div>
          </h1>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="#get-started"
              className="font-heading rounded-full bg-yolk px-6 py-2 text-[20px] border-2 border-yolk uppercase tracking-[5%] text-ink transition-transform hover:scale-[1.03]"
            >
              Log Your First Sale - Free
            </a>
            <button className="font-heading flex items-center gap-2 rounded-full border-2 border-white/50 px-5 py-2 text-[20px] uppercase tracking-[5%] transition-colors hover:bg-white/10">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Play size={12} fill="white" />
              </span>
              Demo
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[16px] text-white">
            {CHECKS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0964 7.39004L9.93641 14.3L8.03641 12.27C7.68641 11.94 7.13641 11.92 6.73641 12.2C6.34641 12.49 6.23641 13 6.47641 13.41L8.72641 17.07C8.94641 17.41 9.32641 17.62 9.75641 17.62C10.1664 17.62 10.5564 17.41 10.7764 17.07C11.1364 16.6 18.0064 8.41004 18.0064 8.41004C18.9064 7.49004 17.8164 6.68004 17.0964 7.38004V7.39004Z" fill="#12B76A"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>

          {/* Product/phone mock preview */}
          {/* <div className="mt-12 w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-800/90 p-4 text-left shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>07:32</span>
              <div className="h-4 w-8 rounded-full bg-white/20" />
            </div>
            <p className="mt-3 text-sm font-semibold">Today Task</p>
            <p className="text-xs text-white/50">3 of 8 habits done</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-white/60">Today's goal</p>
                <p className="text-sm font-semibold">Complete 3 habits</p>
                <div className="mt-2 flex gap-2 text-[10px] text-white/50">
                  <span>40%</span>
                  <span>85%</span>
                  <span>94%</span>
                </div>
              </div>
              <div className="rounded-lg bg-orange-500/20 p-3">
                <p className="text-xs text-white/60">7-day streak</p>
                <p className="text-sm font-semibold text-orange-300">unlocked</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-white/5 p-3 text-sm">
              <span>Morning walk</span>
              <span className="text-xs text-white/50">6 of 8 min</span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-white/5 p-3 text-sm">
              <span>Drink 3 glasses of water</span>
              <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-300">100%</span>
            </div>
          </div> */}
          <div className="mt-12">
            <img src="/images/hero-asset-1.svg" alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}
