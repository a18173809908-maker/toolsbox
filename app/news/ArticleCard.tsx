'use client';

import Link from 'next/link';
import { ShareButton } from '@/components/ShareButton';

const C = {
  panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
  accentSoft: '#D8C6AA',
};

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
  hotnessScore?: number;
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

  const href = `/news/${art.id}`;
  const isBurst = (art.hotnessScore ?? 0) >= 70;

  return (
    <article style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      background: C.panel, borderRadius: 10, padding: '22px 26px',
      border: `1px solid ${C.rule}`,
      borderLeft: `4px solid ${isBurst ? C.accentSoft : C.rule}`,
      textDecoration: 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.035)',
      transition: 'box-shadow .15s, transform .15s',
    }}
    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 24px -8px rgba(31,41,55,0.18)'; el.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; el.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ width: 12, height: 12, borderRadius: 4, border: `2px solid ${C.accentSoft}`, marginTop: 8, flex: '0 0 auto', transform: 'rotate(45deg)' }} />
        <Link href={href} style={{ textDecoration: 'none', display: 'block', flex: 1, minWidth: 0 }}>
          <h2 style={{ fontWeight: 850, fontSize: 20, margin: 0, color: C.ink, lineHeight: 1.42, overflowWrap: 'anywhere' }}>
            {art.titleZh || art.title}
          </h2>
        </Link>
        <ShareButton
          title={art.titleZh || art.title}
          text={oneLine ?? undefined}
          path={href}
          compact
        />
      </div>

      {/* Summary */}
      {oneLine && (
        <p style={{ margin: 0, color: C.inkSoft, fontSize: 15, lineHeight: 1.85, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const }}>
          <span style={{ color: C.inkMuted, fontWeight: 850 }}>一句话摘要</span>
          <span style={{ margin: '0 7px', color: C.rule }}>·</span>
          <span>{oneLine}</span>
          {detailLine && (
            <>
              <span style={{ margin: '0 12px', color: C.rule }}> / </span>
              <span style={{ color: C.inkMuted, fontWeight: 850 }}>详细摘要</span>
              <span style={{ margin: '0 7px', color: C.rule }}>·</span>
              <span>{detailLine}</span>
            </>
          )}
        </p>
      )}

      {/* Source */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13, color: C.inkMuted, marginTop: 2 }}>
        {isBurst && <span style={{ padding: '4px 9px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontSize: 12, fontWeight: 900 }}>爆点</span>}
        <span>{relTime(art.publishedAt)}</span>
        {art.sourceName && <span style={{ padding: '4px 8px', borderRadius: 6, background: '#F8FAFC', fontWeight: 650 }}>{art.sourceName}</span>}
        <span style={{ padding: '4px 8px', borderRadius: 6, background: '#F8FAFC' }}>约 1 分钟</span>
        {art.tag && <span style={{ padding: '4px 8px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontWeight: 700 }}>{art.tag}</span>}
        {art.aiInsights?.whoShouldCare?.slice(0, 2).map((item) => (
          <span key={item} style={{ padding: '4px 8px', borderRadius: 999, background: C.ruleSoft, color: C.inkSoft, fontWeight: 650 }}>{item}</span>
        ))}
      </div>
    </article>
  );
}
