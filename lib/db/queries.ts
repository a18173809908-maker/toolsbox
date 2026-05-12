import { db } from './index';
import { categories, tools, githubTrending, articles, sources, sourceCandidates, toolCandidates, comparisons, toolConnectivity, toolVerdicts, events, eventVerdicts, comparisonDrafts, sceneDrafts, rankingDrafts, alternativeDrafts, toolFieldDrafts } from './schema';
import { desc, asc, eq, ilike, or, isNull, count, max, and, inArray, gt, sql, ne } from 'drizzle-orm';
import type { TrendingPeriod, Tool, Category, RepoItem, HomepageStats } from '@/lib/data';
import type { Comparison, Tool as DbTool } from './schema';
import { articleCategoryAliases } from '@/lib/article-categories';
import { AI_TOOLS, CATEGORIES, GITHUB_TRENDING, NEWS } from '@/lib/data';

async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

const toolHotnessScore = sql<number>`
  (case when ${tools.featured} then 1000 else 0 end)
  + coalesce(${tools.upvotes}, 0)
  - coalesce(${tools.downvotes}, 0)
`;

// ── Homepage ─────────────────────────────────────────────────────────────────

export async function loadHomepageData(): Promise<{
  categories: Category[];
  tools: Tool[];
  trending: Record<TrendingPeriod, RepoItem[]>;
  stats: HomepageStats;
}> {
  const fallbackResult = () => {
    const tools2 = AI_TOOLS.map((t) => ({
      ...t,
      cat: t.cat,
      pricing: t.pricing as Tool['pricing'],
      chinaAccess: t.chinaAccess as Tool['chinaAccess'] ?? 'unknown',
      chineseUi: t.chineseUi ?? false,
      apiAvailable: t.apiAvailable ?? false,
      openSource: t.openSource ?? false,
      upvotes: t.upvotes ?? 0,
      downvotes: t.downvotes ?? 0,
      featured: t.featured ?? false,
    }));

    const countByCat = new Map<string, number>();
    for (const tool of tools2) {
      countByCat.set(tool.cat, (countByCat.get(tool.cat) ?? 0) + 1);
    }

    const cs: Category[] = CATEGORIES
      .map((c) => ({
        id: c.id,
        en: c.en,
        zh: c.zh,
        icon: c.icon,
        count: countByCat.get(c.id) ?? 0,
      }))
      .sort((a, b) => b.count - a.count);

    const trending: Record<TrendingPeriod, RepoItem[]> = { today: [], week: [], month: [] };
    for (const [period, items] of Object.entries(GITHUB_TRENDING)) {
      const p = period as TrendingPeriod;
      if (!trending[p]) continue;
      trending[p] = items.map((r) => ({
        repo: r.repo, desc: r.desc, descZh: r.descZh,
        lang: r.lang, stars: r.stars, gained: r.gained,
      }));
    }

    const allRepos = [...GITHUB_TRENDING.today, ...GITHUB_TRENDING.week, ...GITHUB_TRENDING.month];
    const uniqueRepos = new Set(allRepos.map((r) => r.repo));
    const todayRows = GITHUB_TRENDING.today;

    const stats: HomepageStats = {
      toolsTotal: tools2.length,
      featuredTools: tools2.filter((t) => t.featured).length,
      categoriesTotal: cs.length,
      reposTracked: uniqueRepos.size,
      todayRepos: todayRows.length,
      todayStarsGained: todayRows.reduce((sum, r) => sum + r.gained, 0),
      lastUpdatedAt: new Date().toISOString(),
    };

    return { categories: cs, tools: tools2, trending, stats };
  };

  const dbFn = async () => {
    const [cats, ts, gh] = await Promise.all([
      db.select().from(categories),
      db.select().from(tools).orderBy(desc(toolHotnessScore), desc(tools.publishedAt)),
      db.select().from(githubTrending).orderBy(asc(githubTrending.period), desc(githubTrending.gained)),
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
      pricingUpdatedAt: t.pricingUpdatedAt?.toISOString(),
      accessUpdatedAt: t.accessUpdatedAt?.toISOString(),
      featuresUpdatedAt: t.featuresUpdatedAt?.toISOString(),
      complianceUpdatedAt: t.complianceUpdatedAt?.toISOString(),
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

    return { categories: cs, tools: tools2, trending, stats };
  };

  return withFallback(dbFn, fallbackResult());
}

// ── Tool detail ───────────────────────────────────────────────────────────────

export async function loadToolById(id: string): Promise<(Tool & { catEn: string; catZh: string; catIcon: string }) | null> {
  const fallbackResult = (): (Tool & { catEn: string; catZh: string; catIcon: string }) | null => {
    const tool = AI_TOOLS.find((t) => t.id === id);
    if (!tool) return null;
    const cat = CATEGORIES.find((c) => c.id === tool.cat);
    return {
      ...tool,
      pricing: tool.pricing as Tool['pricing'],
      chinaAccess: (tool.chinaAccess as Tool['chinaAccess']) ?? 'unknown',
      chineseUi: tool.chineseUi ?? false,
      apiAvailable: tool.apiAvailable ?? false,
      openSource: tool.openSource ?? false,
      upvotes: tool.upvotes ?? 0,
      downvotes: tool.downvotes ?? 0,
      featured: tool.featured ?? false,
      catEn: cat?.en ?? '',
      catZh: cat?.zh ?? '',
      catIcon: cat?.icon ?? '',
    };
  };

  const dbFn = async () => {
    const rows = await db
      .select({
        id: tools.id, name: tools.name, mono: tools.mono, brand: tools.brand,
        catId: tools.catId, en: tools.en, zh: tools.zh,
        pricing: tools.pricing, url: tools.url, chinaAccess: tools.chinaAccess,
        chineseUi: tools.chineseUi, freeQuota: tools.freeQuota, apiAvailable: tools.apiAvailable,
        openSource: tools.openSource, githubRepo: tools.githubRepo, features: tools.features,
        pricingDetail: tools.pricingDetail, alternatives: tools.alternatives,
        pricingUpdatedAt: tools.pricingUpdatedAt, accessUpdatedAt: tools.accessUpdatedAt,
        featuresUpdatedAt: tools.featuresUpdatedAt, complianceUpdatedAt: tools.complianceUpdatedAt,
        registerMethod: tools.registerMethod, needsOverseasPhone: tools.needsOverseasPhone,
        needsRealName: tools.needsRealName, overseasPaymentOnly: tools.overseasPaymentOnly,
        priceCny: tools.priceCny, miniProgram: tools.miniProgram, appStoreCn: tools.appStoreCn,
        publicAccount: tools.publicAccount, cnAlternatives: tools.cnAlternatives,
        tutorialLinks: tools.tutorialLinks,
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
      pricingUpdatedAt: row.pricingUpdatedAt?.toISOString(),
      accessUpdatedAt: row.accessUpdatedAt?.toISOString(),
      featuresUpdatedAt: row.featuresUpdatedAt?.toISOString(),
      complianceUpdatedAt: row.complianceUpdatedAt?.toISOString(),
      alternatives: row.alternatives ?? undefined,
      registerMethod: row.registerMethod ?? undefined,
      needsOverseasPhone: row.needsOverseasPhone,
      needsRealName: row.needsRealName,
      overseasPaymentOnly: row.overseasPaymentOnly,
      priceCny: row.priceCny ?? undefined,
      miniProgram: row.miniProgram ?? undefined,
      appStoreCn: row.appStoreCn,
      publicAccount: row.publicAccount ?? undefined,
      cnAlternatives: row.cnAlternatives ?? undefined,
      tutorialLinks: row.tutorialLinks ?? undefined,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      featured: row.featured,
      howToUse: row.howToUse ?? undefined,
      faqs: row.faqs ?? undefined,
      date: row.publishedAt,
      catEn: row.catEn, catZh: row.catZh, catIcon: row.catIcon,
    };
  };

  return withFallback(dbFn, fallbackResult());
}

// admin: 列出所有工具用于编辑推荐管理（按 featured DESC, name ASC）
export async function loadAllToolsForAdmin() {
  const rows = await db
    .select({
      id: tools.id,
      name: tools.name,
      catId: tools.catId,
      featured: tools.featured,
      pricing: tools.pricing,
      chinaAccess: tools.chinaAccess,
      publishedAt: tools.publishedAt,
    })
    .from(tools)
    .orderBy(desc(tools.featured), asc(tools.name));
  return rows;
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
  summary?: string;
  hotnessScore?: number;
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
      summary: item.summary,
      hotnessScore: item.hotnessScore,
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
  sourceType?: string;
  votes?: number;
  hnPoints?: number;
  ghGainedStars?: number;
  aibotLikes?: number;
  hotnessScore?: number;
}[]): Promise<number> {
  if (items.length === 0) return 0;
  let inserted = 0;
  for (const item of items) {
    const result = await db.insert(toolCandidates).values({
      name: item.name,
      url: item.url,
      description: item.description,
      sourceName: item.sourceName,
      sourceType: item.sourceType ?? 'rss',
      votes: item.votes ?? 0,
      hnPoints: item.hnPoints,
      ghGainedStars: item.ghGainedStars,
      aibotLikes: item.aibotLikes,
      hotnessScore: item.hotnessScore,
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
    .orderBy(desc(toolCandidates.hotnessScore), desc(toolCandidates.fetchedAt))
    .limit(limit);
}

export async function markToolCandidateRejected(id: number) {
  await db.update(toolCandidates).set({ status: 'rejected' }).where(eq(toolCandidates.id, id));
}

export async function draftToolCandidate(id: number, data: {
  slug: string;
  zh: string;
  catId: string;
  pricing: string;
  chinaAccess: string;
  features?: string[];
  aiDraft?: typeof toolCandidates.$inferInsert['aiDraft'];
}) {
  await db.update(toolCandidates).set({
    slug: data.slug,
    zh: data.zh,
    catId: data.catId,
    pricing: data.pricing,
    chinaAccess: data.chinaAccess,
    features: data.features,
    aiDraft: data.aiDraft ?? null,
    status: 'ai_drafted',
  }).where(eq(toolCandidates.id, id));
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
  registerMethod?: string[];
  needsOverseasPhone?: boolean;
  needsRealName?: boolean;
  overseasPaymentOnly?: boolean;
  priceCny?: string;
  miniProgram?: string;
  appStoreCn?: boolean;
  publicAccount?: string;
  cnAlternatives?: string[];
  tutorialLinks?: { platform: string; url: string; title: string }[];
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
    registerMethod: data.registerMethod,
    needsOverseasPhone: data.needsOverseasPhone ?? false,
    needsRealName: data.needsRealName ?? false,
    overseasPaymentOnly: data.overseasPaymentOnly ?? false,
    priceCny: data.priceCny,
    miniProgram: data.miniProgram,
    appStoreCn: data.appStoreCn ?? false,
    publicAccount: data.publicAccount,
    cnAlternatives: data.cnAlternatives,
    tutorialLinks: data.tutorialLinks,
    pricingUpdatedAt: new Date(),
    accessUpdatedAt: new Date(),
    featuresUpdatedAt: new Date(),
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

export async function loadToolsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db
    .select({
      id: tools.id,
      name: tools.name,
      zh: tools.zh,
      pricing: tools.pricing,
      chinaAccess: tools.chinaAccess,
    })
    .from(tools)
    .where(inArray(tools.id, ids));
}

export type ComparisonWithTools = Comparison & {
  toolA: Tool;
  toolB: Tool;
  /** Ordered tool list — from toolIds if set, otherwise [toolA, toolB] */
  tools: Tool[];
};

function mapDbTool(row: DbTool): Tool {
  return {
    id: row.id,
    name: row.name,
    mono: row.mono,
    brand: row.brand,
    cat: row.catId,
    en: row.en,
    zh: row.zh,
    pricing: row.pricing as Tool['pricing'],
    url: row.url ?? undefined,
    chinaAccess: row.chinaAccess as Tool['chinaAccess'],
    chineseUi: row.chineseUi,
    freeQuota: row.freeQuota ?? undefined,
    apiAvailable: row.apiAvailable,
    openSource: row.openSource,
    githubRepo: row.githubRepo ?? undefined,
    features: row.features ?? undefined,
    priceCny: row.priceCny ?? undefined,
    pricingDetail: row.pricingDetail ?? undefined,
    pricingUpdatedAt: row.pricingUpdatedAt?.toISOString(),
    accessUpdatedAt: row.accessUpdatedAt?.toISOString(),
    featuresUpdatedAt: row.featuresUpdatedAt?.toISOString(),
    complianceUpdatedAt: row.complianceUpdatedAt?.toISOString(),
    alternatives: row.alternatives ?? undefined,
    registerMethod: row.registerMethod ?? undefined,
    needsOverseasPhone: row.needsOverseasPhone,
    needsRealName: row.needsRealName,
    overseasPaymentOnly: row.overseasPaymentOnly,
    miniProgram: row.miniProgram ?? undefined,
    appStoreCn: row.appStoreCn,
    publicAccount: row.publicAccount ?? undefined,
    cnAlternatives: row.cnAlternatives ?? undefined,
    tutorialLinks: row.tutorialLinks ?? undefined,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    featured: row.featured,
    date: row.publishedAt,
    howToUse: row.howToUse ?? undefined,
    faqs: row.faqs ?? undefined,
  };
}

async function attachComparisonTools(rows: Comparison[]): Promise<ComparisonWithTools[]> {
  const ids = Array.from(new Set(rows.flatMap((row) => {
    const extra = row.toolIds ?? [];
    return [row.toolAId, row.toolBId, ...extra];
  })));
  if (ids.length === 0) return [];

  const toolRows = await db
    .select()
    .from(tools)
    .where(inArray(tools.id, ids));

  const toolMap = new Map(toolRows.map((row) => [row.id, mapDbTool(row)]));
  return rows.flatMap((row) => {
    const toolA = toolMap.get(row.toolAId);
    const toolB = toolMap.get(row.toolBId);
    if (!toolA || !toolB) return [];
    // Build ordered tools list: prefer toolIds when set, else [toolA, toolB]
    const orderedTools = row.toolIds && row.toolIds.length > 0
      ? row.toolIds.map((id) => toolMap.get(id)).filter((t): t is Tool => t != null)
      : [toolA, toolB];
    return [{ ...row, toolA, toolB, tools: orderedTools }];
  });
}

export async function loadAllComparisons(): Promise<ComparisonWithTools[]> {
  const rows = await db
    .select()
    .from(comparisons)
    .where(eq(comparisons.status, 'published'))
    .orderBy(desc(comparisons.publishedAt), desc(comparisons.updatedAt));
  return attachComparisonTools(rows);
}

export async function loadAllComparisonIds(): Promise<string[]> {
  const rows = await db
    .select({ id: comparisons.id })
    .from(comparisons)
    .where(eq(comparisons.status, 'published'));
  return rows.map((row) => row.id);
}

export async function loadComparisonById(id: string): Promise<ComparisonWithTools | null> {
  const rows = await db
    .select()
    .from(comparisons)
    .where(and(eq(comparisons.id, id), eq(comparisons.status, 'published')))
    .limit(1);
  const withTools = await attachComparisonTools(rows);
  return withTools[0] ?? null;
}

export async function loadLabReportsByToolId(toolId: string): Promise<ComparisonWithTools[]> {
  const rows = await db
    .select()
    .from(comparisons)
    .where(
      and(
        eq(comparisons.status, 'published'),
        eq(comparisons.isLabReport, true),
        or(eq(comparisons.toolAId, toolId), eq(comparisons.toolBId, toolId)),
      ),
    )
    .orderBy(desc(comparisons.publishedAt), desc(comparisons.updatedAt))
    .limit(5);
  return attachComparisonTools(rows);
}

export async function loadComparisonsByToolId(toolId: string, limit = 5): Promise<ComparisonWithTools[]> {
  const rows = await db
    .select()
    .from(comparisons)
    .where(
      and(
        eq(comparisons.status, 'published'),
        eq(comparisons.isLabReport, false),
        or(eq(comparisons.toolAId, toolId), eq(comparisons.toolBId, toolId)),
      ),
    )
    .orderBy(desc(comparisons.publishedAt), desc(comparisons.updatedAt))
    .limit(limit);
  return attachComparisonTools(rows);
}

export async function loadConnectivityByToolId(toolId: string) {
  const rows = await db
    .select()
    .from(toolConnectivity)
    .where(eq(toolConnectivity.toolId, toolId))
    .orderBy(desc(toolConnectivity.reportedAt));

  const latestByCarrier = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!latestByCarrier.has(row.carrier)) latestByCarrier.set(row.carrier, row);
  }

  return ['general', 'telecom', 'unicom', 'mobile']
    .map((carrier) => latestByCarrier.get(carrier))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
}

export async function loadPendingArticles(limit = 20) {
  return db.select().from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function loadArticlesPage(page = 1, pageSize = 30, tag?: string) {
  const offset = (page - 1) * pageSize;
  const where = tag
    ? and(eq(articles.status, 'published'), inArray(articles.tag, articleCategoryAliases(tag)))
    : eq(articles.status, 'published');

  return db
    .select({
      id: articles.id,
      title: articles.title,
      titleZh: articles.titleZh,
      url: articles.url,
      summary: articles.summary,
      summaryZh: articles.summaryZh,
      aiInsights: articles.aiInsights,
      hotnessScore: articles.hotnessScore,
      tag: articles.tag,
      publishedAt: articles.publishedAt,
      sourceName: sources.name,
    })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(where)
    .orderBy(
      desc(sql<number>`case when ${articles.hotnessScore} >= 70 then 1 else 0 end`),
      desc(articles.publishedAt),
      desc(articles.hotnessScore),
      desc(articles.fetchedAt),
    )
    .limit(pageSize)
    .offset(offset);
}

export async function loadArticles(opts: { limit?: number } = {}) {
  const { limit = 10 } = opts;

  const fallbackResult = () => {
    return NEWS.slice(0, limit).map((n, i) => ({
      id: i,
      title: n.en,
      summary: n.zh as string | null,
      publishedAt: (n.date ? new Date(n.date) : null) as Date | null,
      sourceName: null as string | null,
      category: n.tag as string | null,
    }));
  };

  const dbFn = async () => {
    return db
      .select({
        id: articles.id,
        title: articles.title,
        summary: articles.summary,
        publishedAt: articles.publishedAt,
        sourceName: sources.name,
        category: articles.tag,
      })
      .from(articles)
      .leftJoin(sources, eq(articles.sourceId, sources.id))
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  };

  return withFallback(dbFn, fallbackResult());
}

export async function loadArticleHotTopics(limit = 5, days = 3) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      title: articles.title,
      titleZh: articles.titleZh,
      hotnessScore: articles.hotnessScore,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(and(eq(articles.status, 'published'), gt(articles.publishedAt, since)))
    .orderBy(
      desc(sql<number>`case when ${articles.hotnessScore} >= 70 then 1 else 0 end`),
      desc(articles.hotnessScore),
      desc(articles.publishedAt),
    )
    .limit(limit * 4);

  const seen = new Set<string>();
  const topics: { topic: string; count: number; maxHotness: number; latestAt: Date | null; samples: string[] }[] = [];

  const normalizeKey = (title: string) => {
    const lower = title.toLowerCase();
    if (/deepseek/.test(lower) && /融资|参投|投资/.test(title)) return 'deepseek-financing';
    if (/openai/.test(lower) && /语音|同传|翻译/.test(title)) return 'openai-voice-models';
    if (/chatgpt/.test(lower) && /免费模型|升级|幻觉|记忆/.test(title)) return 'chatgpt-free-model-upgrade';
    if (/chrome/.test(lower) && /gemini/.test(lower)) return 'chrome-gemini-local-model';
    if (/百度|文心/.test(title) && /5\.?1/.test(title)) return 'wenxin-5-1';
    if (/claude code/.test(lower)) return 'claude-code';
    if (/华为/.test(title) && /灵境|openjiuwen/i.test(title)) return 'huawei-lingjing-openjiuwen';
    if (/ai ?短片|纸手机|穿帮镜头/i.test(title)) return 'ai-short-film';
    return title
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[，。；：、,!?！？"'“”‘’()[\]【】《》「」|｜:：\-\s]/g, '')
      .slice(0, 36);
  };

  for (const row of rows) {
    const title = (row.titleZh || row.title || '').trim();
    if (!title) continue;
    const key = normalizeKey(title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    topics.push({
      topic: title,
      count: 1,
      maxHotness: row.hotnessScore ?? 0,
      latestAt: row.publishedAt,
      samples: [title],
    });
    if (topics.length >= limit) break;
  }

  return topics;
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

export async function updateRepoReadmeZh(repo: string, readmeZh: string) {
  await db.update(githubTrending).set({ readmeZh }).where(eq(githubTrending.repo, repo));
}

export async function loadReposMissingReadmeZh(limit = 20) {
  const rows = await db
    .select({
      repo: githubTrending.repo,
      gained: githubTrending.gained,
      readmeZh: githubTrending.readmeZh,
    })
    .from(githubTrending)
    .where(eq(githubTrending.period, 'week'))
    .orderBy(desc(githubTrending.gained))
    .limit(limit * 3);

  const seen = new Set<string>();
  return rows
    .filter((row) => {
      if (seen.has(row.repo) || row.readmeZh) return false;
      seen.add(row.repo);
      return true;
    })
    .slice(0, limit)
    .map((row) => row.repo);
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
      aiInsights: articles.aiInsights,
      hotnessScore: articles.hotnessScore,
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
  const [catRows, totalRows] = await Promise.all([
    db.select().from(categories).where(eq(categories.id, id)),
    db.select({ value: count() }).from(tools).where(eq(tools.catId, id)),
  ]);
  const cat = catRows[0];
  if (!cat) return null;
  return { ...cat, count: totalRows[0]?.value ?? 0 };
}

export async function loadToolsByCategory(catId: string) {
  return db
    .select()
    .from(tools)
    .where(eq(tools.catId, catId))
    .orderBy(desc(toolHotnessScore), desc(tools.publishedAt));
}

export async function updateArticleAi(id: number, data: {
  titleZh?: string;
  summary?: string;
  summaryZh?: string;
  aiInsights?: typeof articles.$inferInsert['aiInsights'];
  hotnessScore?: number;
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

  const fallbackResult = () => {
    let filtered = [...AI_TOOLS];
    if (cat && cat !== 'all') filtered = filtered.filter((t) => t.cat === cat);
    if (pricing) filtered = filtered.filter((t) => t.pricing === pricing);
    if (china) filtered = filtered.filter((t) => t.chinaAccess === china);
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(query) ||
        t.zh?.toLowerCase().includes(query) ||
        t.en?.toLowerCase().includes(query)
      );
    }
    filtered.sort((a, b) => {
      const scoreA = (a.featured ? 1000 : 0) + (a.upvotes || 0) - (a.downvotes || 0);
      const scoreB = (b.featured ? 1000 : 0) + (b.upvotes || 0) - (b.downvotes || 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    const total = filtered.length;
    const items = filtered.slice(offset, offset + pageSize).map((t) => ({
      id: t.id, name: t.name, mono: t.mono, brand: t.brand,
      catId: t.cat, en: t.en, zh: t.zh,
      pricing: t.pricing, url: t.url ?? null, chinaAccess: t.chinaAccess ?? 'unknown',
      chineseUi: t.chineseUi ?? false, freeQuota: t.freeQuota ?? null,
      priceCny: t.priceCny ?? null, pricingDetail: t.pricingDetail ?? null,
      cnAlternatives: t.cnAlternatives ?? null,
      apiAvailable: t.apiAvailable ?? false, openSource: t.openSource ?? false,
      features: t.features ?? null, featured: t.featured ?? false,
      upvotes: t.upvotes ?? 0, downvotes: t.downvotes ?? 0,
      publishedAt: t.date,
    }));
    return { items, total };
  };

  const conditions = [];
  if (cat && cat !== 'all') conditions.push(eq(tools.catId, cat));
  if (pricing) conditions.push(eq(tools.pricing, pricing));
  if (china) conditions.push(eq(tools.chinaAccess, china));
  if (q) {
    const pattern = `%${q}%`;
    conditions.push(or(ilike(tools.name, pattern), ilike(tools.zh, pattern), ilike(tools.en, pattern))!);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const dbFn = async () => {
    const [items, totalRows] = await Promise.all([
      db.select({
        id: tools.id, name: tools.name, mono: tools.mono, brand: tools.brand,
        catId: tools.catId, en: tools.en, zh: tools.zh,
        pricing: tools.pricing, url: tools.url, chinaAccess: tools.chinaAccess,
        chineseUi: tools.chineseUi, freeQuota: tools.freeQuota,
        priceCny: tools.priceCny, pricingDetail: tools.pricingDetail,
        cnAlternatives: tools.cnAlternatives,
        apiAvailable: tools.apiAvailable, openSource: tools.openSource,
        features: tools.features, featured: tools.featured,
        upvotes: tools.upvotes, downvotes: tools.downvotes,
        publishedAt: tools.publishedAt,
      })
        .from(tools)
        .where(where)
        .orderBy(desc(toolHotnessScore), desc(tools.publishedAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ value: count() }).from(tools).where(where),
    ]);
    return { items, total: totalRows[0]?.value ?? 0 };
  };

  return withFallback(dbFn, fallbackResult());
}

export async function loadAllCategories(opts: {
  pricing?: string;
  china?: string;
  q?: string;
} = {}) {
  const fallbackResult = () => {
    let filtered = [...AI_TOOLS];
    if (opts.pricing) filtered = filtered.filter((t) => t.pricing === opts.pricing);
    if (opts.china) filtered = filtered.filter((t) => t.chinaAccess === opts.china);
    if (opts.q) {
      const query = opts.q.toLowerCase();
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(query) ||
        t.zh?.toLowerCase().includes(query) ||
        t.en?.toLowerCase().includes(query)
      );
    }
    const countMap = new Map<string, number>();
    for (const t of filtered) countMap.set(t.cat, (countMap.get(t.cat) ?? 0) + 1);
    return CATEGORIES
      .map((c) => ({ ...c, count: countMap.get(c.id) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  };

  const dbFn = async () => {
    const cats = await db.select().from(categories);

    const conditions = [];
    if (opts.pricing) conditions.push(eq(tools.pricing, opts.pricing));
    if (opts.china) conditions.push(eq(tools.chinaAccess, opts.china));
    if (opts.q) {
      const pattern = `%${opts.q}%`;
      conditions.push(or(ilike(tools.name, pattern), ilike(tools.zh, pattern), ilike(tools.en, pattern))!);
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const toolRows = await db.select({ catId: tools.catId }).from(tools).where(where);
    const countMap = new Map<string, number>();
    for (const t of toolRows) countMap.set(t.catId, (countMap.get(t.catId) ?? 0) + 1);
    return cats
      .map((c) => ({ ...c, count: countMap.get(c.id) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  };

  return withFallback(dbFn, fallbackResult());
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

export async function loadRelatedArticlesByArticleId(articleId: number, limit = 5) {
  const currentArticle = await loadArticleById(articleId);
  if (!currentArticle) return [];

  const tag = currentArticle.tag;
  if (!tag) {
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
          ne(articles.id, articleId)
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }

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
        ne(articles.id, articleId),
        inArray(articles.tag, articleCategoryAliases(tag))
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

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function loadAdminCounts() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [toolCount, compCount, artCount, sourceCount, toolRev, compRev, artRev] = await Promise.all([
    db.select({ value: count() }).from(toolCandidates)
      .where(inArray(toolCandidates.status, ['ai_drafted', 'processed'])),
    db.select({ value: count() }).from(comparisons)
      .where(eq(comparisons.status, 'draft')),
    db.select({ value: count() }).from(articles)
      .where(and(eq(articles.status, 'published'), gt(articles.publishedAt, thirtyDaysAgo))),
    db.select({ value: count() }).from(sourceCandidates)
      .where(eq(sourceCandidates.status, 'candidate')),
    db.select({ value: count() }).from(toolCandidates)
      .where(gt(toolCandidates.reviewedAt, todayStart)),
    db.select({ value: count() }).from(comparisons)
      .where(gt(comparisons.reviewedAt, todayStart)),
    db.select({ value: count() }).from(articles)
      .where(gt(articles.reviewedAt, todayStart)),
  ]);

  return {
    pendingTools: toolCount[0]?.value ?? 0,
    pendingComparisons: compCount[0]?.value ?? 0,
    recentArticles: artCount[0]?.value ?? 0,
    pendingSources: sourceCount[0]?.value ?? 0,
    todayReviewed:
      (toolRev[0]?.value ?? 0) + (compRev[0]?.value ?? 0) + (artRev[0]?.value ?? 0),
  };
}

export async function loadAdminSourceCandidates(limit = 50, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select()
      .from(sourceCandidates)
      .where(eq(sourceCandidates.status, 'candidate'))
      .orderBy(desc(sourceCandidates.qualityScore), desc(sourceCandidates.aiRelevanceScore), desc(sourceCandidates.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(sourceCandidates)
      .where(eq(sourceCandidates.status, 'candidate')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadAdminSourceCandidateById(id: number) {
  const rows = await db.select().from(sourceCandidates).where(eq(sourceCandidates.id, id));
  return rows[0] ?? null;
}

export async function loadAdminPendingTools(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select({
      id: toolCandidates.id,
      name: toolCandidates.name,
      url: toolCandidates.url,
      sourceName: toolCandidates.sourceName,
      status: toolCandidates.status,
      fetchedAt: toolCandidates.fetchedAt,
    }).from(toolCandidates)
      .where(inArray(toolCandidates.status, ['ai_drafted', 'processed']))
      .orderBy(desc(toolCandidates.fetchedAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(toolCandidates)
      .where(inArray(toolCandidates.status, ['ai_drafted', 'processed'])),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadAdminDraftComparisons(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select({
      id: comparisons.id,
      title: comparisons.title,
      testedBy: comparisons.testedBy,
      status: comparisons.status,
      createdAt: comparisons.createdAt,
    }).from(comparisons)
      .where(eq(comparisons.status, 'draft'))
      .orderBy(desc(comparisons.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(comparisons)
      .where(eq(comparisons.status, 'draft')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadAdminRecentArticles(limit = 20, offset = 0) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [items, totalRows] = await Promise.all([
    db.select({
      id: articles.id,
      title: articles.title,
      titleZh: articles.titleZh,
      url: articles.url,
      tag: articles.tag,
      status: articles.status,
      publishedAt: articles.publishedAt,
      fetchedAt: articles.fetchedAt,
      sourceName: sources.name,
    }).from(articles)
      .leftJoin(sources, eq(articles.sourceId, sources.id))
      .where(and(eq(articles.status, 'published'), gt(articles.publishedAt, thirtyDaysAgo)))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(articles)
      .where(and(eq(articles.status, 'published'), gt(articles.publishedAt, thirtyDaysAgo))),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadAdminToolCandidateById(id: number) {
  const rows = await db.select().from(toolCandidates).where(eq(toolCandidates.id, id));
  return rows[0] ?? null;
}

export async function loadAdminComparisonById(id: string) {
  const rows = await db.select().from(comparisons).where(eq(comparisons.id, id));
  return rows[0] ?? null;
}

export async function loadAdminArticleById(id: number) {
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      titleZh: articles.titleZh,
      url: articles.url,
      summary: articles.summary,
      summaryZh: articles.summaryZh,
      aiInsights: articles.aiInsights,
      hotnessScore: articles.hotnessScore,
      tag: articles.tag,
      status: articles.status,
      publishedAt: articles.publishedAt,
      fetchedAt: articles.fetchedAt,
      reviewedBy: articles.reviewedBy,
      reviewedAt: articles.reviewedAt,
      rejectReason: articles.rejectReason,
      sourceName: sources.name,
      sourceUrl: sources.url,
    })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(eq(articles.id, id));
  return rows[0] ?? null;
}

// ── Tool Verdicts ─────────────────────────────────────────────────────────────

export async function loadVerdictByToolId(toolId: string) {
  const rows = await db
    .select()
    .from(toolVerdicts)
    .where(and(eq(toolVerdicts.toolId, toolId), eq(toolVerdicts.status, 'published')))
    .orderBy(desc(toolVerdicts.verdictUpdatedAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function loadPendingVerdicts(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select().from(toolVerdicts)
      .where(eq(toolVerdicts.status, 'ai_drafted'))
      .orderBy(desc(toolVerdicts.createdAt))
      .limit(limit).offset(offset),
    db.select({ value: count() }).from(toolVerdicts)
      .where(eq(toolVerdicts.status, 'ai_drafted')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadVerdictById(id: string) {
  const rows = await db.select().from(toolVerdicts).where(eq(toolVerdicts.id, id));
  return rows[0] ?? null;
}

export async function publishVerdict(id: string) {
  await db.update(toolVerdicts)
    .set({ status: 'published', reviewedAt: new Date() })
    .where(eq(toolVerdicts.id, id));
}

export async function rejectVerdict(id: string, reason: string) {
  await db.update(toolVerdicts)
    .set({ status: 'rejected', reviewedAt: new Date(), rejectReason: reason })
    .where(eq(toolVerdicts.id, id));
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function loadPendingEvents(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select().from(events)
      .where(eq(events.status, 'ai_drafted'))
      .orderBy(desc(events.createdAt))
      .limit(limit).offset(offset),
    db.select({ value: count() }).from(events)
      .where(eq(events.status, 'ai_drafted')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadEventById(id: string) {
  const rows = await db.select().from(events).where(eq(events.id, id));
  return rows[0] ?? null;
}

export async function loadPublishedEvents(limit = 40) {
  return db.select().from(events)
    .where(eq(events.status, 'published'))
    .orderBy(desc(events.publishedAt))
    .limit(limit);
}

export async function loadEventBySlug(slug: string) {
  const rows = await db.select().from(events)
    .where(and(eq(events.slug, slug), eq(events.status, 'published')));
  return rows[0] ?? null;
}

export async function loadAllEventSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: events.slug }).from(events)
    .where(eq(events.status, 'published'));
  return rows.map((r) => r.slug);
}

export async function loadEventVerdictByEventId(eventId: string) {
  const rows = await db.select().from(eventVerdicts)
    .where(and(eq(eventVerdicts.eventId, eventId), eq(eventVerdicts.status, 'published')));
  return rows[0] ?? null;
}

export async function publishEvent(id: string) {
  await db.update(events)
    .set({ status: 'published', reviewedAt: new Date(), publishedAt: new Date() })
    .where(eq(events.id, id));
}

export async function rejectEvent(id: string, reason: string) {
  await db.update(events)
    .set({ status: 'rejected', reviewedAt: new Date(), rejectReason: reason })
    .where(eq(events.id, id));
}

// ── Event Verdicts ────────────────────────────────────────────────────────────

export async function loadPendingEventVerdicts(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select().from(eventVerdicts)
      .where(eq(eventVerdicts.status, 'ai_drafted'))
      .orderBy(desc(eventVerdicts.createdAt))
      .limit(limit).offset(offset),
    db.select({ value: count() }).from(eventVerdicts)
      .where(eq(eventVerdicts.status, 'ai_drafted')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadEventVerdictById(id: string) {
  const rows = await db.select().from(eventVerdicts).where(eq(eventVerdicts.id, id));
  return rows[0] ?? null;
}

export async function publishEventVerdict(id: string) {
  await db.update(eventVerdicts)
    .set({ status: 'published', reviewedAt: new Date() })
    .where(eq(eventVerdicts.id, id));
}

export async function rejectEventVerdict(id: string, reason: string) {
  await db.update(eventVerdicts)
    .set({ status: 'rejected', reviewedAt: new Date(), rejectReason: reason })
    .where(eq(eventVerdicts.id, id));
}

// ── Comparison Drafts ─────────────────────────────────────────────────────────

export async function loadComparisonDrafts(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select().from(comparisonDrafts)
      .where(eq(comparisonDrafts.status, 'ai_drafted'))
      .orderBy(desc(comparisonDrafts.createdAt))
      .limit(limit).offset(offset),
    db.select({ value: count() }).from(comparisonDrafts)
      .where(eq(comparisonDrafts.status, 'ai_drafted')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadComparisonDraftById(id: string) {
  const rows = await db.select().from(comparisonDrafts).where(eq(comparisonDrafts.id, id));
  return rows[0] ?? null;
}

export async function publishComparisonDraft(id: string) {
  await db.update(comparisonDrafts)
    .set({ status: 'published', reviewedAt: new Date(), publishedAt: new Date() })
    .where(eq(comparisonDrafts.id, id));
}

export async function rejectComparisonDraft(id: string, reason: string) {
  await db.update(comparisonDrafts)
    .set({ status: 'rejected', reviewedAt: new Date(), rejectReason: reason })
    .where(eq(comparisonDrafts.id, id));
}

// ── Scene Drafts ──────────────────────────────────────────────────────────────

export async function loadSceneDrafts(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select().from(sceneDrafts)
      .where(eq(sceneDrafts.status, 'ai_drafted'))
      .orderBy(desc(sceneDrafts.createdAt))
      .limit(limit).offset(offset),
    db.select({ value: count() }).from(sceneDrafts)
      .where(eq(sceneDrafts.status, 'ai_drafted')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadSceneDraftById(id: string) {
  const rows = await db.select().from(sceneDrafts).where(eq(sceneDrafts.id, id));
  return rows[0] ?? null;
}

export async function publishSceneDraft(id: string) {
  await db.update(sceneDrafts)
    .set({ status: 'published', reviewedAt: new Date(), publishedAt: new Date() })
    .where(eq(sceneDrafts.id, id));
}

export async function rejectSceneDraft(id: string, reason: string) {
  await db.update(sceneDrafts)
    .set({ status: 'rejected', reviewedAt: new Date(), rejectReason: reason })
    .where(eq(sceneDrafts.id, id));
}

// ── Ranking Drafts ────────────────────────────────────────────────────────────

export async function loadRankingDrafts(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select().from(rankingDrafts)
      .where(eq(rankingDrafts.status, 'ai_drafted'))
      .orderBy(desc(rankingDrafts.createdAt))
      .limit(limit).offset(offset),
    db.select({ value: count() }).from(rankingDrafts)
      .where(eq(rankingDrafts.status, 'ai_drafted')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadRankingDraftById(id: string) {
  const rows = await db.select().from(rankingDrafts).where(eq(rankingDrafts.id, id));
  return rows[0] ?? null;
}

export async function publishRankingDraft(id: string) {
  await db.update(rankingDrafts)
    .set({ status: 'published', reviewedAt: new Date(), publishedAt: new Date() })
    .where(eq(rankingDrafts.id, id));
}

export async function rejectRankingDraft(id: string, reason: string) {
  await db.update(rankingDrafts)
    .set({ status: 'rejected', reviewedAt: new Date(), rejectReason: reason })
    .where(eq(rankingDrafts.id, id));
}

// ── Alternative Drafts ────────────────────────────────────────────────────────

export async function loadAlternativeDrafts(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select().from(alternativeDrafts)
      .where(eq(alternativeDrafts.status, 'ai_drafted'))
      .orderBy(desc(alternativeDrafts.createdAt))
      .limit(limit).offset(offset),
    db.select({ value: count() }).from(alternativeDrafts)
      .where(eq(alternativeDrafts.status, 'ai_drafted')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadAlternativeDraftById(id: string) {
  const rows = await db.select().from(alternativeDrafts).where(eq(alternativeDrafts.id, id));
  return rows[0] ?? null;
}

export async function publishAlternativeDraft(id: string) {
  await db.update(alternativeDrafts)
    .set({ status: 'published', reviewedAt: new Date(), publishedAt: new Date() })
    .where(eq(alternativeDrafts.id, id));
}

export async function rejectAlternativeDraft(id: string, reason: string) {
  await db.update(alternativeDrafts)
    .set({ status: 'rejected', reviewedAt: new Date(), rejectReason: reason })
    .where(eq(alternativeDrafts.id, id));
}

// ── Tool Field Drafts ─────────────────────────────────────────────────────────

export async function loadToolFieldDrafts(limit = 20, offset = 0) {
  const [items, totalRows] = await Promise.all([
    db.select().from(toolFieldDrafts)
      .where(eq(toolFieldDrafts.status, 'ai_drafted'))
      .orderBy(desc(toolFieldDrafts.createdAt))
      .limit(limit).offset(offset),
    db.select({ value: count() }).from(toolFieldDrafts)
      .where(eq(toolFieldDrafts.status, 'ai_drafted')),
  ]);
  return { items, total: totalRows[0]?.value ?? 0 };
}

export async function loadToolFieldDraftById(id: string) {
  const rows = await db.select().from(toolFieldDrafts).where(eq(toolFieldDrafts.id, id));
  return rows[0] ?? null;
}

export async function publishToolFieldDraft(id: string) {
  await db.update(toolFieldDrafts)
    .set({ status: 'published', reviewedAt: new Date(), publishedAt: new Date() })
    .where(eq(toolFieldDrafts.id, id));
}

export async function rejectToolFieldDraft(id: string, reason: string) {
  await db.update(toolFieldDrafts)
    .set({ status: 'rejected', reviewedAt: new Date(), rejectReason: reason })
    .where(eq(toolFieldDrafts.id, id));
}
