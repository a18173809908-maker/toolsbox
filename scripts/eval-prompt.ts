// Eval harness for prompt iteration.
//
// Loads prompts/<type>/v<latest>.md + examples/, runs the prompt against a test set,
// runs anti-cliche audit on each draft, and writes a markdown report to tmp/.
//
// Usage:
//   npm run eval:prompt tool-verdict
//
// Test set: prefers prompts/<type>/eval-set.json; falls back to the example inputs themselves.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chat, resolveModelName, type ModelTier } from '../lib/llm';

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
    if (jsonStart < 0 || jsonEnd <= jsonStart) throw new Error('no json in audit response');
    return JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as AuditResult;
  } catch (e) {
    return {
      score: -1,
      problems: [{ sentence: '', reason: 'audit parse failed: ' + (e as Error).message, rule: '' }],
      summary: raw.slice(0, 120),
    };
  }
}

async function main() {
  const type = process.argv[2];
  if (!type) {
    console.error('usage: npm run eval:prompt <type>  (e.g. tool-verdict)');
    process.exit(1);
  }

  const promptDir = resolve(process.cwd(), 'prompts', type);
  if (!existsSync(promptDir)) {
    console.error(`prompt dir not found: ${promptDir}`);
    process.exit(1);
  }

  const latestFile = findLatestPromptFile(promptDir);
  const raw = readFileSync(join(promptDir, latestFile), 'utf8');
  const { frontmatter, body } = parseFrontmatter(raw);

  const examples = loadExamples(join(promptDir, 'examples'));
  const tier: ModelTier = frontmatter.model_tier ?? 'standard';
  const modelName = resolveModelName(tier);
  console.log(`prompt: ${latestFile} | tier: ${tier} | model: ${modelName} | examples: ${examples.length}`);

  // Build test set: prefer eval-set.json, fallback to example inputs.
  const evalSetPath = join(promptDir, 'eval-set.json');
  let testSet: { slug: string; input: string }[] = [];
  if (existsSync(evalSetPath)) {
    const data = JSON.parse(readFileSync(evalSetPath, 'utf8')) as { slug: string; input: unknown }[];
    testSet = data.map((d) => ({
      slug: d.slug,
      input: typeof d.input === 'string' ? d.input : JSON.stringify(d.input, null, 2),
    }));
  } else {
    testSet = examples
      .map((ex) => ({ slug: ex.slug, input: extractJsonBlock(ex.content, '输入数据') ?? '' }))
      .filter((t) => t.input);
    console.log(`(no eval-set.json; using ${testSet.length} example inputs as test set)`);
  }

  if (testSet.length === 0) {
    console.error('empty test set');
    process.exit(1);
  }

  type Result = { slug: string; draft: string } & AuditResult;
  const results: Result[] = [];

  for (const t of testSet) {
    console.log(`→ ${t.slug}`);
    const prompt = buildPrompt(body, examples, t.input);
    const draft = await chat([{ role: 'user', content: prompt }], {
      temperature: frontmatter.temperature ?? 0.6,
      maxTokens: frontmatter.max_tokens ?? 1500,
      tier,
    });
    const audit = await runAudit(draft);
    results.push({ slug: t.slug, draft, ...audit });
    console.log(`  score: ${audit.score} | problems: ${audit.problems.length}`);
  }

  // Write report.
  const tmpDir = resolve(process.cwd(), 'tmp');
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = join(tmpDir, `eval-${type}-${timestamp}.md`);

  const validScores = results.filter((r) => r.score >= 0);
  const avg = validScores.length > 0 ? validScores.reduce((s, r) => s + r.score, 0) / validScores.length : 0;

  const lines: string[] = [
    `# Eval: ${type} ${latestFile}`,
    '',
    `- 时间：${new Date().toLocaleString('zh-CN')}`,
    `- 模型：${modelName} (tier=${tier})`,
    `- 样本数：${testSet.length}`,
    `- 平均分：${avg.toFixed(1)} / 100`,
    `- 不合格（< 60）：${validScores.filter((r) => r.score < 60).length}`,
    '',
    '## 分项结果',
    '',
  ];
  for (const r of results) {
    lines.push(`### ${r.slug} — ${r.score} 分`);
    lines.push('');
    if (r.summary) lines.push(`${r.summary}`);
    lines.push('');
    if (r.problems.length > 0) {
      lines.push('**问题：**');
      for (const p of r.problems) {
        lines.push(`- [${p.rule || '?'}] ${p.reason}${p.sentence ? `：「${p.sentence}」` : ''}`);
      }
      lines.push('');
    }
    lines.push('<details><summary>草稿全文</summary>');
    lines.push('');
    lines.push('```json');
    lines.push(r.draft);
    lines.push('```');
    lines.push('');
    lines.push('</details>');
    lines.push('');
  }

  writeFileSync(reportPath, lines.join('\n'), 'utf8');
  console.log(`\n报告：${reportPath}`);
  console.log(`平均分：${avg.toFixed(1)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
