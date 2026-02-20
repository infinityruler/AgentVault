import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

const chainId = Number(import.meta.env.VITE_OG_CHAIN_ID || "16602");
const rpcUrl = String(import.meta.env.VITE_OG_RPC_URL || "https://evmrpc-testnet.0g.ai");
const explorerUrl = String(import.meta.env.VITE_OG_EXPLORER_URL || "https://chainscan-galileo.0g.ai");

export const ogGalileo = defineChain({
  id: chainId,
  name: "0G Galileo Testnet",
  nativeCurrency: {
    name: "A0GI",
    symbol: "A0GI",
    decimals: 18
  },
  rpcUrls: {
    default: { http: [rpcUrl] }
  },
  blockExplorers: {
    default: {
      name: "0G Chainscan",
      url: explorerUrl
    }
  },
  testnet: true
});

export const wagmiConfig = createConfig({
  chains: [ogGalileo],
  connectors: [injected()],
  transports: {
    [ogGalileo.id]: http(rpcUrl)
  }
});
