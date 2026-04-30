// V1 — Editorial Warm
// Magazine layout. AI tools as the hero. GitHub trending as a sidebar rail.
// Warm coral/orange palette. Serif display + sans body.

const v1Tokens = {
  bg:        '#FFF7F0',
  bgWarm:    '#FFEFE2',
  ink:       '#1F1410',
  inkSoft:   '#5C4A40',
  inkMuted:  '#8C7A6F',
  rule:      '#E8D9CC',
  card:      '#FFFFFF',
  primary:   '#E85D2C',     // coral
  primaryDk: '#C04515',
  accent:    '#7C2D12',     // burnt
  yellow:    '#F5B544',
  ok:        '#2D7A4F',
};

function V1Logo({ size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: `linear-gradient(135deg, ${v1Tokens.primary} 0%, ${v1Tokens.yellow} 100%)`,
        display: 'grid', placeItems: 'center', color: '#fff',
        fontFamily: 'Fraunces, Georgia, serif', fontWeight: 900, fontSize: size * 0.55,
        fontStyle: 'italic',
      }}>A</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 20, color: v1Tokens.ink, letterSpacing: '-0.02em' }}>AiToolsBox</span>
        <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 400, fontStyle: 'italic', fontSize: 14, color: v1Tokens.inkMuted }}>· 工具集</span>
      </div>
    </div>
  );
}

function V1Header({ darkMode, onToggleDark }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 56px', borderBottom: `1px solid ${v1Tokens.rule}`,
      background: v1Tokens.bg, position: 'sticky', top: 0, zIndex: 10,
    }}>
      <V1Logo />
      <nav style={{ display: 'flex', gap: 28, fontSize: 14, color: v1Tokens.inkSoft, fontWeight: 500 }}>
        <a style={{ color: v1Tokens.ink, fontWeight: 600 }}>首页 Home</a>
        <a>分类 Categories</a>
        <a>GitHub 趋势</a>
        <a>AI 资讯 News</a>
        <a>提交工具 Submit</a>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          width: 36, height: 36, borderRadius: 18, border: `1px solid ${v1Tokens.rule}`,
          background: v1Tokens.card, cursor: 'pointer', display: 'grid', placeItems: 'center',
          fontSize: 14,
        }}>{darkMode ? '☀' : '☾'}</button>
        <button style={{
          padding: '9px 18px', borderRadius: 999, border: 'none',
          background: v1Tokens.ink, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>登录 Sign in</button>
      </div>
    </header>
  );
}

function V1Hero({ query, setQuery }) {
  return (
    <section style={{ padding: '64px 56px 40px', background: v1Tokens.bg, position: 'relative', overflow: 'hidden' }}>
      {/* decorative */}
      <div style={{
        position: 'absolute', right: -120, top: -80, width: 420, height: 420, borderRadius: '50%',
        background: `radial-gradient(circle, ${v1Tokens.yellow}55 0%, transparent 70%)`, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', left: -80, bottom: -120, width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${v1Tokens.primary}33 0%, transparent 70%)`, pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', maxWidth: 920 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
          borderRadius: 999, background: v1Tokens.bgWarm, color: v1Tokens.accent,
          fontSize: 13, fontWeight: 600, marginBottom: 24,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: v1Tokens.primary }} />
          1,428 tools curated · 更新于 4月29日
        </div>
        <h1 style={{
          fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontStyle: 'italic',
          fontSize: 84, lineHeight: 0.95, color: v1Tokens.ink, margin: 0, letterSpacing: '-0.04em',
        }}>
          The thoughtful<br />
          <span style={{ color: v1Tokens.primary, fontStyle: 'italic' }}>directory</span> of AI.
        </h1>
        <p style={{
          fontSize: 19, color: v1Tokens.inkSoft, lineHeight: 1.55, margin: '24px 0 36px', maxWidth: 620,
          fontFamily: 'ui-sans-serif, system-ui',
        }}>
          每天精选最值得收藏的 AI 工具，并实时追踪 GitHub 上的 AI 趋势项目。
          <br />A hand-picked AI directory and a live pulse of what's trending on GitHub.
        </p>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          background: v1Tokens.card, borderRadius: 14, padding: 6,
          boxShadow: '0 24px 60px -20px rgba(232,93,44,0.35), 0 4px 12px rgba(31,20,16,0.06)',
          border: `1px solid ${v1Tokens.rule}`, maxWidth: 640,
        }}>
          <div style={{ padding: '0 14px', color: v1Tokens.inkMuted, fontSize: 18 }}>⌕</div>
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索 AI 工具，例如 ChatGPT、Midjourney、Cursor…"
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 16,
              padding: '14px 4px', background: 'transparent', color: v1Tokens.ink,
              fontFamily: 'inherit',
            }}
          />
          <button style={{
            padding: '12px 22px', borderRadius: 10, border: 'none',
            background: v1Tokens.primary, color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}>Search</button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, fontSize: 13, color: v1Tokens.inkMuted, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>热门 Popular:</span>
          {['Claude', 'Cursor', 'Midjourney', 'Suno', 'v0', 'Perplexity'].map((t) => (
            <a key={t} style={{
              padding: '4px 10px', borderRadius: 999, background: v1Tokens.card,
              border: `1px solid ${v1Tokens.rule}`, color: v1Tokens.inkSoft, cursor: 'pointer',
            }}>{t}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

function V1CategoryStrip({ cat, setCat }) {
  const { CATEGORIES } = window.AITB;
  return (
    <section style={{
      padding: '0 56px', background: v1Tokens.bg,
      borderBottom: `1px solid ${v1Tokens.rule}`,
    }}>
      <div style={{
        display: 'flex', gap: 8, padding: '20px 0', overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        <button onClick={() => setCat('all')} style={{
          padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
          border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          background: cat === 'all' ? v1Tokens.ink : v1Tokens.card,
          color: cat === 'all' ? '#fff' : v1Tokens.inkSoft,
          borderColor: v1Tokens.rule, borderWidth: 1, borderStyle: 'solid',
        }}>全部 All · 1,428</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
            border: `1px solid ${v1Tokens.rule}`, cursor: 'pointer', whiteSpace: 'nowrap',
            background: cat === c.id ? v1Tokens.primary : v1Tokens.card,
            color: cat === c.id ? '#fff' : v1Tokens.inkSoft,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span>{c.icon}</span>
            <span>{c.zh}</span>
            <span style={{ opacity: 0.5, fontSize: 11 }}>{c.count}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function V1ToolLogo({ tool, size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.24,
      background: tool.brand, color: '#fff',
      display: 'grid', placeItems: 'center',
      fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700,
      fontSize: tool.mono.length === 1 ? size * 0.5 : size * 0.34,
      flexShrink: 0,
      letterSpacing: '-0.04em',
    }}>{tool.mono}</div>
  );
}

function V1FeaturedCard({ tool, onOpen }) {
  return (
    <div onClick={() => onOpen(tool)} style={{
      background: v1Tokens.card, borderRadius: 16, padding: 24,
      border: `1px solid ${v1Tokens.rule}`, cursor: 'pointer',
      transition: 'all .18s ease', display: 'flex', flexDirection: 'column', gap: 16,
      position: 'relative', overflow: 'hidden',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 40px -20px rgba(31,20,16,0.18)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        position: 'absolute', top: 16, right: 16,
        padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
        background: v1Tokens.bgWarm, color: v1Tokens.accent, textTransform: 'uppercase',
      }}>Editor's Pick</div>
      <V1ToolLogo tool={tool} size={64} />
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 24, margin: 0, color: v1Tokens.ink, letterSpacing: '-0.02em' }}>{tool.name}</h3>
        </div>
        <p style={{ fontSize: 14, color: v1Tokens.inkSoft, lineHeight: 1.55, margin: '0 0 14px' }}>{tool.en}</p>
        <p style={{ fontSize: 13, color: v1Tokens.inkMuted, lineHeight: 1.55, margin: 0 }}>{tool.zh}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${v1Tokens.rule}` }}>
        <span style={{
          padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 600,
          background: v1Tokens.bgWarm, color: v1Tokens.accent,
        }}>{window.AITB.CATEGORIES.find((c) => c.id === tool.cat)?.zh}</span>
        <span style={{ fontSize: 12, color: v1Tokens.inkMuted }}>{tool.date}</span>
      </div>
    </div>
  );
}

function V1ToolCard({ tool, onOpen, fav, toggleFav }) {
  return (
    <div onClick={() => onOpen(tool)} style={{
      background: v1Tokens.card, borderRadius: 12, padding: 18,
      border: `1px solid ${v1Tokens.rule}`, cursor: 'pointer',
      transition: 'all .18s ease', display: 'flex', gap: 14,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = v1Tokens.primary; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = v1Tokens.rule; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <V1ToolLogo tool={tool} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h4 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600, fontSize: 17, margin: 0, color: v1Tokens.ink }}>{tool.name}</h4>
          <button onClick={(e) => { e.stopPropagation(); toggleFav(tool.id); }} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14,
            color: fav ? v1Tokens.primary : v1Tokens.inkMuted, padding: 4,
          }}>{fav ? '★' : '☆'}</button>
        </div>
        <p style={{ fontSize: 13, color: v1Tokens.inkSoft, lineHeight: 1.5, margin: '0 0 10px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{tool.en}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span style={{
            padding: '2px 7px', borderRadius: 3, fontWeight: 600,
            background: v1Tokens.bgWarm, color: v1Tokens.accent,
          }}>{window.AITB.CATEGORIES.find((c) => c.id === tool.cat)?.zh}</span>
          <span style={{ color: v1Tokens.inkMuted }}>{tool.date}</span>
        </div>
      </div>
    </div>
  );
}

function V1GitHubItem({ item, rank }) {
  const { LANG_COLOR } = window.AITB;
  const [owner, name] = item.repo.split('/');
  return (
    <div style={{
      padding: '14px 0', borderBottom: `1px solid ${v1Tokens.rule}`,
      cursor: 'pointer', transition: 'all .18s', display: 'flex', gap: 12,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = v1Tokens.bgWarm; e.currentTarget.style.paddingLeft = '8px'; e.currentTarget.style.paddingRight = '8px'; e.currentTarget.style.marginLeft = '-8px'; e.currentTarget.style.marginRight = '-8px'; e.currentTarget.style.borderRadius = '6px'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.paddingRight = '0'; e.currentTarget.style.marginLeft = '0'; e.currentTarget.style.marginRight = '0'; e.currentTarget.style.borderRadius = '0'; }}
    >
      <div style={{
        fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 22,
        color: rank <= 3 ? v1Tokens.primary : v1Tokens.inkMuted,
        width: 26, lineHeight: 1, fontStyle: 'italic',
      }}>{String(rank).padStart(2, '0')}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 4, fontSize: 14, color: v1Tokens.inkSoft }}>
          <span style={{ color: v1Tokens.inkMuted }}>{owner}</span>
          <span style={{ color: v1Tokens.inkMuted, margin: '0 2px' }}>/</span>
          <span style={{ color: v1Tokens.ink, fontWeight: 600 }}>{name}</span>
        </div>
        <p style={{ fontSize: 12, color: v1Tokens.inkSoft, lineHeight: 1.5, margin: '0 0 8px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{item.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: v1Tokens.inkMuted }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, background: LANG_COLOR[item.lang] || '#888' }} />
            {item.lang}
          </span>
          <span>★ {item.stars.toLocaleString()}</span>
          <span style={{ color: v1Tokens.ok, fontWeight: 600 }}>+{item.gained.toLocaleString()} today</span>
        </div>
      </div>
    </div>
  );
}

function V1MainGrid({ tools, onOpen, fav, toggleFav, period, setPeriod }) {
  const { GITHUB_TRENDING } = window.AITB;
  const trending = GITHUB_TRENDING[period].slice(0, 8);
  const featured = tools.filter((t) => t.featured).slice(0, 3);
  const rest = tools.filter((t) => !t.featured);
  return (
    <section style={{ padding: '48px 56px', background: v1Tokens.bg, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48 }}>
      {/* Left: AI tools */}
      <div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 36, margin: 0, color: v1Tokens.ink, letterSpacing: '-0.02em' }}>Editor's Picks</h2>
            <span style={{ fontSize: 14, color: v1Tokens.inkMuted }}>· 编辑精选</span>
          </div>
          <p style={{ fontSize: 14, color: v1Tokens.inkSoft, margin: 0 }}>本周值得一试的 AI 工具，由编辑团队精选。</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 56 }}>
          {featured.map((t) => <V1FeaturedCard key={t.id} tool={t} onOpen={onOpen} />)}
        </div>

        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 32, margin: 0, color: v1Tokens.ink, letterSpacing: '-0.02em' }}>Latest additions</h2>
            <p style={{ fontSize: 14, color: v1Tokens.inkSoft, margin: '4px 0 0' }}>最新收录 · {rest.length} tools</p>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: v1Tokens.card, borderRadius: 8, border: `1px solid ${v1Tokens.rule}`, fontSize: 12 }}>
            {['Popular', 'Newest', 'Rating'].map((s, i) => (
              <button key={s} style={{
                padding: '6px 12px', borderRadius: 5, border: 'none', cursor: 'pointer',
                background: i === 1 ? v1Tokens.ink : 'transparent',
                color: i === 1 ? '#fff' : v1Tokens.inkSoft, fontWeight: 500,
              }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {rest.map((t) => <V1ToolCard key={t.id} tool={t} onOpen={onOpen} fav={fav.has(t.id)} toggleFav={toggleFav} />)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
          <button style={{
            padding: '12px 28px', borderRadius: 999, border: `1px solid ${v1Tokens.rule}`,
            background: v1Tokens.card, color: v1Tokens.ink, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Load more · 加载更多</button>
        </div>
      </div>

      {/* Right rail: GitHub trending */}
      <aside style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>
        <div style={{
          background: v1Tokens.card, borderRadius: 16, padding: 24,
          border: `1px solid ${v1Tokens.rule}`, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 24, margin: 0, color: v1Tokens.ink, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-grid', placeItems: 'center', width: 28, height: 28, borderRadius: 6, background: v1Tokens.ink, color: '#fff', fontSize: 14, fontStyle: 'normal', fontWeight: 600 }}>Gh</span>
              Trending
            </h3>
          </div>
          <p style={{ fontSize: 13, color: v1Tokens.inkSoft, margin: '0 0 16px' }}>GitHub 趋势项目 · live pulse</p>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: v1Tokens.bgWarm, borderRadius: 8, fontSize: 12, marginBottom: 8 }}>
            {[['today', '今日'], ['week', '本周'], ['month', '本月']].map(([k, label]) => (
              <button key={k} onClick={() => setPeriod(k)} style={{
                flex: 1, padding: '6px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
                background: period === k ? v1Tokens.card : 'transparent',
                color: period === k ? v1Tokens.ink : v1Tokens.inkSoft, fontWeight: 600,
                boxShadow: period === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}>{label}</button>
            ))}
          </div>
          <div>
            {trending.map((it, i) => <V1GitHubItem key={it.repo} item={it} rank={i + 1} />)}
          </div>
          <a style={{
            display: 'block', textAlign: 'center', marginTop: 16, padding: '10px',
            fontSize: 13, fontWeight: 600, color: v1Tokens.primary, cursor: 'pointer',
          }}>查看全部 View all trending →</a>
        </div>

        <V1NewsCard />
      </aside>
    </section>
  );
}

function V1NewsCard() {
  const { NEWS } = window.AITB;
  return (
    <div style={{
      background: v1Tokens.ink, borderRadius: 16, padding: 24,
      color: '#fff',
    }}>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 22, margin: '0 0 4px', letterSpacing: '-0.02em' }}>AI Pulse</h3>
      <p style={{ fontSize: 13, color: '#FFB48B', margin: '0 0 18px' }}>每日 AI 资讯 · daily news</p>
      {NEWS.slice(0, 4).map((n, i) => (
        <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i === 3 ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ padding: '2px 7px', borderRadius: 3, background: v1Tokens.primary, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{n.tag}</span>
            <span style={{ fontSize: 11, color: '#A89890' }}>{n.date}</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 4px', color: '#fff' }}>{n.en}</p>
          <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: '#C8B5A8' }}>{n.zh}</p>
        </div>
      ))}
    </div>
  );
}

function V1Footer() {
  return (
    <footer style={{
      padding: '48px 56px 36px', background: v1Tokens.bg,
      borderTop: `1px solid ${v1Tokens.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    }}>
      <div>
        <V1Logo size={32} />
        <p style={{ fontSize: 13, color: v1Tokens.inkMuted, margin: '14px 0 0', maxWidth: 380, lineHeight: 1.6 }}>
          A thoughtful directory of AI tools and a live pulse of GitHub. Curated daily.
          <br />精选 AI 工具与 GitHub 趋势 · 每日更新
        </p>
      </div>
      <div style={{ fontSize: 12, color: v1Tokens.inkMuted, textAlign: 'right' }}>
        © 2026 AiToolsBox · 工具集
        <br />Made with care in Hangzhou
      </div>
    </footer>
  );
}

function V1Homepage({ onOpen }) {
  const [query, setQuery] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [period, setPeriod] = React.useState('today');
  const [fav, setFav] = React.useState(new Set(['claude', 'cursor']));
  const toggleFav = (id) => setFav((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const tools = window.AITB.AI_TOOLS.filter((t) =>
    (cat === 'all' || t.cat === cat) &&
    (!query || t.name.toLowerCase().includes(query.toLowerCase()) || t.en.toLowerCase().includes(query.toLowerCase()) || t.zh.includes(query))
  );

  return (
    <div style={{ minHeight: '100%', background: v1Tokens.bg, color: v1Tokens.ink, fontFamily: 'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <V1Header />
      <V1Hero query={query} setQuery={setQuery} />
      <V1CategoryStrip cat={cat} setCat={setCat} />
      <V1MainGrid tools={tools} onOpen={onOpen} fav={fav} toggleFav={toggleFav} period={period} setPeriod={setPeriod} />
      <V1Footer />
    </div>
  );
}

window.V1Homepage = V1Homepage;
window.v1Tokens = v1Tokens;
window.V1ToolLogo = V1ToolLogo;
