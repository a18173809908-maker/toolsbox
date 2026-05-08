import Link from 'next/link';
import { loadAdminCounts } from '@/lib/db/queries';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#6B7280', rule: '#E8D5B7', primary: '#F97316',
};

const FONT =
  'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

export default async function AdminPage() {
  const counts = await loadAdminCounts();

  const badges = [
    { label: '待审核工具候选', value: counts.pendingTools, href: '/admin/tools' },
    { label: '待审核对比页', value: counts.pendingComparisons, href: '/admin/comparisons' },
    { label: '近 30 天资讯', value: counts.recentArticles, href: '/admin/articles' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: FONT,
        padding: 'clamp(20px, 4vw, 40px)',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: C.ink,
                fontFamily: 'Georgia, serif',
              }}
            >
              AIBoxPro Admin
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.inkMuted }}>
              今日已审核 {counts.todayReviewed} 条
            </p>
          </div>
          <AdminLogoutButton />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {badges.map((b) => (
            <Link key={b.href} href={b.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: C.panel,
                  border: `1px solid ${C.rule}`,
                  borderRadius: 12,
                  padding: '24px 28px',
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: C.primary,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {b.value}
                </div>
                <div style={{ fontSize: 14, color: C.inkSoft }}>{b.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
