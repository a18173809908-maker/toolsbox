# AiToolsBox — Codex 技术交接文档

> 本文是给 Codex 的完整上下文包。读完此文件即可独立接手开发，无需额外沟通。
> 策略与运营背景见 [GROWTH.md](GROWTH.md)，开发进度见 [ai_tools_full_plan.md](ai_tools_full_plan.md)。

---

## 1. 项目基本信息

| 项目 | 内容 |
|---|---|
| 站点名 | AiToolsBox / aiboxpro |
| 正式域名 | `aiboxpro.cn`（已注册，DNS 待绑定 Vercel） |
| 临时域名 | `toolsbox-six.vercel.app`（开发期，代码中已全部替换为 aiboxpro.cn） |
| 定位 | 中国用户视角的 AI 工具导航 + GitHub 开源趋势 + AI 资讯聚合 |
| 变现路径 | 百度联盟广告（需 ICP 备案）+ 付费推荐位 + CPS |
| 目标用户 | 中国大陆 AI 开发者 / 创作者 / 普通用户 |

---

## 2. 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 15 App Router（TypeScript） |
| 数据库 | Neon Postgres（serverless） |
| ORM | Drizzle ORM |
| 部署 | Vercel |
| 样式 | 全部内联 style（无 Tailwind / CSS Modules，不要改这个约定） |
| 字体 | Inter（正文）+ Georgia serif（标题/品牌） |
| 图片 | `next/image`，github.com 域名已在 remotePatterns 白名单 |

---

## 3. 文件结构

```
app/
  layout.tsx                  全局 metadata、字体注入、BASE='https://aiboxpro.cn'
  page.tsx                    首页，调 loadHomepageData()，渲染 <V2Pro />
  globals.css                 极简重置，几乎为空
  robots.ts                   robots.txt 生成，已配置 Baiduspider
  sitemap.ts                  sitemap.xml 生成，包含工具/分类/资讯/trending

  api/
    search/route.ts           GET /api/search?q= 全文搜索（tools + articles）
    cron/
      github-trending/        定时拉取 GitHub Trending 数据
      refresh-articles/       定时抓取 RSS 文章
      refresh-trending/       trending 数据刷新

  tools/[slug]/page.tsx       工具详情页（SSG + ISR 1h）
  categories/[id]/
    page.tsx                  分类页（SSG + ISR 1h）
    ToolCard.tsx              'use client' 卡片组件（有 hover 事件）
  trending/
    page.tsx                  GitHub 趋势列表页（SSR，searchParams period）
    [...slug]/page.tsx        仓库详情页（SSR，catch-all owner/repo）
  news/
    page.tsx                  资讯列表页
    [id]/page.tsx             资讯详情页
    ArticleCard.tsx           'use client' 卡片组件
  og/route.tsx                动态 OG 图（edge runtime，ImageResponse）

components/
  V2Pro.tsx                   首页主组件，'use client'，包含所有首页 section

lib/
  tokens.ts                   设计 token（颜色）
  data.ts                     类型定义（Tool, Category, RepoItem 等）
  db/
    index.ts                  Drizzle 实例
    schema.ts                 表定义（categories, tools, githubTrending, sources, articles）
    queries.ts                所有数据库查询函数
    seed.ts                   种子数据脚本
  jobs/                       后台任务（抓取/AI处理/翻译）
  llm/index.ts                LLM 调用封装
```

---

## 4. 核心约定（必须遵守）

### 4.1 Server vs Client 组件

- **默认写 Server Component**（无 `'use client'`）
- **只有以下情况加 `'use client'`**：
  - 使用 `useState` / `useEffect` / `usePathname` 等 hooks
  - 有 `onMouseEnter` / `onMouseLeave` / `onClick` 等事件处理器
- 如果一个 Server Component 的子组件需要事件处理，**提取到独立文件**加 `'use client'`，不要污染父组件

### 4.2 样式约定

- **全部用内联 style 对象**，不用 className
- 颜色一律从 `lib/tokens.ts` 中的 `v2Tokens` 取，或定义局部 `const C = {...}` 常量（参考现有详情页写法）
- 字体：标题用 `fontFamily: 'Georgia, serif'`，正文 `fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'`
- 圆角：卡片 `borderRadius: 12~16`，按钮/标签 `borderRadius: 999`（胶囊）或 `6`（方形）
- 主色：`#F97316`（橙），文字主色：`#1F2937`，次文字：`#4B5563`，边框：`#E8D5B7`

### 4.3 SEO 约定

- 每个页面必须有 `generateMetadata`，包含 `title` / `description` / `openGraph` / `alternates.canonical`
- 详情页必须有 JSON-LD（工具页用 `SoftwareApplication`，资讯页用 `NewsArticle`）
- ISR：`export const revalidate = 3600`（列表/详情页统一）
- 不得在 Server Component 中做客户端渲染内容（百度蜘蛛不执行 JS）

### 4.4 数据库操作

- 所有查询写在 `lib/db/queries.ts`，**不要在页面组件里直接操作 db**
- 用 Drizzle ORM，参考现有查询写法
- 查询函数命名规范：`load*`（读）/ `upsert*` / `update*` / `search*`

### 4.5 BASE URL

- 全局统一为 `https://aiboxpro.cn`
- 每个有 `generateMetadata` 的页面文件顶部声明 `const BASE = 'https://aiboxpro.cn'`

---

## 5. 设计 Token 速查

```typescript
// lib/tokens.ts
{
  bg:        '#FFF7ED',   // 页面背景，暖米白
  panel:     '#FFFFFF',   // 卡片/侧栏/顶栏
  panel2:    '#FEF3E2',   // hover 填充
  ink:       '#1F2937',   // 主文字
  inkSoft:   '#4B5563',   // 次文字
  inkMuted:  '#9CA3AF',   // 占位/弱提示
  rule:      '#E8D5B7',   // 边框（暖）
  ruleSoft:  '#F3E8D0',   // 细分隔线
  primary:   '#F97316',   // 橙色主调，CTA/激活态
  primaryBg: '#FFEDD5',   // 浅橙填充，badge/chip 背景
  accent:    '#C2410C',   // 深橙，浅背景上的文字用
  green:     '#16A34A',   // 正增长/可用
  greenBg:   '#DCFCE7',   // 绿色浅填充
}
```

---

## 6. 当前数据库 Schema

```typescript
// lib/db/schema.ts（当前字段，全部）

categories: { id, en, zh, icon, count }

tools: {
  id, name, mono, brand,
  catId → categories.id,
  en, zh,            // 英文描述 / 中文描述
  pricing,           // 'Free' | 'Freemium' | 'Paid'
  featured,          // boolean
  publishedAt,       // text（日期字符串）
  createdAt,
}
// ⚠️ 缺少：url, china_access, chinese_ui, free_quota, api_available,
//          open_source, github_repo, features, pricing_detail, alternatives

githubTrending: {
  id(serial), period, repo, description, descriptionZh,
  lang, stars, gained, snapshotDate,
}

sources: { id, name, url, feedUrl, lang, active, createdAt }

articles: {
  id(serial), sourceId → sources.id,
  title, titleZh, url(unique),
  summary, summaryZh, tag,
  publishedAt, fetchedAt,
  status,  // 'published' | 'pending' | 'rejected'
}
```

---

## 7. 任务清单（按优先级排序）

---

### Task 1 — tools 表 Schema 扩展 ⭐ 最高优先

**为什么：** 「国内可用」是本站核心差异化。工具详情页现在「访问官网」按钮指向 Google 搜索（因为没有 `url` 字段），这是硬缺陷。

#### 7.1-A Drizzle Schema 变更

文件：`lib/db/schema.ts`，在 `tools` 表定义中追加以下字段：

```typescript
url:           text('url'),
chinaAccess:   text('china_access').default('unknown'),
// 取值: 'accessible' | 'vpn-required' | 'blocked' | 'unknown'
chineseUi:     boolean('chinese_ui').notNull().default(false),
freeQuota:     text('free_quota'),
// 例："每天 50 次" | "永久免费基础版" | null
apiAvailable:  boolean('api_available').notNull().default(false),
openSource:    boolean('open_source').notNull().default(false),
githubRepo:    text('github_repo'),
// 例："openai/whisper"，可与 trending 数据联动
features:      text('features').array(),
// 核心功能点，例：['支持中文', '无需注册', 'API 可用']
pricingDetail: text('pricing_detail'),
// 例："免费版每天 50 次，Pro $20/月无限次"
alternatives:  text('alternatives').array(),
// 替代工具的 id 数组，例：['chatgpt', 'claude']
upvotes:       integer('upvotes').notNull().default(0),
downvotes:     integer('downvotes').notNull().default(0),
```

#### 7.1-B 数据库迁移

在 Neon 控制台或通过 `drizzle-kit push` 执行：

```sql
ALTER TABLE tools ADD COLUMN IF NOT EXISTS url              TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS china_access     TEXT    DEFAULT 'unknown';
ALTER TABLE tools ADD COLUMN IF NOT EXISTS chinese_ui       BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS free_quota       TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS api_available    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS open_source      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS github_repo      TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS features         TEXT[];
ALTER TABLE tools ADD COLUMN IF NOT EXISTS pricing_detail   TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS alternatives     TEXT[];
ALTER TABLE tools ADD COLUMN IF NOT EXISTS upvotes          INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS downvotes        INTEGER NOT NULL DEFAULT 0;
```

#### 7.1-C queries.ts 更新

`loadToolById` 函数需要把新字段一并 select 出来并返回。

#### 7.1-D 种子数据补录

在 `lib/db/seed.ts` 中，为已有的 24 个工具补充 `url` 和 `chinaAccess` 字段（至少补这两个，其余为空也可先上线）。参考数据：

| id | url | chinaAccess | chineseUi | freeQuota |
|---|---|---|---|---|
| chatgpt | https://chat.openai.com | vpn-required | false | 每天有限次数 |
| claude | https://claude.ai | vpn-required | false | 每天有限次数 |
| cursor | https://cursor.sh | accessible | false | 免费版可用 |
| midjourney | https://midjourney.com | vpn-required | false | 已取消免费 |
| suno | https://suno.com | accessible | false | 每天 50 次 |
| perplexity | https://perplexity.ai | accessible | false | 免费版可用 |
| v0 | https://v0.dev | accessible | false | 免费版可用 |

---

### Task 2 — `<AdSlot />` 占位组件

**为什么：** ICP 备案需要 20 个工作日，现在就埋好 DOM 占位，备案完成后直接换广告代码，不用再改布局。

#### 创建文件：`components/AdSlot.tsx`

```typescript
// components/AdSlot.tsx
// 广告位占位组件。
// 当 NEXT_PUBLIC_ADS_ENABLED=true 时渲染真实广告脚本，否则渲染空白占位 div。
// 布局用 minHeight 保持空间，防止广告加载后布局跳动（CLS）。

'use client';

const AD_SLOTS: Record<string, { w: number; h: number; label: string }> = {
  'list-5':        { w: 728, h: 90,  label: '列表信息流广告' },
  'tool-sidebar':  { w: 300, h: 250, label: '工具详情侧栏' },
  'repo-sidebar':  { w: 300, h: 250, label: '仓库详情侧栏' },
  'news-feed':     { w: 728, h: 90,  label: '资讯信息流' },
  'footer-banner': { w: 728, h: 90,  label: 'Footer 横幅' },
};

export function AdSlot({ id }: { id: string }) {
  const slot = AD_SLOTS[id];
  if (!slot) return null;

  const enabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

  if (!enabled) {
    // 开发 / 备案等待期：保留空间，不渲染任何内容
    return (
      <div
        data-ad-slot={id}
        style={{
          width: slot.w, minHeight: slot.h,
          // 开发模式下显示淡色占位（生产隐藏）
          ...(process.env.NODE_ENV === 'development' ? {
            background: '#FEF9C3',
            border: '1px dashed #FCD34D',
            display: 'grid', placeItems: 'center',
            fontSize: 11, color: '#92400E',
          } : {}),
        }}
      >
        {process.env.NODE_ENV === 'development' && `AdSlot: ${slot.label}`}
      </div>
    );
  }

  // 备案通过后，在此处注入百度联盟代码
  // TODO: 替换为真实广告代码
  return <div data-ad-slot={id} style={{ width: slot.w, minHeight: slot.h }} />;
}
```

#### 埋入位置

| 文件 | 位置 | slot id |
|---|---|---|
| `app/tools/[slug]/page.tsx` | Description 卡片右侧（目前无侧栏，先放在描述下方） | `tool-sidebar` |
| `app/trending/[...slug]/page.tsx` | 数据统计面板下方 | `repo-sidebar` |
| `app/news/page.tsx` | 资讯列表每 8 条后插入 | `news-feed` |
| `app/layout.tsx` 或各页 Footer | Footer 上方 | `footer-banner` |

---

### Task 3 — 工具详情页 v2

**依赖：** Task 1（Schema 扩展）完成后才能做。

**文件：** `app/tools/[slug]/page.tsx`

#### 改动点

**1. 「访问官网」按钮** — 当前指向 Google 搜索，改为真实 URL：

```typescript
// 改前（临时方案）:
href={`https://www.google.com/search?q=${encodeURIComponent(tool.name + ' AI tool')}`}

// 改后:
href={tool.url ?? `https://www.google.com/search?q=${encodeURIComponent(tool.name + ' AI tool')}`}
// 有 url 字段时用真实 URL，没有时保留 Google 搜索 fallback
```

**2. Hero 区加「国内可用」徽章**

```typescript
// 紧跟定价 badge 后面，在同一行 flex 容器中追加：
const ACCESS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  'accessible':   { label: '🟢 国内直连', color: '#166534', bg: '#DCFCE7' },
  'vpn-required': { label: '🟡 需要VPN',  color: '#92400E', bg: '#FEF3C7' },
  'blocked':      { label: '🔴 无法访问', color: '#991B1B', bg: '#FEE2E2' },
  'unknown':      { label: '⚪ 未知',     color: '#6B7280', bg: '#F3F4F6' },
};

// 渲染：
{tool.chinaAccess && tool.chinaAccess !== 'unknown' && (
  <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
    background: ACCESS_BADGE[tool.chinaAccess].bg,
    color: ACCESS_BADGE[tool.chinaAccess].color }}>
    {ACCESS_BADGE[tool.chinaAccess].label}
  </span>
)}
```

**3. 功能亮点列表**（有 features 数组时显示）

```
┌─────────────────────────────────────┐
│  功能亮点                            │
│  ✓ 支持中文输入                      │
│  ✓ 无需科学上网                      │
│  ✓ 提供 API                         │
└─────────────────────────────────────┘
```

在 Description 卡片后新增一个 `features` 卡片，仅当 `tool.features?.length` 时渲染。

**4. 快速信息栏** — 在 Info grid 补充新字段：

```typescript
{ label: '国内访问', value: ACCESS_BADGE[tool.chinaAccess ?? 'unknown'].label },
{ label: '免费额度', value: tool.freeQuota ?? '—' },
{ label: '中文界面', value: tool.chineseUi ? '✅ 是' : '—' },
{ label: 'API 可用', value: tool.apiAvailable ? '✅ 是' : '—' },
```

**5. metadata SEO 增强**

```typescript
title: `${tool.name} — ${CHINA_LABEL} ${tool.catZh} AI 工具 | AiToolsBox`
// CHINA_LABEL = chinaAccess==='accessible' ? '国内可用' : ''
description: 含功能亮点前 3 条 + 国内可用信息，180 字以内
```

**6. 面包屑 JSON-LD**

```typescript
const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首页',    item: BASE },
    { '@type': 'ListItem', position: 2, name: tool.catZh, item: `${BASE}/categories/${tool.cat}` },
    { '@type': 'ListItem', position: 3, name: tool.name,  item: `${BASE}/tools/${tool.id}` },
  ],
};
// 和现有 jsonLd 一起注入为两个 <script type="application/ld+json">
```

---

### Task 4 — GitHub 仓库详情页 v2

**文件：** `app/trending/[...slug]/page.tsx`

**目标：** 从 GitHub API 拉取 README + Topics + 语言分布，SSR 输出，大幅提升页面内容量和 SEO。

#### 4.1 新建 GitHub API 工具函数

**文件：** `lib/github.ts`（新建）

```typescript
const GH_TOKEN = process.env.GITHUB_TOKEN; // 可选，有则每小时 5000 次，无则 60 次
const headers: HeadersInit = {
  Accept: 'application/vnd.github+json',
  ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
};

// 获取仓库基本信息（topics, language, license, pushed_at）
export async function fetchRepoInfo(repo: string) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers, next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    topics: string[];
    language: string;
    license: { spdx_id: string } | null;
    pushed_at: string;
    homepage: string | null;
    stargazers_count: number;
  }>;
}

// 获取 README（返回 Markdown 原文）
export async function fetchReadme(repo: string): Promise<string | null> {
  const res = await fetch(`https://api.github.com/repos/${repo}/readme`, {
    headers, next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json() as { content: string; encoding: string };
  if (data.encoding !== 'base64') return null;
  return Buffer.from(data.content, 'base64').toString('utf-8');
}
```

#### 4.2 README Markdown → HTML

安装依赖：`npm install marked sanitize-html`（或 `@types/` 对应包）

```typescript
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// 将相对图片路径转为绝对路径（避免图片 404）
function fixImagePaths(md: string, repo: string): string {
  const base = `https://raw.githubusercontent.com/${repo}/HEAD/`;
  return md.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, `![$1](${base}$2)`);
}

export function renderReadme(markdown: string, repo: string): string {
  const fixed = fixImagePaths(markdown, repo);
  const html = marked.parse(fixed) as string;
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'details', 'summary']),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height'] },
  });
}
```

#### 4.3 页面布局更新

在 `app/trending/[...slug]/page.tsx` 中：

1. 调用 `fetchRepoInfo` 和 `fetchReadme`（并行 `Promise.all`）
2. 现有的 Hero 卡片中追加：
   - Topics 标签（灰色小 badge 列表）
   - License 和最近更新时间
3. 新增 README 渲染区（`dangerouslySetInnerHTML={{ __html: readmeHtml }}`），加外层容器限制样式溢出
4. 在左侧保留现有统计数据（Stars/gained），README 在右侧或下方全宽展示

**README 容器样式**（防止 Markdown 样式污染全局）：

```typescript
// 给 README 容器加一个 prose class 或直接用 style
<div
  dangerouslySetInnerHTML={{ __html: readmeHtml }}
  style={{
    lineHeight: 1.7, color: '#374151', fontSize: 14,
    // 处理 README 内的常见元素
    // img: maxWidth 100%
    // pre/code: 背景 #F3F4F6, border-radius 6px
    // h2/h3: borderBottom 1px solid #E8D5B7
  }}
  className="readme-content"  // 在 globals.css 补充样式更好
/>
```

在 `app/globals.css` 中追加：

```css
.readme-content img { max-width: 100%; height: auto; border-radius: 8px; }
.readme-content pre { background: #F3F4F6; border-radius: 8px; padding: 16px; overflow-x: auto; font-size: 13px; }
.readme-content code { background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
.readme-content h1 { font-size: 22px; font-weight: 700; margin: 24px 0 12px; }
.readme-content h2 { font-size: 18px; font-weight: 700; margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #E8D5B7; }
.readme-content h3 { font-size: 15px; font-weight: 600; margin: 16px 0 8px; }
.readme-content ul, .readme-content ol { padding-left: 20px; margin: 8px 0; }
.readme-content li { margin: 4px 0; }
.readme-content a { color: #F97316; text-decoration: none; }
.readme-content a:hover { text-decoration: underline; }
.readme-content blockquote { border-left: 4px solid #E8D5B7; padding-left: 16px; color: #6B7280; margin: 12px 0; }
.readme-content table { border-collapse: collapse; width: 100%; font-size: 13px; }
.readme-content th, .readme-content td { border: 1px solid #E8D5B7; padding: 8px 12px; }
.readme-content th { background: #FFF7ED; font-weight: 600; }
```

#### 4.4 SEO metadata 增强

```typescript
title: `${name} — GitHub ${main.lang} 开源项目 今日 +${gained} Stars | AiToolsBox`
description: `${descriptionZh ?? description}。${main.lang} 开源项目，GitHub 本日新增 ${gained} Stars。`
```

#### 4.5 速率限制处理

GitHub API 无 token 时 60 次/小时。用 `next: { revalidate: 3600 }` 做 Next.js 级别缓存，同一仓库 1 小时内只请求一次 GitHub API。如果返回 403/429，降级为不显示 README（页面不报错，只缺少 README 区块）。

---

### Task 5 — 移动端响应式

**为什么：** 国内用户 70%+ 手机访问。当前所有页面用固定 `padding: '16px 48px'` 和固定宽度，手机上严重溢出。

**策略：** 用 CSS media query 或在 client 组件中读取窗口宽度。推荐方案是为共用 header/layout 创建响应式版本。

#### 5.1 TopBar 响应式（V2Pro.tsx 和各详情页 header）

手机端（< 768px）：
- padding 改为 `16px 20px`
- 导航收折为汉堡菜单（三条横线按钮），点击展开 dropdown
- 搜索按钮只保留图标，隐藏文字
- 「登录」按钮隐藏

#### 5.2 详情页 header

各详情页（`tools/[slug]`，`trending/[...slug]`，`news/[id]`）的 header 当前有 `padding: '16px 48px'`，改为：

```typescript
padding: 'clamp(12px, 4vw, 48px) clamp(16px, 5vw, 48px)'
// 或在 client 组件中用 useMediaQuery hook
```

#### 5.3 关键断点

- `max-width: 768px`：单列布局，padding 收窄
- `max-width: 480px`：字号缩小，Hero 标题行高调整

**注意：** 各详情页是 Server Component，不能用 JS 读窗口宽度。改用 CSS 方案（`@media` 或 `clamp()`），或将 header 提取到 `'use client'` 子组件。

---

### Task 6 — `/tools` 独立工具列表页

**文件：** 新建 `app/tools/page.tsx`

**目的：** 当前「AI 工具库」导航项指向 `/`，实际上首页是混合页（工具+Trending+资讯）。需要一个专门的工具列表页，支持按分类/定价/国内可用过滤。

**searchParams：** `?cat=chatbot&pricing=Free&china=accessible&q=搜索词`

**页面结构：**

```
Header（与其他页一致）

筛选栏：
  [分类下拉] [定价: 全部/免费/Freemium/付费] [国内可用: 全部/直连/需VPN] [排序: 最新/热门]

工具卡片网格（3列，手机1列）
  每页 24 个，URL pagination: ?page=2

Pagination: 上一页 / 1 2 3 ... / 下一页
```

**需要新增的 query：**

```typescript
// lib/db/queries.ts 新增
export async function loadToolsPage(opts: {
  cat?: string;
  pricing?: string;
  china?: string;
  page?: number;
  pageSize?: number;
}) {
  // WHERE 条件动态组合（Drizzle 的 sql`` + and()）
  // 返回 { items: Tool[], total: number }
}
```

---

### Task 7 — 百度统计接入

**文件：** `app/layout.tsx`

备案完成、站点正式上线后，在 `<head>` 中注入百度统计脚本：

```typescript
// 在 RootLayout 的 <head> 中加：
<Script
  id="baidu-tongji"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?{你的统计ID}";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
    `
  }}
/>
```

统计 ID 通过环境变量注入：`process.env.NEXT_PUBLIC_BAIDU_TONGJI_ID`

---

### Task 8 — 工具使用技巧体系 ⛔ 跳过，功能预留

> **决策：暂不开发，待日活稳定后再启动。设计存档见 GROWTH.md 第十四章。**

---

### Task 9 — AI 资讯中文优先（P1）

**为什么：** 面向国内用户，资讯必须以中文呈现。当前全部来自英文 RSS，国内重要 AI 动态（字节/百度/阿里/腾讯）完全缺失，翻译质量也不稳定。

#### 9.1 补录中文媒体源

在 Neon 控制台执行（执行前先验证 RSS URL 可访问）：

```sql
INSERT INTO sources (name, url, feed_url, lang, active) VALUES
  ('量子位',    'https://www.qbitai.com',     'https://www.qbitai.com/feed',     'zh', true),
  ('机器之心',  'https://www.jiqizhixin.com',  'https://www.jiqizhixin.com/rss',  'zh', true),
  ('少数派',    'https://sspai.com',           'https://sspai.com/feed',          'zh', true),
  ('InfoQ中文', 'https://www.infoq.cn',        'https://www.infoq.cn/feed',       'zh', true),
  ('极客公园',  'https://www.geekpark.net',    'https://www.geekpark.net/rss',    'zh', true),
  ('36氪',      'https://36kr.com',            'https://36kr.com/feed',           'zh', true)
ON CONFLICT (feed_url) DO NOTHING;
```

#### 9.2 更新 `lib/jobs/process-articles.ts`

当前 prompt 假设所有文章都是英文，需要按 `lang` 字段分支：

**查询改动**（需 join sources 获取 lang）：

```typescript
const pending = await db
  .select({
    id: articles.id,
    title: articles.title,
    lang: sources.lang,          // 新增：获取来源语言
  })
  .from(articles)
  .leftJoin(sources, eq(articles.sourceId, sources.id))
  .where(and(eq(articles.status, 'published'), isNull(articles.titleZh)))
  .limit(BATCH);
```

**分支处理逻辑：**

```typescript
// 中文来源：不翻译标题，只生成中文摘要 + 分类标签
const ZH_PROMPT = (title: string) =>
  `你是一位 AI 科技编辑。根据以下中文文章标题，返回 JSON：
- "summaryZh": 一句话中文摘要（≤ 60 字，直接可读，不要「本文」开头）
- "tag": 从以下选一个最匹配的：模型发布、工具更新、行业动态、技术研究、开发者、产品评测、国内动态

只返回 JSON，不要 markdown。

标题：${title}`;

// 英文来源：翻译 + 摘要 + 标签
const EN_PROMPT = (title: string) =>
  `You are a bilingual AI tech editor. Given an English headline, return JSON:
- "titleZh": Chinese translation (≤ 25 chars, natural Chinese phrasing)
- "summaryZh": Chinese summary 1-2 sentences (≤ 60 chars)
- "tag": pick one: 模型发布、工具更新、行业动态、技术研究、开发者、产品评测、国内动态

Return ONLY valid JSON.

Headline: ${title}`;

// 处理逻辑
if (lang === 'zh') {
  const result = await processZh(art.title);   // 调 ZH_PROMPT
  await db.update(articles).set({
    titleZh: art.title,                          // 直接复制，不翻译
    summaryZh: result.summaryZh,
    tag: result.tag,
  }).where(eq(articles.id, art.id));
} else {
  const result = await processEn(art.title);    // 调 EN_PROMPT（现有逻辑）
  await db.update(articles).set({
    titleZh: result.titleZh,
    summaryZh: result.summaryZh,
    tag: result.tag,
  }).where(eq(articles.id, art.id));
}
```

#### 9.3 更新资讯展示

**`app/news/[id]/page.tsx`**（资讯详情页）：

```typescript
// h1 始终用中文标题
<h1>{art.titleZh ?? art.title}</h1>

// 英文副标题：仅英文来源 且 有翻译时才显示
{art.titleZh && art.title !== art.titleZh && (
  <p style={{ color: '#9CA3AF', fontSize: 14 }}>{art.title}</p>
)}

// 摘要区：只显示中文，去掉英文 summary
<p>{art.summaryZh ?? art.title}</p>
```

**`app/news/page.tsx`** 和 **`components/V2Pro.tsx`** 的资讯卡片：
- 标题：`titleZh ?? title`
- 摘要：`summaryZh`（不显示英文 summary）

#### 9.4 标签体系统一为中文

现有 tag 字段来自 `src.name`（媒体名），更新 AI prompt 后改为内容分类。
历史数据可暂时保留，新抓取数据将使用新标签体系。

资讯列表页筛选标签显示中文分类名（而不是媒体名）。

---

## 8. 环境变量

**为什么：** 用户进详情页不只想知道「这是什么」，更想知道「怎么用好它」。
技巧内容页同时截获「ChatGPT 使用技巧」「Midjourney 教程」等高搜索量词。

**版权边界（重要）：** 不存储全文，只存标题 + 编辑自写摘要（100-200字）+ 原文跳链。合理引用，无版权风险。

#### 8.1 建表

```sql
CREATE TABLE tool_tips (
  id           SERIAL PRIMARY KEY,
  tool_id      TEXT NOT NULL REFERENCES tools(id),
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL,       -- 编辑自写，非转载原文
  source_name  TEXT NOT NULL,       -- 如「少数派」「B站-设计师阿杰」
  source_url   TEXT NOT NULL UNIQUE,
  platform     TEXT NOT NULL,       -- 'wechat'|'xiaohongshu'|'zhihu'|'bilibili'|'other'
  tip_type     TEXT NOT NULL DEFAULT 'tutorial',
  -- 'tutorial'|'usecase'|'prompt'|'comparison'
  featured     BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON tool_tips (tool_id, published_at DESC);
```

Drizzle schema 对应追加在 `lib/db/schema.ts`。

#### 8.2 新增查询函数（lib/db/queries.ts）

```typescript
export async function loadTipsByTool(toolId: string, limit = 5) {
  return db
    .select()
    .from(toolTips)
    .where(eq(toolTips.toolId, toolId))
    .orderBy(desc(toolTips.publishedAt))
    .limit(limit);
}

export async function loadLatestTips(limit = 20) {
  // 用于 /learn 汇总页
  return db.select().from(toolTips).orderBy(desc(toolTips.publishedAt)).limit(limit);
}
```

#### 8.3 工具详情页 Tips Section（app/tools/[slug]/page.tsx）

在相关工具区块**之前**插入，有数据才渲染：

```tsx
{tips.length > 0 && (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8D5B7', padding: '32px 40px', marginBottom: 24 }}>
    <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: '#1F2937', margin: '0 0 20px' }}>
      使用技巧 · Tutorials
    </h2>
    {tips.map((tip) => (
      <a key={tip.id} href={tip.sourceUrl} target="_blank" rel="noopener noreferrer"
        style={{ display: 'block', padding: '14px 0', borderBottom: '1px solid #F3E8D0', textDecoration: 'none' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>
          {PLATFORM_ICON[tip.platform]} {tip.title}
        </div>
        <p style={{ fontSize: 13, color: '#4B5563', margin: '0 0 4px', lineHeight: 1.55 }}>{tip.summary}</p>
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{tip.sourceName} · 阅读原文 ↗</span>
      </a>
    ))}
  </div>
)}
```

平台图标映射：
```typescript
const PLATFORM_ICON: Record<string, string> = {
  wechat: '🟩', xiaohongshu: '❤️', zhihu: '🔵',
  bilibili: '📺', other: '📖',
};
```

#### 8.4 后台录入 API（app/api/admin/tips/route.ts）

```typescript
// POST /api/admin/tips
// Header: Authorization: Bearer {CRON_SECRET}
// Body: { toolId, title, summary, sourceUrl, sourceName, platform, tipType, publishedAt }
export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  await db.insert(toolTips).values(body).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}
```

#### 8.5 /learn 页面（新建 app/learn/page.tsx）

SSG + ISR，展示全站最新技巧，按工具分组。
`generateMetadata` title: `「AI 工具使用技巧大全 — 教程、提示词、实战案例」`

#### 8.6 /learn/[tool-id] 页面（新建 app/learn/[id]/page.tsx）

SSG（`generateStaticParams` 来自 `loadAllToolIds`）+ ISR。
这是 SEO 重点页面，`title` 格式：`{工具名} 使用技巧 — 教程 · 提示词 · 实战 | AiToolsBox`

---

## 8. 环境变量

| 变量名 | 用途 | 必须 |
|---|---|---|
| `DATABASE_URL` | Neon Postgres 连接串 | ✅ |
| `ANTHROPIC_API_KEY` | Claude API（AI 摘要/翻译） | ✅ |
| `CRON_SECRET` | cron 路由鉴权 header | ✅ |
| `GITHUB_TOKEN` | GitHub API（可选，有则 5000 req/h 否则 60） | ⬜ |
| `NEXT_PUBLIC_ADS_ENABLED` | 广告开关（'true'/'false'） | ⬜ |
| `NEXT_PUBLIC_BAIDU_TONGJI_ID` | 百度统计 ID | ⬜ |

---

## 9. 常用命令

```bash
# 本地开发
npm run dev

# 类型检查
npx tsc --noEmit

# 数据库 schema 推送（开发环境）
npx drizzle-kit push

# 生成 migration 文件（生产环境用）
npx drizzle-kit generate

# 种子数据
npx tsx lib/db/seed.ts
```

---

## 10. 已知问题 / 技术债

| 问题 | 影响 | 备注 |
|---|---|---|
| 工具数量只有 ~24 条 | 内容稀少，SEO 价值低 | 需运营批量录入，或写爬虫 |
| `publishedAt` 字段是 `text`（不是 `timestamp`） | 排序不准确 | 历史遗留，改动影响面大，暂不动 |
| 首页工具列表无分页 | 工具多后性能下降 | 等工具 > 100 条时处理 |
| `categories.count` 是手动维护的静态值 | 不准确 | 应改为 JOIN 计算，低优先 |
| 搜索用 ILIKE，无全文索引 | 慢查询（工具多后） | 加 GIN 索引或换 Meilisearch |

---

*文档版本：v1.0 — 2026-05-01*
*作者：设计/需求方，代码交接给 Codex*
