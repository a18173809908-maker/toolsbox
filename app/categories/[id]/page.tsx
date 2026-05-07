import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { loadCategoryById, loadToolsByCategory, loadAllCategoryIds } from '@/lib/db/queries';
import { ToolCard } from './ToolCard';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

const BASE = 'https://aiboxpro.cn';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  const ids = await loadAllCategoryIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cat = await loadCategoryById(id);
  if (!cat) return { title: 'Not Found' };
  return {
    title: `${cat.zh} AI 工具 — ${cat.en}`,
    description: `精选 ${cat.zh} 类别下的 ${cat.count} 款 AI 工具，涵盖 ${cat.en} 领域最佳应用。`,
    openGraph: {
      title: `${cat.zh} AI 工具 | AiToolsBox`,
      description: `${cat.count} 款精选 ${cat.zh} AI 工具`,
      url: `${BASE}/categories/${cat.id}`,
      type: 'website',
    },
    alternates: { canonical: `/categories/${cat.id}` },
  };
}

// Design tokens — matches site palette
const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
};


export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const [cat, tools] = await Promise.all([
    loadCategoryById(id),
    loadToolsByCategory(id),
  ]);
  if (!cat) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.zh} AI 工具 | AiToolsBox`,
    description: `精选 ${cat.zh} 类别 AI 工具`,
    url: `${BASE}/categories/${cat.id}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>

        <SiteHeader />

        {/* Hero */}
        <section style={{ padding: 'clamp(36px, 7vw, 48px) clamp(16px, 5vw, 48px) 36px', background: C.bg, borderBottom: `1px solid ${C.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -80, top: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontSize: 12, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: C.primary, display: 'inline-block' }} />
              {cat.en}
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(34px, 10vw, 52px)', lineHeight: 1.05, margin: '0 0 16px', color: C.ink, letterSpacing: '-0.03em' }}>
              <span style={{ fontSize: 'clamp(32px, 9vw, 48px)', marginRight: 16 }}>{cat.icon}</span>
              <span style={{ color: C.primary }}>{cat.zh}</span>
            </h1>
            <p style={{ fontSize: 16, color: C.inkSoft, margin: 0, lineHeight: 1.6 }}>
              共收录 <strong style={{ color: C.ink }}>{tools.length}</strong> 款 {cat.zh} 类 AI 工具 · {cat.en} category
            </p>
          </div>
        </section>

        {/* Tools grid */}
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(28px, 6vw, 40px) clamp(16px, 5vw, 48px)' }}>
          {tools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: C.inkMuted }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{cat.icon}</div>
              <p style={{ fontSize: 16 }}>该分类暂无工具</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 20 }}>
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </main>

        {/* Back link */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px) 48px' }}>
          <Link href="/" style={{ fontSize: 13, color: C.inkSoft, textDecoration: 'none' }}>← 返回工具库</Link>
        </div>
      </div>
    </>
  );
}
