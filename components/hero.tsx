'use client'

import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl opacity-20 pointer-events-none" style={{
        transform: `translateY(${scrollY * 0.3}px)`,
      }} />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance mb-6 leading-tight">
          Trade <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Encrypted Intelligence</span> On-Chain
        </h1>

        <p className="text-xl sm:text-2xl text-foreground-muted text-balance mb-8 max-w-3xl mx-auto leading-relaxed">
          AgentVault is the first marketplace for AI agents as INFTs—where the intelligence itself transfers ownership. Mint, trade, lease, and execute AI agents with cryptographic proof.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button className="px-8 py-4 bg-primary text-background font-semibold rounded-lg hover:bg-primary-dark transition-all transform hover:scale-105">
            Try Demo
          </button>
          <button className="px-8 py-4 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-all">
            Read Docs
          </button>
        </div>

        {/* Hero graphic - animated cards */}
        <div className="relative mt-16 h-96 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-4 w-full max-w-2xl perspective">
            {[
              { label: 'Mint', delay: 0 },
              { label: 'Trade', delay: 1 },
              { label: 'Execute', delay: 2 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="h-48 bg-gradient-to-br from-background-secondary to-background border border-border-light rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary transition-all"
                style={{
                  animation: `float 6s ease-in-out infinite`,
                  animationDelay: `${item.delay * 0.2}s`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 relative z-10">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center" />
                </div>
                <p className="font-semibold text-lg text-foreground relative z-10">{item.label}</p>
                <p className="text-sm text-foreground-muted mt-2 relative z-10">AI Agent</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  )
}
