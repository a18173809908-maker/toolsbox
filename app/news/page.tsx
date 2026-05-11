import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { ShareButton } from '@/components/ShareButton';
import { loadArticleHotTopics, loadArticlesPage } from '@/lib/db/queries';
import { ARTICLE_CATEGORIES, normalizeArticleCategory } from '@/lib/article-categories';
import { ArticleCard } from './ArticleCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI 资讯 News',
  openGraph: {
    title: 'AI 资讯 | AIBoxPro',
  },
  alternates: { canonical: '/news' },
};

// ── Design tokens (inline, matches site palette) ─────────────────────────────
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
    loadArticleHotTopics(5, 3),
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

        <section style={{ background: C.bg, borderBottom: `1px solid ${C.rule}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(22px, 5vw, 32px) clamp(16px, 5vw, 24px) 24px' }}>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(30px, 7vw, 40px)', lineHeight: 1.18, margin: '0 0 10px', color: C.ink }}>
              AI 资讯
            </h1>
          </div>
        </section>

        {/* Articles grid */}
        <main style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(28px, 6vw, 40px) clamp(16px, 5vw, 24px) 64px' }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', color: C.inkMuted }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: 20, background: C.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: 40, height: 40 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 8px' }}>暂无相关资讯</h2>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>当前分类下暂无内容，请尝试其他分类或稍后再来</p>
              <Link href="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, padding: '10px 20px', borderRadius: 999, background: C.primary, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                返回全部资讯
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 700px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {articles.map((art) => (
                  <ArticleCard key={art.id} art={art} />
                ))}
              </div>
              <aside style={{ flex: '1 1 280px', maxWidth: 340, minWidth: 0, display: 'grid', gap: 16, position: 'sticky', top: 88 }}>
                <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h2 style={{ margin: '0 0 12px', color: C.ink, fontSize: 18, fontWeight: 850 }}>资讯分类</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link href="/news" style={{ padding: '6px 10px', borderRadius: 999, background: !activeCategory ? C.primaryBg : '#F8FAFC', color: !activeCategory ? C.accent : C.inkSoft, textDecoration: 'none', fontSize: 12, fontWeight: 750 }}>
                      最新资讯
                    </Link>
                    {ARTICLE_CATEGORIES.map((category) => {
                      const active = activeCategory === category;
                      return (
                        <Link key={category} href={`/news?tag=${encodeURIComponent(category)}`} style={{ padding: '6px 10px', borderRadius: 999, background: active ? C.primaryBg : '#F8FAFC', color: active ? C.accent : C.inkSoft, textDecoration: 'none', fontSize: 12, fontWeight: 750 }}>
                          {category}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <h2 style={{ margin: 0, color: C.ink, fontSize: 18, fontWeight: 850 }}>最近 3 天热门事件</h2>
                      <p style={{ margin: '6px 0 0', color: C.inkMuted, fontSize: 12 }}>从高热新闻里挑出具体事件</p>
                    </div>
                    <ShareButton title="AIBoxPro 最近 3 天热门事件" path="/news" compact />
                  </div>
                  {hotTopics.length === 0 ? (
                    <p style={{ margin: 0, color: C.inkMuted, fontSize: 13, lineHeight: 1.7 }}>暂无足够热点数据。</p>
                  ) : (
                    <div style={{ display: 'grid', gap: 0 }}>
                      {hotTopics.map((topic, index) => {
                        const isBurst = Number(topic.maxHotness ?? 0) >= 70;
                        return (
                          <Link
                            key={topic.topic ?? index}
                            href={`/news?tag=${encodeURIComponent(topic.topic ?? '')}`}
                            className="news-hot-topic-link"
                            style={{ display: 'grid', gridTemplateColumns: '24px minmax(0,1fr) auto', alignItems: 'start', gap: 10, padding: '12px 0', borderTop: index === 0 ? 'none' : `1px solid ${C.ruleSoft}`, color: C.ink, textDecoration: 'none', transition: 'background .15s' }}
                          >
                            <span style={{ color: C.accent, fontWeight: 900, fontSize: 14, lineHeight: 1.6 }}>{index + 1}.</span>
                            <span style={{ minWidth: 0, fontSize: 14, fontWeight: 800, lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }} title={topic.samples?.[0]}>{topic.topic}</span>
                            {isBurst && <span style={{ padding: '2px 7px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontSize: 11, fontWeight: 900 }}>爆</span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

