import { ethers } from "ethers";
import { env } from "../config/env.js";

const abiCoder = ethers.AbiCoder.defaultAbiCoder();

export type TransferProofInput = {
  verifierAddress: string;
  inftAddress: string;
  tokenId: bigint;
  from: string;
  to: string;
  newMetadataHash: `0x${string}`;
  newEncryptedBlobRoot: `0x${string}`;
  newSealedKeyHash: `0x${string}`;
};

export type TransferProofOutput = {
  payloadHash: `0x${string}`;
  nonce: `0x${string}`;
  deadline: bigint;
  signature: string;
  proof: string;
};

export async function buildTransferProof(input: TransferProofInput): Promise<TransferProofOutput> {
  const nonce = ethers.hexlify(ethers.randomBytes(32)) as `0x${string}`;
  const now = BigInt(Math.floor(Date.now() / 1000));
  const deadline = now + BigInt(env.ORACLE_PROOF_TTL_SECONDS);

  const encoded = abiCoder.encode(
    [
      "address",
      "uint256",
      "address",
      "uint256",
      "address",
      "address",
      "bytes32",
      "bytes32",
      "bytes32",
      "bytes32",
      "uint64"
    ],
    [
      input.verifierAddress,
      BigInt(env.OG_CHAIN_ID),
      input.inftAddress,
      input.tokenId,
      input.from,
      input.to,
      input.newMetadataHash,
      input.newEncryptedBlobRoot,
      input.newSealedKeyHash,
      nonce,
      deadline
    ]
  );

  const payloadHash = ethers.keccak256(encoded) as `0x${string}`;
  const signerWallet = new ethers.Wallet(env.ORACLE_SIGNER_PRIVATE_KEY);
  const signature = await signerWallet.signMessage(ethers.getBytes(payloadHash));
  const proof = abiCoder.encode(["bytes32", "uint64", "bytes"], [nonce, deadline, signature]);

  return {
    payloadHash,
    nonce,
    deadline,
    signature,
    proof
  };
}
