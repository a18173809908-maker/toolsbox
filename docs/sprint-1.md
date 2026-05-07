# Sprint 1 任务清单（第 1-30 天）：信任基础建设

> **目标**：消除现有信任损耗，完成技术与数据基础。不要求任何新功能上线。
>
> **完成标准**：打开任意工具详情页，数据来源清晰、更新时间可见、无乱码内容、品牌名一致。首页三个决策入口可点击跳转，搜索词可透传至工具库。
>
> **执行规则**：每个任务独立 commit，commit message 注明任务编号（如 `fix(J1): 修复决策入口 href`）。

---

## 进度状态（最近更新：2026-05-07）

| 任务 | 状态 | Commit |
|---|---|---|
| J1 修复首页 href | ✅ 已完成 | 394a180 |
| J2 搜索 query 透传 + Enter 提交 | ✅ 已完成 | 61f2787 + 62aac8c |
| J3 移除 news prop | ✅ 已完成 | 62aac8c |
| J4 Footer prop 命名 | 🟡 待做 | — |
| J5 删除场景模块 | ✅ 已完成 | 394a180 |
| J6 Hero 侧边栏视觉 | 🟡 待做（依赖 I5） | — |
| I1 品牌统一 AIBoxPro | ✅ 已完成 | 3483602 + e426a5e |
| I2 历史乱码清理 | ✅ 已完成 | 67c876d |
| I3 数据时效性标注 | ✅ 已完成 | f6ca40b |
| I4 对比页模板 | ✅ 已完成 | 3440f47 + e426a5e（补 testedVersion） |
| I5 首页三大决策入口（emoji 图标） | ✅ 已完成 | 230c7c0 |
| I6 Canonical 链接 + 重定向规范 | 🟡 待做 | — |
| I7 合规页面（关于/隐私/工具提交说明/免责声明） | 🟡 待做 | — |
| I8 Admin 后台 + 审核流程 | 🟡 待做（白皮书 §4 内容审核流程） | — |
| I9 审核提醒邮件（Vercel Cron + Resend） | 🟡 待做 | — |

**Sprint 1 剩余任务**：J4 / J6 / I6 / I7 / I8 / I9

执行顺序建议：**J4 → I6 → I8 → I9 → I7 → J6**

排序逻辑：
- J4 最快收尾首页修复（5 行改动）
- I6（Canonical）属于全站 SEO 基础设施
- **I8 + I9（审核流程）必须先于 Sprint 2 内容生产，否则对比页和 Lab 报告无安全的发布路径**
- I7（合规页）独立任务，可挪到任何位置
- J6 视觉收尾（依赖 I5，已完成）

### Sprint 1 编号说明

注意：sprint-1 中的 I1-I7 与 [Sprint 2 任务清单](./sprint-2.md) 中的 I6-I9 编号有重叠。同名同号但**指代任务不同**：

| 编号 | sprint-1 含义 | sprint-2 含义 |
|---|---|---|
| I6 | Canonical 链接修复 | 10 个对比页发布 |
| I7 | 合规页面建设 | AIBoxPro Lab 首份报告 |

引用任何 I 任务时建议带前缀（如 "sprint-1 I6"）以避免混淆。

---

## 第 1-2 周：首页修复 + 品牌统一 + 乱码清理

### ✅ J1（P0）：修复首页决策入口和对比卡 href — 已完成

**已实施**（commit 394a180）：
- `decisionLinks` 改为 3 个入口：对比 → `/compare`、替代方案 → `/tools?china=accessible`、榜单 → `/tools?sort=score`
- `compareCards` 4 个 href 改为 `/compare/[slug]` 格式
- `compareCards` actionHref（"查看全部对比"）从 `/tools` 改为 `/compare`

> `/compare/*` 目前会返回 404（I4 完成后即可访问），保持 404 是有意为之，不用 `/tools` 兜底。

**验证已通过**：3 个 decisionLinks href 各不相同；compareCards href 格式正确；`npm run lint && npm run build` 通过。

---

### ✅ J2（P0）：搜索 query 透传至工具库 — 已完成

**已实施**：`components/V2Pro.tsx` Hero 组件
- 搜索按钮 `<Link>` href 改为动态拼接 `?q=` 参数
- 输入框 `<input>` 加 `onKeyDown` 处理 Enter 键提交
- 引入 `useRouter` 与 `submitSearch()` 封装跳转逻辑

**验证已通过**：
- 点热词 → 点搜索按钮 → URL 携带 `?q=` ✅
- 输入后按 Enter → 跳转携带 `?q=` ✅
- query 为空时跳转干净的 `/tools` ✅
- `npm run lint && npm run build` 通过

---

### ✅ J3（P1）：移除 `news` prop 的无效数据获取 — 已完成

**已实施**：
- `components/V2Pro.tsx`：`HomeData` 类型移除 `news` 字段，`NewsItem` 从 import 中移除
- `lib/db/queries.ts`：`loadHomepageData()` 删除 articles 查询和 NewsItem 映射，返回类型同步收敛；`NewsItem` 从 import 中移除
- `app/page.tsx` 不需要改动（透传 spread 自动适配）

**验证已通过**：`npm run lint` 无 warning，`npm run build` 通过，首页加载不再触发 articles 查询。

---

### J4（P1）：修复 Footer prop 命名错误

**文件**：`components/V2Pro.tsx`，`Footer` 组件及调用处

**问题**：prop 叫 `newsCount` 但存的是工具数量，内部显示"已整理工具：{newsCount}"。

**修复**：

```tsx
// Footer 类型
function Footer({ toolCount }: { toolCount: number }) { ... }
// 内部
<div>已整理工具：{toolCount}</div>
// 调用处
<Footer toolCount={tools.length} />
```

**验证**：`npm run lint` 无 warning；页面底部数字显示正常。

---

### ✅ J5（P0）：移除整个场景模块 — 已完成

**已实施**（commit 394a180）：
- 删除 `ScenarioCard` 类型定义
- 删除 `scenarioCards` 数组
- 删除 `ScenarioSection` 函数组件
- 删除 `V2ProHomepage` 中调用 `ScenarioSection` 的 `<section>` 区块
- 顺手将 `HomeHeader navItems` 中"场景"项删除，"对比"指向 `/compare`，"排行榜"指向 `/tools?sort=score`

**验证已通过**：首页无"按场景找工具"区块；`npm run lint && npm run build` 通过。

---

### J6（P1）：删除 Hero 侧边栏「按工作场景找工具」入口

**文件**：`components/V2Pro.tsx`，`decisionLinks` 数组（约第 39-68 行）

**说明**：J1 已把 decisionLinks 改为 3 个入口（删除了"按工作场景找工具"），本任务确认 Hero 组件渲染逻辑不需要额外改动——`decisionLinks.map()` 会自动适配数组长度。

**检查项**：
- Hero 侧边栏（`<aside>`）渲染正常，3 个入口卡片高度自适应
- 移动端无视觉异常

**验证**：本地开发启动后访问首页，Hero 右侧只有 3 个决策入口，间距协调。

---

### ✅ I1（P0）：品牌名全站统一为 AIBoxPro — 已完成

**已实施**（3483602 + e426a5e 两次提交）：
- 5 处 crawler / fetcher User-Agent（`lib/jobs/fetch-*.ts`、`lib/jobs/discover-tool-signals.ts`、`lib/jobs/github-trending.ts`）
- `lib/github.ts` GitHub API User-Agent
- 7 个页面 metadata：`app/categories/[id]/page.tsx`、`app/news/page.tsx`、`app/news/[id]/page.tsx`、`app/tools/page.tsx`、`app/tools/[slug]/page.tsx`（在 I3 commit 中顺手改了）、`app/trending/page.tsx`、`app/trending/[...slug]/page.tsx`
- 共覆盖 13 处用户可见字符串 + 6 处 User-Agent

**验证已通过**：
```bash
grep -ri "aitoolsbox" --include="*.ts" --include="*.tsx" .
# 结果：无匹配
```

剩余的 `AiToolsBox` 字符串仅出现在 `docs/`、`UI/`（设计稿）、历史 markdown 文档中，不影响生产。

---

### ✅ I2（高优先级）：清理历史乱码资讯 — 已完成

**已实施**（commit 67c876d）：
- `scripts/cleanup-articles.ts` 新建，覆盖 sprint-1 spec 三种识别条件（乱码 / 语言错误 / 过期 180 天）
- `package.json` 新增 `cleanup:articles` 命令
- 用 `UPDATE articles SET status='hidden'` 软删除，保留历史记录
- 输出格式：`隐藏 X 条（乱码 Y / 语言错误 Z / 过期 W）`

**与 spec 的偏差**：过期判定省略了 `views=0` 限制（180 天前热门文章也按过期处理）。属于"比 spec 更激进"，可接受。

**待执行**：CODEX 或运营需运行 `npm run cleanup:articles` 一次完成首批清理。

---

### I6（P0）：Canonical 链接修复 + 重定向规范化

**对应白皮书**：§7 第一期 W1-2 第 2 项 / §1 重构紧迫性诊断中的"307 重定向逻辑不规范"问题

**问题**：当前域名/重定向逻辑会让搜索引擎抓取出现重复页面，且 SEO 权重分散到多个 URL（如 `aiboxpro.cn` / `www.aiboxpro.cn` / 含尾斜杠 / 不含尾斜杠 / http vs https 等组合）。

**实施步骤**：

1. **统一权威域名**：选定 `https://www.aiboxpro.cn` 作为主域名（与 `app/page.tsx` 中已有的 `BASE` 常量一致）
2. **`next.config.ts`** 新增 redirects 配置：
   ```typescript
   async redirects() {
     return [
       // 非 www 永久重定向到 www（301，不是 307）
       {
         source: '/:path*',
         has: [{ type: 'host', value: 'aiboxpro.cn' }],
         destination: 'https://www.aiboxpro.cn/:path*',
         permanent: true,
       },
     ];
   }
   ```
3. **每个页面添加 canonical 标签**：在 `app/layout.tsx` 的 `metadata` 中或各页面 `generateMetadata` 中明确 `alternates: { canonical: ... }`
4. **`app/sitemap.ts`** 检查所有 URL 是否使用统一的 `BASE` 常量，无硬编码裸域名
5. **`app/robots.ts`** 检查 sitemap 引用是否带 `https://www.` 前缀

**验证**：
- 访问 `aiboxpro.cn`（无 www）→ 301 跳转到 `https://www.aiboxpro.cn`，**不是** 307
- 用 `curl -I https://aiboxpro.cn/tools` 检查响应码为 `301 Moved Permanently`
- 工具详情页查看源代码，`<link rel="canonical" href="https://www.aiboxpro.cn/tools/...">` 存在
- Google Search Console URL 检查工具确认 canonical 正确识别
- `npm run build` 通过

---

### I7（高优先级）：合规页面建设

**对应白皮书**：§7 第一期 W1-2 第 4 项 / §5.2 合规字段风险边界中的免责声明要求

**说明**：白皮书要求上线 4 个合规页面。这些是静态文档页，不涉及交互逻辑，但**必须先于商业化入口存在**——白皮书 §5.3 规定第 45 天后开放商业化，前提是合规说明已就绪。

**4 个页面清单**：

| 路径 | 内容要点 |
|---|---|
| `/about` | 平台定位（来自白皮书 §2 价值主张）、团队简介、联系方式、内容来源说明 |
| `/privacy` | 数据收集（GA / Vercel Analytics 等）、Cookie 使用、用户数据如何处理、第三方服务清单 |
| `/submit-guide` | **工具提交说明**（不是表单页）：收录标准、流程、审核周期、常见问题 |
| `/disclaimer` | 免责声明（含白皮书 §5.2 要求的合规字段口径："合规状态仅供参考，以工具官方公告及监管机构最新公示为准。AIBoxPro 不对因信息滞后导致的决策损失承担责任。"） |

**实施步骤**：

1. 新建 `app/about/page.tsx`、`app/privacy/page.tsx`、`app/submit-guide/page.tsx`、`app/disclaimer/page.tsx`
2. 每页静态内容，使用 markdown 渲染或直接 JSX，不需要数据库
3. 每页 `generateMetadata` 设置独立 title / description / canonical
4. **页脚（Footer）链接**：所有 4 个页面在站点 footer 区域可见——但本期 V2Pro.tsx 没有页脚结构，本任务**只建页面，不强制加入页脚**。页脚链接随后在新设计稿落地时补
5. `app/sitemap.ts` 把 4 个新路径加入 sitemap

**内容口径要求**：
- `/disclaimer` 必须**逐字包含**白皮书 §5.2 的免责声明
- `/submit-guide` 明确说明这是**说明文档**，不是表单页（白皮书未要求功能性提交表单）
- `/about` 不出现"商务合作 / 测评合作 / 榜单赞助"等商业话术（白皮书 §5.3 商业化第 45 天后开放）

**验证**：
- 4 个路径直接访问可渲染，无 404
- `/disclaimer` 包含白皮书 §5.2 原文的免责声明
- Sitemap 包含 4 个新路径
- `npm run lint && npm run build` 通过

---

## 第 3-4 周：数据基础 + 对比页模板

### ✅ I3（高优先级）：工具字段数据时效性标注 — 已完成

**已实施**（commit f6ca40b）：
- `lib/db/schema.ts`：`tools` 表新增 4 字段（`pricing_updated_at` / `access_updated_at` / `features_updated_at` / `compliance_updated_at`）
- `lib/data.ts`：Tool 类型同步新字段（ISO 字符串）
- `lib/db/queries.ts`：`loadToolById` 和 `loadHomepageData` 返回新字段
- `app/tools/[slug]/page.tsx`：新增 `formatFreshnessWarning` + `FreshnessNotice` 组件，三处接入：
  - 定价区块（30 天阈值）
  - 国内访问区块（14 天）
  - 合规状态（90 天）
- `lib/db/queries.ts publishToolCandidate`：新工具入库自动写入 3 个 `_updatedAt = now()`（compliance 留空——需人工确认）
- DB 已通过 `npm run db:push` 同步

**视觉设计**：黄底警告（过期或缺失）vs 绿底正常状态。

---

### ✅ I4（高优先级）：标准化对比页模板 — 已完成

**已实施**（commit 3440f47 + e426a5e 补 testedVersion）：
- `lib/db/schema.ts`：`comparisons` 表完整字段（id/toolAId/toolBId/title/summary/body/verdict + Methodology Box 5 字段 + status/publishedAt/updatedAt + 2 索引）
- `lib/db/queries.ts`：新增 `loadAllComparisons` / `loadComparisonById` / `loadAllComparisonIds` / `attachComparisonTools` 辅助函数
- `app/compare/page.tsx`：列表页（卡片网格 + ISR revalidate=3600）
- `app/compare/[slug]/page.tsx`：详情页含
  - Hero：两工具 logo + VS + summary
  - Methodology Box（5 字段，空时显示"待补充"，不隐藏区块）
  - 对比表格（价格 / 国内可用性 / 中文支持 / 免费额度，从 tools 表自动取）
  - markdown 正文渲染（marked + sanitize-html，外链强制 target=_blank）
  - 编辑结论醒目区块
  - 相关对比（同工具其他对比，最多 3 条）
  - JSON-LD Article schema
- `app/sitemap.ts`：`/compare` 静态入口 + 动态 `/compare/[slug]`
- DB 已通过 `npm run db:push` 同步

**Follow-up（e426a5e）**：原 commit 渲染了"测试版本"但 schema 缺字段，本次补 `tested_version text` 字段并接入 MethodologyItem。

---

### ✅ I5（中优先级）：首页三大决策入口（静态版）— 已完成

**已实施**（commit 230c7c0）：
- `DecisionLink` 类型新增 `icon: string` 字段
- 三个入口分别配 ⚖️ / 🔄 / 📊
- Hero 侧边栏渲染从 `link.title.slice(0, 1)` 替换为 `link.icon`

---

### I8（P0）：Admin 后台 + 内容审核流程

**对应白皮书**：§4「内容审核流程与推送机制」

**说明**：白皮书要求工具候选 / 对比页 / Lab 报告必须经人工审核才能上线，资讯需事后抽审。当前所有自动处理脚本直接 publish，必须改为"AI 起草 → 草稿状态 → 人工审核 → 发布"。

**Schema 改动**：

```typescript
// lib/db/schema.ts

// tool_candidates 新增 status 'ai_drafted' 用于已 AI 处理但待人工审核
// 不需要改 column，复用现有 status 字段，新增 'ai_drafted' 取值

// tool_candidates 新增 audit 字段
reviewedBy:  text('reviewed_by'),
reviewedAt:  timestamp('reviewed_at'),
rejectReason: text('reject_reason'),

// comparisons 同上（新增 reviewedBy / reviewedAt / rejectReason）
// articles 同上（用于事后抽审记录）
```

运行 `npm run db:push`。

**自动处理脚本调整**：

`lib/jobs/process-tool-candidates.ts`：
- AI 处理完后**不再直接** `INSERT INTO tools`
- 改为更新 `tool_candidates` 的 `zh / catId / pricing / chinaAccess / features` 等字段（作为草稿数据），并设 `status='ai_drafted'`
- `publishToolCandidate` 函数改为只在审核通过时调用

**身份认证**：

第一阶段使用环境变量 `ADMIN_PASSWORD`，简单 cookie 鉴权。

新建 `middleware.ts`（项目根目录）：

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();
  const cookie = req.cookies.get('admin-auth')?.value;
  if (cookie === process.env.ADMIN_PASSWORD) return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/login', req.url));
}

export const config = { matcher: '/admin/:path*' };
```

新建 `app/admin/login/page.tsx` + `app/api/admin/login/route.ts`：登录表单，POST 校验密码并设 cookie（HttpOnly + Secure + SameSite=Lax，过期 7 天）。

**Admin 页面结构**：

```
app/admin/
├── login/
│   └── page.tsx              # 登录表单
├── page.tsx                  # 列表总览：3 类待审核数量徽章
├── tools/
│   ├── page.tsx              # 工具候选列表（status='ai_drafted'）
│   └── [id]/
│       └── page.tsx          # 单条审核：渲染将上线后的样子 + 通过/拒绝按钮
├── comparisons/
│   ├── page.tsx              # 对比页草稿列表（status='draft'）
│   └── [id]/
│       └── page.tsx          # 单条审核
└── articles/
    └── page.tsx              # 资讯抽审（最近 30 天 + 已 published）
```

**API routes**：

```
app/api/admin/
├── login/route.ts                          # POST: 校验密码、设 cookie
├── logout/route.ts                         # POST: 清除 cookie
├── tools/[id]/approve/route.ts             # POST: 写入 tools 表，更新候选 status='approved' + reviewedAt + reviewedBy
├── tools/[id]/reject/route.ts              # POST: 候选 status='rejected' + rejectReason
├── comparisons/[id]/approve/route.ts       # POST: comparisons.status='published' + publishedAt + reviewedAt
└── comparisons/[id]/reject/route.ts
```

**详情页设计要点**（参考白皮书"审核者数据要求"）：

工具候选审核详情页必须呈现：
- AI 起草的所有字段（zh / 分类 / 定价 / 中国访问 / 功能 / howToUse / faqs）
- 工具官网链接（直接可点击访问）
- 该工具在其他源的描述（如 ai-bot.cn 抓取的简介，作为横向参考）
- 通过 / 拒绝 / 编辑后通过 三个按钮

对比页草稿审核详情页直接渲染 `/compare/[slug]` 的预览版本（仅审核者可见）。

**审核者操作日志**：

每次 approve/reject 写入数据库：

```typescript
{
  reviewedBy: 'admin',  // 第一阶段固定为 'admin'，未来多人时改为登录用户
  reviewedAt: new Date(),
  rejectReason: '...' // 仅拒绝时
}
```

**环境变量**：

`.env.local` 新增：
```
ADMIN_PASSWORD=<高强度密码>
```

**验证**：
- 访问 `/admin` 未登录 → 重定向到 `/admin/login`
- 登录后能看到三类待审核内容数量
- 工具候选审核：通过后 `tools` 表多一行；拒绝后候选 status='rejected' 且有 rejectReason
- 对比页审核：通过后 `comparisons.status='published'` 且 publishedAt 有值
- 已自动处理的资讯能在 `/admin/articles` 列出，可以单独 hide 异常条目
- `npm run lint && npm run build` 通过

**风险与回滚**：

- 改动 `process-tool-candidates.ts` 后，**新候选不再自动 publish 到 tools**——这是预期行为
- 但 Vercel 已有部署的旧代码仍在运行，可能在 cron 时再次自动 publish 已被 AI 处理过的候选
- 部署本任务后立即触发 redeploy，避免旧代码继续跑
- 如果发现审核流程不工作，临时回滚方案：env 变量 `ADMIN_AUTO_PUBLISH=true` 时跳过审核（不在本期实现，只作为应急口子，CODEX 可以预留代码注释）

---

### I9（P1）：审核提醒邮件

**对应白皮书**：§4「内容审核流程与推送机制」之"通知机制"

**说明**：审核者不会主动每天打开 `/admin` 检查，需要邮件提醒。

**实施步骤**：

1. **接入 Resend**（推荐）或 Postmark：
   - 注册 Resend 账号（免费额度 3000 封/月，足够单审核者使用）
   - 获取 API Key 并写入 `.env.local`：
     ```
     RESEND_API_KEY=re_xxx
     ADMIN_NOTIFY_EMAIL=editor@aiboxpro.cn  # 接收提醒的邮箱
     ```
   - 验证发件域名 `aiboxpro.cn`（添加 SPF/DKIM 记录到 DNS）

2. **新建 `lib/jobs/notify-pending-review.ts`**：
   ```typescript
   // 查询三类待审核数量
   // pendingTools = SELECT count(*) FROM tool_candidates WHERE status='ai_drafted'
   // pendingComparisons = SELECT count(*) FROM comparisons WHERE status='draft'
   // recentArticles = SELECT count(*) FROM articles WHERE status='published' AND publishedAt > now() - interval '24 hours'
   //
   // 如果三个全为 0，跳过发送
   //
   // 否则调用 Resend API 发邮件，主题：「AIBoxPro 审核提醒：X 条工具 / Y 条对比页待审」
   // 正文 HTML：数量统计 + 直达 https://www.aiboxpro.cn/admin 的链接
   ```

3. **新建 cron 路由 `app/api/cron/notify-review/route.ts`**：
   - 调用 `notifyPendingReview()`
   - 鉴权：检查 header `Authorization: Bearer <CRON_SECRET>`

4. **`vercel.json` 加 cron 配置**：
   ```json
   {
     "path": "/api/cron/notify-review",
     "schedule": "0 1 * * *"  // 每日 UTC 01:00 = 北京 09:00
   }
   ```

5. **去重逻辑**：单日最多 1 次，由 cron 频率（每天一次）天然保证

**验证**：
- 测试环境手动触发 `/api/cron/notify-review` 能收到邮件
- 邮件主题、数量、链接正确
- 三类数量全为 0 时不发送邮件（验证 short-circuit）
- Vercel Production cron 设置正确

**Resend 备选方案**：

如果 Resend 域名验证麻烦，可临时用 SMTP：
- `nodemailer` + 编辑者自有邮箱（如 Gmail）的应用专用密码
- 但 Gmail SMTP 在 Vercel 上可能慢或被限速，长期建议 Resend

---

## Sprint 1 完成标准

- [x] J1：决策入口和对比卡 href 指向正确路径（3 个 decisionLinks，4 个 compareCards）
- [x] J2：搜索词透传至 `/tools?q=`（按钮 + Enter 键均生效）
- [x] J3：`loadHomepageData()` 不查询资讯，`HomeData` 无 `news` 字段
- [ ] J4：`Footer` prop 名为 `toolCount`
- [x] J5：首页不再出现"按场景找工具"区块，相关代码全部删除
- [ ] J6：Hero 侧边栏 3 个入口视觉协调
- [x] I1：全站无 `AiToolsBox` 用户可见字符串
- [x] I2：`/news` 无乱码或纯英文条目（脚本已上线，待运营首次执行）
- [x] I3：工具详情页定价区块有「最后更新」时间提示，过期数据有黄色警告
- [x] I4：`/compare/cursor-vs-trae` 可访问，含 Methodology Box 区块
- [x] I5：首页 3 个决策入口显示 emoji 图标，可正确跳转
- [ ] I6：裸域 → www 永久重定向（301），所有页面有 canonical 标签
- [ ] I7：4 个合规页面（/about、/privacy、/submit-guide、/disclaimer）可访问，sitemap 已收录
- [ ] I8：`/admin` 受密码保护，三类内容（工具候选 / 对比页草稿 / 资讯）可审核；`process-tool-candidates` 不再直接 publish
- [ ] I9：每日 09:00 邮件通知有待审核内容（数量为 0 时不发邮件）
- [ ] 全部：`npm run lint && npm run build` 通过，无新增 warning
