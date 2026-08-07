import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import ProblemSection from '../components/landing/ProblemSection'
import LogShareKnow from '../components/landing/LogShareKnow'
import Lifestyle from '../components/landing/Lifestyle'
import DailyGlance from '../components/landing/DailyGlance'
import Pricing from '../components/landing/Pricing'
import FinalCta from '../components/landing/FinalCta'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <ProblemSection />
        <LogShareKnow />
        <Lifestyle />
        <DailyGlance />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}