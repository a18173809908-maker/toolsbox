import Link from 'next/link';
import { loadToolUpdates } from '@/lib/db/queries';
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
  if (status === 'rejected')  return { label: '已拒绝', bg: '#FEE2E2', color: '#991B1B' };
  return { label: '待审核', bg: C.warnBg, color: C.warn };
}

function typeLabel(t: string) {
  return t === 'tutorial' ? '📖 教程' : '⚡ 动态';
}

export default async function AdminToolUpdatesPage() {
  const items = await loadToolUpdates(60);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px,4vw,40px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 返回总览</Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>工具动态管理</h1>
          </div>
          <AdminLogoutButton />
        </div>

        <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/api/cron/tool-updates" style={{ padding: '8px 16px', background: C.primary, color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            ▶ 立即抓取本周动态
          </Link>
          <Link href="/spotlight" style={{ padding: '8px 16px', background: C.panel, border: `1px solid ${C.rule}`, color: C.ink, borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            公开页面 →
          </Link>
        </div>

        {items.length === 0 ? (
          <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 40, textAlign: 'center', color: C.inkMuted }}>
            暂无内容。点击「立即抓取」触发首次生成（需要 YOUTUBE_API_KEY）。
          </div>
        ) : (
          <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.ruleSoft }}>
                    {['工具', '类型', '标题', '频道', '周次', '状态', '操作'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.inkSoft, fontWeight: 600, borderBottom: `1px solid ${C.rule}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const badge = statusBadge(item.status);
                    return (
                      <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? `1px solid ${C.ruleSoft}` : 'none' }}>
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: C.ink, whiteSpace: 'nowrap' }}>{item.toolName}</td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', fontSize: 12 }}>{typeLabel(item.contentType)}</td>
                        <td style={{ padding: '11px 14px', color: C.ink, maxWidth: 260 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.titleZh ?? <span style={{ color: C.inkMuted }}>（未生成）</span>}
                          </div>
                        </td>
                        <td style={{ padding: '11px 14px', color: C.inkMuted, fontSize: 12, whiteSpace: 'nowrap' }}>{item.sourceChannel ?? '—'}</td>
                        <td style={{ padding: '11px 14px', color: C.inkMuted, whiteSpace: 'nowrap' }}>{item.snapshotWeek}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 999, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600 }}>{badge.label}</span>
                        </td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <Link href={`/admin/tool-updates/${item.id}`} style={{ color: C.primary, textDecoration: 'none', fontWeight: 600, fontSize: 12 }}>审核 →</Link>
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
