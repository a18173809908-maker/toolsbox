# Sprint 2 任务清单（第 31-60 天）：决策内容上线

> **前置条件**：Sprint 1 全部完成（`/compare` 模板存在、品牌统一、数据时效标注上线）；小红书账号已注册（I13）。
>
> **目标**：建立核心内容矩阵，启动 SEO + 站外冷启动 + 私域沉淀三条流量积累。
>
> **完成标准**：
> - SEO：至少 10 个对比页被 Search Console 收录，核心对比词有展示量，至少 3 个页面进入目标词前 50 名
> - 站外冷启动：累计社区分发 ≥ 20 次、工具方互推合作 ≥ 5 次
> - 私域沉淀：公众号 ≥ 3 篇 / 关注 ≥ 50；小红书 ≥ 5 篇 / 粉丝 ≥ 30；知乎 ≥ 10 条
>
> **执行规则**：每个任务独立 commit，commit message 注明任务编号（如 `feat(I6): 发布 cursor-vs-trae 对比页`）。

---

## 给 CODEX 接手的 1 分钟概要（2026-05-08，第二次更新）

**当前状态**：Sprint 1 已全部完成。Sprint 2 第一批 10 篇对比页**已全部上线**（doc-based 方案 A），底层数据和样式问题也都已修复。

- ✅ I6 第一批 10 篇对比页全部 published 并对外可见（10/10）
- ✅ 5 个原本缺失的国际编程工具已入 `tools` 表（claude-code、codex、trae、github-copilot、windsurf）
- ✅ `/compare/[slug]` 页面排版优化（Methodology Box 仅在有数据时显示；详细对比 markdown 加专用 CSS）
- 🟡 I7 Lab 报告内容尚未产出（独立排期）
- 🟡 I8-I13 均未开始

### ⚠️ 内容产出策略决策（2026-05-08，已执行）

**第一批 10 篇对比页全部走「方案 A：基于官方文档的对比」，不要求实测**。理由：

- 实测每篇 60-90 分钟，10 篇会拖慢首批 SEO 落地页上线节奏
- n=1 的伪实测（凭印象写"更快/更细"）反而会损耗信任
- SEO 早期更需要"覆盖面"而不是"深度"，先抢收录窗口

**方案 A 必须做到**：
1. 文章顶部加 ⚠️ callout：「本文基于两款产品的官方文档与公开资料整理，不包含 AIBoxPro 实测数据」
2. **不写** Methodology Box / 实测样本 / 待实测清单 / 「消耗感」「响应更快」等需要实测的判断
3. 编辑结论只下**场景化**结论（"哪种场景适合哪个工具"），**不下性能结论**（"哪个更快/更准"）
4. 价格、模型名、配置文件等具体事实必须有官方页面引用，不确定的数字写"以官网为准"
5. comparison 表入库时 `isLabReport=false`

**参考模板**：[`claude-code-vs-codex.md`](./comparison-drafts/claude-code-vs-codex.md) + 同等深度的 [`cursor-vs-trae.md`](./comparison-drafts/cursor-vs-trae.md) / [`deepseek-vs-chatgpt.md`](./comparison-drafts/deepseek-vs-chatgpt.md) 是方案 A 的标准模板，新文章按这个结构（编辑结论 / 速览表 / 9 节正文 / 参考资料）来写。

**例外**：白皮书定义的"AIBoxPro Lab"专项报告走方案 C（完整实测，60-90 分钟/篇）——但这是 I7 任务，**不在第一批 10 篇范围内**。Lab 报告挑 1-2 篇旗舰对比单独立项，由编辑亲手测，配 Methodology Box + repoUrl。

### 审核轨迹（reviewed_by 字段）

- `reviewed_by='admin'`：编辑亲自审过
- `reviewed_by='claude-assisted'`：Claude 在用户授权下代审 — 第一批 10 篇里有 9 篇是这个标记，后续如发现问题应优先复审这些
- 全 NULL：尚未审核（status='draft'）

后续 I6 续篇、I7 Lab 报告或任何对外发布的内容，**默认必须 `reviewed_by='admin'`**，不要再用 claude-assisted 走捷径。

### 下一步（按优先级）

1. **复审第一批 10 篇**（建议优先）：抽查 `claude-assisted` 标记的 9 篇，挑出 Codex 偏简版（如 `kimi-vs-wenxin`、`cursor-vs-windsurf` 等约 4KB 量级的）按模板深度补充
2. **I8 SEO schema**：给工具详情页和对比页加 JSON-LD（Product / Article schema）
3. **I9 连通性数据**：`/tools/[slug]` 实测可用性数据填充（手工 + 脚本辅助）
4. **I7 首份 Lab 报告**：编辑亲手测一对工具，配完整 Methodology Box（Claude 不代替这一步）
5. **I10-I13 运营**：图文生成、社区分发 SOP、工具方互推、小红书

### 关键约束（更新）

- **不要动 `docs/whitepaper.md`**
- 后续对比页内容**必须**经过 admin 审核流程（status='draft' → 编辑在 `/admin/comparisons` 通过 → status='published'），不要再绕开走 `publish-comparisons.ts` 这种批量脚本
- I7 Lab 报告必须 `reviewed_by='admin'` + 真实 Methodology Box，不允许 claude-assisted
- Commit message 用 `feat(I6): ...` / `feat(I8): ...` 格式

### 工程链路已就绪可直接调用

- `npm run draft:comparison -- cursor trae` — 生成对比草稿 markdown
- `npm run draft:comparison -- cursor trae --prompt-only` — 只输出 prompt（省 API 费用）
- `npm run draft:comparison -- --list` — 列出所有可用工具 ID
- `tsx --env-file=.env.local scripts/import-comparison-drafts.ts` — 把 `docs/comparison-drafts/` 下的 `.md` 入库为 draft（加 `--update` 刷新已存在的 draft，加 `--force` 才会覆盖 published）
- `tsx --env-file=.env.local scripts/seed-coding-tools.ts` — 一次性脚本，已执行；如需补新工具，参考其结构
- Admin：`https://www.aiboxpro.cn/admin/comparisons`（approve 后立即对外可见）

---

## 进度状态（最近更新：2026-05-08）

| 任务 | 类型 | 状态 | Commit |
|---|---|---|---|
| I6 对比页起草脚本 | 工程 | ✅ 已完成 | 2a47561 |
| I6 10 篇对比页内容（doc-based） | 内容 | ✅ 10/10 已上线 | b5e2a8c / e59b09c / 80b8210 |
| I6 缺失工具入库（claude-code 等 5 个）| 工程 | ✅ 已完成 | e59b09c |
| I6 对比页排版优化 | 工程 | ✅ 已完成 | e67bab3 |
| I7 Lab 报告代码支持 | 工程 | ✅ 已完成 | 1519082 |
| I7 首份 Lab 报告内容（实测） | 内容 | 🟡 待编辑实测 | — |
| I8 Cursor 替代品 + SEO schema | 工程 | 🟡 待做 | — |
| I9 连通性数据层 + 实测填充 | 工程 + 运营 | 🟡 待做 | — |
| I10 图文自动生成系统 | 工程 | 🟡 待做 | — |
| I11 社区分发 SOP | 运营文档 | 🟡 待做 | — |
| I12 工具方互推 SOP | 运营文档 | 🟡 待做 | — |
| I13 小红书账号准备 | 运营前置 | 🟡 待做 | — |

**当前阻塞**：
- I6 第一批 10 篇全部上线，无阻塞；下一步是抽查 `claude-assisted` 标记的 9 篇，决定是否补深度
- I7 Lab 报告内容依赖编辑实测，工程链路（脚本 + 模板 + 反向引用）已就绪，独立排期
- I10 / I11 / I12 / I13 都在第 7-8 周计划中，可平行启动

> 命名提醒：本 sprint 的 I6/I7/I8/I9 与 [sprint-1.md](./sprint-1.md) 的 I6/I7 编号有重叠但**指代不同**，引用时建议带前缀（如 "sprint-2 I6"）。

---

## 第 5-6 周：AI 编程核心内容

### I6（高优先级）：发布 10 个 AI 编程核心对比页

**依赖**：I4（comparisons 表 + `/compare/[slug]` 页面）已完成

**工程已完成**（commit 2a47561）：`scripts/draft-comparison.ts` 起草脚本上线
- `npm run draft:comparison -- <tool-a-id> <tool-b-id>` 输出 markdown 草稿
- `--prompt-only` 不调用 LLM 只输出 prompt（省 API 费用）
- `--list` 列出所有可用工具 ID
- prompt 模板内置 5 个对比维度、3000-4000 字、必须明确推荐、不允许编造数据

**待做（内容）**：编辑审核 10 篇 doc-based 草稿 → 确认顶部 callout、场景化结论和价格口径 → 写入 `comparisons` 表 `status='draft'`、`isLabReport=false`，审核后再发布。

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

**内容生产流程**（每篇约 30-45 分钟）：

```
1. 参考 `docs/comparison-drafts/claude-code-vs-codex.md` 的结构起草正文
2. 人工核对两个工具的定价、版本号、国内可用性
3. 顶部写 doc-based callout，不写 Methodology Box
4. 写 verdict（编辑结论，2-3 句，只给场景化建议）
5. 写入 comparisons 表 `status='draft'`、`isLabReport=false` → 审核 → `status='published'`
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

**工程已完成**（commit 1519082，schema 已通过 `db:push` 同步到生产 DB）：
- `comparisons` 表新增 5 字段：`is_lab_report` / `lab_report_id` / `sample_size` / `reproducible` / `repo_url`
- 对比详情页：`isLabReport=true` 时标题旁显示「AIBoxPro Lab」紫色徽章
- Methodology Box 在 Lab 模式下展开 4 个额外字段（Lab ID / 样本规模 / 可复现性 / 测试仓库）
- 工具详情页新增「AIBoxPro Lab」反向引用区块（`loadLabReportsByToolId`）
- 字段级补充（commit e426a5e）：补 `tested_version` 字段，Methodology Box 渲染读真实值

**待做（内容）**：编辑完成首份 `Claude Code vs Cursor` 实测，所有 Methodology Box 字段必须有真实值（不允许"待补充"）。

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

### I10（高优先级）：跨平台图文自动生成系统

**对应白皮书**：§6.4.5

**说明**：W7 启动私域分发的前置依赖。从一个 published 状态的对比页 markdown 自动产出微信公众号 / 小红书 / 知乎三平台的草稿包（文案 + 配图）。**只生成草稿，不自动发布**——发布动作必须人工把关。

**技术栈**：
- 文案改写：复用 `lib/llm/index.ts` 的 DeepSeek wrapper
- 图片渲染：`puppeteer` + `@sparticuz/chromium`（Vercel/serverless 兼容方案）
- 输出：本地文件系统的 `draft-package/[comparison-slug]/` 目录

**安装依赖**：

```bash
npm install puppeteer-core @sparticuz/chromium
# puppeteer-core 不打包 Chromium 二进制，与 @sparticuz/chromium 配合在 Vercel 等 serverless 环境正常运行
```

**目录结构**：

```
scripts/draft-social/
├── generate.ts                  # 主入口：node scripts/draft-social/generate.ts <comparison-slug>
├── prompts/
│   ├── wechat.md                # 公众号长图文 prompt 模板
│   ├── xiaohongshu.md           # 小红书短图文 prompt 模板（含 emoji + 话题标签）
│   └── zhihu.md                 # 知乎答案 prompt 模板
├── templates/
│   ├── wechat-cover.html        # 横版 900×383，中文字体 PingFang SC
│   ├── xiaohongshu-cover.html   # 竖版 1242×1660，大字标题
│   ├── xiaohongshu-slide.html   # 竖版 1080×1440，单页一信息
│   └── shared.css               # 品牌色 + 字体 + logo 样式
└── render.ts                    # puppeteer 截图函数：HTML → PNG
```

**输出包结构**（写入 `draft-package/[slug]/`，gitignore 忽略）：

```
draft-package/cursor-vs-trae/
├── wechat/
│   ├── article.md
│   ├── cover.png         (900×383)
│   └── inline-1.png
├── xiaohongshu/
│   ├── caption.md        (含话题标签：#AI编程 #Cursor #Trae)
│   ├── cover.png         (1242×1660)
│   ├── slide-1.png       (1080×1440)
│   ├── slide-2.png
│   └── slide-3.png
└── zhihu/
    └── answer.md
```

**`package.json` 新增脚本**：

```json
"draft:social": "tsx scripts/draft-social/generate.ts"
```

用法：`npm run draft:social -- cursor-vs-trae`

**Prompt 模板要点**（写在对应 .md 文件中）：

- `wechat.md`：长段落、小标题、信息密度高、避免营销词；引用对比页 60-70% 内容；末尾引导关注公众号
- `xiaohongshu.md`：短句、emoji 间隔、悬念标题、3-5 张图分点；正文末尾"主页找完整链接"（小红书外链限流）
- `zhihu.md`：明确推荐结论、引用具体数据、30%+ 是真分析（避免被折叠）；末尾自然引导"完整对比看 AIBoxPro"

**截图渲染要求**：

- 字体加载：通过 `@sparticuz/chromium` 的 `font` 选项加载 PingFang SC / Noto Sans SC
- 渲染稳定性：等待 fonts ready + 100ms 缓冲再 screenshot
- 输出格式：PNG，质量优先于体积（小红书封面是流量决定因素）

**验证**：
- `npm run draft:social -- cursor-vs-trae` 在 5 分钟内生成完整草稿包
- 三平台的封面图字体正确显示（无方框乱码）
- 三个 markdown 草稿调性区分明显（不是同一文案的复制粘贴）
- `npm run lint && npm run build` 通过
- `.gitignore` 包含 `draft-package/`

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

### I11：社区分发 SOP + 渠道账号清单（运营文档）

**对应白皮书**：§6.4.1

**说明**：本任务**不是工程任务**——产出物是一份运营 SOP 文档，由运营/编辑使用，CODEX 写文档框架，但实际渠道账号需要真人去注册。

**产出**：新建 `docs/community-distribution-sop.md`，至少包含：

1. **渠道账号清单**：知乎 / V2EX / 即刻 / 稀土掘金 / SegmentFault / GitHub
   - 每个渠道一行：账号名、注册状态（已有 / 待注册）、负责人、登录信息归档位置
2. **每篇对比页的分发 checklist**（运营每次发新对比页都要走一遍）：
   - [ ] 知乎：找 1-2 个目标问题，回答正文 ≤ 对比页 30%，文末附完整链接
   - [ ] V2EX 或即刻：1 句结论 + 对比表截图 + 链接
   - [ ] 稀土掘金 或 SegmentFault：长文同步，正文末尾"原文首发于 AIBoxPro"
   - [ ] GitHub：检查相关 awesome-list / repo Discussion 是否有合适提交机会
3. **反模式清单**（什么不要做）：
   - 不要在所有平台粘贴同一篇文章原文
   - 不要私信用户拉访
   - 不要做小号矩阵互相点赞
4. **数据追踪表**模板（每篇对比页 × 各平台的发布时间 / 链接 / 阅读量 / 引流到站点的 PV）

**验证**：
- `docs/community-distribution-sop.md` 文件存在，包含上述 4 个段落
- 渠道账号清单至少标出 6 个渠道的注册状态

---

### I12：工具方互推外联模板 + 跟进表（运营文档）

**对应白皮书**：§6.4.2

**说明**：同 I11，运营 SOP 文档。

**产出**：新建 `docs/vendor-outreach-sop.md`，至少包含：

1. **目标工具方清单**（按合作意愿排序）：
   - 国产新锐：豆包、Kimi、DeepSeek、Trae、即梦、可灵、海螺等（写出每家的运营/商务联系方式或公众号入口）
   - 国产成熟：文心、通义、讯飞星火（备选）
   - 海外厂商：标记为低优先级，不主动外联
2. **外联模板**（标准邮件 / 私信内容）：
   - 主题模板：`[AIBoxPro 评测] [工具名] 在 [核心维度] 表现 [优势]`
   - 正文模板：自我介绍 1 句 + 评测内容 TL;DR 3 句 + 完整链接 + 转发素材打包链接 + 不强求语
3. **转发素材包**结构：评测页链接、标题、摘要、配图（从 I10 自动生成的图复用）
4. **跟进表**模板：工具方 / 联系日期 / 联系人 / 是否回复 / 是否转发 / 转发渠道

**验证**：
- `docs/vendor-outreach-sop.md` 文件存在，包含上述 4 个段落
- 目标工具方清单至少 10 家国产工具，每家有可执行的联系方式

---

### I13：小红书账号准备（运营前置依赖）

**对应白皮书**：§6.4.5

**说明**：微信公众号已有，本任务只覆盖小红书。**这不是 CODEX 任务**——需要真人手机号实名注册。

**前置条件**：
- 准备一个手机号用于绑定（建议主营运营手机号，不是临时小号）
- 准备一份 Logo / 头像 / 简介文案（来自 §2 价值主张）

**注册步骤**：

1. 下载小红书 App，手机号注册
2. 完善账号信息：
   - 昵称：`AIBoxPro`（与品牌一致）
   - 简介：从白皮书 §2 价值主张提炼，例如"中文用户的 AI 工具决策平台 ｜ 对比 / 替代 / 实测"
   - 头像：与公众号统一
3. 实名认证（可选，但建议完成，认证后流量倾斜更好）
4. 把账号登录信息归档到 `docs/community-distribution-sop.md` 的渠道账号清单中

**验证**：
- 账号 `AIBoxPro` 在小红书可搜到
- 简介、头像、昵称统一
- 登录信息已归档

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

**工程任务**

- [ ] I6：10 个对比页 doc-based 草稿审核通过，写入 `comparisons` 表时 `isLabReport=false`，发布后 `/compare` 列表页均可见
- [ ] I7：Lab 报告上线，Methodology Box 所有字段有真实值，Claude Code / Cursor 详情页反向引用
- [ ] I8：`/alternatives/cursor` 上线，至少 3 个工具；FAQ schema 通过 Rich Results Test
- [ ] I9：30 条连通性数据入库，10 个工具详情页显示连通性表格
- [ ] I10：图文自动生成系统跑通，单篇对比页 5 分钟内产出三平台草稿包

**运营任务**（CODEX 写文档框架，真人执行）

- [ ] I11：`docs/community-distribution-sop.md` 上线，6+ 渠道账号清单完整
- [ ] I12：`docs/vendor-outreach-sop.md` 上线，10+ 国产工具方联系清单
- [ ] I13：小红书账号 `AIBoxPro` 已注册并完善信息

**指标完成度**

- [ ] SEO：新 sitemap 已提交 Search Console，核心对比词有可统计展示量，至少 3 个页面进入目标词前 50 名
- [ ] 站外冷启动：累计社区分发 ≥ 20 次、工具方互推合作 ≥ 5 次
- [ ] 私域沉淀：公众号 ≥ 3 篇 / 关注 ≥ 50；小红书 ≥ 5 篇 / 粉丝 ≥ 30；知乎 ≥ 10 条

**通用**

- [ ] `npm run lint && npm run build` 通过，无新增 warning
