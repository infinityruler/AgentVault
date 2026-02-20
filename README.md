# AgentVault (INFT Agent Marketplace)

Monorepo MVP to mint, trade, lease, and execute INFT-based AI agents on 0G Galileo testnet.

## Workspace Layout
- `contracts`: Solidity contracts, tests, and deploy script
- `services/api`: mint prep, transfer proof, entitlement-checked execute API
- `app`: React dApp for mint/list/buy/lease/execute flows
- `docs`: pitch notes and demo script

## Prerequisites
- Node.js >= 20
- A browser wallet (MetaMask, Rabby, etc.)
- 0G Galileo testnet funds for test wallets

## 1) Environment Setup
```bash
cd /Users/akjain/Desktop/CODEX/inft-agent-market
cp .env.example .env
```

Set these required values in `.env`:
- `DEPLOYER_PRIVATE_KEY`: private key used for contract deploy
- `ORACLE_SIGNER_PRIVATE_KEY`: private key used by API to sign transfer proofs
- `ORACLE_SIGNER_ADDRESS`: address of `ORACLE_SIGNER_PRIVATE_KEY`
- `FEE_RECIPIENT`: protocol fee receiver
- `DEFAULT_ROYALTY_RECIPIENT`: royalty receiver fallback
- `OG_COMPUTE_API_KEY`: optional; if omitted, execute endpoint returns mocked inference

## 2) Install Dependencies
```bash
npm install
```

## 3) Test Contracts (Local)
```bash
npm run test -w contracts
```

## 4) Deploy to Galileo
```bash
npm run deploy:galileo -w contracts
```

Copy the deployed addresses into `.env`:
- `VITE_AGENT_INFT_ADDRESS`
- `VITE_MARKETPLACE_ADDRESS`
- `VITE_VERIFIER_ADDRESS`

## 5) Run Backend + App
Terminal A:
```bash
npm run dev -w services/api
```

Terminal B:
```bash
npm run dev -w app
```

## 6) Demo Flow
Follow `/Users/akjain/Desktop/CODEX/inft-agent-market/docs/demo-script.md`.
