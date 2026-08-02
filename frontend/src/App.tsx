import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import ProblemSection from './components/ProblemSection'
import LogShareKnow from './components/LogShareKnow'
import Lifestyle from './components/Lifestyle'
import DailyGlance from './components/DailyGlance'
import Pricing from './components/Pricing'
import FinalCta from './components/FinalCta'
import Footer from './components/Footer'
import GuestInvoiceFlow from './components/GuestInvoiceFlow'
import { Route, Routes } from 'react-router-dom'

function HomePage() {
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/start" element={<GuestInvoiceFlow />} />
    </Routes>
  )
}