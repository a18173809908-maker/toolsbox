/**
 * 一次性批量 approve 脚本（C 方案）
 *
 * 用途：把所有 status='ai_drafted' 的候选直接 publish 到 tools 表，
 * 绕过 admin UI 人工审核。设计用于数据迁移/恢复场景。
 *
 * 不建议作为日常流程使用——日常流程应该走 admin 审核。
 *
 * 运行：npx tsx --env-file=.env.local scripts/bulk-approve-drafted.ts
 */
import { db } from '@/lib/db';
import { toolCandidates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { publishToolCandidate } from '@/lib/db/queries';

type AiDraft = {
  howToUse?: string[];
  faqs?: { q: string; a: string }[];
  registerMethod?: string[];
  needsOverseasPhone?: boolean;
  needsRealName?: boolean;
  overseasPaymentOnly?: boolean;
  priceCny?: string;
  miniProgram?: string;
  appStoreCn?: boolean;
  publicAccount?: string;
  cnAlternatives?: string[];
  tutorialLinks?: { platform: string; url: string; title: string }[];
};

async function main() {
  const candidates = await db
    .select()
    .from(toolCandidates)
    .where(eq(toolCandidates.status, 'ai_drafted'));

  console.log(`找到 ${candidates.length} 条 ai_drafted 候选`);

  let approved = 0;
  let failed = 0;

  for (const c of candidates) {
    if (!c.slug || !c.zh || !c.catId || !c.pricing || !c.chinaAccess) {
      console.warn(`  [SKIP] id=${c.id} name="${c.name}"：必填字段缺失（slug=${c.slug} catId=${c.catId}）`);
      failed++;
      continue;
    }

    const draft = (c.aiDraft as AiDraft | null) ?? {};

    try {
      await publishToolCandidate(c.id, {
        slug: c.slug,
        name: c.name,
        en: c.description ?? c.name,
        zh: c.zh,
        catId: c.catId,
        pricing: c.pricing as 'Free' | 'Freemium' | 'Paid',
        url: c.url,
        chinaAccess: c.chinaAccess as 'accessible' | 'vpn-required' | 'blocked' | 'unknown',
        features: c.features ?? undefined,
        howToUse: draft.howToUse,
        faqs: draft.faqs,
        registerMethod: draft.registerMethod,
        needsOverseasPhone: draft.needsOverseasPhone,
        needsRealName: draft.needsRealName,
        overseasPaymentOnly: draft.overseasPaymentOnly,
        priceCny: draft.priceCny,
        miniProgram: draft.miniProgram,
        appStoreCn: draft.appStoreCn,
        publicAccount: draft.publicAccount,
        cnAlternatives: draft.cnAlternatives,
        tutorialLinks: draft.tutorialLinks,
      });
      approved++;
      if (approved % 5 === 0) console.log(`  已处理 ${approved}/${candidates.length}...`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  [FAIL] id=${c.id} name="${c.name}"：${msg.slice(0, 100)}`);
      failed++;
    }
  }

  console.log(`\n完成：approved=${approved}, failed=${failed}`);
}

main().catch(console.error).finally(() => process.exit(0));
