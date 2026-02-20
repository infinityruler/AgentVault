# MVP Build Checklist

## Phase 0: Setup
- [x] Monorepo scaffolded (`contracts`, `services/api`, `app`, `docs`)
- [x] Shared `.env.example` with 0G endpoints and contract/app vars
- [ ] Install dependencies (`npm install`)

## Phase 1: Contracts
- [x] `AgentINFT.sol` implemented (mint, transferWithMetadata, authorizeUsage, revokeUsage)
- [x] `AgentMarketplace.sol` implemented (list, cancel, buy, fees + royalties)
- [x] `MockTEEOracleVerifier.sol` implemented (signature + nonce replay guard)
- [x] Hardhat deploy script + test suite added
- [ ] Compile and run tests locally

## Phase 2: Storage + Encryption API
- [x] `/mint` route implemented
- [x] AES-GCM metadata encryption helper implemented
- [x] Mock storage persistence implemented (`zg://mock/...`)
- [ ] Replace mock storage with native 0G Storage SDK (optional stretch)

## Phase 3: Transfer Proof Service
- [x] `/transfer-proof` route implemented
- [x] Oracle proof payload/signature generation implemented
- [x] Contract verifier payload format aligned

## Phase 4: Leasing + Execute
- [x] `authorizeUsage` flow in contract + UI
- [x] `/execute` route checks on-chain `hasValidUsage`
- [x] Compute integration scaffolded with fallback mock output

## Phase 5: Demo Hardening
- [x] Frontend proof panel added
- [x] Demo script and pitch notes added
- [ ] Deploy to Galileo and set app contract addresses
- [ ] Run full end-to-end demo with 3 wallets
