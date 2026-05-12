import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import DraftReviewActions from '@/components/admin/DraftReviewActions';
import { loadComparisonDraftById } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const C = { bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563', inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0' };
const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  const item = await loadComparisonDraftById(id);
  if (!item) notFound();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/comparison-drafts" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 对比页草稿</Link>
            <h1 style={{ margin: 0, color: C.ink, fontSize: 20 }}>审核对比草稿</h1>
          </div>
          <AdminLogoutButton />
        </div>

        <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px 20px', marginBottom: 20 }}>
            <Field label="Slug" value={item.slug} />
            <Field label="反套话分" value={item.antiClicheScore != null ? `${item.antiClicheScore}/100` : '—'} />
            <Field label="Prompt 版本" value={item.promptVersion} />
            <Field label="模型" value={item.llmModel} />
            <Field label="创建时间" value={item.createdAt.toLocaleString('zh-CN')} />
          </div>
          <h2 style={{ margin: '0 0 10px', color: C.ink, fontSize: 15 }}>AI 草稿内容</h2>
          <pre style={{ margin: 0, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: 16, fontSize: 12, color: C.inkSoft, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(item.aiDraft, null, 2)}
          </pre>
        </section>

        <DraftReviewActions id={id} apiBase="/api/admin/comparison-drafts" listPath="/admin/comparison-drafts" publishLabel="发布对比草稿" />
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
