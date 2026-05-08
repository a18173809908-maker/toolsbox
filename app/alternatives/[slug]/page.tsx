import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { AccessBadge, ToolIcon } from '@/components/ToolBadges';
import { alternativeTopics, getAlternativeTopic } from '@/lib/alternatives';
import { loadAllComparisons, loadToolById } from '@/lib/db/queries';
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
};

type Props = { params: Promise<{ slug: string }> };

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

function reasonFor(tool: Tool, originalName: string) {
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

  const [{ original, alternatives }, allComparisons] = await Promise.all([
    loadTopicTools(topic.slug, topic.fallbackToolIds),
    process.env.DATABASE_URL ? loadAllComparisons() : Promise.resolve([]),
  ]);

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
      description: reasonFor(tool, originalName),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />
        <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
          <Link href="/alternatives" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>返回替代方案</Link>

          <section style={{ marginTop: 24, marginBottom: 24 }}>
            <p style={{ margin: '0 0 10px', color: C.accent, fontSize: 13, fontWeight: 900 }}>国产替代专题</p>
            <h1 style={{ margin: '0 0 14px', color: C.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(34px, 7vw, 58px)', lineHeight: 1.06 }}>
              {topic.title}
            </h1>
            <p style={{ margin: 0, maxWidth: 820, color: C.inkSoft, fontSize: 16, lineHeight: 1.75 }}>{topic.subtitle}</p>
          </section>

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

          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 22, marginBottom: 22 }}>
            <h2 style={{ margin: '0 0 10px', color: C.ink, fontSize: 22 }}>为什么需要替代</h2>
            <p style={{ margin: 0, color: C.inkSoft, fontSize: 15, lineHeight: 1.8 }}>{topic.why}</p>
          </section>

          <section style={{ marginBottom: 26 }}>
            <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 22 }}>可优先尝试的工具</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(310px, 100%), 1fr))', gap: 16 }}>
              {alternatives.map((tool) => (
                <Link key={tool.id} href={`/tools/${tool.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 240, background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 20, color: C.ink, textDecoration: 'none' }}>
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
                  <div style={{ marginTop: 'auto', borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 12 }}>
                    <div style={{ color: C.accent, fontSize: 12, fontWeight: 900, marginBottom: 5 }}>替代理由</div>
                    <div style={{ color: C.ink, fontSize: 14, lineHeight: 1.6 }}>{reasonFor(tool, originalName)}</div>
                    <div style={{ color: C.inkMuted, fontSize: 12, marginTop: 8 }}>访问方式：{accessText(tool.chinaAccess)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <section>
              <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 22 }}>相关对比</h2>
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
