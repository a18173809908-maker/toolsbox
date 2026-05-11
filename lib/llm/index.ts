// Provider-agnostic LLM client. Swap provider via LLM_PROVIDER env var.
// Currently: deepseek (OpenAI-compatible). Anthropic adapter can be added here.
//
// Model tiers (see docs/dev-plan-2026-05.md Q12):
//   - standard: 客观字段起草、翻译、轻量任务 → 用 LLM_MODEL
//   - premium:  立场字段起草、反套话审计、需要判断的任务 → 用 LLM_MODEL_PREMIUM
// 当前 standard 和 premium 都指向 DeepSeek（LLM_MODEL_PREMIUM 缺省 fallback 到 LLM_MODEL）。
// 未来要升 Claude Sonnet 时只需在 .env 设 LLM_MODEL_PREMIUM=claude-sonnet-... 并加 anthropic adapter。

import OpenAI from 'openai';

type Provider = 'deepseek' | 'openai' | 'anthropic';
export type ModelTier = 'standard' | 'premium';

const PROVIDER_DEFAULTS: Record<Provider, { baseURL?: string; defaultModel: string; envKey: string }> = {
  deepseek: { baseURL: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat', envKey: 'DEEPSEEK_API_KEY' },
  openai:   { defaultModel: 'gpt-4o-mini', envKey: 'OPENAI_API_KEY' },
  anthropic: { defaultModel: 'claude-haiku-4-5-20251001', envKey: 'ANTHROPIC_API_KEY' },
};

function getClient(tier: ModelTier = 'standard') {
  const provider = (process.env.LLM_PROVIDER || 'deepseek') as Provider;
  if (provider === 'anthropic') {
    throw new Error('anthropic adapter not implemented yet — set LLM_PROVIDER=deepseek');
  }
  const cfg = PROVIDER_DEFAULTS[provider];
  const apiKey = process.env[cfg.envKey];
  if (!apiKey) throw new Error(`${cfg.envKey} not set`);
  const model =
    tier === 'premium'
      ? process.env.LLM_MODEL_PREMIUM || process.env.LLM_MODEL || cfg.defaultModel
      : process.env.LLM_MODEL || cfg.defaultModel;
  const client = new OpenAI({ apiKey, baseURL: cfg.baseURL });
  return { client, model, provider, tier };
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function chat(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number; tier?: ModelTier },
): Promise<string> {
  const { client, model } = getClient(opts?.tier);
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature: opts?.temperature ?? 0.2,
    max_tokens: opts?.maxTokens ?? 1024,
  });
  return res.choices[0]?.message?.content?.trim() ?? '';
}

// Returns the actual model name resolved for the given tier (for logging into draft rows).
export function resolveModelName(tier: ModelTier = 'standard'): string {
  const { model } = getClient(tier);
  return model;
}

// Translate a batch of strings EN → ZH-CN. Returns same-length array.
// Uses a single call with JSON output for efficiency.
export async function translateBatchToZh(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];

  const numbered = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const sys = `你是技术翻译。把英文 GitHub 仓库描述翻成简洁的简体中文（不超过 40 个字），保留专有名词（如 PyTorch, Rust, LLaMA）原文不译。只输出 JSON，不要解释。`;
  const user = `请把下面 ${texts.length} 条描述翻成中文，按相同编号返回 JSON：

${numbered}

输出格式：{"translations": ["第1条中文", "第2条中文", ...]}`;

  const raw = await chat(
    [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ],
    { temperature: 0.2, maxTokens: Math.max(800, texts.length * 80) },
  );

  const json = extractJson(raw);
  if (!json) throw new Error(`LLM did not return JSON: ${raw.slice(0, 200)}`);
  const parsed = JSON.parse(json) as { translations?: string[] };
  if (!Array.isArray(parsed.translations) || parsed.translations.length !== texts.length) {
    throw new Error(`translations length mismatch: got ${parsed.translations?.length}, want ${texts.length}`);
  }
  return parsed.translations.map((s) => String(s).trim());
}

function extractJson(s: string): string | null {
  const fenced = s.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenced) return fenced[1];
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return null;
}
