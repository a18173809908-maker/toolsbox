import Link from 'next/link';
import { loadAllToolsForAdmin } from '@/lib/db/queries';
import FeaturedToggle from './FeaturedToggle';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#6B7280', rule: '#E8D5B7', primary: '#F97316', accent: '#C2410C',
};

const FONT =
  'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

const PRICING_STYLE: Record<string, { bg: string; color: string }> = {
  Free: { bg: '#DCFCE7', color: '#16A34A' },
  Freemium: { bg: '#FFEDD5', color: '#C2410C' },
  Paid: { bg: '#F3F4F6', color: '#374151' },
};

export default async function AdminFeaturedPage() {
  const all = await loadAllToolsForAdmin();
  const featuredCount = all.filter((t) => t.featured).length;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ fontSize: 13, color: C.inkMuted, textDecoration: 'none' }}>
            ← 返回 Admin 主页
          </Link>
          <h1 style={{ margin: '8px 0 4px', fontSize: 24, fontWeight: 700, color: C.ink, fontFamily: 'Georgia, serif' }}>
            编辑推荐管理
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: C.inkMuted }}>
            共 {all.length} 个已发布工具，其中 {featuredCount} 个标记为「编辑推荐」（首页展示前 6 个）
          </p>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, overflow: 'hidden' }}>
          {all.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.inkMuted, fontSize: 14 }}>暂无工具数据</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#FAF5EA' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: C.inkSoft, fontSize: 12 }}>工具</th>
                  <th style={{ textAlign: 'left', padding: '12px 12px', fontWeight: 700, color: C.inkSoft, fontSize: 12 }}>分类</th>
                  <th style={{ textAlign: 'left', padding: '12px 12px', fontWeight: 700, color: C.inkSoft, fontSize: 12 }}>定价</th>
                  <th style={{ textAlign: 'left', padding: '12px 12px', fontWeight: 700, color: C.inkSoft, fontSize: 12 }}>国内访问</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: C.inkSoft, fontSize: 12 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {all.map((tool, idx) => {
                  const ps = PRICING_STYLE[tool.pricing] ?? PRICING_STYLE['Paid'];
                  return (
                    <tr key={tool.id} style={{ borderTop: idx === 0 ? 'none' : `1px solid ${C.rule}` }}>
                      <td style={{ padding: '12px 16px' }}>
                        <Link
                          href={`/tools/${tool.id}`}
                          target="_blank"
                          style={{ color: C.ink, fontWeight: 600, textDecoration: 'none' }}
                        >
                          {tool.name}
                        </Link>
                        <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>{tool.id}</div>
                      </td>
                      <td style={{ padding: '12px 12px', color: C.inkSoft }}>{tool.catId}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: ps.bg, color: ps.color }}>
                          {tool.pricing}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px', color: C.inkSoft, fontSize: 12 }}>
                        {tool.chinaAccess === 'accessible' ? '🟢 直连' : tool.chinaAccess === 'vpn-required' ? '🟡 需 VPN' : tool.chinaAccess === 'blocked' ? '🔴 屏蔽' : '⚪ 未知'}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <FeaturedToggle slug={tool.id} featured={tool.featured} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: C.inkMuted, lineHeight: 1.6 }}>
          ⚠️ 首页「编辑推荐」按 publishedAt 倒序展示前 6 个 featured 工具。
          后续接入 PV / upvotes 数据后会改为综合权重排序，届时此页面继续作为编辑加权入口保留。
        </p>
      </div>
    </div>
  );
}
