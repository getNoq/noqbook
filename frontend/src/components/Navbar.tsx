import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Products', href: '#products' },
  { label: 'Resources', href: '#resources' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 md:px-8">
        <a href="#home" className="flex items-center gap-2 tracking-tight">
          <img src="/images/NOQ-ONE-LOGOMARK-B.png" alt="NOQ logomark" height={44} width={44} />
          <span className="font-heading text-[44px]">NOQ</span>
        </a>

        <ul className="hidden items-center gap-8 text-[16px] font-medium text-[#667085] md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="transition-colors hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <a
            href="#get-started"
            className="font-heading rounded-full bg-ink px-6 py-3 text-[18px] tracking-[5%] text-white transition-colors hover:bg-neutral-800"
          >
            Get Started - Free
          </a>
        </div>

        <button
          className="md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/5 bg-white px-5 pb-5 md:hidden">
          <ul className="flex flex-col gap-4 pt-4 text-[16px] font-medium text-[#667085]">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#get-started"
            className="font-heading mt-5 block rounded-full bg-ink px-6 py-3 text-center text-[18px] tracking-[5%] text-white"
            onClick={() => setOpen(false)}
          >
            Get Started - Free
          </a>
        </div>
      )}
    </header>
  )
}
