'use client';

import Link from 'next/link';

const C = {
  panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
};

function InsightLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.inkMuted, fontWeight: 650, whiteSpace: 'nowrap' }}>
      <span style={{ width: 4, height: 14, borderRadius: 2, background: C.primary, display: 'inline-block' }} />
      {children}
    </span>
  );
}

function relTime(iso: Date | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return '刚刚';
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export type ArticleRow = {
  id: number;
  title: string;
  titleZh: string | null;
  url: string;
  summary: string | null;
  summaryZh: string | null;
  aiInsights: {
    oneSentenceSummary?: string;
    keyPoints?: string[];
    whyItMatters?: string;
    chinaImpact?: string;
    whoShouldCare?: string[];
    relatedTools?: { id?: string; name: string; reason?: string }[];
  } | null;
  tag: string | null;
  publishedAt: Date | null;
  sourceName: string | null;
};

export function ArticleCard({ art }: { art: ArticleRow }) {
  const oneLine = art.aiInsights?.oneSentenceSummary || art.summaryZh || art.summary;
  const detailLine = [
    art.aiInsights?.keyPoints?.[0],
    art.summaryZh,
    art.summary,
    art.aiInsights?.whyItMatters,
    art.aiInsights?.chinaImpact,
  ].find((item) => item && item !== oneLine);

  return (
    <Link href={`/news/${art.id}`} style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      height: '100%',
      background: C.panel, borderRadius: 12, padding: 22,
      border: `1px solid ${C.rule}`, textDecoration: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'box-shadow .15s, border-color .15s',
    }}
    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 6px 20px -4px rgba(249,115,22,0.18)'; el.style.borderColor = C.primary; }}
    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; el.style.borderColor = C.rule; }}
    >
      {/* Title */}
      <div>
        {art.titleZh && (
          <h2 style={{ fontWeight: 750, fontSize: 18, margin: '0 0 6px', color: C.ink, lineHeight: 1.45 }}>{art.titleZh}</h2>
        )}
        <p style={{ fontSize: 13, color: art.titleZh ? C.inkMuted : C.ink, margin: 0, lineHeight: 1.5, fontWeight: art.titleZh ? 400 : 600, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{art.title}</p>
      </div>

      {/* Summary */}
      {oneLine && (
        <div style={{ display: 'grid', gap: 5, color: C.inkSoft, fontSize: 14, lineHeight: 1.65 }}>
          <p style={{ margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
            <InsightLabel>一句话摘要</InsightLabel>
            <span style={{ margin: '0 7px', color: C.rule }}>·</span>
            <span>{oneLine}</span>
          </p>
          {detailLine && (
            <p style={{ margin: 0 }}>
              <InsightLabel>详细摘要</InsightLabel>
              <span style={{ margin: '0 7px', color: C.rule }}>·</span>
              <span>{detailLine}</span>
            </p>
          )}
        </div>
      )}

      {/* Source */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12, color: C.inkMuted, marginTop: 'auto', paddingTop: 4 }}>
        <span>{relTime(art.publishedAt)}</span>
        {art.sourceName && <span style={{ padding: '4px 8px', borderRadius: 6, background: '#F8FAFC', fontWeight: 650 }}>来源 · {art.sourceName}</span>}
        <span style={{ padding: '4px 8px', borderRadius: 6, background: '#F8FAFC' }}>约 1 分钟</span>
        {art.tag && <span style={{ padding: '4px 8px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontWeight: 700 }}>{art.tag}</span>}
        {art.aiInsights?.whoShouldCare?.slice(0, 2).map((item) => (
          <span key={item} style={{ padding: '4px 8px', borderRadius: 999, background: C.ruleSoft, color: C.inkSoft, fontWeight: 650 }}>{item}</span>
        ))}
      </div>
    </Link>
  );
}
