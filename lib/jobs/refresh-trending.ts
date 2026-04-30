import { db } from '@/lib/db';
import { githubTrending } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fetchTrending } from './github-trending';
import type { TrendingPeriod } from '@/lib/data';

export type RefreshResult = {
  period: TrendingPeriod;
  inserted: number;
  error?: string;
}[];

export async function refreshAllTrending(): Promise<RefreshResult> {
  const periods: TrendingPeriod[] = ['today', 'week', 'month'];
  const results: RefreshResult = [];

  for (const period of periods) {
    try {
      const repos = await fetchTrending(period);
      if (repos.length === 0) {
        results.push({ period, inserted: 0, error: 'empty result' });
        continue;
      }
      await db.delete(githubTrending).where(eq(githubTrending.period, period));
      await db.insert(githubTrending).values(
        repos.map((r) => ({
          period,
          repo: r.repo,
          description: r.description,
          lang: r.lang,
          stars: r.stars,
          gained: r.gained,
        })),
      );
      results.push({ period, inserted: repos.length });
    } catch (e) {
      results.push({ period, inserted: 0, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return results;
}
