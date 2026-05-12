/**
 * 批量起草工具立场字段
 * 用法：npm run batch:draft-verdicts
 *
 * 在每次调用之间等待 2s 避免 rate limit。
 * 已有 published/ai_drafted verdict 的工具会被跳过（runner 会报错但脚本继续）。
 */

import { runDraft } from '@/lib/draft/runner';
import { db } from '@/lib/db';
import { tools, toolVerdicts } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

// ── 目标工具 ─────────────────────────────────────────────────────────────────
// 12 个视频工具
const VIDEO_TOOLS = [
  'runway',
  'sora',
  'pika',
  'luma-dream-machine',
  'jimeng-ai',
  'kling-ai',
  'hailuo-ai',
  'vidu-ai',
  'descript',
  'higgsfield-ai',
  'seedance',
  'topview',
];

// 7 个编程工具（当前入库）
const CODE_TOOLS = [
  'cursor',
  'cline',
  'v0',
  'kilo-code',
  'opencode',
  'inscode',
  'coding-plan',
];

const TARGET_IDS = [...VIDEO_TOOLS, ...CODE_TOOLS];

// ── 辅助 ──────────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  // 查出已有 ai_drafted 或 published verdict 的工具，跳过
  const existing = await db
    .select({ toolId: toolVerdicts.toolId })
    .from(toolVerdicts)
    .where(inArray(toolVerdicts.toolId, TARGET_IDS));
  const doneSet = new Set(existing.map((r) => r.toolId));

  const todo = TARGET_IDS.filter((id) => !doneSet.has(id));
  const skipped = TARGET_IDS.filter((id) => doneSet.has(id));

  if (skipped.length) {
    console.log(`⏭  跳过（已有草稿/立场）: ${skipped.join(', ')}\n`);
  }
  console.log(`🚀 将为 ${todo.length} 个工具起草立场...\n`);

  const results: { id: string; ok: boolean; score?: number; error?: string }[] = [];

  for (const toolId of todo) {
    console.log(`\n──────────────────────────────────────────────`);
    console.log(`工具: ${toolId}`);

    try {
      // 加载工具数据
      const rows = await db.select().from(tools).where(eq(tools.id, toolId));
      if (!rows.length) {
        console.warn(`  ⚠ 工具 "${toolId}" 不存在，跳过`);
        results.push({ id: toolId, ok: false, error: 'not found in DB' });
        continue;
      }
      const tool = rows[0];

      // 构造输入
      const inputData = {
        id: tool.id,
        name: tool.name,
        catId: tool.catId,
        en: tool.en,
        zh: tool.zh,
        pricing: tool.pricing,
        pricingDetail: tool.pricingDetail,
        priceCny: tool.priceCny,
        chinaAccess: tool.chinaAccess,
        chineseUi: tool.chineseUi,
        freeQuota: tool.freeQuota,
        apiAvailable: tool.apiAvailable,
        openSource: tool.openSource,
        features: tool.features,
        registerMethod: tool.registerMethod,
        needsOverseasPhone: tool.needsOverseasPhone,
        overseasPaymentOnly: tool.overseasPaymentOnly,
        cnAlternatives: tool.cnAlternatives,
      };

      const result = await runDraft({
        promptType: 'tool-verdict',
        inputData,
        adminPath: '/admin/verdicts',
        insertFn: async ({ parsed, rawOutput, promptVersion, llmModel, antiClicheScore }) => {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 180);

          const row = await db
            .insert(toolVerdicts)
            .values({
              toolId: tool.id,
              verdictOneLiner: String(parsed?.verdictOneLiner ?? rawOutput.slice(0, 80)),
              whoShouldPick: Array.isArray(parsed?.whoShouldPick) ? parsed.whoShouldPick : [],
              whoShouldSkip: Array.isArray(parsed?.whoShouldSkip) ? parsed.whoShouldSkip : [],
              vsAlternatives: Array.isArray(parsed?.vsAlternatives) ? parsed.vsAlternatives : [],
              positionToday: parsed?.positionToday ?? null,
              caveats: Array.isArray(parsed?.caveats) ? parsed.caveats : [],
              promptVersion,
              llmModel,
              antiClicheScore,
              expiresAt,
            })
            .returning({ id: toolVerdicts.id });

          return row[0].id;
        },
      });

      results.push({ id: toolId, ok: true, score: result.antiClicheScore ?? undefined });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ 失败: ${msg}`);
      results.push({ id: toolId, ok: false, error: msg.slice(0, 100) });
    }

    await sleep(2000);
  }

  // 汇总
  console.log('\n\n══════════════════════════════════════════════');
  console.log('批量起草完成\n');
  const ok = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);
  console.log(`✓ 成功: ${ok.length}  ✗ 失败: ${fail.length}`);
  if (fail.length) {
    console.log('\n失败列表:');
    for (const f of fail) console.log(`  ${f.id}: ${f.error}`);
  }
  console.log('\n→ 前往 /admin/verdicts 审核');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
