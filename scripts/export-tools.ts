import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '@/lib/db';
import { tools, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  console.log('Fetching tools from database...');
  const toolRows = await db.select().from(tools).orderBy(tools.publishedAt);
  console.log(`Found ${toolRows.length} tools in database`);

  console.log('Fetching categories from database...');
  const catRows = await db.select().from(categories);

  const toolsExport = toolRows.map(t => ({
    id: t.id,
    name: t.name,
    mono: t.mono,
    brand: t.brand,
    cat: t.catId,
    en: t.en,
    zh: t.zh,
    date: t.publishedAt,
    featured: t.featured,
    pricing: t.pricing,
    url: t.url ?? undefined,
    chinaAccess: t.chinaAccess,
    chineseUi: t.chineseUi,
    freeQuota: t.freeQuota ?? undefined,
    apiAvailable: t.apiAvailable,
    openSource: t.openSource,
    githubRepo: t.githubRepo ?? undefined,
    features: t.features ?? undefined,
    pricingDetail: t.pricingDetail ?? undefined,
    alternatives: t.alternatives ?? undefined,
    registerMethod: t.registerMethod ?? undefined,
    needsOverseasPhone: t.needsOverseasPhone,
    needsRealName: t.needsRealName,
    overseasPaymentOnly: t.overseasPaymentOnly,
    priceCny: t.priceCny ?? undefined,
    miniProgram: t.miniProgram ?? undefined,
    appStoreCn: t.appStoreCn,
    publicAccount: t.publicAccount ?? undefined,
    cnAlternatives: t.cnAlternatives ?? undefined,
    tutorialLinks: t.tutorialLinks ?? undefined,
    pricingUpdatedAt: t.pricingUpdatedAt?.toISOString(),
    accessUpdatedAt: t.accessUpdatedAt?.toISOString(),
    featuresUpdatedAt: t.featuresUpdatedAt?.toISOString(),
    complianceUpdatedAt: t.complianceUpdatedAt?.toISOString(),
    upvotes: t.upvotes,
    downvotes: t.downvotes,
    howToUse: t.howToUse ?? undefined,
    faqs: t.faqs ?? undefined,
  }));

  const categoriesExport = catRows.map(c => ({
    id: c.id,
    en: c.en,
    zh: c.zh,
    icon: c.icon,
    count: c.count,
  }));

  const output = `// Auto-generated from database export\n// ${toolRows.length} tools, ${catRows.length} categories\n\nimport type { Category, Tool } from './data';\n\nexport const EXPORTED_CATEGORIES: Category[] = ${JSON.stringify(categoriesExport, null, 2)};\n\nexport const EXPORTED_TOOLS: Tool[] = ${JSON.stringify(toolsExport, null, 2)};\n`;

  fs.writeFileSync('lib/data-exported.ts', output);
  console.log('✓ Exported to lib/data-exported.ts');

  console.log('\nTool count by category:');
  const countByCat = new Map<string, number>();
  for (const t of toolRows) {
    countByCat.set(t.catId, (countByCat.get(t.catId) ?? 0) + 1);
  }
  for (const [catId, count] of countByCat) {
    const cat = catRows.find(c => c.id === catId);
    console.log(`  ${cat?.zh || catId}: ${count}`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});