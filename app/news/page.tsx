import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { ShareButton } from '@/components/ShareButton';
import { loadArticleHotTopics, loadArticlesPage, loadArticleTags } from '@/lib/db/queries';
import { ArticleCard } from './ArticleCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI 资讯 News',
  description: '按最新时间展示 AI 工具、模型与开源动态，爆点和热点优先浮出。',
  openGraph: {
    title: 'AI 工具动态 | AIBoxPro',
    description: '按最新时间展示 AI 工具、模型与开源动态，爆点和热点优先浮出',
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
  const [articles, tags, hotTopics] = await Promise.all([
    loadArticlesPage(1, 60, tag),
    loadArticleTags(),
    loadArticleHotTopics(5, 3),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI 工具动态 | AIBoxPro',
    description: '按最新时间展示 AI 工具、模型与开源动态，爆点和热点优先浮出',
    url: 'https://www.aiboxpro.cn/news',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>

        <SiteHeader />

        <section style={{ background: C.bg, borderBottom: `1px solid ${C.rule}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(22px, 5vw, 32px) clamp(16px, 5vw, 24px) 24px' }}>
            <p style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: '0 0 10px', color: C.accent, fontSize: 12, fontWeight: 800 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: C.primary, display: 'inline-block' }} />
              AI 资讯
            </p>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(28px, 7vw, 36px)', lineHeight: 1.18, margin: '0 0 8px', color: C.ink }}>
              AI 工具动态
            </h1>
            <p style={{ fontSize: 15, color: C.inkSoft, margin: 0, lineHeight: 1.7, maxWidth: 760 }}>
              最新优先展示 AI 工具、模型与开源动态，爆点和热点优先浮出。
            </p>
          </div>
        </section>

        {/* Tag filter strip */}
        {tags.length > 0 && (
          <section style={{ background: C.bg, borderBottom: `1px solid ${C.rule}` }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 8, padding: '12px clamp(16px, 5vw, 24px)', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
              <TagPill href="/news" active={!tag}>全部</TagPill>
              {tags.map((t) => (
                <TagPill key={t} href={`/news?tag=${encodeURIComponent(t)}`} active={tag === t}>{t}</TagPill>
              ))}
            </div>
          </section>
        )}

        {/* Articles grid */}
        <main style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(28px, 6vw, 40px) clamp(16px, 5vw, 24px) 64px' }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: C.inkMuted }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
              <p style={{ fontSize: 16 }}>暂无资讯，稍后再来查看</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 700px', minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 20 }}>
                {articles.map((art) => (
                  <ArticleCard key={art.id} art={art} />
                ))}
              </div>
              <aside style={{ flex: '1 1 280px', maxWidth: 340, minWidth: 0, display: 'grid', gap: 16, position: 'sticky', top: 88 }}>
                <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <h2 style={{ margin: 0, color: C.ink, fontSize: 18, fontWeight: 850 }}>最近 3 天热门话题</h2>
                      <p style={{ margin: '6px 0 0', color: C.inkMuted, fontSize: 12 }}>按热度、提及量和更新时间综合排序</p>
                    </div>
                    <ShareButton title="AIBoxPro 最近 3 天热门话题" path="/news" compact />
                  </div>
                  {hotTopics.length === 0 ? (
                    <p style={{ margin: 0, color: C.inkMuted, fontSize: 13, lineHeight: 1.7 }}>暂无足够话题数据。</p>
                  ) : (
                    <div style={{ display: 'grid', gap: 0 }}>
                      {hotTopics.map((topic, index) => {
                        const isBurst = Number(topic.maxHotness ?? 0) >= 70;
                        return (
                          <div key={topic.topic ?? index} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: index === 0 ? 'none' : `1px solid ${C.ruleSoft}`, color: C.ink }}>
                            <span style={{ color: C.accent, fontWeight: 900, fontSize: 14, width: 20 }}>{index + 1}.</span>
                            <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={topic.samples?.[0]}>{topic.topic}</span>
                            {isBurst && <span style={{ padding: '2px 7px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontSize: 11, fontWeight: 900 }}>爆</span>}
                            <span style={{ padding: '2px 7px', borderRadius: 999, background: '#F8FAFC', color: C.inkMuted, fontSize: 11, fontWeight: 800 }}>{topic.count} 条</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 14, padding: 20 }}>
                  <h2 style={{ margin: '0 0 8px', color: C.ink, fontSize: 18, fontWeight: 850 }}>稍后会补</h2>
                  <p style={{ margin: 0, color: C.inkSoft, fontSize: 13, lineHeight: 1.75 }}>
                    收藏、订阅和 RSS 管理会晚一点做。现在先把每天值得看的内容整理清楚。
                  </p>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TagPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      textDecoration: 'none', whiteSpace: 'nowrap',
      background: active ? C.primary : C.panel,
      color: active ? '#fff' : C.inkSoft,
      outline: active ? 'none' : `1px solid ${C.rule}`,
      boxShadow: active ? '0 2px 8px rgba(249,115,22,0.25)' : '0 1px 2px rgba(0,0,0,0.04)',
    }}>{children}</Link>
  );
}
