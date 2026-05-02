import Link from 'next/link';
import type { Metadata } from 'next';
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
  today: { label: '今日',   labelEn: 'Today',      desc: '过去 24 小时 Star 增长最快的开源项目' },
  week:  { label: '本周',   labelEn: 'This Week',  desc: '本周 Star 增长最快的开源项目' },
  month: { label: '本月',   labelEn: 'This Month', desc: '本月 Star 增长最快的开源项目' },
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
      title: `${title} | AiToolsBox`,
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
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(30px, 8vw, 38px)', color: C.ink, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
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
              return (
                <Link
                  key={r.id}
                  href={`/trending/${r.repo}`}
                  style={{ display: 'block', textDecoration: 'none' }}
                >
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
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 700, color: C.ink }}>{name}</span>
                        {r.lang && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.inkSoft }}>
                            <span style={{ width: 10, height: 10, borderRadius: 5, background: langColor, display: 'inline-block', flexShrink: 0 }} />
                            {r.lang}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: 13, color: C.inkSoft, margin: '0 0 10px', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                        {r.descriptionZh || r.description}
                      </p>

                      {/* Stats row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: C.inkMuted, flexWrap: 'wrap' }}>
                        <span>★ {r.stars.toLocaleString()}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.green, fontWeight: 600 }}>
                          <span>+{r.gained.toLocaleString()}</span>
                          <span style={{ fontWeight: 400, color: C.inkMuted }}>
                            {safe === 'today' ? '今日' : safe === 'week' ? '本周' : '本月'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ color: C.inkMuted, fontSize: 16, flexShrink: 0, marginTop: 4 }}>›</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
