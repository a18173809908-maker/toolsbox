import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShareButton } from '@/components/ShareButton';
import { SiteHeader } from '@/components/SiteHeader';
import { ScrollHandler } from '@/components/ScrollHandler';
import { loadArticleById, loadRelatedArticlesByArticleId } from '@/lib/db/queries';
import { normalizeArticleCategory } from '@/lib/article-categories';

export const revalidate = 3600;

const BASE = 'https://aiboxpro.cn';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const art = await loadArticleById(Number(id));
  if (!art) return { title: 'Not Found' };
  const title = art.titleZh || art.title;
  const desc = art.aiInsights?.oneSentenceSummary || art.summaryZh || (art.summary ? art.summary.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim() : null) || art.title;
  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | AIBoxPro`,
      description: desc,
      url: `${BASE}/news/${id}`,
      type: 'article',
      images: [`${BASE}/og?type=news&title=${encodeURIComponent(title.slice(0, 70))}${art.tag ? `&tag=${encodeURIComponent(art.tag)}` : ''}`],
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: `/news/${id}` },
  };
}

const C = {
  bg: '#FFF7ED',
  panel: '#FFFFFF',
  ink: '#1F2937',
  inkSoft: '#4B5563',
  inkMuted: '#9CA3AF',
  rule: '#E8D5B7',
  ruleSoft: '#F3E8D0',
  primary: '#F97316',
  primaryBg: '#FFEDD5',
  accent: '#C2410C',
  success: '#10B981',
  successBg: '#DCFCE7',
  blue: '#3B82F6',
  blueBg: '#EFF6FF',
};

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ').trim();
}

function fmt(iso: Date | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function normalizeText(text: string) {
  return text.toLowerCase().replace(/\s+/g, '').replace(/[，。；：、,.!?！？"'“”‘’()[\]【】《》「」]/g, '');
}

function tokenSet(text: string, pattern: RegExp) {
  return new Set((text.match(pattern) ?? []).map((item) => item.toLowerCase()));
}

function isSamePoint(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return false;
  if (left === right || left.includes(right) || right.includes(left)) return true;

  const leftNumbers = tokenSet(a, /\d+(?:\.\d+)?(?:%|亿|万|元)?/g);
  const rightNumbers = tokenSet(b, /\d+(?:\.\d+)?(?:%|亿|万|元)?/g);
  const leftNames = tokenSet(a, /[A-Za-z][\w.-]{1,}|[\u4e00-\u9fa5]{2,8}/g);
  const rightNames = tokenSet(b, /[A-Za-z][\w.-]{1,}|[\u4e00-\u9fa5]{2,8}/g);
  const sharesNumber = [...leftNumbers].some((item) => rightNumbers.has(item));
  const sharesName = [...leftNames].some((item) => rightNames.has(item));
  return sharesNumber && sharesName;
}

function TagBadge({ label }: { label: string }) {
  return (
    <span style={{ padding: '3px 10px', borderRadius: 6, background: C.primaryBg, color: C.accent, fontSize: 12, fontWeight: 700 }}>
      {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 22, marginTop: 22 }}>
      <h2 style={{ fontSize: 18, fontWeight: 850, color: C.ink, margin: '0 0 14px' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ToolCard({ tool }: { tool: { id?: string; name: string; reason?: string } }) {
  return tool.id ? (
    <Link
      href={`/tools/${tool.id}`}
      className="news-tool-card-link"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        border: `1px solid ${C.rule}`,
        background: '#FFFDF9',
        textDecoration: 'none',
        transition: 'all .15s',
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: C.accent }}>{tool.name.slice(0, 2)}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 750, color: C.ink }}>{tool.name}</div>
        {tool.reason && <div style={{ fontSize: 12, color: C.inkMuted }}>{tool.reason}</div>}
      </div>
      <svg style={{ width: 14, height: 14, color: C.inkMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, border: `1px solid ${C.rule}`, background: '#FFFDF9' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: C.inkMuted }}>{tool.name.slice(0, 2)}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 750, color: C.ink }}>{tool.name}</div>
        {tool.reason && <div style={{ fontSize: 12, color: C.inkMuted }}>{tool.reason}</div>}
      </div>
    </div>
  );
}

function RelatedArticleCard({ article }: { article: { id: number; title: string; titleZh: string | null; tag: string | null; publishedAt: Date | null } }) {
  return (
    <Link
      href={`/news/${article.id}`}
      className="news-related-card-link"
      style={{
        display: 'block',
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${C.rule}`,
        background: C.panel,
        textDecoration: 'none',
        transition: 'all .15s',
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 800, color: C.ink, lineHeight: 1.5, margin: '0 0 8px' }}>{article.titleZh || article.title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {article.tag && <TagBadge label={normalizeArticleCategory(article.tag)} />}
        <span style={{ fontSize: 12, color: C.inkMuted }}>{fmt(article.publishedAt)}</span>
      </div>
    </Link>
  );
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const [art, relatedArticles] = await Promise.all([
    loadArticleById(Number(id)),
    loadRelatedArticlesByArticleId(Number(id), 5),
  ]);
  
  if (!art) notFound();
  
  const insights = art.aiInsights;
  const title = art.titleZh || art.title;
  const category = normalizeArticleCategory(art.tag);
  const cleanSummary = art.summary ? stripHtml(art.summary) : null;
  const description = insights?.oneSentenceSummary || art.summaryZh || cleanSummary || art.title;
  const sourceTitle = art.titleZh && !isSamePoint(art.title, art.titleZh) ? art.title : null;
  const eventBackground = [art.summaryZh, cleanSummary].find((item) => item && !isSamePoint(item, description) && !isSamePoint(item, title));
  const keyPoints = (insights?.keyPoints ?? [])
    .filter((item, index, arr) => !isSamePoint(item, description) && arr.findIndex((other) => isSamePoint(other, item)) === index)
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    url: art.url,
    datePublished: art.publishedAt?.toISOString(),
    publisher: { '@type': 'Organization', name: art.sourceName ?? 'AIBoxPro' },
    isPartOf: { '@type': 'WebSite', name: 'AIBoxPro', url: BASE },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
        <SiteHeader />
        <ScrollHandler />

        <main style={{ maxWidth: 760, margin: 'clamp(28px, 7vw, 48px) auto', padding: '0 clamp(16px, 5vw, 24px) 64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.inkMuted, fontSize: 13, marginBottom: 18 }}>
            <Link href="/news" style={{ color: C.inkMuted, textDecoration: 'none' }}>AI 资讯</Link>
            <span>/</span>
            <span style={{ color: C.ink, fontWeight: 600 }}>{title}</span>
          </div>

          <article style={{ background: C.panel, borderRadius: 16, border: `1px solid ${C.rule}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 'clamp(24px, 6vw, 40px) clamp(18px, 6vw, 48px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {art.tag && <TagBadge label={category} />}
              {art.publishedAt && <span style={{ fontSize: 13, color: C.inkMuted }}>{fmt(art.publishedAt)}</span>}
              {art.sourceName && <span style={{ fontSize: 13, color: C.inkMuted, marginLeft: 'auto' }}>来源：{art.sourceName}</span>}
              <ShareButton title={title} text={description} path={`/news/${art.id}`} compact />
            </div>

            <h1 style={{ fontWeight: 850, fontSize: 'clamp(26px, 7vw, 34px)', lineHeight: 1.32, margin: '0 0 14px', color: C.ink, letterSpacing: '-0.01em' }}>
              {title}
            </h1>

            {sourceTitle && (
              <p style={{ fontSize: 14, color: C.inkMuted, margin: '0 0 18px', lineHeight: 1.6 }}>
                原标题：{sourceTitle}
              </p>
            )}

            {description && !isSamePoint(description, title) && (
              <div style={{ background: C.primaryBg, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 20, marginBottom: 22 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, marginBottom: 8 }}>快速了解</div>
                <p style={{ fontSize: 16, color: C.ink, lineHeight: 1.75, margin: 0 }}>{description}</p>
              </div>
            )}

            {eventBackground && (
              <Section title="📚 背景解读">
                <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.8, margin: 0 }}>{eventBackground}</p>
              </Section>
            )}

            {keyPoints.length > 0 && (
              <Section title="🎯 核心要点">
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
                  {keyPoints.map((item, index) => (
                    <li key={index} style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 26, height: 26, borderRadius: 13, background: C.successBg, color: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>
                        {index + 1}
                      </span>
                      <span style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {insights?.whyItMatters && (
              <Section title="💡 影响分析">
                <div style={{ background: C.blueBg, border: '1px solid #DBEAFE', borderRadius: 12, padding: 20 }}>
                  <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.8, margin: '0 0 14px', fontWeight: 500 }}>{insights.whyItMatters}</p>
                  {insights.chinaImpact && (
                    <div style={{ paddingTop: 14, borderTop: '1px solid #DBEAFE' }}>
                      <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.7 }}>
                        <span style={{ fontWeight: 700, color: '#059669' }}>🇨🇳 对中国市场影响：</span>
                        {insights.chinaImpact}
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {insights?.whoShouldCare && insights.whoShouldCare.length > 0 && (
              <Section title="👥 适合人群">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {insights.whoShouldCare.map((item) => (
                    <span key={item} style={{ padding: '6px 12px', borderRadius: 999, background: '#F0FDF4', color: '#166534', fontSize: 13, fontWeight: 700 }}>
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {insights?.relatedTools && insights.relatedTools.length > 0 && (
              <Section title="🔧 相关工具">
                <div style={{ display: 'grid', gap: 10 }}>
                  {insights.relatedTools.slice(0, 5).map((tool) => (
                    <ToolCard key={tool.id ?? tool.name} tool={tool} />
                  ))}
                </div>
              </Section>
            )}

            <Section title="🔗 延伸阅读">
              <a
                href={art.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-read-original-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${C.rule}`,
                  background: '#FFFDF9',
                  color: C.accent,
                  textDecoration: 'none',
                  transition: 'all .15s',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg style={{ width: 18, height: 18, color: C.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 750 }}>阅读原文</div>
                  <div style={{ fontSize: 13, color: C.inkMuted }}>{art.sourceName ?? '查看完整报道'}</div>
                </div>
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </Section>

            <div style={{ borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 24, marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
              <span style={{ fontSize: 13, color: C.inkMuted }}>分享给朋友</span>
              <ShareButton title={title} text={description} path={`/news/${art.id}`} />
            </div>
          </article>

          {relatedArticles.length > 0 && (
            <div style={{ background: C.panel, borderRadius: 16, border: `1px solid ${C.rule}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 'clamp(22px, 4vw, 28px)', marginTop: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 850, color: C.ink, margin: '0 0 16px' }}>📰 你可能也感兴趣</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {relatedArticles.map((article) => (
                  <RelatedArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </main>

        </div>
    </>
  );
}