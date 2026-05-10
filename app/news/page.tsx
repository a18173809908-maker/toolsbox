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
  description: '每天整理值得关注的 AI 产品、模型、开源项目和行业变化。',
  openGraph: {
    title: 'AI 资讯 | AIBoxPro',
    description: '每天整理值得关注的 AI 产品、模型、开源项目和行业变化。',
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
    description: '每天整理值得关注的 AI 产品、模型、开源项目和行业变化。',
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
            <p style={{ fontSize: 15, color: C.inkSoft, margin: 0, lineHeight: 1.7, maxWidth: 760 }}>
              每天整理值得关注的 AI 产品、模型、开源项目和行业变化。
            </p>
          </div>
        </section>

        {/* Articles grid */}
        <main style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(28px, 6vw, 40px) clamp(16px, 5vw, 24px) 64px' }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: C.inkMuted }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
              <p style={{ fontSize: 16 }}>暂无资讯，稍后再来查看</p>
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
                          <div key={topic.topic ?? index} style={{ display: 'grid', gridTemplateColumns: '24px minmax(0,1fr) auto', alignItems: 'start', gap: 10, padding: '12px 0', borderTop: index === 0 ? 'none' : `1px solid ${C.ruleSoft}`, color: C.ink }}>
                            <span style={{ color: C.accent, fontWeight: 900, fontSize: 14, lineHeight: 1.6 }}>{index + 1}.</span>
                            <span style={{ minWidth: 0, fontSize: 14, fontWeight: 800, lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }} title={topic.samples?.[0]}>{topic.topic}</span>
                            {isBurst && <span style={{ padding: '2px 7px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontSize: 11, fontWeight: 900 }}>爆</span>}
                          </div>
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

