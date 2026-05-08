import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadAdminArticleById } from '@/lib/db/queries';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import ArticleHideButton from './ArticleHideButton';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  green: '#14532D', greenBg: '#DCFCE7',
};

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

function fmtDate(d: Date | null | undefined) {
  if (!d) return '—';
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

type Props = { params: Promise<{ id: string }> };

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const article = await loadAdminArticleById(parseInt(id, 10));
  if (!article) notFound();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/articles" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>
              ← 返回列表
            </Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>资讯详情</h1>
            <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: C.green, background: C.greenBg }}>
              已发布
            </span>
          </div>
          <AdminLogoutButton />
        </div>

        {/* Content */}
        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 18, color: C.ink, lineHeight: 1.4 }}>
            <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: C.ink, textDecoration: 'none' }}>
              {article.titleZh ?? article.title} ↗
            </a>
          </h2>
          {article.titleZh && (
            <p style={{ margin: '0 0 16px', fontSize: 13, color: C.inkMuted }}>原标题：{article.title}</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '4px 24px', marginBottom: 16 }}>
            {[
              ['来源', article.sourceName ?? '—'],
              ['标签', article.tag ?? '—'],
              ['发布时间', fmtDate(article.publishedAt)],
              ['抓取时间', fmtDate(article.fetchedAt)],
            ].map(([label, val]) => (
              <div key={label as string} style={{ padding: '8px 0', borderBottom: `1px solid ${C.ruleSoft}` }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 2 }}>
                  {label}
                </span>
                <span style={{ fontSize: 13, color: C.ink }}>{val}</span>
              </div>
            ))}
          </div>

          {article.summaryZh && (
            <div style={{ marginTop: 12 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>AI 摘要</p>
              <p style={{ margin: 0, fontSize: 14, color: C.inkSoft, lineHeight: 1.7 }}>{article.summaryZh}</p>
            </div>
          )}
          {!article.summaryZh && article.summary && (
            <div style={{ marginTop: 12 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '.06em' }}>摘要</p>
              <p style={{ margin: 0, fontSize: 14, color: C.inkSoft, lineHeight: 1.7 }}>{article.summary}</p>
            </div>
          )}
        </div>

        {/* Hide action */}
        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24 }}>
          <p style={{ margin: '0 0 12px', fontWeight: 600, color: C.ink, fontSize: 14 }}>操作</p>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: C.inkSoft }}>
            隐藏后资讯将从前台 /news 页面下架，不可恢复（需手动 SQL 修改 status）。
          </p>
          <ArticleHideButton articleId={article.id} />
        </div>
      </div>
    </div>
  );
}
