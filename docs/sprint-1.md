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
| J2 搜索 query 透传 + Enter 提交 | ✅ 已完成 | 61f2787 + 后续 |
| J3 移除 news prop | ✅ 已完成 | 后续 commit |
| J4 Footer prop 命名 | 🟡 待做 | — |
| J5 删除场景模块 | ✅ 已完成 | 394a180 |
| J6 Hero 侧边栏视觉 | 🟡 待做（依赖 I5） | — |
| I1 品牌统一 AIBoxPro | 🟡 待做 | — |
| I2 历史乱码清理 | 🟡 待做 | — |
| I3 数据时效性标注 | 🟡 待做 | — |
| I4 对比页模板 | 🟡 待做 | — |
| I5 首页三大决策入口（emoji 图标） | 🟡 待做 | — |

CODEX 接手时建议顺序：**J4 → I1 → I2 → I5 → I3 → I4**（J4 最快收尾首页修复，I1/I2 是低风险的信任修复，然后 I5 视觉补完，最后 I3/I4 为对比页内容做数据准备）。

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

### I1（P0）：品牌名全站统一为 AIBoxPro

**文件**：多处，见下

**问题**：代码中仍存在 `AiToolsBox` 残留，与白皮书第一期 P0 要求冲突。

**需要修改的位置**：

1. `lib/jobs/fetch-aibot-sitemap.ts` — crawler User-Agent：
   ```typescript
   // 改前
   'AiToolsBox-Crawler/1.0 (https://aiboxpro.cn; respectful)'
   // 改后
   'AIBoxPro-Crawler/1.0 (https://aiboxpro.cn; respectful)'
   ```
2. 全局搜索 `AiToolsBox`（大小写不敏感），替换所有**用户可见字符串**为 `AIBoxPro`
3. `app/layout.tsx` — 确认 `<title>` 和 `metadataBase` 使用 `AIBoxPro`
4. `components/SiteHeader.tsx` — 确认导航栏 logo/文字为 `AIBoxPro`
5. `app/og/route.tsx` — OG 图片生成中的品牌名

**验证**：
```bash
grep -ri "aitoolsbox" --include="*.ts" --include="*.tsx" .
```
结果只剩历史注释，无用户可见字符串；首页、工具详情页 title 均为 `AIBoxPro`。

---

### I2（高优先级）：清理历史乱码资讯

**文件**：新建 `scripts/cleanup-articles.ts`

**问题**：资讯模块存在编码乱码和过期数据，损害平台可信度。

**实施步骤**：

1. 新建 `scripts/cleanup-articles.ts`，识别以下问题条目：
   - 标题或 `summaryZh` 包含连续 3 个以上 `<` 或 `?`（编码乱码特征）
   - `lang = 'zh'` 但标题为纯 ASCII 英文
   - `publishedAt` 超过 180 天且 `views = 0`

2. 对识别出的条目执行 `UPDATE articles SET status = 'hidden'`（不硬删除，保留历史记录）

3. `package.json` 新增脚本：
   ```json
   "cleanup:articles": "tsx scripts/cleanup-articles.ts"
   ```

4. 脚本运行后输出统计：`隐藏 X 条（乱码 Y / 语言错误 Z / 过期 W）`

**验证**：运行脚本后访问 `/news`，无乱码标题，无纯英文条目。

---

## 第 3-4 周：数据基础 + 对比页模板

### I3（高优先级）：工具字段数据时效性标注

**文件**：`lib/db/schema.ts`、`lib/db/queries.ts`、`app/tools/[slug]/page.tsx`

**实施步骤**：

1. `lib/db/schema.ts`，`tools` 表新增字段：
   ```typescript
   pricingUpdatedAt:    timestamp('pricing_updated_at'),
   accessUpdatedAt:     timestamp('access_updated_at'),
   featuresUpdatedAt:   timestamp('features_updated_at'),
   complianceUpdatedAt: timestamp('compliance_updated_at'),
   ```

2. 运行 `npm run db:push`

3. `lib/db/queries.ts`：`loadToolById` 返回这四个字段

4. `app/tools/[slug]/page.tsx`，在定价和国内用户须知区块加过期标注：
   - `pricingUpdatedAt` 为空或超过 30 天 → 显示黄色提示：`「价格信息最后更新：X 天前，建议以官网为准」`
   - `accessUpdatedAt` 超过 14 天 → 同上
   - 合规状态超过 90 天 → 标注「状态待核实」

5. `lib/jobs/process-tool-candidates.ts`：新工具入库时写入 `pricingUpdatedAt = now()`、`accessUpdatedAt = now()`

**验证**：
- 工具详情页定价区块有「最后更新」提示
- 将某工具 `pricingUpdatedAt` 手动改为 40 天前，页面出现黄色警告
- `npm run build` 通过

---

### I4（高优先级）：标准化对比页模板

**文件**：`lib/db/schema.ts`、`lib/db/queries.ts`、新建 `app/compare/[slug]/page.tsx`、新建 `app/compare/page.tsx`、`app/sitemap.ts`

**数据层**，`lib/db/schema.ts` 新增表：

```typescript
export const comparisons = pgTable('comparisons', {
  id:          text('id').primaryKey(),           // slug: 'cursor-vs-trae'
  toolAId:     text('tool_a_id').notNull(),
  toolBId:     text('tool_b_id').notNull(),
  title:       text('title').notNull(),            // 'Cursor vs Trae：国内程序员怎么选？'
  summary:     text('summary'),                   // 编辑结论摘要（200 字内）
  body:        text('body'),                      // markdown 详细对比正文
  verdict:     text('verdict'),                   // 最终推荐结论（2-3 句）
  // Methodology Box 字段
  testedAt:    timestamp('tested_at'),
  testedEnv:   text('tested_env'),               // 测试环境描述
  testedBy:    text('tested_by'),
  evalSet:     text('eval_set'),                 // 评测集说明
  seoKeywords: text('seo_keywords').array(),
  status:      text('status').notNull().default('draft'),
  publishedAt: timestamp('published_at'),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  statusIdx:    index('comparisons_status_idx').on(t.status),
  publishedIdx: index('comparisons_published_idx').on(t.publishedAt),
}));
```

运行 `npm run db:push`。

新增 queries：
- `loadAllComparisons()` — 列出 published 对比页
- `loadComparisonById(id)` — 详情（含两个工具完整数据）

**前端页面**：

`app/compare/page.tsx`（列表页）：
- 卡片网格，显示两个工具名 + `vs` + 摘要
- `revalidate = 3600`（ISR）

`app/compare/[slug]/page.tsx`（详情页）：
- Hero：两个工具名并排 + VS + summary
- **Methodology Box 区块**（固定位置，字段为空时显示「待补充」占位，不允许隐藏该区块）：
  ```
  测试时间 / 测试版本 / 测试环境 / 评测集说明 / 测试人
  ```
- 对比表格：从两个工具各取定价、国内可用性、中文支持字段自动渲染
- 正文：`body` markdown 渲染
- 编辑结论：`verdict` 醒目展示
- 文末：相关对比页（同工具其他对比）
- JSON-LD `Article` schema

`app/sitemap.ts`：新增 `/compare/*` 路径

**验证**：
- `npm run db:push` 成功，`comparisons` 表存在
- 手动插入一条测试数据（`status='published'`），`/compare/[slug]` 页面渲染正常
- 页面包含 Methodology Box 区块（即使字段为空）
- `npm run build` 通过

---

### I5（中优先级）：首页三大决策入口（静态版）

**文件**：`components/V2Pro.tsx`

**说明**：本项目不做场景指南（H 系列已废弃），首页决策入口由白皮书要求的 4 个调整为 3 个，聚焦"对比 / 替代 / 榜单"三条决策路径。J1 已修复 href，本任务在此基础上优化视觉。

**改造内容**：

```typescript
// decisionLinks 调整：补充 icon 字段，替换"取标题首字"图标
{ title: '对比两个 AI 工具', icon: '⚖️', href: '/compare' },
{ title: '寻找替代方案',     icon: '🔄', href: '/tools?china=accessible' },
{ title: '查看编辑榜单',     icon: '📊', href: '/tools?sort=score' },
```

- `DecisionLink` 类型新增 `icon: string` 字段
- `Hero` 侧边栏渲染中用 `link.icon` 替换 `link.title.slice(0, 1)`

**验证**：首页侧边栏 3 个入口显示 emoji 图标；移动端无横向滚动；`npm run build` 通过。

---

## Sprint 1 完成标准

- [x] J1：决策入口和对比卡 href 指向正确路径（3 个 decisionLinks，4 个 compareCards）
- [x] J2：搜索词透传至 `/tools?q=`（按钮 + Enter 键均生效）
- [x] J3：`loadHomepageData()` 不查询资讯，`HomeData` 无 `news` 字段
- [ ] J4：`Footer` prop 名为 `toolCount`
- [x] J5：首页不再出现"按场景找工具"区块，相关代码全部删除
- [ ] J6：Hero 侧边栏 3 个入口视觉协调
- [ ] I1：全站无 `AiToolsBox` 用户可见字符串
- [ ] I2：`/news` 无乱码或纯英文条目
- [ ] I3：工具详情页定价区块有「最后更新」时间提示，过期数据有黄色警告
- [ ] I4：`/compare/cursor-vs-trae` 可访问，含 Methodology Box 区块
- [ ] I5：首页 3 个决策入口显示 emoji 图标，可正确跳转
- [ ] 全部：`npm run lint && npm run build` 通过，无新增 warning
