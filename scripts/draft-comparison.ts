// 起草对比页草稿 → comparison_drafts 表（status='ai_drafted'）
// 用法：npm run draft:comparison <slug>
//   slug 格式：cursor-vs-windsurf（-vs- 分隔 toolId）
//   也接受两个独立参数：npm run draft:comparison cursor windsurf

import { db } from '@/lib/db';
import { tools, comparisonDrafts } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { runDraft } from '@/lib/draft/runner';

function parseArgs(): { slug: string; toolAId: string; toolBId: string } | null {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (args.length === 1) {
    // slug 格式：cursor-vs-windsurf
    const parts = args[0].split('-vs-');
    if (parts.length !== 2) return null;
    return { slug: args[0], toolAId: parts[0], toolBId: parts[1] };
  }
  if (args.length === 2) {
    return { slug: `${args[0]}-vs-${args[1]}`, toolAId: args[0], toolBId: args[1] };
  }
  return null;
}

async function main() {
  const parsed = parseArgs();
  if (!parsed) {
    console.error('用法：npm run draft:comparison <slug>  （如：cursor-vs-windsurf）');
    process.exit(1);
  }
  const { slug, toolAId, toolBId } = parsed;

  const rows = await db
    .select({
      id: tools.id, name: tools.name, zh: tools.zh, pricing: tools.pricing,
      priceCny: tools.priceCny, chinaAccess: tools.chinaAccess, chineseUi: tools.chineseUi,
      freeQuota: tools.freeQuota, features: tools.features, catId: tools.catId,
      needsOverseasPhone: tools.needsOverseasPhone, overseasPaymentOnly: tools.overseasPaymentOnly,
    })
    .from(tools)
    .where(inArray(tools.id, [toolAId, toolBId]));

  const byId = new Map(rows.map((r) => [r.id, r]));
  const toolA = byId.get(toolAId);
  const toolB = byId.get(toolBId);

  if (!toolA || !toolB) {
    const missing = [!toolA && toolAId, !toolB && toolBId].filter(Boolean);
    console.error(`工具不存在：${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`起草 comparison：${toolA.name} vs ${toolB.name} (${slug})`);

  const inputData = { slug, toolA, toolB };

  await runDraft({
    promptType: 'comparison-draft',
    inputData,
    adminPath: '/admin/comparisons',
    insertFn: async ({ parsed: draft, rawOutput, promptVersion, llmModel, antiClicheScore }) => {
      const result = await db
        .insert(comparisonDrafts)
        .values({
          slug,
          sourceData: { toolAId, toolBId },
          aiDraft: draft ?? { rawOutput },
          promptVersion,
          llmModel,
          antiClicheScore,
        })
        .returning({ id: comparisonDrafts.id });

      return result[0].id;
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
