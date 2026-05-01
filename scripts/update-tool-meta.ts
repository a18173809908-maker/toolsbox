import { config } from 'dotenv';
config({ path: '.env.local' });

import { eq } from 'drizzle-orm';
import { db, tools } from '@/lib/db';
import { TOOL_META } from '@/lib/tool-meta';

async function main() {
  let updated = 0;
  for (const [id, meta] of Object.entries(TOOL_META)) {
    await db.update(tools).set({
      url: meta.url,
      chinaAccess: meta.chinaAccess,
      chineseUi: meta.chineseUi ?? false,
      freeQuota: meta.freeQuota,
      apiAvailable: meta.apiAvailable ?? false,
      openSource: meta.openSource ?? false,
      githubRepo: meta.githubRepo,
      features: meta.features,
      pricingDetail: meta.pricingDetail,
    }).where(eq(tools.id, id));
    updated++;
  }
  console.log(`updated ${updated} tool metadata rows`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
