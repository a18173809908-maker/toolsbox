import { db } from './index';
import { categories, tools, githubTrending, articles, sources } from './schema';
import { desc, asc, eq, ilike, or } from 'drizzle-orm';
import type { TrendingPeriod, Tool, Category, RepoItem, HomepageStats, NewsItem } from '@/lib/data';

// ── Homepage ─────────────────────────────────────────────────────────────────

export async function loadHomepageData(): Promise<{
  categories: Category[];
  tools: Tool[];
  trending: Record<TrendingPeriod, RepoItem[]>;
  stats: HomepageStats;
  news: NewsItem[];
}> {
  const [cats, ts, gh, arts] = await Promise.all([
    db.select().from(categories).orderBy(desc(categories.count)),
    db.select().from(tools).orderBy(desc(tools.publishedAt)),
    db.select().from(githubTrending).orderBy(asc(githubTrending.period), desc(githubTrending.gained)),
    db.select({ id: articles.id, title: articles.title, titleZh: articles.titleZh, url: articles.url, tag: articles.tag, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(6),
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

  const uniqueRepos = new Set(gh.map((r) => r.repo));
  const todayRows = gh.filter((r) => r.period === 'today');
  const latestSnapshot = gh.reduce<Date | null>((latest, r) => {
    if (!latest || r.snapshotDate > latest) return r.snapshotDate;
    return latest;
  }, null);

  const stats: HomepageStats = {
    toolsTotal: tools2.length,
    featuredTools: tools2.filter((t) => t.featured).length,
    categoriesTotal: cs.length,
    reposTracked: uniqueRepos.size,
    todayRepos: todayRows.length,
    todayStarsGained: todayRows.reduce((sum, r) => sum + r.gained, 0),
    lastUpdatedAt: latestSnapshot?.toISOString(),
  };

  const news: NewsItem[] = arts.map((a) => ({
    id: a.id,
    title: a.title,
    titleZh: a.titleZh ?? undefined,
    url: a.url,
    tag: a.tag ?? undefined,
    publishedAt: a.publishedAt?.toISOString() ?? undefined,
  }));

  return { categories: cs, tools: tools2, trending, stats, news };
}

// ── Tool detail ───────────────────────────────────────────────────────────────

export async function loadToolById(id: string): Promise<(Tool & { catEn: string; catZh: string; catIcon: string }) | null> {
  const rows = await db
    .select({
      id: tools.id, name: tools.name, mono: tools.mono, brand: tools.brand,
      catId: tools.catId, en: tools.en, zh: tools.zh,
      pricing: tools.pricing, featured: tools.featured, publishedAt: tools.publishedAt,
      catEn: categories.en, catZh: categories.zh, catIcon: categories.icon,
    })
    .from(tools)
    .innerJoin(categories, eq(tools.catId, categories.id))
    .where(eq(tools.id, id));

  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id, name: row.name, mono: row.mono, brand: row.brand,
    cat: row.catId, en: row.en, zh: row.zh,
    pricing: row.pricing as Tool['pricing'],
    featured: row.featured, date: row.publishedAt,
    catEn: row.catEn, catZh: row.catZh, catIcon: row.catIcon,
  };
}

export async function loadAllToolIds(): Promise<string[]> {
  const rows = await db.select({ id: tools.id }).from(tools);
  return rows.map((r) => r.id);
}

// ── Articles ──────────────────────────────────────────────────────────────────

export async function loadSources() {
  return db.select().from(sources).where(eq(sources.active, true));
}

export async function upsertArticles(items: {
  sourceId: number;
  title: string;
  url: string;
  tag?: string;
  publishedAt?: Date;
}[]): Promise<number> {
  if (items.length === 0) return 0;
  let inserted = 0;
  for (const item of items) {
    const result = await db.insert(articles).values({
      sourceId: item.sourceId,
      title: item.title,
      url: item.url,
      tag: item.tag,
      publishedAt: item.publishedAt,
    }).onConflictDoNothing();
    if (result.rowCount && result.rowCount > 0) inserted++;
  }
  return inserted;
}

export async function loadPendingArticles(limit = 20) {
  return db.select().from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function loadArticlesPage(page = 1, pageSize = 30, tag?: string) {
  const offset = (page - 1) * pageSize;
  const base = db
    .select({
      id: articles.id,
      title: articles.title,
      titleZh: articles.titleZh,
      url: articles.url,
      summary: articles.summary,
      summaryZh: articles.summaryZh,
      tag: articles.tag,
      publishedAt: articles.publishedAt,
      sourceName: sources.name,
    })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedAt));

  // Tag filter applied after the fact (drizzle dynamic where)
  const rows = await base.limit(pageSize).offset(offset);
  const filtered = tag ? rows.filter((r) => r.tag === tag) : rows;
  return filtered;
}

export async function loadArticleTags(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ tag: articles.tag })
    .from(articles)
    .where(eq(articles.status, 'published'));
  return rows.map((r) => r.tag).filter((t): t is string => Boolean(t)).sort();
}

// ── GitHub Trending ───────────────────────────────────────────────────────────

export async function loadRepoDetail(repo: string) {
  const rows = await db
    .select()
    .from(githubTrending)
    .where(eq(githubTrending.repo, repo))
    .orderBy(asc(githubTrending.period));
  return rows;
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchTools(q: string, limit = 20) {
  const pattern = `%${q}%`;
  return db
    .select({
      id: tools.id, name: tools.name, mono: tools.mono, brand: tools.brand,
      en: tools.en, zh: tools.zh, pricing: tools.pricing, catId: tools.catId,
    })
    .from(tools)
    .where(or(ilike(tools.name, pattern), ilike(tools.en, pattern), ilike(tools.zh, pattern)))
    .limit(limit);
}

export async function searchArticles(q: string, limit = 10) {
  const pattern = `%${q}%`;
  return db
    .select({
      id: articles.id, title: articles.title, titleZh: articles.titleZh,
      url: articles.url, tag: articles.tag, publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(
      or(ilike(articles.title, pattern), ilike(articles.titleZh, pattern))
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function loadArticleById(id: number) {
  const rows = await db
    .select({
      id: articles.id, title: articles.title, titleZh: articles.titleZh,
      url: articles.url, summary: articles.summary, summaryZh: articles.summaryZh,
      tag: articles.tag, publishedAt: articles.publishedAt,
      sourceName: sources.name, sourceUrl: sources.url,
    })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(eq(articles.id, id));
  return rows[0] ?? null;
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function loadAllCategoryIds(): Promise<string[]> {
  const rows = await db.select({ id: categories.id }).from(categories);
  return rows.map((r) => r.id);
}

export async function loadCategoryById(id: string) {
  const rows = await db.select().from(categories).where(eq(categories.id, id));
  return rows[0] ?? null;
}

export async function loadToolsByCategory(catId: string) {
  return db
    .select()
    .from(tools)
    .where(eq(tools.catId, catId))
    .orderBy(desc(tools.publishedAt));
}

export async function updateArticleAi(id: number, data: {
  titleZh?: string;
  summary?: string;
  summaryZh?: string;
  tag?: string;
}) {
  await db.update(articles).set(data).where(eq(articles.id, id));
}
