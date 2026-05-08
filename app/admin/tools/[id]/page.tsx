import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadAdminToolCandidateById } from '@/lib/db/queries';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import ToolReviewActions from './ToolReviewActions';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', amber: '#92400E', amberBg: '#FEF3C7',
  orange: '#9A3412', orangeBg: '#FFEDD5',
};

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

function fmtDate(d: Date | null | undefined) {
  if (!d) return '—';
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.6 }}>
        {value ?? <span style={{ color: C.inkMuted }}>—</span>}
      </div>
    </div>
  );
}

type Props = { params: Promise<{ id: string }> };

export default async function ToolDetailPage({ params }: Props) {
  const { id } = await params;
  const candidate = await loadAdminToolCandidateById(parseInt(id, 10));
  if (!candidate) notFound();

  const statusLabel = candidate.status === 'ai_drafted' ? 'AI 草稿' : candidate.status;
  const statusColor = candidate.status === 'ai_drafted' ? C.amber : C.orange;
  const statusBg = candidate.status === 'ai_drafted' ? C.amberBg : C.orangeBg;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/tools" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>
              ← 返回列表
            </Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>
              工具候选审核
            </h1>
            <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: statusColor, background: statusBg }}>
              {statusLabel}
            </span>
          </div>
          <AdminLogoutButton />
        </div>

        {/* Main info */}
        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 22, color: C.ink }}>
              <a href={candidate.url} target="_blank" rel="noopener noreferrer" style={{ color: C.ink, textDecoration: 'none' }}>
                {candidate.name} ↗
              </a>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0 24px' }}>
            <Field label="Slug (工具 ID)" value={candidate.slug} />
            <Field label="分类 catId" value={candidate.catId} />
            <Field label="定价 pricing" value={candidate.pricing} />
            <Field label="国内可用 chinaAccess" value={candidate.chinaAccess} />
            <Field label="来源 source" value={`${candidate.sourceName} (${candidate.sourceType})`} />
            <Field label="抓取时间" value={fmtDate(candidate.fetchedAt)} />
            {candidate.hotnessScore != null && (
              <Field label="热度分" value={String(candidate.hotnessScore)} />
            )}
          </div>

          <Field
            label="中文描述 zh（AI 起草）"
            value={candidate.zh ? (
              <span style={{ whiteSpace: 'pre-wrap' }}>{candidate.zh}</span>
            ) : null}
          />

          {candidate.features && candidate.features.length > 0 && (
            <Field
              label="功能标签 features"
              value={
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {candidate.features.map((f, i) => (
                    <span key={i} style={{ padding: '2px 10px', background: C.ruleSoft, borderRadius: 4, fontSize: 12, color: C.inkSoft }}>
                      {f}
                    </span>
                  ))}
                </div>
              }
            />
          )}
        </div>

        {/* aiDraft extended fields */}
        {candidate.aiDraft && (
          <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              AI 起草详细字段
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px 24px', marginBottom: 16 }}>
              {[
                ['是否需要海外手机', candidate.aiDraft.needsOverseasPhone ? '是' : '否'],
                ['是否实名认证', candidate.aiDraft.needsRealName ? '是' : '否'],
                ['仅海外支付', candidate.aiDraft.overseasPaymentOnly ? '是' : '否'],
                ['人民币价格', candidate.aiDraft.priceCny || '—'],
                ['微信小程序', candidate.aiDraft.miniProgram || '—'],
                ['中国区 App Store', candidate.aiDraft.appStoreCn ? '是' : '否'],
                ['微信公众号', candidate.aiDraft.publicAccount || '—'],
              ].map(([label, val]) => (
                <div key={label as string} style={{ padding: '6px 0', borderBottom: `1px solid ${C.ruleSoft}` }}>
                  <span style={{ fontSize: 11, color: C.inkMuted, display: 'block', marginBottom: 2 }}>{label}</span>
                  <span style={{ fontSize: 13, color: C.ink }}>{val}</span>
                </div>
              ))}
            </div>
            {candidate.aiDraft.registerMethod && candidate.aiDraft.registerMethod.length > 0 && (
              <Field label="注册方式" value={candidate.aiDraft.registerMethod.join(' / ')} />
            )}
            {candidate.aiDraft.howToUse && candidate.aiDraft.howToUse.length > 0 && (
              <Field label="使用步骤 howToUse" value={
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {candidate.aiDraft.howToUse.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
                </ol>
              } />
            )}
            {candidate.aiDraft.faqs && candidate.aiDraft.faqs.length > 0 && (
              <Field label="常见问题 faqs" value={
                <div>
                  {candidate.aiDraft.faqs.map((f, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{f.q}</div>
                      <div style={{ color: C.inkSoft }}>{f.a}</div>
                    </div>
                  ))}
                </div>
              } />
            )}
            {candidate.aiDraft.cnAlternatives && candidate.aiDraft.cnAlternatives.length > 0 && (
              <Field label="国产替代" value={candidate.aiDraft.cnAlternatives.join(', ')} />
            )}
          </div>
        )}

        {/* Source description */}
        {candidate.description && (
          <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              原始描述（来源）
            </p>
            <p style={{ margin: 0, fontSize: 14, color: C.inkSoft, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {candidate.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <ToolReviewActions
          candidateId={candidate.id}
          currentZh={candidate.zh}
          slug={candidate.slug}
          catId={candidate.catId}
        />
      </div>
    </div>
  );
}
