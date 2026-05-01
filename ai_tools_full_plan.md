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
- ⬜ **tools 表扩展字段**（影响「国内可用」核心差异化，优先级：高）
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

- ⬜ tools 表扩展字段落地（见 1-A Schema 部分）
- ⬜ 工具卡片加「国内可用 ✓」/ 「需梯子」标签（首页 + 分类页）
- ⬜ 工具详情页加「国内可访问」信息块 + 中文 UI 标签 + 免费额度说明
- ⬜ 首页筛选器加「仅看国内可用」开关
- ⬜ 运营 SOP：新工具收录时必填 china_access 字段

### 2-B 内容增强

- ⬜ GitHub 详情页接入 GitHub API
  - README 渲染（Markdown → HTML，`react-markdown` 或服务端渲染）
  - Topics / License / 语言分布条形图
  - 贡献者头像（最多 10 位）
  - ⚠️ 注意：未认证 API 60 req/h，需缓存（Redis 或 Vercel KV）
- ⬜ 工具详情页功能亮点列表（`features[]` 字段 → bullet 列表）
- ⬜ 工具详情页「平替工具」模块（alternatives 字段 → 卡片组）
- ⬜ 资讯详情页「相关工具」推荐（按标签匹配）
- ⬜ 分类页加分类介绍段落 + 使用场景引导

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

- ⬜ **DNS 配置**：`aiboxpro.cn` → Vercel（添加 CNAME/A 记录）
- ⬜ **Vercel 域名绑定**：在 Vercel Dashboard 添加自定义域名
- ⬜ **ICP 备案申请**（阿里云代备案，需准备：营业执照或个人身份证、域名证书、网站截图、主办单位信息）
- ⬜ **代码中 BASE URL 全局替换**（见 1-F 域名切换）
- ⬜ Cloudflare 接入（CDN + WAF + 防爬，国内用户用国内节点）
- ⬜ Vercel KV / Upstash Redis（GitHub API 响应缓存，防超限）

---

## Phase 5 — 规模化（持续迭代）

- ⬜ 搜索升级到 Meilisearch / Typesense（当前 ILIKE 够用，超 5k 工具后再切）
- ⬜ 周报订阅（邮件，Resend），每周推送本周最热工具 + Trending
- ⬜ 微信分享优化（微信内打开显示正确 OG 图，需测试）
- ⬜ 移动端 App / 微信小程序（可选，用户量 >5 万再考虑）
- ⬜ 多语言扩展（繁体中文优先，英文次之）

---

## 近期行动优先级（按 ROI 排序）

| 优先级 | 任务 | 原因 |
|---|---|---|
| 🔴 P0 | `/trending` 列表页 | 导航有入口但页面不存在，影响 SEO 和用户体验 |
| 🔴 P0 | 导航栏扩展（4 个入口）| 当前只有 2 项，用户无法发现全站内容 |
| 🔴 P0 | 域名切换 `aiboxpro.cn` | SEO 积累要从正式域名开始，越早越好 |
| 🟠 P1 | tools 表 Schema 扩展 | 「国内可用」是核心差异化，字段不加无法展示 |
| 🟠 P1 | `robots.txt` + 百度验证 | 百度不收录 = 国内用户找不到 |
| 🟠 P1 | `<AdSlot />` 占位组件 | 备案期间先埋点，备案完成立即开广告 |
| 🟡 P2 | 工具详情页 v2 | 接真实官网 URL + 国内可用标签 |
| 🟡 P2 | GitHub 详情页 v2 | README 渲染，增加停留时长 |
| 🟡 P2 | ICP 备案流程 | 无备案无法开百度联盟 |
| 🟢 P3 | 移动端响应式 | 国内用户 70%+ 手机访问 |
| 🟢 P3 | 收藏功能（localStorage 版）| 零后端成本，先给用户一个留下来的理由 |

---

## 已完成功能汇总（截至 2026-05-01）

| 功能模块 | 完成度 | 备注 |
|---|---|---|
| 首页 UI（工具+Trending+资讯） | ✅ 完成 | V2Pro 组件 |
| ⌘K 全站搜索 | ✅ 完成 | 实时 API，250ms 防抖 |
| 工具详情页 | ✅ 基础版 | 缺 url/国内可用字段 |
| GitHub 仓库详情页 | ✅ 基础版 | 缺 README/Topics |
| 资讯列表页 | ✅ 完成 | 标签筛选 + 卡片 |
| 资讯详情页 | ✅ 完成 | 双语 + JSON-LD |
| 分类页 | ✅ 基础版 | 缺分类介绍 |
| 动态 OG 图 | ✅ 完成 | 三种模板 |
| sitemap.xml | ✅ 完成 | 工具+资讯+分类 |
| GitHub Trending 爬虫 | ✅ 完成 | today/week/month |
| RSS 采集 + AI 摘要 | ✅ 完成 | 中英双语 |
| Trending 列表页 | ❌ 未做 | 仅有详情页 |
| 导航栏（完整版） | ❌ 未做 | 仅 2 项 |
| 国内可用标签体系 | ❌ 未做 | Schema 待扩展 |
| 百度 SEO 适配 | 🚧 进行中 | 缺 robots.txt、百度验证 |
| 域名绑定 `aiboxpro.cn` | ❌ 未做 | DNS 配置待操作 |

---
