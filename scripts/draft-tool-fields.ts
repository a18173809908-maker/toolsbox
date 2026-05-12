// 起草工具字段补全候选 → tool_field_drafts 表（status='ai_drafted'）
// 用法：npm run draft:tool-fields <toolId>

import { db } from '@/lib/db';
import { tools, toolFieldDrafts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { runDraft } from '@/lib/draft/runner';

async function main() {
  const toolId = process.argv[2];
  if (!toolId) {
    console.error('用法：npm run draft:tool-fields <toolId>');
    process.exit(1);
  }

  const rows = await db.select().from(tools).where(eq(tools.id, toolId)).limit(1);
  const tool = rows[0];
  if (!tool) {
    console.error(`工具不存在：${toolId}`);
    process.exit(1);
  }

  // 找出值为 null/undefined 的字段
  const missingFields = Object.entries({
    priceCny: tool.priceCny,
    chinaAccess: tool.chinaAccess === 'unknown' ? null : tool.chinaAccess,
    chineseUi: null, // always worth re-checking
    freeQuota: tool.freeQuota,
    needsOverseasPhone: null,
    needsRealName: null,
    overseasPaymentOnly: null,
    miniProgram: tool.miniProgram,
    appStoreCn: null,
    features: (tool.features?.length ?? 0) === 0 ? null : 'ok',
    registerMethod: (tool.registerMethod?.length ?? 0) === 0 ? null : 'ok',
  })
    .filter(([, v]) => v === null)
    .map(([k]) => k);

  console.log(`起草 tool-fields：${tool.name} (${toolId})`);
  if (missingFields.length > 0) {
    console.log(`  缺失/待核实字段：${missingFields.join(', ')}`);
  }

  const inputData = {
    id: tool.id,
    name: tool.name,
    url: tool.url,
    category: tool.catId,
    pricing: tool.pricing,
    currentValues: {
      priceCny: tool.priceCny,
      chinaAccess: tool.chinaAccess,
      chineseUi: tool.chineseUi,
      freeQuota: tool.freeQuota,
      needsOverseasPhone: tool.needsOverseasPhone,
      needsRealName: tool.needsRealName,
      overseasPaymentOnly: tool.overseasPaymentOnly,
      miniProgram: tool.miniProgram,
      appStoreCn: tool.appStoreCn,
      features: tool.features,
      registerMethod: tool.registerMethod,
    },
    missingFields,
  };

  await runDraft({
    promptType: 'tool-field-draft',
    inputData,
    adminPath: '/admin/tool-fields',
    insertFn: async ({ parsed: draft, rawOutput, promptVersion, llmModel, antiClicheScore }) => {
      const result = await db
        .insert(toolFieldDrafts)
        .values({
          slug: toolId,
          sourceData: { toolId, missingFields },
          aiDraft: draft ?? { rawOutput },
          promptVersion,
          llmModel,
          antiClicheScore,
        })
        .returning({ id: toolFieldDrafts.id });

      return result[0].id;
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
