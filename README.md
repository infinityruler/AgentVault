# AgentVault Showcase

A stunning Next.js pitch deck website for **AgentVault** — the first marketplace for AI agents as INFTs (Intelligent NFTs), where encrypted intelligence itself transfers ownership.

## 🚀 Quick Start

```bash
# Install dependencies
npm install
# or
pnpm install

# Run the dev server
npm run dev
# or
pnpm dev

# Open your browser
# The site will be available at http://localhost:3000
```

## 📋 What's Inside

This showcase presents the complete AgentVault vision:

- **Hero Section** - Eye-catching intro with animated graphics
- **Problem & Solution** - Why INFTs matter vs traditional NFTs
- **How It Works** - Interactive 5-step flow walkthrough (Mint → List → Buy → Lease → Execute)
- **Interactive Demo** - Simulations of all 5 core operations with form inputs and result outputs
- **Architecture & Tech Stack** - System design, cryptography, blockchain, and infrastructure breakdown
- **Business Model** - Revenue streams and competitive advantages
- **Footer** - Links and testnet notice

## 🎨 Design

- **Dark theme** with electric blue/cyan primary and purple accents
- **Responsive** mobile-first design
- **Smooth animations** and transitions for visual engagement
- **Tailwind CSS v4** for styling
- **Next.js 16** with React 19

## 🔧 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Fonts**: Geist (sans), Geist Mono
- **Components**: Custom built, no external UI library
- **Animations**: CSS keyframes + Framer Motion ready

## 📁 Project Structure

```
/app
  ├── page.tsx           # Main page (imports all sections)
  ├── layout.tsx         # Root layout with fonts & metadata
  └── globals.css        # Tailwind config + design tokens

/components
  ├── navigation.tsx     # Fixed header nav
  ├── hero.tsx          # Hero section with animated elements
  ├── problem-section.tsx # Problem/solution comparison
  ├── how-it-works.tsx  # Interactive 5-step flow
  ├── interactive-demo.tsx # Simulation tabs
  ├── architecture.tsx   # Tech stack + business model
  └── footer.tsx        # Footer with links

/lib
  └── utils.ts          # Utility functions (cn)

next.config.mjs
package.json
tsconfig.json
```

## 🚀 Deployment

This project is ready to deploy to Vercel:

```bash
vercel deploy
```

Or push to GitHub and connect to Vercel for automatic deployments.

## 📝 Notes

- This is a **showcase/pitch website**, not a functional dApp
- The demo simulations are client-side and don't connect to real contracts
- Contracts are in `/inft-agent-market/contracts` (requires deployment to 0G Galileo)
- Backend API is in `/inft-agent-market/services/api` (requires hosting)

## 🎯 Next Steps

When you're ready to make this functional:

1. **Deploy smart contracts** to 0G Galileo testnet
2. **Host the backend API** (Express service with encryption/oracle logic)
3. **Wire up wallet integration** using wagmi (templates in `/inft-agent-market/app`)
4. **Connect demo tabs** to real `/mint`, `/list`, `/buy`, `/lease`, `/execute` endpoints

## 📞 Support

For questions about AgentVault, see the docs in `/inft-agent-market/docs/`
