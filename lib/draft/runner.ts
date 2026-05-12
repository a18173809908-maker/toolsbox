// Shared draft runner — loads prompt, calls LLM, runs anti-cliche audit, calls insertFn.
// Each draft script provides only: type-specific data fetch + insertFn mapping.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chat, resolveModelName, type ModelTier } from '@/lib/llm';

type Frontmatter = {
  name?: string;
  version?: string;
  model_tier?: ModelTier;
  temperature?: number;
  max_tokens?: number;
};

function parseFrontmatter(text: string): { frontmatter: Frontmatter; body: string } {
  const match = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: text };
  const fm: Record<string, unknown> = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    const v = rawVal.trim();
    if (v === 'true') fm[key] = true;
    else if (v === 'false') fm[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(v)) fm[key] = Number(v);
    else fm[key] = v;
  }
  return { frontmatter: fm as Frontmatter, body: match[2] };
}

function findLatestPromptFile(typeDir: string): string {
  const files = readdirSync(typeDir).filter((f) => /^v\d+\.md$/.test(f));
  if (files.length === 0) throw new Error(`no v<n>.md prompt file in ${typeDir}`);
  files.sort((a, b) => {
    const na = parseInt(a.match(/^v(\d+)\.md$/)![1], 10);
    const nb = parseInt(b.match(/^v(\d+)\.md$/)![1], 10);
    return nb - na;
  });
  return files[0];
}

function loadExamples(examplesDir: string): { slug: string; content: string }[] {
  if (!existsSync(examplesDir)) return [];
  return readdirSync(examplesDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.replace(/\.md$/, ''), content: readFileSync(join(examplesDir, f), 'utf8') }));
}

function extractJsonBlock(text: string, sectionHeader: string): string | null {
  const re = new RegExp(`##\\s*${sectionHeader}[\\s\\S]*?\`\`\`json\\s*([\\s\\S]+?)\\s*\`\`\``);
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function buildPrompt(body: string, examples: { slug: string; content: string }[], targetInput: string): string {
  const examplesBlock = examples
    .map((ex) => {
      const input = extractJsonBlock(ex.content, '输入数据') ?? '{}';
      const output = extractJsonBlock(ex.content, '目标输出') ?? '{}';
      return `### 样本：${ex.slug}\n\n输入：\n\`\`\`json\n${input}\n\`\`\`\n\n目标输出：\n\`\`\`json\n${output}\n\`\`\``;
    })
    .join('\n\n');
  return body
    .replace('<INPUT_JSON>', targetInput)
    .replace('<FEW_SHOT_EXAMPLES>', examplesBlock || '（无样本）')
    .replace('<TARGET_TOOL>', targetInput);
}

type AuditResult = {
  score: number;
  problems: { sentence: string; reason: string; rule: string }[];
  summary: string;
};

async function runAudit(draft: string): Promise<AuditResult> {
  const auditPath = resolve(process.cwd(), 'prompts/audit/anti-cliche.v1.md');
  if (!existsSync(auditPath)) return { score: -1, problems: [], summary: 'audit prompt missing' };
  const { body } = parseFrontmatter(readFileSync(auditPath, 'utf8'));
  const filled = body.replace('<DRAFT_TEXT>', draft);
  const raw = await chat([{ role: 'user', content: filled }], {
    temperature: 0.2,
    maxTokens: 800,
    tier: 'standard',
  });
  try {
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd <= jsonStart) throw new Error('no json');
    return JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as AuditResult;
  } catch {
    return { score: -1, problems: [], summary: raw.slice(0, 120) };
  }
}

export type DraftInsertInput = {
  rawOutput: string;
  parsed: Record<string, unknown> | null;
  promptVersion: string;
  llmModel: string;
  antiClicheScore: number | null;
};

export type DraftRunResult = {
  id: string;
  adminUrl: string;
  antiClicheScore: number | null;
  rawOutput: string;
};

export async function runDraft(opts: {
  promptType: string;
  inputData: unknown;
  insertFn: (result: DraftInsertInput) => Promise<string>;
  adminPath: string;
}): Promise<DraftRunResult> {
  const { promptType, inputData, insertFn, adminPath } = opts;

  const promptDir = resolve(process.cwd(), 'prompts', promptType);
  if (!existsSync(promptDir)) throw new Error(`prompt dir not found: ${promptDir}`);

  const latestFile = findLatestPromptFile(promptDir);
  const raw = readFileSync(join(promptDir, latestFile), 'utf8');
  const { frontmatter, body } = parseFrontmatter(raw);

  const examples = loadExamples(join(promptDir, 'examples'));
  const tier: ModelTier = (frontmatter.model_tier as ModelTier) ?? 'standard';
  const llmModel = resolveModelName(tier);
  const promptVersion = `${promptType}.${latestFile.replace('.md', '')}`;

  const inputStr = typeof inputData === 'string' ? inputData : JSON.stringify(inputData, null, 2);
  const prompt = buildPrompt(body, examples, inputStr);

  console.log(`  prompt: ${latestFile} | model: ${llmModel} | examples: ${examples.length}`);

  const rawOutput = await chat([{ role: 'user', content: prompt }], {
    temperature: frontmatter.temperature ?? 0.6,
    maxTokens: frontmatter.max_tokens ?? 1500,
    tier,
  });

  const audit = await runAudit(rawOutput);
  const antiClicheScore = audit.score >= 0 ? audit.score : null;
  if (antiClicheScore !== null) {
    const flag = antiClicheScore < 60 ? ' ⚠ (< 60)' : '';
    console.log(`  anti-cliche score: ${antiClicheScore}${flag}`);
  }

  let parsed: Record<string, unknown> | null = null;
  try {
    const jsonStart = rawOutput.indexOf('{');
    const jsonEnd = rawOutput.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      parsed = JSON.parse(rawOutput.slice(jsonStart, jsonEnd + 1));
    }
  } catch {
    // leave as null — insertFn can decide how to handle
  }

  const id = await insertFn({ rawOutput, parsed, promptVersion, llmModel, antiClicheScore });
  const adminUrl = `http://localhost:3000${adminPath}/${id}`;
  console.log(`  → ${adminUrl}`);

  return { id, adminUrl, antiClicheScore, rawOutput };
}
