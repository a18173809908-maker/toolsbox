import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadArticleById } from '@/lib/db/queries';

export const revalidate = 3600;

const BASE = 'https://aiboxpro.cn';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const art = await loadArticleById(Number(id));
  if (!art) return { title: 'Not Found' };
  const title = art.titleZh || art.title;
  const desc = art.summaryZh || art.summary || art.title;
  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | AiToolsBox`,
      description: desc,
      url: `${BASE}/news/${id}`,
      type: 'article',
      images: [`${BASE}/og?type=news&title=${encodeURIComponent(title.slice(0, 70))}${art.tag ? `&tag=${encodeURIComponent(art.tag)}` : ''}`],
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: `/news/${id}` },
  };
}

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
};

function fmt(iso: Date | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const art = await loadArticleById(Number(id));
  if (!art) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: art.titleZh || art.title,
    description: art.summaryZh || art.summary,
    url: art.url,
    datePublished: art.publishedAt?.toISOString(),
    publisher: { '@type': 'Organization', name: art.sourceName ?? 'AiToolsBox' },
    isPartOf: { '@type': 'WebSite', name: 'AiToolsBox', url: BASE },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>

        {/* Top bar */}
        <header style={{ padding: '16px 48px', borderBottom: `1px solid ${C.rule}`, background: C.panel, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 16, fontStyle: 'italic' }}>A</div>
              <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 17, color: C.ink }}>AiToolsBox</span>
            </Link>
            <span style={{ color: C.inkMuted }}>/</span>
            <Link href="/news" style={{ color: C.inkMuted, fontSize: 14, textDecoration: 'none' }}>AI 资讯</Link>
            <span style={{ color: C.inkMuted }}>/</span>
            <span style={{ color: C.ink, fontSize: 14, fontWeight: 500, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {art.titleZh || art.title}
            </span>
          </div>
          <Link href="/news" style={{ fontSize: 13, color: C.inkSoft, textDecoration: 'none' }}>← 返回资讯列表</Link>
        </header>

        {/* Article */}
        <main style={{ maxWidth: 760, margin: '48px auto', padding: '0 24px 64px' }}>
          <article style={{ background: C.panel, borderRadius: 16, border: `1px solid ${C.rule}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '40px 48px' }}>

            {/* Tag + meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              {art.tag && (
                <span style={{ padding: '3px 10px', borderRadius: 4, background: C.primaryBg, color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{art.tag}</span>
              )}
              {art.publishedAt && (
                <span style={{ fontSize: 13, color: C.inkMuted }}>{fmt(art.publishedAt)}</span>
              )}
              {art.sourceName && (
                <span style={{ fontSize: 13, color: C.inkMuted, marginLeft: 'auto' }}>来源：{art.sourceName}</span>
              )}
            </div>

            {/* Chinese title */}
            {art.titleZh && (
              <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 32, lineHeight: 1.3, margin: '0 0 12px', color: C.ink, letterSpacing: '-0.02em' }}>
                {art.titleZh}
              </h1>
            )}

            {/* Original title */}
            <p style={{ fontSize: art.titleZh ? 15 : 24, color: art.titleZh ? C.inkMuted : C.ink, margin: '0 0 28px', fontWeight: art.titleZh ? 400 : 700, lineHeight: 1.5 }}>
              {art.title}
            </p>

            {/* Summary */}
            {(art.summaryZh || art.summary) && (
              <div style={{ borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 24, marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16, fontWeight: 600, color: C.inkSoft, margin: '0 0 14px' }}>摘要 · Summary</h2>
                {art.summaryZh && (
                  <div style={{ background: C.bg, borderRadius: 10, padding: '16px 20px', borderLeft: `3px solid ${C.primary}`, marginBottom: 14 }}>
                    <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75, margin: 0 }}>{art.summaryZh}</p>
                  </div>
                )}
                {art.summary && (
                  <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.7, margin: 0 }}>{art.summary}</p>
                )}
              </div>
            )}

            {/* CTA to original */}
            <div style={{ borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href={art.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px',
                borderRadius: 999, background: C.primary, color: '#fff',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                阅读原文 ↗
              </a>
              <Link href="/news" style={{ fontSize: 13, color: C.inkSoft, textDecoration: 'none' }}>← 返回资讯列表</Link>
            </div>
          </article>
        </main>
      </div>
    </>
  );
}
