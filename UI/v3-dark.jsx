// V3 — Dark Immersive Masonry
// Dark mode. GitHub trending takes the hero spotlight (live pulse).
// AI tools below in a masonry grid. Coral accent against deep ink.

const v3Tokens = {
  bg:        '#0F0B09',
  bgRaised:  '#1A1411',
  bgPanel:   '#211915',
  ink:       '#F5EDE4',
  inkSoft:   '#B8A89B',
  inkMuted:  '#7A6A5E',
  rule:      '#2E241F',
  ruleSoft:  '#241B17',
  primary:   '#FF6B35',
  primaryDk: '#E04A1A',
  yellow:    '#F5B544',
  green:     '#34D399',
  cream:     '#F5EDE4',
};

function V3Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, position: 'relative', overflow: 'hidden',
        background: v3Tokens.primary,
        display: 'grid', placeItems: 'center', color: v3Tokens.bg,
        fontWeight: 900, fontSize: 16, fontFamily: 'Fraunces, serif', fontStyle: 'italic',
      }}>A</div>
      <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', color: v3Tokens.ink }}>
        AiToolsBox<span style={{ color: v3Tokens.inkMuted, fontWeight: 400 }}> · 工具集</span>
      </div>
    </div>
  );
}

function V3Header() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 48px', background: v3Tokens.bg,
      borderBottom: `1px solid ${v3Tokens.rule}`, position: 'sticky', top: 0, zIndex: 10,
      backdropFilter: 'blur(12px)',
    }}>
      <V3Logo />
      <nav style={{ display: 'flex', gap: 28, fontSize: 13, color: v3Tokens.inkSoft, fontWeight: 500 }}>
        <a style={{ color: v3Tokens.ink, fontWeight: 600 }}>Trending</a>
        <a>Tools 工具</a>
        <a>Categories</a>
        <a>News 资讯</a>
        <a>Submit</a>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
          background: v3Tokens.bgRaised, borderRadius: 999, border: `1px solid ${v3Tokens.rule}`,
          fontSize: 13, color: v3Tokens.inkMuted, width: 240,
        }}>⌕ <span>搜索 · search</span></div>
        <button style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${v3Tokens.rule}`, background: v3Tokens.bgRaised, color: v3Tokens.ink, cursor: 'pointer', fontSize: 13 }}>☀</button>
        <button style={{ padding: '8px 16px', borderRadius: 999, border: 'none', background: v3Tokens.primary, color: v3Tokens.bg, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Submit</button>
      </div>
    </header>
  );
}

function V3HeroBanner() {
  return (
    <section style={{ padding: '56px 48px 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', right: -200, top: -200, width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${v3Tokens.primary}22 0%, transparent 60%)`,
      }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 48 }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px',
            borderRadius: 999, background: `${v3Tokens.primary}1A`, color: v3Tokens.primary,
            fontSize: 12, fontWeight: 600, marginBottom: 24, border: `1px solid ${v3Tokens.primary}33`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: v3Tokens.primary, boxShadow: `0 0 12px ${v3Tokens.primary}` }} />
            LIVE · 每 5 分钟更新一次
          </div>
          <h1 style={{
            fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700,
            fontSize: 80, lineHeight: 0.95, color: v3Tokens.ink, margin: 0, letterSpacing: '-0.04em',
          }}>
            What the world<br />
            is <em style={{ color: v3Tokens.primary }}>building</em> in AI.
          </h1>
          <p style={{ fontSize: 17, color: v3Tokens.inkSoft, margin: '20px 0 0', lineHeight: 1.55, maxWidth: 540 }}>
            实时追踪 GitHub 上最热的 AI 项目，配合精选 1,428 款 AI 工具。
            <br />A live pulse of GitHub plus a curated directory of 1,428 AI tools.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 32, paddingBottom: 12 }}>
          <V3Stat value="1,428" label="Tools" zh="工具" />
          <V3Stat value="8.6K" label="Repos tracked" zh="追踪仓库" />
          <V3Stat value="247" label="New this week" zh="本周新增" />
        </div>
      </div>
    </section>
  );
}

function V3Stat({ value, label, zh }) {
  return (
    <div>
      <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 36, color: v3Tokens.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: v3Tokens.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 11, color: v3Tokens.inkMuted, marginTop: 1 }}>{zh}</div>
    </div>
  );
}

function V3TrendingHero({ period, setPeriod }) {
  const { GITHUB_TRENDING, LANG_COLOR } = window.AITB;
  const list = GITHUB_TRENDING[period];
  const top3 = list.slice(0, 3);
  const rest = list.slice(3, 9);

  return (
    <section style={{ padding: '32px 48px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: v3Tokens.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>GitHub Trending · 开源趋势</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 44, margin: 0, color: v3Tokens.ink, letterSpacing: '-0.03em' }}>
            Top repos <em style={{ color: v3Tokens.primary }}>{period === 'today' ? 'today' : period === 'week' ? 'this week' : 'this month'}</em>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: v3Tokens.bgRaised, borderRadius: 999, border: `1px solid ${v3Tokens.rule}` }}>
          {[['today', 'Today 今日'], ['week', 'Week 本周'], ['month', 'Month 本月']].map(([k, l]) => (
            <button key={k} onClick={() => setPeriod(k)} style={{
              padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: period === k ? v3Tokens.primary : 'transparent',
              color: period === k ? v3Tokens.bg : v3Tokens.inkSoft,
              fontSize: 12, fontWeight: 600,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Top 3 hero cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        {top3.map((it, i) => {
          const [owner, name] = it.repo.split('/');
          const rank = i + 1;
          return (
            <div key={it.repo} style={{
              background: i === 0 ? `linear-gradient(150deg, ${v3Tokens.primary} 0%, ${v3Tokens.primaryDk} 100%)` : v3Tokens.bgPanel,
              borderRadius: 16, padding: 24, border: `1px solid ${i === 0 ? 'transparent' : v3Tokens.rule}`,
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              transition: 'transform .2s',
              minHeight: 220,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                position: 'absolute', top: 18, right: 18,
                fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 64,
                color: i === 0 ? `${v3Tokens.bg}33` : `${v3Tokens.primary}22`, lineHeight: 1, letterSpacing: '-0.04em',
              }}>#{rank}</div>
              <div>
                <div style={{ fontSize: 13, color: i === 0 ? `${v3Tokens.bg}cc` : v3Tokens.inkMuted, marginBottom: 6, fontFamily: 'ui-monospace, monospace' }}>{owner}/</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: i === 0 ? v3Tokens.bg : v3Tokens.ink, marginBottom: 12, letterSpacing: '-0.02em', fontFamily: 'ui-monospace, monospace' }}>{name}</div>
                <p style={{ fontSize: 13, color: i === 0 ? `${v3Tokens.bg}dd` : v3Tokens.inkSoft, lineHeight: 1.5, margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{it.desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTop: `1px solid ${i === 0 ? `${v3Tokens.bg}22` : v3Tokens.rule}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: i === 0 ? v3Tokens.bg : v3Tokens.inkSoft }}>
                  <span style={{ width: 9, height: 9, borderRadius: 5, background: LANG_COLOR[it.lang] || '#888' }} />
                  {it.lang}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: i === 0 ? v3Tokens.bg : v3Tokens.inkSoft, fontVariantNumeric: 'tabular-nums' }}>
                  <span>★ {it.stars.toLocaleString()}</span>
                  <span style={{ color: i === 0 ? v3Tokens.bg : v3Tokens.green, fontWeight: 700 }}>+{it.gained.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* The next 6 in a denser strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {rest.map((it, i) => {
          const [owner, name] = it.repo.split('/');
          return (
            <div key={it.repo} style={{
              background: v3Tokens.bgRaised, borderRadius: 10, padding: '14px 18px',
              border: `1px solid ${v3Tokens.rule}`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color .15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = v3Tokens.primary}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = v3Tokens.rule}
            >
              <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: v3Tokens.inkMuted, width: 28, textAlign: 'center' }}>#{i + 4}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', marginBottom: 3 }}>
                  <span style={{ color: v3Tokens.inkMuted }}>{owner}/</span>
                  <span style={{ color: v3Tokens.ink, fontWeight: 600 }}>{name}</span>
                </div>
                <p style={{ fontSize: 11, color: v3Tokens.inkSoft, margin: 0, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.desc}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ color: v3Tokens.green, fontWeight: 700 }}>+{it.gained.toLocaleString()}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: v3Tokens.inkMuted }}>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: window.AITB.LANG_COLOR[it.lang] || '#888' }} />
                  {it.lang}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function V3CategoryGrid({ cat, setCat }) {
  const { CATEGORIES } = window.AITB;
  return (
    <section style={{ padding: '0 48px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: v3Tokens.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Categories · 分类</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 32, margin: 0, color: v3Tokens.ink, letterSpacing: '-0.03em' }}>Browse by category</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            padding: '14px 12px', borderRadius: 10, border: `1px solid ${cat === c.id ? v3Tokens.primary : v3Tokens.rule}`,
            background: cat === c.id ? `${v3Tokens.primary}1A` : v3Tokens.bgRaised,
            color: v3Tokens.ink, cursor: 'pointer', textAlign: 'left',
            display: 'flex', flexDirection: 'column', gap: 6, transition: 'all .15s',
          }}>
            <span style={{ fontSize: 18 }}>{c.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{c.zh}</span>
            <span style={{ fontSize: 10, color: v3Tokens.inkMuted }}>{c.count} tools</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function V3ToolCard({ tool, onOpen, big }) {
  const cat = window.AITB.CATEGORIES.find((c) => c.id === tool.cat);
  return (
    <div onClick={() => onOpen(tool)} style={{
      background: v3Tokens.bgRaised, borderRadius: 14, padding: 18,
      border: `1px solid ${v3Tokens.rule}`, cursor: 'pointer',
      transition: 'all .18s', display: 'flex', flexDirection: 'column', gap: 14,
      breakInside: 'avoid', marginBottom: 12,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = v3Tokens.primary; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = v3Tokens.rule; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <window.V1ToolLogo tool={tool} size={big ? 56 : 44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: big ? 18 : 15, fontWeight: 700, color: v3Tokens.ink, marginBottom: 3, letterSpacing: '-0.01em' }}>{tool.name}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
            <span style={{ padding: '2px 7px', borderRadius: 3, background: `${v3Tokens.primary}1A`, color: v3Tokens.primary, fontWeight: 600 }}>{cat?.zh}</span>
            <span style={{ color: v3Tokens.inkMuted }}>· {tool.pricing}</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: v3Tokens.inkSoft, lineHeight: 1.5, margin: 0 }}>{tool.en}</p>
      {big && <p style={{ fontSize: 12, color: v3Tokens.inkMuted, lineHeight: 1.5, margin: 0 }}>{tool.zh}</p>}
      <div style={{ fontSize: 11, color: v3Tokens.inkMuted, marginTop: 'auto' }}>{tool.date}</div>
    </div>
  );
}

function V3Masonry({ cat, onOpen }) {
  let tools = window.AITB.AI_TOOLS.filter((t) => cat === 'all' || t.cat === cat);
  return (
    <section style={{ padding: '0 48px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: v3Tokens.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>AI Tools · 精选工具</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 32, margin: 0, color: v3Tokens.ink, letterSpacing: '-0.03em' }}>
            {cat === 'all' ? <>Latest <em style={{ color: v3Tokens.primary }}>additions</em></> : window.AITB.CATEGORIES.find((c) => c.id === cat)?.en}
          </h2>
        </div>
        <a style={{ fontSize: 13, color: v3Tokens.primary, fontWeight: 600, cursor: 'pointer' }}>View all 1,428 →</a>
      </div>
      <div style={{ columnCount: 4, columnGap: 12 }}>
        {tools.map((t, i) => <V3ToolCard key={t.id} tool={t} onOpen={onOpen} big={i % 5 === 0} />)}
      </div>
    </section>
  );
}

function V3NewsStrip() {
  const { NEWS } = window.AITB;
  return (
    <section style={{ padding: '0 48px 64px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: v3Tokens.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Pulse · AI 资讯</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 32, margin: 0, color: v3Tokens.ink, letterSpacing: '-0.03em' }}>This week in AI</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {NEWS.map((n, i) => (
          <div key={i} style={{ background: v3Tokens.bgRaised, borderRadius: 10, padding: 16, border: `1px solid ${v3Tokens.rule}`, cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ padding: '2px 7px', borderRadius: 3, background: `${v3Tokens.primary}1A`, color: v3Tokens.primary, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{n.tag}</span>
              <span style={{ fontSize: 10, color: v3Tokens.inkMuted }}>{n.date}</span>
            </div>
            <p style={{ fontSize: 13, color: v3Tokens.ink, lineHeight: 1.45, margin: '0 0 8px', fontWeight: 500 }}>{n.en}</p>
            <p style={{ fontSize: 11, color: v3Tokens.inkMuted, lineHeight: 1.45, margin: 0 }}>{n.zh}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function V3Footer() {
  return (
    <footer style={{ padding: '48px 48px 36px', borderTop: `1px solid ${v3Tokens.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <V3Logo />
        <p style={{ fontSize: 12, color: v3Tokens.inkMuted, margin: '12px 0 0', maxWidth: 380, lineHeight: 1.6 }}>
          A live pulse of GitHub plus a curated AI directory.
          <br />精选 AI 工具与 GitHub 趋势 · 每日更新
        </p>
      </div>
      <div style={{ fontSize: 12, color: v3Tokens.inkMuted, textAlign: 'right' }}>
        © 2026 AiToolsBox · 工具集
        <br />Made with care in Hangzhou
      </div>
    </footer>
  );
}

function V3Homepage({ onOpen }) {
  const [period, setPeriod] = React.useState('today');
  const [cat, setCat] = React.useState('all');
  return (
    <div style={{ minHeight: '100%', background: v3Tokens.bg, color: v3Tokens.ink, fontFamily: 'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <V3Header />
      <V3HeroBanner />
      <V3TrendingHero period={period} setPeriod={setPeriod} />
      <V3CategoryGrid cat={cat} setCat={setCat} />
      <V3Masonry cat={cat} onOpen={onOpen} />
      <V3NewsStrip />
      <V3Footer />
    </div>
  );
}

window.V3Homepage = V3Homepage;
window.v3Tokens = v3Tokens;
