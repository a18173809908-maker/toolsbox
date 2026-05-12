import Link from 'next/link';
import type { Metadata } from 'next';
import { ShareButton } from '@/components/ShareButton';
import { SiteHeader } from '@/components/SiteHeader';
import { loadTrendingList } from '@/lib/db/queries';

export const revalidate = 3600;

const BASE = 'https://aiboxpro.cn';

const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB',
  Rust: '#CE422B', Go: '#00ADD8', Java: '#ED8B00', 'C++': '#F34B7D',
  C: '#555555', Swift: '#FA7343', Kotlin: '#A97BFF', Ruby: '#CC342D',
  Shell: '#89E051', HTML: '#E34F26', CSS: '#1572B6', Zig: '#F7A41D',
};

const PERIOD_META = {
  today: { label: '今日',   labelEn: 'Today',      desc: '今天在 GitHub 上升最快的 AI 开源项目' },
  week:  { label: '本周',   labelEn: 'This Week',  desc: '这周最受开发者关注的 AI 开源项目' },
  month: { label: '本月',   labelEn: 'This Month', desc: '这个月增长最明显的 AI 开源项目' },
};

type Props = { searchParams: Promise<{ period?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { period = 'today' } = await searchParams;
  const safe = (['today', 'week', 'month'] as const).includes(period as 'today') ? period : 'today';
  const m = PERIOD_META[safe as keyof typeof PERIOD_META];
  const title = `GitHub 趋势 ${m.label} — AI & 开源项目`;
  const desc = `${m.desc}，实时追踪全球最受关注的 AI 开源仓库。`;
  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | AIBoxPro`,
      description: desc,
      url: `${BASE}/trending?period=${safe}`,
      type: 'website',
    },
    alternates: { canonical: `/trending?period=${safe}` },
  };
}

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5', accent: '#C2410C',
  green: '#16A34A', greenBg: '#DCFCE7',
};

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'accent' | 'green' }) {
  const style = tone === 'accent'
    ? { background: C.primaryBg, color: C.accent }
    : tone === 'green'
      ? { background: C.greenBg, color: C.green }
      : { background: C.ruleSoft, color: C.inkSoft };
  return (
    <span style={{ ...style, padding: '3px 7px', borderRadius: 5, fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>
      {children}
    </span>
  );
}

function normalizeText(text: string) {
  return text.toLowerCase().replace(/\s+/g, '').replace(/[，。；：、,.!?！？"'“”‘’()[\]【】《》「」]/g, '');
}

function isSamePoint(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function buildNaturalSummary(summary: string, useCase: string) {
  if (isSamePoint(summary, useCase)) return summary;
  return `${summary} 适合关注 ${useCase.replace(/[。.]$/, '')}。`;
}

type RepoCardCopyInput = {
  repo: string;
  description: string;
  descriptionZh?: string | null;
  lang: string;
  gained: number;
};

function repoName(repo: string) {
  return repo.split('/').pop() || repo;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tidyDescription(text: string, name: string) {
  return text
    .replace(new RegExp(`^${escapeRegExp(name)}\\s*[:：-]\\s*`, 'i'), '')
    .replace(/\bLLM\b/g, 'LLM')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[。.]$/, '');
}

function inferProjectType(text: string) {
  const lower = text.toLowerCase();
  if (/agent|智能体|multi-?agents?/.test(lower)) return 'AI Agent';
  if (/framework|框架|sdk|toolkit|工具包/.test(lower)) return '开发框架';
  if (/model|llm|inference|推理|模型/.test(lower)) return '模型/推理';
  if (/ui|dashboard|app|interface|界面|应用/.test(lower)) return '应用/UI';
  if (/data|database|vector|rag|数据|向量/.test(lower)) return '数据/基础设施';
  return '开源项目';
}

function inferUseCase(text: string, lang: string) {
  const lower = text.toLowerCase();
  const langPart = lang ? `${lang} 生态、` : '';
  if (/trading|finance|financial|金融|交易/.test(lower)) {
    return `${langPart}金融 AI、交易智能体或量化研究实现参考`;
  }
  if (/agent|智能体|multi-?agents?/.test(lower)) {
    return `${langPart}AI Agent 架构、自动化工作流或多智能体协作参考`;
  }
  if (/rag|retrieval|vector|检索|知识库|向量/.test(lower)) {
    return `${langPart}RAG、知识库检索或企业数据问答方案参考`;
  }
  if (/ui|dashboard|interface|界面/.test(lower)) {
    return `${langPart}AI 应用界面、控制台或产品原型参考`;
  }
  if (/model|llm|inference|推理|模型/.test(lower)) {
    return `${langPart}模型部署、推理优化或模型能力评估参考`;
  }
  if (/dev|code|cli|开发|代码|命令行/.test(lower)) {
    return `${langPart}开发工具、工程效率或自动化脚本参考`;
  }
  return `${langPart}技术选型、方案调研或同类项目实现参考`;
}

function buildFallbackCardCopy(repo: RepoCardCopyInput, periodLabel: string) {
  const name = repoName(repo.repo);
  const raw = repo.descriptionZh || repo.description || `${name} 是近期 Star 增长较快的开源项目`;
  const desc = tidyDescription(raw, name);
  const haystack = `${repo.repo} ${repo.description} ${repo.descriptionZh ?? ''}`;
  const projectType = inferProjectType(haystack);
  const useCase = inferUseCase(haystack, repo.lang);
  const summary = `${name}：${desc}，可作为${useCase.replace(/参考$/, '')}参考。`;

  return {
    summary,
    useCase,
    keyPoints: [
      `${periodLabel}新增 ${repo.gained.toLocaleString()} stars`,
      repo.lang ? `主要使用 ${repo.lang}` : '建议查看 README 进一步评估',
      projectType,
    ],
    whyTrending: `${periodLabel} Star 增长 ${repo.gained.toLocaleString()}，说明开发者关注度正在上升。`,
    projectType,
    maturity: '可试用',
    audience: ['开发者', '技术选型'],
  };
}

export default async function TrendingPage({ searchParams }: Props) {
  const { period = 'today' } = await searchParams;
  const safe = (['today', 'week', 'month'] as const).includes(period as 'today')
    ? (period as 'today' | 'week' | 'month')
    : 'today';

  const repos = await loadTrendingList(safe, 25);
  const meta = PERIOD_META[safe];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>

      <SiteHeader />

      <main style={{ maxWidth: 900, margin: 'clamp(28px, 6vw, 40px) auto', padding: '0 clamp(16px, 5vw, 24px) 64px' }}>

        {/* Page hero */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(28px, 7vw, 36px)', color: C.ink, margin: '0 0 8px' }}>
            GitHub 趋势
          </h1>
          <p style={{ fontSize: 15, color: C.inkSoft, margin: 0 }}>{meta.desc}</p>
        </div>

        {/* Period tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 } as React.CSSProperties}>
          {(['today', 'week', 'month'] as const).map((p) => {
            const m = PERIOD_META[p];
            const isActive = p === safe;
            return (
              <Link
                key={p}
                href={`/trending?period=${p}`}
                style={{
                  padding: '8px 20px', borderRadius: 999, fontSize: 14, fontWeight: isActive ? 700 : 500,
                  background: isActive ? C.ink : C.panel,
                  color: isActive ? '#fff' : C.inkSoft,
                  border: `1px solid ${isActive ? C.ink : C.rule}`,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.label} <span style={{ opacity: 0.6, fontSize: 12 }}>{m.labelEn}</span>
              </Link>
            );
          })}
        </div>

        {/* Repo list */}
        {repos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.inkMuted }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 15 }}>暂无数据，稍后再试</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {repos.map((r, i) => {
              const [owner, name] = r.repo.split('/');
              const langColor = LANG_COLOR[r.lang] || '#888';
              const insights = r.aiInsights;
              const periodLabel = safe === 'today' ? '今日' : safe === 'week' ? '本周' : '本月';
              const desc = insights?.oneSentenceSummary || r.descriptionZh || r.description;
              const whyTrending = insights?.whyTrending ?? null;
              return (
                <div key={r.id}>
                  <div style={{
                    background: C.panel, borderRadius: 14, border: `1px solid ${C.rule}`,
                    padding: 'clamp(16px, 4vw, 18px) clamp(16px, 5vw, 22px)', display: 'flex', alignItems: 'flex-start', gap: 14,
                    transition: 'border-color 0.15s',
                  }}>
                    {/* Rank */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginTop: 2,
                      background: i < 3 ? C.primaryBg : '#F3F4F6',
                      display: 'grid', placeItems: 'center',
                      fontWeight: 700, fontSize: 14,
                      color: i < 3 ? C.accent : C.inkMuted,
                    }}>{i + 1}</div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Repo name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: C.inkMuted }}>{owner} /</span>
                        <Link href={`/trending/${r.repo}`} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 700, color: C.ink, textDecoration: 'none' }}>{name}</Link>
                        {r.lang && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.inkSoft }}>
                            <span style={{ width: 10, height: 10, borderRadius: 5, background: langColor, display: 'inline-block', flexShrink: 0 }} />
                            {r.lang}
                          </span>
                        )}
                      </div>

                      {/* Description + why trending */}
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ margin: whyTrending ? '0 0 6px' : 0, fontSize: 13, color: C.inkSoft, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                          {desc}
                        </p>
                        {whyTrending && (
                          <p style={{ margin: 0, fontSize: 12, color: C.inkMuted, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                            <span style={{ color: C.accent, fontWeight: 600, marginRight: 4 }}>上榜理由</span>
                            {whyTrending}
                          </p>
                        )}
                      </div>

                      {/* Stats row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: C.inkMuted, flexWrap: 'wrap' }}>
                        <span>★ {r.stars.toLocaleString()}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.green, fontWeight: 600 }}>
                          <span>+{r.gained.toLocaleString()}</span>
                          <span style={{ fontWeight: 400, color: C.inkMuted }}>
                            {periodLabel}
                          </span>
                        </span>
                        {insights?.projectType && <Pill tone="accent">{insights.projectType}</Pill>}
                        {insights?.maturity && <Pill tone="green">{insights.maturity}</Pill>}
                        {insights?.audience?.slice(0, 2).map((a) => <Pill key={a}>{a}</Pill>)}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 0 }}>
                      <ShareButton title={`${r.repo} GitHub ${periodLabel}趋势`} text={desc} path={`/trending/${r.repo}`} compact />
                      <Link href={`/trending/${r.repo}`} style={{ color: C.inkMuted, fontSize: 16, textDecoration: 'none' }}>›</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
