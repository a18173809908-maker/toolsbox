import { db } from './index';
import { categories, tools, githubTrending } from './schema';
import { desc, asc, eq } from 'drizzle-orm';
import type { TrendingPeriod, Tool, Category, RepoItem } from '@/lib/data';

export async function loadHomepageData(): Promise<{
  categories: Category[];
  tools: Tool[];
  trending: Record<TrendingPeriod, RepoItem[]>;
}> {
  const [cats, ts, gh] = await Promise.all([
    db.select().from(categories).orderBy(desc(categories.count)),
    db.select().from(tools).orderBy(desc(tools.publishedAt)),
    db.select().from(githubTrending).orderBy(asc(githubTrending.period), desc(githubTrending.gained)),
  ]);

  const cs: Category[] = cats.map((c) => ({
    id: c.id, en: c.en, zh: c.zh, icon: c.icon, count: c.count,
  }));

  const tools2: Tool[] = ts.map((t) => ({
    id: t.id, name: t.name, mono: t.mono, brand: t.brand,
    cat: t.catId,
    en: t.en, zh: t.zh,
    pricing: t.pricing as Tool['pricing'],
    featured: t.featured,
    date: t.publishedAt,
  }));

  const trending: Record<TrendingPeriod, RepoItem[]> = { today: [], week: [], month: [] };
  for (const r of gh) {
    const p = r.period as TrendingPeriod;
    if (!trending[p]) continue;
    trending[p].push({
      repo: r.repo, desc: r.description, descZh: r.descriptionZh ?? undefined,
      lang: r.lang, stars: r.stars, gained: r.gained,
    });
  }

  return { categories: cs, tools: tools2, trending };
}
