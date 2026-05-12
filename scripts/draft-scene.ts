// 起草场景指南草稿 → scene_drafts 表（status='ai_drafted'）
// 用法：npm run draft:scene <slug>  （如：ai-video-editing）

import { db } from '@/lib/db';
import { sceneDrafts } from '@/lib/db/schema';
import { runDraft } from '@/lib/draft/runner';

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('用法：npm run draft:scene <slug>');
    process.exit(1);
  }

  // 从命令行读取可选的场景描述
  const description = process.argv[3] ?? slug.replace(/-/g, ' ');

  console.log(`起草 scene：${slug}`);

  const inputData = {
    slug,
    description,
    hint: '请根据 slug 和描述起草场景指南',
  };

  await runDraft({
    promptType: 'scene-draft',
    inputData,
    adminPath: '/admin/scenes',
    insertFn: async ({ parsed: draft, rawOutput, promptVersion, llmModel, antiClicheScore }) => {
      const result = await db
        .insert(sceneDrafts)
        .values({
          slug,
          sourceData: inputData,
          aiDraft: draft ?? { rawOutput },
          promptVersion,
          llmModel,
          antiClicheScore,
        })
        .returning({ id: sceneDrafts.id });

      return result[0].id;
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
