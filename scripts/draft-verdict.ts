// 起草工具立场字段 → tool_verdicts 表（status='ai_drafted'）
// 用法：npm run draft:verdict <toolId>

import { db } from '@/lib/db';
import { tools, toolVerdicts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { runDraft } from '@/lib/draft/runner';

async function main() {
  const toolId = process.argv[2];
  if (!toolId) {
    console.error('用法：npm run draft:verdict <toolId>');
    process.exit(1);
  }

  const rows = await db.select().from(tools).where(eq(tools.id, toolId)).limit(1);
  const tool = rows[0];
  if (!tool) {
    console.error(`工具不存在：${toolId}`);
    process.exit(1);
  }

  console.log(`起草 verdict：${tool.name} (${toolId})`);

  const inputData = {
    id: tool.id,
    name: tool.name,
    category: tool.catId,
    pricing: tool.pricing,
    priceCny: tool.priceCny ?? null,
    chinaAccess: tool.chinaAccess,
    chineseUi: tool.chineseUi,
    freeQuota: tool.freeQuota ?? null,
    apiAvailable: tool.apiAvailable,
    openSource: tool.openSource,
    features: tool.features ?? [],
    alternatives: tool.alternatives ?? [],
    cnAlternatives: tool.cnAlternatives ?? [],
    needsOverseasPhone: tool.needsOverseasPhone,
    needsRealName: tool.needsRealName,
    overseasPaymentOnly: tool.overseasPaymentOnly,
    en: tool.en,
    zh: tool.zh,
  };

  await runDraft({
    promptType: 'tool-verdict',
    inputData,
    adminPath: '/admin/verdicts',
    insertFn: async ({ rawOutput, parsed, promptVersion, llmModel, antiClicheScore }) => {
      const d = parsed ?? {};
      const verdictOneLiner =
        typeof d.verdictOneLiner === 'string' ? d.verdictOneLiner : rawOutput.slice(0, 60).replace(/\n/g, ' ');
      const whoShouldPick = Array.isArray(d.whoShouldPick) ? (d.whoShouldPick as string[]) : [];
      const whoShouldSkip = Array.isArray(d.whoShouldSkip) ? (d.whoShouldSkip as string[]) : [];
      const vsAlternatives = Array.isArray(d.vsAlternatives)
        ? (d.vsAlternatives as { alt: string; point: string }[])
        : null;
      const positionToday = typeof d.positionToday === 'string' ? d.positionToday : null;
      const caveats = Array.isArray(d.caveats) ? (d.caveats as string[]) : [];
      const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

      const result = await db
        .insert(toolVerdicts)
        .values({
          toolId: tool.id,
          verdictOneLiner,
          whoShouldPick,
          whoShouldSkip,
          vsAlternatives,
          positionToday,
          caveats,
          promptVersion,
          llmModel,
          antiClicheScore,
          expiresAt,
        })
        .returning({ id: toolVerdicts.id });

      return result[0].id;
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
