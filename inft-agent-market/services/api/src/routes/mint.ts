import { Router } from "express";
import { z } from "zod";
import { ethers } from "ethers";
import { encryptMetadata, sealDataKeyForRecipient } from "../lib/crypto.js";
import { uploadEncryptedBlob } from "../lib/storage.js";
import { fail, ok } from "../lib/http.js";

const schema = z.object({
  ownerAddress: z.string().refine((value) => ethers.isAddress(value), "Invalid owner address"),
  metadata: z.any()
});

export const mintRouter = Router();

mintRouter.post("/", async (req, res) => {
  try {
    const payload = schema.parse(req.body);
    const artifact = encryptMetadata(payload.metadata);
    const stored = await uploadEncryptedBlob(artifact.encryptedEnvelope);
    const sealed = sealDataKeyForRecipient(artifact.rawDataKeyHex, payload.ownerAddress);

    return ok(res, {
      encryptedURI: stored.uri,
      metadataHash: artifact.metadataHash,
      encryptedBlobRoot: artifact.encryptedBlobRoot,
      sealedKey: sealed.sealedKey,
      sealedKeyHash: sealed.sealedKeyHash
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mint preparation failed";
    return fail(res, 400, message);
  }
});
