import { notFound } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { loadAdminComparisonById } from '@/lib/db/queries';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import ComparisonReviewActions from './ComparisonReviewActions';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  amber: '#92400E', amberBg: '#FEF3C7',
};

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

function fmtDate(d: Date | null | undefined) {
  if (!d) return '—';
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

type Props = { params: Promise<{ id: string }> };

export default async function ComparisonDetailPage({ params }: Props) {
  const { id } = await params;
  const comparison = await loadAdminComparisonById(id);
  if (!comparison) notFound();

  const bodyHtml = comparison.body
    ? sanitizeHtml(await Promise.resolve(marked(comparison.body)))
    : null;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/comparisons" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>
              ← 返回列表
            </Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>对比页审核</h1>
            <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: C.amber, background: C.amberBg }}>
              草稿
            </span>
          </div>
          <AdminLogoutButton />
        </div>

        {/* Meta info */}
        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 20, color: C.ink }}>{comparison.title}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px 24px', marginBottom: 16 }}>
            {[
              ['ID', comparison.id],
              ['工具 A', comparison.toolAId],
              ['工具 B', comparison.toolBId],
              ['实测人', comparison.testedBy ?? '—'],
              ['实测时间', fmtDate(comparison.testedAt)],
              ['创建时间', fmtDate(comparison.createdAt)],
            ].map(([label, val]) => (
              <div key={label as string} style={{ padding: '8px 0', borderBottom: `1px solid ${C.ruleSoft}` }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 2 }}>
                  {label}
                </span>
                <span style={{ fontSize: 13, color: C.ink }}>{val}</span>
              </div>
            ))}
          </div>

          {comparison.summary && (
            <div style={{ marginTop: 8 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>摘要</p>
              <p style={{ margin: 0, fontSize: 14, color: C.inkSoft, lineHeight: 1.7 }}>{comparison.summary}</p>
            </div>
          )}
          {comparison.verdict && (
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>结论</p>
              <p style={{ margin: 0, fontSize: 14, color: C.ink, lineHeight: 1.7 }}>{comparison.verdict}</p>
            </div>
          )}
        </div>

        {/* Body content */}
        {bodyHtml && (
          <div
            style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}
          >
            <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>正文内容</p>
            <div
              style={{ fontSize: 14, color: C.ink, lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </div>
        )}

        {/* Actions */}
        <ComparisonReviewActions comparisonId={comparison.id} />
      </div>
    </div>
  );
}
