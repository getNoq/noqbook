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
    label: 'Professionals',
    icon: Briefcase,
    headline: 'Professionals',
    description: 'For people balancing classes, projects, and long study sessions.',
    image:
      '/images/3234.jpg',
  },
  {
    label: 'Students',
    icon: GraduationCap,
    headline: 'Students',
    description: 'For students juggling side hustles between lectures and deadlines.',
    image:
      '/images/44802.jpg',
  },
  {
    label: 'Remote Workers',
    icon: Laptop,
    headline: 'Remote Workers',
    description: 'For freelancers who need to know what they billed and what got paid.',
    image:
      'images/1661.jpg',
  },
  {
    label: 'Busy Parents',
    icon: Baby,
    headline: 'Busy Parents',
    description: 'For parents running a side business around school runs and nap times.',
    image:
      '/images/2149160257.jpg',
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
          Fits Every Lifestyle
        </span>
        <h2 className="mt-2 text-[28px] font-semibold leading-[36px] md:text-[36px] md:leading-[44px] tracking-[-2%]">
          Adapted for the way you live and work
        </h2>
        <p className="mx-auto text-[18px] leading-[28px] mt-3 max-w-[678px] text-[#667085]">
          Used by people to improve their routines.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {AUDIENCES.map((item, index) => {
            const Icon = item.icon
            const isActive = index === active
            return (
              <button
                key={item.label}
                onClick={() => setActive(index)}
                className={`flex items-center gap-2 rounded-[16px] border px-4 py-3 md:px-6 md:py-4 text-[14px] md:text-[16px] font-medium transition-colors ${
                  isActive
                    ? 'border-ink bg-ink text-white'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:border-ink'
                }`}
              >
                <Icon size={24} />
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
