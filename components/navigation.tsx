'use client'

import { useState } from 'react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-foreground font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-foreground">AgentVault</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-foreground-muted hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#demo" className="text-foreground-muted hover:text-primary transition-colors">
              Demo
            </a>
            <a href="#architecture" className="text-foreground-muted hover:text-primary transition-colors">
              Architecture
            </a>
            <button className="px-6 py-2 bg-primary text-background font-semibold rounded-lg hover:bg-primary-dark transition-colors">
              Launch App
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-background-secondary rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#how-it-works" className="block px-4 py-2 text-foreground-muted hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#demo" className="block px-4 py-2 text-foreground-muted hover:text-primary transition-colors">
              Demo
            </a>
            <a href="#architecture" className="block px-4 py-2 text-foreground-muted hover:text-primary transition-colors">
              Architecture
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
