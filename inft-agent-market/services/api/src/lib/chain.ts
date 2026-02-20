import { ethers } from "ethers";
import { env } from "../config/env.js";

const inftAbi = [
  "function hasValidUsage(uint256 tokenId, address user) view returns (bool)"
];

const provider = new ethers.JsonRpcProvider(env.OG_RPC_URL, env.OG_CHAIN_ID);

export async function hasValidUsage(inftAddress: string, tokenId: bigint, userAddress: string): Promise<boolean> {
  const contract = new ethers.Contract(inftAddress, inftAbi, provider);
  return contract.hasValidUsage(tokenId, userAddress);
}
