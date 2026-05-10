export const ARTICLE_CATEGORIES = [
  '模型发布',
  '产品更新',
  'AI公司动态',
  '开源项目',
  '行业政策',
  '融资新闻',
  'AI应用案例',
  'AI工具更新',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

const CATEGORY_ALIASES: Record<ArticleCategory, string[]> = {
  模型发布: ['模型发布'],
  产品更新: ['产品更新', '产品评测'],
  AI公司动态: ['AI公司动态', '行业动态', '国内动态', '开发者'],
  开源项目: ['开源项目', '技术研究'],
  行业政策: ['行业政策'],
  融资新闻: ['融资新闻'],
  AI应用案例: ['AI应用案例'],
  AI工具更新: ['AI工具更新', '工具更新'],
};

const ALIAS_TO_CATEGORY = new Map<string, ArticleCategory>(
  ARTICLE_CATEGORIES.flatMap((category) => CATEGORY_ALIASES[category].map((alias) => [alias, category] as const)),
);

export function normalizeArticleCategory(value?: string | null): ArticleCategory {
  if (!value) return 'AI公司动态';
  return ALIAS_TO_CATEGORY.get(value) ?? 'AI公司动态';
}

export function articleCategoryAliases(category?: string | null): string[] {
  const normalized = normalizeArticleCategory(category);
  return CATEGORY_ALIASES[normalized];
}
