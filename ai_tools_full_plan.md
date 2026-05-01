# 🛠 AiToolsBox (aiboxpro.cn) — 开发计划清单

> **策略文档见** [GROWTH.md](GROWTH.md)。本文只回答一件事：**怎么落地，当前进展如何。**
> 状态图例：✅ 已完成 | 🚧 进行中 | ⬜ 未开始 | ❌ 已取消/降优先级

---

## 当前部署信息

| 项目 | 内容 |
|---|---|
| 目标域名 | `aiboxpro.cn`（已注册，需绑定 Vercel） |
| 临时域名 | `toolsbox-six.vercel.app` |
| 运行时 | Next.js App Router + Drizzle ORM + Neon Postgres |
| 部署平台 | Vercel |

---

## Phase 0 — 工程基建

- ✅ Next.js 初始化（App Router + TypeScript）
- ✅ Drizzle ORM + Neon Postgres 接入
- ✅ 环境变量配置（`.env.local`）
- ✅ Vercel 部署 CI/CD
- ⬜ 错误监控（Sentry）
- ⬜ 提交规范（commitlint + husky）

---

## Phase 1 — MVP 内容骨架

### 1-A 数据库 Schema

- ✅ `tools` 表（name, cat, pricing, en, zh, mono, brand, featured, date）
- ✅ `articles` 表（title, titleZh, url, summary, summaryZh, tag, source, publishedAt）
- ✅ `githubTrending` 表（repo, lang, stars, gained, period, scrapedAt）
- ✅ `sources` 表（RSS 源管理）
- ✅ **tools 表扩展字段**（url, chinaAccess, chineseUi, freeQuota, apiAvailable, openSource, githubRepo, features, pricingDetail, alternatives, upvotes, downvotes）
  ```sql
  ALTER TABLE tools ADD COLUMN url              TEXT;
  ALTER TABLE tools ADD COLUMN china_access     TEXT DEFAULT 'unknown';
  -- 取值: 'yes' | 'no' | 'vpn' | 'unknown'
  ALTER TABLE tools ADD COLUMN chinese_ui       BOOLEAN DEFAULT FALSE;
  ALTER TABLE tools ADD COLUMN free_quota       TEXT;        -- 如 "每月 50 次"
  ALTER TABLE tools ADD COLUMN api_available    BOOLEAN DEFAULT FALSE;
  ALTER TABLE tools ADD COLUMN open_source      BOOLEAN DEFAULT FALSE;
  ALTER TABLE tools ADD COLUMN github_repo      TEXT;        -- 如 "openai/whisper"
  ALTER TABLE tools ADD COLUMN features         TEXT[];      -- 功能亮点数组
  ALTER TABLE tools ADD COLUMN pricing_detail   TEXT;        -- 详细定价说明
  ALTER TABLE tools ADD COLUMN alternatives     TEXT[];      -- 平替工具 id 数组
  ALTER TABLE tools ADD COLUMN upvotes          INTEGER DEFAULT 0;
  ALTER TABLE tools ADD COLUMN downvotes        INTEGER DEFAULT 0;
  ```

### 1-B 数据采集

- ✅ GitHub Trending 爬虫（每日 today/week/month）
- ✅ RSS 资讯抓取 + AI 摘要（中英双语）
- ⬜ **中文资讯源补录**（P1，见 CODEX.md Task 9）
  - 量子位 / 机器之心 / 少数派 / InfoQ中文 / 极客公园 / 36氪
  - 执行前验证 RSS URL 可用性
- ⬜ **`process-articles.ts` 按 lang 分支处理**（P1）
  - 中文源：直接用原标题，只生成中文摘要 + 标签
  - 英文源：翻译标题 + 生成摘要 + 标签
  - 标签体系统一为中文分类（模型发布/工具更新/行业动态等）
- ⬜ 链接健康度巡检（每周 HEAD 检查，标记死链）
- ⬜ 工具 `china_access` 字段批量补录（运营任务，非开发任务）

### 1-C API 层

- ✅ `GET /api/search?q=` — 工具 + 资讯全文搜索
- ⬜ `GET /api/tools?cat=&pricing=&china=&page=` — 带过滤的分页列表
- ⬜ `GET /api/trending?period=&lang=` — Trending 列表 API
- ⬜ `POST /api/tools/submit` — 用户提交工具（Phase 2）

### 1-D 前端页面

**已完成：**
- ✅ 首页（`/`）— 工具卡片 + GitHub Trending + 资讯 + ⌘K 搜索
- ✅ 资讯列表页（`/news`）— 标签筛选 + 卡片列表
- ✅ 资讯详情页（`/news/[id]`）— 双语标题 + 摘要 + 原文链接 + JSON-LD
- ✅ 分类页（`/categories/[id]`）— 该分类下所有工具
- ✅ 工具详情页（`/tools/[slug]`）— 简介 + 信息格 + 相关工具
- ✅ GitHub 仓库详情页（`/trending/[...slug]`）— 描述 + Stars + 访问/下载

**待完成：**
- ⬜ `/trending` 列表页（Trending 汇总入口，目前只有详情页，导航无处落地）
- ⬜ 工具详情页 v2（接入 `url` 字段 → 真实官网按钮；展示「国内可用」标签）
- ⬜ GitHub 详情页 v2（调 GitHub API 渲染 README；展示 Topics/License）
- ⬜ 资讯详情页 v2（加「相关工具」推荐模块）

### 1-E SEO 基础设施

- ✅ `app/sitemap.ts` — 工具页 + 资讯页 + 分类页自动生成
- ✅ `app/og/route.tsx` — 动态 OG 封面图（工具/资讯/默认三种模板）
- ✅ 各页 `generateMetadata` — title / description / openGraph / twitter
- ✅ 工具详情页 `SoftwareApplication` JSON-LD
- ✅ 资讯详情页 `NewsArticle` JSON-LD
- ⬜ `robots.txt`（屏蔽 `/api/`，允许百度爬虫）
- ⬜ GitHub 详情页 / Trending 列表页加入 sitemap
- ⬜ 分类页 `ItemList` JSON-LD
- ⬜ 面包屑 `BreadcrumbList` JSON-LD（工具/资讯/仓库详情页）
- ⬜ 百度收录验证（`baidu-site-verification` meta tag）

### 1-F 导航与全局体验

- ✅ 顶部导航（首页 + AI 资讯）
- ⬜ **导航栏扩展**（高优先，影响 SEO 内链与用户发现路径）
  - 加入：工具库（`/`）、AI 资讯（`/news`）、GitHub 趋势（`/trending`）、分类（`/categories`）
  - 活跃态改用 `usePathname()`，替换当前 `window.location.pathname`（SSR 安全）
- ⬜ 移动端响应式（当前全部固定宽度，在手机上显示不佳）
- ⬜ **域名切换**：全局 `BASE` 从 `toolsbox-six.vercel.app` → `aiboxpro.cn`
  - 涉及文件：`app/layout.tsx`、`app/tools/[slug]/page.tsx`、`app/news/[id]/page.tsx`、`app/trending/[...slug]/page.tsx`、`app/sitemap.ts`

---

## Phase 2 — 用户粘性与国内差异化

> **核心目标：让用户有理由回来，而不只是跳转去别的网站。**

### 2-A 「国内可用」体系（最高优先，核心差异化）

- ✅ tools 表扩展字段落地（Schema + lib/tool-meta.ts + scripts/update-tool-meta.ts）
- ✅ 工具详情页：国内可用 badge、真实官网 URL、功能亮点列表、信息格扩展
- ⬜ 工具卡片加「国内可用 ✓」/ 「需梯子」小标签（首页 + 分类页卡片）
- ⬜ 首页筛选器加「仅看国内可用」开关
- ⬜ 运营 SOP：新工具收录时必填 china_access 字段

### 2-B 内容增强

- ⬜ GitHub 详情页接入 GitHub API（Task 4，见 CODEX.md）
  - README 渲染（`marked` + `sanitize-html`）
  - Topics / License / 语言分布
  - ⚠️ 未认证 60 req/h，用 `next: { revalidate: 3600 }` 缓存
- ⬜ 工具详情页「平替工具」模块（alternatives 字段 → 卡片组）
- ⬜ 资讯详情页「相关工具」推荐（按标签匹配）
- ⬜ 分类页加分类介绍段落 + 使用场景引导

### 2-F 工具使用技巧内容体系 ⛔ 预留，暂不开发

> 设计存档见 GROWTH.md 第十四章，待日活稳定后启动。

**核心逻辑：** 不爬取全文（版权风险），只存「标题 + 编辑摘要 + 来源跳链」。

- ⬜ 建 `tool_tips` 表
  ```sql
  CREATE TABLE tool_tips (
    id          SERIAL PRIMARY KEY,
    tool_id     TEXT NOT NULL REFERENCES tools(id),
    title       TEXT NOT NULL,
    summary     TEXT NOT NULL,      -- 编辑自写 100-200 字，非转载全文
    source_name TEXT NOT NULL,      -- 「少数派」「刘晓义」等
    source_url  TEXT NOT NULL,
    platform    TEXT NOT NULL,      -- 'wechat'|'xiaohongshu'|'zhihu'|'bilibili'|'other'
    tip_type    TEXT NOT NULL DEFAULT 'tutorial',
    featured    BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
  );
  ```
- ⬜ `loadTipsByTool(toolId, limit)` 查询函数
- ⬜ 工具详情页底部 Tips section（有数据才渲染，空则不显示区块）
- ⬜ 后台录入 API（`POST /api/admin/tips`，需 CRON_SECRET 鉴权）
- ⬜ `/learn` 全站技巧汇总页（SSG + ISR）
- ⬜ `/learn/[tool-id]` 工具技巧页（SSG + ISR，SEO 重点）

**运营启动（不需要等开发）：**
- 先手动整理 50 条链接（ChatGPT / Claude / Midjourney / Cursor 各 10-15 条）
- 后台 API 上线后批量导入

### 2-C 发现与搜索

- ⬜ 命令面板结果展示优化（当前只显示 name，加 mono/brand 图标 + zh 摘要）
- ⬜ 工具列表页（`/tools`）— 全量工具列表，支持按分类/定价/国内可用筛选
- ⬜ 对比页 `/compare?ids=a,b,c`（参数驱动，无需登录）
- ⬜ 标签详情页 `/tags/[tag]`

### 2-D 个人化（需登录）

> 登录系统上线前，用 `localStorage` 暂存，上线后合并。

- ⬜ 收藏工具（⭐ 按钮已有 UI，后端 `user_favorites` 表待建）
- ⬜ 最近浏览（`user_recents` 表 or localStorage）
- ⬜ 用户系统（邮箱 / GitHub OAuth，NextAuth.js）

### 2-E 工具提交与社区

- ⬜ 工具提交表单（`/submit`）— 草稿 → 邮件通知 → 审核 → 发布
- ⬜ 举报失效链接按钮（详情页底部）

---

## Phase 3 — 商业化（需 ICP 备案完成后开启）

> **前置条件：`aiboxpro.cn` 完成 ICP 备案（预计 20 个工作日）**

- ⬜ `<AdSlot />` 组件预埋（不等备案，先在 DOM 预留位置）
  - 位置：列表第 5/10 条之间、详情页右侧边栏、资讯详情底部
  - 实现：`<div data-ad-slot="list-mid" style={{minHeight:90}} />`，备案后换成百度联盟代码
- ⬜ 百度联盟接入（备案后）
- ⬜ 百度统计 (`tongji.baidu.com`) — 替代 / 并行 GA4
- ⬜ CPS 链接跟踪（`?ref=aiboxpro` + 点击落库）
- ⬜ 付费推荐位（订单表 + 审核后台 + 到期下架）

---

## Phase 4 — 域名 & 基础设施切换

> 这些是运营/DevOps 任务，与代码开发并行推进。

- ✅ **代码中 BASE URL 全局替换** → `aiboxpro.cn`（10 个文件）
- ✅ **DNS 配置**：`aiboxpro.cn` → Vercel（已完成，域名正常解析）
- ✅ **Vercel 域名绑定**：已完成
- ⬜ **ICP 备案申请**（阿里云代备案，需准备：营业执照或个人身份证、域名证书、网站截图、主办单位信息）
- ⬜ Cloudflare 接入（CDN + WAF，国内访问加速）
- ⬜ Vercel KV / Upstash Redis（GitHub API 响应缓存，防超限）

---

## Phase 5 — 规模化（持续迭代）

- ⬜ 搜索升级到 Meilisearch / Typesense（当前 ILIKE 够用，超 5k 工具后再切）
- ⬜ 周报订阅（邮件，Resend），每周推送本周最热工具 + Trending
- ⬜ 微信分享优化（微信内打开显示正确 OG 图，需测试）
- ⬜ 移动端 App / 微信小程序（可选，用户量 >5 万再考虑）
- ⬜ 多语言扩展（繁体中文优先，英文次之）

---

## 近期行动优先级（最新）

| 优先级 | 任务 | 状态 |
|---|---|---|
| 🔴 P0 | `/trending` 列表页 | ✅ 完成 |
| 🔴 P0 | 导航栏扩展（3 个入口）+ usePathname | ✅ 完成 |
| 🔴 P0 | 域名 `aiboxpro.cn` 上线 | ✅ 完成（DNS + 代码） |
| 🔴 **P0** | **全局共用顶栏 `SiteHeader`** | ⬜ **待 Codex（Task 0）— 内页导航缺失** |
| 🟠 P1 | tools 表 Schema 扩展 + 工具详情页 v2 | ✅ 完成 |
| 🟠 P1 | `robots.txt` + Baiduspider 规则 | ✅ 完成 |
| 🟠 P1 | 资讯中文源补录 + AI 处理分支 | ⬜ 待 Codex（Task 9） |
| 🟠 P1 | `<AdSlot />` 占位组件 | ⬜ 待 Codex（Task 2） |
| 🟡 P2 | GitHub 详情页 v2（README + Topics） | ⬜ 待 Codex（Task 4） |
| 🟡 P2 | **移动端响应式** | ⬜ 待 Codex（Task 5） |
| 🟡 P2 | 首页工具卡片加国内可用小标签 | ⬜ 待 Codex |
| 🟡 P2 | ICP 备案（运营任务） | ⬜ 需要操作 |
| 🟢 P3 | `/tools` 独立工具列表页 | ⬜ 待 Codex（Task 6） |
| 🟢 P3 | 百度统计接入 | ⬜ 备案后（Task 7） |

---

## 已完成功能汇总（截至 2026-05-01）

| 功能模块 | 完成度 | 备注 |
|---|---|---|
| 首页 UI（工具+Trending+资讯） | ✅ 完成 | V2Pro 组件 |
| ⌘K 全站搜索 | ✅ 完成 | 实时 API，250ms 防抖 |
| 工具详情页 v2 | ✅ 完成 | 真实 URL + 国内可用 badge + 功能亮点 |
| GitHub 仓库详情页 | ✅ 基础版 | 缺 README/Topics |
| 资讯列表页 | ✅ 完成 | 标签筛选 + 卡片 |
| 资讯详情页 | ✅ 完成 | 双语 + JSON-LD |
| 分类页 | ✅ 基础版 | 缺分类介绍 |
| 动态 OG 图 | ✅ 完成 | 三种模板 |
| sitemap.xml | ✅ 完成 | 工具+资讯+分类 |
| GitHub Trending 爬虫 | ✅ 完成 | today/week/month |
| RSS 采集 + AI 摘要 | 🚧 进行中 | 英文为主，中文源补录中（Task 9） |
| Trending 列表页 | ✅ 完成 | 今日/本周/本月三 tab |
| 导航栏（3 项）| ✅ 完成 | 首页/GitHub趋势/AI资讯 |
| 国内可用标签体系 | ✅ 完成 | Schema + 详情页展示 |
| 百度 SEO 适配 | 🚧 进行中 | robots.txt ✅，百度验证待补 |
| 域名 `aiboxpro.cn` | ✅ 完成 | DNS 已解析，正常访问 |
| 移动端响应式 | ❌ 未做 | 设计稿见 CODEX.md Task 5 |
| GitHub 详情页 v2 | ❌ 未做 | README/Topics，见 CODEX.md Task 4 |

---
