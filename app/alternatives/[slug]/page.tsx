import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { AccessBadge, ToolIcon } from '@/components/ToolBadges';
import { alternativeTopics, getAlternativeTopic } from '@/lib/alternatives';
import { loadAllComparisons, loadToolById, loadPublishedAlternativeDraft } from '@/lib/db/queries';
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
  primary: '#F97316',
  primaryBg: '#FFEDD5',
  accent: '#C2410C',
  successBg: '#DCFCE7',
  success: '#166534',
};

type Props = { params: Promise<{ slug: string }> };

// Shape of aiDraft from alternative-draft prompt
type AltDraftData = {
  title?: string;
  summary?: string;
  targetTool?: string;
  alternatives?: { toolId: string; headline: string; betterFor: string; chinaNote: string; caveats?: string[] }[];
  summaryTable?: string;
};

export function generateStaticParams() {
  return alternativeTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getAlternativeTopic(slug);
  if (!topic) return { title: 'Not Found' };

  const original = process.env.DATABASE_URL ? await loadToolById(topic.slug) : null;
  const originalName = original?.name ?? topic.slug;
  const count = topic.fallbackToolIds.length;

  return {
    title: `${originalName} 的国产替代方案 - ${count} 个国内可用的 AI 工具 | AIBoxPro`,
    description: `${originalName} 在国内访问不稳定？盘点 ${count} 个国产替代工具，覆盖 ${topic.scenario}。`,
    alternates: { canonical: `/alternatives/${topic.slug}` },
    openGraph: {
      title: topic.title,
      description: topic.subtitle,
      url: `${BASE}/alternatives/${topic.slug}`,
      type: 'article',
    },
  };
}

function pricingText(tool: Tool) {
  return tool.priceCny ?? tool.pricingDetail ?? tool.pricing;
}

function accessText(value?: string) {
  if (value === 'accessible') return '国内可直连';
  if (value === 'vpn-required') return '需要 VPN';
  if (value === 'blocked') return '国内受限';
  return '待核实';
}

function reasonFor(tool: Tool, originalName: string, draftAlt?: AltDraftData['alternatives']) {
  // Prefer AI-drafted headline when available
  const drafted = draftAlt?.find((a) => a.toolId === tool.id);
  if (drafted?.headline) return drafted.headline;

  const parts: string[] = [];
  if (tool.chinaAccess === 'accessible') parts.push('国内访问更省心');
  if (tool.chineseUi) parts.push('中文界面友好');
  if (tool.freeQuota) parts.push(`有免费额度：${tool.freeQuota}`);
  if (tool.features?.length) parts.push(`适合 ${tool.features.slice(0, 2).join('、')}`);
  return parts[0] ?? `可作为 ${originalName} 的同类方案先试用`;
}

async function loadTopicTools(topicSlug: string, fallbackToolIds: string[]) {
  if (!process.env.DATABASE_URL) return { original: null, alternatives: [] as Tool[] };

  const original = await loadToolById(topicSlug);
  const ids = original?.cnAlternatives?.length ? original.cnAlternatives : fallbackToolIds;
  const tools = await Promise.all(ids.map((id) => loadToolById(id)));
  return {
    original,
    alternatives: tools.filter((tool): tool is NonNullable<(typeof tools)[number]> => Boolean(tool)),
  };
}

export default async function AlternativeDetailPage({ params }: Props) {
  const { slug } = await params;
  const topic = getAlternativeTopic(slug);
  if (!topic) notFound();

  const [{ original, alternatives }, allComparisons, draftRow] = await Promise.all([
    loadTopicTools(topic.slug, topic.fallbackToolIds),
    process.env.DATABASE_URL ? loadAllComparisons() : Promise.resolve([]),
    process.env.DATABASE_URL ? loadPublishedAlternativeDraft(topic.slug) : Promise.resolve(null),
  ]);

  const draft = draftRow?.aiDraft as AltDraftData | null ?? null;
  const draftAlts = draft?.alternatives ?? [];

  const originalName = original?.name ?? topic.slug;
  const related = allComparisons
    .filter((comparison) => {
      const ids = [comparison.toolAId, comparison.toolBId];
      return ids.includes(topic.slug) || alternatives.some((tool) => ids.includes(tool.id));
    })
    .slice(0, 4);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: topic.title,
    itemListElement: alternatives.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE}/tools/${tool.id}`,
      name: tool.name,
      description: reasonFor(tool, originalName, draftAlts),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />
        <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
          <Link href="/alternatives" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>返回替代方案</Link>

          {/* Hero */}
          <section style={{ marginTop: 24, marginBottom: 24 }}>
            <p style={{ margin: '0 0 10px', color: C.accent, fontSize: 13, fontWeight: 900 }}>国产替代专题</p>
            <h1 style={{ margin: '0 0 14px', color: C.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(34px, 7vw, 58px)', lineHeight: 1.06 }}>
              {topic.title}
            </h1>
            <p style={{ margin: 0, maxWidth: 820, color: C.inkSoft, fontSize: 16, lineHeight: 1.75 }}>
              {draft?.summary ?? topic.subtitle}
            </p>
          </section>

          {/* 被替代工具卡 */}
          {original && (
            <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 18, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <ToolIcon name={original.name} mono={original.mono} brand={original.brand} url={original.url} size={44} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: C.inkMuted, fontSize: 12, fontWeight: 800 }}>被替代工具</div>
                  <div style={{ color: C.ink, fontSize: 18, fontWeight: 900 }}>{original.name}</div>
                </div>
              </div>
              <Link href={`/tools/${original.id}`} style={{ color: C.accent, fontSize: 13, fontWeight: 800 }}>查看工具详情</Link>
            </section>
          )}

          {/* 为什么需要替代 */}
          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 22, marginBottom: 22 }}>
            <h2 style={{ margin: '0 0 10px', color: C.ink, fontSize: 20, fontWeight: 800 }}>为什么需要替代</h2>
            <p style={{ margin: 0, color: C.inkSoft, fontSize: 15, lineHeight: 1.8 }}>{topic.why}</p>
          </section>

          {/* 场景选择指南（静态，仅 Runway / Cursor 有数据） */}
          {topic.scenarios && topic.scenarios.length > 0 && (
            <section style={{ marginBottom: 22 }}>
              <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 20, fontWeight: 800 }}>按场景选工具</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {topic.scenarios.map((sc, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 18px', background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 13, color: C.inkMuted, fontWeight: 700, marginBottom: 3 }}>场景</div>
                      <div style={{ fontSize: 15, color: C.ink, lineHeight: 1.55 }}>{sc.useCase}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 13, color: C.inkMuted, fontWeight: 700, marginBottom: 3 }}>推荐</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: C.accent }}>{sc.pick}</div>
                    </div>
                    <div style={{ flex: 2, minWidth: 220 }}>
                      <div style={{ fontSize: 13, color: C.inkMuted, fontWeight: 700, marginBottom: 3 }}>理由</div>
                      <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6 }}>{sc.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI 起草的对比表格（Markdown → 简单渲染） */}
          {draft?.summaryTable && (
            <section style={{ marginBottom: 22, overflowX: 'auto' }}>
              <h2 style={{ margin: '0 0 12px', color: C.ink, fontSize: 20, fontWeight: 800 }}>对比速览</h2>
              <pre style={{ margin: 0, padding: '16px 20px', background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 10, fontSize: 13, color: C.inkSoft, lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre', fontFamily: 'monospace' }}>
                {draft.summaryTable}
              </pre>
            </section>
          )}

          {/* 工具卡列表 */}
          <section style={{ marginBottom: 26 }}>
            <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 20, fontWeight: 800 }}>可优先尝试的工具</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(310px, 100%), 1fr))', gap: 16 }}>
              {alternatives.map((tool) => {
                const draftAlt = draftAlts.find((a) => a.toolId === tool.id);
                return (
                  <Link key={tool.id} href={`/tools/${tool.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 20, color: C.ink, textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <ToolIcon name={tool.name} mono={tool.mono} brand={tool.brand} url={tool.url} size={42} />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: 'block', fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</strong>
                          <span style={{ color: C.inkMuted, fontSize: 12 }}>{pricingText(tool)}</span>
                        </div>
                      </div>
                      <AccessBadge chinaAccess={tool.chinaAccess ?? 'unknown'} chineseUi={tool.chineseUi} compact />
                    </div>
                    <p style={{ margin: 0, color: C.inkSoft, fontSize: 14, lineHeight: 1.7 }}>{tool.zh || tool.en}</p>
                    <div style={{ marginTop: 'auto', borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <div style={{ color: C.accent, fontSize: 12, fontWeight: 900, marginBottom: 4 }}>
                          {draftAlt ? '替代理由（AI 分析）' : '替代理由'}
                        </div>
                        <div style={{ color: C.ink, fontSize: 14, lineHeight: 1.6 }}>{reasonFor(tool, originalName, draftAlts)}</div>
                      </div>
                      {draftAlt?.betterFor && (
                        <div style={{ padding: '6px 10px', background: C.successBg, borderRadius: 6 }}>
                          <span style={{ fontSize: 12, color: C.success, fontWeight: 700 }}>更适合：</span>
                          <span style={{ fontSize: 12, color: C.success }}>{draftAlt.betterFor}</span>
                        </div>
                      )}
                      {draftAlt?.chinaNote && (
                        <div style={{ fontSize: 12, color: C.inkMuted, lineHeight: 1.55 }}>
                          <span style={{ fontWeight: 700 }}>国内使用：</span>{draftAlt.chinaNote}
                        </div>
                      )}
                      {!draftAlt && (
                        <div style={{ color: C.inkMuted, fontSize: 12 }}>访问方式：{accessText(tool.chinaAccess)}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 相关对比 */}
          {related.length > 0 && (
            <section>
              <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 20, fontWeight: 800 }}>相关对比</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 14 }}>
                {related.map((comparison) => (
                  <Link key={comparison.id} href={`/compare/${comparison.id}`} style={{ background: C.primaryBg, border: `1px solid ${C.rule}`, borderRadius: 10, padding: 16, color: C.ink, textDecoration: 'none', fontWeight: 800 }}>
                    {comparison.toolA.name} vs {comparison.toolB.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
