import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import DraftReviewActions from '@/components/admin/DraftReviewActions';
import { loadToolUpdateById } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const C = { bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563', inkMuted: '#9CA3AF', rule: '#E8D5B7' };
const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

type Props = { params: Promise<{ id: string }> };

export default async function ToolUpdateReviewPage({ params }: Props) {
  const { id } = await params;
  const item = await loadToolUpdateById(Number(id));
  if (!item) notFound();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px,4vw,40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/tool-updates" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 工具动态</Link>
            <h1 style={{ margin: 0, color: C.ink, fontSize: 20 }}>审核动态</h1>
          </div>
          <AdminLogoutButton />
        </div>

        {/* Meta */}
        <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 16 }}>
            <div><div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>工具</div><div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{item.toolName}</div></div>
            <div><div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>类型</div><div style={{ fontSize: 14, color: C.ink }}>{item.contentType === 'tutorial' ? '📖 教程' : '⚡ 动态'}</div></div>
            <div><div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>周次</div><div style={{ fontSize: 14, color: C.ink }}>{item.snapshotWeek}</div></div>
            <div><div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>状态</div><div style={{ fontSize: 14, color: C.ink }}>{item.status}</div></div>
          </div>
          {item.titleZh && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>中文标题</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{item.titleZh}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>来源视频</div>
            <a href={item.sourceUrl} target="_blank" rel="noopener" style={{ fontSize: 13, color: '#2563EB', wordBreak: 'break-all' }}>
              {item.sourceTitle ?? item.sourceUrl}
            </a>
            {item.sourceChannel && <span style={{ fontSize: 12, color: C.inkMuted, marginLeft: 8 }}>— {item.sourceChannel}</span>}
          </div>
        </section>

        {/* Body */}
        {item.body && (
          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, color: C.ink }}>文章内容（Markdown）</h2>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, color: C.inkSoft, background: C.bg, padding: 16, borderRadius: 8, maxHeight: 600, overflow: 'auto', margin: 0 }}>
              {item.body}
            </pre>
          </section>
        )}

        {item.status === 'ai_drafted' && (
          <DraftReviewActions
            id={String(item.id)}
            apiBase="/api/admin/tool-updates"
            listPath="/admin/tool-updates"
            publishLabel="发布动态"
          />
        )}

        {item.status !== 'ai_drafted' && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 10, color: C.inkMuted, fontSize: 13 }}>
            此条目已{item.status === 'published' ? '发布' : '拒绝'}。
            {item.status === 'published' && (
              <Link href={`/updates/${item.id}`} style={{ color: '#2563EB', marginLeft: 8 }}>查看公开页面 →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
