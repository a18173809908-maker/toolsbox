import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { ShareButton } from '@/components/ShareButton';
import { loadArticleHotTopics, loadArticlesPage } from '@/lib/db/queries';
import { ARTICLE_CATEGORIES, normalizeArticleCategory } from '@/lib/article-categories';
import { ArticleCard } from './ArticleCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI 资讯 | AIBoxPro',
  description: '追踪最新 AI 工具发布、模型更新与行业动态，每 6 小时自动刷新。',
  openGraph: { title: 'AI 资讯 | AIBoxPro' },
  alternates: { canonical: '/news' },
};

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
};

type Props = { searchParams: Promise<{ tag?: string }> };

export default async function NewsPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const activeCategory = tag ? normalizeArticleCategory(tag) : null;

  const [articles, hotTopics] = await Promise.all([
    loadArticlesPage(1, 60, tag),
    loadArticleHotTopics(7, 3),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI 资讯 | AIBoxPro',
    url: 'https://www.aiboxpro.cn/news',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />

        {/* ── 页头 + 分类筛选 pill 行 ─────────────────────────────────── */}
        <section style={{ background: C.panel, borderBottom: `1px solid ${C.rule}`, position: 'sticky', top: 57, zIndex: 8 }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px clamp(16px, 5vw, 24px) 0' }}>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(24px, 5vw, 32px)', lineHeight: 1.2, margin: '0 0 14px', color: C.ink }}>
              AI 资讯
            </h1>
            {/* 分类 pill 行 — 横向滚动，移动端可 swipe */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
              <Link
                href="/news"
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                  background: !activeCategory ? C.accent : C.ruleSoft,
                  color: !activeCategory ? '#fff' : C.inkSoft,
                }}
              >
                全部
              </Link>
              {ARTICLE_CATEGORIES.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <Link
                    key={cat}
                    href={`/news?tag=${encodeURIComponent(cat)}`}
                    style={{
                      flexShrink: 0, padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                      textDecoration: 'none', whiteSpace: 'nowrap',
                      background: active ? C.accent : C.ruleSoft,
                      color: active ? '#fff' : C.inkSoft,
                    }}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 主体：文章列 + 右侧热门栏 ──────────────────────────────── */}
        <main style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 5vw, 24px) 72px' }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: C.inkMuted }}>
              <p style={{ fontSize: 16, margin: '0 0 16px' }}>该分类下暂无内容</p>
              <Link href="/news" style={{ padding: '9px 20px', borderRadius: 999, background: C.accent, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                返回全部资讯
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

              {/* 文章列 */}
              <div style={{ flex: '1 1 640px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {articles.map((art) => (
                  <ArticleCard key={art.id} art={art} />
                ))}
              </div>

              {/* 右侧：最近 3 天热门事件 */}
              <aside style={{ flex: '0 0 300px', width: 300, position: 'sticky', top: 130, display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.ruleSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: C.ink }}>最近 3 天热门</div>
                      <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>按热度排序的具体事件</div>
                    </div>
                    <ShareButton title="AIBoxPro 最近热门事件" path="/news" compact />
                  </div>

                  {hotTopics.length === 0 ? (
                    <div style={{ padding: '20px 18px', color: C.inkMuted, fontSize: 13 }}>暂无热点数据</div>
                  ) : (
                    <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {hotTopics.map((topic, i) => {
                        const isBurst = topic.maxHotness >= 70;
                        return (
                          <li key={topic.id} style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.ruleSoft}` }}>
                            <Link
                              href={`/news/${topic.id}`}
                              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 18px', textDecoration: 'none', color: C.ink }}
                            >
                              <span style={{
                                flexShrink: 0, width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 900, marginTop: 1,
                                background: i < 3 ? C.accent : C.ruleSoft,
                                color: i < 3 ? '#fff' : C.inkMuted,
                              }}>
                                {i + 1}
                              </span>
                              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                                {topic.topic}
                              </span>
                              {isBurst && (
                                <span style={{ flexShrink: 0, padding: '2px 6px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontSize: 10, fontWeight: 900, alignSelf: 'flex-start' }}>
                                  爆
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  <div style={{ padding: '10px 18px', borderTop: `1px solid ${C.ruleSoft}` }}>
                    <Link href="/events" style={{ fontSize: 13, color: C.accent, fontWeight: 700, textDecoration: 'none' }}>
                      查看完整事件追踪 →
                    </Link>
                  </div>
                </div>
              </aside>

            </div>
          )}
        </main>
      </div>
    </>
  );
}
