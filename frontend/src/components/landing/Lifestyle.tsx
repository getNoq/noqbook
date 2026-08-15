import { useState } from 'react'
import { Briefcase, GraduationCap, Laptop, Baby } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Audience {
  label: string
  icon: LucideIcon
  headline: string
  description: string
  image: string
}

const AUDIENCES: Audience[] = [
  {
    label: 'Sellers & Traders',
    icon: Briefcase,
    headline: 'Sellers & Traders',
    description: 'For shops, retailers, wholesalers, online sellers and businesses that sell goods.',
    image:
      '/images/3234.jpg',
  },
  {
    label: 'Makers & Creators',
    icon: GraduationCap,
    headline: 'Makers & Creators',
    description: 'For designers, artisans, manufacturers and businesses that make or create what they sell.',
    image:
      '/images/makers-creators.svg',
  },
  {
    label: 'Food & Hospitality',
    icon: Laptop,
    headline: 'Food & Hospitality',
    description: 'For restaurants, food vendors, caterers, bakeries, cafés and hospitality businesses.',
    image:
      'images/food-restaurant.svg',
  },
  {
    label: 'Services & Professionals',
    icon: Baby,
    headline: 'Services & Professionals',
    description: 'For freelancers, consultants, beauty businesses, repairers, contractors and other service providers.',
    image:
      '/images/professional.svg',
  },
]

export default function Lifestyle() {
  const [active, setActive] = useState(0)
  const audience = AUDIENCES[active]

  return (
      <section 
        id="resources" 
        className="px-5 py-20 md:px-8 bg-repeat"
        style={{ backgroundImage: "url('/images/vector-10.png')" }}
      >
      <div className="mx-auto max-w-[768px] text-center">
        <span className="font-heading mark inline-block text-[20px] uppercase leading-[24px] tracking-wide">
          BUILT FOR YOUR BUSINESS
        </span>
        <h2 className="mt-2 text-[24px] font-semibold leading-[32px] md:text-[36px] md:leading-[44px] tracking-[-2%]">
          Whatever you sell, make or do, <br /> Yousual keeps track.
        </h2>
        <p className="mx-auto text-[18px] leading-[28px] mt-3 max-w-[678px] text-[#667085]">
          Used by people to improve their routines.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {AUDIENCES.map((item, index) => {
            // const Icon = item.icon
            const isActive = index === active
            return (
              <button
                key={item.label}
                onClick={() => setActive(index)}
                className={`flex items-center gap-1 rounded-[8px] border px-2 py-3 md:px-3 md:py-3 text-[14px] md:text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'border-ink bg-ink text-white'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:border-ink'
                }`}
              >
                {/* <Icon size={24} /> */}
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-[16px]">
        <img
          src={audience.image}
          alt={audience.headline}
          className="h-80 w-full object-cover md:h-[420px]"
        />
        <div className="absolute bottom-6 right-4 md:right-6 max-w-xs rounded-[16px] bg-black/60 p-5 text-white backdrop-blur">
          <p className="text-[18px] font-semibold text-white">
            {audience.headline}
          </p>
          <p className="mt-2 text-[16px]">{audience.description}</p>
        </div>
      </div>
    </section>
  )
}
