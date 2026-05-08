# Sprint 1 任务清单（第 1-30 天）：信任基础建设

> **目标**：消除现有信任损耗，完成技术与数据基础。不要求任何新功能上线。
>
> **完成标准**：打开任意工具详情页，数据来源清晰、更新时间可见、无乱码内容、品牌名一致。首页三个决策入口可点击跳转，搜索词可透传至工具库。
>
> **执行规则**：每个任务独立 commit，commit message 注明任务编号（如 `fix(J1): 修复决策入口 href`）。

---

## 给 CODEX 接手的 1 分钟概要（2026-05-08）

**当前状态**：✅ **Sprint 1 全部完成。** J1-J6 + I1-I7 + 5 个附加任务 + I8.1-I8.5 + I9 均已合并到 main 并部署到 Vercel。

**接下来的事**：Sprint 1 无剩余任务。下一步是 **sprint-2.md**（第 31-60 天，内容 + 运营）。

**Sprint 1 已上线的关键系统**：
- Admin 后台：`/admin`（cookie 鉴权，密码来自 `ADMIN_PASSWORD` 环境变量）
- 审核流程：工具候选 `ai_drafted` → 人工 approve → 写入 `tools` 表
- 每日 09:00 审核提醒邮件（Vercel cron `0 1 * * *` → `/api/cron/notify-review`）

**尚需人工操作的环境变量**（在 Vercel Dashboard 添加）：
- `RESEND_API_KEY` — Resend 邮件服务 API Key（I9 审核提醒邮件必须）
- `ADMIN_NOTIFY_EMAIL` — 接收审核提醒的邮箱地址
- `ADMIN_PASSWORD` — 若还未在生产环境配置，务必添加（I8.2）

**联系信息**：
- 邮箱：4514407@qq.com
- 微信公众号：aiboxprocn

---

---

## 进度状态（最近更新：2026-05-07）

| 任务 | 状态 | Commit |
|---|---|---|
| J1 修复首页 href | ✅ 已完成 | 394a180 |
| J2 搜索 query 透传 + Enter 提交 | ✅ 已完成 | 61f2787 + 62aac8c |
| J3 移除 news prop | ✅ 已完成 | 62aac8c |
| J4 Footer prop 命名 | ✅ 已自然消化（Footer 组件被 J5 删除） | — |
| J5 删除场景模块 | ✅ 已完成 | 394a180 |
| J6 Hero 侧边栏视觉 | ✅ 已自然到位（J1 减条目 + I5 加图标后无需额外改动） | — |
| I1 品牌统一 AIBoxPro | ✅ 已完成 | 3483602 + e426a5e |
| I2 历史乱码清理 | ✅ 已完成 | 67c876d |
| I3 数据时效性标注 | ✅ 已完成 | f6ca40b |
| I4 对比页模板 | ✅ 已完成 | 3440f47 + e426a5e（补 testedVersion） |
| I5 首页三大决策入口（emoji 图标） | ✅ 已完成 | 230c7c0 |
| I6 Canonical 链接 + 重定向规范 | ✅ 已完成 | 140071c |
| I7 合规页面 | ✅ 已完成 | 27f3d9b |
| **附加 1**：全站 header 统一（删 V2Pro.HomeHeader 用 SiteHeader） | ✅ 已完成 | ebab671 |
| **附加 2**：全站 footer + 4 个合规页入口 | ✅ 已完成 | 111d604 |
| **附加 3**：news 页文案与中文化资讯源对齐 | ✅ 已完成 | 99f7f7e |
| **附加 4**：联系方式从 GitHub 切换为邮箱 + 公众号 | ✅ 已完成 | 838e865 + 2b61b80（QR 图） |
| **附加 5**：废弃旧英文 seed 脚本（保留代码考古） | ✅ 已完成 | 838e865 |
| **I8 Admin 后台 + 审核流程**（已拆为 I8.1-I8.5） | 🟡 进行中 | — |
| ├ I8.1 schema 加审核字段 + db:push | ✅ 已完成 | adf807a |
| ├ I8.2 admin 鉴权（middleware + login） | ✅ 已完成 | 1230fad |
| ├ I8.3 admin 列表页 | ✅ 已完成 | — |
| ├ I8.4 详情页 + approve/reject API | ✅ 已完成 | — |
| └ I8.5 改 process-tool-candidates 行为 | ✅ 已完成 | 328f58a |
| I9 审核提醒邮件 | ✅ 已完成 | — |

**Sprint 1 剩余任务**：I8.1-I8.5 + I9

执行顺序建议：**I8.1 → I8.2 + I8.3（可并行）→ I8.4 → I8.5 → I9**

依赖关系：
- I8.1（schema）必须最先
- I8.2（认证层）和 I8.3（admin 列表页）可以并行做
- I8.4（详情页 + API routes）依赖 I8.3
- I8.5（改 process-tool-candidates 行为）放最后，避免在 admin UI 没验证前就丢失自动 publish 功能
- I9 需要 I8.1 schema 才能查待审核数量

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

### ✅ J4（P1）：修复 Footer prop 命名错误 — 已自然消化

**实际处理**：当前代码中 `components/V2Pro.tsx` 不再有 `Footer` 组件（也没有 `FooterCta`）——这两个组件在前期 J5（删场景模块）和后续 revert（撤回 /submit 入口）的 commit 里被一起删除。

`grep -n "footer\|newsCount\|toolCount" components/V2Pro.tsx` 无任何匹配，意味着原来要修的 prop 命名错误已不存在。

**原任务规格保留作为历史记录**（参见 `git log` 中 e528ab2、394a180）。如未来重新引入页脚组件，必须直接使用语义清晰的命名（`toolCount`），不要回退到 `newsCount`。

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

### ✅ J6（P1）：Hero 侧边栏 3 个入口视觉协调 — 已自然到位

**实际处理**：

J1 在删除"按工作场景找工具"时，decisionLinks 数组从 4 个减到 3 个；I5 给 3 个入口分别配了 ⚖️ / 🔄 / 📊 emoji 图标。Hero 组件 `<aside>` 内部使用 `decisionLinks.map()` 渲染，自动适配数组长度，不需要额外改动。

视觉验证（commit 140071c 之后）：
- 3 个入口卡片完整渲染，emoji 图标在位
- aside 容器响应式自适应高度（无固定 height）
- 父级 grid `minmax(0, 1.08fr) minmax(360px, 0.72fr)` 让 sidebar 与左侧 Hero 文字自然按比例分布

无新 commit。本任务完整在 J1（394a180）+ I5（230c7c0）的组合中实现。

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

### ✅ I6（P0）：Canonical 链接修复 + 重定向规范化 — 已完成

**已实施**：

- `next.config.ts`：新增 `redirects()` 配置，裸域 `aiboxpro.cn` → `https://www.aiboxpro.cn` 永久重定向（`permanent: true` 即 301，非 307）
- `app/robots.ts`：sitemap URL 从 `https://aiboxpro.cn/sitemap.xml` 改为 `https://www.aiboxpro.cn/sitemap.xml`
- `app/layout.tsx`：本任务前 `metadataBase` 已经是 `https://www.aiboxpro.cn`，root canonical 已设置（无需改动）
- `app/sitemap.ts`：本任务前所有 URL 已统一使用 `BASE = 'https://www.aiboxpro.cn'`（无需改动）
- 各页 `generateMetadata`：本任务前已全部设置相对路径 canonical，由 `metadataBase` 自动解析为绝对 URL（无需改动）

**部署后须验证**（生产环境，本地 `npm run build` 不能完整测试 redirects）：

- `curl -I https://aiboxpro.cn/tools` 返回 `301 Moved Permanently`，`Location: https://www.aiboxpro.cn/tools`
- 任意工具详情页查看源代码，`<link rel="canonical" href="https://www.aiboxpro.cn/tools/...">` 存在
- Google Search Console URL 检查工具确认 canonical 正确识别

**注意**：Vercel 域名管理面板可能在边缘层做了平台级 redirect（默认 308），代码层的 redirect 配置作为兜底，确保任何路径都得到 301。如果生产环境发现实际是 308，需要在 Vercel 域名设置中把 `aiboxpro.cn` 标为非主域名以触发代码层 redirect。

---

### ✅ I7（高优先级）：合规页面建设 — 已完成

**已实施**：

- 新增共享布局 `components/LegalPage.tsx`（顶部 SiteHeader + 标题区 + 内容卡片 + 标准文档样式 token）
- 4 个页面全部上线，渲染为 Static（`○` 标记）：
  - `app/about/page.tsx` — 平台定位、内容来源说明、GitHub Issue 联系入口
  - `app/privacy/page.tsx` — 数据收集口径、第三方服务清单（Vercel / Neon / DDG / DeepSeek）、cookie 说明
  - `app/submit-guide/page.tsx` — 收录标准、提交流程（GitHub Issue）、审核周期、FAQ（页内 callout 明确"本页是说明文档不是表单"）
  - `app/disclaimer/page.tsx` — 含白皮书 §5.2 免责声明逐字（用黄色 callout 突出）+ 各字段类型的责任边界
- `app/sitemap.ts` 加入 4 个路径
- 每页 `generateMetadata` 设独立 title / description / canonical
- 不含"商务合作 / 测评合作 / 榜单赞助"等商业话术

**验证已通过**：
- `npm run build` 4 个路径全部生成静态 HTML
- `npm run lint` 无新增 error（仅遗留 1 条与本次无关的旧 warning）
- `app/disclaimer/page.tsx` 含 §5.2 原文："合规状态仅供参考，以工具官方公告及监管机构最新公示为准。AIBoxPro 不对因信息滞后导致的决策损失承担责任。"

**未做（按 spec 推迟）**：4 个页面在站点 footer 的入口链接——V2Pro.tsx 当前无 footer 结构，等后续设计稿落地时再补。

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

## I8（P0）：Admin 后台 + 内容审核流程

**对应白皮书**：§4「内容审核流程与推送机制」

**整体目标**：把"AI 自动处理 → 直接 publish"改为"AI 起草 → 草稿状态 → 人工审核 → 发布"。

I8 已拆分为 5 个子任务（I8.1 - I8.5），每个独立 commit。建议按 I8.1 → I8.2/I8.3（并行）→ I8.4 → I8.5 顺序执行。**I8.5 必须最后做**——它会停掉自动 publish，没有 Admin UI 兜底就等于停了内容入库流程。

---

### I8.1（P0）：Schema 加审核字段 + 推送 DB

**预估工程量**：30 分钟

**改动 `lib/db/schema.ts`**——三个表统一加审核字段：

```typescript
// tool_candidates 表
reviewedBy:    text('reviewed_by'),       // 第一阶段固定为 'admin'
reviewedAt:    timestamp('reviewed_at'),
rejectReason:  text('reject_reason'),

// comparisons 表
reviewedBy:    text('reviewed_by'),
reviewedAt:    timestamp('reviewed_at'),
rejectReason:  text('reject_reason'),

// articles 表
reviewedBy:    text('reviewed_by'),
reviewedAt:    timestamp('reviewed_at'),
rejectReason:  text('reject_reason'),
```

**`tool_candidates` 的 `status` 取值约定**（不改 column 类型，仅扩取值）：
- `pending` — 抓取后未处理
- `processed` — 旧值，I8.5 完成后会迁移到 `ai_drafted`
- `ai_drafted` — **新值**：AI 处理完，待人工审核
- `approved` — 已通过审核并写入 tools 表
- `rejected` — 拒绝

**操作步骤**：

1. 改 schema.ts 加 9 个字段
2. 在主工作区 D:/toolsbox 执行 `npm run db:push`，确认 `[✓] Changes applied`
3. 验证 Neon 控制台三个表都新增了 3 个字段
4. 不需要改任何业务代码，本 commit 仅 schema 改动

**验证**：
- `npm run db:push` 输出含 ALTER TABLE 三次
- `npm run lint && npm run build` 通过
- DB 中三个表的字段已就位

**Commit message 模板**：`feat(I8.1): add reviewedBy/reviewedAt/rejectReason to tool_candidates, comparisons, articles`

---

### I8.2（P0）：Admin 鉴权层（middleware + login 页 + cookie）

**预估工程量**：1-2 小时

**前置依赖**：无（与 I8.3 可并行）

**改动 1：`middleware.ts`**（项目根目录新建）

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();
  // login 页本身不需要鉴权
  if (req.nextUrl.pathname === '/admin/login') return NextResponse.next();

  const cookie = req.cookies.get('admin-auth')?.value;
  if (cookie && cookie === process.env.ADMIN_PASSWORD) return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/login', req.url));
}

export const config = { matcher: '/admin/:path*' };
```

**改动 2：`app/admin/login/page.tsx`** — 简单密码表单（client component）
- 单输入框（type=password）+ 登录按钮
- 提交时 POST 到 `/api/admin/login`，成功跳 `/admin`
- 失败显示"密码错误"

**改动 3：`app/api/admin/login/route.ts`** — 校验密码并设 cookie

```typescript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin-auth', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 天
    path: '/',
  });
  return res;
}
```

**改动 4：`app/api/admin/logout/route.ts`** — 清 cookie

```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin-auth', '', { maxAge: 0, path: '/' });
  return res;
}
```

**环境变量**：

`.env.local` 新增 `ADMIN_PASSWORD=<高强度密码>`。Vercel Env 也要加（生产 + 预览 + 开发三个环境）。

**注意**：cookie 直接存密码不是最佳实践（应该存 session token），但第一阶段简化方案，密码强度足够 + httpOnly + secure 已经够用。后续多人协作时再升级。

**验证**：
- 本地：`.env.local` 加密码，访问 `/admin` 跳到 `/admin/login`，输错跳转回登录页（不闪烁），输对跳到 `/admin`
- 浏览器 DevTools 看 cookie：`admin-auth` 存在，HttpOnly = true
- `npm run lint && npm run build` 通过

**Commit message 模板**：`feat(I8.2): add admin auth middleware + login/logout`

---

### I8.3（P0）：Admin 列表页（总览 + 三类列表）

**预估工程量**：3-4 小时

**前置依赖**：I8.1（需要查 reviewedAt 是否为空判断"待审核"）

**新建文件**：

```
app/admin/
├── page.tsx                       # 总览：3 类待审核数量徽章
├── tools/page.tsx                 # 工具候选列表（status='ai_drafted'）
├── comparisons/page.tsx           # 对比页草稿列表（status='draft'）
└── articles/page.tsx              # 资讯列表（最近 30 天 + status='published'）
```

**总览 `app/admin/page.tsx` 必须呈现**：
- 当前登录状态 + logout 按钮（POST `/api/admin/logout`）
- 3 个数字徽章：待审核工具候选数 / 待审核对比页数 / 最近 30 天资讯数
- 点击徽章跳到对应列表页
- "今日已审核 X 条"统计（基于 reviewedAt 在今天的记录）

**列表页通用要求**：
- 表格形式，每行：标题 / 来源（source） / 抓取时间 / 状态徽章 / 「审核」按钮
- 默认按时间倒序，分页 20/页
- 列表只显示待审核状态：
  - tools：`status='ai_drafted'` 或 `status='processed'`（兼容 I8.5 之前的旧数据）
  - comparisons：`status='draft'`
  - articles：`status='published'` 且最近 30 天（用于事后抽审）
- 资讯列表多一个「隐藏」按钮（不需要审核，只是抽查异常）

**新增 queries**（写在 `lib/db/queries.ts`）：
- `loadPendingToolCandidates(limit, offset)` — `WHERE status IN ('ai_drafted', 'processed')`
- `loadDraftComparisons(limit, offset)` — `WHERE status='draft'`
- `loadRecentPublishedArticles(limit, offset)` — `WHERE status='published' AND publishedAt > now() - interval '30 days'`
- `loadAdminCounts()` — 一次性返回 3 类数量

**视觉风格**：可以复用 `components/LegalPage.tsx` 的样式 token，或者用一个新的 `components/AdminLayout.tsx`（含登出按钮 header）保持简洁。

**验证**：
- `/admin` 总览页 3 个数字正确（与直接 SQL 查询一致）
- 三类列表页能翻页、能跳详情、能正确过滤状态
- `npm run lint && npm run build` 通过

**Commit message 模板**：`feat(I8.3): add admin list pages (overview + 3 types)`

---

### I8.4（P0）：Admin 详情页 + approve/reject API routes

**预估工程量**：3-4 小时

**前置依赖**：I8.1 + I8.2 + I8.3

**新建文件**：

```
app/admin/
├── tools/[id]/page.tsx            # 工具候选审核详情
└── comparisons/[id]/page.tsx      # 对比页草稿审核详情

app/api/admin/
├── tools/[id]/approve/route.ts    # POST: 写 tools 表 + 候选状态 approved
├── tools/[id]/reject/route.ts     # POST: 候选 status='rejected' + rejectReason
├── comparisons/[id]/approve/route.ts  # POST: comparisons.status='published'
├── comparisons/[id]/reject/route.ts
└── articles/[id]/hide/route.ts    # POST: articles.status='hidden'（资讯不需要 approve，只 hide）
```

**工具候选详情页必须呈现**（参考白皮书「审核者数据要求」）：
- AI 起草的所有字段：zh / catId / pricing / chinaAccess / chineseUi / features / howToUse / faqs / 国内用户字段
- 工具官网链接（直接可点击访问，target=_blank）
- 来源 + 来源原始描述（如果是从 RSS 或 ai-bot.cn 抓的，把原文显示一栏作为横向参考）
- 操作区：「通过」「拒绝（要求填理由）」「编辑后通过」三个按钮
  - 「编辑后通过」第一阶段简化：仅允许编辑 zh 描述字段，其他字段不改
  - 拒绝时弹窗输入 rejectReason

**对比页详情页**：
- 直接 iframe 或重新渲染 `/compare/[slug]` 的草稿版本（即使 status='draft'）
- 旁边浮动操作面板：「通过」「拒绝」「在新标签编辑」（编辑暂不实现，第一阶段只能 SQL 改 body）

**API approve/tools 逻辑**：

```typescript
// app/api/admin/tools/[id]/approve/route.ts 伪代码
1. 校验 cookie（已由 middleware 处理，但 API 也要检查）
2. SELECT tool_candidates WHERE id=$1
3. INSERT INTO tools (...) VALUES (来自 candidate 的 AI 起草字段)
   - 包括 pricingUpdatedAt = now() / accessUpdatedAt = now() / featuresUpdatedAt = now()
4. UPDATE tool_candidates SET status='approved', reviewedBy='admin', reviewedAt=now()
5. revalidatePath('/admin/tools')
6. revalidatePath('/tools')
```

**API reject 逻辑**：

```typescript
1. 接收 { reason: string }
2. UPDATE tool_candidates SET status='rejected', rejectReason=$reason, reviewedBy='admin', reviewedAt=now()
3. revalidatePath('/admin/tools')
```

**对比页 approve 逻辑**：

```typescript
1. UPDATE comparisons SET status='published', publishedAt=now(), reviewedBy='admin', reviewedAt=now()
2. revalidatePath('/compare')
3. revalidatePath(`/compare/${id}`)
```

**资讯 hide 逻辑**：

```typescript
1. UPDATE articles SET status='hidden', reviewedBy='admin', reviewedAt=now()
2. revalidatePath('/news')
```

**API 共同要求**：
- 全部 POST，使用 JSON body
- 返回 `{ ok: true }` 或 `{ ok: false, error: '...' }`
- 客户端调用后跳回列表页

**验证**：
- 工具候选 approve → tools 表多一行 + 候选 status='approved'
- 工具候选 reject → 候选 status='rejected'，有 rejectReason
- 对比页 approve → comparisons.status='published'，前台 `/compare/[slug]` 可访问
- 资讯 hide → articles.status='hidden'，前台 `/news` 不再出现
- 每个操作 reviewedBy 和 reviewedAt 都有值
- `npm run lint && npm run build` 通过

**Commit message 模板**：`feat(I8.4): add admin detail pages + approve/reject/hide API routes`

---

### I8.5（P0，必须最后做）：改 process-tool-candidates 行为为不再自动 publish

**预估工程量**：30 分钟

**前置依赖**：I8.1 + I8.2 + I8.3 + I8.4 全部完成且**部署到 Vercel 验证可用**

**警告**：本 commit 会**永久停掉自动 publish 逻辑**。如果 Admin UI 没经过验证就推这个 commit，会出现"AI 处理过的工具候选无法上线（脚本不再写 tools 表，又没人用 admin 审核）"的死锁状态。

**改动 `lib/jobs/process-tool-candidates.ts`**：

之前逻辑（伪代码）：
```
for each pending candidate:
  AI 处理 → 拿到 zh/catId/pricing/...
  → publishToolCandidate()  # 写入 tools 表 + 设 status='approved'
```

新逻辑：
```
for each pending candidate:
  AI 处理 → 拿到 zh/catId/pricing/...
  → UPDATE tool_candidates SET
        zh=$1, catId=$2, pricing=$3, chinaAccess=$4, features=$5,
        howToUse=$6, faqs=$7, ...,
        status='ai_drafted'  # 不再 publish，等 admin 审核
     WHERE id=$candidateId
  → 不调用 publishToolCandidate()
```

**`publishToolCandidate` 函数保留不删**——仍由 I8.4 的 admin approve API 路由调用。但要清理：让它只接受已审核数据，不再被 process 脚本直接调用。

**部署同步要点**：
- 推送 commit 后立即在 Vercel 触发 redeploy（避免旧代码 cron 还在跑 auto-publish）
- 监控部署后第一次 `/api/cron/refresh-tools` 调用：检查日志确认走的是新逻辑（搜索 "status='ai_drafted'" 关键词）

**回滚方案**（万一出问题）：
- 暂时把 `lib/jobs/process-tool-candidates.ts` 文件 revert 到本 commit 之前的版本
- 已经被标记 `ai_drafted` 的候选不会自动 publish，需要在 admin 通过

**验证**：
- 手动触发 `npm run process:tool-candidates` 一次（在主工作区跑），观察：
  - 候选 status 从 'pending' → 'ai_drafted'，**不**进入 tools 表
  - admin `/admin/tools` 列表页能看到这些新候选
- 在 admin 通过其中 1-2 条 → tools 表新增对应行
- `npm run lint && npm run build` 通过

**Commit message 模板**：`feat(I8.5): stop auto-publish in process-tool-candidates, mark as ai_drafted instead`

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
- [x] J4：Footer 组件已在前期清理中删除，prop 命名错误自然消失
- [x] J5：首页不再出现"按场景找工具"区块，相关代码全部删除
- [x] J6：Hero 侧边栏 3 个入口视觉协调（J1 + I5 已实现）
- [x] I1：全站无 `AiToolsBox` 用户可见字符串
- [x] I2：`/news` 无乱码或纯英文条目（脚本已上线，待运营首次执行）
- [x] I3：工具详情页定价区块有「最后更新」时间提示，过期数据有黄色警告
- [x] I4：`/compare/cursor-vs-trae` 可访问，含 Methodology Box 区块
- [x] I5：首页 3 个决策入口显示 emoji 图标，可正确跳转
- [x] I6：裸域 → www 永久重定向（301），所有页面有 canonical 标签
- [x] I7：4 个合规页面（/about、/privacy、/submit-guide、/disclaimer）可访问，sitemap 已收录
- [x] I8.1：tool_candidates / comparisons / articles 三表新增 reviewedBy/reviewedAt/rejectReason 字段，已 db:push（commit adf807a）
- [x] I8.2：`middleware.ts` 鉴权 + `/admin/login` 登录页 + cookie 设置可用（commit 1230fad）
- [ ] I8.3：`/admin` 总览页 + 三类列表页可访问，数字徽章正确
- [ ] I8.4：审核详情页 + approve/reject/hide API 路由可用，操作后状态正确流转
- [ ] I8.5：`process-tool-candidates` 改为只设 status='ai_drafted'，不再写 tools 表（部署后 cron 验证走新逻辑）
- [ ] I9：每日 09:00 邮件通知有待审核内容（数量为 0 时不发邮件）
- [ ] 全部：`npm run lint && npm run build` 通过，无新增 warning
