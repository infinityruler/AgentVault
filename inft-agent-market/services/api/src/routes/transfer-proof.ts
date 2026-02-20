import { Router } from "express";
import { z } from "zod";
import { ethers } from "ethers";
import { encryptMetadata, sealDataKeyForRecipient } from "../lib/crypto.js";
import { uploadEncryptedBlob } from "../lib/storage.js";
import { buildTransferProof } from "../lib/oracle.js";
import { fail, ok } from "../lib/http.js";

const schema = z.object({
  tokenId: z.coerce.bigint(),
  from: z.string().refine((value) => ethers.isAddress(value), "Invalid sender address"),
  to: z.string().refine((value) => ethers.isAddress(value), "Invalid recipient address"),
  inftAddress: z.string().refine((value) => ethers.isAddress(value), "Invalid INFT address"),
  verifierAddress: z.string().refine((value) => ethers.isAddress(value), "Invalid verifier address"),
  metadata: z.any()
});

export const transferProofRouter = Router();

transferProofRouter.post("/", async (req, res) => {
  try {
    const payload = schema.parse(req.body);
    const artifact = encryptMetadata(payload.metadata);
    const stored = await uploadEncryptedBlob(artifact.encryptedEnvelope);
    const sealed = sealDataKeyForRecipient(artifact.rawDataKeyHex, payload.to);

    const proofBundle = await buildTransferProof({
      verifierAddress: payload.verifierAddress,
      inftAddress: payload.inftAddress,
      tokenId: payload.tokenId,
      from: payload.from,
      to: payload.to,
      newMetadataHash: artifact.metadataHash,
      newEncryptedBlobRoot: artifact.encryptedBlobRoot,
      newSealedKeyHash: sealed.sealedKeyHash
    });

    return ok(res, {
      encryptedURI: stored.uri,
      metadataHash: artifact.metadataHash,
      encryptedBlobRoot: artifact.encryptedBlobRoot,
      sealedKey: sealed.sealedKey,
      sealedKeyHash: sealed.sealedKeyHash,
      payloadHash: proofBundle.payloadHash,
      nonce: proofBundle.nonce,
      deadline: proofBundle.deadline.toString(),
      signature: proofBundle.signature,
      proof: proofBundle.proof
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transfer proof generation failed";
    return fail(res, 400, message);
  }
});
