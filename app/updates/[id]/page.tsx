import { notFound } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { SiteHeader } from '@/components/SiteHeader';

import { v2Tokens as T } from '@/lib/tokens';
import { loadToolUpdateById } from '@/lib/db/queries';
import type { Metadata } from 'next';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await loadToolUpdateById(Number(id));
  if (!item) return {};
  return {
    title: `${item.titleZh ?? item.toolName} | AIBoxPro`,
    description: `${item.toolName} ${item.contentType === 'tutorial' ? '使用教程' : '最新动态'}`,
  };
}

async function renderMarkdown(md: string): Promise<string> {
  const html = await marked.parse(md, { async: true });
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre']),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, a: ['href', 'name', 'target', 'rel'] },
  });
}

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

export default async function UpdateDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await loadToolUpdateById(Number(id));
  if (!item || item.status !== 'published') notFound();

  const bodyHtml = item.body ? await renderMarkdown(item.body) : null;
  const isUpdate = item.contentType !== 'tutorial';

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 780, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 32px)', fontFamily: FONT }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.inkMuted }}>
          <Link href="/spotlight" style={{ color: T.inkMuted, textDecoration: 'none' }}>动态</Link>
          <span>›</span>
          <span style={{ color: T.inkSoft }}>{item.toolName}</span>
        </div>

        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              background: isUpdate ? '#FEF3C7' : '#EFF6FF',
              color: isUpdate ? '#92400E' : '#1D4ED8',
            }}>
              {isUpdate ? '⚡ 动态' : '📖 教程'}
            </span>
            <span style={{ padding: '3px 10px', background: T.primaryBg, color: T.primary, borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
              {item.toolName}
            </span>
            {item.publishedAt && (
              <span style={{ fontSize: 12, color: T.inkMuted }}>
                {new Date(item.publishedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: T.ink, lineHeight: 1.3 }}>
            {item.titleZh ?? item.toolName}
          </h1>
        </header>

        {/* Article */}
        {bodyHtml ? (
          <article
            style={{ lineHeight: 1.8, color: T.ink }}
            className="prose-update"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : (
          <div style={{ color: T.inkMuted, padding: '40px 0', textAlign: 'center' }}>内容待补充</div>
        )}

        {/* Source */}
        <div style={{ marginTop: 40, padding: '16px 20px', background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: T.inkMuted, marginBottom: 6 }}>内容来源</div>
          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: T.primary, wordBreak: 'break-all' }}>
            {item.sourceTitle ?? item.sourceUrl}
          </a>
          {item.sourceChannel && <span style={{ fontSize: 12, color: T.inkMuted, marginLeft: 8 }}>— {item.sourceChannel}</span>}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.rule}`, display: 'flex', gap: 12 }}>
          <Link href="/spotlight" style={{ padding: '10px 20px', background: T.panel, border: `1px solid ${T.rule}`, color: T.ink, borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            ← 更多动态
          </Link>
          {item.toolId && (
            <Link href={`/tools/${item.toolId}`} style={{ padding: '10px 20px', background: T.primaryBg, color: T.primary, borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              {item.toolName} 工具详情 →
            </Link>
          )}
        </div>
      </main>


      <style>{`
        .prose-update h2, .prose-update h3 { color: ${T.ink}; margin-top: 1.8em; margin-bottom: 0.5em; }
        .prose-update h2 { font-size: 1.2rem; }
        .prose-update h3 { font-size: 1.05rem; }
        .prose-update p { margin: 0 0 1em; }
        .prose-update ul, .prose-update ol { padding-left: 1.5em; margin: 0 0 1em; }
        .prose-update li { margin-bottom: 0.4em; }
        .prose-update blockquote { border-left: 3px solid ${T.rule}; margin: 1em 0; padding: 0.5em 1em; color: ${T.inkSoft}; background: ${T.bg}; border-radius: 0 8px 8px 0; }
        .prose-update code { background: ${T.bg}; border: 1px solid ${T.rule}; border-radius: 4px; padding: 1px 5px; font-size: 0.88em; }
        .prose-update pre { background: #1F2937; color: #F9FAFB; border-radius: 10px; padding: 16px 20px; overflow-x: auto; margin: 1em 0; }
        .prose-update pre code { background: none; border: none; padding: 0; color: inherit; }
        .prose-update a { color: ${T.primary}; }
        .prose-update hr { border: none; border-top: 1px solid ${T.rule}; margin: 2em 0; }
      `}</style>
    </>
  );
}
