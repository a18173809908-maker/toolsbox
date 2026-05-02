import { db } from './index';
import { categories, tools, githubTrending, articles, sources, toolCandidates } from './schema';
import { desc, asc, eq, ilike, or, isNull, count, max, and } from 'drizzle-orm';
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
    db.select().from(categories),
    db.select().from(tools).orderBy(desc(tools.publishedAt)),
    db.select().from(githubTrending).orderBy(asc(githubTrending.period), desc(githubTrending.gained)),
    db.select({ id: articles.id, title: articles.title, titleZh: articles.titleZh, url: articles.url, tag: articles.tag, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(6),
  ]);

  const tools2: Tool[] = ts.map((t) => ({
    id: t.id, name: t.name, mono: t.mono, brand: t.brand,
    cat: t.catId,
    en: t.en, zh: t.zh,
    pricing: t.pricing as Tool['pricing'],
    url: t.url ?? undefined,
    chinaAccess: t.chinaAccess as Tool['chinaAccess'],
    chineseUi: t.chineseUi,
    freeQuota: t.freeQuota ?? undefined,
    apiAvailable: t.apiAvailable,
    openSource: t.openSource,
    githubRepo: t.githubRepo ?? undefined,
    features: t.features ?? undefined,
    pricingDetail: t.pricingDetail ?? undefined,
    alternatives: t.alternatives ?? undefined,
    upvotes: t.upvotes,
    downvotes: t.downvotes,
    featured: t.featured,
    date: t.publishedAt,
  }));

  const countByCat = new Map<string, number>();
  for (const tool of tools2) {
    countByCat.set(tool.cat, (countByCat.get(tool.cat) ?? 0) + 1);
  }

  const cs: Category[] = cats
    .map((c) => ({
      id: c.id,
      en: c.en,
      zh: c.zh,
      icon: c.icon,
      count: countByCat.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

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
      pricing: tools.pricing, url: tools.url, chinaAccess: tools.chinaAccess,
      chineseUi: tools.chineseUi, freeQuota: tools.freeQuota, apiAvailable: tools.apiAvailable,
      openSource: tools.openSource, githubRepo: tools.githubRepo, features: tools.features,
      pricingDetail: tools.pricingDetail, alternatives: tools.alternatives,
      upvotes: tools.upvotes, downvotes: tools.downvotes,
      featured: tools.featured, howToUse: tools.howToUse, faqs: tools.faqs,
      publishedAt: tools.publishedAt,
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
    url: row.url ?? undefined,
    chinaAccess: row.chinaAccess as Tool['chinaAccess'],
    chineseUi: row.chineseUi,
    freeQuota: row.freeQuota ?? undefined,
    apiAvailable: row.apiAvailable,
    openSource: row.openSource,
    githubRepo: row.githubRepo ?? undefined,
    features: row.features ?? undefined,
    pricingDetail: row.pricingDetail ?? undefined,
    alternatives: row.alternatives ?? undefined,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    featured: row.featured,
    howToUse: row.howToUse ?? undefined,
    faqs: row.faqs ?? undefined,
    date: row.publishedAt,
    catEn: row.catEn, catZh: row.catZh, catIcon: row.catIcon,
  };
}

export async function loadAllToolIds(): Promise<string[]> {
  const rows = await db.select({ id: tools.id }).from(tools);
  return rows.map((r) => r.id);
}

// ── Articles ──────────────────────────────────────────────────────────────────

export async function loadSources(type = 'news') {
  return db.select().from(sources).where(and(eq(sources.active, true), eq(sources.type, type)));
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

// ── Tool auto discovery ─────────────────────────────────────────────────────

export async function upsertToolCandidates(items: {
  name: string;
  url: string;
  description?: string;
  sourceName: string;
  votes?: number;
}[]): Promise<number> {
  if (items.length === 0) return 0;
  let inserted = 0;
  for (const item of items) {
    const result = await db.insert(toolCandidates).values({
      name: item.name,
      url: item.url,
      description: item.description,
      sourceName: item.sourceName,
      votes: item.votes ?? 0,
    }).onConflictDoNothing();
    if (result.rowCount && result.rowCount > 0) inserted++;
  }
  return inserted;
}

export async function loadPendingToolCandidates(limit = 8) {
  return db
    .select()
    .from(toolCandidates)
    .where(eq(toolCandidates.status, 'pending'))
    .orderBy(desc(toolCandidates.fetchedAt))
    .limit(limit);
}

export async function markToolCandidateRejected(id: number) {
  await db.update(toolCandidates).set({ status: 'rejected' }).where(eq(toolCandidates.id, id));
}

export async function publishToolCandidate(id: number, data: {
  slug: string;
  name: string;
  en: string;
  zh: string;
  catId: string;
  pricing: Tool['pricing'];
  url: string;
  chinaAccess: Tool['chinaAccess'];
  features?: string[];
  howToUse?: string[];
  faqs?: { q: string; a: string }[];
}) {
  await db.insert(tools).values({
    id: data.slug,
    name: data.name,
    mono: data.name.slice(0, 2).toUpperCase(),
    brand: '#111827',
    catId: data.catId,
    en: data.en,
    zh: data.zh,
    pricing: data.pricing,
    url: data.url,
    chinaAccess: data.chinaAccess ?? 'unknown',
    features: data.features,
    howToUse: data.howToUse,
    faqs: data.faqs,
    publishedAt: new Date().toISOString().slice(0, 10),
  }).onConflictDoNothing();

  await db.update(toolCandidates).set({
    slug: data.slug,
    zh: data.zh,
    catId: data.catId,
    chinaAccess: data.chinaAccess ?? 'unknown',
    pricing: data.pricing,
    features: data.features,
    status: 'published',
    publishedAt: new Date(),
  }).where(eq(toolCandidates.id, id));
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
      chinaAccess: tools.chinaAccess,
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

// ── Trending list ─────────────────────────────────────────────────────────────

export async function loadTrendingList(period = 'today', limit = 25) {
  const safe = ['today', 'week', 'month'].includes(period) ? period : 'today';
  return db
    .select()
    .from(githubTrending)
    .where(eq(githubTrending.period, safe))
    .orderBy(desc(githubTrending.gained))
    .limit(limit);
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

// ── Tools list page ───────────────────────────────────────────────────────────

export async function loadToolsPage(opts: {
  cat?: string;
  pricing?: string;
  china?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const { cat, pricing, china, q, page = 1, pageSize = 24 } = opts;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (cat && cat !== 'all') conditions.push(eq(tools.catId, cat));
  if (pricing) conditions.push(eq(tools.pricing, pricing));
  if (china) conditions.push(eq(tools.chinaAccess, china));
  if (q) {
    const pattern = `%${q}%`;
    conditions.push(or(ilike(tools.name, pattern), ilike(tools.zh, pattern), ilike(tools.en, pattern))!);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalRows] = await Promise.all([
    db.select({
      id: tools.id, name: tools.name, mono: tools.mono, brand: tools.brand,
      catId: tools.catId, en: tools.en, zh: tools.zh,
      pricing: tools.pricing, url: tools.url, chinaAccess: tools.chinaAccess,
      features: tools.features, featured: tools.featured, publishedAt: tools.publishedAt,
    })
      .from(tools)
      .where(where)
      .orderBy(desc(tools.publishedAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ value: count() }).from(tools).where(where),
  ]);

  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadAllCategories() {
  const cats = await db.select().from(categories);
  const toolRows = await db.select({ catId: tools.catId }).from(tools);
  const countMap = new Map<string, number>();
  for (const t of toolRows) countMap.set(t.catId, (countMap.get(t.catId) ?? 0) + 1);
  return cats
    .map((c) => ({ ...c, count: countMap.get(c.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

// ── Tool related articles ─────────────────────────────────────────────────────

export async function loadRelatedArticles(toolName: string, limit = 5) {
  const pattern = `%${toolName}%`;
  return db
    .select({
      id: articles.id,
      title: articles.title,
      titleZh: articles.titleZh,
      url: articles.url,
      tag: articles.tag,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(
      and(
        eq(articles.status, 'published'),
        or(ilike(articles.title, pattern), ilike(articles.titleZh, pattern))
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

// ── Automation status ─────────────────────────────────────────────────────────

export async function loadAutomationStatus() {
  const [
    trendingTotals,
    missingTrendingZh,
    latestTrending,
    articleTotals,
    missingArticleZh,
    latestArticle,
    activeSources,
  ] = await Promise.all([
    db.select({ value: count() }).from(githubTrending),
    db.select({ value: count() }).from(githubTrending).where(isNull(githubTrending.descriptionZh)),
    db.select({ value: max(githubTrending.snapshotDate) }).from(githubTrending),
    db.select({ value: count() }).from(articles).where(eq(articles.status, 'published')),
    db.select({ value: count() }).from(articles).where(isNull(articles.titleZh)),
    db.select({ value: max(articles.fetchedAt) }).from(articles),
    db.select({ value: count() }).from(sources).where(eq(sources.active, true)),
  ]);

  return {
    trending: {
      total: trendingTotals[0]?.value ?? 0,
      missingZh: missingTrendingZh[0]?.value ?? 0,
      latestSnapshotAt: latestTrending[0]?.value?.toISOString() ?? null,
    },
    articles: {
      totalPublished: articleTotals[0]?.value ?? 0,
      missingZh: missingArticleZh[0]?.value ?? 0,
      latestFetchedAt: latestArticle[0]?.value?.toISOString() ?? null,
      activeSources: activeSources[0]?.value ?? 0,
    },
  };
}
