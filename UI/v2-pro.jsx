// V2 Pro — Split Dashboard, upgraded
// Adds: command palette (⌘K), favorites + recent in sidebar.
// Reuses v2Tokens + most components; swaps top bar search and sidebar.

function V2ProTopBar({ onOpenPalette }) {
  const T = window.v2Tokens;
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 32px', borderBottom: `1px solid ${T.rule}`,
      background: T.panel, position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7, background: T.ink, color: '#fff',
            display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, transparent 50%, ${T.primary} 50%)` }} />
            <span style={{ position: 'relative' }}>A</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', color: T.ink }}>
            AiToolsBox<span style={{ color: T.inkMuted, fontWeight: 400 }}>/工具集</span>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 4, fontSize: 13 }}>
          {[['Dashboard', '仪表盘', true], ['Tools', '工具', false], ['Trending', '趋势', false], ['News', '资讯', false], ['Submit', '提交', false]].map(([en, zh, active]) => (
            <a key={en} style={{
              padding: '6px 12px', borderRadius: 6,
              background: active ? T.panel2 : 'transparent',
              color: active ? T.ink : T.inkSoft,
              fontWeight: active ? 600 : 500, cursor: 'pointer',
            }}>{en} <span style={{ color: T.inkMuted, fontSize: 11 }}>{zh}</span></a>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onOpenPalette} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          background: T.bg, borderRadius: 8, border: `1px solid ${T.rule}`,
          width: 360, fontSize: 13, color: T.inkMuted, cursor: 'pointer',
          textAlign: 'left', fontFamily: 'inherit',
        }}>
          <span style={{ fontSize: 14 }}>⌕</span>
          <span>搜索 AI 工具、GitHub 仓库、分类…</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 3 }}>
            <kbd style={{ padding: '2px 6px', background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 4, fontSize: 10, color: T.inkSoft, fontFamily: 'ui-monospace, monospace' }}>⌘</kbd>
            <kbd style={{ padding: '2px 6px', background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 4, fontSize: 10, color: T.inkSoft, fontFamily: 'ui-monospace, monospace' }}>K</kbd>
          </span>
        </button>
        <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.rule}`, background: T.panel, cursor: 'pointer', fontSize: 13 }}>☾</button>
        <button style={{
          padding: '7px 14px', borderRadius: 8, border: 'none',
          background: T.primary, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>+ Submit tool</button>
      </div>
    </header>
  );
}

function V2ProSidebar({ cat, setCat, fav, recent, onOpenTool }) {
  const { CATEGORIES, AI_TOOLS } = window.AITB;
  const T = window.v2Tokens;
  const favTools = AI_TOOLS.filter((t) => fav.has(t.id));
  const recentTools = recent.map((id) => AI_TOOLS.find((t) => t.id === id)).filter(Boolean);

  const SectionLabel = ({ children }) => (
    <div style={{ padding: '14px 20px 6px', fontSize: 11, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{children}</div>
  );

  const MiniRow = ({ tool, onClick }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, width: '100%',
      padding: '6px 10px', border: 'none', background: 'transparent', cursor: 'pointer',
      borderRadius: 6, color: T.inkSoft, fontSize: 12, marginBottom: 1,
      transition: 'background .12s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = T.panel2}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <window.V1ToolLogo tool={tool} size={20} />
      <span style={{ flex: 1, textAlign: 'left', fontWeight: 500, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</span>
    </button>
  );

  return (
    <aside style={{
      width: 240, borderRight: `1px solid ${T.rule}`, background: T.panel,
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      {/* Favorites */}
      <SectionLabel>★ 收藏 Favorites · {favTools.length}</SectionLabel>
      <div style={{ padding: '0 12px 8px' }}>
        {favTools.length === 0 ? (
          <div style={{ padding: '6px 10px', fontSize: 11, color: T.inkMuted, fontStyle: 'italic' }}>点击工具卡的 ★ 收藏</div>
        ) : favTools.slice(0, 5).map((t) => (
          <MiniRow key={t.id} tool={t} onClick={() => onOpenTool(t)} />
        ))}
      </div>

      {/* Recent */}
      <SectionLabel>↻ 最近浏览 Recent</SectionLabel>
      <div style={{ padding: '0 12px 8px' }}>
        {recentTools.length === 0 ? (
          <div style={{ padding: '6px 10px', fontSize: 11, color: T.inkMuted, fontStyle: 'italic' }}>暂无浏览记录</div>
        ) : recentTools.slice(0, 4).map((t) => (
          <MiniRow key={t.id} tool={t} onClick={() => onOpenTool(t)} />
        ))}
      </div>

      {/* Categories */}
      <SectionLabel>分类 Categories</SectionLabel>
      <div style={{ padding: '0 12px 16px' }}>
        <button onClick={() => setCat('all')} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
          background: cat === 'all' ? T.primaryBg : 'transparent',
          color: cat === 'all' ? T.accent : T.inkSoft,
          fontSize: 13, fontWeight: cat === 'all' ? 600 : 500, marginBottom: 1,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 14 }}>◎</span>All / 全部</span>
          <span style={{ fontSize: 11, color: T.inkMuted, fontVariantNumeric: 'tabular-nums' }}>1,428</span>
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: cat === c.id ? T.primaryBg : 'transparent',
            color: cat === c.id ? T.accent : T.inkSoft,
            fontSize: 13, fontWeight: cat === c.id ? 600 : 500, marginBottom: 1,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 14 }}>{c.icon}</span>{c.zh}</span>
            <span style={{ fontSize: 11, color: T.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{c.count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function CommandPalette({ open, onClose, onOpenTool }) {
  const T = window.v2Tokens;
  const { AI_TOOLS, GITHUB_TRENDING, CATEGORIES } = window.AITB;
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    setQ('');
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const ql = q.toLowerCase().trim();
  const matchTools = AI_TOOLS.filter((t) =>
    !ql || t.name.toLowerCase().includes(ql) || t.en.toLowerCase().includes(ql) || t.zh.includes(q)
  ).slice(0, 5);
  const matchRepos = GITHUB_TRENDING.today.filter((r) =>
    !ql || r.repo.toLowerCase().includes(ql) || r.desc.toLowerCase().includes(ql)
  ).slice(0, 4);
  const matchCats = CATEGORIES.filter((c) =>
    !ql || c.en.toLowerCase().includes(ql) || c.zh.includes(q)
  ).slice(0, 4);

  const recentSearches = ['ChatGPT', 'Cursor', 'Midjourney', 'Suno'];
  const popularTags = ['AI Agent', '代码生成', '图像生成', '视频创作', '语音克隆'];

  const Section = ({ label, children }) => (
    <div style={{ padding: '8px 0' }}>
      <div style={{ padding: '4px 16px', fontSize: 10, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</div>
      {children}
    </div>
  );

  const Item = ({ icon, title, sub, badge, onClick }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      padding: '8px 16px', border: 'none', background: 'transparent',
      cursor: 'pointer', textAlign: 'left',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = T.panel2}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: T.ink, fontWeight: 500, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: T.inkMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
      {badge && <span style={{ fontSize: 10, color: T.inkMuted, padding: '2px 6px', border: `1px solid ${T.rule}`, borderRadius: 4, fontWeight: 500 }}>{badge}</span>}
    </button>
  );

  const empty = !ql && matchTools.length === 0;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,11,9,0.45)',
      backdropFilter: 'blur(6px)', zIndex: 200,
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      paddingTop: '12vh',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.panel, width: '100%', maxWidth: 640, borderRadius: 14,
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)', overflow: 'hidden',
        border: `1px solid ${T.rule}`,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}>
        {/* search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${T.rule}` }}>
          <span style={{ fontSize: 18, color: T.inkMuted }}>⌕</span>
          <input
            ref={inputRef}
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="搜索 AI 工具、GitHub 仓库、分类…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: T.ink, fontFamily: 'inherit' }}
          />
          <kbd style={{ padding: '3px 8px', background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 4, fontSize: 11, color: T.inkMuted, fontFamily: 'ui-monospace, monospace' }}>esc</kbd>
        </div>

        {/* results */}
        <div style={{ maxHeight: 460, overflowY: 'auto' }}>
          {empty ? (
            <>
              <Section label="最近搜索 · Recent searches">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 16px 8px' }}>
                  {recentSearches.map((s) => (
                    <button key={s} onClick={() => setQ(s)} style={{
                      padding: '4px 10px', borderRadius: 999, border: `1px solid ${T.rule}`,
                      background: T.bg, color: T.inkSoft, fontSize: 12, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}><span style={{ color: T.inkMuted }}>↻</span>{s}</button>
                  ))}
                </div>
              </Section>
              <Section label="热门标签 · Popular tags">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 16px 8px' }}>
                  {popularTags.map((s) => (
                    <button key={s} onClick={() => setQ(s)} style={{
                      padding: '4px 10px', borderRadius: 999, border: 'none',
                      background: T.primaryBg, color: T.accent, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    }}>{s}</button>
                  ))}
                </div>
              </Section>
              <Section label="快速操作 · Quick actions">
                <Item icon={<span style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: 5, background: T.primaryBg, color: T.accent, fontSize: 13 }}>＋</span>} title="Submit a new tool" sub="提交一个新工具" badge="⌘ N" />
                <Item icon={<span style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: 5, background: T.panel2, fontSize: 13 }}>★</span>} title="View favorites" sub="查看我的收藏" badge="⌘ B" />
                <Item icon={<span style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: 5, background: T.panel2, fontSize: 13 }}>☾</span>} title="Toggle dark mode" sub="切换深色模式" badge="⌘ D" />
              </Section>
            </>
          ) : (
            <>
              {matchTools.length > 0 && (
                <Section label={`AI 工具 · Tools — ${matchTools.length}`}>
                  {matchTools.map((t) => (
                    <Item key={t.id}
                      icon={<window.V1ToolLogo tool={t} size={28} />}
                      title={t.name}
                      sub={t.zh}
                      badge={CATEGORIES.find((c) => c.id === t.cat)?.zh}
                      onClick={() => { onOpenTool(t); onClose(); }}
                    />
                  ))}
                </Section>
              )}
              {matchRepos.length > 0 && (
                <Section label={`GitHub 仓库 · Repos — ${matchRepos.length}`}>
                  {matchRepos.map((r) => (
                    <Item key={r.repo}
                      icon={<span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 5, background: T.ink, color: '#fff', fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 12 }}>Gh</span>}
                      title={r.repo}
                      sub={r.desc}
                      badge={`★ ${(r.stars / 1000).toFixed(1)}k`}
                    />
                  ))}
                </Section>
              )}
              {matchCats.length > 0 && (
                <Section label={`分类 · Categories — ${matchCats.length}`}>
                  {matchCats.map((c) => (
                    <Item key={c.id}
                      icon={<span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 5, background: T.primaryBg, fontSize: 14 }}>{c.icon}</span>}
                      title={`${c.en} · ${c.zh}`}
                      sub={`${c.count} tools`}
                      badge="↗"
                    />
                  ))}
                </Section>
              )}
              {matchTools.length === 0 && matchRepos.length === 0 && matchCats.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: T.inkMuted, fontSize: 13 }}>
                  没有找到 "{q}" 的结果<br /><span style={{ fontSize: 12 }}>No results for "{q}"</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', borderTop: `1px solid ${T.rule}`, background: T.bg, fontSize: 11, color: T.inkMuted }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <kbd style={{ padding: '1px 5px', background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 3, fontFamily: 'ui-monospace, monospace' }}>↑↓</kbd> navigate
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <kbd style={{ padding: '1px 5px', background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 3, fontFamily: 'ui-monospace, monospace' }}>↵</kbd> open
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <kbd style={{ padding: '1px 5px', background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 3, fontFamily: 'ui-monospace, monospace' }}>esc</kbd> close
          </span>
          <span style={{ marginLeft: 'auto' }}>跨工具 + 仓库 + 分类联合搜索</span>
        </div>
      </div>
    </div>
  );
}

// --- Reuse stats bar, tool row, gh row from V2; main page assembly ---
function V2ProStatsBar() {
  const T = window.v2Tokens;
  const stats = [
    { label: 'Tools curated', zh: '收录工具', value: '1,428', delta: '+12 today' },
    { label: 'Categories', zh: '分类', value: '14', delta: '14 active' },
    { label: 'Repos tracked', zh: '追踪仓库', value: '8,629', delta: '+247 / week' },
    { label: 'Last updated', zh: '更新时间', value: '2 min ago', delta: 'live' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: T.rule, borderBottom: `1px solid ${T.rule}` }}>
      {stats.map((s) => (
        <div key={s.label} style={{ padding: '16px 24px', background: T.panel, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label} · {s.zh}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>{s.value}</span>
            <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>{s.delta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function V2ProToolRow({ tool, onOpen, fav, toggleFav }) {
  const T = window.v2Tokens;
  return (
    <div onClick={() => onOpen(tool)} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
      borderBottom: `1px solid ${T.ruleSoft}`, cursor: 'pointer', transition: 'background .12s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = T.panel2}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <window.V1ToolLogo tool={tool} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: T.ink }}>{tool.name}</span>
          <span style={{ padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600, background: T.primaryBg, color: T.accent }}>{window.AITB.CATEGORIES.find((c) => c.id === tool.cat)?.zh}</span>
          <span style={{ fontSize: 10, color: T.inkMuted, padding: '1px 5px', border: `1px solid ${T.rule}`, borderRadius: 3, fontWeight: 500 }}>{tool.pricing}</span>
        </div>
        <p style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.45, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.zh}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); toggleFav(tool.id); }} style={{
        border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, padding: 4,
        color: fav ? T.primary : T.inkMuted,
      }}>{fav ? '★' : '☆'}</button>
      <span style={{ fontSize: 11, color: T.inkMuted, fontVariantNumeric: 'tabular-nums', minWidth: 64, textAlign: 'right' }}>{tool.date}</span>
    </div>
  );
}

function V2ProGhRow({ item, rank, highlight }) {
  const T = window.v2Tokens;
  const { LANG_COLOR } = window.AITB;
  const [owner, name] = item.repo.split('/');
  const max = 1300;
  const barW = Math.min(100, (item.gained / max) * 100);
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, alignItems: 'center',
      padding: '12px 24px',
      background: highlight ? `linear-gradient(90deg, ${T.primaryBg}88 0%, transparent 60%)` : 'transparent',
      borderBottom: `1px solid ${T.ruleSoft}`, cursor: 'pointer', transition: 'background .12s',
    }}
    onMouseEnter={(e) => { if (!highlight) e.currentTarget.style.background = T.panel2; }}
    onMouseLeave={(e) => { if (!highlight) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{
        fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 700, fontSize: rank <= 3 ? 22 : 14,
        color: rank <= 3 ? T.primary : T.inkMuted, textAlign: 'center', lineHeight: 1,
      }}>#{rank}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, marginBottom: 4, fontFamily: 'ui-monospace, monospace' }}>
          <span style={{ color: T.inkMuted }}>{owner}/</span>
          <span style={{ color: T.ink, fontWeight: 600 }}>{name}</span>
          {rank === 1 && <span style={{ marginLeft: 8, padding: '1px 6px', borderRadius: 3, background: T.primary, color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', verticalAlign: 'middle' }}>#1 today</span>}
        </div>
        <p style={{ fontSize: 12, color: T.inkSoft, lineHeight: 1.45, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: T.inkMuted }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: LANG_COLOR[item.lang] || '#888' }} />
            {item.lang}
          </span>
          <span>★ {item.stars.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', minWidth: 90 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.green, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>+{item.gained.toLocaleString()}</div>
        <div style={{ width: 80, height: 4, background: T.ruleSoft, borderRadius: 2, marginLeft: 'auto', overflow: 'hidden' }}>
          <div style={{ width: `${barW}%`, height: '100%', background: T.green, borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

function V2ProHomepage({ onOpen }) {
  const T = window.v2Tokens;
  const [cat, setCat] = React.useState('all');
  const [period, setPeriod] = React.useState('today');
  const [lang, setLang] = React.useState('all');
  const [sort, setSort] = React.useState('newest');
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [fav, setFav] = React.useState(new Set(['claude', 'cursor', 'midjourney']));
  const [recent, setRecent] = React.useState(['chatgpt', 'cursor', 'suno', 'v0']);

  const toggleFav = (id) => setFav((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleOpenTool = (t) => {
    setRecent((r) => [t.id, ...r.filter((x) => x !== t.id)].slice(0, 6));
    onOpen(t);
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { GITHUB_TRENDING } = window.AITB;
  let tools = window.AITB.AI_TOOLS.filter((t) => cat === 'all' || t.cat === cat);
  if (sort === 'newest') tools = [...tools].sort((a, b) => b.date.localeCompare(a.date));

  let trending = GITHUB_TRENDING[period];
  if (lang !== 'all') trending = trending.filter((t) => t.lang === lang);
  trending = trending.slice(0, 10);

  const langs = ['all', 'Python', 'TypeScript', 'Rust', 'C++'];

  return (
    <div style={{ minHeight: '100%', background: T.bg, color: T.ink, fontFamily: 'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', display: 'flex', flexDirection: 'column' }}>
      <V2ProTopBar onOpenPalette={() => setPaletteOpen(true)} />
      <V2ProStatsBar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <V2ProSidebar cat={cat} setCat={setCat} fav={fav} recent={recent} onOpenTool={handleOpenTool} />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* AI Tools */}
          <section style={{ background: T.panel, borderRadius: 12, border: `1px solid ${T.rule}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 24px 12px', borderBottom: `1px solid ${T.ruleSoft}` }}>
              <div>
                <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>AI Tools</div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: T.ink }}>Curated directory <span style={{ color: T.inkMuted, fontWeight: 400, fontSize: 16 }}>精选工具</span></h2>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 3, background: T.bg, borderRadius: 6, border: `1px solid ${T.rule}`, fontSize: 12 }}>
                {[['popular', '热门'], ['newest', '最新'], ['rating', '评分']].map(([k, l]) => (
                  <button key={k} onClick={() => setSort(k)} style={{
                    padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                    background: sort === k ? T.panel : 'transparent',
                    color: sort === k ? T.ink : T.inkSoft, fontWeight: 500,
                    boxShadow: sort === k ? '0 1px 1px rgba(0,0,0,0.04)' : 'none',
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {tools.map((t) => <V2ProToolRow key={t.id} tool={t} onOpen={handleOpenTool} fav={fav.has(t.id)} toggleFav={toggleFav} />)}
            </div>
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${T.ruleSoft}`, fontSize: 12, color: T.inkMuted, display: 'flex', justifyContent: 'space-between' }}>
              <span>显示 {tools.length} / 1,428</span>
              <a style={{ color: T.primary, fontWeight: 600, cursor: 'pointer' }}>Browse all →</a>
            </div>
          </section>

          {/* GitHub */}
          <section style={{ background: T.panel, borderRadius: 12, border: `1px solid ${T.rule}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 24px 12px', borderBottom: `1px solid ${T.ruleSoft}` }}>
              <div>
                <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>GitHub Trending</div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: T.ink }}>What's hot <span style={{ color: T.inkMuted, fontWeight: 400, fontSize: 16 }}>开源趋势</span></h2>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 3, background: T.bg, borderRadius: 6, border: `1px solid ${T.rule}`, fontSize: 12 }}>
                {[['today', '今日'], ['week', '本周'], ['month', '本月']].map(([k, l]) => (
                  <button key={k} onClick={() => setPeriod(k)} style={{
                    padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                    background: period === k ? T.panel : 'transparent',
                    color: period === k ? T.ink : T.inkSoft, fontWeight: 500,
                    boxShadow: period === k ? '0 1px 1px rgba(0,0,0,0.04)' : 'none',
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '12px 24px', borderBottom: `1px solid ${T.ruleSoft}`, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: T.inkMuted, fontWeight: 600, marginRight: 4 }}>语言:</span>
              {langs.map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '3px 9px', borderRadius: 999, border: `1px solid ${lang === l ? T.ink : T.rule}`,
                  background: lang === l ? T.ink : 'transparent', color: lang === l ? '#fff' : T.inkSoft,
                  fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  {l !== 'all' && <span style={{ width: 7, height: 7, borderRadius: 4, background: window.AITB.LANG_COLOR[l] }} />}
                  {l === 'all' ? 'All' : l}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {trending.map((it, i) => <V2ProGhRow key={it.repo + i} item={it} rank={i + 1} highlight={i === 0} />)}
            </div>
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${T.ruleSoft}`, fontSize: 12, color: T.inkMuted, display: 'flex', justifyContent: 'space-between' }}>
              <span>{trending.length} repos · {period}</span>
              <a style={{ color: T.primary, fontWeight: 600, cursor: 'pointer' }}>View all trending →</a>
            </div>
          </section>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onOpenTool={handleOpenTool} />
    </div>
  );
}

window.V2ProHomepage = V2ProHomepage;
