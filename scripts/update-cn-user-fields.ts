import { db } from '@/lib/db';
import { tools } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type Patch = Partial<typeof tools.$inferInsert>;

const COMMON_CN: Patch = {
  registerMethod: ['手机号', '微信扫码'],
  needsOverseasPhone: false,
  needsRealName: false,
  overseasPaymentOnly: false,
  appStoreCn: true,
};

const PATCHES: Record<string, Patch> = {
  chatgpt: {
    registerMethod: ['邮箱', 'Google/Microsoft/Apple'],
    needsOverseasPhone: false,
    overseasPaymentOnly: true,
    priceCny: 'Plus 约 ¥145/月，需海外支付方式',
    appStoreCn: false,
    cnAlternatives: ['doubao', 'kimi', 'deepseek'],
  },
  claude: {
    registerMethod: ['邮箱', 'Google'],
    needsOverseasPhone: false,
    overseasPaymentOnly: true,
    priceCny: 'Pro 约 ¥145/月，需海外支付方式',
    appStoreCn: false,
    cnAlternatives: ['kimi', 'doubao', 'deepseek'],
  },
  midjourney: {
    registerMethod: ['Discord', 'Google'],
    needsOverseasPhone: false,
    overseasPaymentOnly: true,
    priceCny: '约 ¥70/月起，需海外支付方式',
    appStoreCn: false,
    cnAlternatives: ['jimeng', 'tongyi-wanxiang'],
  },
  doubao: {
    ...COMMON_CN,
    priceCny: '基础功能免费，部分高级能力按额度计费',
    miniProgram: '豆包',
    publicAccount: '豆包',
    tutorialLinks: [
      { platform: 'B站', url: 'https://search.bilibili.com/all?keyword=%E8%B1%86%E5%8C%85%20AI%20%E6%95%99%E7%A8%8B', title: '豆包 AI 教程搜索' },
    ],
  },
  kimi: {
    ...COMMON_CN,
    registerMethod: ['手机号'],
    priceCny: '基础功能免费，高级模型和更大用量按量计费',
    publicAccount: 'Kimi智能助手',
    tutorialLinks: [
      { platform: 'B站', url: 'https://search.bilibili.com/all?keyword=Kimi%20AI%20%E6%95%99%E7%A8%8B', title: 'Kimi 使用教程搜索' },
    ],
  },
  deepseek: {
    ...COMMON_CN,
    registerMethod: ['手机号', '邮箱'],
    priceCny: '网页端免费，API 按 token 计费',
    appStoreCn: true,
    publicAccount: 'DeepSeek',
    tutorialLinks: [
      { platform: 'B站', url: 'https://search.bilibili.com/all?keyword=DeepSeek%20%E6%95%99%E7%A8%8B', title: 'DeepSeek 教程搜索' },
    ],
  },
};

(async () => {
  let updated = 0;
  for (const [id, patch] of Object.entries(PATCHES)) {
    const result = await db.update(tools).set(patch).where(eq(tools.id, id));
    if (result.rowCount && result.rowCount > 0) {
      updated += result.rowCount;
      console.log(`Updated ${id}`);
    }
  }

  console.log(`Done. Updated ${updated} tools.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
