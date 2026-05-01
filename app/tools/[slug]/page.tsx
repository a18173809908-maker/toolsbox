import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadToolById, loadAllToolIds, loadToolsByCategory } from '@/lib/db/queries';

export const revalidate = 3600; // ISR — regenerate hourly

const BASE = 'https://aiboxpro.cn';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const ids = await loadAllToolIds();
  return ids.map((id) => ({ slug: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await loadToolById(slug);
  if (!tool) return { title: 'Not Found' };
  const access = tool.chinaAccess ? ACCESS_BADGE[tool.chinaAccess] : undefined;
  const titlePrefix = tool.chinaAccess === 'accessible' ? '国内可用 ' : '';
  return {
    title: `${tool.name} — ${tool.catZh} AI 工具`,
    description: [tool.zh, access?.label].filter(Boolean).join('。').slice(0, 120),
    openGraph: {
      title: `${tool.name} | ${titlePrefix}AiToolsBox`,
      description: [tool.zh, access?.label].filter(Boolean).join('。').slice(0, 120),
      url: `${BASE}/tools/${tool.id}`,
      type: 'website',
      images: [`${BASE}/og?type=tool&name=${encodeURIComponent(tool.name)}&sub=${encodeURIComponent(tool.en.slice(0, 60))}&brand=${encodeURIComponent(tool.brand)}&mono=${encodeURIComponent(tool.mono)}`],
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: `/tools/${tool.id}` },
  };
}

// Pricing badge colours
const PRICING_STYLE: Record<string, { bg: string; color: string }> = {
  Free:     { bg: '#DCFCE7', color: '#16A34A' },
  Freemium: { bg: '#FFEDD5', color: '#C2410C' },
  Paid:     { bg: '#F3F4F6', color: '#374151' },
};

const ACCESS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  accessible: { label: '国内直连', bg: '#DCFCE7', color: '#166534' },
  'vpn-required': { label: '需要 VPN', bg: '#FEF3C7', color: '#92400E' },
  blocked: { label: '无法访问', bg: '#FEE2E2', color: '#991B1B' },
  unknown: { label: '访问未知', bg: '#F3F4F6', color: '#6B7280' },
};

function fallbackToolUrl(name: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' AI tool')}`;
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await loadToolById(slug);
  if (!tool) notFound();

  const related = (await loadToolsByCategory(tool.cat))
    .filter((t) => t.id !== tool.id)
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.en,
    applicationCategory: 'AIApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: tool.pricing === 'Free' ? '0' : undefined,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    url: tool.url ?? `${BASE}/tools/${tool.id}`,
  };

  const ps = PRICING_STYLE[tool.pricing] ?? PRICING_STYLE['Paid'];
  const access = ACCESS_BADGE[tool.chinaAccess ?? 'unknown'];
  const officialUrl = tool.url ?? fallbackToolUrl(tool.name);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ minHeight: '100vh', background: '#FFF7ED', fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        {/* Top bar */}
        <header style={{ padding: '16px 48px', borderBottom: '1px solid #E8D5B7', background: '#fff', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 16, fontStyle: 'italic' }}>A</div>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 17, color: '#1F2937' }}>AiToolsBox</span>
          </Link>
          <span style={{ color: '#9CA3AF', fontSize: 14 }}>/</span>
          <Link href="/" style={{ color: '#9CA3AF', fontSize: 14, textDecoration: 'none' }}>工具库</Link>
          <span style={{ color: '#9CA3AF', fontSize: 14 }}>/</span>
          <span style={{ color: '#1F2937', fontSize: 14, fontWeight: 500 }}>{tool.name}</span>
        </header>

        <main style={{ maxWidth: 860, margin: '40px auto', padding: '0 24px 64px' }}>

          {/* ── Hero card ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '36px 40px', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20, background: tool.brand, color: '#fff',
                display: 'grid', placeItems: 'center', fontFamily: 'Georgia, serif', fontWeight: 700,
                fontSize: tool.mono.length === 1 ? 40 : 26, letterSpacing: '-0.04em', flexShrink: 0,
              }}>{tool.mono}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 34, margin: 0, color: '#1F2937', letterSpacing: '-0.02em' }}>{tool.name}</h1>
                  <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: ps.bg, color: ps.color }}>{tool.pricing}</span>
                  {tool.chinaAccess && tool.chinaAccess !== 'unknown' && (
                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: access.bg, color: access.color }}>{access.label}</span>
                  )}
                  {tool.featured && <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#FFEDD5', color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Editor&rsquo;s Pick</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
                  <Link href={`/categories/${tool.cat}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#C2410C', background: '#FFEDD5', padding: '2px 10px', borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: 12 }}>
                    {tool.catIcon} {tool.catZh}
                  </Link>
                  <span>·</span>
                  <span>收录于 {tool.date}</span>
                </div>
                {/* CTA */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a href={officialUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 999, background: '#F97316', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                    访问工具官网 ↗
                  </a>
                  <Link href={`/categories/${tool.cat}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 999, border: '1px solid #E8D5B7', background: '#fff', color: '#4B5563', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    {tool.catIcon} 更多{tool.catZh}工具
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Description ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '32px 40px', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 16px', letterSpacing: '-0.01em' }}>About · 工具简介</h2>
            <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.8, margin: '0 0 20px' }}>{tool.en}</p>
            <div style={{ background: '#FFF7ED', borderRadius: 12, padding: '18px 22px', borderLeft: '4px solid #F97316' }}>
              <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.75, margin: 0 }}>{tool.zh}</p>
            </div>
          </div>

          {/* ── Info grid ── */}
          {tool.features && tool.features.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '28px 40px', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 16px', letterSpacing: '-0.01em' }}>功能亮点</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {tool.features.map((feature) => (
                  <span key={feature} style={{ padding: '8px 12px', borderRadius: 999, background: '#FFF7ED', color: '#4B5563', border: '1px solid #F3E8D0', fontSize: 13, fontWeight: 600 }}>
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { label: '定价模式', value: tool.pricing, badge: true },
              { label: '所属分类', value: `${tool.catIcon} ${tool.catZh} · ${tool.catEn}` },
              { label: '收录日期', value: tool.date },
              { label: '编辑推荐', value: tool.featured ? '✅ Editor\'s Pick' : '—' },
              { label: '国内访问', value: access.label },
              { label: '免费额度', value: tool.freeQuota ?? '—' },
              { label: '中文界面', value: tool.chineseUi ? '是' : '—' },
              { label: 'API 可用', value: tool.apiAvailable ? '是' : '—' },
            ].map(({ label, value, badge }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8D5B7', padding: '18px 22px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
                {badge
                  ? <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: ps.bg, color: ps.color }}>{value}</span>
                  : <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{value}</div>
                }
              </div>
            ))}
          </div>

          {/* ── Related tools ── */}
          {related.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '32px 40px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 20px' }}>
                同类工具 · More {tool.catEn}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {related.map((r) => {
                  const rps = PRICING_STYLE[r.pricing] ?? PRICING_STYLE['Paid'];
                  return (
                    <Link key={r.id} href={`/tools/${r.id}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, border: '1px solid #F3E8D0', textDecoration: 'none', background: '#FDFAF7' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: r.brand, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: r.mono.length === 1 ? 20 : 13, flexShrink: 0 }}>{r.mono}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#1F2937', fontFamily: 'Georgia, serif' }}>{r.name}</span>
                          <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: rps.bg, color: rps.color }}>{r.pricing}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{r.en}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
