'use client'

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Architecture & Tech Stack</h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Built for security, scalability, and decentralization using cutting-edge Web3 infrastructure.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="mb-16 p-8 border border-border rounded-xl bg-background-secondary overflow-x-auto">
          <p className="text-center text-foreground-muted mb-8 font-semibold">System Architecture</p>
          <div className="flex flex-col gap-6 min-w-max md:min-w-0">
            {/* Layer 1 */}
            <div className="flex items-center justify-between gap-4">
              <div className="px-6 py-4 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary rounded-lg text-center min-w-32">
                <p className="font-semibold text-primary">Frontend</p>
                <p className="text-xs text-foreground-muted">Next.js</p>
              </div>
              <div className="text-primary text-2xl">→</div>
              <div className="px-6 py-4 bg-gradient-to-r from-accent/20 to-accent/10 border border-accent rounded-lg text-center min-w-32">
                <p className="font-semibold text-accent">Backend API</p>
                <p className="text-xs text-foreground-muted">Express</p>
              </div>
              <div className="text-primary text-2xl">→</div>
              <div className="px-6 py-4 bg-gradient-to-r from-accent-light/20 to-accent-light/10 border border-accent-light rounded-lg text-center min-w-32">
                <p className="font-semibold text-accent-light">0G Chain</p>
                <p className="text-xs text-foreground-muted">Smart Contracts</p>
              </div>
            </div>

            {/* Layer 2 - Supporting Services */}
            <div className="flex items-center justify-between gap-4">
              <div className="text-foreground-muted text-sm">Storage</div>
              <div className="flex-1 h-px border-t border-dashed border-border-light" />
              <div className="px-6 py-3 bg-background border border-border-light rounded-lg text-center min-w-48">
                <p className="font-semibold text-foreground">0G Storage</p>
                <p className="text-xs text-foreground-muted">Encrypted Data Blobs</p>
              </div>
              <div className="flex-1 h-px border-t border-dashed border-border-light" />
              <div className="text-foreground-muted text-sm">Decentralized</div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="text-foreground-muted text-sm">Oracle</div>
              <div className="flex-1 h-px border-t border-dashed border-border-light" />
              <div className="px-6 py-3 bg-background border border-border-light rounded-lg text-center min-w-48">
                <p className="font-semibold text-foreground">TEE Oracle</p>
                <p className="text-xs text-foreground-muted">Re-encryption Proofs</p>
              </div>
              <div className="flex-1 h-px border-t border-dashed border-border-light" />
              <div className="text-foreground-muted text-sm">Trusted Execution</div>
            </div>
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            {
              category: 'Blockchain',
              items: ['0G Chain (EVM Compatible)', 'Hardhat (Dev Framework)', 'Solidity 0.8.19', 'ERC-721 (INFT Tokens)'],
              accent: 'from-primary',
            },
            {
              category: 'Cryptography',
              items: ['AES-256-GCM (Encryption)', 'ECDSA Signatures', 'SHA-256 (Hashing)', 'Nonce-based Replay Guard'],
              accent: 'from-accent',
            },
            {
              category: 'Storage',
              items: ['0G Storage (Decentralized)', 'IPFS-like Content Addressing', 'Redundancy & Sharding', 'Permanent Archive'],
              accent: 'from-accent-light',
            },
            {
              category: 'Backend',
              items: ['Node.js + Express', 'TypeScript', 'Wagmi (Web3)', 'Docker'],
              accent: 'from-success',
            },
            {
              category: 'Frontend',
              items: ['Next.js 16', 'React 19', 'Tailwind CSS', 'Web3 Wallet Integration'],
              accent: 'from-primary',
            },
            {
              category: 'Infrastructure',
              items: ['0G Galileo Testnet', 'Mock TEE Oracle', 'Vercel Hosting', 'CI/CD Pipeline'],
              accent: 'from-accent',
            },
          ].map((stack, idx) => (
            <div key={idx} className="p-6 border border-border rounded-xl hover:border-primary/50 transition-colors bg-background-secondary">
              <div className={`w-12 h-12 bg-gradient-to-br ${stack.accent} to-accent/20 rounded-lg mb-4`} />
              <h3 className="text-xl font-semibold text-foreground mb-4">{stack.category}</h3>
              <ul className="space-y-2">
                {stack.items.map((item, i) => (
                  <li key={i} className="text-sm text-foreground-muted flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Business Model */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 border border-border rounded-xl bg-background-secondary">
            <h3 className="text-2xl font-bold text-foreground mb-6">Revenue Model</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Marketplace Fee (3-5%)</p>
                  <p className="text-sm text-foreground-muted">On every INFT sale</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent/20 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Lease Revenue Share</p>
                  <p className="text-sm text-foreground-muted">% of lessee payments</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent-light/20 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-light font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Premium Agent Listing</p>
                  <p className="text-sm text-foreground-muted">Featured marketplace spots</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border border-border rounded-xl bg-background-secondary">
            <h3 className="text-2xl font-bold text-foreground mb-6">Competitive Advantage</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 text-primary">✓</div>
                <div>
                  <p className="font-semibold text-foreground">Intelligence Transfer</p>
                  <p className="text-sm text-foreground-muted">First platform to transfer AI configurations securely</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 text-primary">✓</div>
                <div>
                  <p className="font-semibold text-foreground">Cryptographic Proof</p>
                  <p className="text-sm text-foreground-muted">Tamper-proof on-chain verification of transfers</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 text-primary">✓</div>
                <div>
                  <p className="font-semibold text-foreground">Leasing Economics</p>
                  <p className="text-sm text-foreground-muted">Passive income for owners, accessible entry for lessees</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Encryption', value: 'AES-256' },
            { label: 'Block Time', value: '~2s' },
            { label: 'Storage', value: '0G Network' },
            { label: 'Replay Guard', value: 'Nonce-based' },
          ].map((metric, idx) => (
            <div key={idx} className="p-6 bg-gradient-to-br from-background-secondary to-background border border-border rounded-lg text-center">
              <p className="text-2xl font-bold text-primary mb-2">{metric.value}</p>
              <p className="text-sm text-foreground-muted">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
