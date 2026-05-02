import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { AccessBadge, ToolIcon } from '@/components/ToolBadges';
import { loadToolById, loadAllToolIds, loadToolsByCategory, loadRelatedArticles, loadToolsByIds } from '@/lib/db/queries';

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
  const featureText = tool.features?.slice(0, 3).join('、');
  const description = [tool.zh, featureText, access?.label].filter(Boolean).join('。').slice(0, 180);
  return {
    title: `${tool.name} — ${titlePrefix}${tool.catZh} AI 工具 | AiToolsBox`,
    description,
    openGraph: {
      title: `${tool.name} | ${titlePrefix}AiToolsBox`,
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

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await loadToolById(slug);
  if (!tool) notFound();

  const [related, relatedArticles, alternativeTools] = await Promise.all([
    loadToolsByCategory(tool.cat).then((ts) => ts.filter((t) => t.id !== tool.id).slice(0, 4)),
    loadRelatedArticles(tool.name, 5),
    loadToolsByIds(tool.cnAlternatives ?? []),
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
                  ? <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: ps.bg, color: ps.color }}>{value}</span>
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
