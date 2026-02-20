import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { mintRouter } from "./routes/mint.js";
import { transferProofRouter } from "./routes/transfer-proof.js";
import { executeRouter } from "./routes/execute.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: env.API_RATE_LIMIT_WINDOW_MS,
    limit: env.API_RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "agentvault-api",
    chainId: env.OG_CHAIN_ID
  });
});

app.use("/mint", mintRouter);
app.use("/transfer-proof", transferProofRouter);
app.use("/execute", executeRouter);

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

app.listen(env.API_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AgentVault API listening on http://localhost:${env.API_PORT}`);
});
