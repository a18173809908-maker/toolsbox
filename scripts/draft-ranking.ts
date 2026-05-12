// 起草榜单草稿 → ranking_drafts 表（status='ai_drafted'）
// 用法：npm run draft:ranking <slug>  （如：best-ai-video-tools）

import { db } from '@/lib/db';
import { tools, rankingDrafts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { runDraft } from '@/lib/draft/runner';

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('用法：npm run draft:ranking <slug>  （如：best-ai-video-tools）');
    process.exit(1);
  }

  // 从 slug 推断分类（如 best-ai-video-tools → video）
  const catMatch = slug.match(/best-ai-(\w+)/);
  const catId = catMatch ? catMatch[1] : null;

  // 加载候选工具
  let candidateTools: { id: string; name: string; zh: string; pricing: string; chinaAccess: string; catId: string }[] = [];
  if (catId) {
    candidateTools = await db
      .select({
        id: tools.id, name: tools.name, zh: tools.zh,
        pricing: tools.pricing, chinaAccess: tools.chinaAccess, catId: tools.catId,
      })
      .from(tools)
      .where(eq(tools.catId, catId));
  }

  console.log(`起草 ranking：${slug}（候选工具 ${candidateTools.length} 个）`);

  const inputData = { slug, catId, candidateTools };

  await runDraft({
    promptType: 'ranking-draft',
    inputData,
    adminPath: '/admin/rankings',
    insertFn: async ({ parsed: draft, rawOutput, promptVersion, llmModel, antiClicheScore }) => {
      const result = await db
        .insert(rankingDrafts)
        .values({
          slug,
          sourceData: { slug, catId, toolCount: candidateTools.length },
          aiDraft: draft ?? { rawOutput },
          promptVersion,
          llmModel,
          antiClicheScore,
        })
        .returning({ id: rankingDrafts.id });

      return result[0].id;
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
