'use client';

import Link from 'next/link';

const C = {
  panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
};

const PRICING_STYLE: Record<string, { bg: string; color: string }> = {
  Free:     { bg: '#DCFCE7', color: '#16A34A' },
  Freemium: { bg: '#FFEDD5', color: '#C2410C' },
  Paid:     { bg: '#F3F4F6', color: '#374151' },
};

type ToolRow = {
  id: string; name: string; mono: string; brand: string;
  en: string; zh: string; pricing: string; featured: boolean; publishedAt: string;
};

export function ToolCard({ tool }: { tool: ToolRow }) {
  const ps = PRICING_STYLE[tool.pricing] ?? PRICING_STYLE['Paid'];
  return (
    <Link href={`/tools/${tool.id}`} style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      background: C.panel, borderRadius: 12, padding: 22,
      border: `1px solid ${C.rule}`, textDecoration: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'box-shadow .15s, border-color .15s',
    }}
    onMouseEnter={(e) => { const el = e.currentTarget; el.style.boxShadow = '0 6px 20px -4px rgba(249,115,22,0.18)'; el.style.borderColor = C.primary; }}
    onMouseLeave={(e) => { const el = e.currentTarget; el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; el.style.borderColor = C.rule; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: tool.brand, color: '#fff',
          display: 'grid', placeItems: 'center', fontFamily: 'Georgia, serif', fontWeight: 700,
          fontSize: tool.mono.length === 1 ? 22 : 15, letterSpacing: '-0.04em', flexShrink: 0,
        }}>{tool.mono}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 17, color: C.ink }}>{tool.name}</span>
            {tool.featured && (
              <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: C.primaryBg, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pick</span>
            )}
          </div>
          <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: ps.bg, color: ps.color }}>{tool.pricing}</span>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {tool.en}
      </p>
      {tool.zh && (
        <p style={{ fontSize: 12, color: C.inkMuted, margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tool.zh}
        </p>
      )}

      {/* Footer */}
      <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${C.ruleSoft}` }}>
        收录于 {tool.publishedAt}
      </div>
    </Link>
  );
}
