'use client';

import React from 'react';
import { v2Tokens as T } from '@/lib/tokens';
import { LANG_COLOR, type Tool, type Category, type RepoItem, type TrendingPeriod, type HomepageStats, type NewsItem } from '@/lib/data';

/* ─── Data context ─────────────────────────────────────────────────────────── */
type DataCtx = {
  tools: Tool[];
  categories: Category[];
  trending: Record<TrendingPeriod, RepoItem[]>;
  stats: HomepageStats;
  news: NewsItem[];
};
const DataContext = React.createContext<DataCtx | null>(null);
function useData(): DataCtx {
  const v = React.useContext(DataContext);
  if (!v) throw new Error('DataContext missing');
  return v;
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function formatNumber(n: number): string { return n.toLocaleString('en-US'); }

/* ─── Tool Logo ───────────────────────────────────────────────────────────── */
function ToolLogo({ tool, size = 56 }: { tool: Tool; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.22),
      background: tool.brand, color: '#fff',
      display: 'grid', placeItems: 'center',
      fontFamily: 'Georgia, serif', fontWeight: 700,
      fontSize: tool.mono.length === 1 ? size * 0.5 : size * 0.34,
      flexShrink: 0, letterSpacing: '-0.04em',
    }}>{tool.mono}</div>
  );
}

/* ─── TopBar ──────────────────────────────────────────────────────────────── */
function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const navItems: [string, string][] = [
    ['首页 Home', '/'],
    ['AI 资讯 News', '/news'],
  ];
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 56px', borderBottom: `1px solid ${T.rule}`,
      background: T.panel, position: 'sticky', top: 0, zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `linear-gradient(135deg, ${T.primary} 0%, #FBBF24 100%)`,
          display: 'grid', placeItems: 'center', color: '#fff',
          fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 17, fontStyle: 'italic',
        }}>A</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18, color: T.ink, letterSpacing: '-0.02em' }}>AiToolsBox</span>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: T.inkMuted }}>· 工具集</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 4, fontSize: 14 }}>
        {navItems.map(([label, href]) => {
          const active = typeof window !== 'undefined' ? window.location.pathname === href : href === '/';
          return (
            <a key={href} href={href} style={{
              padding: '6px 12px', cursor: 'pointer',
              color: active ? T.ink : T.inkSoft,
              fontWeight: active ? 600 : 500,
              borderBottom: active ? `2px solid ${T.primary}` : '2px solid transparent',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = T.ink; e.currentTarget.style.borderBottomColor = T.ruleSoft; } }}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = T.inkSoft; e.currentTarget.style.borderBottomColor = 'transparent'; } }}
            >{label}</a>
          );
        })}
      </nav>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onOpenPalette} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px',
          background: T.bg, borderRadius: 8, border: `1px solid ${T.rule}`,
          fontSize: 13, color: T.inkMuted, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span>⌕</span><span>搜索…</span>
          <span style={{ display: 'inline-flex', gap: 2, marginLeft: 4 }}>
            <kbd style={{ padding: '1px 5px', background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 3, fontSize: 10, fontFamily: 'ui-monospace, monospace' }}>⌘</kbd>
            <kbd style={{ padding: '1px 5px', background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 3, fontSize: 10, fontFamily: 'ui-monospace, monospace' }}>K</kbd>
          </span>
        </button>
        <button style={{
          padding: '8px 20px', borderRadius: 999, border: 'none',
          background: T.ink, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>登录 Sign in</button>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */
function Hero({ query, setQuery, stats, onPopularTag }: {
  query: string; setQuery: (q: string) => void;
  stats: HomepageStats; onPopularTag: (tag: string) => void;
}) {
  const dateLabel = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  return (
    <section style={{ padding: '64px 56px 48px', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -100, top: -100, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: -60, bottom: -100, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 920 }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: T.primaryBg, color: T.accent, fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: T.primary, display: 'inline-block' }} />
          {formatNumber(stats.toolsTotal)} tools curated &nbsp;·&nbsp; 更新于 {dateLabel}
        </div>
        {/* Title */}
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 84, lineHeight: 0.95, color: T.ink, margin: '0 0 26px', letterSpacing: '-0.04em' }}>
          The thoughtful<br />
          <span style={{ color: T.primary }}>directory</span> of AI.
        </h1>
        {/* Subtitle */}
        <p style={{ fontSize: 19, color: T.inkSoft, lineHeight: 1.55, margin: '0 0 36px', maxWidth: 620 }}>
          每天精选最值得收藏的 AI 工具，并实时追踪 GitHub 上的 AI 趋势项目。<br />
          A hand-picked AI directory and a live pulse of what&rsquo;s trending on GitHub.
        </p>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: T.panel, borderRadius: 14, padding: 6, boxShadow: '0 24px 60px -20px rgba(249,115,22,0.3), 0 4px 12px rgba(31,41,55,0.06)', border: `1px solid ${T.rule}`, maxWidth: 640 }}>
          <div style={{ padding: '0 14px', color: T.inkMuted, fontSize: 18 }}>⌕</div>
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索 AI 工具，例如 ChatGPT、Midjourney、Cursor…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, padding: '14px 4px', background: 'transparent', color: T.ink, fontFamily: 'inherit' }}
          />
          <button style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: T.primary, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Search</button>
        </div>
        {/* Popular tags */}
        <div style={{ display: 'flex', gap: 8, marginTop: 18, fontSize: 13, color: T.inkMuted, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>热门 Popular:</span>
          {['Claude', 'Cursor', 'Midjourney', 'Suno', 'v0', 'Perplexity'].map((tag) => (
            <button key={tag} onClick={() => onPopularTag(tag)} style={{ padding: '4px 12px', borderRadius: 999, background: T.panel, border: `1px solid ${T.rule}`, color: T.inkSoft, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.rule; e.currentTarget.style.color = T.inkSoft; }}
            >{tag}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Category strip ──────────────────────────────────────────────────────── */
function CategoryStrip({ cat, setCat }: { cat: string; setCat: (c: string) => void }) {
  const { categories: CATEGORIES, tools: ALL_TOOLS } = useData();
  return (
    <section style={{ background: T.bg, borderBottom: `1px solid ${T.rule}` }}>
      <div style={{ display: 'flex', gap: 8, padding: '16px 56px', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
        <CatPill active={cat === 'all'} onClick={() => setCat('all')}>全部 All · {ALL_TOOLS.length}</CatPill>
        {CATEGORIES.map((c) => (
          <CatPill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} href={`/categories/${c.id}`}>
            {c.icon} {c.zh} <span style={{ opacity: 0.5, fontSize: 11 }}>{c.count}</span>
          </CatPill>
        ))}
      </div>
    </section>
  );
}

function CatPill({ active, onClick, href, children }: { active: boolean; onClick: () => void; href?: string; children: React.ReactNode }) {
  const style: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 15px', borderRadius: 999,
    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13,
    fontWeight: active ? 600 : 500,
    background: active ? T.ink : T.panel,
    color: active ? '#fff' : T.inkSoft,
    outline: `1px solid ${active ? 'transparent' : T.rule}`,
    boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
    textDecoration: 'none',
  };
  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { if (!active) { e.currentTarget.style.background = T.panel2; e.currentTarget.style.outline = `1px solid ${T.primary}`; } },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { if (!active) { e.currentTarget.style.background = T.panel; e.currentTarget.style.outline = `1px solid ${T.rule}`; } },
  };
  if (href) {
    return <a href={href} onClick={(e) => { e.preventDefault(); onClick(); }} style={style} {...handlers}>{children}</a>;
  }
  return <button onClick={onClick} style={style} {...handlers}>{children}</button>;
}

/* ─── Featured tool card (Editor's Pick) ─────────────────────────────────── */
function FeaturedCard({ tool }: { tool: Tool }) {
  const { categories: CATEGORIES } = useData();
  const catZh = CATEGORIES.find((c) => c.id === tool.cat)?.zh;
  return (
    <div style={{
      background: T.panel, borderRadius: 16, padding: 24,
      border: `1px solid ${T.rule}`, cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden',
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 36px -12px rgba(31,41,55,0.15)'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ position: 'absolute', top: 14, right: 14, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', background: T.primaryBg, color: T.accent, textTransform: 'uppercase' }}>Editor&rsquo;s Pick</div>
      <ToolLogo tool={tool} size={60} />
      <div>
        <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 22, margin: '0 0 6px', color: T.ink, letterSpacing: '-0.02em' }}>{tool.name}</h3>
        <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.55, margin: '0 0 12px' }}>{tool.en}</p>
        <p style={{ fontSize: 12, color: T.inkMuted, lineHeight: 1.5, margin: 0 }}>{tool.zh}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${T.ruleSoft}` }}>
        <span style={{ padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: T.primaryBg, color: T.accent }}>{catZh}</span>
        <span style={{ fontSize: 12, color: T.inkMuted }}>{tool.date}</span>
      </div>
    </div>
  );
}

/* ─── Regular tool card ───────────────────────────────────────────────────── */
function ToolCard({ tool, fav, toggleFav }: { tool: Tool; fav: boolean; toggleFav: (id: string) => void }) {
  const { categories: CATEGORIES } = useData();
  const catZh = CATEGORIES.find((c) => c.id === tool.cat)?.zh;
  return (
    <div style={{
      background: T.panel, borderRadius: 12, padding: 18,
      border: `1px solid ${T.rule}`, cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex', gap: 14, transition: 'border-color .15s, box-shadow .15s',
    }}
    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = T.primary; el.style.boxShadow = '0 4px 14px -4px rgba(249,115,22,0.2)'; }}
    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = T.rule; el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
    >
      <ToolLogo tool={tool} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 16, margin: 0, color: T.ink }}>{tool.name}</h4>
          <button onClick={(e) => { e.stopPropagation(); toggleFav(tool.id); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, color: fav ? T.primary : T.inkMuted, padding: 4 }}>{fav ? '★' : '☆'}</button>
        </div>
        <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.5, margin: '0 0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>{tool.en}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span style={{ padding: '2px 7px', borderRadius: 4, fontWeight: 600, background: T.primaryBg, color: T.accent }}>{catZh}</span>
          <span style={{ padding: '2px 6px', borderRadius: 4, border: `1px solid ${T.rule}`, color: T.inkMuted, fontWeight: 500 }}>{tool.pricing}</span>
          <span style={{ color: T.inkMuted, marginLeft: 'auto' }}>{tool.date}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── GitHub trending item ────────────────────────────────────────────────── */
function GhItem({ item, rank }: { item: RepoItem; rank: number }) {
  const [owner, name] = item.repo.split('/');
  return (
    <div style={{ padding: '13px 0', borderBottom: `1px solid ${T.ruleSoft}`, cursor: 'pointer', display: 'flex', gap: 12 }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = T.panel2; el.style.padding = '13px 8px'; el.style.margin = '0 -8px'; el.style.borderRadius = '6px'; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.padding = '13px 0'; el.style.margin = '0'; el.style.borderRadius = '0'; }}
    >
      <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: rank <= 3 ? 22 : 14, color: rank <= 3 ? T.primary : T.inkMuted, width: 26, lineHeight: 1, flexShrink: 0 }}>{String(rank).padStart(2, '0')}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 3, fontSize: 13 }}>
          <span style={{ color: T.inkMuted }}>{owner}</span>
          <span style={{ color: T.inkMuted }}>/</span>
          <span style={{ color: T.ink, fontWeight: 600 }}>{name}</span>
        </div>
        <p style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.5, margin: '0 0 7px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>{item.descZh || item.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: T.inkMuted }}>
          {item.lang && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: LANG_COLOR[item.lang] || '#888', display: 'inline-block' }} />
              {item.lang}
            </span>
          )}
          <span>★ {item.stars.toLocaleString()}</span>
          <span style={{ color: T.green, fontWeight: 600 }}>+{item.gained.toLocaleString()} today</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Command palette ─────────────────────────────────────────────────────── */
function PaletteSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ padding: '4px 16px', fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</div>
      {children}
    </div>
  );
}

function PaletteItem({ icon, title, sub, badge, onClick }: { icon: React.ReactNode; title: string; sub?: string; badge?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = T.panel2)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: T.ink, fontWeight: 500, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: T.inkMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
      {badge && <span style={{ fontSize: 10, color: T.inkMuted, padding: '2px 6px', border: `1px solid ${T.rule}`, borderRadius: 4, fontWeight: 500 }}>{badge}</span>}
    </button>
  );
}

function CommandPalette({ open, onClose, onOpenTool, fav, recent }: {
  open: boolean; onClose: () => void; onOpenTool: (t: Tool) => void;
  fav: Set<string>; recent: string[];
}) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { tools: AI_TOOLS, categories: CATEGORIES, trending } = useData();

  React.useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const ql = q.toLowerCase().trim();
  const matchTools = AI_TOOLS.filter((t) => !ql || t.name.toLowerCase().includes(ql) || t.en.toLowerCase().includes(ql) || t.zh.includes(q)).slice(0, 5);
  const matchRepos = trending.today.filter((r) => !ql || r.repo.toLowerCase().includes(ql) || r.desc.toLowerCase().includes(ql)).slice(0, 4);
  const matchCats = CATEGORIES.filter((c) => !ql || c.en.toLowerCase().includes(ql) || c.zh.includes(q)).slice(0, 4);
  const favTools = AI_TOOLS.filter((t) => fav.has(t.id)).slice(0, 5);
  const recentTools = recent.map((id) => AI_TOOLS.find((t) => t.id === id)).filter((t): t is Tool => Boolean(t)).slice(0, 4);
  const empty = !ql;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(31,41,55,0.4)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '12vh' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, width: '100%', maxWidth: 640, borderRadius: 14, boxShadow: '0 30px 80px -20px rgba(0,0,0,0.35)', overflow: 'hidden', border: `1px solid ${T.rule}`, fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${T.rule}` }}>
          <span style={{ fontSize: 18, color: T.inkMuted }}>⌕</span>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索 AI 工具、GitHub 仓库、分类…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: T.ink, fontFamily: 'inherit' }} />
          <kbd style={{ padding: '3px 8px', background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 4, fontSize: 11, color: T.inkMuted, fontFamily: 'ui-monospace, monospace' }}>esc</kbd>
        </div>
        <div style={{ maxHeight: 460, overflowY: 'auto' }}>
          {empty ? (
            <>
              {favTools.length > 0 && (
                <PaletteSection label="★ 我的收藏 · Favorites">
                  {favTools.map((t) => <PaletteItem key={t.id} icon={<ToolLogo tool={t} size={28} />} title={t.name} sub={t.zh} badge={CATEGORIES.find((c) => c.id === t.cat)?.zh} onClick={() => { onOpenTool(t); onClose(); }} />)}
                </PaletteSection>
              )}
              {recentTools.length > 0 && (
                <PaletteSection label="↻ 最近浏览 · Recent">
                  {recentTools.map((t) => <PaletteItem key={t.id} icon={<ToolLogo tool={t} size={28} />} title={t.name} sub={t.zh} badge={CATEGORIES.find((c) => c.id === t.cat)?.zh} onClick={() => { onOpenTool(t); onClose(); }} />)}
                </PaletteSection>
              )}
              <PaletteSection label="热门标签 · Popular tags">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 16px 8px' }}>
                  {['AI Agent', '代码生成', '图像生成', '视频创作', '语音克隆'].map((s) => (
                    <button key={s} onClick={() => setQ(s)} style={{ padding: '4px 10px', borderRadius: 999, border: 'none', background: T.primaryBg, color: T.accent, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{s}</button>
                  ))}
                </div>
              </PaletteSection>
            </>
          ) : (
            <>
              {matchTools.length > 0 && (
                <PaletteSection label={`AI 工具 · Tools — ${matchTools.length}`}>
                  {matchTools.map((t) => <PaletteItem key={t.id} icon={<ToolLogo tool={t} size={28} />} title={t.name} sub={t.zh} badge={CATEGORIES.find((c) => c.id === t.cat)?.zh} onClick={() => { onOpenTool(t); onClose(); }} />)}
                </PaletteSection>
              )}
              {matchRepos.length > 0 && (
                <PaletteSection label={`GitHub 仓库 · Repos — ${matchRepos.length}`}>
                  {matchRepos.map((r) => <PaletteItem key={r.repo} icon={<span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 6, background: T.ink, color: '#fff', fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 12 }}>Gh</span>} title={r.repo} sub={r.descZh || r.desc} badge={`★ ${r.stars >= 1000 ? `${(r.stars / 1000).toFixed(1)}k` : r.stars}`} />)}
                </PaletteSection>
              )}
              {matchCats.length > 0 && (
                <PaletteSection label={`分类 · Categories — ${matchCats.length}`}>
                  {matchCats.map((c) => <PaletteItem key={c.id} icon={<span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 6, background: T.primaryBg, fontSize: 14 }}>{c.icon}</span>} title={`${c.en} · ${c.zh}`} sub={`${c.count} tools`} badge="↗" />)}
                </PaletteSection>
              )}
              {matchTools.length === 0 && matchRepos.length === 0 && matchCats.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: T.inkMuted, fontSize: 13 }}>
                  没有找到 &ldquo;{q}&rdquo; 的结果<br /><span style={{ fontSize: 12 }}>No results for &ldquo;{q}&rdquo;</span>
                </div>
              )}
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', borderTop: `1px solid ${T.rule}`, background: T.bg, fontSize: 11, color: T.inkMuted }}>
          {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([key, label]) => (
            <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ padding: '1px 5px', background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 3, fontFamily: 'ui-monospace, monospace' }}>{key}</kbd> {label}
            </span>
          ))}
          <span style={{ marginLeft: 'auto' }}>跨工具 + 仓库 + 分类联合搜索</span>
        </div>
      </div>
    </div>
  );
}

/* ─── AI Pulse news card ─────────────────────────────────────────────────── */
function NewsPulseCard() {
  const { news } = useData();
  if (news.length === 0) return null;

  const fmt = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ background: T.ink, borderRadius: 16, padding: 24, marginTop: 20, color: '#fff' }}>
      <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 22, margin: '0 0 4px', letterSpacing: '-0.02em' }}>AI Pulse</h3>
      <p style={{ fontSize: 13, color: '#FFB48B', margin: '0 0 18px' }}>每日 AI 资讯 · daily news</p>
      {news.slice(0, 5).map((n, i) => (
        <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" style={{
          display: 'block', paddingBottom: 14, marginBottom: 14,
          borderBottom: i === Math.min(news.length, 5) - 2 ? 'none' : '1px solid rgba(255,255,255,0.08)',
          textDecoration: 'none',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
            {n.tag && (
              <span style={{ padding: '2px 7px', borderRadius: 3, background: T.primary, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>{n.tag}</span>
            )}
            <span style={{ fontSize: 11, color: '#A89890' }}>{fmt(n.publishedAt)}</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 3px', color: '#fff' }}>{n.titleZh || n.title}</p>
          {n.titleZh && <p style={{ fontSize: 11, lineHeight: 1.5, margin: 0, color: '#C8B5A8' }}>{n.title}</p>}
        </a>
      ))}
      <a href="/news" style={{ display: 'block', textAlign: 'center', marginTop: 8, padding: '8px', fontSize: 13, fontWeight: 600, color: T.primary, cursor: 'pointer', textDecoration: 'none' }}>查看全部资讯 →</a>
    </div>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ padding: '48px 56px 36px', background: T.bg, borderTop: `1px solid ${T.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.primary} 0%, #FBBF24 100%)`, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 16, fontStyle: 'italic' }}>A</div>
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18, color: T.ink }}>AiToolsBox</span>
        </div>
        <p style={{ fontSize: 13, color: T.inkMuted, margin: 0, maxWidth: 380, lineHeight: 1.6 }}>
          A thoughtful directory of AI tools and a live pulse of GitHub. Curated daily.<br />
          精选 AI 工具与 GitHub 趋势 · 每日更新
        </p>
      </div>
      <div style={{ fontSize: 12, color: T.inkMuted, textAlign: 'right' }}>
        © 2026 AiToolsBox · 工具集<br />Made with care
      </div>
    </footer>
  );
}

/* ─── Root export ─────────────────────────────────────────────────────────── */
export default function V2ProHomepage(props: DataCtx) {
  return (
    <DataContext.Provider value={props}>
      <V2ProInner />
    </DataContext.Provider>
  );
}

function V2ProInner() {
  const { tools: AI_TOOLS, trending: GITHUB_TRENDING, stats } = useData();
  // news is consumed by NewsPulseCard via context
  const [cat, setCat] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [period, setPeriod] = React.useState<TrendingPeriod>('today');
  const [sort, setSort] = React.useState<'popular' | 'newest'>('newest');
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [fav, setFav] = React.useState<Set<string>>(new Set(['claude', 'cursor', 'midjourney']));
  const [recent, setRecent] = React.useState<string[]>(['chatgpt', 'cursor', 'suno', 'v0']);

  const toggleFav = (id: string) => setFav((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const handleOpenTool = (t: Tool) => setRecent((r) => [t.id, ...r.filter((x) => x !== t.id)].slice(0, 6));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Filter + sort
  let tools = AI_TOOLS.filter((t) =>
    (cat === 'all' || t.cat === cat) &&
    (!query || t.name.toLowerCase().includes(query.toLowerCase()) || t.en.toLowerCase().includes(query.toLowerCase()) || t.zh.includes(query))
  );
  if (sort === 'newest') tools = [...tools].sort((a, b) => b.date.localeCompare(a.date));

  const featured = tools.filter((t) => t.featured).slice(0, 3);
  const rest = tools.filter((t) => !t.featured || featured.length < 3);
  const trending = GITHUB_TRENDING[period].slice(0, 10);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />
      <Hero query={query} setQuery={setQuery} stats={stats} onPopularTag={(tag) => { setQuery(tag); setCat('all'); }} />
      <CategoryStrip cat={cat} setCat={setCat} />

      {/* Main: V1 two-column layout */}
      <section style={{ padding: '48px 56px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48 }}>

        {/* Left: tools */}
        <div>
          {/* Editor's Picks */}
          {featured.length > 0 && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 34, margin: 0, color: T.ink, letterSpacing: '-0.02em' }}>Editor&rsquo;s Picks</h2>
                  <span style={{ fontSize: 14, color: T.inkMuted }}>· 编辑精选</span>
                </div>
                <p style={{ fontSize: 14, color: T.inkSoft, margin: 0 }}>本周值得一试的 AI 工具，由编辑团队精选。</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 52 }}>
                {featured.map((t) => <FeaturedCard key={t.id} tool={t} />)}
              </div>
            </>
          )}

          {/* Latest additions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 30, margin: 0, color: T.ink, letterSpacing: '-0.02em' }}>Latest additions</h2>
              <p style={{ fontSize: 13, color: T.inkSoft, margin: '4px 0 0' }}>最新收录 · {rest.length} tools</p>
            </div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: T.panel, borderRadius: 8, border: `1px solid ${T.rule}`, fontSize: 12 }}>
              {(['newest', 'popular'] as const).map((k) => (
                <button key={k} onClick={() => setSort(k)} style={{ padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer', background: sort === k ? T.ink : 'transparent', color: sort === k ? '#fff' : T.inkSoft, fontWeight: 500 }}>
                  {k === 'newest' ? 'Newest' : 'Popular'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {rest.map((t) => <ToolCard key={t.id} tool={t} fav={fav.has(t.id)} toggleFav={toggleFav} />)}
          </div>
          {rest.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: T.inkMuted, fontSize: 14 }}>没有找到匹配的工具</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
            <button style={{ padding: '11px 28px', borderRadius: 999, border: `1px solid ${T.rule}`, background: T.panel, color: T.ink, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Load more · 加载更多</button>
          </div>
        </div>

        {/* Right: GitHub trending rail */}
        <aside style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>
          <div style={{ background: T.panel, borderRadius: 16, padding: 24, border: `1px solid ${T.rule}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: 4 }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 22, margin: 0, color: T.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-grid', placeItems: 'center', width: 26, height: 26, borderRadius: 6, background: T.ink, color: '#fff', fontSize: 12, fontStyle: 'normal', fontWeight: 700 }}>Gh</span>
                Trending
              </h3>
            </div>
            <p style={{ fontSize: 13, color: T.inkSoft, margin: '0 0 14px' }}>GitHub 趋势项目 · live pulse</p>
            {/* Period tabs */}
            <div style={{ display: 'flex', gap: 3, padding: 3, background: T.primaryBg, borderRadius: 8, marginBottom: 4 }}>
              {([['today', '今日'], ['week', '本周'], ['month', '本月']] as const).map(([k, label]) => (
                <button key={k} onClick={() => setPeriod(k)} style={{ flex: 1, padding: '6px 8px', borderRadius: 5, border: 'none', cursor: 'pointer', background: period === k ? T.panel : 'transparent', color: period === k ? T.ink : T.inkSoft, fontWeight: 600, fontSize: 12, boxShadow: period === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>{label}</button>
              ))}
            </div>
            <div>
              {trending.map((it, i) => <GhItem key={it.repo} item={it} rank={i + 1} />)}
            </div>
            <a style={{ display: 'block', textAlign: 'center', marginTop: 14, padding: '10px', fontSize: 13, fontWeight: 600, color: T.primary, cursor: 'pointer' }}>查看全部 View all trending →</a>
          </div>

          {/* AI Pulse */}
          <NewsPulseCard />
        </aside>
      </section>

      <Footer />

      {paletteOpen && (
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onOpenTool={handleOpenTool} fav={fav} recent={recent} />
      )}
    </div>
  );
}
