import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { AccessBadge, ToolIcon } from '@/components/ToolBadges';
import { rankings, getRanking } from '@/lib/rankings';
import { loadToolById } from '@/lib/db/queries';
import type { Tool } from '@/lib/data';

export const revalidate = 3600;

const BASE = 'https://www.aiboxpro.cn';

const C = {
  bg: '#FFF7ED',
  panel: '#FFFFFF',
  ink: '#1F2937',
  inkSoft: '#4B5563',
  inkMuted: '#9CA3AF',
  rule: '#E8D5B7',
  ruleSoft: '#F3E8D0',
  primaryBg: '#FFEDD5',
  accent: '#C2410C',
  successBg: '#DCFCE7',
  success: '#10B981',
  gold: '#D97706',
  goldBg: '#FEF3C7',
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return rankings.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ranking = getRanking(slug);
  if (!ranking) return { title: 'Not Found' };
  return {
    title: `${ranking.title} | AIBoxPro`,
    description: ranking.subtitle,
    alternates: { canonical: `/best/${ranking.slug}` },
    openGraph: {
      title: ranking.title,
      description: ranking.subtitle,
      url: `${BASE}/best/${ranking.slug}`,
      type: 'article',
    },
  };
}

async function loadRankingTools(toolIds: string[]): Promise<Map<string, Tool>> {
  if (!process.env.DATABASE_URL) return new Map();
  const results = await Promise.all(toolIds.map((id) => loadToolById(id)));
  const map = new Map<string, Tool>();
  toolIds.forEach((id, i) => {
    const t = results[i];
    if (t) map.set(id, t);
  });
  return map;
}

const RANK_LABELS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default async function BestDetailPage({ params }: Props) {
  const { slug } = await params;
  const ranking = getRanking(slug);
  if (!ranking) notFound();

  const toolIds = ranking.entries.map((e) => e.toolId);
  const toolMap = await loadRankingTools(toolIds);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: ranking.title,
    description: ranking.subtitle,
    url: `${BASE}/best/${ranking.slug}`,
    numberOfItems: ranking.entries.length,
    itemListElement: ranking.entries.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: toolMap.get(e.toolId)?.name ?? e.toolId,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />
        <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
          <Link href="/best" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>返回榜单</Link>

          <section style={{ marginTop: 24, marginBottom: 28 }}>
            <p style={{ margin: '0 0 10px', color: C.accent, fontSize: 13, fontWeight: 900 }}>工具榜单</p>
            <h1 style={{ margin: '0 0 14px', color: C.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.1 }}>
              {ranking.title}
            </h1>
            <p style={{ margin: '0 0 18px', maxWidth: 820, color: C.inkSoft, fontSize: 16, lineHeight: 1.75 }}>{ranking.subtitle}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ranking.targetUsers.map((u) => (
                <span key={u} style={{ padding: '4px 12px', borderRadius: 999, background: C.successBg, color: '#166534', fontSize: 13, fontWeight: 700 }}>
                  {u}
                </span>
              ))}
            </div>
          </section>

          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 'clamp(20px, 4vw, 28px)', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 20 }}>筛选标准</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {ranking.criteria.map((c, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, color: C.inkSoft }}>
                  <span style={{ color: C.success, fontWeight: 900, flexShrink: 0 }}>✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 16px', color: C.ink, fontSize: 20 }}>工具排名</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {ranking.entries.map((entry) => {
                const tool = toolMap.get(entry.toolId);
                const rankLabel = RANK_LABELS[entry.rank] ?? `#${entry.rank}`;
                return (
                  <div
                    key={entry.toolId}
                    style={{
                      background: C.panel,
                      border: `1px solid ${entry.rank <= 3 ? C.rule : C.ruleSoft}`,
                      borderRadius: 12,
                      padding: 'clamp(16px, 3vw, 22px)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                      <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{rankLabel}</span>
                      {tool ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          <ToolIcon name={tool.name} mono={tool.mono} brand={tool.brand} url={tool.url} size={40} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Link
                              href={`/tools/${tool.id}`}
                              style={{ fontSize: 17, fontWeight: 800, color: C.ink, textDecoration: 'none' }}
                            >
                              {tool.name}
                            </Link>
                            <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>{tool.priceCny ?? tool.pricingDetail ?? tool.pricing}</div>
                          </div>
                          <AccessBadge chinaAccess={tool.chinaAccess ?? 'unknown'} chineseUi={tool.chineseUi} compact />
                        </div>
                      ) : (
                        <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>{entry.toolId}</div>
                      )}
                    </div>

                    <p style={{ margin: '0 0 14px', fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>{entry.why}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 10 }}>
                      <div style={{ background: C.successBg, borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 6 }}>优点</div>
                        <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#166534', fontSize: 13, lineHeight: 1.7 }}>
                          {entry.pros.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                      <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#991B1B', marginBottom: 6 }}>缺点</div>
                        <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#991B1B', fontSize: 13, lineHeight: 1.7 }}>
                          {entry.cons.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                      <span style={{ color: C.inkMuted }}>
                        <span style={{ fontWeight: 700, color: C.inkSoft }}>最适合：</span>{entry.bestFor}
                      </span>
                      <span style={{ color: C.inkMuted }}>
                        <span style={{ fontWeight: 700, color: C.inkSoft }}>价格：</span>{entry.priceSummary}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ background: C.goldBg, border: `1px solid #FDE68A`, borderRadius: 12, padding: 'clamp(20px, 4vw, 28px)', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 12px', color: C.gold, fontSize: 20 }}>最终建议</h2>
            <p style={{ margin: 0, fontSize: 15, color: '#92400E', lineHeight: 1.8 }}>{ranking.verdict}</p>
          </section>

          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 'clamp(20px, 4vw, 28px)' }}>
            <h2 style={{ margin: '0 0 18px', color: C.ink, fontSize: 20 }}>常见问题</h2>
            <div style={{ display: 'grid', gap: 18 }}>
              {ranking.faqs.map((faq, i) => (
                <div key={i} style={{ borderTop: i > 0 ? `1px solid ${C.ruleSoft}` : 'none', paddingTop: i > 0 ? 18 : 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 8 }}>{faq.q}</div>
                  <div style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75 }}>{faq.a}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
