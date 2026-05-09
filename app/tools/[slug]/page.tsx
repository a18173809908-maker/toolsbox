import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type React from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { AccessBadge, ToolIcon } from '@/components/ToolBadges';
import { loadToolById, loadAllToolIds, loadToolsByCategory, loadRelatedArticles, loadToolsByIds, loadLabReportsByToolId, loadConnectivityByToolId, loadComparisonsByToolId } from '@/lib/db/queries';

export const revalidate = 3600; // ISR — regenerate hourly
export const dynamic = 'force-dynamic';

const BASE = 'https://aiboxpro.cn';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  const ids = await loadAllToolIds();
  return ids.map((id) => ({ slug: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await loadToolById(slug);
  if (!tool) return { title: 'Not Found' };
  const access = tool.chinaAccess ? ACCESS_BADGE[tool.chinaAccess] : undefined;
  const titlePrefix = tool.chinaAccess === 'accessible' ? '国内可用 ' : '';
  const featureText = tool.features?.slice(0, 3).join('、');
  const description = [tool.zh, featureText, access?.label].filter(Boolean).join('。').slice(0, 180);
  return {
    title: `${tool.name} — ${titlePrefix}${tool.catZh} AI 工具 | AIBoxPro`,
    description,
    openGraph: {
      title: `${tool.name} | ${titlePrefix}AIBoxPro`,
      description,
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

function formatFreshnessWarning(iso: string | undefined, days: number, label: string) {
  if (!iso) return `${label}最后更新时间未确认，建议以官网为准`;
  const updatedAt = new Date(iso);
  if (Number.isNaN(updatedAt.getTime())) return `${label}最后更新时间未确认，建议以官网为准`;
  const diffDays = Math.floor((Date.now() - updatedAt.getTime()) / 86_400_000);
  if (diffDays <= days) return `最后更新：${updatedAt.toLocaleDateString('zh-CN')}`;
  return `${label}最后更新：${diffDays} 天前，建议以官网为准`;
}

function FreshnessNotice({
  children,
  warning,
}: {
  children?: React.ReactNode;
  warning: boolean;
}) {
  return (
    <div
      style={{
        marginTop: 8,
        padding: '8px 10px',
        borderRadius: 8,
        background: warning ? '#FEF3C7' : '#F0FDF4',
        color: warning ? '#92400E' : '#166534',
        fontSize: 12,
        lineHeight: 1.5,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

const CONNECTIVITY_CARRIER: Record<string, string> = {
  general: '通用网络',
  telecom: '电信',
  unicom: '联通',
  mobile: '移动',
};

const CONNECTIVITY_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  direct: { label: '直连', bg: '#DCFCE7', color: '#166534' },
  'proxy-needed': { label: '需代理', bg: '#FEF3C7', color: '#92400E' },
  blocked: { label: '受限', bg: '#FEE2E2', color: '#991B1B' },
  unknown: { label: '待确认', bg: '#F3F4F6', color: '#6B7280' },
};

function isStaleConnectivity(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000) > 14;
}

function buildFitNotes(tool: Awaited<ReturnType<typeof loadToolById>>) {
  if (!tool) return { goodFor: [], notFor: [] };

  const goodFor = [
    tool.features?.length ? `需要${tool.features.slice(0, 2).join('、')}能力的用户` : '',
    tool.chinaAccess === 'accessible' ? '希望国内访问门槛更低的中文用户' : '',
    tool.chineseUi ? '偏好中文界面和中文资料的新手' : '',
    tool.apiAvailable ? '需要把能力接入产品或工作流的开发者' : '',
    tool.openSource ? '希望可自部署或二次开发的技术团队' : '',
    tool.pricing === 'Free' ? '预算敏感、希望先免费尝试的个人用户' : '',
    tool.pricing === 'Freemium' ? '想先试用再决定是否付费的个人或小团队' : '',
  ].filter(Boolean).slice(0, 4);

  const notFor = [
    tool.chinaAccess === 'vpn-required' ? '不能接受代理或跨境访问不稳定的用户' : '',
    tool.chinaAccess === 'blocked' ? '需要稳定国内直连的团队' : '',
    !tool.chineseUi ? '必须全中文界面和中文客服的新手用户' : '',
    tool.overseasPaymentOnly ? '只能使用国内支付方式的个人或团队' : '',
    tool.needsOverseasPhone ? '没有海外手机号且不想折腾注册流程的用户' : '',
    tool.pricing === 'Paid' ? '只接受永久免费工具的用户' : '',
  ].filter(Boolean).slice(0, 4);

  return {
    goodFor: goodFor.length ? goodFor : ['想快速评估同类 AI 工具能力的用户'],
    notFor: notFor.length ? notFor : ['需要强人工实测结论的场景，建议结合官方资料和实际试用判断'],
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await loadToolById(slug);
  if (!tool) notFound();

  const [related, relatedArticles, alternativeTools, labReports, connectivity, relatedComparisons] = await Promise.all([
    loadToolsByCategory(tool.cat).then((ts) => ts.filter((t) => t.id !== tool.id).slice(0, 4)),
    loadRelatedArticles(tool.name, 5),
    loadToolsByIds(tool.cnAlternatives ?? []),
    loadLabReportsByToolId(tool.id),
    loadConnectivityByToolId(tool.id),
    loadComparisonsByToolId(tool.id, 5),
  ]);

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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: BASE },
      { '@type': 'ListItem', position: 2, name: tool.catZh, item: `${BASE}/categories/${tool.cat}` },
      { '@type': 'ListItem', position: 3, name: tool.name, item: `${BASE}/tools/${tool.id}` },
    ],
  };

  const ps = PRICING_STYLE[tool.pricing] ?? PRICING_STYLE['Paid'];
  const access = ACCESS_BADGE[tool.chinaAccess ?? 'unknown'];
  const officialUrl = tool.url ?? fallbackToolUrl(tool.name);
  const registerText = tool.registerMethod?.length ? tool.registerMethod.join(' / ') : '未确认';
  const priceText = tool.priceCny ?? tool.pricingDetail ?? (tool.pricing === 'Free' ? '免费' : tool.pricing);
  const pricingNotice = formatFreshnessWarning(tool.pricingUpdatedAt, 30, '价格信息');
  const accessNotice = formatFreshnessWarning(tool.accessUpdatedAt, 14, '国内访问状态');
  const complianceNotice = formatFreshnessWarning(tool.complianceUpdatedAt, 90, '合规状态');
  const fitNotes = buildFitNotes(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div style={{ minHeight: '100vh', background: '#FFF7ED', fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />

        <main style={{ maxWidth: 860, margin: '40px auto', padding: '0 clamp(16px, 5vw, 24px) 64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9CA3AF', fontSize: 13, marginBottom: 18 }}>
            <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>工具库</Link>
            <span>/</span>
            <span style={{ color: '#1F2937', fontWeight: 600 }}>{tool.name}</span>
          </div>

          {/* ── Hero card ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 'clamp(22px, 4vw, 36px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <ToolIcon name={tool.name} mono={tool.mono} brand={tool.brand} url={tool.url} size={80} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(28px, 8vw, 34px)', margin: 0, color: '#1F2937', letterSpacing: '-0.02em' }}>{tool.name}</h1>
                  <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: ps.bg, color: ps.color }}>{tool.pricing}</span>
                  <AccessBadge chinaAccess={tool.chinaAccess} chineseUi={tool.chineseUi} />
                  {tool.featured && <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#FFEDD5', color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Editor&rsquo;s Pick</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
                  <Link href={`/categories/${tool.cat}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#C2410C', background: '#FFEDD5', padding: '2px 10px', borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: 12 }}>
                    {tool.catIcon} {tool.catZh}
                  </Link>
                  <span>·</span>
                  <span>收录于 {tool.date}</span>
                  {(tool.upvotes ?? 0) > 0 && (
                    <>
                      <span>·</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <span>👍</span>
                        <span style={{ fontWeight: 600, color: '#6B7280' }}>{tool.upvotes}</span>
                      </span>
                    </>
                  )}
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
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 32px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 16px', letterSpacing: '-0.01em' }}>About · 工具简介</h2>
            <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.8, margin: '0 0 20px' }}>{tool.en}</p>
            <div style={{ background: '#FFF7ED', borderRadius: 12, padding: 'clamp(14px, 4vw, 18px) clamp(16px, 5vw, 22px)', borderLeft: '4px solid #F97316' }}>
              <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.75, margin: 0 }}>{tool.zh}</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 30px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 18px', letterSpacing: '-0.01em' }}>适合谁使用</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 16 }}>
                <div style={{ color: '#166534', fontSize: 13, fontWeight: 900, marginBottom: 10 }}>更适合</div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                  {fitNotes.goodFor.map((item) => (
                    <li key={item} style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>✓ {item}</li>
                  ))}
                </ul>
              </div>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: 16 }}>
                <div style={{ color: '#C2410C', fontSize: 13, fontWeight: 900, marginBottom: 10 }}>需要谨慎</div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                  {fitNotes.notFor.map((item) => (
                    <li key={item} style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>· {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── 使用教程 ── */}
          {tool.howToUse && tool.howToUse.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 32px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 20px', letterSpacing: '-0.01em' }}>🚀 如何开始使用</h2>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {tool.howToUse.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: '#F97316', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
                    <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, paddingTop: 4 }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ── 功能亮点 ── */}
          {tool.features && tool.features.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 28px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
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

          {/* ── 国内用户须知 card ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #FED7AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(20px, 4vw, 28px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 18px', letterSpacing: '-0.01em' }}>🇨🇳 国内用户须知</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              <div style={{ background: access.bg, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: access.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>访问方式</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: access.color }}>{access.label}</div>
                <FreshnessNotice warning={!tool.accessUpdatedAt || !accessNotice.startsWith('最后更新')}>
                  {accessNotice}
                </FreshnessNotice>
              </div>
              <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 18px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>中文界面</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2937' }}>{tool.chineseUi ? '✅ 支持' : '❌ 不支持'}</div>
              </div>
              <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 18px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>免费额度</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2937' }}>{tool.freeQuota ?? '—'}</div>
              </div>
              <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 18px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>API 开放</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2937' }}>{tool.apiAvailable ? '✅ 可用' : '—'}</div>
              </div>
            </div>
          </div>

          {connectivity.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #FED7AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(20px, 4vw, 28px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 10px', letterSpacing: '-0.01em' }}>国内连通性实测</h2>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: '0 0 14px' }}>
                仅展示最近一次编辑或用户报告，不代表实时状态；超过 14 天的结果会标记为待确认。
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
                  <thead>
                    <tr>
                      {['网络环境', '状态', '延迟', '最后更新', '来源', '备注'].map((label) => (
                        <th key={label} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #F3E8D0', color: '#9CA3AF', fontSize: 12 }}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {connectivity.map((row) => {
                      const stale = isStaleConnectivity(row.reportedAt);
                      const status = stale ? CONNECTIVITY_STATUS.unknown : (CONNECTIVITY_STATUS[row.status] ?? CONNECTIVITY_STATUS.unknown);
                      return (
                        <tr key={row.id}>
                          <td style={{ padding: '12px', borderBottom: '1px solid #F3E8D0', color: '#1F2937', fontWeight: 700 }}>
                            {CONNECTIVITY_CARRIER[row.carrier] ?? row.carrier}{row.region ? ` · ${row.region}` : ''}
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #F3E8D0' }}>
                            <span style={{ padding: '3px 9px', borderRadius: 999, background: status.bg, color: status.color, fontWeight: 800, fontSize: 12 }}>
                              {stale ? '状态待确认' : status.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #F3E8D0', color: '#4B5563' }}>{row.latencyMs ? `${row.latencyMs}ms` : '—'}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #F3E8D0', color: '#4B5563' }}>{row.reportedAt.toLocaleDateString('zh-CN')}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #F3E8D0', color: '#4B5563' }}>{row.source === 'editor' ? '编辑实测' : '用户报告'}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #F3E8D0', color: '#6B7280' }}>{row.note ?? '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #FED7AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(20px, 4vw, 28px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 18px', letterSpacing: '-0.01em' }}>中国用户实操信息</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {[
                { label: '注册方式', value: registerText },
                { label: '海外手机号', value: tool.needsOverseasPhone ? '需要' : '不需要' },
                { label: '实名认证', value: tool.needsRealName ? '需要' : '不需要' },
                { label: '支付限制', value: tool.overseasPaymentOnly ? '仅海外卡/PayPal' : '无明显限制' },
                { label: '人民币价格', value: priceText },
                { label: '微信小程序', value: tool.miniProgram ?? '未确认' },
                { label: '中国区 App Store', value: tool.appStoreCn ? '已上架' : '未确认' },
                { label: '微信公众号', value: tool.publicAccount ?? '未确认' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#FFF7ED', borderRadius: 12, padding: '14px 16px', border: '1px solid #F3E8D0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <FreshnessNotice warning={!tool.complianceUpdatedAt || !complianceNotice.startsWith('最后更新')}>
              {complianceNotice}
            </FreshnessNotice>
          </div>

          {alternativeTools.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #BBF7D0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(20px, 4vw, 28px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 14px', letterSpacing: '-0.01em' }}>国产替代方案</h2>
              <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, margin: '0 0 16px' }}>
                如果当前工具访问或支付不方便，国内用户可以优先试试这些替代品。
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {alternativeTools.map((alt) => (
                  <Link key={alt.id} href={`/tools/${alt.id}`} style={{ display: 'block', padding: '14px 16px', borderRadius: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', textDecoration: 'none' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#166534', marginBottom: 6 }}>{alt.name}</div>
                    <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{alt.zh}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tool.tutorialLinks && tool.tutorialLinks.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(20px, 4vw, 28px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 16px', letterSpacing: '-0.01em' }}>国内教程资源</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tool.tutorialLinks.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderRadius: 10, background: '#FFF7ED', border: '1px solid #F3E8D0', color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                    <span>{link.platform}：{link.title}</span>
                    <span style={{ color: '#F97316' }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Info grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: '定价模式', value: tool.pricing, badge: true },
              { label: '所属分类', value: `${tool.catIcon} ${tool.catZh} · ${tool.catEn}` },
              { label: '收录日期', value: tool.date },
              { label: '编辑推荐', value: tool.featured ? '✅ Editor\'s Pick' : '—' },
            ].map(({ label, value, badge }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8D5B7', padding: '18px 22px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
                {badge
                  ? <><span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: ps.bg, color: ps.color }}>{value}</span><FreshnessNotice warning={!tool.pricingUpdatedAt || !pricingNotice.startsWith('最后更新')}>{pricingNotice}</FreshnessNotice></>
                  : <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{value}</div>
                }
              </div>
            ))}
          </div>

          {/* ── FAQ ── */}
          {tool.faqs && tool.faqs.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 32px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 18px', letterSpacing: '-0.01em' }}>💬 常见问答</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {tool.faqs.map((faq, i) => (
                  <div key={i} style={{ padding: '16px 0', borderBottom: i < tool.faqs!.length - 1 ? '1px solid #F3E8D0' : 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1F2937', marginBottom: 6 }}>Q：{faq.q}</div>
                    <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7 }}>A：{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {labReports.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #C7D2FE', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 32px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 18px', letterSpacing: '-0.01em' }}>
                AIBoxPro Lab
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {labReports.map((report) => (
                  <Link key={report.id} href={`/compare/${report.id}`} style={{ display: 'block', padding: '14px 16px', borderRadius: 12, background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#1F2937', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: '#3730A3', color: '#fff', fontSize: 11, fontWeight: 900 }}>Lab</span>
                      <span style={{ fontSize: 15, fontWeight: 800 }}>{report.title}</span>
                    </div>
                    <div style={{ color: '#4B5563', fontSize: 13, lineHeight: 1.6 }}>{report.summary ?? report.verdict ?? '实测报告已发布。'}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedComparisons.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 32px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 18px', letterSpacing: '-0.01em' }}>
                相关对比
              </h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {relatedComparisons.map((comparison) => (
                  <Link key={comparison.id} href={`/compare/${comparison.id}`} style={{ display: 'block', padding: '14px 16px', borderRadius: 12, background: '#FFF7ED', border: '1px solid #F3E8D0', color: '#1F2937', textDecoration: 'none' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{comparison.title}</div>
                    <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6 }}>{comparison.summary ?? comparison.verdict ?? `${comparison.toolA.name} 与 ${comparison.toolB.name} 的工具选择对比。`}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Related articles ── */}
          {relatedArticles.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 32px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 18px', letterSpacing: '-0.01em' }}>
                📰 相关资讯
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {relatedArticles.map((a) => {
                  const dateStr = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '';
                  const displayTitle = a.titleZh || a.title;
                  return (
                    <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '11px 4px', borderBottom: '1px solid #F3E8D0', textDecoration: 'none', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, maxWidth: '100%' }}>
                        {a.tag && (
                          <span style={{ flexShrink: 0, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: '#FFEDD5', color: '#C2410C' }}>{a.tag}</span>
                        )}
                        <span style={{ fontSize: 14, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{displayTitle}</span>
                      </div>
                      {dateStr && <span style={{ flexShrink: 0, fontSize: 12, color: '#9CA3AF' }}>{dateStr}</span>}
                    </a>
                  );
                })}
              </div>
              <Link href="/news" style={{ display: 'inline-block', marginTop: 14, fontSize: 13, color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>
                查看全部资讯 →
              </Link>
            </div>
          )}

          {/* ── Related tools ── */}
          {related.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 32px) clamp(18px, 5vw, 40px)' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 20px' }}>
                同类工具 · More {tool.catEn}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 14 }}>
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
