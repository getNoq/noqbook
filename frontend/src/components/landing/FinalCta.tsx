export default function FinalCta() {
  return (
    <section id="get-started" className="px-5 py-20 md:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-heading flex flex-wrap flex-row items-center justify-center gap-2 max-w-5xl text-[36px] leading-[36px] tracking-[-2%] md:text-[64px] md:leading-[48px] mx-auto">
          YOUR NOTEBOOK HAS SERVED YOU WELL.
          <div className="inline-block rounded-[12px] h-[50px] md:h-[80px] font-heading bg-yolk px-3 flex items-center max-w-[500px]" style={{ transform: 'rotate(-2.05deg)' }}> 
            <span className="text-ink" style={{ transform: 'rotate(2.05deg)' }}>
              GIVE IT A BACKUP.
            </span> 
          </div>
        </h1>
        <p className="mx-auto mt-6 max-w-[678px] text-[#667085] text-[18px] leading-[28px]">
          Keep your sales, expenses, payments and customers in one place — so you don't have to rely on memory when it matters.
        </p>
        <a
          href="/start"
          className="font-heading mt-8 rounded-full inline-block bg-yolk px-6 py-2 text-[20px] border-2 border-yolk uppercase tracking-[5%] text-ink transition-transform hover:scale-[1.03]"
        >
          Try Yousual free
        </a>
      </div>
    </section>
  )
}
