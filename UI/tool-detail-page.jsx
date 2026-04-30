// Full Tool Detail Page — replaces the modal for V2 Pro
// Sections: hero, intro, how-to-use, embedded ads (banner + sidebar), comments, related tools

const tdpTokens = {
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
  star:      '#F5B544',
};

// Mock comments
const MOCK_COMMENTS = [
  { id: 1, name: '设计师老王', avatar: '王', date: '2 小时前', rating: 5, en: '', zh: '日常 90% 的写作和长文档分析都靠它，2M context 真的香。' },
  { id: 2, name: 'Linus Z.',     avatar: 'L',  date: '6 小时前', rating: 5, en: 'The reasoning quality is noticeably above other models for code review tasks. Worth the subscription.', zh: '' },
  { id: 3, name: '产品小白',     avatar: '白', date: '昨天',     rating: 4, en: '', zh: '免费额度有点紧，但整体质量很高。期待后续加更多 tools。' },
  { id: 4, name: 'Avery Chen',   avatar: 'A',  date: '2 天前',   rating: 5, en: 'Switched from another assistant — the writing voice feels more natural and less robotic.', zh: '' },
];

function Stars({ n, size = 14, color = tdpTokens.star }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color }}>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ fontSize: size, color: i <= n ? color : '#E8E0D6' }}>★</span>
      ))}
    </span>
  );
}

// -- Ad slots (clearly labeled as 广告 / Sponsored) --
function AdBanner({ size = 'leaderboard' }) {
  // leaderboard: 728×90-ish; rectangle: 300×250-ish
  const isLb = size === 'leaderboard';
  return (
    <div style={{
      position: 'relative', borderRadius: 10, overflow: 'hidden',
      border: `1px dashed ${tdpTokens.rule}`,
      background: `linear-gradient(135deg, ${tdpTokens.primaryBg} 0%, ${tdpTokens.panel2} 100%)`,
      padding: isLb ? '20px 24px' : '24px 20px',
      minHeight: isLb ? 96 : 240,
      display: 'flex', flexDirection: isLb ? 'row' : 'column',
      alignItems: isLb ? 'center' : 'flex-start', justifyContent: 'space-between', gap: 16,
    }}>
      <div style={{
        position: 'absolute', top: 8, right: 10,
        fontSize: 9, color: tdpTokens.inkMuted, textTransform: 'uppercase',
        letterSpacing: '0.08em', fontWeight: 700,
        padding: '2px 6px', background: tdpTokens.panel, borderRadius: 3,
        border: `1px solid ${tdpTokens.rule}`,
      }}>广告 · Sponsored</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: tdpTokens.accent, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          {isLb ? '推荐 · Featured' : 'Brand spotlight · 品牌推荐'}
        </div>
        <h4 style={{ margin: '0 0 6px', fontSize: isLb ? 18 : 20, fontWeight: 700, color: tdpTokens.ink, letterSpacing: '-0.01em' }}>
          {isLb ? '免费试用 14 天 · 高级 AI 写作助手' : '让你的团队效率翻倍'}
        </h4>
        <p style={{ margin: 0, fontSize: 13, color: tdpTokens.inkSoft, lineHeight: 1.5, maxWidth: isLb ? 460 : 'unset' }}>
          {isLb
            ? '一键生成营销文案、邮件、博客 — 适配 30+ 种行业模板。'
            : '集成式 AI 工作流平台，覆盖团队协作、文档管理与项目自动化。立即注册免费版。'}
        </p>
      </div>
      <button style={{
        padding: '10px 20px', borderRadius: 8, border: 'none',
        background: tdpTokens.ink, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        whiteSpace: 'nowrap', alignSelf: isLb ? 'center' : 'flex-start',
      }}>立即试用 →</button>
    </div>
  );
}

function AdNative() {
  // looks like a related tool card but marked as sponsored
  return (
    <div style={{
      background: tdpTokens.panel, borderRadius: 10, padding: 16,
      border: `1px dashed ${tdpTokens.rule}`, position: 'relative', cursor: 'pointer',
    }}>
      <div style={{
        position: 'absolute', top: 10, right: 10,
        fontSize: 9, color: tdpTokens.inkMuted, textTransform: 'uppercase',
        letterSpacing: '0.08em', fontWeight: 700,
      }}>广告 AD</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 9, background: '#7C3AED', color: '#fff',
          display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18,
        }}>X</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: tdpTokens.ink }}>XWriter Pro</div>
          <div style={{ fontSize: 11, color: tdpTokens.inkMuted }}>AI 写作 · Free trial</div>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: tdpTokens.inkSoft, lineHeight: 1.45 }}>
        每天 50 次免费生成 — 包含中文长文优化与品牌语调训练。
      </p>
    </div>
  );
}

// -- Hero --
function TDPHero({ tool, onBack }) {
  const cat = window.AITB.CATEGORIES.find((c) => c.id === tool.cat);
  return (
    <div style={{ background: tdpTokens.panel, borderBottom: `1px solid ${tdpTokens.rule}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 32px 36px' }}>
        {/* breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: tdpTokens.inkMuted, marginBottom: 28 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: tdpTokens.inkSoft, fontSize: 13, cursor: 'pointer', padding: 0, fontWeight: 500 }}>← 返回</button>
          <span style={{ color: tdpTokens.rule }}>|</span>
          <a style={{ color: tdpTokens.inkMuted }}>Home</a>
          <span>›</span>
          <a style={{ color: tdpTokens.inkMuted }}>{cat?.en}</a>
          <span>›</span>
          <span style={{ color: tdpTokens.ink, fontWeight: 600 }}>{tool.name}</span>
        </div>

        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <window.V1ToolLogo tool={tool} size={120} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 48, margin: 0, letterSpacing: '-0.03em', color: tdpTokens.ink }}>{tool.name}</h1>
              <span style={{ padding: '4px 10px', borderRadius: 4, background: tdpTokens.primaryBg, color: tdpTokens.accent, fontSize: 12, fontWeight: 600 }}>{tool.pricing}</span>
            </div>
            <p style={{ fontSize: 18, color: tdpTokens.inkSoft, lineHeight: 1.55, margin: '0 0 16px', maxWidth: 720 }}>{tool.en}</p>
            <p style={{ fontSize: 15, color: tdpTokens.inkMuted, lineHeight: 1.7, margin: '0 0 20px', maxWidth: 720 }}>{tool.zh}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stars n={5} size={16} />
                <span style={{ fontSize: 14, fontWeight: 600, color: tdpTokens.ink }}>4.8</span>
                <span style={{ fontSize: 13, color: tdpTokens.inkMuted }}>(2,142 评分)</span>
              </div>
              <div style={{ height: 16, width: 1, background: tdpTokens.rule }} />
              <span style={{ fontSize: 13, color: tdpTokens.inkSoft }}>👁 124K 月访问 · monthly visits</span>
              <div style={{ height: 16, width: 1, background: tdpTokens.rule }} />
              <span style={{ fontSize: 13, color: tdpTokens.inkSoft }}>★ 8.9K 收藏</span>
              <div style={{ height: 16, width: 1, background: tdpTokens.rule }} />
              <span style={{ fontSize: 13, color: tdpTokens.inkSoft }}>📅 收录于 {tool.date}</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{
                padding: '12px 24px', borderRadius: 10, border: 'none',
                background: tdpTokens.primary, color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', boxShadow: `0 8px 20px -8px ${tdpTokens.primary}aa`,
              }}>访问官网 Visit ↗</button>
              <button style={{
                padding: '12px 18px', borderRadius: 10, border: `1px solid ${tdpTokens.rule}`,
                background: tdpTokens.panel, color: tdpTokens.ink, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>★ 收藏</button>
              <button style={{
                padding: '12px 18px', borderRadius: 10, border: `1px solid ${tdpTokens.rule}`,
                background: tdpTokens.panel, color: tdpTokens.ink, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>↗ 分享</button>
              <button style={{
                padding: '12px 18px', borderRadius: 10, border: `1px solid ${tdpTokens.rule}`,
                background: tdpTokens.panel, color: tdpTokens.inkSoft, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>⚐ 举报</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Sticky in-page nav --
function TDPTabs({ active, setActive }) {
  const tabs = [
    { id: 'about',     en: 'About',         zh: '简介' },
    { id: 'features',  en: 'Features',      zh: '主要功能' },
    { id: 'howto',     en: 'How to use',    zh: '使用方式' },
    { id: 'pricing',   en: 'Pricing',       zh: '价格' },
    { id: 'comments',  en: 'Comments',      zh: '评论' },
    { id: 'related',   en: 'Related',       zh: '相关推荐' },
  ];
  return (
    <div style={{
      position: 'sticky', top: 56, zIndex: 5,
      background: tdpTokens.bg, borderBottom: `1px solid ${tdpTokens.rule}`,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', gap: 4 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            padding: '14px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: active === t.id ? tdpTokens.ink : tdpTokens.inkSoft,
            fontWeight: active === t.id ? 600 : 500, fontSize: 13,
            borderBottom: `2px solid ${active === t.id ? tdpTokens.primary : 'transparent'}`,
            marginBottom: -1,
          }}>{t.en} <span style={{ color: tdpTokens.inkMuted, fontWeight: 400, fontSize: 12 }}>{t.zh}</span></button>
        ))}
      </div>
    </div>
  );
}

// -- Section blocks --
function Section({ id, kicker, title, zhTitle, children }) {
  return (
    <section id={id} style={{ paddingTop: 36, scrollMarginTop: 120 }}>
      <div style={{ fontSize: 11, color: tdpTokens.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{kicker}</div>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 28, margin: '0 0 18px', letterSpacing: '-0.02em', color: tdpTokens.ink }}>
        {title} <span style={{ color: tdpTokens.inkMuted, fontWeight: 400, fontSize: 18, fontFamily: 'inherit' }}>{zhTitle}</span>
      </h2>
      {children}
    </section>
  );
}

function AboutSection({ tool }) {
  return (
    <Section id="about" kicker="About · 简介" title="What it is" zhTitle="是什么">
      <div style={{ background: tdpTokens.panel, borderRadius: 12, padding: 28, border: `1px solid ${tdpTokens.rule}` }}>
        <p style={{ fontSize: 16, color: tdpTokens.ink, lineHeight: 1.75, margin: '0 0 16px' }}>
          {tool.name} 是一款 <strong>{window.AITB.CATEGORIES.find((c) => c.id === tool.cat)?.zh}</strong>类工具。{tool.zh}
        </p>
        <p style={{ fontSize: 15, color: tdpTokens.inkSoft, lineHeight: 1.75, margin: '0 0 16px' }}>
          {tool.en} It's been actively used by individuals, startups, and enterprises since launch — with a steady stream of model and product updates throughout 2026.
        </p>
        <p style={{ fontSize: 15, color: tdpTokens.inkSoft, lineHeight: 1.75, margin: 0 }}>
          适用人群：内容创作者、产品经理、研究人员、开发者，以及任何希望借助 AI 加速日常工作流的团队。
        </p>
      </div>
    </Section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: '⚡', en: 'Long-context understanding', zh: '长上下文理解', desc: '支持高达 2M tokens 的上下文窗口，可一次读取整本书或整个代码仓库。' },
    { icon: '⌨', en: 'Tool use & function calling', zh: '工具调用', desc: '原生支持函数调用，可与浏览器、终端、外部 API 无缝集成。' },
    { icon: '◐', en: 'Multi-modal input',           zh: '多模态输入', desc: '支持图片、PDF、表格、代码片段作为输入，理解能力出色。' },
    { icon: '◈', en: 'Project memory',              zh: '项目记忆',   desc: '可持久化项目上下文，在多次对话中保持连贯。' },
  ];
  return (
    <Section id="features" kicker="Features · 主要功能" title="What it can do" zhTitle="能做什么">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {features.map((f) => (
          <div key={f.en} style={{ background: tdpTokens.panel, borderRadius: 10, padding: 20, border: `1px solid ${tdpTokens.rule}`, display: 'flex', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: tdpTokens.primaryBg, color: tdpTokens.accent, display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: tdpTokens.ink, marginBottom: 3 }}>{f.en} <span style={{ color: tdpTokens.inkMuted, fontWeight: 400 }}>· {f.zh}</span></div>
              <p style={{ fontSize: 13, color: tdpTokens.inkSoft, lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HowToSection({ tool }) {
  const steps = [
    { en: 'Sign up', zh: '注册账号', desc: '访问官网，使用邮箱或 Google 账号一键注册。免费额度即时可用。' },
    { en: 'Pick a workflow', zh: '选择工作流', desc: '在首页选择「写作」「编程」「分析」等预设工作流，或者直接进入对话。' },
    { en: 'Provide context', zh: '提供上下文', desc: '通过粘贴文本、上传文件、连接工具等方式给出任务背景，越具体效果越好。' },
    { en: 'Iterate', zh: '迭代优化', desc: '基于初版结果给出反馈：「更简短」「更正式」「加入示例」等，直到满意为止。' },
    { en: 'Save or export', zh: '保存导出', desc: '将结果导出为 Markdown、PDF 或直接同步到 Notion、飞书等协作工具。' },
  ];
  return (
    <Section id="howto" kicker="How to use · 使用方式" title="Get started in 5 steps" zhTitle="五步上手">
      <div style={{ background: tdpTokens.panel, borderRadius: 12, padding: 28, border: `1px solid ${tdpTokens.rule}` }}>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {steps.map((s, i) => (
            <li key={s.en} style={{ display: 'flex', gap: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 16, background: tdpTokens.primary,
                color: '#fff', display: 'grid', placeItems: 'center',
                fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 15,
                flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: tdpTokens.ink, marginBottom: 4 }}>{s.en} · {s.zh}</div>
                <p style={{ fontSize: 14, color: tdpTokens.inkSoft, lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* tip */}
        <div style={{
          marginTop: 24, padding: 16, borderRadius: 8,
          background: tdpTokens.primaryBg, border: `1px solid ${tdpTokens.primary}33`,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: tdpTokens.accent, marginBottom: 4 }}>Pro tip · 进阶提示</div>
            <p style={{ fontSize: 13, color: tdpTokens.accent, lineHeight: 1.55, margin: 0 }}>
              使用 {tool.name} 的「Projects」功能，将相关文件、提示词模板与对话集中管理，能显著提升复用效率。
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function PricingSection() {
  const tiers = [
    { name: 'Free', zh: '免费版', price: '¥0', sub: '/月', features: ['每天 30 次对话', '基础模型', '社区支持'], featured: false },
    { name: 'Pro',  zh: '专业版', price: '¥149', sub: '/月', features: ['不限对话次数', '所有前沿模型', '优先响应队列', '项目记忆'], featured: true },
    { name: 'Team', zh: '团队版', price: '¥299', sub: '/人/月', features: ['Pro 全部功能', '团队空间共享', '权限管理', '专属客服'], featured: false },
  ];
  return (
    <Section id="pricing" kicker="Pricing · 价格" title="Plans" zhTitle="订阅方案">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {tiers.map((t) => (
          <div key={t.name} style={{
            background: t.featured ? tdpTokens.ink : tdpTokens.panel,
            color: t.featured ? '#fff' : tdpTokens.ink,
            borderRadius: 12, padding: 24, position: 'relative',
            border: `1px solid ${t.featured ? tdpTokens.ink : tdpTokens.rule}`,
          }}>
            {t.featured && <div style={{ position: 'absolute', top: -10, left: 24, padding: '3px 10px', borderRadius: 4, background: tdpTokens.primary, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>推荐 Popular</div>}
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.name} <span style={{ opacity: 0.6, fontWeight: 400 }}>· {t.zh}</span></div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>{t.price}</span>
              <span style={{ fontSize: 13, opacity: 0.6 }}>{t.sub}</span>
            </div>
            <ul style={{ margin: '0 0 18px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {t.features.map((f) => (
                <li key={f} style={{ fontSize: 13, opacity: 0.85, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: t.featured ? tdpTokens.primary : tdpTokens.green }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button style={{
              width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: t.featured ? tdpTokens.primary : tdpTokens.ink,
              color: '#fff', fontSize: 13, fontWeight: 600,
            }}>选择 Choose {t.name}</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CommentsSection() {
  const [text, setText] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [list, setList] = React.useState(MOCK_COMMENTS);
  const [hover, setHover] = React.useState(0);

  const submit = () => {
    if (!text.trim()) return;
    setList([{ id: Date.now(), name: '你 You', avatar: '我', date: '刚刚', rating, zh: text, en: '' }, ...list]);
    setText('');
    setRating(5);
  };

  return (
    <Section id="comments" kicker="Comments · 评论" title={`Discussion · ${list.length} 条`} zhTitle="社区讨论">
      {/* Composer */}
      <div style={{ background: tdpTokens.panel, borderRadius: 12, padding: 22, border: `1px solid ${tdpTokens.rule}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: tdpTokens.primary, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>我</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: tdpTokens.inkMuted, fontWeight: 600, marginRight: 4 }}>评分:</span>
            {[1,2,3,4,5].map((i) => (
              <button key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: 22, color: i <= (hover || rating) ? tdpTokens.star : '#E8E0D6', lineHeight: 1 }}
              >★</button>
            ))}
            <span style={{ fontSize: 12, color: tdpTokens.inkSoft, marginLeft: 6 }}>{rating}.0</span>
          </div>
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="分享你的使用体验… Share your experience"
          rows={3}
          style={{
            width: '100%', resize: 'vertical', minHeight: 72,
            border: `1px solid ${tdpTokens.rule}`, borderRadius: 8,
            padding: '10px 12px', fontSize: 14, color: tdpTokens.ink,
            fontFamily: 'inherit', outline: 'none', background: tdpTokens.bg,
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 11, color: tdpTokens.inkMuted }}>支持 Markdown · 请遵守社区规范</span>
          <button onClick={submit} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: text.trim() ? tdpTokens.primary : tdpTokens.rule,
            color: text.trim() ? '#fff' : tdpTokens.inkMuted,
            fontSize: 13, fontWeight: 600,
            cursor: text.trim() ? 'pointer' : 'not-allowed',
          }}>发布评论 Post</button>
        </div>
      </div>

      {/* Sort + filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['hot', '最热'], ['new', '最新'], ['rating', '高分']].map(([k, l], i) => (
            <button key={k} style={{
              padding: '5px 12px', borderRadius: 999, border: `1px solid ${i === 0 ? tdpTokens.ink : tdpTokens.rule}`,
              background: i === 0 ? tdpTokens.ink : tdpTokens.panel,
              color: i === 0 ? '#fff' : tdpTokens.inkSoft, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Stars n={5} size={12} />
          <span style={{ fontSize: 13, color: tdpTokens.inkSoft, fontWeight: 600 }}>4.8 · {list.length} 条评论</span>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((c) => (
          <div key={c.id} style={{ background: tdpTokens.panel, borderRadius: 10, padding: 18, border: `1px solid ${tdpTokens.rule}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: tdpTokens.panel2, color: tdpTokens.ink, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>{c.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: tdpTokens.ink }}>{c.name}</span>
                  <Stars n={c.rating} size={11} />
                </div>
                <div style={{ fontSize: 11, color: tdpTokens.inkMuted, marginTop: 1 }}>{c.date}</div>
              </div>
              <button style={{ background: 'none', border: 'none', color: tdpTokens.inkMuted, cursor: 'pointer', fontSize: 16 }}>⋯</button>
            </div>
            {c.zh && <p style={{ fontSize: 14, color: tdpTokens.ink, lineHeight: 1.65, margin: '0 0 4px' }}>{c.zh}</p>}
            {c.en && <p style={{ fontSize: 13, color: tdpTokens.inkSoft, lineHeight: 1.65, margin: 0 }}>{c.en}</p>}
            <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 12, color: tdpTokens.inkMuted }}>
              <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 12 }}>👍 有用 ({Math.floor(Math.random() * 40) + 5})</button>
              <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 12 }}>💬 回复</button>
              <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 12 }}>⚐ 举报</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <button style={{ padding: '10px 24px', borderRadius: 999, border: `1px solid ${tdpTokens.rule}`, background: tdpTokens.panel, color: tdpTokens.inkSoft, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>加载更多评论 Load more</button>
      </div>
    </Section>
  );
}

function RelatedSection({ tool, onOpen }) {
  const others = window.AITB.AI_TOOLS.filter((t) => t.id !== tool.id && t.cat === tool.cat).slice(0, 4);
  const fill = window.AITB.AI_TOOLS.filter((t) => t.id !== tool.id).slice(0, Math.max(0, 4 - others.length));
  const list = [...others, ...fill].slice(0, 4);
  return (
    <Section id="related" kicker="Related · 相关推荐" title="You might also like" zhTitle="相似工具">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {list.map((t) => (
          <div key={t.id} onClick={() => onOpen(t)} style={{
            background: tdpTokens.panel, borderRadius: 10, padding: 16,
            border: `1px solid ${tdpTokens.rule}`, cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = tdpTokens.primary; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = tdpTokens.rule; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <window.V1ToolLogo tool={t} size={40} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: tdpTokens.ink }}>{t.name}</div>
                <div style={{ fontSize: 11, color: tdpTokens.inkMuted }}>{t.pricing}</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: tdpTokens.inkSoft, lineHeight: 1.5, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{t.zh}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// -- Sidebar (sticky) --
function TDPSidebar({ tool }) {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 120, alignSelf: 'flex-start' }}>
      {/* Quick info */}
      <div style={{ background: tdpTokens.panel, borderRadius: 12, padding: 20, border: `1px solid ${tdpTokens.rule}` }}>
        <h3 style={{ fontSize: 11, color: tdpTokens.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: '0 0 12px' }}>基本信息 Quick info</h3>
        {[
          ['Category 分类', window.AITB.CATEGORIES.find((c) => c.id === tool.cat)?.zh],
          ['Pricing 价格', tool.pricing],
          ['Added 收录', tool.date],
          ['Language', '中 / EN / 30+'],
          ['Platform 平台', 'Web · macOS · iOS · Android'],
          ['API', '✓ Public API'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${tdpTokens.ruleSoft}`, fontSize: 13 }}>
            <span style={{ color: tdpTokens.inkMuted }}>{k}</span>
            <span style={{ color: tdpTokens.ink, fontWeight: 500, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Sidebar ad slot */}
      <AdBanner size="rectangle" />

      {/* Tags */}
      <div style={{ background: tdpTokens.panel, borderRadius: 12, padding: 20, border: `1px solid ${tdpTokens.rule}` }}>
        <h3 style={{ fontSize: 11, color: tdpTokens.inkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: '0 0 12px' }}>标签 Tags</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['AI Assistant', 'Long context', '中文支持', 'Free tier', 'API', 'Multimodal', 'Reasoning'].map((tag) => (
            <span key={tag} style={{ padding: '4px 10px', borderRadius: 999, background: tdpTokens.bg, border: `1px solid ${tdpTokens.rule}`, color: tdpTokens.inkSoft, fontSize: 12, cursor: 'pointer' }}>#{tag}</span>
          ))}
        </div>
      </div>

      {/* Native ad */}
      <AdNative />
    </aside>
  );
}

function ToolDetailPage({ tool, onBack, onOpen }) {
  const [activeTab, setActiveTab] = React.useState('about');
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  if (!tool) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: tdpTokens.bg, zIndex: 80,
      overflowY: 'auto', color: tdpTokens.ink,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
    }}>
      {/* slim top bar so user knows they're inside the site */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 6,
        background: tdpTokens.panel, borderBottom: `1px solid ${tdpTokens.rule}`,
        padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: tdpTokens.inkSoft, fontWeight: 500, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}>← 返回 Back</button>
          <span style={{ color: tdpTokens.rule }}>|</span>
          <span style={{ fontSize: 13, color: tdpTokens.inkMuted }}>AiToolsBox · 工具详情</span>
        </div>
        <div style={{ fontSize: 11, color: tdpTokens.inkMuted }}>按 ESC 关闭</div>
      </div>

      <TDPHero tool={tool} onBack={onBack} />
      <TDPTabs active={activeTab} setActive={setActiveTab} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 64px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
        <main style={{ minWidth: 0, paddingTop: 4 }}>
          {/* Top banner ad */}
          <div style={{ marginTop: 32 }}>
            <AdBanner size="leaderboard" />
          </div>

          <AboutSection tool={tool} />
          <FeaturesSection />
          <HowToSection tool={tool} />

          {/* In-content native ad */}
          <div style={{ marginTop: 36 }}>
            <AdBanner size="leaderboard" />
          </div>

          <PricingSection />
          <CommentsSection />
          <RelatedSection tool={tool} onOpen={onOpen} />
        </main>
        <TDPSidebar tool={tool} />
      </div>
    </div>
  );
}

window.ToolDetailPage = ToolDetailPage;
