'use client'

import { useState } from 'react'

type DemoTab = 'mint' | 'list' | 'buy' | 'lease' | 'execute'

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>('mint')
  const [isProcessing, setIsProcessing] = useState(false)

  const tabs = [
    { id: 'mint', label: 'Mint Agent', icon: '🎯' },
    { id: 'list', label: 'List for Sale', icon: '📊' },
    { id: 'buy', label: 'Purchase', icon: '💳' },
    { id: 'lease', label: 'Grant Lease', icon: '⏱️' },
    { id: 'execute', label: 'Execute', icon: '⚡' },
  ] as const

  const handleSimulate = () => {
    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 2000)
  }

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Interactive Demo</h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Simulate the full INFT lifecycle. This showcases the flows that will run live on-chain.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-background p-4 rounded-xl border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DemoTab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-background'
                  : 'bg-background-secondary text-foreground-muted hover:text-foreground'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="p-8 border border-border rounded-xl bg-background">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              {activeTab === 'mint' && '1. Create & Mint AI Agent'}
              {activeTab === 'list' && '2. List Agent for Sale'}
              {activeTab === 'buy' && '3. Purchase INFT'}
              {activeTab === 'lease' && '4. Grant Lease Rights'}
              {activeTab === 'execute' && '5. Execute Agent Query'}
            </h3>

            <div className="space-y-4">
              {activeTab === 'mint' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Agent Name</label>
                    <input
                      type="text"
                      defaultValue="Research Assistant v2.1"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">System Prompt</label>
                    <textarea
                      defaultValue="You are a research expert. Analyze papers, extract insights..."
                      rows={4}
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Tools (JSON)</label>
                    <textarea
                      defaultValue='["search", "scrape", "summarize"]'
                      rows={3}
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                </>
              )}

              {activeTab === 'list' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Agent Token ID</label>
                    <input
                      type="text"
                      defaultValue="#2547"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Price (0G Tokens)</label>
                    <input
                      type="number"
                      defaultValue="5000"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Royalty %</label>
                    <input
                      type="number"
                      defaultValue="10"
                      max="50"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                </>
              )}

              {activeTab === 'buy' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Listing ID</label>
                    <input
                      type="text"
                      defaultValue="#2547"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Price Preview</label>
                    <div className="p-3 bg-background-secondary border border-border rounded-lg text-foreground-muted">
                      5000 0G + 500 0G (royalty)
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Your Wallet</label>
                    <input
                      type="text"
                      defaultValue="0x742d...8a2f"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                </>
              )}

              {activeTab === 'lease' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Agent Token ID</label>
                    <input
                      type="text"
                      defaultValue="#2547"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Lessee Wallet</label>
                    <input
                      type="text"
                      defaultValue="0x9c1d...4b5e"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Duration (days)</label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                </>
              )}

              {activeTab === 'execute' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Agent Token ID</label>
                    <input
                      type="text"
                      defaultValue="#2547"
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Query</label>
                    <textarea
                      defaultValue="What are the latest advances in cryptographic protocols?"
                      rows={3}
                      className="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleSimulate}
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent text-background font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Simulate Transaction'}
              </button>
            </div>
          </div>

          {/* Output / Result */}
          <div className="p-8 border border-border rounded-xl bg-background">
            <h3 className="text-2xl font-bold text-foreground mb-6">Result & Verification</h3>

            {isProcessing ? (
              <div className="space-y-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-border rounded w-3/4" />
                  <div className="h-4 bg-border rounded" />
                  <div className="h-4 bg-border rounded w-5/6" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-background-secondary border border-success/20 rounded-lg">
                  <p className="text-sm font-mono text-success">✓ Transaction Simulated</p>
                </div>

                <div className="space-y-2 text-sm">
                  <p><span className="text-foreground-muted">Hash:</span> <span className="text-primary font-mono">0x7f2a...9c3e</span></p>
                  <p><span className="text-foreground-muted">Block:</span> <span className="text-foreground">#4,521,847</span></p>
                  <p><span className="text-foreground-muted">Status:</span> <span className="text-success">Confirmed</span></p>
                </div>

                {activeTab === 'mint' && (
                  <div className="p-4 bg-primary/10 border border-primary rounded-lg">
                    <p className="text-sm text-primary font-semibold mb-2">Agent Minted</p>
                    <p className="text-xs text-foreground-muted">
                      Token ID: <span className="text-primary">#2547</span><br/>
                      Owner: <span className="text-primary">0x742d...8a2f</span>
                    </p>
                  </div>
                )}

                {activeTab === 'execute' && (
                  <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                    <p className="text-sm text-accent font-semibold mb-2">Agent Response</p>
                    <p className="text-xs text-foreground-muted">
                      Recent research shows cryptographic protocols advancing in post-quantum areas. Key development: lattice-based schemes gaining adoption...
                    </p>
                  </div>
                )}

                {(activeTab === 'list' || activeTab === 'buy') && (
                  <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                    <p className="text-sm text-accent font-semibold mb-2">Marketplace Event</p>
                    <p className="text-xs text-foreground-muted">
                      {activeTab === 'list' ? 'Agent listed. Awaiting buyer.' : 'Agent transferred. Executing re-encryption...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
