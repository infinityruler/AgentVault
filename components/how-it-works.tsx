'use client'

import { useState } from 'react'

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: 'Creator Mints Agent',
      description: 'A creator packages their AI agent\'s configuration (system prompt, tools, model selection, etc.) and submits it to AgentVault.',
      details: [
        'System prompt + tool descriptions',
        'Model type & parameters',
        'AES-256-GCM encryption',
        'Deployed to 0G Storage',
      ],
    },
    {
      title: 'Agent Listed',
      description: 'The encrypted agent is stored on-chain with cryptographic proofs. An ERC-721 INFT token is minted representing ownership.',
      details: [
        'Hash commitments on-chain',
        'Nonce-protected transfers',
        'Royalty split configured',
        'Ready for marketplace',
      ],
    },
    {
      title: 'Buyer Purchases',
      description: 'A buyer discovers the agent in the marketplace and purchases it. The oracle re-encrypts the agent for the buyer\'s wallet.',
      details: [
        'TEE oracle verification',
        'Re-encryption for new owner',
        'Nonce prevents replay attacks',
        'Access transfers immediately',
      ],
    },
    {
      title: 'Owner Executes',
      description: 'The new owner can now call the agent to perform inference. On-chain verification ensures they have access rights.',
      details: [
        'Wallet calls /execute endpoint',
        'On-chain entitlement check',
        'Decrypt and run inference',
        'Get results directly',
      ],
    },
    {
      title: 'Lease Option',
      description: 'Instead of selling, owners can grant temporary usage rights. Lessees can execute without ownership.',
      details: [
        'Time-bounded access',
        'Lessee calls /execute',
        'On-chain expiration check',
        'Passive income for owner',
      ],
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Five steps from creation to execution, all secured by cryptography and verified on-chain.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    activeStep === idx
                      ? 'bg-primary/10 border-primary'
                      : 'border-border hover:border-border-light'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      activeStep === idx
                        ? 'bg-primary text-background'
                        : 'bg-background-secondary text-foreground-muted'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={activeStep === idx ? 'text-foreground font-semibold' : 'text-foreground-muted'}>
                      {step.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="p-8 border border-border-light rounded-xl bg-gradient-to-br from-background-secondary to-background min-h-96 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{steps[activeStep].title}</h3>
                <p className="text-foreground-muted mb-6 text-lg">{steps[activeStep].description}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-foreground-muted font-semibold uppercase">Key Details:</p>
                {steps[activeStep].details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-foreground">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visual flow diagram */}
        <div className="mt-16 p-8 border border-border rounded-xl bg-background-secondary">
          <p className="text-center text-foreground-muted mb-8 font-semibold">Full Marketplace Flow</p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {['Creator', 'Mint', 'Marketplace', 'Buy', 'Buyer', 'Execute', 'Agent'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-lg text-background font-semibold whitespace-nowrap">
                  {item}
                </div>
                {idx < 6 && <div className="text-primary text-2xl">→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
