import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import { loadPendingEventVerdicts } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const C = { bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563', inkMuted: '#9CA3AF', rule: '#E8D5B7', primary: '#F97316' };
const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

export default async function Page() {
  const { items, total } = await loadPendingEventVerdicts(50);
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 返回总览</Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>事件立场草稿<span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: C.inkMuted }}>待审核 {total} 条</span></h1>
          </div>
          <AdminLogoutButton />
        </div>
        <DraftTable items={items} basePath="/admin/event-verdicts" slugKey="eventId" />
      </div>
    </div>
  );
}

function DraftTable({ items, basePath, slugKey }: { items: { id: string; [k: string]: unknown }[]; basePath: string; slugKey: string }) {
  if (items.length === 0) return <EmptyState cmd="npm run draft:event-verdict <eventId>" />;
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#FFF7ED', borderBottom: '1px solid #E8D5B7' }}>
            {['标识', '分数', '版本', '时间', ''].map((h) => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: C.inkMuted, fontWeight: 700 }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const score = item.antiClicheScore as number | null;
            return (
              <tr key={item.id as string} style={{ borderBottom: '1px solid #E8D5B7' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, color: C.ink, fontWeight: 600 }}>{String(item[slugKey] ?? item.id)}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 8px', borderRadius: 999, background: score != null && score < 60 ? '#FEE2E2' : '#FFEDD5', color: score != null && score < 60 ? '#991B1B' : '#C2410C', fontSize: 12, fontWeight: 700 }}>{score ?? '—'}</span></td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: C.inkMuted }}>{String(item.promptVersion ?? '—').slice(0, 30)}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: C.inkMuted }}>{(item.createdAt as Date).toLocaleDateString('zh-CN')}</td>
                <td style={{ padding: '12px 16px' }}><Link href={`${basePath}/${item.id}`} style={{ color: C.primary, fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>审核 →</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ cmd }: { cmd: string }) {
  return <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9CA3AF' }}>暂无待审核草稿。运行 <code>{cmd}</code> 生成。</div>;
}
