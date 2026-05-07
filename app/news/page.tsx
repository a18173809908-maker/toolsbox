import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { loadArticlesPage, loadArticleTags } from '@/lib/db/queries';
import { ArticleCard } from './ArticleCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI 资讯 News',
  description: '每日精选中文 AI 行业动态，来自机器之心、量子位、36氪、InfoQ 中文、虎嗅、品玩、钛媒体等中文权威来源。',
  openGraph: {
    title: 'AI 工具动态 | AIBoxPro',
    description: '每日精选中文 AI 行业动态',
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
  const [articles, tags] = await Promise.all([
    loadArticlesPage(1, 60, tag),
    loadArticleTags(),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI 工具动态 | AIBoxPro',
    description: '每日精选中文 AI 行业动态',
    url: 'https://www.aiboxpro.cn/news',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>

        <SiteHeader />

        {/* Page hero */}
        <section style={{ padding: 'clamp(36px, 7vw, 48px) clamp(16px, 5vw, 56px) 32px', background: C.bg, borderBottom: `1px solid ${C.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -80, top: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontSize: 12, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: C.primary, display: 'inline-block' }} />
              工具动态 · 每日更新
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(36px, 10vw, 52px)', lineHeight: 1, margin: '0 0 16px', color: C.ink, letterSpacing: '-0.03em' }}>
              AI <span style={{ color: C.primary }}>工具动态</span>
            </h1>
            <p style={{ fontSize: 16, color: C.inkSoft, margin: 0, lineHeight: 1.6 }}>
              聚合机器之心、量子位、36氪、InfoQ 中文、虎嗅、品玩、钛媒体等中文权威来源的 AI 行业更新，每日整理。
            </p>
          </div>
        </section>

        {/* Tag filter strip */}
        {tags.length > 0 && (
          <section style={{ background: C.bg, borderBottom: `1px solid ${C.rule}` }}>
            <div style={{ display: 'flex', gap: 8, padding: '12px clamp(16px, 5vw, 56px)', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
              <TagPill href="/news" active={!tag}>全部</TagPill>
              {tags.map((t) => (
                <TagPill key={t} href={`/news?tag=${encodeURIComponent(t)}`} active={tag === t}>{t}</TagPill>
              ))}
            </div>
          </section>
        )}

        {/* Articles grid */}
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(28px, 6vw, 40px) clamp(16px, 5vw, 56px)' }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: C.inkMuted }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
              <p style={{ fontSize: 16 }}>暂无资讯，稍后再来查看</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 20 }}>
              {articles.map((art) => (
                <ArticleCard key={art.id} art={art} />
              ))}
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
