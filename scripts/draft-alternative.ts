// 起草替代品专题草稿 → alternative_drafts 表（status='ai_drafted'）
// 用法：npm run draft:alternative <targetToolId>  （如：runway）

import { db } from '@/lib/db';
import { tools, alternativeDrafts } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { runDraft } from '@/lib/draft/runner';

async function main() {
  const targetId = process.argv[2];
  if (!targetId) {
    console.error('用法：npm run draft:alternative <targetToolId>');
    process.exit(1);
  }

  const rows = await db.select().from(tools).where(eq(tools.id, targetId)).limit(1);
  const targetTool = rows[0];
  if (!targetTool) {
    console.error(`工具不存在：${targetId}`);
    process.exit(1);
  }

  // 加载工具本身的 alternatives 字段列出的替代品
  const altIds = [...(targetTool.alternatives ?? []), ...(targetTool.cnAlternatives ?? [])].filter(Boolean);
  const altTools = altIds.length > 0
    ? await db
      .select({
        id: tools.id, name: tools.name, zh: tools.zh,
        pricing: tools.pricing, priceCny: tools.priceCny,
        chinaAccess: tools.chinaAccess, chineseUi: tools.chineseUi,
        features: tools.features, freeQuota: tools.freeQuota,
      })
      .from(tools)
      .where(inArray(tools.id, altIds))
    : [];

  const slug = `${targetId}-alternatives`;
  console.log(`起草 alternatives：${targetTool.name} 替代品专题（候选 ${altTools.length} 个）`);

  const inputData = {
    targetTool: {
      id: targetTool.id, name: targetTool.name, zh: targetTool.zh,
      pricing: targetTool.pricing, chinaAccess: targetTool.chinaAccess,
      features: targetTool.features,
    },
    alternatives: altTools,
  };

  await runDraft({
    promptType: 'alternative-draft',
    inputData,
    adminPath: '/admin/alternatives',
    insertFn: async ({ parsed: draft, rawOutput, promptVersion, llmModel, antiClicheScore }) => {
      const result = await db
        .insert(alternativeDrafts)
        .values({
          slug,
          sourceData: { targetToolId: targetId, altToolIds: altIds },
          aiDraft: draft ?? { rawOutput },
          promptVersion,
          llmModel,
          antiClicheScore,
        })
        .returning({ id: alternativeDrafts.id });

      return result[0].id;
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
