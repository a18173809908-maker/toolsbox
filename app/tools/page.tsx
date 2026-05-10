import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { AccessBadge, ToolIcon } from '@/components/ToolBadges';
import { loadToolsPage, loadAllCategories } from '@/lib/db/queries';

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
  // Remove empty values
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

  const [{ items, total }, cats] = await Promise.all([
    loadToolsPage({ cat: cat || undefined, pricing: pricing || undefined, china: china || undefined, q: q || undefined, page, pageSize }),
    // 计数应用其他已激活筛选（不含 cat），保持徽章数与列表数一致
    loadAllCategories({ pricing: pricing || undefined, china: china || undefined, q: q || undefined }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  // 「全部」徽章 = 应用其他筛选后跨所有分类的总数（cats 已按 pricing/china/q 过滤，求和即可）
  const allCatsTotal = cats.reduce((sum, c) => sum + c.count, 0);

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

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(28px, 6vw, 36px) clamp(16px, 5vw, 24px) 64px' }}>

          {/* Hero */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(30px, 8vw, 38px)', color: C.ink, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              AI 工具库
            </h1>
          </div>

          {/* Category pills */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 16, paddingBottom: 4 }}>
            <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
              <Link
                href={buildUrl(sp, { cat: '', page: '1' })}
                style={{
                  padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: !cat ? 700 : 500,
                  background: !cat ? C.ink : C.panel,
                  color: !cat ? '#fff' : C.inkSoft,
                  border: `1px solid ${!cat ? C.ink : C.rule}`,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                全部
                {allCatsTotal > 0 && <span style={{ marginLeft: 5, opacity: 0.6, fontSize: 11 }}>{allCatsTotal}</span>}
              </Link>
              {cats.map((c) => {
                const active = cat === c.id;
                return (
                  <Link
                    key={c.id}
                    href={buildUrl(sp, { cat: c.id, page: '1' })}
                    style={{
                      padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: active ? 700 : 500,
                      background: active ? C.ink : C.panel,
                      color: active ? '#fff' : C.inkSoft,
                      border: `1px solid ${active ? C.ink : C.rule}`,
                      textDecoration: 'none', whiteSpace: 'nowrap',
                    }}
                  >
                    {c.icon} {c.zh}
                    {c.count > 0 && <span style={{ marginLeft: 5, opacity: 0.6, fontSize: 11 }}>{c.count}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap' }}>
            {/* Pricing */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: C.inkMuted, fontWeight: 600, marginRight: 2 }}>定价</span>
              {PRICING_OPTS.map((opt) => {
                const active = pricing === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={buildUrl(sp, { pricing: opt.value, page: '1' })}
                    style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: active ? 700 : 500,
                      background: active ? C.primaryBg : 'transparent',
                      color: active ? C.accent : C.inkSoft,
                      border: `1px solid ${active ? C.accent : C.rule}`,
                      textDecoration: 'none',
                    }}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>

            {/* China access */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: C.inkMuted, fontWeight: 600, marginRight: 2 }}>地区</span>
              {CHINA_OPTS.map((opt) => {
                const active = china === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={buildUrl(sp, { china: opt.value, page: '1' })}
                    style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: active ? 700 : 500,
                      background: active ? C.primaryBg : 'transparent',
                      color: active ? C.accent : C.inkSoft,
                      border: `1px solid ${active ? C.accent : C.rule}`,
                      textDecoration: 'none',
                    }}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>

            {/* Clear filters */}
            {(cat || pricing || china || q) && (
              <Link
                href="/tools"
                style={{ fontSize: 12, color: C.inkMuted, textDecoration: 'underline', marginLeft: 'auto' }}
              >
                清除筛选
              </Link>
            )}
          </div>

          {/* Results */}
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: C.inkMuted }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 15 }}>没有找到匹配的工具</p>
              <Link href="/tools" style={{ color: C.primary, textDecoration: 'none', fontSize: 14 }}>清除筛选条件</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
              {items.map((tool) => {
                const ps = PRICING_STYLE[tool.pricing] ?? PRICING_STYLE['Paid'];
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div style={{
                      background: C.panel, borderRadius: 14, border: `1px solid ${C.rule}`,
                      padding: '20px 22px', height: '100%', boxSizing: 'border-box',
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

                      <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                        <p style={{
                          fontSize: 12, color: C.inkSoft, margin: 0, lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const,
                          overflow: 'hidden',
                        }}>
                          {fitLine(tool)}
                        </p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: C.ruleSoft, color: C.inkSoft }}>
                            {heatText(tool)}
                          </span>
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
              {page > 1 && (
                <Link
                  href={buildUrl(sp, { page: String(page - 1) })}
                  style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.rule}`, background: C.panel, color: C.inkSoft, textDecoration: 'none', fontSize: 14 }}
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
                  style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.rule}`, background: C.panel, color: C.inkSoft, textDecoration: 'none', fontSize: 14 }}
                >
                  下一页 →
                </Link>
              )}
            </div>
          )}

        </main>
      </div>
    </>
  );
}
