import type { MetadataRoute } from 'next';
import { alternativeTopics } from '@/lib/alternatives';
import { scenes } from '@/lib/scenes';
import { rankings } from '@/lib/rankings';

const BASE = 'https://www.aiboxpro.cn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: new Date(), changeFrequency: 'hourly',  priority: 1   },
    { url: `${BASE}/tools`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/compare`,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/alternatives`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/trending`,      lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/news`,          lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/submit-guide`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/disclaimer`,    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/scenes`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/best`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/events`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
  ];
  const staticScenePages: MetadataRoute.Sitemap = scenes.map((s) => ({
    url: `${BASE}/scenes/${s.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  const staticRankingPages: MetadataRoute.Sitemap = rankings.map((r) => ({
    url: `${BASE}/best/${r.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  const staticAlternativePages: MetadataRoute.Sitemap = alternativeTopics.map((topic) => ({
    url: `${BASE}/alternatives/${topic.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  if (!process.env.DATABASE_URL) {
    return [...statics, ...staticScenePages, ...staticRankingPages, ...staticAlternativePages];
  }

  const [{ db }, schemaModule, drizzleModule] = await Promise.all([
    import('@/lib/db'),
    import('@/lib/db/schema'),
    import('drizzle-orm'),
  ]);

  const { tools, categories, articles, githubTrending, comparisons, events } = schemaModule;
  const { eq, desc, asc } = drizzleModule;

  const [ts, cats, arts, repos, comps, evs] = await Promise.all([
    db.select({ id: tools.id }).from(tools),
    db.select({ id: categories.id }).from(categories),
    db.select({ id: articles.id, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(500),
    db.selectDistinct({ repo: githubTrending.repo })
      .from(githubTrending)
      .orderBy(asc(githubTrending.repo))
      .limit(200),
    db.select({ id: comparisons.id, updatedAt: comparisons.updatedAt })
      .from(comparisons)
      .where(eq(comparisons.status, 'published'))
      .orderBy(desc(comparisons.publishedAt))
      .limit(500),
    db.select({ slug: events.slug, updatedAt: events.updatedAt })
      .from(events)
      .where(eq(events.status, 'published'))
      .orderBy(desc(events.publishedAt))
      .limit(200),
  ]);

  const toolPages: MetadataRoute.Sitemap = ts.map((t) => ({
    url: `${BASE}/tools/${t.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const catPages: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${BASE}/categories/${c.id}`,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  const newsPages: MetadataRoute.Sitemap = arts.map((a) => ({
    url: `${BASE}/news/${a.id}`,
    lastModified: a.publishedAt ?? new Date(),
    changeFrequency: 'never' as const,
    priority: 0.5,
  }));

  const repoPages: MetadataRoute.Sitemap = repos.map((r) => ({
    url: `${BASE}/trending/${r.repo}`,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  const comparePages: MetadataRoute.Sitemap = comps.map((c) => ({
    url: `${BASE}/compare/${c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const eventPages: MetadataRoute.Sitemap = evs.map((e) => ({
    url: `${BASE}/events/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...statics, ...staticScenePages, ...staticRankingPages, ...toolPages, ...catPages, ...newsPages, ...repoPages, ...comparePages, ...staticAlternativePages, ...eventPages];
}
