import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import { loadPendingVerdicts } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const C = { bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563', inkMuted: '#9CA3AF', rule: '#E8D5B7', primary: '#F97316', primaryBg: '#FFEDD5', red: '#991B1B', green: '#166534' };
const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

export default async function AdminVerdictsPage() {
  const { items, total } = await loadPendingVerdicts(50);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 返回总览</Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>
              工具立场草稿
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: C.inkMuted }}>待审核 {total} 条</span>
            </h1>
          </div>
          <AdminLogoutButton />
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, overflow: 'hidden' }}>
          {items.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.inkMuted }}>
              暂无待审核草稿。运行 <code>npm run draft:verdict &lt;toolId&gt;</code> 生成。
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FFF7ED', borderBottom: `1px solid ${C.rule}` }}>
                  {['工具 ID', '一句话结论', '立场', '分数', '模型', '时间', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: C.inkMuted, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${C.rule}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.ink, fontWeight: 600 }}>{item.toolId}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.inkSoft, maxWidth: 320 }}>{item.verdictOneLiner.slice(0, 60)}{item.verdictOneLiner.length > 60 ? '…' : ''}</td>
                    <td style={{ padding: '12px 16px' }}><ScoreBadge label={item.positionToday ?? '—'} /></td>
                    <td style={{ padding: '12px 16px' }}><ScoreBadge label={item.antiClicheScore != null ? String(item.antiClicheScore) : '—'} warn={(item.antiClicheScore ?? 100) < 60} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: C.inkMuted }}>{item.llmModel.slice(0, 20)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: C.inkMuted }}>{item.createdAt.toLocaleDateString('zh-CN')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link href={`/admin/verdicts/${item.id}`} style={{ color: C.primary, fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>审核 →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ label, warn }: { label: string; warn?: boolean }) {
  return (
    <span style={{ padding: '3px 8px', borderRadius: 999, background: warn ? '#FEE2E2' : '#FFEDD5', color: warn ? '#991B1B' : '#C2410C', fontSize: 12, fontWeight: 700 }}>{label}</span>
  );
}
