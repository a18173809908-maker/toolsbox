import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { neon } from '@neondatabase/serverless';

const DRAFTS_DIR = 'docs/comparison-drafts';

// slug 里"前半-vs-后半"拆出的工具 ID 可能与 tools 表里的实际 id 有出入，这里集中映射
const TOOL_ID_OVERRIDES: Record<string, string> = {
  wenxin: 'wenxin-yiyan',
};

interface ParsedDraft {
  id: string;
  toolAId: string;
  toolBId: string;
  title: string;
  summary: string;
  verdict: string;
  body: string;
  seoKeywords: string[];
}

function parseDraft(filename: string, raw: string): ParsedDraft {
  const id = filename.replace(/\.md$/, '');
  const [rawA, rawB] = id.split('-vs-');
  if (!rawA || !rawB) throw new Error(`Cannot split slug into A-vs-B: ${id}`);
  const toolAId = TOOL_ID_OVERRIDES[rawA] ?? rawA;
  const toolBId = TOOL_ID_OVERRIDES[rawB] ?? rawB;

  const titleMatch = raw.match(/^#\s+(.+)$/m);
  if (!titleMatch) throw new Error(`No H1 title in ${id}`);
  const title = titleMatch[1].trim();

  const keywordsMatch = raw.match(/目标关键词[：:]\s*(.+)$/m);
  const seoKeywords = keywordsMatch
    ? keywordsMatch[1].split(/[、,，]/).map((s) => s.trim()).filter(Boolean)
    : [];

  // verdict = 编辑结论后的"一句话："那行（粗体内容）
  const verdictMatch = raw.match(/一句话[：:]\s*\*\*(.+?)\*\*/);
  const verdict = verdictMatch ? verdictMatch[1].trim() : '';

  // summary = 编辑结论第一段（callout 之后、"一句话"之前的第一个非空段落）
  const conclusionIdx = raw.indexOf('## 编辑结论');
  let summary = '';
  if (conclusionIdx >= 0) {
    const tail = raw.slice(conclusionIdx + '## 编辑结论'.length);
    const firstPara = tail.split(/\n\s*\n/).map((s) => s.trim()).find((s) => s && !s.startsWith('#'));
    if (firstPara) summary = firstPara.replace(/\*\*/g, '').slice(0, 280);
  }

  return { id, toolAId, toolBId, title, summary, verdict, body: raw, seoKeywords };
}

async function main() {
  const files = readdirSync(DRAFTS_DIR).filter((f) => f.endsWith('.md'));
  if (files.length === 0) throw new Error('No draft files found');

  const drafts = files.map((f) => parseDraft(f, readFileSync(join(DRAFTS_DIR, f), 'utf8')));

  const sql = neon(process.env.DATABASE_URL!);

  // 1. 先校验工具 ID 都存在
  const allToolIds = Array.from(new Set(drafts.flatMap((d) => [d.toolAId, d.toolBId])));
  const existing = (await sql`SELECT id FROM tools WHERE id = ANY(${allToolIds})`) as { id: string }[];
  const existingSet = new Set(existing.map((r) => r.id));
  const missing = allToolIds.filter((id) => !existingSet.has(id));
  if (missing.length > 0) {
    console.error('❌ 以下工具 ID 在 tools 表中不存在，请先入库或补 TOOL_ID_OVERRIDES：');
    for (const id of missing) console.error('   -', id);
    process.exit(1);
  }
  console.log(`✓ 校验通过：${allToolIds.length} 个工具 ID 全部存在`);

  // 2. 检查 comparisons 表里是否已有同 id（避免重复插入）
  const existingComps = (await sql`SELECT id FROM comparisons WHERE id = ANY(${drafts.map((d) => d.id)})`) as { id: string }[];
  const existingCompSet = new Set(existingComps.map((r) => r.id));

  // 3. 入库
  let inserted = 0;
  let skipped = 0;
  const now = new Date();
  for (const d of drafts) {
    if (existingCompSet.has(d.id)) {
      console.log(`  ⏭  ${d.id} 已存在，跳过`);
      skipped++;
      continue;
    }
    await sql`
      INSERT INTO comparisons
        (id, tool_a_id, tool_b_id, title, summary, body, verdict, seo_keywords, status, is_lab_report, created_at, updated_at)
      VALUES
        (${d.id}, ${d.toolAId}, ${d.toolBId}, ${d.title}, ${d.summary}, ${d.body}, ${d.verdict}, ${d.seoKeywords}, 'draft', false, ${now}, ${now})
    `;
    console.log(`  ✓ ${d.id}  (${d.toolAId} vs ${d.toolBId})`);
    inserted++;
  }
  console.log(`\n完成：插入 ${inserted}，跳过 ${skipped}`);
  console.log(`下一步：访问 https://www.aiboxpro.cn/admin/comparisons 审核并发布`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
