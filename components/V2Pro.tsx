'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { ToolIcon } from '@/components/ToolBadges';
import { v2Tokens as T } from '@/lib/tokens';
import type { Category, HomepageStats, RepoItem, Tool, TrendingPeriod } from '@/lib/data';
import { LANG_COLOR } from '@/lib/data';

type HomeData = {
  tools: Tool[];
  categories: Category[];
  trending: Record<TrendingPeriod, RepoItem[]>;
  stats: HomepageStats;
};

type DecisionLink = {
  title: string;
  description: string;
  href: string;
  icon: string;
  accent: string;
  tone: string;
};

type CompareCard = {
  title: string;
  summary: string;
  href: string;
  badges: string[];
};

const shellStyle: React.CSSProperties = {
  width: 'min(1180px, calc(100% - 40px))',
  margin: '0 auto',
};

const cardShadow = '0 8px 26px rgba(24, 32, 28, .06)';
const heroShadow = '0 18px 44px rgba(24, 32, 28, .10)';

const decisionLinks: DecisionLink[] = [
  {
    title: '看 AI 工具横评',
    description: 'Cursor 还是 Trae？Claude Code 还是 Codex？纠结时来这里。',
    href: '/compare',
    icon: '⚖️',
    accent: T.accent,
    tone: T.primaryBg,
  },
  {
    title: '国内可直连工具',
    description: '海外工具被墙、不稳定？看哪些工具国内能直接打开。',
    href: '/tools?china=accessible',
    icon: '🇨🇳',
    accent: '#B7472A',
    tone: '#FFE1D4',
  },
  {
    title: '看 GitHub 开发趋势',
    description: '每天追踪 AI 圈最火的开源项目，比看博客快一步。',
    href: '/trending',
    icon: '📈',
    accent: '#8A5A00',
    tone: '#F4E5BD',
  },
];

const compareCards: CompareCard[] = [
  {
    title: 'Claude Code vs Codex',
    summary: '看终端开发、本地代码代理、任务委派和 OpenAI 生态协作的差异。',
    href: '/compare/claude-code-vs-codex',
    badges: ['AI 编程', '开发者'],
  },
  {
    title: 'Cursor vs Trae',
    summary: '比较 AI IDE、中文体验、上手门槛和团队落地难度。',
    href: '/compare/cursor-vs-trae',
    badges: ['代码助手', '中文体验'],
  },
  {
    title: 'DeepSeek vs ChatGPT',
    summary: '中文场景下两者各自的优劣、价格差异和国内访问稳定性。',
    href: '/compare/deepseek-vs-chatgpt',
    badges: ['智能对话', '中文场景'],
  },
  {
    title: '豆包 vs Kimi',
    summary: '日常办公、长文档、联网搜索哪个更顺手，国内用户怎么挑。',
    href: '/compare/doubao-vs-kimi',
    badges: ['国产对比', '办公'],
  },
];

function useIsMobile() {
  const [mobile, setMobile] = React.useState(false);

  React.useEffect(() => {
    const update = () => setMobile(window.innerWidth < 860);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return mobile;
}

function formatDateLabel(iso?: string) {
  if (!iso) return '今日更新';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '今日更新';
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}


function SectionTitle({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 16,
        marginBottom: 18,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h2
          style={{
            margin: '0 0 6px',
            fontFamily: 'Georgia, serif',
            fontSize: 34,
            lineHeight: 1.05,
            color: T.ink,
          }}
        >
          {title}
        </h2>
        <p style={{ margin: 0, color: T.inkSoft, fontSize: 14, lineHeight: 1.65 }}>{description}</p>
      </div>
      {actionLabel && actionHref ? (
        <Link href={actionHref} style={{ color: T.accent, fontWeight: 700, fontSize: 14 }}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function getRecommendationReason(tool: Tool) {
  const reasons: string[] = [];

  if (tool.chinaAccess === 'accessible') reasons.push('国内访问门槛相对更低');
  if (tool.chineseUi) reasons.push('中文界面更友好');
  if (tool.apiAvailable) reasons.push('支持 API 接入');
  if (tool.features && tool.features.length > 0) reasons.push(`覆盖 ${tool.features.slice(0, 2).join('、')}`);
  if (tool.pricing === 'Free') reasons.push('适合低成本尝试');
  if (tool.pricing === 'Freemium') reasons.push('有免费试用空间');

  return reasons[0] ?? '值得先试一试';
}

function getPricingLabel(pricing: Tool['pricing']) {
  switch (pricing) {
    case 'Free':
      return '免费';
    case 'Freemium':
      return '免费增值';
    case 'Paid':
      return '付费';
    default:
      return pricing;
  }
}

function Hero({
  stats,
  query,
  setQuery,
  mobile,
}: {
  stats: HomepageStats;
  query: string;
  setQuery: (value: string) => void;
  mobile: boolean;
}) {
  const router = useRouter();
  // TODO: 接入真实搜索词数据（Vercel Analytics 或 GA4 埋点）
  // 当前为编辑写死的「应该热」，不是按真实搜索/点击量统计的。
  // 数据回流后改为 DB 查询：select label, href from hot_queries order by clicks desc limit 5
  const hotQueries: { label: string; href: string }[] = [
    { label: 'Claude Code vs Codex', href: '/compare/claude-code-vs-codex' },
    { label: 'Cursor vs Trae',       href: '/compare/cursor-vs-trae' },
    { label: '国内 AI 编程工具',     href: '/tools?cat=code&china=accessible' },
    { label: '免费 AI 绘图工具',     href: '/tools?cat=image&pricing=Free' },
    { label: 'AI PPT 工具',          href: '/tools?cat=ppt' },
  ];

  const submitSearch = () => {
    const q = query.trim();
    router.push(`/tools${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  return (
    <section
      style={{
        padding: mobile ? '34px 0 22px' : '54px 0 34px',
      }}
    >
      <div
        style={{
          ...shellStyle,
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'minmax(0, 1.08fr) minmax(360px, 0.72fr)',
          gap: 34,
          alignItems: 'end',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 30,
              padding: '0 12px',
              borderRadius: 999,
              background: T.primaryBg,
              color: T.accent,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: T.primary,
                display: 'inline-block',
              }}
            />
            {stats.toolsTotal} 个工具已整理 · {formatDateLabel(stats.lastUpdatedAt)}
          </div>

          <h1
            style={{
              margin: '22px 0 14px',
              fontFamily: 'Georgia, serif',
              fontSize: mobile ? 46 : 86,
              lineHeight: mobile ? 1.05 : 0.96,
              color: T.ink,
              letterSpacing: 0,
            }}
          >
            选 AI 工具，
            <br />
            先看 AIBoxPro
          </h1>

          <p
            style={{
              margin: '0 0 26px',
              maxWidth: 720,
              fontSize: mobile ? 16 : 18,
              color: T.inkSoft,
              lineHeight: 1.75,
            }}
          >
            比较价格、中文支持、国内能不能直接用、适合什么场景、有没有替代方案。一次看完，再决定用哪个。
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: mobile ? 'wrap' : 'nowrap',
              padding: 8,
              maxWidth: 760,
              borderRadius: 8,
              background: T.panel,
              border: `1px solid ${T.rule}`,
              boxShadow: heroShadow,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                background: '#DBE9F4',
                color: '#245F8F',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              搜
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submitSearch();
                }
              }}
              placeholder="输入工具名或对比，例如 Claude Code vs Codex"
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: 42,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: T.ink,
                fontSize: 16,
              }}
            />
            <Link
              href={`/tools${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`}
              style={{
                minHeight: 42,
                padding: '10px 18px',
                borderRadius: 8,
                background: T.primary,
                color: '#fff',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              搜索
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {hotQueries.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: `1px solid ${T.rule}`,
                  background: 'rgba(255, 253, 247, .78)',
                  color: T.inkSoft,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <aside
          style={{
            borderRadius: 8,
            background: T.panel,
            border: `1px solid ${T.rule}`,
            boxShadow: heroShadow,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 18, borderBottom: `1px solid ${T.rule}`, background: '#FFF3E6' }}>
            <strong style={{ display: 'block', fontSize: 16, marginBottom: 4 }}>今天想解决什么问题？</strong>
            <span style={{ color: T.inkSoft, fontSize: 13, lineHeight: 1.55 }}>
              从决策入口开始，比翻分类更快。
            </span>
          </div>
          <div>
            {decisionLinks.map((link, index) => (
              <Link
                key={link.title}
                href={link.href}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '16px 18px',
                  borderTop: index === 0 ? 'none' : `1px solid ${T.rule}`,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: link.tone,
                    color: link.accent,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 900,
                  }}
                >
                  {link.icon}
                </div>
                <div>
                  <strong style={{ display: 'block', marginBottom: 3, fontSize: 15 }}>{link.title}</strong>
                  <span style={{ color: T.inkSoft, fontSize: 12, lineHeight: 1.5 }}>{link.description}</span>
                </div>
                <span style={{ color: T.inkMuted, fontWeight: 700 }}>→</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function DecisionSection({ cards, mobile }: { cards: CompareCard[]; mobile: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : 'repeat(4, minmax(0, 1fr))',
        gap: 14,
      }}
    >
      {cards.map((card) => (
        <Link
          key={card.title}
          href={card.href}
          style={{
            minHeight: 214,
            borderRadius: 8,
            background: T.panel,
            border: `1px solid ${T.rule}`,
            boxShadow: cardShadow,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                padding: '10px 8px',
                borderRadius: 8,
                background: '#FFF8EA',
                textAlign: 'center',
                fontWeight: 800,
              }}
            >
              {card.title.split(' vs ')[0]}
            </div>
            <span style={{ color: T.accent, fontWeight: 900 }}>VS</span>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                padding: '10px 8px',
                borderRadius: 8,
                background: '#FFF8EA',
                textAlign: 'center',
                fontWeight: 800,
              }}
            >
              {card.title.split(' vs ')[1]}
            </div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, lineHeight: 1.35 }}>{card.title}</h3>
            <p style={{ margin: 0, color: T.inkSoft, fontSize: 14, lineHeight: 1.65 }}>{card.summary}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
            {card.badges.map((badge) => (
              <span
                key={badge}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: T.primaryBg,
                  color: T.accent,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}

function FeaturedTools({
  tools,
  categories,
  mobile,
}: {
  tools: Tool[];
  categories: Category[];
  mobile: boolean;
}) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {tools.map((tool) => {
        const category = categories.find((item) => item.id === tool.cat);
        return (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: mobile ? '52px minmax(0, 1fr)' : '52px minmax(0, 1fr) 170px 120px',
              gap: 14,
              alignItems: 'center',
              padding: 14,
              borderRadius: 8,
              background: T.panel,
              border: `1px solid ${T.rule}`,
              boxShadow: cardShadow,
            }}
          >
            <ToolIcon name={tool.name} mono={tool.mono} brand={tool.brand} url={tool.url} size={44} />
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', marginBottom: 4, fontSize: 16 }}>{tool.name}</strong>
              <span style={{ display: 'block', color: T.inkSoft, fontSize: 13, lineHeight: 1.5 }}>
                {tool.zh || tool.en}
              </span>
            </div>
            {!mobile ? (
              <div>
                <strong style={{ display: 'block', marginBottom: 3, fontSize: 13 }}>适合</strong>
                <span style={{ color: T.inkSoft, fontSize: 12, lineHeight: 1.5 }}>
                  {tool.features?.slice(0, 2).join('、') || category?.zh || getRecommendationReason(tool)}
                </span>
              </div>
            ) : null}
            <div
              style={{
                gridColumn: mobile ? '2' : 'auto',
                justifySelf: mobile ? 'start' : 'end',
                minWidth: 82,
                padding: '7px 10px',
                borderRadius: 8,
                background: T.primaryBg,
                color: T.accent,
                textAlign: 'center',
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              {getPricingLabel(tool.pricing)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function formatStars(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

const PERIOD_LABELS: { value: TrendingPeriod; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
];

function TrendingRail({ trending }: { trending: Record<TrendingPeriod, RepoItem[]> }) {
  const [period, setPeriod] = React.useState<TrendingPeriod>('today');
  const repos = trending[period].slice(0, 5);

  return (
    <aside
      style={{
        borderRadius: 8,
        background: T.panel,
        border: `1px solid ${T.rule}`,
        boxShadow: cardShadow,
        padding: 18,
        alignSelf: 'start',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>📈 开发者趋势</h3>
        <Link href="/trending" style={{ color: T.accent, fontSize: 12, fontWeight: 700 }}>
          完整榜单 →
        </Link>
      </div>

      <div
        style={{
          display: 'inline-flex',
          gap: 4,
          padding: 4,
          borderRadius: 8,
          background: '#FAF5EA',
          marginBottom: 8,
        }}
      >
        {PERIOD_LABELS.map((p) => {
          const active = period === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                background: active ? T.panel : 'transparent',
                color: active ? T.ink : T.inkMuted,
                fontWeight: active ? 800 : 600,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div>
        {repos.length === 0 ? (
          <div style={{ padding: '16px 0', color: T.inkMuted, fontSize: 13 }}>暂无数据</div>
        ) : repos.map((repo, index) => {
          const langColor = LANG_COLOR[repo.lang] ?? '#9CA3AF';
          return (
            <Link
              key={repo.repo}
              href={`/trending/${repo.repo}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr',
                gap: 10,
                padding: '12px 0',
                borderTop: index === 0 ? 'none' : `1px solid ${T.rule}`,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: index === 0 ? T.accent : '#FAF5EA',
                  color: index === 0 ? '#fff' : T.inkSoft,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {index + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <strong style={{
                    fontSize: 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}>{repo.repo}</strong>
                  <span style={{ color: '#B7472A', fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap' }}>
                    +{formatStars(repo.gained)}
                  </span>
                </div>
                <p style={{
                  margin: '4px 0 6px',
                  color: T.inkSoft,
                  fontSize: 12,
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                }}>
                  {repo.descZh || repo.desc}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: T.inkMuted }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColor }} />
                    {repo.lang}
                  </span>
                  <span>⭐ {formatStars(repo.stars)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export default function V2ProHomepage({ tools, categories, trending, stats }: HomeData) {
  const mobile = useIsMobile();
  const [query, setQuery] = React.useState('');

  const featuredTools = tools.filter((tool) => tool.featured).slice(0, 4);

  const filteredTools = tools.filter((tool) => {
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      needle.length === 0 ||
      tool.name.toLowerCase().includes(needle) ||
      tool.en.toLowerCase().includes(needle) ||
      tool.zh.toLowerCase().includes(query.trim());

    return matchesQuery;
  });

  const recommendedTools = (filteredTools.length > 0 ? filteredTools : tools).slice(0, 4);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(90deg, rgba(23, 32, 28, .035) 1px, transparent 1px), linear-gradient(rgba(23, 32, 28, .035) 1px, transparent 1px), #F6F1E8',
        backgroundSize: '24px 24px',
        color: T.ink,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <SiteHeader />

      <Hero stats={stats} query={query} setQuery={setQuery} mobile={mobile} />

      <main style={{ padding: mobile ? '24px 0 32px' : '34px 0 42px' }}>
        <section style={{ marginBottom: 34 }}>
          <div style={shellStyle}>
            <SectionTitle
              title="热门对比"
              description="这些工具经常被拿来比较，点进去看清楚区别再选。"
              actionLabel="查看全部对比"
              actionHref="/compare"
            />
            <DecisionSection cards={compareCards} mobile={mobile} />
          </div>
        </section>

        <section style={{ marginBottom: 34 }}>
          <div style={shellStyle}>
            <SectionTitle
              title="编辑推荐"
              description="编辑挑出来的工具，标注适合谁用、为什么推荐。"
              actionLabel="进入工具库"
              actionHref="/tools"
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: mobile ? '1fr' : 'minmax(0, 1fr) 360px',
                gap: 18,
                alignItems: 'start',
              }}
            >
              <FeaturedTools
                tools={featuredTools.length > 0 ? featuredTools : recommendedTools}
                categories={categories}
                mobile={mobile}
              />
              <TrendingRail trending={trending} />
            </div>
          </div>
        </section>

        {query.trim() ? (
          <section
            style={{
              ...shellStyle,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                borderRadius: 8,
                background: T.panel,
                border: `1px solid ${T.rule}`,
                boxShadow: cardShadow,
                padding: 20,
              }}
            >
              <SectionTitle title="搜索结果" description="根据你输入的关键词匹配到的工具。" />
              <FeaturedTools tools={recommendedTools} categories={categories} mobile={mobile} />
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
