

interface Step {
  label: string
  icon: string
}

const STEPS: Step[] = [
  { label: 'Record', icon: '/images/Log.svg' },
  { label: 'Receipt', icon: '/images/Receipt.svg' },
  { label: 'Share', icon: '/images/Share.svg' },
  { label: 'Expense', icon: '/images/Expense.svg' },
  { label: 'Remind', icon: '/images/Reminder.svg' },
  { label: 'Report', icon: '/images/Report.svg' },
]

export default function HowItWorks() {
  return (
    <section className="px-5 py-12 md:py-20 md:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-heading flex flex-col items-center max-w-3xl text-[36px] leading-[36px] tracking-[-2%] md:text-[64px] md:leading-[64px] mx-auto">
          YOU DON'T NEED TO GUESS
          <br />
          <div className="inline-block rounded-[12px] h-[50px] md:h-[80px] font-heading bg-yolk px-3 flex items-center max-w-[500px]" style={{ transform: 'rotate(-2.05deg)' }}>
            <span className="text-ink" style={{ transform: 'rotate(2.05deg)' }}>
              YOU NEED A RECORD.
            </span>
          </div>
        </h1>
        <p className="text-[18px] leading-[28px] mx-auto mt-5 max-w-[678px] text-[#667085]">
          Record a sale. Send the receipt. Track the expense. Follow up when you're owed. Yousual keeps the everyday work moving with you.
        </p>

        <div className="mt-14 grid grid-cols-3 gap-y-10 sm:grid-cols-6 sm:gap-y-0">
          {STEPS.map(({ label, icon }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl">
                <img src={icon} alt={label} />
              </div>
              <span className="text-[16px] leading-[24px] font-medium text-[#667085]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
