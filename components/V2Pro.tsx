'use client';

import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { v2Tokens as T } from '@/lib/tokens';
import type { Category, HomepageStats, RepoItem, Tool, TrendingPeriod, NewsItem } from '@/lib/data';

type HomeData = {
  tools: Tool[];
  categories: Category[];
  trending: Record<TrendingPeriod, RepoItem[]>;
  stats: HomepageStats;
  news: NewsItem[];
};

type DecisionLink = {
  title: string;
  description: string;
  href: string;
  accent: string;
  tone: string;
};

type CompareCard = {
  title: string;
  summary: string;
  href: string;
  badges: string[];
};

type ScenarioCard = {
  title: string;
  summary: string;
  href: string;
  meta: string;
};

const decisionLinks: DecisionLink[] = [
  {
    title: '对比两个 AI 工具',
    description: '适合承接 Claude Code vs Codex、Cursor vs Trae 这类高意图需求。',
    href: '/tools',
    accent: T.accent,
    tone: T.primaryBg,
  },
  {
    title: '按工作场景找工具',
    description: '把“写代码、做 PPT、做内容”直接映射成推荐结果。',
    href: '/tools',
    accent: '#245F8F',
    tone: '#DBE9F4',
  },
  {
    title: '寻找替代方案',
    description: '为价格高、接入难或不稳定的工具提供更合适的替代路径。',
    href: '/tools',
    accent: '#B7472A',
    tone: '#FFE1D4',
  },
  {
    title: '查看编辑榜单',
    description: '按新手、团队、中文环境和低成本尝试等维度排序。',
    href: '/tools',
    accent: '#8A5A00',
    tone: '#F4E5BD',
  },
];

const compareCards: CompareCard[] = [
  {
    title: 'Claude Code vs Codex',
    summary: '看终端开发、本地代码代理、任务委派和 OpenAI 生态协作的差异。',
    href: '/tools',
    badges: ['AI 编程', '开发者'],
  },
  {
    title: 'Cursor vs Trae',
    summary: '比较 AI IDE、中文体验、上手门槛和团队落地难度。',
    href: '/tools',
    badges: ['代码助手', '中文体验'],
  },
  {
    title: 'ChatGPT vs Kimi',
    summary: '从长文档、联网搜索、中文写作和日常办公角度看谁更顺手。',
    href: '/tools',
    badges: ['智能对话', '办公'],
  },
  {
    title: 'Midjourney vs 即梦',
    summary: '比较画质、商用可行性、中文提示词和国内使用门槛。',
    href: '/tools',
    badges: ['AI 绘图', '创作者'],
  },
];

const scenarioCards: ScenarioCard[] = [
  {
    title: '适合国内程序员的 AI 编程工具',
    summary: '围绕代码生成、代码审查、终端代理、IDE 助手和团队协作做选择。',
    href: '/tools',
    meta: '12 个工具候选',
  },
  {
    title: '适合做 PPT 的 AI 工具',
    summary: '从一句话生成、模板质量、文档转 PPT 和可编辑性来筛选。',
    href: '/tools',
    meta: '8 个工具候选',
  },
  {
    title: '适合小红书运营的 AI 工具',
    summary: '选题、文案、封面、图像和批量改写放到一个场景里统一决策。',
    href: '/tools',
    meta: '15 个工具候选',
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

function ToolLogo({ tool, size = 48 }: { tool: Tool; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        display: 'grid',
        placeItems: 'center',
        background: tool.brand,
        color: '#fff',
        fontFamily: 'Georgia, serif',
        fontWeight: 900,
        fontSize: tool.mono.length === 1 ? size * 0.48 : size * 0.3,
        flexShrink: 0,
      }}
    >
      {tool.mono}
    </div>
  );
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

  return reasons[0] ?? '适合放入第一批结构化评测候选';
}

function getChinaAccessLabel(access?: Tool['chinaAccess']) {
  switch (access) {
    case 'accessible':
      return '可直接使用';
    case 'vpn-required':
      return '需确认访问条件';
    case 'blocked':
      return '使用门槛高';
    default:
      return '待确认';
  }
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
  const hotQueries = [
    'Claude Code vs Codex',
    'Cursor 替代品',
    '国内 AI 编程工具',
    '免费 AI 绘图工具',
    'AI PPT 工具推荐',
  ];

  return (
    <section
      style={{
        padding: mobile ? '34px 16px 22px' : '54px 56px 34px',
        background: T.bg,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'minmax(0, 1.08fr) minmax(320px, 0.72fr)',
          gap: 28,
          alignItems: 'stretch',
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
              fontWeight: 700,
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
              fontSize: mobile ? 46 : 82,
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
            比较价格、中文支持、国内使用情况、适合场景和替代方案。把“有哪些工具”升级成“我该用哪个”。
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: mobile ? 'wrap' : 'nowrap',
              padding: 8,
              maxWidth: 760,
              borderRadius: 12,
              background: T.panel,
              border: `1px solid ${T.rule}`,
              boxShadow: '0 18px 44px rgba(24, 32, 28, .10)',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                background: T.primaryBg,
                color: T.accent,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              搜
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索工具、对比或场景，例如 Claude Code vs Codex"
              style={{
                flex: 1,
                minWidth: mobile ? '100%' : 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: T.ink,
                fontSize: 16,
              }}
            />
            <Link
              href="/tools"
              style={{
                minHeight: 42,
                padding: '10px 18px',
                borderRadius: 10,
                background: T.primary,
                color: '#fff',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              进入工具库
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {hotQueries.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: `1px solid ${T.rule}`,
                  background: T.panel,
                  color: T.inkSoft,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <aside
          style={{
            borderRadius: 14,
            background: T.panel,
            border: `1px solid ${T.rule}`,
            boxShadow: '0 8px 26px rgba(24, 32, 28, .06)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 18, borderBottom: `1px solid ${T.rule}`, background: '#FFF3E6' }}>
            <strong style={{ display: 'block', fontSize: 16, marginBottom: 4 }}>今天想解决什么问题？</strong>
            <span style={{ color: T.inkSoft, fontSize: 13, lineHeight: 1.55 }}>
              从决策入口开始，比先翻几十个分类更快。
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
                  {link.title.slice(0, 1)}
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
            borderRadius: 12,
            background: T.panel,
            border: `1px solid ${T.rule}`,
            boxShadow: '0 8px 26px rgba(24, 32, 28, .06)',
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

function ScenarioSection({ cards, mobile }: { cards: ScenarioCard[]; mobile: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
        gap: 14,
      }}
    >
      {cards.map((card, index) => (
        <Link
          key={card.title}
          href={card.href}
          style={{
            minHeight: 188,
            borderRadius: 12,
            background: T.panel,
            border: `1px solid ${T.rule}`,
            boxShadow: '0 8px 26px rgba(24, 32, 28, .06)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              minHeight: 26,
              padding: '4px 8px',
              borderRadius: 6,
              background: index === 1 ? '#DBE9F4' : index === 2 ? '#FFE1D4' : T.primaryBg,
              color: index === 1 ? '#245F8F' : index === 2 ? '#B7472A' : T.accent,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {index === 0 ? '编程开发' : index === 1 ? '办公效率' : '内容运营'}
          </span>
          <h3 style={{ margin: 0, fontSize: 19, lineHeight: 1.35 }}>{card.title}</h3>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 14, lineHeight: 1.65 }}>{card.summary}</p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 'auto',
              color: T.inkMuted,
              fontSize: 13,
            }}
          >
            <span>{card.meta}</span>
            <strong style={{ color: T.accent }}>查看场景 →</strong>
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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : 'minmax(0, 1fr) 330px',
        gap: 18,
      }}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        {tools.map((tool) => {
          const category = categories.find((item) => item.id === tool.cat);
          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: mobile ? '48px minmax(0, 1fr)' : '48px minmax(0, 1fr) 160px 92px',
                gap: 14,
                alignItems: 'center',
                padding: 14,
                borderRadius: 12,
                background: T.panel,
                border: `1px solid ${T.rule}`,
                boxShadow: '0 8px 26px rgba(24, 32, 28, .06)',
              }}
            >
              <ToolLogo tool={tool} size={44} />
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', marginBottom: 4, fontSize: 16 }}>{tool.name}</strong>
                <span style={{ display: 'block', color: T.inkSoft, fontSize: 13, lineHeight: 1.55 }}>
                  {tool.zh || tool.en}
                </span>
                <span style={{ display: 'block', color: T.inkMuted, fontSize: 12, marginTop: 6 }}>
                  推荐理由：{getRecommendationReason(tool)}
                </span>
              </div>
              {!mobile ? (
                <div>
                  <strong style={{ display: 'block', marginBottom: 3, fontSize: 13 }}>适合</strong>
                  <span style={{ color: T.inkSoft, fontSize: 12, lineHeight: 1.5 }}>
                    {tool.features?.slice(0, 2).join('、') || category?.zh || '通用场景'}
                  </span>
                </div>
              ) : null}
              {!mobile ? (
                <div
                  style={{
                    justifySelf: 'end',
                    minWidth: 84,
                    padding: '7px 10px',
                    borderRadius: 8,
                    background: T.primaryBg,
                    color: T.accent,
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {getPricingLabel(tool.pricing)}
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>

      <aside
        style={{
          borderRadius: 12,
          background: T.panel,
          border: `1px solid ${T.rule}`,
          boxShadow: '0 8px 26px rgba(24, 32, 28, .06)',
          padding: 18,
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>快速决策维度</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['国内访问', '把“能不能稳定用”单独拿出来，不和功能混在一起。'],
            ['中文支持', '界面、文档和输出质量分别判断，不用一句“支持中文”带过。'],
            ['价格透明度', '区分免费、免费增值、订阅和按量计费。'],
            ['替代方案', '高门槛工具一定要配国产替代和低成本替代。'],
          ].map(([title, desc], index) => (
            <div key={title} style={{ paddingTop: index === 0 ? 0 : 12, borderTop: index === 0 ? 'none' : `1px solid ${T.rule}` }}>
              <strong style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>{title}</strong>
              <span style={{ color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>{desc}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function TrendingRail({
  repos,
  mobile,
}: {
  repos: RepoItem[];
  mobile: boolean;
}) {
  return (
    <aside
      style={{
        borderRadius: 14,
        background: T.panel,
        border: `1px solid ${T.rule}`,
        boxShadow: '0 8px 26px rgba(24, 32, 28, .06)',
        padding: 18,
        alignSelf: 'start',
        position: mobile ? 'static' : 'sticky',
        top: 90,
      }}
    >
      <h3 style={{ margin: '0 0 6px', fontFamily: 'Georgia, serif', fontSize: 24 }}>开发者趋势</h3>
      <p style={{ margin: '0 0 16px', color: T.inkSoft, fontSize: 13, lineHeight: 1.6 }}>
        只保留更贴近 AI 工程工作流的趋势项目，让首页右侧服务开发者决策。
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        {repos.slice(0, 6).map((repo, index) => (
          <Link
            key={repo.repo}
            href={`/trending/${repo.repo}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr auto',
              gap: 12,
              paddingTop: index === 0 ? 0 : 12,
              borderTop: index === 0 ? 'none' : `1px solid ${T.rule}`,
            }}
          >
            <span
              style={{
                color: index < 3 ? T.primary : T.inkMuted,
                fontWeight: 900,
                fontFamily: 'Georgia, serif',
                fontSize: index < 3 ? 22 : 14,
                lineHeight: 1,
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>{repo.repo}</strong>
              <span style={{ color: T.inkSoft, fontSize: 12, lineHeight: 1.55 }}>
                {repo.descZh || repo.desc}
              </span>
            </div>
            <span style={{ color: T.green, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
              +{repo.gained.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/trending"
        style={{
          display: 'block',
          marginTop: 16,
          textAlign: 'center',
          color: T.accent,
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        查看全部开发者趋势 →
      </Link>
    </aside>
  );
}

function Footer({ newsCount }: { newsCount: number }) {
  return (
    <footer
      style={{
        marginTop: 40,
        padding: '32px 20px',
        borderTop: `1px solid ${T.rule}`,
        background: T.bg,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${T.primary} 0%, #FBBF24 100%)`,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontFamily: 'Georgia, serif',
                fontWeight: 900,
              }}
            >
              A
            </div>
            <strong style={{ fontFamily: 'Georgia, serif', fontSize: 18 }}>AIBoxPro</strong>
          </div>
          <p style={{ margin: 0, color: T.inkSoft, fontSize: 13, lineHeight: 1.7 }}>
            面向中文用户的 AI 工具决策平台，核心不是收录多少工具，而是帮用户更快做出靠谱选择。
          </p>
        </div>
        <div style={{ color: T.inkMuted, fontSize: 12, lineHeight: 1.7 }}>
          <div>已整理工具：{newsCount}</div>
          <div>下一步：对比页、场景页、替代方案页</div>
        </div>
      </div>
    </footer>
  );
}

export default function V2ProHomepage({ tools, categories, trending, stats, news }: HomeData) {
  const mobile = useIsMobile();
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('all');

  const featuredTools = tools.filter((tool) => tool.featured).slice(0, 4);
  const visibleCategories = categories.filter((item) => item.count > 0).slice(0, 10);

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = category === 'all' || tool.cat === category;
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      needle.length === 0 ||
      tool.name.toLowerCase().includes(needle) ||
      tool.en.toLowerCase().includes(needle) ||
      tool.zh.toLowerCase().includes(query.trim());

    return matchesCategory && matchesQuery;
  });

  const recommendedTools = (filteredTools.length > 0 ? filteredTools : tools).slice(0, 4);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.ink,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <SiteHeader />

      <Hero stats={stats} query={query} setQuery={setQuery} mobile={mobile} />

      <section style={{ padding: mobile ? '14px 16px 0' : '0 56px' }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setCategory('all')}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: category === 'all' ? T.ink : T.panel,
              color: category === 'all' ? '#fff' : T.inkSoft,
              fontWeight: category === 'all' ? 700 : 500,
              outline: category === 'all' ? 'none' : `1px solid ${T.rule}`,
            }}
          >
            全部 · {tools.length}
          </button>
          {visibleCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: category === item.id ? T.primaryBg : T.panel,
                color: category === item.id ? T.accent : T.inkSoft,
                fontWeight: category === item.id ? 700 : 500,
                outline: `1px solid ${category === item.id ? T.primaryBg : T.rule}`,
              }}
            >
              {item.zh} · {item.count}
            </button>
          ))}
        </div>
      </section>

      <main style={{ padding: mobile ? '24px 16px 32px' : '36px 56px 42px' }}>
        <section style={{ marginBottom: 34 }}>
          <SectionTitle
            title="热门对比"
            description="先把高意图搜索的入口摆到首页，逐步从工具目录过渡到决策页体系。"
            actionLabel="查看工具库"
            actionHref="/tools"
          />
          <DecisionSection cards={compareCards} mobile={mobile} />
        </section>

        <section style={{ marginBottom: 34 }}>
          <SectionTitle
            title="按场景找工具"
            description="用户不一定先知道工具名，但一定先知道自己想解决什么问题。"
            actionLabel="浏览更多候选"
            actionHref="/tools"
          />
          <ScenarioSection cards={scenarioCards} mobile={mobile} />
        </section>

        <section style={{ marginBottom: 34 }}>
          <SectionTitle
            title="编辑推荐"
            description="先给推荐理由、适合场景和价格类型，不再只放简介和链接。"
            actionLabel="查看全部工具"
            actionHref="/tools"
          />
          <FeaturedTools tools={featuredTools.length > 0 ? featuredTools : recommendedTools} categories={categories} mobile={mobile} />
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : 'minmax(0, 1fr) 320px',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              borderRadius: 14,
              background: T.panel,
              border: `1px solid ${T.rule}`,
              boxShadow: '0 8px 26px rgba(24, 32, 28, .06)',
              padding: 20,
            }}
          >
            <SectionTitle
              title="当前推荐候选"
              description="先用现有数据库做出第一层筛选，后续再接入更完整的对比页和场景页。"
            />
            <div style={{ display: 'grid', gap: 10 }}>
              {recommendedTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '44px minmax(0, 1fr)',
                    gap: 12,
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 10,
                    background: '#FFF8EA',
                    border: `1px solid ${T.rule}`,
                  }}
                >
                  <ToolLogo tool={tool} size={40} />
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', marginBottom: 3 }}>{tool.name}</strong>
                    <span style={{ display: 'block', color: T.inkSoft, fontSize: 13, lineHeight: 1.55 }}>
                      {tool.zh || tool.en}
                    </span>
                    <span style={{ display: 'block', color: T.inkMuted, fontSize: 12, marginTop: 6 }}>
                      {getPricingLabel(tool.pricing)} · {getChinaAccessLabel(tool.chinaAccess)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <TrendingRail repos={trending.today} mobile={mobile} />
        </section>
      </main>

      <Footer newsCount={tools.length} />
    </div>
  );
}
