# AgentVault Demo Script (3 Minutes)

## Setup Before Demo
1. Open API at `http://localhost:8787/health`.
2. Open app at `http://localhost:5173`.
3. Prepare 3 wallets:
- `Creator` (mints + lists)
- `Buyer` (buys + leases)
- `Lessee` (executes)

## Live Flow
1. Connect `Creator` wallet in app.
2. Mint INFT:
- Paste metadata JSON.
- Click `Prepare + Mint`.
- Show tx hash in proof panel.
3. Approve + List:
- Enter minted token ID and sale price.
- Click `Approve + List`.
4. Switch wallet to `Buyer`.
5. Buy:
- Fill token ID, seller address (`Creator`), buyer metadata JSON, and price.
- Click `Prepare Proof + Buy`.
- Show proof payload fields in panel (`payloadHash`, `nonce`, `signature`).
6. Lease usage:
- Enter `Lessee` wallet and duration.
- Click `Authorize Usage`.
7. Switch wallet to `Lessee`.
8. Execute:
- Enter token ID + prompt.
- Click `Run Execute API`.
- Show inference output + `receiptHash`.

## Judge Narration Lines
- "We are transferring encrypted intelligence rights, not just NFT metadata."
- "Ownership transfer updates metadata commitments and sealed key hash."
- "Leasing allows recurring yield without selling ownership."
- "Execution is entitlement-gated by on-chain rights."
