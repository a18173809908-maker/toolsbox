import { pgTable, text, integer, boolean, timestamp, serial, index } from 'drizzle-orm/pg-core';

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
    featured: boolean('featured').notNull().default(false),
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

export type Category = typeof categories.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type RepoItem = typeof githubTrending.$inferSelect;
