import { createCipheriv, randomBytes } from "node:crypto";
import { ethers } from "ethers";

export type EncryptedArtifact = {
  encryptedEnvelope: string;
  metadataHash: `0x${string}`;
  encryptedBlobRoot: `0x${string}`;
  rawDataKeyHex: `0x${string}`;
};

function toHex(input: Uint8Array): `0x${string}` {
  return `0x${Buffer.from(input).toString("hex")}`;
}

export function encryptMetadata(metadata: unknown): EncryptedArtifact {
  const normalized = JSON.stringify(metadata);
  const plaintext = Buffer.from(normalized, "utf8");

  const dataKey = randomBytes(32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", dataKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const envelope = JSON.stringify({
    alg: "AES-256-GCM",
    iv: iv.toString("base64"),
    tag: authTag.toString("base64"),
    data: ciphertext.toString("base64")
  });

  return {
    encryptedEnvelope: envelope,
    metadataHash: ethers.keccak256(Buffer.from(normalized)),
    encryptedBlobRoot: ethers.keccak256(Buffer.from(envelope)),
    rawDataKeyHex: toHex(dataKey)
  };
}

export function sealDataKeyForRecipient(dataKeyHex: `0x${string}`, recipientAddress: string): {
  sealedKey: string;
  sealedKeyHash: `0x${string}`;
} {
  // For MVP this is a deterministic sealed payload. Replace with real recipient pubkey encryption in production.
  const sealedKey = Buffer.from(
    JSON.stringify({
      recipient: recipientAddress.toLowerCase(),
      dataKey: dataKeyHex
    }),
    "utf8"
  ).toString("base64");

  return {
    sealedKey,
    sealedKeyHash: ethers.keccak256(Buffer.from(sealedKey))
  };
}
