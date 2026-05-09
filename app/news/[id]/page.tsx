import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { loadArticleById } from '@/lib/db/queries';

export const revalidate = 3600;

const BASE = 'https://aiboxpro.cn';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const art = await loadArticleById(Number(id));
  if (!art) return { title: 'Not Found' };
  const title = art.titleZh || art.title;
  const desc = art.aiInsights?.oneSentenceSummary || art.summaryZh || art.summary || art.title;
  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | AIBoxPro`,
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 24, marginTop: 24 }}>
      <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16, fontWeight: 600, color: C.inkSoft, margin: '0 0 14px' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const art = await loadArticleById(Number(id));
  if (!art) notFound();
  const insights = art.aiInsights;
  const description = insights?.oneSentenceSummary || art.summaryZh || art.summary || art.title;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: art.titleZh || art.title,
    description,
    url: art.url,
    datePublished: art.publishedAt?.toISOString(),
    publisher: { '@type': 'Organization', name: art.sourceName ?? 'AIBoxPro' },
    isPartOf: { '@type': 'WebSite', name: 'AIBoxPro', url: BASE },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>

        <SiteHeader />

        {/* Article */}
        <main style={{ maxWidth: 760, margin: 'clamp(28px, 7vw, 48px) auto', padding: '0 clamp(16px, 5vw, 24px) 64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.inkMuted, fontSize: 13, marginBottom: 18, minWidth: 0 }}>
            <Link href="/news" style={{ color: C.inkMuted, textDecoration: 'none' }}>AI 资讯</Link>
            <span>/</span>
            <span style={{ color: C.ink, fontWeight: 600, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {art.titleZh || art.title}
            </span>
          </div>
          <article style={{ background: C.panel, borderRadius: 16, border: `1px solid ${C.rule}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 'clamp(24px, 6vw, 40px) clamp(18px, 6vw, 48px)' }}>

            {/* Tag + meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
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
              <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(26px, 7vw, 32px)', lineHeight: 1.3, margin: '0 0 12px', color: C.ink, letterSpacing: '-0.02em' }}>
                {art.titleZh}
              </h1>
            )}

            {/* Original title */}
            <p style={{ fontSize: art.titleZh ? 15 : 24, color: art.titleZh ? C.inkMuted : C.ink, margin: '0 0 28px', fontWeight: art.titleZh ? 400 : 700, lineHeight: 1.5 }}>
              {art.title}
            </p>

            {/* AI reading brief */}
            {(description || insights) && (
              <Section title="一句话摘要">
                <div style={{ background: C.bg, borderRadius: 10, padding: 'clamp(14px, 4vw, 16px) clamp(16px, 5vw, 20px)', borderLeft: `3px solid ${C.primary}` }}>
                  <p style={{ fontSize: 17, color: C.ink, lineHeight: 1.75, margin: 0, fontWeight: 650 }}>{description}</p>
                </div>
              </Section>
            )}

            {insights?.keyPoints && insights.keyPoints.length > 0 && (
              <Section title="关键信息">
                <ul style={{ display: 'grid', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
                  {insights.keyPoints.slice(0, 4).map((item) => (
                    <li key={item} style={{ display: 'flex', gap: 10, fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: C.primary, marginTop: 10, flex: '0 0 auto' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {insights?.whyItMatters && (
              <Section title="为什么重要">
                <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.8, margin: 0 }}>{insights.whyItMatters}</p>
              </Section>
            )}

            {insights?.chinaImpact && (
              <Section title="对中文用户的影响">
                <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.8, margin: 0 }}>{insights.chinaImpact}</p>
              </Section>
            )}

            {insights?.whoShouldCare && insights.whoShouldCare.length > 0 && (
              <Section title="适合谁关注">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {insights.whoShouldCare.map((item) => (
                    <span key={item} style={{ padding: '6px 10px', borderRadius: 6, background: C.primaryBg, color: C.accent, fontSize: 12, fontWeight: 700 }}>
                      {item}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {insights?.relatedTools && insights.relatedTools.length > 0 && (
              <Section title="相关工具">
                <div style={{ display: 'grid', gap: 10 }}>
                  {insights.relatedTools.slice(0, 5).map((tool) => {
                    const content = (
                      <>
                        <span style={{ fontWeight: 750, color: C.ink }}>{tool.name}</span>
                        {tool.reason && <span style={{ color: C.inkMuted }}>{tool.reason}</span>}
                      </>
                    );
                    return tool.id ? (
                      <Link key={`${tool.id}-${tool.name}`} href={`/tools/${tool.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 12, borderRadius: 8, border: `1px solid ${C.ruleSoft}`, background: C.bg, textDecoration: 'none', fontSize: 13, lineHeight: 1.55 }}>
                        {content}
                      </Link>
                    ) : (
                      <div key={tool.name} style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 12, borderRadius: 8, border: `1px solid ${C.ruleSoft}`, background: C.bg, fontSize: 13, lineHeight: 1.55 }}>
                        {content}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {art.summary && (
              <Section title="原始摘要">
                <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.7, margin: 0 }}>{art.summary}</p>
              </Section>
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
