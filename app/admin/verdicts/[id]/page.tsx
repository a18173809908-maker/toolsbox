import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import DraftReviewActions from '@/components/admin/DraftReviewActions';
import { loadVerdictById } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const C = { bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563', inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0' };
const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

type Props = { params: Promise<{ id: string }> };

export default async function VerdictDetailPage({ params }: Props) {
  const { id } = await params;
  const verdict = await loadVerdictById(id);
  if (!verdict) notFound();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/verdicts" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 立场草稿</Link>
            <h1 style={{ margin: 0, color: C.ink, fontSize: 20 }}>审核工具立场</h1>
          </div>
          <AdminLogoutButton />
        </div>

        <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px 20px', marginBottom: 20 }}>
            <Field label="工具 ID" value={verdict.toolId} />
            <Field label="立场标签" value={verdict.positionToday ?? '—'} />
            <Field label="反套话分" value={verdict.antiClicheScore != null ? `${verdict.antiClicheScore}/100` : '—'} />
            <Field label="Prompt 版本" value={verdict.promptVersion} />
            <Field label="模型" value={verdict.llmModel} />
            <Field label="创建时间" value={verdict.createdAt.toLocaleString('zh-CN')} />
          </div>

          <h2 style={{ margin: '0 0 10px', color: C.ink, fontSize: 16 }}>一句话结论</h2>
          <p style={{ margin: '0 0 20px', color: C.ink, fontSize: 15, lineHeight: 1.6 }}>{verdict.verdictOneLiner}</p>

          {verdict.whoShouldPick && verdict.whoShouldPick.length > 0 && (
            <><h3 style={{ margin: '0 0 8px', color: C.ink, fontSize: 14 }}>适合谁</h3>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20, color: C.inkSoft, lineHeight: 1.7, fontSize: 14 }}>
                {verdict.whoShouldPick.map((s, i) => <li key={i}>{s}</li>)}
              </ul></>
          )}
          {verdict.whoShouldSkip && verdict.whoShouldSkip.length > 0 && (
            <><h3 style={{ margin: '0 0 8px', color: C.ink, fontSize: 14 }}>不适合谁</h3>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20, color: C.inkSoft, lineHeight: 1.7, fontSize: 14 }}>
                {verdict.whoShouldSkip.map((s, i) => <li key={i}>{s}</li>)}
              </ul></>
          )}
          {verdict.vsAlternatives && verdict.vsAlternatives.length > 0 && (
            <><h3 style={{ margin: '0 0 8px', color: C.ink, fontSize: 14 }}>vs 替代品</h3>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20, color: C.inkSoft, lineHeight: 1.7, fontSize: 14 }}>
                {verdict.vsAlternatives.map((v, i) => <li key={i}><strong>{v.alt}</strong>：{v.point}</li>)}
              </ul></>
          )}
          {verdict.caveats && verdict.caveats.length > 0 && (
            <><h3 style={{ margin: '0 0 8px', color: C.ink, fontSize: 14 }}>注意事项</h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: C.inkSoft, lineHeight: 1.7, fontSize: 14 }}>
                {verdict.caveats.map((c, i) => <li key={i}>{c}</li>)}
              </ul></>
          )}
        </section>

        <DraftReviewActions id={id} apiBase="/api/admin/verdicts" listPath="/admin/verdicts" publishLabel="发布立场" />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `1px solid ${C.ruleSoft}`, paddingBottom: 10 }}>
      <div style={{ color: C.inkMuted, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ color: C.inkSoft, fontSize: 13, lineHeight: 1.5, wordBreak: 'break-all' }}>{value}</div>
    </div>
  );
}
