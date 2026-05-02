import { db } from '@/lib/db';
import { categories, tools } from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';

const DOMESTIC_CATEGORIES = [
  { id: 'ai-search', en: 'AI Search Engines', zh: 'AI搜索引擎', icon: '🔎' },
  { id: 'translation', en: 'AI Translation', zh: 'AI翻译', icon: '🌐' },
  { id: 'side-hustle', en: 'AI Side Hustle', zh: 'AI副业/赚钱', icon: '💰' },
  { id: 'digital-human', en: 'Digital Humans', zh: 'AI数字人/主播', icon: '🧑‍💼' },
  { id: 'ppt', en: 'Presentations', zh: 'PPT制作', icon: '📊' },
  { id: 'detection', en: 'AI Detection', zh: '内容检测/查重', icon: '🛡️' },
  { id: 'ai-learn', en: 'Learn AI', zh: '学习AI技术', icon: '🧭' },
];

const TOOL_CATEGORY_PATCHES: Record<string, string> = {
  metaso: 'ai-search',
  perplexity: 'ai-search',
  gamma: 'ppt',
  'how-to-create-an-ai-offer-and-sell-it-for-10-000': 'side-hustle',
  'ai-fundamentals-everything-you-need-to-know-abou': 'ai-learn',
  'top-39-artificial-intelligence-app-ideas-startup': 'ai-learn',
  'what-is-enterprise-artificial-intelligence-compl': 'ai-learn',
};

(async () => {
  for (const cat of DOMESTIC_CATEGORIES) {
    await db
      .insert(categories)
      .values({ ...cat, count: 0 })
      .onConflictDoUpdate({
        target: categories.id,
        set: { en: cat.en, zh: cat.zh, icon: cat.icon },
      });
    console.log(`Upserted category ${cat.id}`);
  }

  for (const [toolId, catId] of Object.entries(TOOL_CATEGORY_PATCHES)) {
    const result = await db.update(tools).set({ catId }).where(eq(tools.id, toolId));
    if (result.rowCount && result.rowCount > 0) {
      console.log(`Moved ${toolId} -> ${catId}`);
    }
  }

  const allCategories = await db.select({ id: categories.id }).from(categories);
  for (const cat of allCategories) {
    const total = await db.select({ value: count() }).from(tools).where(eq(tools.catId, cat.id));
    await db.update(categories).set({ count: total[0]?.value ?? 0 }).where(eq(categories.id, cat.id));
  }

  console.log(`Done. Categories available: ${allCategories.length}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
