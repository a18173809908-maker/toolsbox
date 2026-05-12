import Link from 'next/link';
import { loadRepoSpotlights } from '@/lib/db/queries';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5',
  successBg: '#DCFCE7', success: '#166534',
  warnBg: '#FEF3C7', warn: '#92400E',
};

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

function statusBadge(status: string) {
  if (status === 'published') return { label: '已发布', bg: C.successBg, color: C.success };
  if (status === 'rejected') return { label: '已拒绝', bg: '#FEE2E2', color: '#991B1B' };
  return { label: '待审核', bg: C.warnBg, color: C.warn };
}

export default async function AdminSpotlightsPage() {
  const spots = await loadRepoSpotlights(50);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 返回总览</Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>仓库 Spotlight 管理</h1>
          </div>
          <AdminLogoutButton />
        </div>

        <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/api/cron/repo-spotlight"
            style={{ padding: '8px 16px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            ▶ 立即生成本周 Spotlight
          </Link>
          <Link
            href="/spotlight"
            style={{ padding: '8px 16px', background: C.panel, border: `1px solid ${C.rule}`, color: C.ink, borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            公开页面 →
          </Link>
        </div>

        {spots.length === 0 ? (
          <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 40, textAlign: 'center', color: C.inkMuted }}>
            暂无 Spotlight。点击「立即生成」触发首次生成。
          </div>
        ) : (
          <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.ruleSoft }}>
                    {['仓库', '标题', '周次', '排名', '状态', '操作'].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: C.inkSoft, fontWeight: 600, borderBottom: `1px solid ${C.rule}`, whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spots.map((s, i) => {
                    const badge = statusBadge(s.status);
                    return (
                      <tr key={s.id} style={{ borderBottom: i < spots.length - 1 ? `1px solid ${C.ruleSoft}` : 'none' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: C.inkSoft, whiteSpace: 'nowrap' }}>
                          {s.repo}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.ink, maxWidth: 280 }}>
                          {s.titleZh ?? <span style={{ color: C.inkMuted }}>（未生成）</span>}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.inkMuted, whiteSpace: 'nowrap' }}>
                          {s.snapshotWeek}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.inkSoft, textAlign: 'center' }}>
                          #{s.rankInWeek}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 999, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600 }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <Link href={`/admin/spotlights/${s.id}`} style={{ color: C.primary, textDecoration: 'none', fontWeight: 600, fontSize: 12 }}>
                            审核 →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
