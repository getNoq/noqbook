export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-black/5 px-5 py-5 md:px-8 md:py-3">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <a href="#home" className="flex items-center gap-2 tracking-tight">
          <img src="/images/yousual-logomark.svg" alt="NOQ logomark" height={56} width={160} />
          {/* <span className="font-heading text-[44px]">NOQ</span> */}
        </a>
        <p className="text-[16px] text-neutral-400">
          Built for You &amp; Your business.
        </p>
      </div>
    </footer>
  )
}
