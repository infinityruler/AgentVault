export const agentINFTAbi = [
  {
    type: "function",
    name: "mintAgent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "metadataHash", type: "bytes32" },
      { name: "encryptedBlobRoot", type: "bytes32" },
      { name: "sealedKeyHash", type: "bytes32" },
      { name: "encryptedURI", type: "string" },
      { name: "royaltyBps", type: "uint96" }
    ],
    outputs: [{ name: "tokenId", type: "uint256" }]
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "authorizeUsage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "user", type: "address" },
      { name: "expiry", type: "uint64" },
      { name: "permsHash", type: "bytes32" }
    ],
    outputs: []
  }
] as const;

export const marketplaceAbi = [
  {
    type: "function",
    name: "listToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint96" },
      { name: "expiresAt", type: "uint64" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "buyToken",
    stateMutability: "payable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "newMetadataHash", type: "bytes32" },
      { name: "newEncryptedBlobRoot", type: "bytes32" },
      { name: "newSealedKeyHash", type: "bytes32" },
      { name: "newEncryptedURI", type: "string" },
      { name: "oracleProof", type: "bytes" }
    ],
    outputs: []
  }
] as const;

export function requiredAddress(value: string | undefined, field: string): `0x${string}` {
  if (!value || !value.startsWith("0x")) {
    throw new Error(`${field} is not configured.`);
  }
  return value as `0x${string}`;
}
