'use client';

const C = {
  panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
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
  tag: string | null;
  publishedAt: Date | null;
  sourceName: string | null;
};

export function ArticleCard({ art }: { art: ArticleRow }) {
  return (
    <a href={art.url} target="_blank" rel="noopener noreferrer" style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      background: C.panel, borderRadius: 12, padding: 22,
      border: `1px solid ${C.rule}`, textDecoration: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'box-shadow .15s, border-color .15s',
    }}
    onMouseEnter={(e) => { const el = e.currentTarget; el.style.boxShadow = '0 6px 20px -4px rgba(249,115,22,0.18)'; el.style.borderColor = C.primary; }}
    onMouseLeave={(e) => { const el = e.currentTarget; el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; el.style.borderColor = C.rule; }}
    >
      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {art.tag && (
          <span style={{ padding: '2px 8px', borderRadius: 4, background: C.primaryBg, color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{art.tag}</span>
        )}
        <span style={{ fontSize: 11, color: C.inkMuted, marginLeft: 'auto' }}>{relTime(art.publishedAt)}</span>
      </div>

      {/* Title */}
      <div>
        {art.titleZh && (
          <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 17, margin: '0 0 5px', color: C.ink, lineHeight: 1.4, letterSpacing: '-0.01em' }}>{art.titleZh}</h2>
        )}
        <p style={{ fontSize: 13, color: art.titleZh ? C.inkMuted : C.ink, margin: 0, lineHeight: 1.5, fontWeight: art.titleZh ? 400 : 600 }}>{art.title}</p>
      </div>

      {/* Summary */}
      {(art.summaryZh || art.summary) && (
        <p style={{ fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.6, borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 12 }}>
          {art.summaryZh || art.summary}
        </p>
      )}

      {/* Source */}
      {art.sourceName && (
        <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${C.ruleSoft}` }}>
          来源 · {art.sourceName} ↗
        </div>
      )}
    </a>
  );
}
