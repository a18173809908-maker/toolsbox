import Link from 'next/link';
import { loadJobsStatus } from '@/lib/db/queries';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
  successBg: '#DCFCE7', success: '#166534',
};

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

function fmtDate(d: Date | null | undefined) {
  if (!d) return '—';
  return new Date(d).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}

function timeAgo(d: Date | null | undefined): string {
  if (!d) return '从未运行';
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return '< 1 小时前';
  if (h < 24) return `${h} 小时前`;
  const days = Math.floor(h / 24);
  return `${days} 天前`;
}

function staleness(d: Date | null | undefined): 'ok' | 'warn' | 'stale' {
  if (!d) return 'stale';
  const h = (Date.now() - new Date(d).getTime()) / 3600000;
  if (h < 25) return 'ok';
  if (h < 72) return 'warn';
  return 'stale';
}

export default async function AdminJobsPage() {
  const jobs = await loadJobsStatus();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>
              ← 返回总览
            </Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>
              自动化任务状态
            </h1>
          </div>
          <AdminLogoutButton />
        </div>

        <p style={{ margin: '0 0 24px', fontSize: 13, color: C.inkMuted }}>
          根据各表最新活动时间推断，非精确运行日志。黄色 = 超 24h，红色 = 超 72h。
        </p>

        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.ruleSoft }}>
                  {['任务', '说明', '最近活动', '距今', '数量'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: C.inkSoft, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: `1px solid ${C.rule}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => {
                  const s = staleness(job.latestAt);
                  const dotColor = s === 'ok' ? C.success : s === 'warn' ? '#92400E' : '#991B1B';
                  const dotBg = s === 'ok' ? C.successBg : s === 'warn' ? '#FEF3C7' : '#FEE2E2';
                  return (
                    <tr key={job.job} style={{ borderBottom: i < jobs.length - 1 ? `1px solid ${C.ruleSoft}` : 'none' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: C.inkSoft }}>
                        {job.job}
                      </td>
                      <td style={{ padding: '12px 16px', color: C.ink, fontWeight: 500 }}>
                        {job.desc}
                      </td>
                      <td style={{ padding: '12px 16px', color: C.inkMuted, whiteSpace: 'nowrap', fontSize: 12 }}>
                        {fmtDate(job.latestAt)}
                      </td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: dotBg, color: dotColor, fontSize: 12, fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
                          {timeAgo(job.latestAt)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: C.inkSoft }}>
                        <span style={{ fontWeight: 600, color: C.ink }}>{job.recentCount}</span>
                        <span style={{ color: C.inkMuted, fontSize: 11, marginLeft: 4 }}>{job.recentLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { label: '手动触发事件聚合', href: '/api/cron/cluster-events', note: '需要 CRON_SECRET' },
            { label: '手动触发资讯抓取', href: '/api/cron/fetch-articles', note: '需要 CRON_SECRET' },
            { label: '手动触发 GitHub Trending', href: '/api/cron/fetch-trending', note: '需要 CRON_SECRET' },
          ].map((link) => (
            <div key={link.href} style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{link.label}</div>
              <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 8 }}>{link.href}</div>
              <div style={{ fontSize: 11, color: C.inkMuted }}>{link.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
