import { notFound } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { v2Tokens as T } from '@/lib/tokens';
import { loadSpotlightById, loadPublishedSpotlights } from '@/lib/db/queries';
import type { Metadata } from 'next';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const items = await loadPublishedSpotlights(50);
  return items.map((item) => ({ id: String(item.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await loadSpotlightById(Number(id));
  if (!item) return {};
  return {
    title: `${item.titleZh ?? item.repo} — 仓库精选 | AIBoxPro`,
    description: `GitHub 热门仓库 ${item.repo} 深度解读：它能做什么、社区怎么用、国内开发者如何上手。`,
  };
}

async function renderMarkdown(md: string): Promise<string> {
  const html = await marked.parse(md, { async: true });
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel'],
    },
  });
}

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

export default async function SpotlightDetailPage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (!idNum) notFound();

  const item = await loadSpotlightById(idNum);
  if (!item || item.status !== 'published') notFound();

  const bodyHtml = item.body ? await renderMarkdown(item.body) : null;
  const ghUrl = `https://github.com/${item.repo}`;

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 32px)', fontFamily: FONT }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.inkMuted }}>
          <Link href="/spotlight" style={{ color: T.inkMuted, textDecoration: 'none' }}>仓库精选</Link>
          <span>›</span>
          <span style={{ color: T.inkSoft }}>{item.repo.split('/')[1]}</span>
        </div>

        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 10px', background: T.primaryBg, color: T.primary, borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
              {item.snapshotWeek} 精选
            </span>
            <a
              href={ghUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '3px 10px', background: T.bg, border: `1px solid ${T.rule}`, color: T.inkSoft, borderRadius: 6, fontSize: 12, textDecoration: 'none', fontFamily: 'monospace' }}
            >
              {item.repo} ↗
            </a>
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: T.ink, lineHeight: 1.3 }}>
            {item.titleZh ?? item.repo}
          </h1>
        </header>

        {/* Article body */}
        {bodyHtml ? (
          <article
            style={{ lineHeight: 1.8, color: T.ink }}
            className="prose-spotlight"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : (
          <div style={{ color: T.inkMuted, padding: '40px 0', textAlign: 'center' }}>文章内容待补充</div>
        )}

        {/* Footer link */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${T.rule}`, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a
            href={ghUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 20px', background: T.ink, color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
          >
            GitHub 仓库 ↗
          </a>
          <Link
            href="/spotlight"
            style={{ padding: '10px 20px', background: T.panel, border: `1px solid ${T.rule}`, color: T.ink, borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
          >
            ← 更多精选
          </Link>
        </div>
      </main>
      <SiteFooter />

      <style>{`
        .prose-spotlight h1,
        .prose-spotlight h2,
        .prose-spotlight h3 {
          color: ${T.ink};
          margin-top: 1.8em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }
        .prose-spotlight h2 { font-size: 1.25rem; }
        .prose-spotlight h3 { font-size: 1.05rem; }
        .prose-spotlight p { margin: 0 0 1em; }
        .prose-spotlight ul, .prose-spotlight ol { padding-left: 1.5em; margin: 0 0 1em; }
        .prose-spotlight li { margin-bottom: 0.4em; }
        .prose-spotlight blockquote {
          border-left: 3px solid ${T.rule};
          margin: 1em 0;
          padding: 0.5em 1em;
          color: ${T.inkSoft};
          background: ${T.bg};
          border-radius: 0 8px 8px 0;
        }
        .prose-spotlight code {
          background: ${T.bg};
          border: 1px solid ${T.rule};
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.88em;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        .prose-spotlight pre {
          background: #1F2937;
          color: #F9FAFB;
          border-radius: 10px;
          padding: 16px 20px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .prose-spotlight pre code {
          background: none;
          border: none;
          padding: 0;
          color: inherit;
          font-size: 0.87em;
        }
        .prose-spotlight a { color: ${T.primary}; }
        .prose-spotlight hr { border: none; border-top: 1px solid ${T.rule}; margin: 2em 0; }
      `}</style>
    </>
  );
}
