import { env } from "../config/env.js";

export type ComputeRequest = {
  prompt: string;
  model?: string;
};

export type ComputeResult = {
  provider: string;
  model: string;
  output: string;
  fallback: boolean;
};

export async function runInference(request: ComputeRequest): Promise<ComputeResult> {
  const model = request.model || "qwen/qwen3-32b";
  if (!env.OG_COMPUTE_API_KEY) {
    return {
      provider: "mock",
      model,
      output: `Mock inference output for prompt: ${request.prompt.slice(0, 200)}`,
      fallback: true
    };
  }

  const response = await fetch(`${env.OG_COMPUTE_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OG_COMPUTE_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: request.prompt }],
      temperature: 0.2
    }),
    signal: AbortSignal.timeout(45_000)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Compute request failed (${response.status}): ${body}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const output = json.choices?.[0]?.message?.content ?? "No content returned.";

  return {
    provider: "0g-compute",
    model,
    output,
    fallback: false
  };
}
