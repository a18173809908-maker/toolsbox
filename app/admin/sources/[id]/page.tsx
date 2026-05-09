import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import { loadAdminSourceCandidateById } from '@/lib/db/queries';
import SourceReviewActions from './SourceReviewActions';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
};

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

const CATEGORY_LABEL: Record<string, string> = {
  aggregation: '聚合追踪',
  vertical_media: '垂直媒体',
  community_column: '社区专栏',
  official_source: '官方源',
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminSourceDetailPage({ params }: Props) {
  const { id } = await params;
  const candidate = await loadAdminSourceCandidateById(parseInt(id, 10));
  if (!candidate) notFound();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/sources" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 返回来源候选</Link>
            <h1 style={{ margin: 0, color: C.ink, fontSize: 20 }}>信息源审核</h1>
          </div>
          <AdminLogoutButton />
        </div>

        <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24 }}>
          <h2 style={{ margin: '0 0 8px', color: C.ink, fontSize: 24 }}>
            <a href={candidate.url} target="_blank" rel="noopener noreferrer" style={{ color: C.ink, textDecoration: 'none' }}>{candidate.name} ↗</a>
          </h2>
          <p style={{ margin: '0 0 18px', color: C.inkSoft, fontSize: 14 }}>{candidate.url}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px 20px' }}>
            <Field label="分类" value={CATEGORY_LABEL[candidate.sourceCategory] ?? candidate.sourceCategory} />
            <Field label="语言" value={candidate.lang} />
            <Field label="RSS/Atom" value={candidate.feedUrl ?? '未发现'} />
            <Field label="发现方式" value={candidate.discoverySource} />
            <Field label="质量分" value={candidate.qualityScore} />
            <Field label="AI 相关分" value={candidate.aiRelevanceScore} />
            <Field label="工具相关分" value={candidate.toolRelevanceScore} />
            <Field label="更新频率" value={candidate.updateFrequency ?? 'unknown'} />
          </div>
        </section>

        <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginTop: 16 }}>
          <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 16 }}>采样证据</h2>
          {candidate.evidence?.notes && candidate.evidence.notes.length > 0 && (
            <ul style={{ margin: '0 0 16px', paddingLeft: 20, color: C.inkSoft, lineHeight: 1.7, fontSize: 14 }}>
              {candidate.evidence.notes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          )}
          {candidate.evidence?.recentTitles && candidate.evidence.recentTitles.length > 0 ? (
            <ol style={{ margin: 0, paddingLeft: 20, color: C.inkSoft, lineHeight: 1.7, fontSize: 14 }}>
              {candidate.evidence.recentTitles.map((title) => <li key={title}>{title}</li>)}
            </ol>
          ) : (
            <p style={{ color: C.inkMuted, margin: 0, fontSize: 14 }}>暂无标题采样。</p>
          )}
        </section>

        <SourceReviewActions candidateId={candidate.id} canApprove={Boolean(candidate.feedUrl)} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `1px solid ${C.ruleSoft}`, paddingBottom: 10 }}>
      <div style={{ color: C.inkMuted, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}
