'use client'

export default function ProblemSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">The Problem</h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Today's NFTs are just receipts. They don't transfer the thing that matters—the intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 border border-border rounded-xl hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Traditional NFTs</h3>
            <p className="text-foreground-muted">
              You own a token pointing to metadata on IPFS. The actual AI agent stays with the creator. You can't use it, copy it, or benefit from its intelligence.
            </p>
          </div>

          <div className="p-8 border border-border rounded-xl hover:border-primary/50 transition-colors bg-gradient-to-br from-background to-background-secondary">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">INFTs (Intelligent NFTs)</h3>
            <p className="text-foreground-muted">
              You own the encrypted AI configuration itself. When you buy, the intelligence transfers to you. You control, execute, and benefit from the agent.
            </p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-accent/10 to-primary/10 border border-border-light rounded-xl">
          <h3 className="text-2xl font-semibold text-foreground mb-4">The Solution: AgentVault</h3>
          <ul className="space-y-3 text-foreground-muted">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Encrypt AI agent configuration (system prompt, tools, model params)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Store on decentralized storage (0G Storage) with tamper-proof proofs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Mint on-chain ERC-721 token that commits to encrypted metadata</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Transfer ownership via oracle-backed re-encryption and nonce verification</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Lease usage rights without selling (time-bound access control)</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
