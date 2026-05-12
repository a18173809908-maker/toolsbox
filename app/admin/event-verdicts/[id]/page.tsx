import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import DraftReviewActions from '@/components/admin/DraftReviewActions';
import { loadEventVerdictById } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const C = { bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563', inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0' };
const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  const item = await loadEventVerdictById(id);
  if (!item) notFound();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/event-verdicts" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 事件立场草稿</Link>
            <h1 style={{ margin: 0, color: C.ink, fontSize: 20 }}>审核事件立场</h1>
          </div>
          <AdminLogoutButton />
        </div>

        <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px 20px', marginBottom: 20 }}>
            <Field label="事件 ID" value={item.eventId} />
            <Field label="影响级别" value={item.impactLevel ?? '—'} />
            <Field label="反套话分" value={item.antiClicheScore != null ? `${item.antiClicheScore}/100` : '—'} />
            <Field label="Prompt 版本" value={item.promptVersion} />
            <Field label="模型" value={item.llmModel} />
          </div>
          <h2 style={{ margin: '0 0 8px', color: C.ink, fontSize: 15 }}>一句话判断</h2>
          <p style={{ margin: '0 0 16px', color: C.ink, fontSize: 15, lineHeight: 1.6 }}>{item.verdictOneLiner}</p>
          {item.chinaImpact && <><h3 style={{ margin: '0 0 6px', color: C.ink, fontSize: 14 }}>国内影响</h3><p style={{ margin: '0 0 16px', color: C.inkSoft, fontSize: 14 }}>{item.chinaImpact}</p></>}
          {item.whoShouldCare && item.whoShouldCare.length > 0 && (
            <><h3 style={{ margin: '0 0 6px', color: C.ink, fontSize: 14 }}>谁该关注</h3>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20, color: C.inkSoft, lineHeight: 1.7, fontSize: 14 }}>
                {item.whoShouldCare.map((s, i) => <li key={i}>{s}</li>)}
              </ul></>
          )}
          {item.caveats && item.caveats.length > 0 && (
            <><h3 style={{ margin: '0 0 6px', color: C.ink, fontSize: 14 }}>注意事项</h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: C.inkSoft, lineHeight: 1.7, fontSize: 14 }}>
                {item.caveats.map((c, i) => <li key={i}>{c}</li>)}
              </ul></>
          )}
        </section>

        <DraftReviewActions id={id} apiBase="/api/admin/event-verdicts" listPath="/admin/event-verdicts" publishLabel="发布事件立场" />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `1px solid ${C.ruleSoft}`, paddingBottom: 10 }}>
      <div style={{ color: C.inkMuted, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ color: C.inkSoft, fontSize: 13, wordBreak: 'break-all' }}>{value}</div>
    </div>
  );
}
