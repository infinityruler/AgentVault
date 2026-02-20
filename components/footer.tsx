'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-background-secondary border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-foreground font-bold">A</span>
              </div>
              <span className="font-bold text-foreground">AgentVault</span>
            </div>
            <p className="text-sm text-foreground-muted">
              The marketplace for AI agents as INFTs. Trade encrypted intelligence on-chain.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#demo" className="hover:text-primary transition-colors">Demo</a></li>
              <li><a href="#architecture" className="hover:text-primary transition-colors">Tech Stack</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">Marketplace</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li><a href="/" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">Contracts</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">API Docs</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">GitHub</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li><a href="/" className="hover:text-primary transition-colors">Discord</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">GitHub</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">Forum</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground-muted">
          <p>&copy; {currentYear} AgentVault. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>

        {/* Testnet Notice */}
        <div className="mt-8 p-4 bg-accent/10 border border-accent rounded-lg text-center text-sm text-accent">
          <p>🧪 Currently deployed on 0G Galileo Testnet. Not for mainnet use.</p>
        </div>
      </div>
    </footer>
  )
}
