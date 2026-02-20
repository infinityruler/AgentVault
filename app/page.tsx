'use client'

import Navigation from '@/components/navigation'
import HeroSection from '@/components/hero'
import ProblemSection from '@/components/problem-section'
import HowItWorks from '@/components/how-it-works'
import InteractiveDemo from '@/components/interactive-demo'
import ArchitectureSection from '@/components/architecture'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <HowItWorks />
      <InteractiveDemo />
      <ArchitectureSection />
      <Footer />
    </main>
  )
}
