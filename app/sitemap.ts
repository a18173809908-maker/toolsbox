import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { tools, categories } from '@/lib/db/schema';

const BASE = 'https://toolsbox-six.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ts, cats] = await Promise.all([
    db.select({ id: tools.id }).from(tools),
    db.select({ id: categories.id }).from(categories),
  ]);

  const statics: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/trending`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/news`,     lastModified: new Date(), changeFrequency: 'daily',  priority: 0.8 },
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

  return [...statics, ...toolPages, ...catPages];
}
