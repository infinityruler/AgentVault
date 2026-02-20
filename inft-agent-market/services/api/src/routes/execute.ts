import { Router } from "express";
import { z } from "zod";
import { ethers } from "ethers";
import { hasValidUsage } from "../lib/chain.js";
import { runInference } from "../lib/compute.js";
import { fail, ok } from "../lib/http.js";

const schema = z.object({
  inftAddress: z.string().refine((value) => ethers.isAddress(value), "Invalid INFT address"),
  tokenId: z.coerce.bigint(),
  userAddress: z.string().refine((value) => ethers.isAddress(value), "Invalid user address"),
  prompt: z.string().min(1).max(10_000),
  model: z.string().optional()
});

export const executeRouter = Router();

executeRouter.post("/", async (req, res) => {
  try {
    const payload = schema.parse(req.body);
    const allowed = await hasValidUsage(payload.inftAddress, payload.tokenId, payload.userAddress);
    if (!allowed) {
      return fail(res, 403, "Usage not authorized for this wallet/token.");
    }

    const result = await runInference({ prompt: payload.prompt, model: payload.model });
    return ok(res, {
      tokenId: payload.tokenId.toString(),
      userAddress: payload.userAddress,
      inference: result,
      receiptHash: ethers.keccak256(
        ethers.toUtf8Bytes(`${payload.inftAddress}:${payload.tokenId}:${payload.userAddress}:${payload.prompt}`)
      )
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution failed";
    return fail(res, 400, message);
  }
});
