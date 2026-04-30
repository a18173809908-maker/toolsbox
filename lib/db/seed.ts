import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { categories, tools, githubTrending } from './schema';
import {
  CATEGORIES,
  AI_TOOLS,
  GITHUB_TRENDING,
} from '../data';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('clearing existing rows…');
  await db.delete(githubTrending);
  await db.delete(tools);
  await db.delete(categories);

  console.log(`inserting ${CATEGORIES.length} categories…`);
  await db.insert(categories).values(CATEGORIES);

  console.log(`inserting ${AI_TOOLS.length} tools…`);
  await db.insert(tools).values(
    AI_TOOLS.map((t) => ({
      id: t.id,
      name: t.name,
      mono: t.mono,
      brand: t.brand,
      catId: t.cat,
      en: t.en,
      zh: t.zh,
      pricing: t.pricing,
      featured: t.featured ?? false,
      publishedAt: t.date,
    })),
  );

  const ghRows = (['today', 'week', 'month'] as const).flatMap((period) =>
    GITHUB_TRENDING[period].map((r) => ({
      period,
      repo: r.repo,
      description: r.desc,
      lang: r.lang,
      stars: r.stars,
      gained: r.gained,
    })),
  );
  console.log(`inserting ${ghRows.length} github_trending rows…`);
  await db.insert(githubTrending).values(ghRows);

  console.log('✓ seed done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
