import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { tools, categories, articles } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

const BASE = 'https://toolsbox-six.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ts, cats, arts] = await Promise.all([
    db.select({ id: tools.id }).from(tools),
    db.select({ id: categories.id }).from(categories),
    db.select({ id: articles.id, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(500),
  ]);

  const statics: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/news`,     lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ];

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

  return [...statics, ...toolPages, ...catPages, ...newsPages];
}
