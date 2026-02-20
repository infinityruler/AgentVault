import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ethers } from "ethers";
import { env } from "../config/env.js";

export type StoredBlob = {
  uri: string;
  filePath: string;
};

export async function uploadEncryptedBlob(encryptedEnvelope: string): Promise<StoredBlob> {
  const digest = ethers.keccak256(Buffer.from(encryptedEnvelope)).slice(2);

  await mkdir(env.OG_STORAGE_MOCK_DIR, { recursive: true });
  const filePath = path.join(env.OG_STORAGE_MOCK_DIR, `${digest}.json`);
  await writeFile(filePath, encryptedEnvelope, "utf8");

  return {
    uri: `zg://mock/${digest}`,
    filePath
  };
}
