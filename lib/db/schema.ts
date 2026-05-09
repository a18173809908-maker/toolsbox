import { sql } from 'drizzle-orm';
import { pgTable, text, integer, boolean, timestamp, serial, index, jsonb } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  en: text('en').notNull(),
  zh: text('zh').notNull(),
  icon: text('icon').notNull(),
  count: integer('count').notNull().default(0),
});

export const tools = pgTable(
  'tools',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    mono: text('mono').notNull(),
    brand: text('brand').notNull(),
    catId: text('cat_id').notNull().references(() => categories.id),
    en: text('en').notNull(),
    zh: text('zh').notNull(),
    pricing: text('pricing').notNull(),
    url: text('url'),
    chinaAccess: text('china_access').notNull().default('unknown'),
    chineseUi: boolean('chinese_ui').notNull().default(false),
    freeQuota: text('free_quota'),
    apiAvailable: boolean('api_available').notNull().default(false),
    openSource: boolean('open_source').notNull().default(false),
    githubRepo: text('github_repo'),
    features: text('features').array(),
    pricingDetail: text('pricing_detail'),
    pricingUpdatedAt: timestamp('pricing_updated_at'),
    accessUpdatedAt: timestamp('access_updated_at'),
    featuresUpdatedAt: timestamp('features_updated_at'),
    complianceUpdatedAt: timestamp('compliance_updated_at'),
    alternatives: text('alternatives').array(),
    registerMethod: text('register_method').array(),
    needsOverseasPhone: boolean('needs_overseas_phone').notNull().default(false),
    needsRealName: boolean('needs_real_name').notNull().default(false),
    overseasPaymentOnly: boolean('overseas_payment_only').notNull().default(false),
    priceCny: text('price_cny'),
    miniProgram: text('mini_program'),
    appStoreCn: boolean('app_store_cn').notNull().default(false),
    publicAccount: text('public_account'),
    cnAlternatives: text('cn_alternatives').array(),
    tutorialLinks: jsonb('tutorial_links').$type<{ platform: string; url: string; title: string }[]>(),
    upvotes: integer('upvotes').notNull().default(0),
    downvotes: integer('downvotes').notNull().default(0),
    featured: boolean('featured').notNull().default(false),
    howToUse: text('how_to_use').array(),
    faqs: jsonb('faqs').$type<{ q: string; a: string }[]>(),
    publishedAt: text('published_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    catIdx: index('tools_cat_idx').on(t.catId),
    publishedIdx: index('tools_published_idx').on(t.publishedAt),
  }),
);

export const githubTrending = pgTable(
  'github_trending',
  {
    id: serial('id').primaryKey(),
    period: text('period').notNull(),
    repo: text('repo').notNull(),
    description: text('description').notNull(),
    descriptionZh: text('description_zh'),
    readmeZh: text('readme_zh'),
    lang: text('lang').notNull(),
    stars: integer('stars').notNull(),
    gained: integer('gained').notNull(),
    snapshotDate: timestamp('snapshot_date').notNull().defaultNow(),
  },
  (t) => ({
    periodIdx: index('gh_period_idx').on(t.period),
    gainedIdx: index('gh_gained_idx').on(t.gained),
  }),
);

export const toolConnectivity = pgTable(
  'tool_connectivity',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    toolId: text('tool_id').notNull().references(() => tools.id),
    carrier: text('carrier').notNull(),
    region: text('region'),
    status: text('status').notNull(),
    latencyMs: integer('latency_ms'),
    source: text('source').notNull(),
    reportedAt: timestamp('reported_at').notNull().defaultNow(),
    reportedBy: text('reported_by'),
    note: text('note'),
  },
  (t) => ({
    toolCarrierIdx: index('tool_connectivity_tool_carrier_idx').on(t.toolId, t.carrier),
    reportedIdx: index('tool_connectivity_reported_idx').on(t.reportedAt),
  }),
);

// ── News / Articles ──────────────────────────────────────────────────────────

export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  feedUrl: text('feed_url').notNull().unique(),
  type: text('type').notNull().default('news'),
  lang: text('lang').notNull().default('en'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const toolCandidates = pgTable(
  'tool_candidates',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    url: text('url').notNull().unique(),
    description: text('description'),
    slug: text('slug').unique(),
    zh: text('zh'),
    catId: text('cat_id').references(() => categories.id),
    chinaAccess: text('china_access').notNull().default('unknown'),
    pricing: text('pricing').notNull().default('Freemium'),
    features: text('features').array(),
    sourceName: text('source_name').notNull(),
    sourceType: text('source_type').notNull().default('rss'),
    votes: integer('votes').notNull().default(0),
    hnPoints: integer('hn_points'),
    ghGainedStars: integer('gh_gained_stars'),
    aibotLikes: integer('aibot_likes'),
    hotnessScore: integer('hotness_score'),
    firstSeenAt: timestamp('first_seen_at').notNull().defaultNow(),
    // status 取值：'pending' / 'processed' / 'ai_drafted' / 'approved' / 'rejected'
    // ai_drafted = AI 已起草、待人工审核（I8.5 后由 'processed' 迁移）
    status: text('status').notNull().default('pending'),
    fetchedAt: timestamp('fetched_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
    // AI 起草的完整结构化数据（howToUse/faqs/国内用户字段等）
    aiDraft: jsonb('ai_draft').$type<{
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
    }>(),
  },
  (t) => ({
    statusIdx: index('tool_candidates_status_idx').on(t.status),
    fetchedIdx: index('tool_candidates_fetched_idx').on(t.fetchedAt),
  }),
);

export const articles = pgTable(
  'articles',
  {
    id: serial('id').primaryKey(),
    sourceId: integer('source_id').references(() => sources.id),
    title: text('title').notNull(),
    titleZh: text('title_zh'),
    url: text('url').notNull().unique(),
    summary: text('summary'),
    summaryZh: text('summary_zh'),
    aiInsights: jsonb('ai_insights').$type<{
      oneSentenceSummary?: string;
      keyPoints?: string[];
      whyItMatters?: string;
      chinaImpact?: string;
      whoShouldCare?: string[];
      relatedTools?: { id?: string; name: string; reason?: string }[];
    }>(),
    tag: text('tag'),
    publishedAt: timestamp('published_at'),
    fetchedAt: timestamp('fetched_at').notNull().defaultNow(),
    status: text('status').notNull().default('published'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
  },
  (t) => ({
    publishedIdx: index('articles_published_idx').on(t.publishedAt),
    statusIdx: index('articles_status_idx').on(t.status),
  }),
);

export const comparisons = pgTable(
  'comparisons',
  {
    id: text('id').primaryKey(),
    toolAId: text('tool_a_id').notNull(),
    toolBId: text('tool_b_id').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    body: text('body'),
    verdict: text('verdict'),
    testedAt: timestamp('tested_at'),
    testedVersion: text('tested_version'),
    testedEnv: text('tested_env'),
    testedBy: text('tested_by'),
    evalSet: text('eval_set'),
    isLabReport: boolean('is_lab_report').notNull().default(false),
    labReportId: text('lab_report_id'),
    sampleSize: text('sample_size'),
    reproducible: boolean('reproducible').default(false),
    repoUrl: text('repo_url'),
    seoKeywords: text('seo_keywords').array(),
    // status 取值：'draft' / 'published' / 'rejected'
    status: text('status').notNull().default('draft'),
    publishedAt: timestamp('published_at'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    // 审核字段：reviewedBy 是审核人（区别于上方 testedBy = 实测人）
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
  },
  (t) => ({
    statusIdx: index('comparisons_status_idx').on(t.status),
    publishedIdx: index('comparisons_published_idx').on(t.publishedAt),
  }),
);

export type Category = typeof categories.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type RepoItem = typeof githubTrending.$inferSelect;
export type ToolConnectivity = typeof toolConnectivity.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type ToolCandidate = typeof toolCandidates.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Comparison = typeof comparisons.$inferSelect;
