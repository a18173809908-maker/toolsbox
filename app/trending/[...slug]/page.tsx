import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { hasBaiduTranslateConfig, translateReadmeExcerpt } from '@/lib/baidu-translate';
import { fetchReadme, fetchRepoInfo, renderReadme } from '@/lib/github';
import { loadRepoDetail, updateRepoReadmeZh } from '@/lib/db/queries';

export const revalidate = 3600;

const BASE = 'https://aiboxpro.cn';

const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB',
  Rust: '#CE422B', Go: '#00ADD8', Java: '#ED8B00', 'C++': '#F34B7D',
  C: '#555555', Swift: '#FA7343', Kotlin: '#A97BFF', Ruby: '#CC342D',
  Shell: '#89E051', HTML: '#E34F26', CSS: '#1572B6', Zig: '#F7A41D',
};

const PERIOD_LABEL: Record<string, string> = {
  today: '今日 Today',
  week: '本周 This Week',
  month: '本月 This Month',
};

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const repo = slug.join('/');
  const rows = await loadRepoDetail(repo);
  if (!rows.length) return { title: 'Not Found' };
  const r = rows[0];
  const desc = r.descriptionZh || r.description;
  const gained = rows.find((row) => row.period === 'today')?.gained ?? r.gained;
  return {
    title: `${repo} — GitHub ${r.lang} 开源项目 今日 +${gained} Stars | AiToolsBox`,
    description: `${desc}。${r.lang} 开源项目，GitHub 今日新增 ${gained} Stars。`,
    openGraph: {
      title: `${repo} | AiToolsBox`,
      description: `${desc}。${r.lang} 开源项目，GitHub 今日新增 ${gained} Stars。`,
      url: `${BASE}/trending/${repo}`,
      type: 'website',
    },
    alternates: { canonical: `/trending/${repo}` },
  };
}

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
  green: '#16A34A', greenBg: '#DCFCE7',
};

export default async function TrendingDetailPage({ params }: Props) {
  const { slug } = await params;
  const repo = slug.join('/');
  const rows = await loadRepoDetail(repo);
  if (!rows.length) notFound();

  const [owner, name] = repo.split('/');
  // Pick the richest row (prefer today > week > month)
  const main = rows.find((r) => r.period === 'today') ?? rows.find((r) => r.period === 'week') ?? rows[0];
  const langColor = LANG_COLOR[main.lang] || '#888';
  const [repoInfo, readme] = await Promise.all([
    fetchRepoInfo(repo),
    fetchReadme(repo),
  ]);
  const readmeHtml = readme ? await renderReadme(readme, repo) : null;
  let readmeZh = rows.find((row) => row.readmeZh)?.readmeZh ?? null;
  if (!readmeZh && readme && hasBaiduTranslateConfig()) {
    readmeZh = await translateReadmeExcerpt(readme);
    if (readmeZh) await updateRepoReadmeZh(repo, readmeZh);
  }
  const pushedAt = repoInfo?.pushed_at ? new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN') : null;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>

      <SiteHeader />

      <main style={{ maxWidth: 860, margin: 'clamp(28px, 6vw, 40px) auto', padding: '0 clamp(16px, 5vw, 24px) 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.inkMuted, fontSize: 13, marginBottom: 18, minWidth: 0 }}>
          <Link href="/trending" style={{ color: C.inkMuted, textDecoration: 'none' }}>GitHub 趋势</Link>
          <span>/</span>
          <span style={{ color: C.ink, fontWeight: 600, fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo}</span>
        </div>

        {/* Hero */}
        <div style={{ background: C.panel, borderRadius: 16, border: `1px solid ${C.rule}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 'clamp(22px, 4vw, 36px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            {/* GitHub avatar */}
            <Image
              src={`https://github.com/${owner}.png?size=80`}
              alt={owner}
              width={72} height={72}
              style={{ borderRadius: 16, border: `1px solid ${C.rule}`, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: C.inkMuted, marginBottom: 4, fontFamily: 'ui-monospace, monospace' }}>
                <span style={{ color: C.inkSoft }}>{owner}</span>
                <span style={{ color: C.inkMuted }}> / </span>
              </div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(28px, 8vw, 36px)', margin: '0 0 14px', color: C.ink, letterSpacing: '-0.02em', overflowWrap: 'anywhere' }}>{name}</h1>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 999, background: C.ink, color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  <span>★</span> 在 GitHub 上查看 ↗
                </a>
                {repoInfo?.homepage && (
                  <a href={repoInfo.homepage} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 999, border: `1px solid ${C.rule}`, background: C.panel, color: C.inkSoft, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    项目主页 ↗
                  </a>
                )}
                <a href={`https://github.com/${repo}/archive/refs/heads/main.zip`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 999, border: `1px solid ${C.rule}`, background: C.panel, color: C.inkSoft, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                  ↓ 下载源码
                </a>
              </div>
              {repoInfo?.topics && repoInfo.topics.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
                  {repoInfo.topics.slice(0, 10).map((topic) => (
                    <span key={topic} style={{ padding: '4px 9px', borderRadius: 999, background: C.primaryBg, color: C.accent, fontSize: 12, fontWeight: 600 }}>
                      #{topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ background: C.panel, borderRadius: 16, border: `1px solid ${C.rule}`, padding: 'clamp(22px, 4vw, 28px) clamp(18px, 5vw, 40px)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 14px' }}>项目简介</h2>
          {main.descriptionZh && (
            <div style={{ background: C.bg, borderRadius: 12, padding: '16px 20px', borderLeft: `4px solid ${C.primary}`, marginBottom: 14 }}>
              <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.75, margin: 0 }}>{main.descriptionZh}</p>
            </div>
          )}
          <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.7, margin: 0 }}>{main.description}</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: C.panel, borderRadius: 12, border: `1px solid ${C.rule}`, padding: '18px 22px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>语言</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: langColor, display: 'inline-block' }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{main.lang || '—'}</span>
            </div>
          </div>
          <div style={{ background: C.panel, borderRadius: 12, border: `1px solid ${C.rule}`, padding: '18px 22px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>总 Stars</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>★ {(repoInfo?.stargazers_count ?? main.stars).toLocaleString()}</div>
          </div>
          {repoInfo?.forks_count !== undefined && (
            <div style={{ background: C.panel, borderRadius: 12, border: `1px solid ${C.rule}`, padding: '18px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Forks</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{repoInfo.forks_count.toLocaleString()}</div>
            </div>
          )}
          {repoInfo?.license && (
            <div style={{ background: C.panel, borderRadius: 12, border: `1px solid ${C.rule}`, padding: '18px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>License</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{repoInfo.license.spdx_id}</div>
            </div>
          )}
          {pushedAt && (
            <div style={{ background: C.panel, borderRadius: 12, border: `1px solid ${C.rule}`, padding: '18px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>最近更新</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{pushedAt}</div>
            </div>
          )}
          {rows.map((r) => (
            <div key={r.period} style={{ background: C.greenBg, borderRadius: 12, border: `1px solid #BBF7D0`, padding: '18px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{PERIOD_LABEL[r.period] ?? r.period}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>+{r.gained.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {readmeHtml && (
          <div style={{ background: C.panel, borderRadius: 16, border: `1px solid ${C.rule}`, padding: 'clamp(22px, 4vw, 28px) clamp(18px, 5vw, 40px)', marginBottom: 24, overflow: 'hidden' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 18px' }}>README</h2>
            {readmeZh && (
              <div style={{ background: C.bg, borderRadius: 12, borderLeft: `4px solid ${C.primary}`, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 8, letterSpacing: '0.04em' }}>百度翻译 · 中文速览</div>
                <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{readmeZh}</p>
              </div>
            )}
            <div
              className="readme-content"
              style={{ lineHeight: 1.7, color: '#374151', fontSize: 14, overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
          </div>
        )}

        {/* Back link */}
        <Link href="/" style={{ fontSize: 13, color: C.inkSoft, textDecoration: 'none' }}>← 返回首页</Link>
      </main>
    </div>
  );
}
