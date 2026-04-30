// Tool detail modal + Category page (shared across variations)

// Inline body of the detail card — used both as the modal body AND as a static
// preview inside design-canvas artboards (no position:fixed).
function ToolDetailInline({ tool, theme = 'light', onClose }) {
  if (!tool) return null;
  const cat = window.AITB.CATEGORIES.find((c) => c.id === tool.cat);
  const dark = theme === 'dark';
  const T = dark ? {
    bg: '#211915', panel: '#1A1411', ink: '#F5EDE4', inkSoft: '#B8A89B', inkMuted: '#7A6A5E',
    rule: '#2E241F', primary: '#FF6B35', primaryBg: 'rgba(255,107,53,0.1)', accent: '#FF6B35',
    btn: '#FF6B35', btnInk: '#0F0B09',
  } : {
    bg: '#FFFFFF', panel: '#FFF7F0', ink: '#1F1410', inkSoft: '#5C4A40', inkMuted: '#8C7A6F',
    rule: '#E8D9CC', primary: '#E85D2C', primaryBg: '#FFEFE2', accent: '#7C2D12',
    btn: '#1F1410', btnInk: '#FFFFFF',
  };
  return (
    <div style={{
      background: T.bg, borderRadius: 20, width: '100%', maxWidth: 720, maxHeight: '88vh',
      overflowY: 'auto', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
      border: `1px solid ${T.rule}`, color: T.ink,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
    }}>
      <div style={{ padding: 32, background: T.panel, borderBottom: `1px solid ${T.rule}`, position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16,
          border: 'none', background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          color: T.ink, cursor: 'pointer', fontSize: 16,
        }}>×</button>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <window.V1ToolLogo tool={tool} size={88} />
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 36, margin: '0 0 8px', letterSpacing: '-0.02em', color: T.ink }}>{tool.name}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 10px', borderRadius: 4, background: T.primaryBg, color: T.accent, fontSize: 12, fontWeight: 600 }}>{cat?.en} · {cat?.zh}</span>
              <span style={{ padding: '3px 10px', borderRadius: 4, border: `1px solid ${T.rule}`, fontSize: 12, color: T.inkSoft, fontWeight: 500 }}>{tool.pricing}</span>
              <span style={{ fontSize: 12, color: T.inkMuted }}>Added {tool.date}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: 32 }}>
        <h3 style={{ fontSize: 11, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: '0 0 10px' }}>简介 About</h3>
        <p style={{ fontSize: 16, color: T.ink, lineHeight: 1.6, margin: '0 0 12px' }}>{tool.en}</p>
        <p style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.7, margin: '0 0 28px' }}>{tool.zh}</p>
        <h3 style={{ fontSize: 11, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: '0 0 10px' }}>主要特点 Highlights</h3>
        <ul style={{ margin: '0 0 28px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['Free tier available', '免费额度可用'],
            ['Public API', '提供公共 API'],
            ['Multi-language support · 中文支持', '支持中英多语言'],
            ['Active community', '活跃的开发者社区'],
          ].map(([en, zh]) => (
            <li key={en} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: T.primary, fontSize: 14, marginTop: 2 }}>✓</span>
              <span style={{ fontSize: 14, color: T.inkSoft }}>{en} <span style={{ color: T.inkMuted }}>· {zh}</span></span>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ flex: 1, padding: '13px 20px', borderRadius: 10, border: 'none', background: T.btn, color: T.btnInk, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Visit website ↗ 访问</button>
          <button style={{ padding: '13px 18px', borderRadius: 10, border: `1px solid ${T.rule}`, background: 'transparent', color: T.ink, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>★ Save</button>
          <button style={{ padding: '13px 18px', borderRadius: 10, border: `1px solid ${T.rule}`, background: 'transparent', color: T.ink, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Share</button>
        </div>
      </div>
    </div>
  );
}

function ToolDetailModal({ tool, onClose, theme = 'light' }) {
  if (!tool) return null;
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,11,9,0.6)',
      backdropFilter: 'blur(8px)', zIndex: 100,
      display: 'grid', placeItems: 'center', padding: 32,
    }}>
      <div onClick={(e) => e.stopPropagation()}>
        <ToolDetailInline tool={tool} theme={theme} onClose={onClose} />
      </div>
    </div>
  );
}

// ─── Category page ────────────────────────────────────────────
function CategoryPage({ catId, onOpen, onBack }) {
  const t = window.v1Tokens;
  const cat = window.AITB.CATEGORIES.find((c) => c.id === catId) || window.AITB.CATEGORIES[0];
  const tools = window.AITB.AI_TOOLS.filter((x) => x.cat === cat.id);
  // pad with synthetic ones so the page feels populated
  const padded = tools.length >= 6 ? tools : [...tools, ...window.AITB.AI_TOOLS.slice(0, 6 - tools.length)];

  return (
    <div style={{ background: t.bg, color: t.ink, minHeight: '100%', fontFamily: 'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      {/* slim header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 56px', borderBottom: `1px solid ${t.rule}` }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: t.inkSoft, fontSize: 13, cursor: 'pointer', padding: 0, fontWeight: 500 }}>← Back to home · 返回首页</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: t.inkMuted }}>
          <a style={{ color: t.inkMuted }}>Home</a>
          <span>›</span>
          <a style={{ color: t.inkMuted }}>Categories</a>
          <span>›</span>
          <span style={{ color: t.ink, fontWeight: 600 }}>{cat.en}</span>
        </div>
      </header>

      {/* category hero */}
      <section style={{ padding: '56px 56px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -120, top: -100, width: 380, height: 380, borderRadius: '50%', background: `radial-gradient(circle, ${t.primary}22 0%, transparent 70%)` }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: t.card, border: `1px solid ${t.rule}`, display: 'grid', placeItems: 'center', fontSize: 44, boxShadow: '0 12px 30px -10px rgba(31,20,16,0.12)' }}>{cat.icon}</div>
          <div>
            <div style={{ fontSize: 12, color: t.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Category · 分类</div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 56, margin: 0, color: t.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{cat.en}</h1>
            <p style={{ fontSize: 17, color: t.inkSoft, margin: '8px 0 0' }}>{cat.zh} · {cat.count} tools curated</p>
          </div>
        </div>
      </section>

      {/* filter bar */}
      <section style={{ padding: '16px 56px', borderTop: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}`, background: t.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: t.inkMuted, fontWeight: 600 }}>价格 Price:</span>
          {['All', 'Free', 'Freemium', 'Paid'].map((p, i) => (
            <button key={p} style={{
              padding: '5px 12px', borderRadius: 999, border: `1px solid ${i === 0 ? t.ink : t.rule}`,
              background: i === 0 ? t.ink : t.card, color: i === 0 ? '#fff' : t.inkSoft,
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: t.bg, borderRadius: 8, border: `1px solid ${t.rule}`, fontSize: 12 }}>
          {['Popular', 'Newest', 'Rating'].map((s, i) => (
            <button key={s} style={{
              padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer',
              background: i === 0 ? t.card : 'transparent',
              color: i === 0 ? t.ink : t.inkSoft, fontWeight: 500,
              boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
            }}>{s}</button>
          ))}
        </div>
      </section>

      {/* tool grid */}
      <section style={{ padding: '40px 56px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {padded.map((tool, i) => (
            <div key={tool.id + i} onClick={() => onOpen(tool)} style={{
              background: t.card, borderRadius: 14, padding: 22, border: `1px solid ${t.rule}`,
              cursor: 'pointer', transition: 'all .18s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.rule; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <window.V1ToolLogo tool={tool} size={56} />
                <div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 20, margin: 0, color: t.ink, letterSpacing: '-0.02em' }}>{tool.name}</h3>
                  <span style={{ fontSize: 11, color: t.inkMuted, fontWeight: 500 }}>{tool.pricing}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.55, margin: '0 0 10px', minHeight: 60 }}>{tool.en}</p>
              <p style={{ fontSize: 12, color: t.inkMuted, lineHeight: 1.55, margin: '0 0 14px',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{tool.zh}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${t.rule}` }}>
                <span style={{ padding: '3px 9px', borderRadius: 4, background: t.bgWarm, color: t.accent, fontSize: 11, fontWeight: 600 }}>{cat.zh}</span>
                <span style={{ fontSize: 11, color: t.inkMuted }}>{tool.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 48 }}>
          <button style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.rule}`, background: t.card, color: t.inkMuted, cursor: 'pointer' }}>‹</button>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} style={{
              width: 36, height: 36, borderRadius: 8, border: `1px solid ${n === 1 ? t.ink : t.rule}`,
              background: n === 1 ? t.ink : t.card, color: n === 1 ? '#fff' : t.inkSoft,
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>{n}</button>
          ))}
          <span style={{ color: t.inkMuted, padding: '0 4px' }}>…</span>
          <button style={{ width: 48, height: 36, borderRadius: 8, border: `1px solid ${t.rule}`, background: t.card, color: t.inkSoft, cursor: 'pointer', fontSize: 13 }}>12</button>
          <button style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.rule}`, background: t.card, color: t.inkSoft, cursor: 'pointer' }}>›</button>
        </div>
      </section>
    </div>
  );
}

window.ToolDetailModal = ToolDetailModal;
window.ToolDetailInline = ToolDetailInline;
window.CategoryPage = CategoryPage;
