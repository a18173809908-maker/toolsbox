import { db } from '@/lib/db';
import { githubTrending } from '@/lib/db/schema';
import { fetchTrending } from './github-trending';
import type { TrendingPeriod } from '@/lib/data';
import { sql } from 'drizzle-orm';

export type RefreshResult = {
  period: TrendingPeriod;
  upserted: number;
  error?: string;
}[];

export async function refreshAllTrending(): Promise<RefreshResult> {
  const periods: TrendingPeriod[] = ['today', 'week', 'month'];
  const results: RefreshResult = [];

  for (const period of periods) {
    try {
      const repos = await fetchTrending(period);
      if (repos.length === 0) {
        results.push({ period, upserted: 0, error: 'empty result' });
        continue;
      }

      // Upsert: update volatile fields only, preserve descriptionZh + aiInsights
      await db
        .insert(githubTrending)
        .values(repos.map((r) => ({
          period,
          repo: r.repo,
          description: r.description,
          lang: r.lang,
          stars: r.stars,
          gained: r.gained,
          snapshotDate: new Date(),
        })))
        .onConflictDoUpdate({
          target: [githubTrending.period, githubTrending.repo],
          set: {
            description: sql`excluded.description`,
            lang: sql`excluded.lang`,
            stars: sql`excluded.stars`,
            gained: sql`excluded.gained`,
            snapshotDate: sql`excluded.snapshot_date`,
            // descriptionZh and aiInsights intentionally NOT overwritten
          },
        });

      results.push({ period, upserted: repos.length });
    } catch (e) {
      results.push({ period, upserted: 0, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return results;
}
