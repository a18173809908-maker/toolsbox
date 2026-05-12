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
    aiInsights: jsonb('ai_insights').$type<{
      oneSentenceSummary?: string;
      useCase?: string;
      keyPoints?: string[];
      whyTrending?: string;
      audience?: string[];
      projectType?: string;
      maturity?: string;
      chinaValue?: string;
    }>(),
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

export const sourceCandidates = pgTable(
  'source_candidates',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    url: text('url').notNull().unique(),
    feedUrl: text('feed_url'),
    sourceCategory: text('source_category').notNull(),
    lang: text('lang').notNull().default('zh'),
    status: text('status').notNull().default('candidate'),
    discoverySource: text('discovery_source').notNull().default('curated'),
    qualityScore: integer('quality_score').notNull().default(0),
    aiRelevanceScore: integer('ai_relevance_score').notNull().default(0),
    toolRelevanceScore: integer('tool_relevance_score').notNull().default(0),
    updateFrequency: text('update_frequency'),
    evidence: jsonb('evidence').$type<{
      recentTitles?: string[];
      aiRelatedCount?: number;
      toolRelatedCount?: number;
      notes?: string[];
    }>(),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index('source_candidates_status_idx').on(t.status),
    categoryIdx: index('source_candidates_category_idx').on(t.sourceCategory),
    scoreIdx: index('source_candidates_score_idx').on(t.qualityScore),
  }),
);

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
    hotnessScore: integer('hotness_score').notNull().default(0),
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
    hotnessIdx: index('articles_hotness_idx').on(t.hotnessScore),
    statusIdx: index('articles_status_idx').on(t.status),
  }),
);

export const comparisons = pgTable(
  'comparisons',
  {
    id: text('id').primaryKey(),
    toolAId: text('tool_a_id').notNull(),
    toolBId: text('tool_b_id').notNull(),
    // T2.1: N-tool support — prefer toolIds when present, fall back to [toolAId, toolBId]
    toolIds: text('tool_ids').array(),
    verdictOneLiner: text('verdict_one_liner'),
    mentions: jsonb('mentions').$type<{ name: string; url: string }[]>(),
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
    // cellWinners: dim label -> toolId or "tie"
    cellWinners: jsonb('cell_winners').$type<Record<string, string>>(),
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

// ── Tool Verdicts（立场字段，独立表，保留历史版本） ──────────────────────────

export const toolVerdicts = pgTable(
  'tool_verdicts',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    toolId: text('tool_id').notNull().references(() => tools.id),

    // 立场字段（schema 与 prompts/tool-verdict/v1.md 输出对齐）
    verdictOneLiner: text('verdict_one_liner').notNull(),
    whoShouldPick: text('who_should_pick').array(),
    whoShouldSkip: text('who_should_skip').array(),
    vsAlternatives: jsonb('vs_alternatives').$type<{ alt: string; point: string }[]>(),
    // positionToday 枚举：'国际第一梯队' | '国产第一梯队' | '仍领先' | '已被超越' | '观察中' | '小众但有差异化'
    positionToday: text('position_today'),
    caveats: text('caveats').array(),

    // 起草元信息
    promptVersion: text('prompt_version').notNull(),
    llmModel: text('llm_model').notNull(),
    antiClicheScore: integer('anti_cliche_score'),

    // 审核状态：'ai_drafted' | 'published' | 'rejected'
    status: text('status').notNull().default('ai_drafted'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),

    // 时效（默认 180 天后过期，进 audit:freshness 重审队列）
    verdictUpdatedAt: timestamp('verdict_updated_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    toolIdx: index('tool_verdicts_tool_idx').on(t.toolId),
    statusIdx: index('tool_verdicts_status_idx').on(t.status),
    expiresIdx: index('tool_verdicts_expires_idx').on(t.expiresAt),
  }),
);

// ── Events（事件主表）───────────────────────────────────────────────────────────

export const events = pgTable(
  'events',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    summary: text('summary'),
    body: text('body'),
    articleIds: integer('article_ids').array(),
    promptVersion: text('prompt_version'),
    llmModel: text('llm_model'),
    antiClicheScore: integer('anti_cliche_score'),
    // status: 'ai_drafted' | 'published' | 'rejected'
    status: text('status').notNull().default('ai_drafted'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index('events_status_idx').on(t.status),
    slugIdx: index('events_slug_idx').on(t.slug),
  }),
);

// ── Event Verdicts（事件立场字段）────────────────────────────────────────────────

export const eventVerdicts = pgTable(
  'event_verdicts',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    eventId: text('event_id').notNull().references(() => events.id),
    verdictOneLiner: text('verdict_one_liner').notNull(),
    whoShouldCare: text('who_should_care').array(),
    // impactLevel: '颠覆性' | '重要' | '值得关注' | '炒作居多'
    impactLevel: text('impact_level'),
    chinaImpact: text('china_impact'),
    relatedTools: jsonb('related_tools').$type<{ id: string; reason: string }[]>(),
    caveats: text('caveats').array(),
    promptVersion: text('prompt_version').notNull(),
    llmModel: text('llm_model').notNull(),
    antiClicheScore: integer('anti_cliche_score'),
    status: text('status').notNull().default('ai_drafted'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    eventIdx: index('event_verdicts_event_idx').on(t.eventId),
    statusIdx: index('event_verdicts_status_idx').on(t.status),
  }),
);

// ── Draft Tables（内容起草表，统一 ai_drafted→published/rejected 三态流）──────────
// 每张表持有 aiDraft jsonb，审核通过后写入对应主表。

export const comparisonDrafts = pgTable(
  'comparison_drafts',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    slug: text('slug').notNull(),
    sourceData: jsonb('source_data'),
    aiDraft: jsonb('ai_draft'),
    promptVersion: text('prompt_version').notNull(),
    llmModel: text('llm_model').notNull(),
    antiClicheScore: integer('anti_cliche_score'),
    status: text('status').notNull().default('ai_drafted'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
  },
  (t) => ({
    statusIdx: index('comparison_drafts_status_idx').on(t.status),
    slugIdx: index('comparison_drafts_slug_idx').on(t.slug),
  }),
);

export const sceneDrafts = pgTable(
  'scene_drafts',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    slug: text('slug').notNull(),
    sourceData: jsonb('source_data'),
    aiDraft: jsonb('ai_draft'),
    promptVersion: text('prompt_version').notNull(),
    llmModel: text('llm_model').notNull(),
    antiClicheScore: integer('anti_cliche_score'),
    status: text('status').notNull().default('ai_drafted'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
  },
  (t) => ({
    statusIdx: index('scene_drafts_status_idx').on(t.status),
  }),
);

export const rankingDrafts = pgTable(
  'ranking_drafts',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    slug: text('slug').notNull(),
    sourceData: jsonb('source_data'),
    aiDraft: jsonb('ai_draft'),
    promptVersion: text('prompt_version').notNull(),
    llmModel: text('llm_model').notNull(),
    antiClicheScore: integer('anti_cliche_score'),
    status: text('status').notNull().default('ai_drafted'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
  },
  (t) => ({
    statusIdx: index('ranking_drafts_status_idx').on(t.status),
  }),
);

export const alternativeDrafts = pgTable(
  'alternative_drafts',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    slug: text('slug').notNull(),
    sourceData: jsonb('source_data'),
    aiDraft: jsonb('ai_draft'),
    promptVersion: text('prompt_version').notNull(),
    llmModel: text('llm_model').notNull(),
    antiClicheScore: integer('anti_cliche_score'),
    status: text('status').notNull().default('ai_drafted'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
  },
  (t) => ({
    statusIdx: index('alternative_drafts_status_idx').on(t.status),
  }),
);

export const toolFieldDrafts = pgTable(
  'tool_field_drafts',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    slug: text('slug').notNull(),
    sourceData: jsonb('source_data'),
    aiDraft: jsonb('ai_draft'),
    promptVersion: text('prompt_version').notNull(),
    llmModel: text('llm_model').notNull(),
    antiClicheScore: integer('anti_cliche_score'),
    status: text('status').notNull().default('ai_drafted'),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
  },
  (t) => ({
    statusIdx: index('tool_field_drafts_status_idx').on(t.status),
  }),
);

export const repoSpotlights = pgTable(
  'repo_spotlights',
  {
    id: serial('id').primaryKey(),
    trendingId: integer('trending_id').notNull().references(() => githubTrending.id),
    repo: text('repo').notNull(),
    snapshotWeek: text('snapshot_week').notNull(), // 'YYYY-WW' dedup key
    rankInWeek: integer('rank_in_week').notNull().default(1),
    youtubeResults: jsonb('youtube_results').$type<
      { title: string; description: string; videoId: string }[]
    >(),
    searchResults: jsonb('search_results').$type<
      { title: string; snippet: string; url: string }[]
    >(),
    titleZh: text('title_zh'),
    body: text('body'),
    status: text('status').notNull().default('ai_drafted'), // ai_drafted | published | rejected
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    weekRepoIdx: index('repo_spotlights_week_repo_idx').on(t.snapshotWeek, t.repo),
    statusIdx: index('repo_spotlights_status_idx').on(t.status),
  }),
);

export type Category = typeof categories.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type RepoItem = typeof githubTrending.$inferSelect;
export type ToolConnectivity = typeof toolConnectivity.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type SourceCandidate = typeof sourceCandidates.$inferSelect;
export type ToolCandidate = typeof toolCandidates.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Comparison = typeof comparisons.$inferSelect;
export type ToolVerdict = typeof toolVerdicts.$inferSelect;
export type Event = typeof events.$inferSelect;
export type EventVerdict = typeof eventVerdicts.$inferSelect;
export type ComparisonDraft = typeof comparisonDrafts.$inferSelect;
export type SceneDraft = typeof sceneDrafts.$inferSelect;
export type RankingDraft = typeof rankingDrafts.$inferSelect;
export type AlternativeDraft = typeof alternativeDrafts.$inferSelect;
export type ToolFieldDraft = typeof toolFieldDrafts.$inferSelect;
export type RepoSpotlight = typeof repoSpotlights.$inferSelect;
