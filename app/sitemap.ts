import type { MetadataRoute } from 'next';

const BASE = 'https://www.aiboxpro.cn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: 'hourly', priority: 1   },
    { url: `${BASE}/tools`,    lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${BASE}/trending`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/news`,     lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ];

  if (!process.env.DATABASE_URL) {
    return statics;
  }

  const [{ db }, schemaModule, drizzleModule] = await Promise.all([
    import('@/lib/db'),
    import('@/lib/db/schema'),
    import('drizzle-orm'),
  ]);

  const { tools, categories, articles, githubTrending } = schemaModule;
  const { eq, desc, asc } = drizzleModule;

  const [ts, cats, arts, repos] = await Promise.all([
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

  return [...statics, ...toolPages, ...catPages, ...newsPages, ...repoPages];
}
