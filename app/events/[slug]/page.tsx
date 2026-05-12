import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { loadEventBySlug, loadAllEventSlugs, loadEventVerdictByEventId, loadToolsByIds } from '@/lib/db/queries';

export const revalidate = 3600;

const BASE = 'https://www.aiboxpro.cn';

const C = {
  bg: '#F9FAFB',
  panel: '#FFFFFF',
  ink: '#1F2937',
  inkSoft: '#4B5563',
  inkMuted: '#9CA3AF',
  rule: '#E5E7EB',
  ruleSoft: '#F3F4F6',
  accent: '#7C3AED',
  accentBg: '#F5F3FF',
  successBg: '#DCFCE7',
  success: '#166534',
  warnBg: '#FFF7ED',
  warn: '#C2410C',
  warnRule: '#FDE8D0',
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) return [];
  const slugs = await loadAllEventSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ev = await loadEventBySlug(slug);
  if (!ev) return { title: 'Not Found' };
  return {
    title: `${ev.title} | AIBoxPro 事件追踪`,
    description: ev.summary ?? ev.title,
    alternates: { canonical: `/events/${slug}` },
    openGraph: {
      title: ev.title,
      description: ev.summary ?? ev.title,
      url: `${BASE}/events/${slug}`,
      type: 'article',
    },
  };
}

function renderMarkdown(body: string) {
  // Simple inline markdown → HTML (bold, code, links, line breaks)
  // We render body as paragraphs split by \n\n or headers
  const lines = body.split('\n');
  const rendered: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { rendered.push(<div key={key++} style={{ height: 8 }} />); continue; }
    if (trimmed.startsWith('### ')) {
      rendered.push(<h3 key={key++} style={{ margin: '20px 0 8px', fontSize: 16, fontWeight: 800, color: C.ink }}>{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith('## ')) {
      rendered.push(<h2 key={key++} style={{ margin: '24px 0 10px', fontSize: 18, fontWeight: 800, color: C.ink }}>{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith('- ')) {
      rendered.push(
        <div key={key++} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <span style={{ color: C.accent, flexShrink: 0, marginTop: 2 }}>•</span>
          <span style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>{inlineFormat(trimmed.slice(2))}</span>
        </div>
      );
    } else {
      rendered.push(<p key={key++} style={{ margin: '0 0 12px', fontSize: 15, color: C.inkSoft, lineHeight: 1.75 }}>{inlineFormat(trimmed)}</p>);
    }
  }
  return rendered;
}

function inlineFormat(text: string): React.ReactNode {
  // Handle **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: C.ink }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ background: C.ruleSoft, padding: '1px 5px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

const IMPACT_STYLE: Record<string, { bg: string; color: string }> = {
  '颠覆性': { bg: '#FEE2E2', color: '#991B1B' },
  '重要':   { bg: '#FEF3C7', color: '#92400E' },
  '值得关注': { bg: C.accentBg, color: C.accent },
  '炒作居多': { bg: C.ruleSoft, color: C.inkMuted },
};

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!process.env.DATABASE_URL) notFound();

  const ev = await loadEventBySlug(slug);
  if (!ev) notFound();

  const verdict = await loadEventVerdictByEventId(ev.id);

  // Load related tools from verdict if available
  const relatedToolIds = (verdict?.relatedTools ?? []).map((t) => t.id).filter(Boolean) as string[];
  const relatedTools = relatedToolIds.length > 0 ? await loadToolsByIds(relatedToolIds) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: ev.title,
    description: ev.summary,
    url: `${BASE}/events/${slug}`,
    datePublished: ev.publishedAt?.toISOString(),
    dateModified: ev.updatedAt.toISOString(),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />
        <main style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
          <Link href="/events" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>← 返回事件列表</Link>

          {/* Hero */}
          <section style={{ marginTop: 24, marginBottom: 28 }}>
            <p style={{ margin: '0 0 10px', color: C.accent, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI 事件追踪</p>
            <h1 style={{ margin: '0 0 14px', color: C.ink, fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 900, lineHeight: 1.2 }}>
              {ev.title}
            </h1>
            {ev.summary && (
              <p style={{ margin: '0 0 14px', maxWidth: 720, color: C.inkSoft, fontSize: 16, lineHeight: 1.75 }}>{ev.summary}</p>
            )}
            {ev.publishedAt && (
              <div style={{ fontSize: 13, color: C.inkMuted }}>
                发布于 {new Date(ev.publishedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            )}
          </section>

          {/* Verdict block */}
          {verdict && (
            <section style={{ background: C.warnBg, border: `1px solid ${C.warnRule}`, borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, flex: 1 }}>{verdict.verdictOneLiner}</div>
                {verdict.impactLevel && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0,
                    ...(IMPACT_STYLE[verdict.impactLevel] ?? { bg: C.accentBg, color: C.accent }),
                    background: IMPACT_STYLE[verdict.impactLevel]?.bg ?? C.accentBg,
                    color: IMPACT_STYLE[verdict.impactLevel]?.color ?? C.accent,
                  }}>
                    {verdict.impactLevel}
                  </span>
                )}
              </div>
              {verdict.chinaImpact && (
                <div style={{ fontSize: 14, color: C.inkSoft, marginBottom: 12, lineHeight: 1.65 }}>
                  <strong style={{ color: C.ink }}>国内影响：</strong>{verdict.chinaImpact}
                </div>
              )}
              {verdict.whoShouldCare && verdict.whoShouldCare.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>关注人群</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {verdict.whoShouldCare.map((w) => (
                      <span key={w} style={{ padding: '3px 10px', background: C.successBg, color: C.success, borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Body */}
          {ev.body && (
            <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 'clamp(20px, 4vw, 28px)', marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 20, fontWeight: 800, color: C.ink }}>事件详情</h2>
              <div>{renderMarkdown(ev.body)}</div>
            </section>
          )}

          {/* Related tools */}
          {relatedTools.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 800, color: C.ink }}>相关工具</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 10, textDecoration: 'none', color: C.ink }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{tool.name}</span>
                    <span style={{ fontSize: 12, color: C.inkMuted }}>{tool.pricing}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Caveats */}
          {verdict?.caveats && verdict.caveats.length > 0 && (
            <section style={{ background: C.ruleSoft, border: `1px solid ${C.rule}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.inkMuted, marginBottom: 10 }}>注意事项</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
                {verdict.caveats.map((c, i) => (
                  <li key={i} style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.65, display: 'flex', gap: 8 }}>
                    <span style={{ color: C.inkMuted }}>⚠</span>{c}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
