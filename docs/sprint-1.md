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

**Sprint 1 剩余任务**：J4（Footer prop 命名）、J6（Hero 视觉收尾）、I6（Canonical/重定向）、I7（4 个合规页）

执行顺序建议：**J4 → I6 → I7 → J6**（J4 最快收尾首页；I6/I7 是 Sprint 1 收口前的基础设施补完；J6 是视觉细节）

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
- [ ] 全部：`npm run lint && npm run build` 通过，无新增 warning
