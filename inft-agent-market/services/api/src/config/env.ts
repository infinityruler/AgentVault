import * as dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(8787),
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  OG_CHAIN_ID: z.coerce.number().int().positive().default(16602),
  OG_RPC_URL: z.string().url().default("https://evmrpc-testnet.0g.ai"),
  OG_STORAGE_MOCK_DIR: z.string().default(path.resolve(process.cwd(), ".mock-storage")),
  OG_COMPUTE_BASE_URL: z.string().url().default("https://api.0g.ai"),
  OG_COMPUTE_API_KEY: z.string().optional(),
  ORACLE_SIGNER_PRIVATE_KEY: z.string().default("0x0000000000000000000000000000000000000000000000000000000000000001"),
  ORACLE_PROOF_TTL_SECONDS: z.coerce.number().int().positive().default(300)
});

export const env = schema.parse(process.env);
