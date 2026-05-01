import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { loadToolById, loadAllToolIds } from '@/lib/db/queries';

export const revalidate = 3600; // ISR — regenerate hourly

const BASE = 'https://toolsbox-six.vercel.app';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const ids = await loadAllToolIds();
  return ids.map((id) => ({ slug: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await loadToolById(slug);
  if (!tool) return { title: 'Not Found' };
  return {
    title: `${tool.name} — ${tool.catZh} AI 工具`,
    description: tool.en,
    openGraph: {
      title: `${tool.name} | AiToolsBox`,
      description: tool.en,
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

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await loadToolById(slug);
  if (!tool) notFound();

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
    url: `${BASE}/tools/${tool.id}`,
  };

  const ps = PRICING_STYLE[tool.pricing] ?? PRICING_STYLE['Paid'];

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

        {/* Main card */}
        <main style={{ maxWidth: 760, margin: '48px auto', padding: '0 24px' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 40 }}>
            {/* Header row */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 32 }}>
              {/* Logo */}
              <div style={{
                width: 72, height: 72, borderRadius: 18, background: tool.brand, color: '#fff',
                display: 'grid', placeItems: 'center', fontFamily: 'Georgia, serif', fontWeight: 700,
                fontSize: tool.mono.length === 1 ? 36 : 24, letterSpacing: '-0.04em', flexShrink: 0,
              }}>{tool.mono}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 32, margin: 0, color: '#1F2937', letterSpacing: '-0.02em' }}>{tool.name}</h1>
                  <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: ps.bg, color: ps.color }}>{tool.pricing}</span>
                  {tool.featured && (
                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#FFEDD5', color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Editor&rsquo;s Pick</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9CA3AF' }}>
                  <span>{tool.catIcon}</span>
                  <span>{tool.catZh} · {tool.catEn}</span>
                  <span>·</span>
                  <span>收录于 {tool.date}</span>
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div style={{ borderTop: '1px solid #F3E8D0', paddingTop: 28 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, fontWeight: 600, color: '#1F2937', margin: '0 0 12px' }}>About</h2>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 20px' }}>{tool.en}</p>
              <div style={{ background: '#FFF7ED', borderRadius: 10, padding: '16px 20px', borderLeft: '3px solid #F97316' }}>
                <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.65, margin: 0 }}>{tool.zh}</p>
              </div>
            </div>

            {/* Footer actions */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #F3E8D0', display: 'flex', gap: 12 }}>
              <Link href="/" style={{ padding: '10px 22px', borderRadius: 999, border: '1px solid #E8D5B7', background: '#fff', color: '#1F2937', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                ← 返回工具库
              </Link>
              <a href={`/?cat=${tool.cat}`} style={{ padding: '10px 22px', borderRadius: 999, border: 'none', background: '#FFEDD5', color: '#C2410C', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {tool.catIcon} 查看更多{tool.catZh}工具
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
