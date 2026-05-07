# Sprint 2 任务清单（第 31-60 天）：决策内容上线

> **前置条件**：Sprint 1 全部完成（`/compare` 模板存在、品牌统一、数据时效标注上线）。
>
> **目标**：建立核心内容矩阵，启动 SEO 流量积累。
>
> **完成标准**：至少 10 个对比页被 Search Console 收录，核心对比词有展示量，至少 3 个页面进入目标词前 50 名。
>
> **执行规则**：每个任务独立 commit，commit message 注明任务编号（如 `feat(I6): 发布 cursor-vs-trae 对比页`）。

---

## 第 5-6 周：AI 编程核心内容

### I6（高优先级）：发布 10 个 AI 编程核心对比页

**依赖**：I4（comparisons 表 + `/compare/[slug]` 页面）已完成

**第一批对比页清单**（按搜索热度排序，优先执行靠前的）：

| 顺序 | id (slug) | 标题 | 目标 SEO 词 |
|---|---|---|---|
| 1 | `cursor-vs-trae` | Cursor vs Trae：国内程序员怎么选 | Cursor vs Trae、Trae 和 Cursor 哪个好 |
| 2 | `claude-code-vs-cursor` | Claude Code vs Cursor：AI 编程助手深度对比 | Claude Code vs Cursor |
| 3 | `deepseek-vs-kimi` | DeepSeek vs Kimi：国内 AI 助手横评 | DeepSeek 和 Kimi 哪个好用 |
| 4 | `doubao-vs-kimi` | 豆包 vs Kimi：日常使用哪个更好 | 豆包和 Kimi 区别 |
| 5 | `claude-code-vs-codex` | Claude Code vs OpenAI Codex | Claude Code vs Codex |
| 6 | `cursor-vs-github-copilot` | Cursor vs GitHub Copilot：2025 最新横评 | Cursor 和 Copilot 哪个好 |
| 7 | `trae-vs-github-copilot` | Trae vs GitHub Copilot：国内开发者对比 | Trae 哪个好 |
| 8 | `cursor-vs-windsurf` | Cursor vs Windsurf：AI IDE 横评 | Cursor vs Windsurf |
| 9 | `deepseek-vs-chatgpt` | DeepSeek vs ChatGPT：中文场景对比 | DeepSeek 和 ChatGPT 哪个好 |
| 10 | `kimi-vs-wenxin` | Kimi vs 文心一言：长文本处理对比 | Kimi 和文心一言比较 |

**内容生产流程**（每篇约 60-90 分钟）：

```
1. DeepSeek 起草对比正文（使用下方 prompt 模板）
2. 人工核对两个工具的定价、版本号、国内可用性
3. 人工填写 Methodology Box（testedAt / testedEnv / testedBy / evalSet）
4. 写 verdict（编辑结论，2-3 句，明确说谁适合谁）
5. 写入 comparisons 表 status='draft' → 审核 → status='published'
```

**DeepSeek 内容生成脚本**：新建 `scripts/draft-comparison.ts`

```typescript
// 用法: npm run draft:comparison -- cursor trae
// 从 tools 表读取两个工具数据，生成 prompt，调 DeepSeek，输出 markdown 草稿到 stdout
```

prompt 模板：
```
你是一位国内 AI 工具实测专家，正在写《[工具A] vs [工具B]》横评文章。

工具 A 基本信息：[从 DB 读取 name/pricing/chinaAccess/features]
工具 B 基本信息：[从 DB 读取 name/pricing/chinaAccess/features]

必须覆盖的对比维度：
1. 核心功能差异（各自擅长什么）
2. 国内可用性（直连/需代理/稳定性）
3. 中文支持质量（界面/文档/输出）
4. 定价与性价比（含人民币参考价）
5. 适合的用户场景（明确说谁应该选 A，谁应该选 B）

输出：3000-4000 字 markdown，含「编辑结论」段（必须明确推荐，不允许模糊表述）。
```

`package.json` 新增脚本：
```json
"draft:comparison": "tsx scripts/draft-comparison.ts"
```

**验证**：
- 10 个对比页 `status='published'`，`/compare` 列表页均可见
- 每篇有 Methodology Box（允许 `testedBy` 为"编辑实测"，`evalSet` 为"主观体验测试"，但不允许全部字段为空）
- `npm run build` 通过

---

### I7（高优先级）：AIBoxPro Lab 首份实测报告

**说明**：Lab 报告比普通对比页更深，需要真实测试数据和完整 Methodology Box。第一份报告选 `Claude Code vs Cursor` 深度压测。

**选择**：Lab 报告复用 `comparisons` 表（`is_lab_report = true` 字段标记），不单独建表，降低实施复杂度。

**schema 修改**，`comparisons` 表追加字段：

```typescript
isLabReport:   boolean('is_lab_report').notNull().default(false),
labReportId:   text('lab_report_id'),   // 如 'LAB-202501-001'
sampleSize:    text('sample_size'),     // '每题 3 次独立测试，取中位数'
reproducible:  boolean('reproducible').default(false),  // 是否提供可复现步骤
repoUrl:       text('repo_url'),        // 测试脚本 GitHub 链接（可选）
```

运行 `npm run db:push`。

**第一份报告内容要求**（`id = 'lab-claude-code-vs-cursor-202501'`）：

Methodology Box 所有字段必须有真实值，不允许「待补充」：
```
labReportId:  LAB-202501-001
testedAt:     实际测试日期
testedEnv:    操作系统 / IDE 版本 / 网络环境（运营商 + 是否代理）
testedBy:     编辑署名
evalSet:      具体评测集说明（如：Codeforces Div.2 A-C 题，随机抽取 30 题）
sampleSize:   每题独立测试 N 次，取中位数
reproducible: true（需提供可复现的测试步骤描述）
```

**前端展示**：`/compare/[slug]` 详情页检查 `isLabReport` 字段：
- 若为 true，在标题旁显示「🔬 AIBoxPro Lab」徽章
- Methodology Box 展开显示更多字段（`sampleSize` / `reproducible` / `repoUrl`）

**验证**：
- `/compare/lab-claude-code-vs-cursor-202501` 页面有「🔬 AIBoxPro Lab」徽章
- Methodology Box 所有字段有真实值（无「待补充」）
- Claude Code 和 Cursor 详情页底部反向引用该报告

---

## 第 7 周：SEO 基础设施

### I8（中优先级）：Cursor 替代品专题 + SEO 结构化数据

**I8-1：替代品专题页**

新建 `app/alternatives/[slug]/page.tsx`：

- 路径示例：`/alternatives/cursor`
- 标题：`Cursor 的国产替代方案`
- 工具列表：从 `tools` 表查询 `cnAlternatives` 字段包含该工具 id 的条目（G7 已有此字段），或手动指定候选列表
- 每个替代工具显示：logo、名称、简短推荐理由、访问方式标签
- JSON-LD `ItemList` schema

新建 `app/alternatives/page.tsx`（列表页，列出已有的替代品专题）

首批专题：`cursor`、`chatgpt`、`midjourney`（每个页面至少列出 3 个替代工具）

**I8-2：对比页 SEO 结构化数据**

`app/compare/[slug]/page.tsx` 新增：

```typescript
// FAQPage schema（从 body markdown 提取 ## 开头的标题生成 FAQ）
// BreadcrumbList：首页 → 工具对比 → [具体对比页]
```

**sitemap.ts 更新**：新增 `/compare/*`、`/alternatives/*` 路径（`/compare` 路径若 Sprint 1 已加则跳过）

**提交 Sitemap**：运行 `npm run build`，在 Google Search Console 提交新版 sitemap URL

**验证**：
- `/alternatives/cursor` 渲染正常，列出至少 3 个工具
- 用 Google Rich Results Test 验证 `/compare/cursor-vs-trae` 的 FAQ schema 有效
- `npm run build` 通过，sitemap 包含 `/alternatives/*`

---

## 第 8 周：连通性地图冷启动

### I9（中优先级）：连通性数据层 + 编辑实测填充

**数据层**，`lib/db/schema.ts` 新增表：

```typescript
export const toolConnectivity = pgTable('tool_connectivity', {
  id:         text('id').primaryKey().default(sql`gen_random_uuid()`),
  toolId:     text('tool_id').notNull(),
  carrier:    text('carrier').notNull(),     // 'telecom' | 'unicom' | 'mobile'
  region:     text('region'),               // '上海' | '北京'（可选）
  status:     text('status').notNull(),     // 'direct' | 'proxy-needed' | 'blocked'
  latencyMs:  integer('latency_ms'),
  source:     text('source').notNull(),     // 'editor' | 'user-report'
  reportedAt: timestamp('reported_at').notNull().defaultNow(),
  reportedBy: text('reported_by'),
  note:       text('note'),
});
```

运行 `npm run db:push`。

新增 query：`loadConnectivityByToolId(toolId)` — 返回该工具最新一条各运营商数据

**初始数据填充脚本**：新建 `scripts/seed-connectivity.ts`

手动录入以下 10 个核心工具 × 3 运营商 = 30 条编辑实测数据：

| 工具 | 说明 |
|---|---|
| claude（claude.ai） | 海外工具，国内通常需代理 |
| cursor | 海外工具 |
| chatgpt | 海外工具 |
| doubao | 国内，直连 |
| kimi | 国内，直连 |
| deepseek | 国内，直连 |
| wenxin（文心一言） | 国内，直连 |
| tongyi（通义千问） | 国内，直连 |
| trae | 需实测确认 |
| github-copilot | 海外工具 |

每条数据 `source = 'editor'`，`reportedAt` 为实测日期。

`package.json` 新增脚本：
```json
"seed:connectivity": "tsx scripts/seed-connectivity.ts"
```

**前端展示**：`app/tools/[slug]/page.tsx`「国内用户须知」区块下方新增连通性表格：

```
| 运营商 | 状态     | 延迟   | 最后更新      | 来源     |
|--------|----------|--------|---------------|----------|
| 电信   | 需代理   | —      | 2025-01-15    | 编辑实测 |
| 联通   | 直连     | 450ms  | 2025-01-15    | 编辑实测 |
| 移动   | 需代理   | —      | 2025-01-15    | 编辑实测 |
```

**重要**：
- `reportedAt` 超过 14 天的条目在前端显示「状态待确认」
- 不声称"实时"，所有数据必须显示来源和日期

**验证**：
- `npm run seed:connectivity` 写入 30 条数据
- Claude、Cursor、豆包等工具详情页显示连通性表格
- 超过 14 天的测试条目显示「状态待确认」
- `npm run build` 通过

---

## Sprint 2 完成标准

- [ ] I6：10 个对比页 `status='published'`，`/compare` 列表页均可见，每篇有 Methodology Box
- [ ] I7：Lab 报告上线，Methodology Box 所有字段有真实值，Claude Code / Cursor 详情页反向引用
- [ ] I8：`/alternatives/cursor` 上线，至少 3 个工具；FAQ schema 通过 Rich Results Test
- [ ] I9：30 条连通性数据入库，10 个工具详情页显示连通性表格
- [ ] SEO：新 sitemap 已提交 Search Console，核心对比词有可统计展示量，至少 3 个页面进入目标词前 50 名
- [ ] 全部：`npm run lint && npm run build` 通过，无新增 warning
