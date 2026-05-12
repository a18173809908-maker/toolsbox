import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import DraftReviewActions from '@/components/admin/DraftReviewActions';
import { loadSpotlightById } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
};
const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

type Props = { params: Promise<{ id: string }> };

export default async function SpotlightReviewPage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (!idNum) notFound();

  const item = await loadSpotlightById(idNum);
  if (!item) notFound();

  const ghUrl = `https://github.com/${item.repo}`;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/spotlights" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>
              ← 仓库 Spotlight
            </Link>
            <h1 style={{ margin: 0, color: C.ink, fontSize: 20 }}>审核 Spotlight</h1>
          </div>
          <AdminLogoutButton />
        </div>

        {/* Meta */}
        <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>仓库</div>
              <a href={ghUrl} target="_blank" rel="noopener" style={{ color: '#2563EB', fontFamily: 'monospace', fontSize: 14 }}>
                {item.repo}
              </a>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>周次</div>
              <div style={{ fontSize: 14, color: C.ink }}>{item.snapshotWeek} #{item.rankInWeek}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>状态</div>
              <div style={{ fontSize: 14, color: C.ink }}>{item.status}</div>
            </div>
          </div>
          {item.titleZh && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>中文标题</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{item.titleZh}</div>
            </div>
          )}
        </section>

        {/* Body preview */}
        {item.body && (
          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, color: C.ink }}>文章内容（Markdown 原文）</h2>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, color: C.inkSoft, background: C.bg, padding: 16, borderRadius: 8, maxHeight: 600, overflow: 'auto', margin: 0 }}>
              {item.body}
            </pre>
          </section>
        )}

        {/* YouTube/search sources */}
        {(item.youtubeResults || item.searchResults) && (
          <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, color: C.ink }}>来源数据</h2>
            {item.youtubeResults && Array.isArray(item.youtubeResults) && item.youtubeResults.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>YouTube 视频</div>
                {(item.youtubeResults as { title: string; videoId: string; description: string }[]).map((v) => (
                  <div key={v.videoId} style={{ fontSize: 12, color: C.ink, marginBottom: 6 }}>
                    <a href={`https://youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener" style={{ color: '#2563EB' }}>
                      {v.title}
                    </a>
                    {v.description && <span style={{ color: C.inkMuted, marginLeft: 8 }}>— {v.description}</span>}
                  </div>
                ))}
              </div>
            )}
            {item.searchResults && Array.isArray(item.searchResults) && item.searchResults.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>搜索结果</div>
                {(item.searchResults as { title: string; snippet: string; url: string }[]).map((r, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: C.ink, marginBottom: 6 }}>
                    <a href={r.url} target="_blank" rel="noopener" style={{ color: '#2563EB' }}>{r.title}</a>
                    <span style={{ color: C.inkMuted, marginLeft: 8 }}>— {r.snippet}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {item.status === 'ai_drafted' && (
          <DraftReviewActions
            id={String(item.id)}
            apiBase="/api/admin/spotlights"
            listPath="/admin/spotlights"
            publishLabel="发布 Spotlight"
          />
        )}

        {item.status !== 'ai_drafted' && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 10, color: C.inkMuted, fontSize: 13 }}>
            此条目已{item.status === 'published' ? '发布' : '拒绝'}，无需操作。
            {item.status === 'published' && (
              <Link href={`/spotlight/${item.id}`} style={{ color: '#2563EB', marginLeft: 8 }}>查看公开页面 →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
