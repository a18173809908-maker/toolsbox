# AIBoxPro 开发计划与执行规格（2026-05）

最后更新：2026-05-11

## 文档关系

- 长期战略源：`docs/aiboxpro_详细版竞品分析与发展路线方案.md`
- 分期路线图：`docs/phased-roadmap.md`
- 当前定位：`docs/current-position.md`
- **本文件**：当前阶段执行规格。冲突时以本文件为准。

本文件是经过 8 轮讨论锁定的执行规格，包含 schema、CLI 签名、admin 路由、验收命令。M1 是 spec 级，M2 / M3 是任务级。

---

## 一、核心架构原则（贯穿全计划）

### 1.1 人参与边界

人只做两件事：

1. **审核草稿**：在 `/admin/*` 看 `ai_drafted` 列表，点 publish 或 reject。
2. **写 5 个 verdict few-shot 样本**：定义本站观点的语气基因。这是项目里唯一不可替代的人工劳动，2-3 小时一次性投入。

机器（脚本 / LLM / GitHub Actions）做其它一切：抓数据、起草、聚类、巡检、生成 sitemap。

### 1.2 Prompt 是一等资产

Prompt 决定每个页面长什么样。schema、admin、CLI 是脚手架；prompt 是内容。

- Prompt 在 `prompts/` 目录里，git 版本化。
- 每条 draft 入库时记录 `promptVersion` + `llmModel`，未来 A/B 比较和回溯靠这两个字段。
- 第一版 prompt 必然产出套话。靠 `eval:prompt` 脚本 + 反套话审计迭代。

### 1.3 立场字段独立于客观字段

工具详情、事件、对比页都分两层：

- **客观层**：features / pricing / chinaAccess / 等。来源是官网/RSS，照搬 + 翻译即可。
- **立场层**：verdict_one_liner / who_should_pick / position_today / 等。来源是 LLM 起草 + 人审核。

两层在 schema、UI、起草流程上**完全分开**。立场字段有独立的表 `tool_verdicts` / `event_verdicts`，独立的 admin 路由，独立的视觉区域。

### 1.4 内容审核流泛化

6 类内容统一三态流转：

```
ai_drafted → admin review → published / rejected
```

每类内容一张 draft 表，一个 admin 路由，一条 CLI 命令。Schema 和路由命名统一。

### 1.5 6 类内容的统一流程

```
┌────────────────────────────────────────────────────────────┐
│ 触发方式                                                    │
│   • CLI: npm run draft:<type> <slug>                       │
│   • GitHub Actions 周跑：自动巡检 → 自动起草                │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│ 抓数据（fetch 官网/RSS/已有 DB 数据）                       │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│ LLM 起草（带 few-shot + 同类工具对比锚点）                  │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│ 反套话审计（同 LLM 或 premium LLM 二次调用打分）            │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│ 写入 *_drafts 表，status='ai_drafted'                       │
└────────────────────┬───────────────────────────────────────┘
                     │ CLI 打印 admin URL
                     ▼
┌────────────────────────────────────────────────────────────┐
│ 你在 /admin/<type> 审核：publish 或 reject                  │
└────────────────────────────────────────────────────────────┘
```

唯一例外：`articles`（单条资讯）不走人工审核，靠起草过滤器严格丢弃低质量条目。

### 1.6 资讯模块：A + B 组合

- **A 路径**：`articles` 表保留，但起草 prompt 强制要求带 ①一句话事件 ②国内影响 ③至少 1 个站内资产链接。凑不齐 → 不入候选池 → 不发布。
- **B 路径**：多条 articles 描述同一事件 → 自动聚类到 `events` 表。事件页有独立 URL、独立 verdict、独立 SEO 价值。
- articles 是事件的原材料，events 是事件的沉淀。两者不竞争。

---

## 二、对详细版战略方案的修正（10 条）

| # | 详细版的说法 | 修正 | 原因 |
|---|---|---|---|
| 1 | 三个月路线，第二月 70 篇内容 | 改为每月闭环 1 个品类 | 不依赖人工约束下做不到 70 篇 |
| 2 | 16 个一级分类全铺开 | 当前只盯 1-2 个主线品类 | 详细版自我矛盾（同文档又说"不快速扩张品类"） |
| 3 | Phase 3 第一品类做 AI 写作 | 改为 **AI 编程** | 差异大、付费意愿强、工具底座已存在、与 GitHub Trending 协同 |
| 4 | 只讲传统 SEO | 新增 **GEO**（生成式搜索引擎优化） | 用户越来越多直接问 LLM"哪个工具好" |
| 5 | 没讨论数据老化 | 新增字段级"最后核对"标记 + 自动巡检 | 国内可用性 / 价格变化快 |
| 6 | MySQL 风格 schema | 以 Postgres + Drizzle 为准 | 实际栈 |
| 7 | 对比只支持 2 工具 | 扩展为 N 工具（N ≤ 5） | 实际决策常涉及 3+ 工具 |
| 8 | AI 摘要流 | 改为决策影响 + 站内资产链接（A 路径）+ 事件页（B 路径） | Google Helpful Content Update 后摘要流是低质量信号 |
| 9 | 资讯没说差异化 | 国内可用性 + 站内资产关联 + 事件页沉淀，是 X/即刻/微博 的盲区 | 不在信息流维度跟它们比 |
| 10 | 付费收录给具体报价 | 商业化全部推迟到 Phase 6 | 没流量基础时报价没法卖 |

---

## 三、当前项目状态盘点

### 3.1 已完成

| 模块 | 状态 |
|---|---|
| 工具库（74 工具） | ✅ 含国内决策字段 |
| 工具详情页 | ✅ 含 freshness warning（但只警示官网，未到字段级） |
| 对比页（10 篇视频） | ✅ 含 JSON-LD，但只支持 2 工具，无横向并列表 |
| 替代品专题（5 个） | ✅ hard-coded 在 `lib/alternatives.ts` |
| 场景指南（4 个视频场景） | ✅ hard-coded 在 `lib/scenes.ts` |
| AI 资讯 `/news` | ✅ 含 aiInsights，但偏整理模式无观点 |
| GitHub Trending | ✅ 含中文摘要 |
| 信息源候选池 | ✅ `/admin/sources` |
| Sitemap | ✅ |
| 对比页社交分发草稿 | ✅ `npm run draft:social` |

### 3.2 缺口

1. 立场字段完全缺位（最大缺口）
2. Prompt 工程无规范（散在多个脚本里）
3. 多工具对比无法承载
4. 内容审核流只覆盖 sources 和 tool candidates
5. 数据字段级老化标记缺失
6. GEO 不规范
7. 榜单页 `/best/[topic]` 未实现
8. 事件页未实现
9. 对比页 UI 不是真"横向对比"
10. 工具列表卡片信息过密、无排序、移动端 sidebar 未收起

---

## 四、Schema 设计

### 4.1 新表清单（M1 第 2 周一次性建好）

```text
tool_verdicts              工具立场字段（独立表，保留历史版本）
events                     事件主表
event_verdicts             事件立场字段
comparison_drafts          对比页草稿
scene_drafts               场景页草稿
alternative_drafts         替代品专题草稿
ranking_drafts             榜单页草稿
tool_field_drafts          已入库工具的字段补全候选
```

事件最终发布表用 `events`（含 published 状态），不另开 `events_published`。其余 5 张 draft 表只持有草稿，审核通过后写入对应主表（`comparisons` / `scenes_main` / `alternatives_main` / `rankings` / `tools`）。

### 4.2 关键表 schema 示例：`tool_verdicts`

```ts
export const toolVerdicts = pgTable(
  'tool_verdicts',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    toolId: text('tool_id').notNull().references(() => tools.id),

    // 立场字段（schema 经 M1 第 1 周 verdict 样本锁定后定型）
    verdictOneLiner: text('verdict_one_liner').notNull(),  // ≤ 60 字
    whoShouldPick: text('who_should_pick').array(),        // 3-5 条角色描述
    whoShouldSkip: text('who_should_skip').array(),        // 3-5 条场景，含替代出口
    vsAlternatives: jsonb('vs_alternatives').$type<{ alt: string; point: string }[]>(),
    positionToday: text('position_today'),                 // 6 枚举值之一：国际第一梯队 / 国产第一梯队 / 仍领先 / 已被超越 / 观察中 / 小众但有差异化
    caveats: text('caveats').array(),                      // 3-6 条名词短语 + 量化

    // 起草元信息
    promptVersion: text('prompt_version').notNull(),  // e.g. 'tool-verdict.v1'
    llmModel: text('llm_model').notNull(),            // e.g. 'deepseek-chat'
    antiClicheScore: integer('anti_cliche_score'),    // 审计器打分 0-100

    // 审核
    status: text('status').notNull().default('ai_drafted'),  // ai_drafted / published / rejected
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    rejectReason: text('reject_reason'),

    // 时效（6 个月失效）
    verdictUpdatedAt: timestamp('verdict_updated_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at'),  // 起草时自动写 verdictUpdatedAt + 180 天

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    toolIdx: index('tool_verdicts_tool_idx').on(t.toolId),
    statusIdx: index('tool_verdicts_status_idx').on(t.status),
    expiresIdx: index('tool_verdicts_expires_idx').on(t.expiresAt),
  }),
);
```

工具详情页查询用：`SELECT * FROM tool_verdicts WHERE tool_id = ? AND status='published' ORDER BY verdict_updated_at DESC LIMIT 1`。

### 4.3 其它 draft 表的统一字段约定

每张 `*_drafts` 表必带：

```ts
id              // uuid
slug            // 目标 URL slug
sourceData      // jsonb，起草输入的原始数据快照
aiDraft         // jsonb，LLM 起草的完整结构化内容
promptVersion   // text
llmModel        // text
antiClicheScore // integer
status          // 'ai_drafted' / 'published' / 'rejected'
reviewedBy      // text
reviewedAt      // timestamp
rejectReason    // text
createdAt       // timestamp
publishedAt     // timestamp
```

具体内容字段（标题、正文、关联工具等）放在 `aiDraft` JSON 里，不在表上拆字段——拆字段会让每类内容 schema 差异大、admin 通用 UI 难写。

### 4.4 对 `comparisons` 表的扩展

新增字段：

```ts
toolIds: text('tool_ids').array(),    // 兼容 2 工具时可空；多工具时填
verdictOneLiner: text('verdict_one_liner'),  // 一句话结论（GEO）
mentions: jsonb('mentions'),          // 用于 JSON-LD：[{name, url}]
```

`toolAId` / `toolBId` 保留不动。N 工具对比时 `toolIds` 是权威源；2 工具对比继续用 `toolAId` / `toolBId`。读取时优先 `toolIds`，回退到 `toolAId` / `toolBId` 拼成 2 元数组。

---

## 五、Prompt 文件规范

### 5.1 目录结构

```
prompts/
├── README.md                          # 规范说明
├── tool-verdict/
│   ├── v1.md                          # 当前版本（YAML frontmatter + body）
│   ├── v0.md                          # 旧版本（保留可回退）
│   └── examples/
│       ├── cursor.md
│       ├── trae.md
│       ├── kling.md
│       ├── runway.md
│       └── doubao.md
├── event-verdict/
│   ├── v1.md
│   └── examples/
├── comparison-draft/
│   └── v1.md
├── scene-draft/
│   └── v1.md
├── ranking-draft/
│   └── v1.md
├── alternative-draft/
│   └── v1.md
├── tool-field-draft/
│   └── v1.md
├── article-draft/                     # A 路径：严格起草过滤器
│   └── v1.md
└── audit/
    └── anti-cliche.v1.md
```

### 5.2 frontmatter 字段

```yaml
---
name: tool-verdict
version: v1
model_tier: standard   # standard 用 DEEPSEEK_MODEL；premium 用 LLM_MODEL_PREMIUM（暂同 DeepSeek）
temperature: 0.6
max_tokens: 1500
require_few_shot: true
require_anti_cliche_audit: true
---

# Prompt body (markdown)

你是 AIBoxPro 的工具评测编辑……
```

`model_tier` 用于 Q12 决策：当前全部 `standard`（DeepSeek）。未来要升 premium 只改 `.env` 的 `LLM_MODEL_PREMIUM`，prompt 文件 frontmatter 改一个字段就切换。

### 5.3 few-shot 样本格式

每个 example 文件就是一份"目标输出 + 输入数据"对：

```markdown
---
tool_id: cursor
written_by: human
written_at: 2026-05-12
---

## 输入数据（起草时给 LLM 的客观字段）

```json
{
  "name": "Cursor",
  "category": "coding",
  "pricing": "Freemium",
  "priceCny": "$20/月（约 ¥145）",
  "chinaAccess": "accessible",
  "chineseUi": false,
  "features": ["AI 代码补全", "Composer 多文件编辑", "Codebase 索引"],
  "alternatives": ["Windsurf", "Claude Code", "GitHub Copilot"]
}
```

## 目标输出（手写的 verdict）

verdictOneLiner: 个人开发者和小团队当前最值得试的 AI IDE，但要为账号和支付绕路。

whoShouldPick:
- 已经在用 VS Code 的、做项目级重构的、能解决海外支付的

whoShouldSkip:
- 公司有合规限制的、只做小脚本补全的、不想付月费的

vsTopAlternative:
- 比 Windsurf 多了项目级问答深度，但订阅贵 1/3
- 比 Claude Code 多了 IDE 内嵌，但少了终端代理的灵活性

positionToday: 国际第一梯队

caveats:
- 大仓库索引慢
- Composer 长任务偶尔失忆
- 私有部署需要 Business 套餐
```

第一批 5 个 example 你写（与我共写）。这 5 个定义本站语气基因。

---

## 六、CLI 命令规范

### 6.1 起草命令

```bash
npm run draft:verdict <toolId>           # 起草工具立场字段 → tool_verdicts
npm run draft:event-verdict <eventId>    # 起草事件立场字段 → event_verdicts
npm run draft:comparison <slug>          # 起草对比页 → comparison_drafts
npm run draft:scene <slug>               # 起草场景页 → scene_drafts
npm run draft:ranking <slug>             # 起草榜单 → ranking_drafts
npm run draft:alternative <slug>         # 起草替代品专题 → alternative_drafts
npm run draft:event <slug>               # 起草事件主体 → events (status=ai_drafted)
npm run draft:tool-fields <toolId>       # 起草已入库工具的字段补全 → tool_field_drafts
```

每条命令统一行为：

1. 加载 prompt 文件 `prompts/<type>/v<latest>.md` 及全部 examples
2. 抓输入数据
3. 调 LLM（按 frontmatter `model_tier`）
4. 跑反套话审计（同 LLM 二次调用）
5. 写入对应 draft 表
6. 终端打印 admin URL：`http://localhost:3000/admin/<type>/<draftId>`

### 6.2 评估命令

```bash
npm run eval:prompt <type>               # 对当前 prompt 跑测试集，输出质量分布
                                         # 测试集放在 prompts/<type>/eval-set.json
npm run audit:freshness                  # 扫所有 *_updated_at 字段，超阈值的输出 CSV
npm run audit:comparisons                # 现有命令，检查对比页风险项
```

### 6.3 阈值定义

| 字段类 | 阈值 |
|---|---|
| 工具 `pricingUpdatedAt` | 90 天 |
| 工具 `accessUpdatedAt` | 60 天 |
| 工具 `featuresUpdatedAt` | 180 天 |
| 工具 `complianceUpdatedAt` | 365 天 |
| AI 编程类工具（特殊） | 字段阈值 ×0.5 |
| `tool_verdicts.expiresAt` | 180 天 |

---

## 七、定时任务规范（GitHub Actions）

新建 3 个 workflow：

### 7.1 `.github/workflows/weekly-audit.yml`

每周一 UTC 02:00 跑：

```bash
npm run audit:freshness
```

输出过期字段列表 → 写入 `tool_field_drafts`（自动起草新候选）→ 你在 `/admin/tool-fields` 审核。

### 7.2 `.github/workflows/weekly-discover.yml`

每周三 UTC 02:00 跑：扫 Search Console 高搜索词 + 工具库现有 slug 对比 → 发现"有需求但无对比页"的组合 → 写入 `comparison_drafts` 候选（仅 slug + 输入数据，不起草正文，等你点"起草"再跑 `draft:comparison`）。

### 7.3 `.github/workflows/daily-event-cluster.yml`

每日 UTC 14:00 跑：扫近 7 天 articles → 按标题语义聚类相同事件 → 写入 `events` (status=ai_drafted)。

定时任务都用现有 `CRON_SECRET` 机制，复用 `.github/workflows/refresh-trending.yml` 模板。

---

## 八、Admin 审核界面规范

复用 `/admin/sources` 现有样式骨架。每个内容类型独立路由：

```
/admin/verdicts            /admin/verdicts/[id]
/admin/event-verdicts      /admin/event-verdicts/[id]
/admin/comparisons         /admin/comparisons/[id]
/admin/scenes              /admin/scenes/[id]
/admin/rankings            /admin/rankings/[id]
/admin/alternatives        /admin/alternatives/[id]
/admin/events              /admin/events/[id]
/admin/tool-fields         /admin/tool-fields/[id]
```

列表页字段统一：slug / 起草时间 / promptVersion / antiClicheScore / 状态 / 操作。

详情页统一布局：左侧渲染 draft（用对应主页面同样的渲染组件，所见即所得）；右侧 sticky 审核栏（publish 按钮、reject + 理由输入、备注）。

立场模块视觉规范（也适用工具详情、事件、对比页）：

- 容器背景：浅黄 `#FFFBEB`（区别于客观字段的白底）
- 顶部标签："本站观点" + `verdictUpdatedAt` 日期
- `positionToday` 用色块标签：第一梯队绿、被超越红、观察中黄
- 6 个月内：正常显示
- 6 个月外：顶部红色条 "本判断可能已过时，最后审核 YYYY-MM"

---

## 九、M1（第 1-2 周）：详细执行任务

### M1 第 1 周：Prompt 工程基建

#### T1.1 prompts/ 目录骨架（0.5 天）

- 新建 `prompts/` 目录及全部子目录
- 写 `prompts/README.md`（说明 frontmatter 规范、版本号约定、example 格式）
- 不写 prompt body，只搭目录

涉及文件：`prompts/**`（全新）。验收：目录存在，README 完成。

#### T1.2 5 个 verdict few-shot 样本（2 天，与你共写）

我提初稿你定调子。每个样本 2-3 轮迭代。

样本清单（Q13 默认值）：

- `prompts/tool-verdict/examples/cursor.md`（编程 / 国际）
- `prompts/tool-verdict/examples/trae.md`（编程 / 国产）
- `prompts/tool-verdict/examples/kling.md`（视频 / 国产）
- `prompts/tool-verdict/examples/runway.md`（视频 / 国际）
- `prompts/tool-verdict/examples/doubao.md`（综合 / 国产）

跨品类 + 跨国内外，强制 LLM 学到分类应对。

验收：5 个文件存在，你过两遍认可调子，PR commit 标记 "verdict tone v1 locked"。

#### T1.3 写 `prompts/tool-verdict/v1.md`（0.5 天）

```yaml
---
name: tool-verdict
version: v1
model_tier: standard
temperature: 0.6
max_tokens: 1500
require_few_shot: true
require_anti_cliche_audit: true
---
```

Body 写主提示词：明确"输出立场不输出整理"、"用具体角色不用'希望提升效率的用户'"、"参考 examples 的语气"。

验收：手跑 `npm run draft:verdict cursor` 能输出符合 examples 语气的草稿（即使是测试模式，没入库）。

#### T1.4 写 `prompts/audit/anti-cliche.v1.md`（0.5 天）

二次 LLM 调用，输入是 draft 文本，输出是 `{score: 0-100, problems: [{sentence, reason}]}`。

套话检测规则（写在 prompt 里给 LLM 判断）：

- "对于希望……的用户" → 必须替换为具体角色
- "适合个人和团队" → 必须二选一或说明分场景
- "功能丰富 / 体验良好 / 强大易用" → 形容词堆砌，必须举具体功能
- "助力 / 赋能 / 升级" → 营销词，禁用

`antiClicheScore` < 60 的草稿在 admin 列表上标红，但不阻止你审核——你可能仍认为可接受。

#### T1.5 `tool_verdicts` schema（0.5 天）

- 在 `lib/db/schema.ts` 新增 `toolVerdicts` 表（按 4.2 设计）
- 运行 `npm run db:push`
- 在 `lib/db/queries.ts` 新增 `loadVerdictByToolId(toolId)` / `loadPendingVerdicts()` / `publishVerdict(id)` / `rejectVerdict(id, reason)`

验收：`npm run build` 通过，db push 成功，查询函数可调用。

#### T1.6 LLM model tier 配置（0.25 天）

`.env.local` 和 `lib/llm/index.ts`：

```env
LLM_PROVIDER=deepseek
LLM_MODEL=deepseek-chat
LLM_MODEL_PREMIUM=deepseek-chat   # Q12 决定：暂同 standard
```

`lib/llm/index.ts` 加 `chat(opts: { tier: 'standard' | 'premium', ... })`，按 tier 选 model env。

#### T1.7 `eval:prompt` 脚本（1 天）

- 新建 `scripts/eval-prompt.ts`
- 输入：prompt 类型名（如 `tool-verdict`）+ 测试集 JSON
- 行为：用测试集每个条目跑 prompt，对每个输出跑反套话审计，输出 markdown 报告到 `tmp/eval-<type>-<timestamp>.md`
- 测试集格式：`prompts/<type>/eval-set.json`，先用 5 个 example 的输入数据复用作为初始测试集

验收：跑 `npm run eval:prompt tool-verdict` 输出报告，能看到 5 个 draft 的反套话分数和问题列表。

**M1 第 1 周验收（合计 5.25 天）**

- prompts/ 目录建好
- 5 个 verdict example 你认可
- `tool_verdicts` 表 push 到数据库
- 跑 `npm run draft:verdict <toolId>` 能产出立场草稿到表里
- 跑 `npm run eval:prompt tool-verdict` 输出质量报告
- `npm run lint` 和 `npm run build` 通过

---

### M1 第 2 周：内容审核流泛化

#### T2.1 多工具对比 schema 扩展（0.5 天）

- `comparisons` 表新增 `toolIds` / `verdictOneLiner` / `mentions`（按 4.4）
- 改 `lib/db/queries.ts` 的 `loadComparisonById` 返回 `tools: Tool[]`，2 工具时仍兼容
- 改 `app/compare/[slug]/page.tsx` 头部能渲染 N 工具图标行
- 横向对比表本身放 M2 做（跟编程对比同步）

验收：现有 10 篇 2 工具对比页未回归；新增字段为空时正常渲染。

#### T2.2 6 张内容 draft 表（1 天）

按 4.1 + 4.3 创建：

- `comparisonDrafts` / `sceneDrafts` / `rankingDrafts` / `alternativeDrafts` / `toolFieldDrafts` / `eventVerdicts`
- `events` 主表
- 每张表的 queries.ts helper：`load<Type>Drafts()` / `load<Type>DraftById(id)` / `publish<Type>Draft(id)` / `reject<Type>Draft(id, reason)`

验收：`npm run db:push` 成功，全部 helper 可调用。

#### T2.3 8 条 CLI 命令（2 天）

按 6.1 实现：

```
draft:verdict / draft:event-verdict / draft:comparison /
draft:scene / draft:ranking / draft:alternative /
draft:event / draft:tool-fields
```

抽公共逻辑到 `lib/draft/runner.ts`：加载 prompt → 抓数据 → 调 LLM → 跑审计 → 写入表 → 打印 URL。每条命令只提供 type-specific 的"抓数据"和"输入格式化"两步实现。

每条命令对应一个 prompt 文件（M1 第 2 周只搭骨架版 prompt，真正调优放在 M2 / M1.5 用真实内容生产时迭代）。

验收：8 条命令都能跑通，draft 入表，打印 admin URL。Prompt 此时可能很初级，输出可能很烂，但流程对。

#### T2.4 8 个 admin 路由（1.5 天）

按 8 节实现。复用 `/admin/sources/page.tsx` 的列表样式 + `/admin/sources/[id]/page.tsx` 的详情样式。

每个路由的渲染组件做成"读 draft → 用主页面同样的渲染组件预览 → 右侧审核栏"。

- `app/admin/verdicts/page.tsx` + `[id]/page.tsx`
- `app/admin/event-verdicts/...`
- `app/admin/comparisons/...`
- `app/admin/scenes/...`
- `app/admin/rankings/...`
- `app/admin/alternatives/...`
- `app/admin/events/...`
- `app/admin/tool-fields/...`

每个详情页有两个按钮：`Publish`（POST → `/api/admin/<type>/<id>/publish`）、`Reject`（POST + reason）。

验收：8 个 admin 路由可访问、能 publish、能 reject、publish 后内容出现在公开 URL。

#### T2.5 articles 起草规则收紧（A 路径，0.5 天）

不新建表，改 `prompts/article-draft/v1.md`：

```
强制要求草稿带：
1. 一句话事件（≤ 30 字）
2. 国内影响（具体说明国内访问 / 价格 / 注册 / 中文支持的变化）
3. 至少 1 个站内资产链接（tool / compare / scene）

任一缺失 → 输出 {"skip": true, "reason": "..."}
LLM 显式输出 skip → process:articles 脚本不入库
```

改 `scripts/process-articles.ts`（推断有这个文件）跑完 LLM 后检查 skip 标志。

验收：跑一次 `npm run process:articles`，看入库数量是否下降（应下降，因为很多文章凑不齐 3 个字段）。

#### T2.6 立场模块视觉规范实现（0.5 天）

新建 `components/VerdictBlock.tsx`：

- 接受 `Verdict` 类型 props（含 `expiresAt`、`positionToday` 等）
- 容器浅黄 `#FFFBEB` 背景
- 顶部 "本站观点" 标签 + 日期
- 6 个月外加红色过期条
- `positionToday` 色块标签按枚举值映色

在 `app/tools/[slug]/page.tsx` 渲染。客观字段区和 VerdictBlock 之间留视觉间距。

事件页 / 对比页用同一个 VerdictBlock 组件（接同形 props）。

验收：手动 insert 一条 published verdict 到 DB，对应工具详情页能看到 VerdictBlock 渲染。

**M1 第 2 周验收（合计 6 天）**

- 6 张新 draft 表 + events 表都在 DB
- 8 条 CLI 命令可跑（输出未必好但流程通）
- 8 个 admin 路由可审核
- articles 起草规则收紧上线
- VerdictBlock 组件存在并在工具详情页渲染
- `npm run lint` 和 `npm run build` 通过

---

## 十、M1.5（第 3 周）：立场字段铺设到现有内容

### 目标

把 12 个视频工具 + 5 个替代品专题 + 10 篇视频对比一次性补 verdict 草稿，走审核流发布。这是首次大批量跑全流程，验证 prompt 是否经得起规模。

### 任务

- T3.1：跑 `npm run draft:verdict <toolId>` 给 12 个视频工具 → `/admin/verdicts` 审核 publish（你 1-2 天审完，平均每个 5-10 分钟）。
- T3.2：跑 `npm run draft:verdict <toolId>` 给 7 个 AI 编程工具（cursor / windsurf / claude-code / trae / github-copilot / cline / continue）→ 审核。这一步同时承担 M2 的 T1.5 工具池预补（编程立场字段做完，编程对比页起草就有素材）。
- T3.3：根据规模跑反思：哪些 prompt 输出仍套话？升 prompt v2 还是接受当前质量？

### 验收

- 19 个工具有 published verdict
- 工具详情页能看到 VerdictBlock
- 审核拒绝率统计：若 > 30% 说明 prompt 需要 v2

不做：

- 不批量做 articles 的事件 verdict（事件页样板放 M2）
- 不补对比页和替代品专题的 verdict（等 M2 重写流程）

---

## 十一、M2（第 4-5 周）：AI 编程品类 + 事件页样板

### M2 第 4 周：AI 编程对比闭环

#### T4.1 编程对比 5 篇起草（2 天）

5 个 slug（Q10 默认值）：

```
cursor-vs-windsurf
cursor-vs-claude-code
trae-vs-cursor
github-copilot-vs-cursor
claude-code-vs-cline
```

跑 `npm run draft:comparison <slug>` 5 次 → `/admin/comparisons` 审核。

#### T4.2 对比页横向并列表（1.5 天）

改 `app/compare/[slug]/page.tsx`：

- 用 N 列横向表渲染"同一维度 工具 A / B / C 的值"
- 行 = 维度（国内访问 / 中文界面 / 人民币定价 / 免费额度 / API / 开源 / ……）
- 列 = 工具
- 每个维度选出"赢家"的格子加色块（赢/平/输三态，由 LLM 在起草时同时输出 `<comparison>.cellWinners`）

旧 markdown 正文区保留在表下方。表是新增模块不是替换。

验收：5 篇编程对比页用横向表渲染；旧 10 篇视频对比页表区空着但不报错。

#### T4.3 Cursor 替代品专题（走新流程，0.5 天）

跑 `npm run draft:alternative cursor`（标的是国产替代）→ `/admin/alternatives` 审核 publish。

`/alternatives/cursor` 当前是 `lib/alternatives.ts` 的 hard-coded（[lib/alternatives.ts:13](lib/alternatives.ts:13)）。按 Q1=b 已 hard-coded 不动。本次走新审核流发布的是**新形态的替代品专题页**，URL 是 `/alternatives/cursor-cn` 或在路由层做"DB 覆盖 hard-coded"逻辑（推荐后者，URL 不变）。

#### T4.4 编程场景页 3 个（1 天）

```
ai-code-review            用 AI 做代码审查
ai-refactor-legacy        用 AI 重构遗留代码
ai-coding-side-project    用 AI 做个人副业项目
```

跑 `npm run draft:scene <slug>` → `/admin/scenes` 审核。

#### T4.5 互相内链补全（0.5 天）

- 7 个编程工具详情页底部"相关场景" → 链 T4.4 的 3 个
- 5 篇对比页底部"相关场景 / 相关替代品" → 链 T4.4 和 T4.3
- 3 个场景页底部"相关对比 / 相关工具" → 链 T4.1 和 7 个工具
- Cursor 替代品页底部 → 链 T4.1 / T4.4

### M2 第 5 周：事件页样板 5 个

#### T5.1 事件聚类机制（1.5 天）

实现 `daily-event-cluster.yml` workflow + `scripts/cluster-events.ts`：

- 扫近 7 天 `articles`
- 用 LLM 按标题语义两两比较，相似度 > 0.85 归为同一事件候选
- 写入 `events` 表 status='ai_drafted'

#### T5.2 事件页路由（1 天）

`app/events/page.tsx` + `app/events/[slug]/page.tsx`。

页面结构：

```
事件标题 + 时间线（多个时间点）
─────────────────────────────────────
本站观点（VerdictBlock）
─────────────────────────────────────
国内可用性快照（来自相关工具的 chinaAccess / priceCny 等）
─────────────────────────────────────
对你意味着什么（whoShouldCare 渲染为分组建议）
─────────────────────────────────────
站内相关（工具 / 对比 / 场景）
─────────────────────────────────────
事件原始来源 articles 列表（折叠）
```

#### T5.3 5 个事件页样板（1.5 天）

5 个 slug（Q11 默认值）：

```
claude-code-1
cursor-1-0
kling-1-5
jimeng-1-2
gpt-5
```

跑 `draft:event` + `draft:event-verdict`，审核 publish。

#### T5.4 sitemap 收录事件页 + 导航加入口（0.5 天）

- `app/sitemap.ts` 增加 events 路由
- 导航如保持 ≤ 6 项，事件页入口暂从 `/news` 顶部进入，不加新导航项

### M2 验收

- 5 篇编程对比 published，全部用横向表
- 1 个 Cursor 替代品页 published
- 3 个编程场景页 published
- 5 个事件页 published
- 全部页面有 VerdictBlock
- 全部页面与相关页面双向内链

---

## 十二、M3（第 6-7 周）：榜单页 + GEO + 老化 + UI 末尾收尾

### M3 第 6 周：榜单页 + GEO

#### T6.1 榜单页路由（1 天）

`app/best/page.tsx` + `app/best/[slug]/page.tsx`，`rankings` 表（不是 `ranking_drafts` 那张），含 published 状态。

页面结构：

```
榜单标题 + 一句话结论 + 选择标准
─────────────────────────────────────
本站观点（VerdictBlock）
─────────────────────────────────────
工具卡片列表，每个带推荐理由 + 注意点
─────────────────────────────────────
相关对比 / 相关场景
```

JSON-LD `ItemList`。

#### T6.2 5 个榜单页起草（1 天）

```
cn-ai-video-tools          国内可用的 AI 视频工具合集
cn-ai-coding-tools         国内可用的 AI 编程工具合集
free-ai-tools              完全免费可用的 AI 工具合集
chatgpt-cn-alternatives    ChatGPT 的国产替代合集
ai-tools-for-side-hustle   做 AI 副业的工具合集
```

跑 `draft:ranking <slug>` → 审核。

#### T6.3 GEO 全量铺设（1.5 天）

- 所有 published 对比页补 `verdictOneLiner` + JSON-LD `mentions`
- 所有场景页补"一句话结论"（M2 起的新内容已有；M1 之前的 4 个视频场景需补）
- 首页 `<head>` `description` 重写：能在 SERP 和 LLM 引用里清晰说明本站定位
- 文档 `docs/geo-output-spec.md`

#### T6.4 sitemap + 导航更新（0.5 天）

- `app/sitemap.ts` 加 `/best` 和 `/best/[slug]`
- 顶部导航加 `/best` 入口（如超 6 项把"教程"或某项收到"更多"菜单）

### M3 第 7 周：数据老化 + UI 末尾收尾

#### T7.1 数据老化字段级标记（1 天）

- 工具详情页在 `priceCny` / `chinaAccess` / `freeQuota` 旁渲染 "最后核对：YYYY-MM"（依据 `pricingUpdatedAt` / `accessUpdatedAt`）
- 超阈值显示 "信息可能已过期" 黄色提示，仍展示原值
- 新增 `/admin/freshness` 后台聚合视图（不是 draft 表，是只读视图）

#### T7.2 UI 末尾收尾：信息密度 + 移动端（1.5 天）

UI 评估发现的问题：

**问题 1：工具卡片信息过密（[app/tools/page.tsx:344-425](app/tools/page.tsx:344)）**

砍掉重复信息。卡片只保留：

- Header：icon + 名称 + 定价 chip + 国内访问 chip
- 描述 2 行
- 3 数据格（价格 / 国内 / 中文）
- 适合谁文案（1 行）
- 至多 2 个 chip（热度 + 1 个差异化标识：有替代 / 开源 / API 三选一）

砍掉"分类 chip"（侧栏已经按分类筛了）和"免费额度 chip"（已在价格格里）。

**问题 2：工具列表无排序**

[app/tools/page.tsx](app/tools/page.tsx) 加 `sort` searchParam：

```
?sort=hot      （默认，当前行为）
?sort=newest   按 publishedAt desc
?sort=cheap    按 priceCny asc（无 priceCny 放最后）
```

排序选项放在 "共找到 N 个工具" 那一行的右侧。

**问题 3：移动端 sidebar 没收起（[app/tools/page.tsx:149-311](app/tools/page.tsx:149)）**

当前 `flexShrink: 0`，小屏会被挤压。

改：在 `< 768px` 时 sidebar 折叠为顶部一行 "筛选 (N)" 按钮，点击展开 drawer。用 CSS `@media` + 简单 details/summary 元素即可，不引入新组件库。

**问题 4：移动端 hero 过大**

`clamp(30px, 8vw, 38px)`（[app/tools/page.tsx:140](app/tools/page.tsx:140)）小屏占太多。改 `clamp(24px, 6vw, 38px)`。

首页大 hero 同样调整（[components/V2Pro.tsx](components/V2Pro.tsx) 里的 Hero section）。

#### T7.3 总验收（0.5 天）

- 所有 published 对比 / 场景 / 事件 / 榜单页带 `verdictOneLiner` + JSON-LD mentions
- 工具详情页 100% 展示"最后核对"
- 工具卡片信息密度收敛
- 移动端 sidebar 折叠正常
- `npm run lint` / `npm run build` / `audit:comparisons` / `audit:freshness` 全部通过
- sitemap 完整

---

## 十三、整体验收（M3 结束时）

| 类别 | 数量 |
|---|---|
| 工具有 published verdict | 19+（视频 12 + 编程 7） |
| 对比页（含横向表 + verdict） | 15+（视频 10 + 编程 5） |
| 替代品专题 | 6+（旧 5 + Cursor 新流程 1） |
| 场景页 | 7+（视频 4 + 编程 3） |
| 事件页 | 5+ |
| 榜单页 | 5+ |
| 8 类 admin 审核路由 | 全部可用 |
| 8 条 CLI 起草命令 | 全部可用 |
| 3 条定时巡检/聚类任务 | 全部跑通 |
| 工具卡片信息密度 | 已收敛 |
| 移动端 sidebar | 已折叠 |

---

## 十四、不做事项

- 不启动 AI 写作 / PPT / 绘图 / 自动化 四个品类
- 不上 Lab 实测
- 不做用户系统、评论、收藏、订阅、Newsletter
- 不做厂商触达、社群运营、付费收录
- 不写"十大 AI 工具"水文
- 不为关键词覆盖批量灌薄工具
- 不重构 `components/V2Pro.tsx` 整体结构，只做 hero 字号微调
- 不全站换皮、不改主色系
- 不引入 UI 组件库（保持当前 inline style 方案）
- 不把已 hard-coded 的 4 个视频场景 / 5 个旧替代品专题迁到 DB
- 不做 articles 的人工审核（按 Q5 方案 1）
- 不做 premium LLM model（按 Q12 方案 3，schema 已留 promptVersion 升级路径）

---

## 十五、风险与对策

| 风险 | 对策 |
|---|---|
| Prompt v1 输出质量差 | M1 第 1 周末跑 eval:prompt，分数 < 60 升 v2；M1.5 大批量跑后再次评估 |
| DeepSeek 起草 verdict 套话堆砌 | 反套话审计兜底；若仍不可用，升 LLM_MODEL_PREMIUM 为 Claude Sonnet（一行环境变量切换） |
| 你审核草稿太慢成为瓶颈 | M1.5 大批量是一次性集中工作；M2 之后每周新增审核量小（< 10 条/周） |
| 自动事件聚类误聚 | 聚类阈值 0.85 较高；误聚由你在 `/admin/events` reject 处理 |
| 多工具对比 UI 复杂度上升 | N ≤ 5；> 5 工具改用榜单页结构 |
| 横向对比表"赢家"标记 LLM 判断不准 | 起草时强制要求引用具体官方数据；审核时你可手改 cellWinners JSON |
| 数据老化阈值过严，导致大量过期标记 | 阈值可在 schema 外配置；初期可保守，铺开后调整 |
| Cursor 替代品新页冲突旧 hard-coded | 路由层加 "DB 覆盖 hard-coded" 逻辑：有 published 的同 slug 时优先用 DB |
| LLM 起草成本不可控 | DeepSeek 单次调用 < $0.01；M1.5 一次 ~$0.20 总成本；可接受 |

---

## 十六、与现有文档的关系

- `docs/aiboxpro_详细版竞品分析与发展路线方案.md`：保留为长期方向源。本文档的修正不写回上游，上游仍是战略输入。
- `docs/phased-roadmap.md`：Phase 边界不变。本文档填充 Phase 1 收尾 + Phase 2 收尾 + Phase 3 第一品类的细节。
- `docs/current-position.md`：定位不变。
- `docs/sprint-3.md`：标记为已完成。后续不再用 Sprint 编号。
- `HANDOFF.md`：M1 / M1.5 / M2 / M3 每完成一阶段更新一次。
- `CLAUDE.md`：M1 第 1 周末更新"prompts/ 目录是一等资产"的协作规则。

冲突优先级（高→低）：本文档 > current-position > phased-roadmap > 详细版战略方案。

---

## 附录 A：第一批 5 个 verdict few-shot 样本起草顺序

建议共写顺序：

1. **Cursor** — 最熟悉的工具，建立语气基线
2. **可灵** — 跨到国产视频，验证国内场景的语气
3. **Trae** — 国产编程，验证"小品牌但有差异化"的写法
4. **Runway** — 国际视频，验证"承认对方强但国内不便利"的写法
5. **豆包** — 综合 / 国产，验证"大而全工具如何写出立场"

每个样本预算 30 分钟讨论时间。5 个 = 2.5 小时，加间歇休息约 3 小时。

完成后 `prompts/tool-verdict/v1.md` 主提示词的语气示例锁定。

---

## 附录 B：M1 文件改动清单（精确路径）

新增：

```
prompts/                                  # 全部新建
scripts/eval-prompt.ts
scripts/draft-runner.ts
scripts/draft-verdict.ts
scripts/draft-event-verdict.ts
scripts/draft-comparison.ts
scripts/draft-scene.ts
scripts/draft-ranking.ts
scripts/draft-alternative.ts
scripts/draft-event.ts
scripts/draft-tool-fields.ts
scripts/cluster-events.ts                 # M2 用
components/VerdictBlock.tsx
app/admin/verdicts/page.tsx
app/admin/verdicts/[id]/page.tsx
app/admin/event-verdicts/...
app/admin/comparisons/...
app/admin/scenes/...
app/admin/rankings/...
app/admin/alternatives/...
app/admin/events/...
app/admin/tool-fields/...
app/api/admin/<type>/[id]/publish/route.ts
app/api/admin/<type>/[id]/reject/route.ts
app/events/page.tsx                       # M2 用
app/events/[slug]/page.tsx                # M2 用
app/best/page.tsx                         # M3 用
app/best/[slug]/page.tsx                  # M3 用
.github/workflows/weekly-audit.yml
.github/workflows/weekly-discover.yml
.github/workflows/daily-event-cluster.yml
```

修改：

```
lib/db/schema.ts                          # 新增 8 张表 + comparisons 扩展字段
lib/db/queries.ts                         # 新增 draft 查询 helpers
lib/llm/index.ts                          # tier 参数
app/compare/[slug]/page.tsx               # N 工具支持 + VerdictBlock + 横向表
app/tools/[slug]/page.tsx                 # VerdictBlock + 字段级老化
app/tools/page.tsx                        # 排序、信息密度、移动端 sidebar
app/news/page.tsx                         # 起草过滤器收紧后的列表
app/sitemap.ts                            # 加 events / best 路由
scripts/process-articles.ts               # A 路径 skip 标志
package.json                              # 8 条新 npm scripts
.env.example                              # LLM_MODEL_PREMIUM
docs/geo-output-spec.md                   # M3 用，新增
HANDOFF.md                                # 每阶段更新
CLAUDE.md                                 # M1 第 1 周末更新
```
