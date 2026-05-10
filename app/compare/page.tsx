import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { ToolIcon } from '@/components/ToolBadges';
import { loadAllComparisons } from '@/lib/db/queries';

export const revalidate = 3600;

const BASE = 'https://www.aiboxpro.cn';

const C = {
  bg: '#FFF7ED',
  panel: '#FFFFFF',
  ink: '#1F2937',
  inkSoft: '#4B5563',
  inkMuted: '#9CA3AF',
  rule: '#E8D5B7',
  primary: '#F97316',
  primaryBg: '#FFEDD5',
  accent: '#C2410C',
};

export const metadata: Metadata = {
  title: 'AI 工具对比',
  description: 'AIBoxPro 标准化对比页，帮助中文用户比较 AI 工具的价格、国内可用性、中文支持和适用场景。',
  openGraph: {
    title: 'AI 工具对比 | AIBoxPro',
    description: '用统一模板比较 AI 工具，快速完成选型决策。',
    url: `${BASE}/compare`,
    type: 'website',
  },
  alternates: { canonical: '/compare' },
};

export default async function ComparePage() {
  const comparisons = process.env.DATABASE_URL ? await loadAllComparisons() : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI 工具对比 | AIBoxPro',
    description: 'AI 工具标准化对比列表',
    url: `${BASE}/compare`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />

        <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(32px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
          <section style={{ marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontSize: 12, fontWeight: 700, marginBottom: 18 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: C.primary, display: 'inline-block' }} />
              Compare
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(34px, 8vw, 54px)', lineHeight: 1.05, color: C.ink, margin: '0 0 12px' }}>
              AI 工具对比
            </h1>
          </section>

          {comparisons.length === 0 ? (
            <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 28, color: C.inkSoft }}>
              对比页内容正在整理中。
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 16 }}>
              {comparisons.map((comparison) => (
                <Link key={comparison.id} href={`/compare/${comparison.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <article style={{ height: '100%', background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 22, boxSizing: 'border-box' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <ToolIcon name={comparison.toolA.name} mono={comparison.toolA.mono} brand={comparison.toolA.brand} url={comparison.toolA.url} size={40} />
                        <strong style={{ color: C.ink, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comparison.toolA.name}</strong>
                      </div>
                      <span style={{ color: C.inkMuted, fontSize: 12, fontWeight: 800 }}>VS</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, justifyContent: 'flex-end' }}>
                        <strong style={{ color: C.ink, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comparison.toolB.name}</strong>
                        <ToolIcon name={comparison.toolB.name} mono={comparison.toolB.mono} brand={comparison.toolB.brand} url={comparison.toolB.url} size={40} />
                      </div>
                    </div>
                    <h2 style={{ color: C.ink, fontSize: 18, lineHeight: 1.35, margin: '0 0 10px' }}>{comparison.title}</h2>
                    <p style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{comparison.summary ?? '编辑结论待补充。'}</p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
