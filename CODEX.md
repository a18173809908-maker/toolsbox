# AiToolsBox — Codex 技术交接文档

> 本文是给 Codex 的完整上下文包。读完此文件即可独立接手开发，无需额外沟通。
> 策略与运营背景见 [GROWTH.md](GROWTH.md)，开发进度见 [ai_tools_full_plan.md](ai_tools_full_plan.md)。

---

## Codex 实施状态更新（2026-05-02）

> 下面是 Codex 已经落地并推送到 `main` 的变更，包含和原计划不同的实际决策。Claude Code 接手时以本节为准，避免重复执行旧 SQL 或继续追不可用源。

### 已完成并推送

- **Bug 0：`vercel.json` 已创建并推送。**
  - 文件：`vercel.json`
  - 当前包含 3 个 Vercel Cron：`/api/cron/refresh-trending`、`/api/cron/refresh-articles`、`/api/cron/refresh-tools`
  - 注意：Vercel Hobby 计划的 Cron 频率有限制，所以 Vercel Cron 作为每日备份触发；更高频触发由 GitHub Actions 负责。

- **Bug 1：首页无效 “Load more / 加载更多” 按钮已移除。**
  - 文件：`components/V2Pro.tsx`

- **Bug 2：分类数量已改为真实 tools 统计。**
  - 文件：`lib/db/queries.ts`
  - 实现方式：在 `loadHomepageData()` 中按实际 `tools` 数据聚合分类数量，并覆盖静态 `categories.count`。
  - 与原计划差异：没有使用 SQL `leftJoin + COUNT`，但显示结果已来自真实工具数据。

- **Task 0：全局共用顶栏 `SiteHeader` 已完成。**
  - 文件：`components/SiteHeader.tsx`
  - 已接入：首页、`/trending`、`/trending/[...slug]`、`/tools/[slug]`、`/news`、`/news/[id]`、`/categories/[id]`

- **Task 3：工具详情页 v2 已完成。**
  - 文件：`app/tools/[slug]/page.tsx`
  - 已包含真实官网 URL、国内可用 badge、features、扩展信息栏、SEO metadata 增强、`BreadcrumbList` JSON-LD。

- **Task 4：GitHub 仓库详情页 v2 已完成。**
  - 文件：`app/trending/[...slug]/page.tsx`、`lib/github.ts`、`app/globals.css`
  - 已接 GitHub API，渲染 topics、homepage、license、forks、最近更新时间、README HTML。
  - README 使用 `marked + sanitize-html` 渲染，并通过 `.readme-content` 做样式隔离。

- **Task 9：AI 资讯中文优先已完成。**
  - 文件：`lib/jobs/process-articles.ts`、`scripts/seed-sources.ts`
  - 已按 `sources.lang` 分支处理：
    - 中文源：`titleZh = 原标题`，只生成中文摘要和中文标签。
    - 英文源：翻译标题，生成英文摘要、中文摘要和中文标签。
  - 已执行 `npm run seed:sources`，中文源已入库并验证抓取。
  - 已执行 `npm run fetch:articles`，本次成功新增 107 篇文章。
  - 已执行 `npm run process:articles`，一次处理 10 篇，`skipped: 0`。

- **Task 10：工具自动发现管道第一版已完成。**
  - 文件：`lib/jobs/fetch-tool-candidates.ts`、`lib/jobs/process-tool-candidates.ts`、`app/api/cron/refresh-tools/route.ts`
  - 新增 DB：`sources.type`、`tool_candidates`
  - 已执行 `npm run db:push`
  - 已执行 `npm run seed:tool-sources`
  - 已执行 `npm run fetch:tool-candidates`，成功插入 70 条候选工具。
  - 注意：没有手动执行 `npm run process:tool-candidates`，避免立即批量发布候选工具到正式 `tools` 表。

### 数据源实际决策

- **中文新闻源已入库：** 量子位、少数派、InfoQ 中文、极客公园、36氪。
- **机器之心暂未入库：** 实测 `https://www.jiqizhixin.com/rss` 返回 HTML，不是有效 RSS，放入会导致定时任务持续报错。
- **工具发现源已替换：**
  - 原计划 `theresanaiforthat` 实测 403。
  - 原计划 `futurepedia` 实测 404。
  - 原计划 `aitoolsdirectory` 实测 fetch failed。
  - 当前使用已验证可抓取的 3 个源：DreyX AI Digest、Insidr AI Tools、Planet AI。

### 不需要再手动做的运营 SQL

- 不需要在 Neon 控制台手动执行 Task 9 的中文新闻源 SQL；`npm run seed:sources` 已执行。
- 不需要在 Neon 控制台手动执行 Task 10 的工具源 SQL；`npm run seed:tool-sources` 已执行，并且旧源已替换为可用源。

---

## 0. 最高优先级紧急修复 🚨

### Task 0 — 全局共用顶栏（所有内页导航缺失）

**问题：** 用户进入 `/trending`、`/trending/[repo]`、`/tools/[slug]`、`/news/[id]`、`/categories/[id]` 后，顶部只有面包屑（如「AiToolsBox / GitHub 趋势」），**没有完整导航栏**。用户无法快速切换到其他频道，体验极差，等同于被困在孤岛里。

**截图描述：** GitHub 趋势列表页顶栏只显示「A AiToolsBox / GitHub 趋势」，没有「首页 / GitHub趋势 / AI资讯」三个导航入口。

**目标：** 所有页面顶栏统一为完整导航，与首页一致：

```
[Logo AiToolsBox]   首页   GitHub 趋势   AI 资讯   [⌘K 搜索]
```

#### 解决方案

**新建 `components/SiteHeader.tsx`（`'use client'`）**

把首页 `V2Pro.tsx` 中 `TopBar` 组件的逻辑提取为独立文件，供所有页面共用。

```typescript
// components/SiteHeader.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { v2Tokens as T } from '@/lib/tokens';

export function SiteHeader({ onOpenPalette }: { onOpenPalette?: () => void }) {
  const pathname = usePathname();
  const navItems: [string, string][] = [
    ['首页', '/'],
    ['GitHub 趋势', '/trending'],
    ['AI 资讯', '/news'],
  ];
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 48px', borderBottom: `1px solid ${T.rule}`,
      background: T.panel, position: 'sticky', top: 0, zIndex: 10,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `linear-gradient(135deg, ${T.primary} 0%, #FBBF24 100%)`,
          display: 'grid', placeItems: 'center', color: '#fff',
          fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 17, fontStyle: 'italic',
        }}>A</div>
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18, color: T.ink }}>AiToolsBox</span>
      </Link>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 4, fontSize: 14 }}>
        {navItems.map(([label, href]) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{
              padding: '6px 14px', borderRadius: 6, textDecoration: 'none',
              color: active ? T.ink : T.inkSoft,
              fontWeight: active ? 600 : 500,
              background: active ? T.primaryBg : 'transparent',
            }}>{label}</Link>
          );
        })}
      </nav>

      {/* Search */}
      {onOpenPalette ? (
        <button onClick={onOpenPalette} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px',
          background: T.bg, borderRadius: 8, border: `1px solid ${T.rule}`,
          fontSize: 13, color: T.inkMuted, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span>⌕</span><span>搜索…</span>
          <span style={{ marginLeft: 4, fontSize: 11, color: T.inkMuted }}>⌘K</span>
        </button>
      ) : (
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px',
          background: T.bg, borderRadius: 8, border: `1px solid ${T.rule}`,
          fontSize: 13, color: T.inkMuted, textDecoration: 'none',
        }}>⌕ 搜索</Link>
        // 内页点搜索跳回首页，首页再打开 ⌘K（简单方案，无需复杂状态）
      )}
    </header>
  );
}
```

#### 各页面替换

用 `<SiteHeader />` 替换以下页面中现有的简化 header：

| 文件 | 当前 header | 改为 |
|---|---|---|
| `app/trending/page.tsx` | `<header>` 含面包屑 | `<SiteHeader />` |
| `app/trending/[...slug]/page.tsx` | `<header>` 含面包屑 | `<SiteHeader />` + 面包屑移到 `<main>` 内 |
| `app/tools/[slug]/page.tsx` | `<header>` 含面包屑 | `<SiteHeader />` + 面包屑移到 `<main>` 内 |
| `app/news/page.tsx` | `<header>` 含面包屑 | `<SiteHeader />` |
| `app/news/[id]/page.tsx` | `<header>` 含面包屑 | `<SiteHeader />` + 面包屑移到 `<main>` 内 |
| `app/categories/[id]/page.tsx` | `<header>` 含面包屑 | `<SiteHeader />` + 面包屑移到 `<main>` 内 |

面包屑不删，移到 `<main>` 顶部作为页面内的位置提示（小字灰色）。

#### V2Pro.tsx 同步

`V2Pro.tsx` 中的 `TopBar` 组件改为直接渲染 `<SiteHeader onOpenPalette={onOpenPalette} />`，不再重复写导航逻辑。

#### 注意事项

- `SiteHeader` 是 `'use client'`（用了 `usePathname`），可以直接在 Server Component 页面中 import 使用
- 搜索按钮：首页传 `onOpenPalette` 回调打开 ⌘K 面板；内页不传，点击用 `<Link href="/">` 跳回首页（用户在首页可以立即用 ⌘K）
- `position: sticky; top: 0` 保持所有页面顶栏固定

---

### Bug 1 — 「加载更多」按钮无效且不该显示 🐛

**位置：** `components/V2Pro.tsx`，工具列表区底部的 "Load more · 加载更多" 按钮

**问题：**
1. 点击无响应——按钮存在但没有实现加载逻辑
2. 当前工具总数只有 24 条，已全部显示，不应该出现该按钮

**修复方案：**

工具列表当前实现是把所有工具一次性渲染，没有真正的分页。两种选择：

- **方案 A（简单，推荐）：** 直接隐藏按钮。在工具总数 ≤ 已显示数量时不渲染。
  ```typescript
  // 在 V2Pro.tsx 中，找到渲染 "Load more" 的地方
  // 加条件：只有 tools.length > visibleCount 时才显示
  {tools.length > visibleCount && (
    <button onClick={() => setVisibleCount(v => v + 12)}>
      Load more · 加载更多
    </button>
  )}
  ```
  同时把初始 `visibleCount` 设为足够大（如 100），或直接移除分批显示逻辑，全量渲染（24 条不影响性能）。

- **方案 B（完整实现）：** 工具数量增长后再做真正的虚拟滚动/分页，目前工具少，暂不必要。

**结论：选方案 A，工具 < 100 条时直接全量渲染，移除加载更多按钮。**

---

### Bug 0 — 缺少 `vercel.json`，所有定时任务从未自动执行 🚨

**发现：** 项目中根本没有 `vercel.json` 文件。

**影响：**
- `app/api/cron/github-trending/route.ts` — 路由存在，但从未自动触发过
- `app/api/cron/refresh-articles/route.ts` — 路由存在，但从未自动触发过
- GitHub 趋势数据从未自动更新
- 新闻文章从未自动抓取

**修复：** 在项目根目录新建 `vercel.json`：

```json
{
  "crons": [
    {
      "path": "/api/cron/github-trending",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/refresh-articles",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

- GitHub Trending：每 6 小时更新一次（`0 */6 * * *`）
- 新闻抓取：每 4 小时一次（`0 */4 * * *`）
- 所有 cron 路由都有 `Authorization: Bearer {CRON_SECRET}` 鉴权，Vercel 会自动在请求头中携带

**验证：** 部署后在 Vercel Dashboard → Crons 面板可以看到两个定时任务已注册，并可手动触发测试。

> ⚠️ 注意：Vercel cron 免费计划只支持最小间隔 1 天（daily）。如果需要每 4/6 小时，需升级到 Pro 计划，或将两个路由合并为一个每天跑一次的 cron（日触发：`0 6 * * *`）。目前先按 4h/6h 写，实际执行频率视 Vercel 计划而定。

---

### 说明 — 工具数量为何一直是 24 条

**结论：工具没有自动抓取，不会自动增加。**

工具数据来自 `lib/db/seed.ts` 手动录入的种子数据，共 24 条。没有工具爬虫或自动发现管道。

要增加工具数量，只能：
1. 手动往 `lib/db/seed.ts` 补充工具数据，然后重新执行 `npx tsx lib/db/seed.ts`
2. 或在 Neon 控制台直接 INSERT

Task 9（中文新闻）的 SQL 也尚未执行——中文 RSS 源还没有插入 sources 表。

---

### Bug 2 — 分类统计数量显示不正确 🐛

**位置：** `components/V2Pro.tsx` CategoryStrip，以及首页各分类 pill 后的数字（如「图像生成 218」）

**问题：** 显示的是 `lib/data.ts` 中 `CATEGORIES` 数组里**硬编码的静态数字**（218、189、167…），不是数据库中该分类下实际工具数量。

当前实际工具只有 24 条，但显示 218 / 189 / 167 等虚假数字，严重误导用户。

**根源：**
```typescript
// lib/data.ts — 静态种子数据，count 是假的
{ id: 'image', en: 'Image Generation', zh: '图像生成', icon: '🎨', count: 218 }
```

数据库中 `categories.count` 字段也是手动维护的静态值（从 seed.ts 写入），没有动态计算。

**修复方案：**

在 `loadHomepageData()` 查询中，用 JOIN + COUNT 替换静态 count：

```typescript
// lib/db/queries.ts — loadHomepageData 中替换 categories 查询
const cats = await db
  .select({
    id: categories.id,
    en: categories.en,
    zh: categories.zh,
    icon: categories.icon,
    count: count(tools.id),   // 实际计算，不用 categories.count
  })
  .from(categories)
  .leftJoin(tools, eq(tools.catId, categories.id))
  .groupBy(categories.id, categories.en, categories.zh, categories.icon)
  .orderBy(desc(count(tools.id)));
```

`categories.count` 静态字段可以保留（历史用途），但展示时改用动态 count。

`loadCategoryById` 同理，需要同步更新。

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

**为什么：** 国内用户 70%+ 手机访问。当前所有页面用固定 `padding: '18px 56px'` 等硬编码值，手机上内容严重溢出。

**技术策略：**
- `V2Pro.tsx` 已是 `'use client'`，用 `useIsMobile()` hook（监听 `window.innerWidth < 768`）控制样式分支
- 各详情页是 Server Component，用 CSS `clamp()` 值处理 padding/font-size，无需 JS
- 布局折叠（两列→单列）在 `app/globals.css` 用 `@media` 实现

**断点：** 手机 `< 768px`，平板 `768px ~ 1024px`，桌面 `> 1024px`

---

#### 5.1 `components/V2Pro.tsx` 改动清单

在文件顶部加 `useIsMobile` hook：
```typescript
function useIsMobile() {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}
```

**TopBar**（当前 `padding: '18px 56px'`）：
- 手机：`padding: '14px 20px'`
- 手机：导航 `<nav>` 隐藏，换成汉堡按钮 `☰`，点击展开一个全宽 dropdown
- 手机：搜索按钮只保留 `⌕` 图标，隐藏文字和 `⌘K` 提示
- 手机：「登录」按钮隐藏

**Hero section**（当前 `padding: '64px 56px 48px'`，h1 `fontSize: 84`）：
- 手机：`padding: '36px 20px 28px'`
- 手机：h1 `fontSize: 40`，`lineHeight: 1.1`
- 手机：副标题 `fontSize: 15`，隐藏英文副标题那行
- 手机：搜索框 `maxWidth: '100%'`，Search 按钮改为图标

**CategoryStrip**（当前 `padding: '16px 56px'`）：
- 手机：`padding: '12px 16px'`
- 横向滚动保留，加 `-webkit-overflow-scrolling: touch`

**主内容区**（当前 `padding: '48px 56px'`，`gridTemplateColumns: '1fr 360px'`）：
- 手机：`padding: '20px 16px'`
- 手机：`gridTemplateColumns: '1fr'`（单列，右侧 GitHub 趋势栏移到工具列表下方）

**Featured 卡片网格**（当前 `gridTemplateColumns: 'repeat(3, 1fr)'`）：
- 手机：`gridTemplateColumns: '1fr'`
- 平板：`gridTemplateColumns: 'repeat(2, 1fr)'`

**Footer**（当前 `padding: '48px 56px 36px'`，横排两列）：
- 手机：`padding: '32px 20px 24px'`，改为纵向排列（`flexDirection: 'column'`，`gap: 16`）

---

#### 5.2 详情页（Server Components）改动清单

**所有详情页 header**（`tools/[slug]`、`trending/[...slug]`、`news/[id]`、`trending/page.tsx`）
当前：`padding: '16px 48px'`
改为：`padding: 'clamp(12px, 2vw, 16px) clamp(16px, 5vw, 48px)'`

**所有详情页 `<main>`**（当前 `padding: '0 24px 64px'`）
这个值手机上 OK，不用改。

**Hero 卡片内部**（当前 `padding: '36px 40px'`）
改为：`padding: 'clamp(20px, 4vw, 36px) clamp(16px, 5vw, 40px)'`

**Info grid**（当前 `gridTemplateColumns: '1fr 1fr'`）
在 `app/globals.css` 加：
```css
@media (max-width: 480px) {
  .info-grid { grid-template-columns: 1fr !important; }
}
```
或直接改为 `gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))'`（无需 media query）

---

#### 5.3 `app/globals.css` 补充

```css
/* 移动端基础重置 */
@media (max-width: 768px) {
  /* 防止横向溢出 */
  body { overflow-x: hidden; }
}

/* README 渲染区（GitHub 详情页）手机端处理 */
@media (max-width: 768px) {
  .readme-content pre { font-size: 12px; }
  .readme-content table { display: block; overflow-x: auto; }
}
```

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

### Task 10 — 工具自动发现管道（Auto Tool Discovery）⭐ 高优先

**为什么：** 工具数量永远卡在 24 条是因为没有任何抓取管道。本任务建立一套与资讯抓取完全对称的自动发现流程：订阅专门的 AI 工具目录 RSS → AI 富化（中文描述 + 分类 + 国内访问判断）→ 自动发布到工具库。

---

#### 10.1 数据源

以下 RSS 源**无需 API Key**，每天发布新 AI 工具，可直接订阅：

| 来源 | 状态 | 说明 |
|---|---|---|
| DreyX AI Digest | ✅ 已入库，实测可抓取 | 已通过 `npm run seed:tool-sources` 录入 |
| Insidr AI Tools | ✅ 已入库，实测可抓取 | 已通过 `npm run seed:tool-sources` 录入 |
| Planet AI | ✅ 已入库，实测可抓取 | 已通过 `npm run seed:tool-sources` 录入 |
| There's An AI For That | ❌ 实测 403，不可用 | 已废弃 |
| Futurepedia | ❌ 实测 404，不可用 | 已废弃 |
| AI Tools Directory | ❌ fetch 失败，不可用 | 已废弃 |

> 2026-05-02 已执行 `npm run fetch:tool-candidates`，成功插入 70 条候选工具。管道有输入，每日凌晨 3 点 cron 自动处理。

以上源添加到 `sources` 表时 `lang='en'`，并加一个新字段 `type='tool'`（见下文 Schema 改动）。

**国内 AI 工具补充（中文来源）：**

下列站点目前没有标准 RSS，先跳过，后续专项处理：
- ai-bot.cn（国内 AI 工具聚合，可考虑定期全量抓取页面）

---

#### 10.2 Schema 改动

**`sources` 表新增 `type` 字段**，区分「资讯源」和「工具源」：

```sql
ALTER TABLE sources ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'news';
-- 取值: 'news' | 'tool'
```

Drizzle schema 对应追加：
```typescript
type: text('type').notNull().default('news'),
```

**新建 `tool_candidates` 表**（工具暂存区，AI 富化前的原始数据）：

```sql
CREATE TABLE tool_candidates (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  url          TEXT NOT NULL UNIQUE,
  description  TEXT,
  -- AI 富化结果
  slug         TEXT UNIQUE,          -- 将成为 tools.id
  zh           TEXT,                 -- 中文描述
  cat_id       TEXT,                 -- 对应 categories.id
  china_access TEXT DEFAULT 'unknown',
  pricing      TEXT DEFAULT 'Freemium',
  features     TEXT[],
  -- 来源元数据
  source_name  TEXT NOT NULL,        -- 来源名称
  source_type  TEXT NOT NULL DEFAULT 'rss',
  votes        INTEGER DEFAULT 0,    -- 来源站的热度分（有则取）
  -- 处理状态
  status       TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' → 'enriched' → 'published' | 'rejected'
  fetched_at   TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE INDEX ON tool_candidates (status);
CREATE INDEX ON tool_candidates (fetched_at DESC);
```

Drizzle schema 新增（`lib/db/schema.ts`）：

```typescript
export const toolCandidates = pgTable(
  'tool_candidates',
  {
    id:          serial('id').primaryKey(),
    name:        text('name').notNull(),
    url:         text('url').notNull().unique(),
    description: text('description'),
    slug:        text('slug').unique(),
    zh:          text('zh'),
    catId:       text('cat_id'),
    chinaAccess: text('china_access').default('unknown'),
    pricing:     text('pricing').default('Freemium'),
    features:    text('features').array(),
    sourceName:  text('source_name').notNull(),
    sourceType:  text('source_type').notNull().default('rss'),
    votes:       integer('votes').default(0),
    status:      text('status').notNull().default('pending'),
    fetchedAt:   timestamp('fetched_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
  },
  (t) => ({
    statusIdx: index('tool_candidates_status_idx').on(t.status),
  }),
);
```

---

#### 10.3 新建 `lib/jobs/fetch-tools.ts`

与 `fetch-articles.ts` 完全对称，只抓 `type='tool'` 的源：

```typescript
import { load } from 'cheerio';
import { db } from '@/lib/db';
import { sources, toolCandidates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface ParsedTool {
  name: string;
  url: string;
  description?: string;
  votes?: number;
}

function parseToolFeed(xml: string): ParsedTool[] {
  const $ = load(xml, { xmlMode: true });
  const items: ParsedTool[] = [];

  $('item, entry').each((_, el) => {
    const title = $(el).children('title').text().trim();
    const link  = $(el).children('link').text().trim()
                  || $(el).children('link').attr('href') || '';
    const desc  = $(el).children('description, summary, content').text().trim();
    if (title && link) {
      items.push({ name: title, url: link, description: desc || undefined });
    }
  });

  return items.slice(0, 50); // 每源最多取 50 条
}

export async function fetchNewTools() {
  const toolSources = await db
    .select()
    .from(sources)
    .where(eq(sources.type, 'tool')); // ← 只取工具源

  const results = [];

  for (const src of toolSources) {
    try {
      const res = await fetch(src.feedUrl, {
        headers: { 'User-Agent': 'AiToolsBox/1.0 tool-discovery' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const xml = await res.text();
      const parsed = parseToolFeed(xml);

      let inserted = 0;
      for (const tool of parsed) {
        const result = await db
          .insert(toolCandidates)
          .values({
            name: tool.name,
            url: tool.url,
            description: tool.description,
            sourceName: src.name,
            votes: tool.votes ?? 0,
          })
          .onConflictDoNothing(); // URL 去重
        if (result.rowCount && result.rowCount > 0) inserted++;
      }

      results.push({ source: src.name, inserted });
    } catch (err) {
      results.push({ source: src.name, inserted: 0, error: String(err) });
    }
  }

  return results;
}
```

---

#### 10.4 新建 `lib/jobs/process-tools.ts`

对 `status='pending'` 的候选工具进行 AI 富化，然后自动发布到 `tools` 表。

```typescript
import { db } from '@/lib/db';
import { tools, toolCandidates, categories } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { chat } from '@/lib/llm';

const BATCH = 5; // 每次处理 5 条，控制 Claude API 消耗

// 从数据库获取现有分类 ID 列表（用于约束 AI 输出）
async function getCategoryIds(): Promise<string[]> {
  const cats = await db.select({ id: categories.id }).from(categories);
  return cats.map(c => c.id);
}

// 根据 URL 推断国内访问情况（规则优先，无需 AI）
function inferChinaAccess(url: string): 'accessible' | 'vpn-required' | 'unknown' {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    // 中国域名 → 直连
    if (domain.endsWith('.cn') || domain.endsWith('.com.cn')) return 'accessible';
    // 已知国内可用的产品域名关键词
    const cnProducts = ['kimi', 'moonshot', 'zhipuai', 'zhipu', 'wenxin', 'qianfan',
      'tongyi', 'baidu', 'aliyun', 'alibaba', 'tencent', 'bytedance',
      'deepseek', 'minimax', '01.ai', 'sensetime'];
    if (cnProducts.some(k => domain.includes(k))) return 'accessible';
    // 默认：国外工具需要 VPN
    return 'vpn-required';
  } catch {
    return 'unknown';
  }
}

// 将工具名转为 slug：ChatGPT → chatgpt，Stable Diffusion → stable-diffusion
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

interface AiToolResult {
  catId: string;
  zh: string;           // 中文描述（≤ 60 字）
  pricing: 'Free' | 'Freemium' | 'Paid';
  features: string[];   // 3~5 条核心功能，中文
}

async function enrichTool(name: string, description: string, catIds: string[]): Promise<AiToolResult | null> {
  const prompt = `你是一位 AI 工具编辑，专注于为中国用户介绍 AI 产品。

请根据以下 AI 工具信息，返回 JSON：
- "catId": 从这些分类中选一个最匹配的 id：${catIds.join(', ')}
- "zh": 中文简介（≤60字，通俗易懂，突出核心功能，不要翻译腔）
- "pricing": 定价模型，只能是 "Free"、"Freemium" 或 "Paid" 之一
- "features": 3~5条核心功能亮点，中文，每条 ≤15 字，数组格式

只返回 JSON，不要 markdown 代码块。

工具名：${name}
英文描述：${description?.slice(0, 400) || '（无）'}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { maxTokens: 512 });
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as AiToolResult;
    if (!parsed.catId || !catIds.includes(parsed.catId)) return null;
    if (!parsed.zh) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function processToolCandidates() {
  const catIds = await getCategoryIds();

  const pending = await db
    .select()
    .from(toolCandidates)
    .where(eq(toolCandidates.status, 'pending'))
    .limit(BATCH);

  let processed = 0;
  let skipped = 0;

  for (const candidate of pending) {
    const result = await enrichTool(
      candidate.name,
      candidate.description ?? '',
      catIds,
    );

    if (!result) {
      // AI 失败：标记为 rejected，避免反复重试
      await db.update(toolCandidates)
        .set({ status: 'rejected' })
        .where(eq(toolCandidates.id, candidate.id));
      skipped++;
      continue;
    }

    const chinaAccess = inferChinaAccess(candidate.url ?? '');
    const slug = toSlug(candidate.name);

    // 更新 candidate
    await db.update(toolCandidates)
      .set({
        slug,
        zh: result.zh,
        catId: result.catId,
        chinaAccess,
        pricing: result.pricing,
        features: result.features,
        status: 'enriched',
      })
      .where(eq(toolCandidates.id, candidate.id));

    // 直接发布到 tools 表
    // 注意：若 slug 冲突则在末尾加 id 确保唯一
    const finalSlug = slug + '-' + candidate.id; // 安全 slug，防重复
    await db.insert(tools).values({
      id: finalSlug,
      name: candidate.name,
      mono: candidate.name.toUpperCase().slice(0, 12),
      brand: '#6B7280',         // 默认灰色，可后续手动修改
      catId: result.catId,
      en: candidate.description?.slice(0, 200) ?? candidate.name,
      zh: result.zh,
      pricing: result.pricing,
      url: candidate.url,
      chinaAccess,
      features: result.features,
      featured: false,
      publishedAt: new Date().toISOString().slice(0, 10),
    }).onConflictDoNothing(); // id 冲突时跳过（幂等）

    // 标记为已发布
    await db.update(toolCandidates)
      .set({ status: 'published', publishedAt: new Date() })
      .where(eq(toolCandidates.id, candidate.id));

    processed++;
  }

  return { processed, skipped };
}
```

---

#### 10.5 新建 `app/api/cron/fetch-tools/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchNewTools } from '@/lib/jobs/fetch-tools';
import { processToolCandidates } from '@/lib/jobs/process-tools';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 先抓取新工具候选
  const fetchResults = await fetchNewTools();
  // 再对 pending 候选做 AI 富化 + 发布
  const processResult = await processToolCandidates();

  return NextResponse.json({ fetch: fetchResults, process: processResult });
}
```

---

#### 10.6 更新 `vercel.json`（在 Bug 0 的基础上追加）

```json
{
  "crons": [
    {
      "path": "/api/cron/github-trending",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/refresh-articles",
      "schedule": "0 */4 * * *"
    },
    {
      "path": "/api/cron/fetch-tools",
      "schedule": "0 8 * * *"
    }
  ]
}
```

工具发现每天早上 8 点（UTC）跑一次，一次最多处理 5 条，每天稳定增加 5 个新工具。

---

#### 10.7 初始化：将工具 RSS 源插入 sources 表

✅ **已完成（2026-05-02）**：执行 `npm run seed:tool-sources` 录入了 DreyX AI Digest、Insidr AI Tools、Planet AI 三个可用源，随后执行 `npm run fetch:tool-candidates` 插入 70 条候选工具。

**未来新增源注意事项：**

原设计文档中的三个源实测均不可用：
- theresanaiforthat.com → 403
- futurepedia.io → 404
- aitoolsdirectory.com → fetch 失败

新增工具 RSS 源前**必须先验证 feedUrl 可正常返回 XML**，再插入 sources 表（`type='tool'`）。脚本入口：`npm run seed:tool-sources`（需更新脚本内容）。

---

#### 10.8 注意事项

1. **slug 唯一性**：目前用 `slug + '-' + id` 保证唯一，外观不完美（如 `chatgpt-42`）。后续可以写去重逻辑：先尝试不带数字的 slug，冲突才加后缀。

2. **brand 颜色**：自动抓取的工具全部用 `#6B7280`（中性灰）。运营后续可在管理页批量修改。

3. **内容质量**：来自 RSS 的描述质量参差不齐，AI 富化会尽力。如果 Claude 连续 3 次返回非法 JSON，当前实现直接 reject。可以后续在 candidates 表里手动审核 rejected 条目。

4. **API 消耗**：BATCH=5，每天一次 cron，每天最多 5 次 Claude 调用（每次约 512 tokens），成本极低。若需更快积累，可把 BATCH 调到 20~50，但每天抓到的新工具也就那么多。

5. **`fetch-articles.ts` 不受影响**：`loadSources()` 现在需要加 `type='news'` 过滤，否则工具源也会被当作资讯源处理。务必同步更新：
   ```typescript
   // lib/db/queries.ts — loadSources() 改为：
   export async function loadSources() {
     return db.select().from(sources)
       .where(and(eq(sources.active, true), eq(sources.type, 'news')));
   }
   ```
   新增一个对应函数：
   ```typescript
   export async function loadToolSources() {
     return db.select().from(sources)
       .where(and(eq(sources.active, true), eq(sources.type, 'tool')));
   }
   ```
   在 `fetch-tools.ts` 中调 `loadToolSources()`（而非 `loadSources()`）。

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
