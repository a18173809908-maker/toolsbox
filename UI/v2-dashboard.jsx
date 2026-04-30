// V2 — Split Dashboard
// Equal-weight two-column dashboard: AI tools (left) + GitHub trending (right).
// Light, dense, info-rich. Still warm coral accents but more neutral overall.

const v2Tokens = {
  bg:        '#FAFAF7',
  panel:     '#FFFFFF',
  panel2:    '#F5F2EC',
  ink:       '#171210',
  inkSoft:   '#5A4F49',
  inkMuted:  '#8E8278',
  rule:      '#EAE3D9',
  ruleSoft:  '#F0EAE0',
  primary:   '#E85D2C',
  primaryBg: '#FCE9DD',
  accent:    '#9A3412',
  green:     '#15803D',
  greenBg:   '#DCFCE7',
};

function V2Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: v2Tokens.ink, color: '#fff',
        display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, transparent 50%, ${v2Tokens.primary} 50%)` }} />
        <span style={{ position: 'relative', fontFamily: 'ui-sans-serif, system-ui' }}>A</span>
      </div>
      <div style={{ fontFamily: 'ui-sans-serif, system-ui', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', color: v2Tokens.ink }}>
        AiToolsBox<span style={{ color: v2Tokens.inkMuted, fontWeight: 400 }}>/工具集</span>
      </div>
    </div>
  );
}

function V2TopBar() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 32px', borderBottom: `1px solid ${v2Tokens.rule}`,
      background: v2Tokens.panel, position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <V2Logo />
        <nav style={{ display: 'flex', gap: 4, fontSize: 13 }}>
          {[['Dashboard', '仪表盘', true], ['Tools', '工具', false], ['Trending', '趋势', false], ['News', '资讯', false], ['Submit', '提交', false]].map(([en, zh, active]) => (
            <a key={en} style={{
              padding: '6px 12px', borderRadius: 6,
              background: active ? v2Tokens.panel2 : 'transparent',
              color: active ? v2Tokens.ink : v2Tokens.inkSoft,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
            }}>{en} <span style={{ color: v2Tokens.inkMuted, fontSize: 11 }}>{zh}</span></a>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
          background: v2Tokens.bg, borderRadius: 8, border: `1px solid ${v2Tokens.rule}`,
          width: 280, fontSize: 13, color: v2Tokens.inkMuted,
        }}>
          <span>⌕</span>
          <span>搜索 AI 工具或 GitHub 仓库…</span>
          <span style={{ marginLeft: 'auto', padding: '2px 6px', background: v2Tokens.panel, border: `1px solid ${v2Tokens.rule}`, borderRadius: 4, fontSize: 10, color: v2Tokens.inkSoft }}>⌘ K</span>
        </div>
        <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${v2Tokens.rule}`, background: v2Tokens.panel, cursor: 'pointer', fontSize: 13 }}>☾</button>
        <button style={{
          padding: '7px 14px', borderRadius: 8, border: 'none',
          background: v2Tokens.primary, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>+ Submit tool</button>
      </div>
    </header>
  );
}

function V2StatsBar() {
  const stats = [
    { label: 'Tools curated', zh: '收录工具', value: '1,428', delta: '+12 today' },
    { label: 'Categories', zh: '分类', value: '14', delta: '14 active' },
    { label: 'Repos tracked', zh: '追踪仓库', value: '8,629', delta: '+247 / week' },
    { label: 'Last updated', zh: '更新时间', value: '2 min ago', delta: 'live' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: v2Tokens.rule, borderBottom: `1px solid ${v2Tokens.rule}` }}>
      {stats.map((s) => (
        <div key={s.label} style={{ padding: '16px 24px', background: v2Tokens.panel, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, color: v2Tokens.inkMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            {s.label} · {s.zh}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: v2Tokens.ink, letterSpacing: '-0.02em' }}>{s.value}</span>
            <span style={{ fontSize: 11, color: v2Tokens.green, fontWeight: 600 }}>{s.delta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function V2PanelHeader({ kicker, title, zhTitle, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 24px 12px', borderBottom: `1px solid ${v2Tokens.ruleSoft}` }}>
      <div>
        <div style={{ fontSize: 11, color: v2Tokens.primary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{kicker}</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: v2Tokens.ink }}>
          {title} <span style={{ color: v2Tokens.inkMuted, fontWeight: 400, fontSize: 16 }}>{zhTitle}</span>
        </h2>
      </div>
      {right}
    </div>
  );
}

function V2ToolRow({ tool, onOpen }) {
  return (
    <div onClick={() => onOpen(tool)} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
      borderBottom: `1px solid ${v2Tokens.ruleSoft}`, cursor: 'pointer', transition: 'background .12s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = v2Tokens.panel2}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <window.V1ToolLogo tool={tool} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: v2Tokens.ink }}>{tool.name}</span>
          <span style={{
            padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600,
            background: v2Tokens.primaryBg, color: v2Tokens.accent,
          }}>{window.AITB.CATEGORIES.find((c) => c.id === tool.cat)?.zh}</span>
          <span style={{ fontSize: 10, color: v2Tokens.inkMuted, padding: '1px 5px', border: `1px solid ${v2Tokens.rule}`, borderRadius: 3, fontWeight: 500 }}>{tool.pricing}</span>
        </div>
        <p style={{ fontSize: 12, color: v2Tokens.inkSoft, lineHeight: 1.45, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tool.zh}
        </p>
      </div>
      <span style={{ fontSize: 11, color: v2Tokens.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{tool.date}</span>
    </div>
  );
}

function V2GhRow({ item, rank }) {
  const { LANG_COLOR } = window.AITB;
  const [owner, name] = item.repo.split('/');
  const max = 1300; // for bar
  const barW = Math.min(100, (item.gained / max) * 100);
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 12, alignItems: 'center',
      padding: '12px 24px', borderBottom: `1px solid ${v2Tokens.ruleSoft}`, cursor: 'pointer',
      transition: 'background .12s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = v2Tokens.panel2}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 600,
        color: rank <= 3 ? v2Tokens.primary : v2Tokens.inkMuted, textAlign: 'right',
      }}>#{rank}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, marginBottom: 4, fontFamily: 'ui-monospace, monospace' }}>
          <span style={{ color: v2Tokens.inkMuted }}>{owner}/</span>
          <span style={{ color: v2Tokens.ink, fontWeight: 600 }}>{name}</span>
        </div>
        <p style={{ fontSize: 12, color: v2Tokens.inkSoft, lineHeight: 1.45, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: v2Tokens.inkMuted }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: LANG_COLOR[item.lang] || '#888' }} />
            {item.lang}
          </span>
          <span>★ {item.stars.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', minWidth: 90 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: v2Tokens.green, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>+{item.gained.toLocaleString()}</div>
        <div style={{ width: 80, height: 4, background: v2Tokens.ruleSoft, borderRadius: 2, marginLeft: 'auto', overflow: 'hidden' }}>
          <div style={{ width: `${barW}%`, height: '100%', background: v2Tokens.green, borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

function V2Sidebar({ cat, setCat }) {
  const { CATEGORIES } = window.AITB;
  return (
    <aside style={{
      width: 220, borderRight: `1px solid ${v2Tokens.rule}`, background: v2Tokens.panel,
      padding: '20px 0', overflowY: 'auto',
    }}>
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ fontSize: 11, color: v2Tokens.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 10 }}>分类 Categories</div>
      </div>
      <div style={{ padding: '0 12px' }}>
        <button onClick={() => setCat('all')} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
          background: cat === 'all' ? v2Tokens.primaryBg : 'transparent',
          color: cat === 'all' ? v2Tokens.accent : v2Tokens.inkSoft,
          fontSize: 13, fontWeight: cat === 'all' ? 600 : 500, marginBottom: 1,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>◎</span> All / 全部
          </span>
          <span style={{ fontSize: 11, color: v2Tokens.inkMuted, fontVariantNumeric: 'tabular-nums' }}>1,428</span>
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: cat === c.id ? v2Tokens.primaryBg : 'transparent',
            color: cat === c.id ? v2Tokens.accent : v2Tokens.inkSoft,
            fontSize: 13, fontWeight: cat === c.id ? 600 : 500, marginBottom: 1,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{c.icon}</span> {c.zh}
            </span>
            <span style={{ fontSize: 11, color: v2Tokens.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{c.count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function V2Homepage({ onOpen }) {
  const [cat, setCat] = React.useState('all');
  const [period, setPeriod] = React.useState('today');
  const [lang, setLang] = React.useState('all');
  const [sort, setSort] = React.useState('newest');

  const { GITHUB_TRENDING } = window.AITB;
  let tools = window.AITB.AI_TOOLS.filter((t) => cat === 'all' || t.cat === cat);
  if (sort === 'newest') tools = [...tools].sort((a, b) => b.date.localeCompare(a.date));

  let trending = GITHUB_TRENDING[period];
  if (lang !== 'all') trending = trending.filter((t) => t.lang === lang);
  trending = trending.slice(0, 10);

  const langs = ['all', 'Python', 'TypeScript', 'Rust', 'C++'];

  return (
    <div style={{ minHeight: '100%', background: v2Tokens.bg, color: v2Tokens.ink, fontFamily: 'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif', display: 'flex', flexDirection: 'column' }}>
      <V2TopBar />
      <V2StatsBar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <V2Sidebar cat={cat} setCat={setCat} />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* AI Tools panel */}
          <section style={{ background: v2Tokens.panel, borderRadius: 12, border: `1px solid ${v2Tokens.rule}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <V2PanelHeader
              kicker="AI Tools" title="Curated directory" zhTitle="精选工具"
              right={
                <div style={{ display: 'flex', gap: 4, padding: 3, background: v2Tokens.bg, borderRadius: 6, border: `1px solid ${v2Tokens.rule}`, fontSize: 12 }}>
                  {[['popular', '热门'], ['newest', '最新'], ['rating', '评分']].map(([k, l]) => (
                    <button key={k} onClick={() => setSort(k)} style={{
                      padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: sort === k ? v2Tokens.panel : 'transparent',
                      color: sort === k ? v2Tokens.ink : v2Tokens.inkSoft, fontWeight: 500,
                      boxShadow: sort === k ? '0 1px 1px rgba(0,0,0,0.04)' : 'none',
                    }}>{l}</button>
                  ))}
                </div>
              }
            />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {tools.map((t) => <V2ToolRow key={t.id} tool={t} onOpen={onOpen} />)}
            </div>
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${v2Tokens.ruleSoft}`, fontSize: 12, color: v2Tokens.inkMuted, display: 'flex', justifyContent: 'space-between' }}>
              <span>显示 {tools.length} / 1,428</span>
              <a style={{ color: v2Tokens.primary, fontWeight: 600, cursor: 'pointer' }}>Browse all →</a>
            </div>
          </section>

          {/* GitHub panel */}
          <section style={{ background: v2Tokens.panel, borderRadius: 12, border: `1px solid ${v2Tokens.rule}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <V2PanelHeader
              kicker="GitHub Trending" title="What's hot" zhTitle="开源趋势"
              right={
                <div style={{ display: 'flex', gap: 4, padding: 3, background: v2Tokens.bg, borderRadius: 6, border: `1px solid ${v2Tokens.rule}`, fontSize: 12 }}>
                  {[['today', '今日'], ['week', '本周'], ['month', '本月']].map(([k, l]) => (
                    <button key={k} onClick={() => setPeriod(k)} style={{
                      padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: period === k ? v2Tokens.panel : 'transparent',
                      color: period === k ? v2Tokens.ink : v2Tokens.inkSoft, fontWeight: 500,
                      boxShadow: period === k ? '0 1px 1px rgba(0,0,0,0.04)' : 'none',
                    }}>{l}</button>
                  ))}
                </div>
              }
            />
            <div style={{ display: 'flex', gap: 6, padding: '12px 24px', borderBottom: `1px solid ${v2Tokens.ruleSoft}`, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: v2Tokens.inkMuted, fontWeight: 600, marginRight: 4 }}>语言:</span>
              {langs.map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '3px 9px', borderRadius: 999, border: `1px solid ${lang === l ? v2Tokens.ink : v2Tokens.rule}`,
                  background: lang === l ? v2Tokens.ink : 'transparent', color: lang === l ? '#fff' : v2Tokens.inkSoft,
                  fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  {l !== 'all' && <span style={{ width: 7, height: 7, borderRadius: 4, background: window.AITB.LANG_COLOR[l] }} />}
                  {l === 'all' ? 'All' : l}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {trending.map((it, i) => <V2GhRow key={it.repo + i} item={it} rank={i + 1} />)}
            </div>
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${v2Tokens.ruleSoft}`, fontSize: 12, color: v2Tokens.inkMuted, display: 'flex', justifyContent: 'space-between' }}>
              <span>{trending.length} repos · {period}</span>
              <a style={{ color: v2Tokens.primary, fontWeight: 600, cursor: 'pointer' }}>View all trending →</a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

window.V2Homepage = V2Homepage;
window.v2Tokens = v2Tokens;
