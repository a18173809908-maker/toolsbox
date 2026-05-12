import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { AccessBadge, ToolIcon } from '@/components/ToolBadges';
import { loadToolsPage, loadAllCategories, loadToolCount } from '@/lib/db/queries';
import { SearchInput } from './SearchInput';

export const dynamic = 'force-dynamic';

const BASE = 'https://aiboxpro.cn';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
  green: '#16A34A', greenBg: '#DCFCE7',
};

const PRICING_OPTS = [
  { value: '',          label: '全部' },
  { value: 'Free',      label: '免费' },
  { value: 'Freemium',  label: 'Freemium' },
  { value: 'Paid',      label: '付费' },
];

const CHINA_OPTS = [
  { value: '',            label: '全部地区' },
  { value: 'accessible',  label: '🟢 国内直连' },
  { value: 'vpn-required',label: '🟡 需要VPN' },
];

const PRICING_STYLE: Record<string, { bg: string; color: string }> = {
  Free:     { bg: '#DCFCE7', color: '#16A34A' },
  Freemium: { bg: '#FFEDD5', color: '#C2410C' },
  Paid:     { bg: '#F3F4F6', color: '#374151' },
};

function fitLine(tool: {
  features: string[] | null;
  chineseUi: boolean;
  apiAvailable: boolean;
  openSource: boolean;
}) {
  if (tool.features?.length) return `适合：${tool.features.slice(0, 2).join('、')}`;
  if (tool.apiAvailable) return '适合：需要 API 集成的开发者或团队';
  if (tool.openSource) return '适合：偏好开源方案的技术用户';
  if (tool.chineseUi) return '适合：优先中文界面的国内用户';
  return '适合：先快速试用并评估工具能力';
}

function heatText(tool: { featured: boolean; upvotes: number; downvotes: number }) {
  const score = (tool.featured ? 1000 : 0) + tool.upvotes - tool.downvotes;
  if (tool.featured) return '编辑推荐';
  if (score > 0) return `热度 ${score}`;
  return '新近收录';
}

function priceText(tool: { pricing: string; priceCny?: string | null; pricingDetail?: string | null }) {
  if (tool.priceCny) return tool.priceCny;
  if (tool.pricingDetail) return tool.pricingDetail;
  if (tool.pricing === 'Free') return '免费';
  if (tool.pricing === 'Freemium') return '免费试用';
  return '付费';
}

function accessText(value: string) {
  if (value === 'accessible') return '国内直连';
  if (value === 'vpn-required') return '需代理';
  if (value === 'blocked') return '受限';
  return '待确认';
}

function chineseText(value: boolean) {
  return value ? '支持中文' : '英文为主';
}

type SearchParams = { cat?: string; pricing?: string; china?: string; q?: string; page?: string };
type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const cats = await loadAllCategories();
  const catMeta = cats.find((c) => c.id === sp.cat);
  const title = catMeta ? `${catMeta.zh} AI 工具 | AIBoxPro` : 'AI 工具库 | AIBoxPro';
  const desc = catMeta
    ? `精选${catMeta.zh}类 AI 工具，含国内可用标注与定价信息。`
    : '精选 AI 工具导航，国内可用标注、定价与功能对比一览。';
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, url: `${BASE}/tools`, type: 'website' },
    alternates: { canonical: '/tools' },
  };
}

function buildUrl(base: SearchParams, override: Partial<SearchParams>) {
  const p = { ...base, ...override };
  const entries = Object.entries(p).filter(([, v]) => v && v !== '');
  if (entries.length === 0) return '/tools';
  return '/tools?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&');
}

export default async function ToolsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cat     = sp.cat ?? '';
  const pricing = sp.pricing ?? '';
  const china   = sp.china ?? '';
  const q       = sp.q ?? '';
  const page    = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const pageSize = 24;

  const [{ items, total }, cats, toolCount] = await Promise.all([
    loadToolsPage({ cat: cat || undefined, pricing: pricing || undefined, china: china || undefined, q: q || undefined, page, pageSize }),
    loadAllCategories({ pricing: pricing || undefined, china: china || undefined, q: q || undefined }),
    loadToolCount(),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const hasFilter = !!(cat || pricing || china || q);
  const categoryById = new Map(cats.map((c) => [c.id, c]));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI 工具库 | AIBoxPro',
    description: '精选 AI 工具导航，国内可用标注、定价与功能对比一览。',
    url: `${BASE}/tools`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>

        <SiteHeader />

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(28px, 6vw, 36px) clamp(16px, 5vw, 24px) 64px' }}>

          {/* Hero Section */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(30px, 8vw, 38px)', color: C.ink, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              AI 工具库
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              <p style={{ fontSize: 15, color: C.inkSoft, margin: 0 }}>
                精选 {toolCount} 个 AI 工具，覆盖多种场景与需求
              </p>
              {hasFilter && (
                <span style={{ fontSize: 13, color: C.accent, fontWeight: 700, background: C.primaryBg, padding: '2px 10px', borderRadius: 999 }}>
                  筛选中：共 {total} 个结果
                </span>
              )}
            </div>
          </div>

          {/* Sidebar + Main Content Layout */}
          <div style={{ display: 'flex', gap: 24 }}>
            {/* Sidebar */}
            <aside style={{
              width: 260,
              flexShrink: 0,
              position: 'sticky',
              top: 24,
              height: 'fit-content',
            }}>
              <div style={{ background: C.panel, borderRadius: 14, border: `1px solid ${C.rule}`, padding: '20px' }}>
                {/* Search Input */}
                <div style={{ marginBottom: 20 }}>
                  <SearchInput defaultValue={q} />
                </div>

                {/* Category Filter */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <svg style={{ width: 16, height: 16, color: C.primary, marginRight: 8 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>分类</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link
                      href={buildUrl(sp, { cat: '', page: '1' })}
                      className="sidebar-filter-item"
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: !cat ? 600 : 400,
                        background: !cat ? C.primaryBg : 'transparent',
                        color: !cat ? C.accent : C.inkSoft,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      全部
                      <span style={{ float: 'right', opacity: 0.6 }}>{hasFilter ? total : toolCount}</span>
                    </Link>
                    {cats.map((c) => {
                      const active = cat === c.id;
                      return (
                        <Link
                          key={c.id}
                          href={buildUrl(sp, { cat: c.id, page: '1' })}
                          className="sidebar-filter-item"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: active ? 600 : 400,
                            background: active ? C.primaryBg : 'transparent',
                            color: active ? C.accent : C.inkSoft,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {c.icon} {c.zh}
                          <span style={{ float: 'right', opacity: 0.6 }}>{c.count}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Region Filter */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <svg style={{ width: 16, height: 16, color: C.primary, marginRight: 8 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>地区</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {CHINA_OPTS.map((opt) => {
                      const active = china === opt.value;
                      return (
                        <Link
                          key={opt.value}
                          href={buildUrl(sp, { china: opt.value, page: '1' })}
                          className="sidebar-filter-item"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: active ? 600 : 400,
                            background: active ? C.primaryBg : 'transparent',
                            color: active ? C.accent : C.inkSoft,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {opt.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Filter */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <svg style={{ width: 16, height: 16, color: C.primary, marginRight: 8 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>定价</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {PRICING_OPTS.map((opt) => {
                      const active = pricing === opt.value;
                      return (
                        <Link
                          key={opt.value}
                          href={buildUrl(sp, { pricing: opt.value, page: '1' })}
                          className="sidebar-filter-item"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: active ? 600 : 400,
                            background: active ? C.primaryBg : 'transparent',
                            color: active ? C.accent : C.inkSoft,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {opt.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Filters */}
                {(cat || pricing || china || q) && (
                  <Link
                    href="/tools"
                    className="clear-filter"
                    style={{
                      display: 'block',
                      padding: '10px',
                      borderRadius: 8,
                      backgroundColor: C.ruleSoft,
                      color: C.inkSoft,
                      textDecoration: 'none',
                      fontSize: 13,
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    清除所有筛选
                  </Link>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Results */}
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: C.inkMuted }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <h3 style={{ fontSize: 18, color: C.ink, margin: 0 }}>没有找到匹配的工具</h3>
                  <p style={{ fontSize: 14, marginTop: 8 }}>试试调整筛选条件或搜索其他关键词</p>
                  <Link href="/tools" style={{ color: C.primary, textDecoration: 'none', fontSize: 14, display: 'inline-block', marginTop: 12 }}>
                    返回工具库首页
                  </Link>
                </div>
              ) : (
                <>
                  {/* Results Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 13, color: C.inkSoft }}>
                      共找到 <strong style={{ color: C.ink }}>{total}</strong> 个工具
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
                    {items.map((tool) => {
                      const ps = PRICING_STYLE[tool.pricing] ?? PRICING_STYLE['Paid'];
                      return (
                        <Link
                          key={tool.id}
                          href={`/tools/${tool.id}`}
                          className="tool-card-link"
                          style={{ textDecoration: 'none', display: 'block' }}
                        >
                          <div style={{
                            background: C.panel,
                            borderRadius: 14,
                            border: `1px solid ${C.rule}`,
                            padding: '20px 22px',
                            height: '100%',
                            boxSizing: 'border-box',
                            transition: 'all 0.2s ease',
                          }}>
                            {/* Header row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                              <ToolIcon name={tool.name} mono={tool.mono} brand={tool.brand} url={tool.url} size={44} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 4 }}>
                                  {tool.name}
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: ps.bg, color: ps.color }}>
                                    {tool.pricing}
                                  </span>
                                  <AccessBadge chinaAccess={tool.chinaAccess} compact />
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <p style={{
                              fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.55,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                              overflow: 'hidden',
                            }}>
                              {tool.zh || tool.en}
                            </p>

                            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                                {[
                                  ['价格', priceText(tool)],
                                  ['国内', accessText(tool.chinaAccess)],
                                  ['中文', chineseText(tool.chineseUi)],
                                ].map(([label, value]) => (
                                  <div key={label} style={{ border: `1px solid ${C.ruleSoft}`, borderRadius: 8, padding: '8px 9px', background: '#FFFDF9', minWidth: 0 }}>
                                    <div style={{ color: C.inkMuted, fontSize: 10, fontWeight: 800, marginBottom: 4 }}>{label}</div>
                                    <div style={{ color: C.ink, fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                                  </div>
                                ))}
                              </div>
                              <p style={{ fontSize: 12, color: C.inkSoft, margin: 0, lineHeight: 1.55 }}>
                                {fitLine(tool)}
                              </p>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: C.ruleSoft, color: C.inkSoft }}>
                                  {heatText(tool)}
                                </span>
                                {categoryById.get(tool.catId) && (
                                  <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#F8FAFC', color: C.inkMuted }}>
                                    {categoryById.get(tool.catId)?.zh}
                                  </span>
                                )}
                                {tool.cnAlternatives && tool.cnAlternatives.length > 0 && (
                                  <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: C.greenBg, color: C.green }}>
                                    有替代
                                  </span>
                                )}
                                {tool.freeQuota && (
                                  <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#F8FAFC', color: C.inkMuted }}>
                                    {tool.freeQuota}
                                  </span>
                                )}
                                {tool.apiAvailable && (
                                  <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#EFF6FF', color: '#1D4ED8' }}>
                                    API
                                  </span>
                                )}
                                {tool.openSource && (
                                  <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#F0FDF4', color: '#166534' }}>
                                    开源
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
                  {page > 1 && (
                    <Link
                      href={buildUrl(sp, { page: String(page - 1) })}
                      style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.rule}`, background: C.panel, color: C.inkSoft, textDecoration: 'none', fontSize: 14, transition: 'all 0.2s ease' }}
                    >
                      ← 上一页
                    </Link>
                  )}
                  <span style={{ fontSize: 13, color: C.inkMuted }}>
                    第 {page} / {totalPages} 页，共 {total} 个工具
                  </span>
                  {page < totalPages && (
                    <Link
                      href={buildUrl(sp, { page: String(page + 1) })}
                      style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.rule}`, background: C.panel, color: C.inkSoft, textDecoration: 'none', fontSize: 14, transition: 'all 0.2s ease' }}
                    >
                      下一页 →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
