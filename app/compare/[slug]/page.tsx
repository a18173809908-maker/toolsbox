import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { SiteHeader } from '@/components/SiteHeader';
import { AccessBadge, ToolIcon } from '@/components/ToolBadges';
import { loadAllComparisonIds, loadAllComparisons, loadComparisonById } from '@/lib/db/queries';
import { scenes } from '@/lib/scenes';

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
  greenBg: '#DCFCE7',
  green: '#166534',
  labBg: '#EEF2FF',
  lab: '#3730A3',
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) return [];
  const ids = await loadAllComparisonIds();
  return ids.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comparison = process.env.DATABASE_URL ? await loadComparisonById(slug) : null;
  if (!comparison) return { title: 'Not Found' };

  const description = comparison.summary ?? `${comparison.toolA.name} 与 ${comparison.toolB.name} 的标准化对比。`;
  return {
    title: comparison.title,
    description,
    keywords: comparison.seoKeywords ?? undefined,
    openGraph: {
      title: `${comparison.title} | AIBoxPro`,
      description,
      url: `${BASE}/compare/${comparison.id}`,
      type: 'article',
    },
    alternates: { canonical: `/compare/${comparison.id}` },
  };
}

function formatDate(date?: Date | null) {
  if (!date) return '待补充';
  return date.toLocaleDateString('zh-CN');
}

function accessText(value?: string | null) {
  if (value === 'accessible') return '国内可直连';
  if (value === 'vpn-required') return '需要 VPN';
  if (value === 'blocked') return '国内受限';
  return '待核实';
}

function stripMarkdown(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFaqs(markdown?: string | null) {
  if (!markdown) return [];
  const matches = Array.from(markdown.matchAll(/^##\s+(.+)\n([\s\S]*?)(?=^##\s+|$)/gm));
  return matches
    .map((match) => {
      const heading = stripMarkdown(match[1]);
      const answer = stripMarkdown(
        match[2]
          .split('\n')
          .filter((line) => line.trim() && !line.trim().startsWith('|'))
          .slice(0, 4)
          .join(' '),
      );
      return { q: heading, a: answer };
    })
    .filter((item) => item.q.length > 4 && item.a.length > 30)
    .slice(0, 6);
}

function pricingText(tool: { priceCny?: string; pricingDetail?: string; pricing: string }) {
  return tool.priceCny ?? tool.pricingDetail ?? tool.pricing;
}

async function renderMarkdown(markdown?: string | null) {
  if (!markdown) return '<p>正文待补充。</p>';
  const html = await marked.parse(markdown, { async: true });
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'table', 'thead', 'tbody', 'tr', 'th', 'td']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

function MethodologyItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 12 }}>
      <div style={{ color: C.inkMuted, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ color: C.ink, fontSize: 14, lineHeight: 1.55 }}>{value || '待补充'}</div>
    </div>
  );
}

function AccessValue({ chinaAccess, chineseUi }: { chinaAccess?: string | null; chineseUi?: boolean }) {
  if (!chinaAccess || chinaAccess === 'unknown') return <span>{accessText(chinaAccess)}</span>;
  return <AccessBadge chinaAccess={chinaAccess} chineseUi={chineseUi} compact />;
}

function ReproducibleValue({ value }: { value?: boolean | null }) {
  if (value === true) return <span>可复现</span>;
  if (value === false) return <span>未提供</span>;
  return <span>待补充</span>;
}

export default async function CompareDetailPage({ params }: Props) {
  const { slug } = await params;
  const comparison = process.env.DATABASE_URL ? await loadComparisonById(slug) : null;
  if (!comparison) notFound();

  const [bodyHtml, allComparisons] = await Promise.all([
    renderMarkdown(comparison.body),
    loadAllComparisons(),
  ]);

  const related = allComparisons
    .filter((item) => item.id !== comparison.id)
    .filter((item) => [item.toolAId, item.toolBId].some((id) => id === comparison.toolAId || id === comparison.toolBId))
    .slice(0, 3);

  const relatedScenes = scenes.filter((s) =>
    s.toolIds.includes(comparison.toolAId) || s.toolIds.includes(comparison.toolBId)
  );

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: comparison.title,
    description: comparison.summary ?? `${comparison.toolA.name} vs ${comparison.toolB.name}`,
    datePublished: comparison.publishedAt?.toISOString(),
    dateModified: comparison.updatedAt.toISOString(),
    author: { '@type': 'Organization', name: comparison.testedBy || 'AIBoxPro' },
    publisher: { '@type': 'Organization', name: 'AIBoxPro' },
    mainEntityOfPage: `${BASE}/compare/${comparison.id}`,
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: BASE },
      { '@type': 'ListItem', position: 2, name: '工具对比', item: `${BASE}/compare` },
      { '@type': 'ListItem', position: 3, name: comparison.title, item: `${BASE}/compare/${comparison.id}` },
    ],
  };
  const faqs = extractFaqs(comparison.body);
  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;

  return (
    <>
      {[articleJsonLd, breadcrumbJsonLd, faqJsonLd].filter(Boolean).map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />

        <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(28px, 6vw, 44px) clamp(16px, 5vw, 28px) 72px' }}>
          <Link href="/compare" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>返回对比列表</Link>

          <section style={{ marginTop: 24, marginBottom: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: 16, alignItems: 'center', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <ToolIcon name={comparison.toolA.name} mono={comparison.toolA.mono} brand={comparison.toolA.brand} url={comparison.toolA.url} size={52} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: C.inkMuted, fontSize: 12, fontWeight: 700 }}>Tool A</div>
                  <div style={{ color: C.ink, fontSize: 18, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comparison.toolA.name}</div>
                </div>
              </div>
              <div style={{ color: C.accent, background: C.primaryBg, borderRadius: 999, padding: '7px 10px', fontSize: 12, fontWeight: 900 }}>VS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, justifyContent: 'flex-end' }}>
                <div style={{ minWidth: 0, textAlign: 'right' }}>
                  <div style={{ color: C.inkMuted, fontSize: 12, fontWeight: 700 }}>Tool B</div>
                  <div style={{ color: C.ink, fontSize: 18, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comparison.toolB.name}</div>
                </div>
                <ToolIcon name={comparison.toolB.name} mono={comparison.toolB.mono} brand={comparison.toolB.brand} url={comparison.toolB.url} size={52} />
              </div>
            </div>

            <h1 style={{ color: C.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(32px, 7vw, 52px)', lineHeight: 1.08, margin: '0 0 14px' }}>
              {comparison.isLabReport && (
                <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginRight: 12, padding: '5px 10px', borderRadius: 999, background: C.labBg, color: C.lab, fontFamily: 'Inter, ui-sans-serif, system-ui', fontStyle: 'normal', fontSize: 13, fontWeight: 900 }}>
                  AIBoxPro Lab
                </span>
              )}
              {comparison.title}
            </h1>
            <p style={{ color: C.inkSoft, fontSize: 16, lineHeight: 1.75, maxWidth: 820, margin: 0 }}>
              {comparison.summary ?? '编辑摘要待补充。'}
            </p>
          </section>

          {(comparison.isLabReport || comparison.testedAt || comparison.testedVersion || comparison.testedEnv || comparison.evalSet || comparison.testedBy) && (
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 14, background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ gridColumn: '1 / -1', color: C.ink, fontSize: 18, fontWeight: 800 }}>Methodology Box</div>
              <MethodologyItem label="测试时间" value={formatDate(comparison.testedAt)} />
              <MethodologyItem label="测试版本" value={comparison.testedVersion} />
              <MethodologyItem label="测试环境" value={comparison.testedEnv} />
              <MethodologyItem label="评测集说明" value={comparison.evalSet} />
              <MethodologyItem label="测试人" value={comparison.testedBy} />
              {comparison.isLabReport && (
                <>
                  <MethodologyItem label="Lab ID" value={comparison.labReportId} />
                  <MethodologyItem label="样本规模" value={comparison.sampleSize} />
                  <div style={{ borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 12 }}>
                    <div style={{ color: C.inkMuted, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>可复现性</div>
                    <div style={{ color: C.ink, fontSize: 14, lineHeight: 1.55 }}><ReproducibleValue value={comparison.reproducible} /></div>
                  </div>
                  <MethodologyItem label="测试仓库" value={comparison.repoUrl} />
                </>
              )}
            </section>
          )}

          {!comparison.isLabReport && (
            <section style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12, padding: 18, marginBottom: 24 }}>
              <div style={{ color: '#92400E', fontSize: 13, fontWeight: 900, marginBottom: 6 }}>内容说明</div>
              <p style={{ color: C.ink, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                本文基于两款产品的官方文档与公开资料整理，不包含 AIBoxPro 实测数据。具体价格、模型版本、额度和企业能力请以官网为准。
              </p>
            </section>
          )}

          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
            {[
              ['价格', pricingText(comparison.toolA), pricingText(comparison.toolB)],
              ['国内可用性', accessText(comparison.toolA.chinaAccess), accessText(comparison.toolB.chinaAccess)],
              ['中文支持', comparison.toolA.chineseUi ? '支持中文界面' : '未确认中文界面', comparison.toolB.chineseUi ? '支持中文界面' : '未确认中文界面'],
              ['免费额度', comparison.toolA.freeQuota ?? '待补充', comparison.toolB.freeQuota ?? '待补充'],
            ].map(([label, valueA, valueB], index) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '160px minmax(0, 1fr) minmax(0, 1fr)', borderTop: index === 0 ? 'none' : `1px solid ${C.ruleSoft}` }}>
                <div style={{ padding: 16, color: C.inkMuted, fontSize: 13, fontWeight: 800, background: '#FFFBF5' }}>{label}</div>
                <div style={{ padding: 16, color: C.ink, fontSize: 14, lineHeight: 1.55 }}>
                  {label === '国内可用性' ? <AccessValue chinaAccess={comparison.toolA.chinaAccess} chineseUi={comparison.toolA.chineseUi} /> : valueA}
                </div>
                <div style={{ padding: 16, color: C.ink, fontSize: 14, lineHeight: 1.55, borderLeft: `1px solid ${C.ruleSoft}` }}>
                  {label === '国内可用性' ? <AccessValue chinaAccess={comparison.toolB.chinaAccess} chineseUi={comparison.toolB.chineseUi} /> : valueB}
                </div>
              </div>
            ))}
          </section>

          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <div style={{ color: C.ink, fontSize: 18, fontWeight: 800, marginBottom: 14 }}>详细对比</div>
            <div className="compare-body" style={{ color: C.inkSoft, fontSize: 15, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </section>
          <style>{`
            .compare-body h2 { color: ${C.ink}; font-size: 20px; font-weight: 800; margin: 28px 0 12px; }
            .compare-body h2:first-child { margin-top: 0; }
            .compare-body h3 { color: ${C.ink}; font-size: 16px; font-weight: 700; margin: 20px 0 8px; }
            .compare-body p { margin: 0 0 12px; }
            .compare-body ul, .compare-body ol { margin: 0 0 12px; padding-left: 24px; }
            .compare-body li { margin-bottom: 4px; }
            .compare-body table { width: 100%; border-collapse: collapse; margin: 12px 0 18px; font-size: 14px; table-layout: fixed; }
            .compare-body table th, .compare-body table td { border: 1px solid ${C.ruleSoft}; padding: 8px 10px; text-align: left; vertical-align: top; word-break: break-word; }
            .compare-body table th { background: #FFFBF5; color: ${C.ink}; font-weight: 700; }
            .compare-body table tr:nth-child(even) td { background: #FFFDF8; }
            .compare-body blockquote { margin: 12px 0; padding: 10px 14px; border-left: 3px solid ${C.primary}; background: ${C.primaryBg}; color: ${C.ink}; border-radius: 0 6px 6px 0; }
            .compare-body blockquote p { margin: 0; }
            .compare-body a { color: ${C.accent}; text-decoration: underline; }
            .compare-body code { background: ${C.ruleSoft}; padding: 1px 6px; border-radius: 4px; font-size: 13px; }
          `}</style>

          <section style={{ background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 12, padding: 22, marginBottom: 24 }}>
            <div style={{ color: C.green, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>编辑结论</div>
            <p style={{ color: C.ink, fontSize: 16, lineHeight: 1.75, margin: 0 }}>{comparison.verdict ?? '结论待补充。'}</p>
          </section>

          {related.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <h2 style={{ color: C.ink, fontSize: 20, margin: '0 0 14px' }}>相关对比</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 14 }}>
                {related.map((item) => (
                  <Link key={item.id} href={`/compare/${item.id}`} style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 18, color: C.ink, textDecoration: 'none', fontWeight: 800 }}>
                    {item.toolA.name} vs {item.toolB.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedScenes.length > 0 && (
            <section>
              <h2 style={{ color: C.ink, fontSize: 20, margin: '0 0 14px' }}>相关场景指南</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {relatedScenes.map((scene) => (
                  <Link key={scene.slug} href={`/scenes/${scene.slug}`} style={{ display: 'block', padding: '14px 16px', borderRadius: 12, background: '#FFF7ED', border: `1px solid ${C.rule}`, color: C.ink, textDecoration: 'none' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{scene.title}</div>
                    <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6 }}>{scene.subtitle}</div>
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
