import { FormEvent, useMemo, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWriteContract
} from "wagmi";
import { isAddress, keccak256, parseEther, stringToHex } from "viem";
import { agentINFTAbi, marketplaceAbi } from "./lib/contracts";
import { ogGalileo } from "./lib/wagmi";
import "./styles.css";

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: string };

type MintPreparation = {
  encryptedURI: string;
  metadataHash: `0x${string}`;
  encryptedBlobRoot: `0x${string}`;
  sealedKey: string;
  sealedKeyHash: `0x${string}`;
};

type TransferPreparation = MintPreparation & {
  payloadHash: `0x${string}`;
  nonce: `0x${string}`;
  deadline: string;
  signature: `0x${string}`;
  proof: `0x${string}`;
};

const apiBase = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:8787");
const inftAddress = (import.meta.env.VITE_AGENT_INFT_ADDRESS as `0x${string}` | undefined) ?? undefined;
const marketAddress = (import.meta.env.VITE_MARKETPLACE_ADDRESS as `0x${string}` | undefined) ?? undefined;
const verifierAddress = (import.meta.env.VITE_VERIFIER_ADDRESS as `0x${string}` | undefined) ?? undefined;
const explorerBase = String(import.meta.env.VITE_OG_EXPLORER_URL || "https://chainscan-galileo.0g.ai");

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const json = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !json.ok) {
    throw new Error(json.ok ? `Request failed with status ${response.status}` : json.error);
  }
  return json.data;
}

function getConfiguredAddresses(): {
  inftAddress: `0x${string}`;
  marketAddress: `0x${string}`;
  verifierAddress: `0x${string}`;
} {
  if (!inftAddress || !isAddress(inftAddress)) {
    throw new Error("VITE_AGENT_INFT_ADDRESS is missing or invalid.");
  }
  if (!marketAddress || !isAddress(marketAddress)) {
    throw new Error("VITE_MARKETPLACE_ADDRESS is missing or invalid.");
  }
  if (!verifierAddress || !isAddress(verifierAddress)) {
    throw new Error("VITE_VERIFIER_ADDRESS is missing or invalid.");
  }
  return { inftAddress, marketAddress, verifierAddress };
}

export default function App(): JSX.Element {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: ogGalileo.id });

  const [status, setStatus] = useState<string>("Ready.");
  const [lastTx, setLastTx] = useState<string>("");
  const [proofData, setProofData] = useState<TransferPreparation | null>(null);

  const [mintMetadata, setMintMetadata] = useState(
    JSON.stringify(
      {
        name: "DeFi Yield Strategist",
        version: "1.0.0",
        systemPrompt: "Analyze lending pools and explain risk in plain English.",
        tools: ["lending-analyzer", "risk-scanner"]
      },
      null,
      2
    )
  );
  const [mintRoyaltyBps, setMintRoyaltyBps] = useState("500");

  const [listTokenId, setListTokenId] = useState("1");
  const [listPriceEth, setListPriceEth] = useState("0.1");
  const [listExpiryMinutes, setListExpiryMinutes] = useState("60");

  const [buyTokenId, setBuyTokenId] = useState("1");
  const [buyPriceEth, setBuyPriceEth] = useState("0.1");
  const [buySeller, setBuySeller] = useState("");
  const [buyMetadata, setBuyMetadata] = useState(
    JSON.stringify(
      {
        name: "DeFi Yield Strategist",
        version: "1.0.1",
        ownerCustomization: "Conservative risk profile"
      },
      null,
      2
    )
  );

  const [leaseTokenId, setLeaseTokenId] = useState("1");
  const [leaseUser, setLeaseUser] = useState("");
  const [leaseMinutes, setLeaseMinutes] = useState("30");
  const [leasePerms, setLeasePerms] = useState("chat-only");

  const [execTokenId, setExecTokenId] = useState("1");
  const [execPrompt, setExecPrompt] = useState("Find the top 3 yield opportunities and explain risks.");
  const [execModel, setExecModel] = useState("qwen/qwen3-32b");
  const [execOutput, setExecOutput] = useState("");

  const configReady = useMemo(() => {
    return Boolean(
      inftAddress &&
        marketAddress &&
        verifierAddress &&
        isAddress(inftAddress) &&
        isAddress(marketAddress) &&
        isAddress(verifierAddress)
    );
  }, []);

  async function ensureChain(): Promise<void> {
    if (!isConnected) {
      throw new Error("Connect wallet first.");
    }
    if (chainId !== ogGalileo.id) {
      await switchChainAsync({ chainId: ogGalileo.id });
    }
  }

  async function sendTx(request: Parameters<typeof writeContractAsync>[0]): Promise<void> {
    if (!publicClient) {
      throw new Error("Public client unavailable.");
    }
    const txHash = await writeContractAsync(request);
    setLastTx(txHash);
    setStatus(`Transaction submitted: ${txHash}`);
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    setStatus(`Transaction confirmed: ${txHash}`);
  }

  async function handleMint(event: FormEvent): Promise<void> {
    event.preventDefault();
    try {
      const configured = getConfiguredAddresses();
      await ensureChain();
      if (!address) throw new Error("Wallet address missing.");

      setStatus("Preparing encrypted metadata...");
      const metadata = JSON.parse(mintMetadata);
      const prepared = await postJson<MintPreparation>("/mint", {
        ownerAddress: address,
        metadata
      });

      setStatus("Submitting mint transaction...");
      await sendTx({
        address: configured.inftAddress,
        abi: agentINFTAbi,
        functionName: "mintAgent",
        args: [
          address,
          prepared.metadataHash,
          prepared.encryptedBlobRoot,
          prepared.sealedKeyHash,
          prepared.encryptedURI,
          BigInt(mintRoyaltyBps)
        ]
      });
      setStatus("Mint complete.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Mint failed");
    }
  }

  async function handleApproveAndList(event: FormEvent): Promise<void> {
    event.preventDefault();
    try {
      const configured = getConfiguredAddresses();
      await ensureChain();

      const tokenId = BigInt(listTokenId);
      const priceWei = parseEther(listPriceEth);
      const expiresAt = BigInt(Math.floor(Date.now() / 1000) + Number(listExpiryMinutes) * 60);

      setStatus("Approving marketplace...");
      await sendTx({
        address: configured.inftAddress,
        abi: agentINFTAbi,
        functionName: "approve",
        args: [configured.marketAddress, tokenId]
      });

      setStatus("Creating listing...");
      await sendTx({
        address: configured.marketAddress,
        abi: marketplaceAbi,
        functionName: "listToken",
        args: [tokenId, priceWei, expiresAt]
      });
      setStatus("Listing active.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "List failed");
    }
  }

  async function handleBuy(event: FormEvent): Promise<void> {
    event.preventDefault();
    try {
      const configured = getConfiguredAddresses();
      await ensureChain();
      if (!address) throw new Error("Wallet address missing.");
      if (!isAddress(buySeller)) throw new Error("Seller address is invalid.");

      const tokenId = BigInt(buyTokenId);
      const prepared = await postJson<TransferPreparation>("/transfer-proof", {
        tokenId: tokenId.toString(),
        from: buySeller,
        to: address,
        inftAddress: configured.inftAddress,
        verifierAddress: configured.verifierAddress,
        metadata: JSON.parse(buyMetadata)
      });
      setProofData(prepared);

      await sendTx({
        address: configured.marketAddress,
        abi: marketplaceAbi,
        functionName: "buyToken",
        args: [
          tokenId,
          prepared.metadataHash,
          prepared.encryptedBlobRoot,
          prepared.sealedKeyHash,
          prepared.encryptedURI,
          prepared.proof
        ],
        value: parseEther(buyPriceEth)
      });
      setStatus("Purchase complete.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Buy failed");
    }
  }

  async function handleAuthorizeUsage(event: FormEvent): Promise<void> {
    event.preventDefault();
    try {
      const configured = getConfiguredAddresses();
      await ensureChain();
      if (!isAddress(leaseUser)) throw new Error("Lease wallet is invalid.");

      const tokenId = BigInt(leaseTokenId);
      const expiry = BigInt(Math.floor(Date.now() / 1000) + Number(leaseMinutes) * 60);
      const permsHash = keccak256(stringToHex(leasePerms));

      await sendTx({
        address: configured.inftAddress,
        abi: agentINFTAbi,
        functionName: "authorizeUsage",
        args: [tokenId, leaseUser, expiry, permsHash]
      });
      setStatus("Usage rights granted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authorize usage failed");
    }
  }

  async function handleExecute(event: FormEvent): Promise<void> {
    event.preventDefault();
    try {
      const configured = getConfiguredAddresses();
      if (!address) throw new Error("Wallet address missing.");

      const data = await postJson<{
        tokenId: string;
        userAddress: string;
        inference: { output: string; provider: string; model: string; fallback: boolean };
        receiptHash: string;
      }>("/execute", {
        inftAddress: configured.inftAddress,
        tokenId: execTokenId,
        userAddress: address,
        prompt: execPrompt,
        model: execModel
      });

      setExecOutput(
        JSON.stringify(
          {
            inference: data.inference,
            receiptHash: data.receiptHash
          },
          null,
          2
        )
      );
      setStatus("Execution complete.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Execution failed");
    }
  }

  return (
    <main className="page">
      <header className="header">
        <h1>AgentVault MVP</h1>
        <p>Mint, trade, lease, and execute INFT agents on 0G Galileo.</p>
        <div className="status-row">
          <span className={configReady ? "ok" : "warn"}>
            Config: {configReady ? "ready" : "missing contract addresses"}
          </span>
          <span>Wallet: {isConnected ? address : "disconnected"}</span>
          <span>Chain: {chainId ?? "-"}</span>
        </div>
        <div className="button-row">
          {!isConnected &&
            connectors.map((connector) => (
              <button key={connector.uid} onClick={() => connect({ connector })}>
                Connect {connector.name}
              </button>
            ))}
          {isConnected && <button onClick={() => disconnect()}>Disconnect</button>}
        </div>
      </header>

      <section className="card">
        <h2>1) Mint INFT</h2>
        <form onSubmit={handleMint}>
          <label>
            Metadata JSON
            <textarea value={mintMetadata} onChange={(event) => setMintMetadata(event.target.value)} rows={8} />
          </label>
          <label>
            Royalty BPS
            <input
              type="number"
              min={0}
              max={10000}
              value={mintRoyaltyBps}
              onChange={(event) => setMintRoyaltyBps(event.target.value)}
            />
          </label>
          <button type="submit">Prepare + Mint</button>
        </form>
      </section>

      <section className="card">
        <h2>2) Approve + List</h2>
        <form onSubmit={handleApproveAndList}>
          <label>
            Token ID
            <input value={listTokenId} onChange={(event) => setListTokenId(event.target.value)} />
          </label>
          <label>
            Price (A0GI)
            <input value={listPriceEth} onChange={(event) => setListPriceEth(event.target.value)} />
          </label>
          <label>
            Expiry Minutes
            <input value={listExpiryMinutes} onChange={(event) => setListExpiryMinutes(event.target.value)} />
          </label>
          <button type="submit">Approve + List</button>
        </form>
      </section>

      <section className="card">
        <h2>3) Buy + Transfer Proof</h2>
        <form onSubmit={handleBuy}>
          <label>
            Token ID
            <input value={buyTokenId} onChange={(event) => setBuyTokenId(event.target.value)} />
          </label>
          <label>
            Seller Address
            <input value={buySeller} onChange={(event) => setBuySeller(event.target.value)} />
          </label>
          <label>
            Price (A0GI)
            <input value={buyPriceEth} onChange={(event) => setBuyPriceEth(event.target.value)} />
          </label>
          <label>
            New Metadata JSON (for buyer)
            <textarea value={buyMetadata} onChange={(event) => setBuyMetadata(event.target.value)} rows={6} />
          </label>
          <button type="submit">Prepare Proof + Buy</button>
        </form>
      </section>

      <section className="card">
        <h2>4) Lease Usage Rights</h2>
        <form onSubmit={handleAuthorizeUsage}>
          <label>
            Token ID
            <input value={leaseTokenId} onChange={(event) => setLeaseTokenId(event.target.value)} />
          </label>
          <label>
            Lessee Wallet
            <input value={leaseUser} onChange={(event) => setLeaseUser(event.target.value)} />
          </label>
          <label>
            Duration Minutes
            <input value={leaseMinutes} onChange={(event) => setLeaseMinutes(event.target.value)} />
          </label>
          <label>
            Permission Label
            <input value={leasePerms} onChange={(event) => setLeasePerms(event.target.value)} />
          </label>
          <button type="submit">Authorize Usage</button>
        </form>
      </section>

      <section className="card">
        <h2>5) Execute (Entitlement-Checked)</h2>
        <form onSubmit={handleExecute}>
          <label>
            Token ID
            <input value={execTokenId} onChange={(event) => setExecTokenId(event.target.value)} />
          </label>
          <label>
            Prompt
            <textarea value={execPrompt} onChange={(event) => setExecPrompt(event.target.value)} rows={4} />
          </label>
          <label>
            Model
            <input value={execModel} onChange={(event) => setExecModel(event.target.value)} />
          </label>
          <button type="submit">Run Execute API</button>
        </form>
      </section>

      <section className="card">
        <h2>Proof Panel</h2>
        <p>Status: {status}</p>
        {lastTx && (
          <p>
            Last Tx:{" "}
            <a href={`${explorerBase}/tx/${lastTx}`} target="_blank" rel="noreferrer">
              {lastTx}
            </a>
          </p>
        )}
        {proofData && <pre>{JSON.stringify(proofData, null, 2)}</pre>}
        {execOutput && <pre>{execOutput}</pre>}
      </section>
    </main>
  );
}
