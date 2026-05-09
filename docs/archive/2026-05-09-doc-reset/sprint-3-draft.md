# Sprint 3 草案：AI 编程之后的品类扩展（第 61 天起）

> **状态**：草案 / 待 Sprint 2 完成数据回流后定稿
> **决策依据**：白皮书 §7 第 8 周「根据第一批对比页的流量数据，决定下一批优先扩展的工具类目」
> **目的**：在 Search Console 数据出来前，先把候选品类、内容清单、工具准备工作梳理好；定稿时只要替换品类顺序，不必重新设计。

---

## 一、判定原则（按白皮书 §3 / §6.1）

下一批扩展品类必须同时满足：

1. **搜索意图清晰**：用户搜「X vs Y」「X 替代品」类的高转化词，而不是泛搜
2. **国内外差异显著**：有「国内能用 vs 国内不能用」的鲜明对比，这是我们的护城河
3. **工具池足够**：tools 表已覆盖至少 6-8 个该品类工具，能写出 10 篇对比
4. **不与编程主线冲突**：不分散信任建设的注意力，可以走与编程并行的内容线

数据触发：当 Search Console 显示某品类相关词每周展示量超 100 次（不论排名），即视为该品类有需求。

---

## 二、默认扩展顺序（数据出来前的预设）

| 优先级 | 品类 | 入选理由 | 阻塞 |
|---|---|---|---|
| **P0** | **AI 写作 / 文案** | 与编程是同一开发者圈的外延（写公众号 / 周报 / 文档），工具池现成（Kimi / 豆包 / DeepSeek / ChatGPT / Claude / Notion AI / Jasper），国内外差异明显（豆包 vs Notion AI 是真有差距） | 无 |
| **P1** | **AI 绘图** | 国内可用性差异最大（Midjourney 国内基本不能用，即梦 / 文心一格直连），适合差异化叙事；工具池足够 | 无 |
| **P2** | **AI 视频** | 即梦 / 可灵 / Sora / Runway / 海螺 都已入库，国内市场热度最高 | 实测成本高（每段视频几分钟），Lab 报告需要更多时间 |
| **P3** | AI 办公（PPT / 翻译 / 会议） | 用户量大但单品决策价值低，适合做长尾 SEO | tools 表 ppt 分类目前 0 条，需要先补录 |
| 暂缓 | AI 数字人 / AI 副业 / AI 内容检测 | 流量大但用户决策不严肃，调性不符合「决策平台」 | — |

> 如果 Sprint 2 数据显示某品类（如 AI 视频）实际流量已经领先于 AI 写作，按数据调整顺序，不要强行按默认顺序走。

---

## 三、第一批：AI 写作 / 文案（P0，预计第 61-90 天）

### 工具池盘点（在库情况）

| 状态 | 工具 |
|---|---|
| ✅ 已入库 | ChatGPT, Claude, Kimi, 豆包, DeepSeek, 文心一言, 通义千问, 智谱清言, 腾讯元宝, Notion AI, Jasper, 秘塔 AI 搜索 |
| ⚠️ 需补录 | 飞书智能伙伴（lark.feishu.cn/ai）, WPS AI, 腾讯文档 AI, ChatPPT |

### 第一批 10 篇对比清单（按搜索热度排序）

| # | slug | 标题 | 主推 SEO 词 | 主要工具 |
|---|---|---|---|---|
| 1 | `kimi-vs-doubao-writing` | Kimi vs 豆包：日常写作哪个更顺手 | 「Kimi 和豆包哪个好」「AI 写作工具对比」 | Kimi, 豆包 |
| 2 | `chatgpt-vs-claude-writing` | ChatGPT vs Claude：长文写作哪个更强 | 「ChatGPT 和 Claude 哪个适合写作」 | ChatGPT, Claude |
| 3 | `notion-ai-vs-feishu-zhihui` | Notion AI vs 飞书智能伙伴：团队办公 AI 对比 | 「Notion AI 替代品」「飞书 AI」 | Notion AI, 飞书智能伙伴 |
| 4 | `wenxin-vs-tongyi-writing` | 文心一言 vs 通义千问：中文写作能力深度对比 | 「文心和通义哪个好」 | 文心一言, 通义千问 |
| 5 | `ai-write-wechat-article` | AI 写公众号文章实战横评 | 「AI 写公众号」「公众号 AI 工具」 | 豆包, Kimi, 文心一言, DeepSeek |
| 6 | `ai-write-thesis` | 学生用 AI 写论文 / 降重全攻略 | 「AI 写论文」「AI 论文降重」 | Kimi, 秘塔, DeepSeek |
| 7 | `ai-write-xiaohongshu` | AI 写小红书笔记爆款指南 | 「AI 写小红书」「AI 文案工具」 | 豆包, 文心一言 |
| 8 | `ai-translate-doc` | AI 长文档翻译横评（保留格式） | 「AI 翻译长文档」「AI 文档翻译」 | DeepSeek, Kimi, 通义千问 |
| 9 | `jasper-alternatives-cn` | Jasper 国产替代专题 | 「Jasper 替代品」「营销文案 AI」 | Jasper, 豆包, 文心一言, Notion AI |
| 10 | `ai-mindmap-cn` | AI 自动生成思维导图工具对比 | 「AI 思维导图」 | 豆包, 文心一言, ChatPPT（待补录）|

### 内容形态

按 Sprint 2 doc-based 模式（编辑结论 / 速览表 / 9 节正文 / 参考资料），不要求 Lab 实测。**唯一例外**：从这批选 1 篇做 Lab 报告（推荐 #2 ChatGPT vs Claude，国际两巨头对比，具备权威性）。

### 工期估算

- 工具补录（飞书 / WPS / ChatPPT）：1-2 天
- 起草 10 篇（DeepSeek 半自动）：5 天
- 编辑审核 + 上线：5 天
- **合计 12-15 天**

---

## 四、第二批：AI 绘图（P1，预计第 91-120 天）

### 工具池盘点

| 状态 | 工具 |
|---|---|
| ✅ 已入库 | Midjourney, 即梦, Krea, 文心一格, Stable Diffusion（隐式存在于 huggingface）|
| ⚠️ 需补录 | DALL·E 3, Adobe Firefly, Recraft, Ideogram, Leonardo.ai, 美图设计室, 堆友, 星流 AI, MewXAI |

### 第一批 10 篇对比清单

| # | slug | 标题 | 主推 SEO 词 |
|---|---|---|---|
| 1 | `midjourney-vs-jimeng` | Midjourney vs 即梦：国内外画质对决 | 「Midjourney 替代品」「即梦 vs MJ」 |
| 2 | `jimeng-vs-wenxin-yige` | 即梦 vs 文心一格：国产 AI 绘图横评 | 「即梦和文心一格哪个好」 |
| 3 | `stable-diffusion-vs-midjourney` | Stable Diffusion vs Midjourney：自由度对比 | 「SD 和 MJ 区别」 |
| 4 | `krea-vs-midjourney-realtime` | Krea vs Midjourney：实时画布 vs 高质量 | 「Krea 和 Midjourney」 |
| 5 | `ai-product-photo-cn` | AI 商品图工具横评 | 「AI 商品图」「电商 AI 修图」 |
| 6 | `ai-avatar-generators` | AI 头像生成器对比 | 「AI 头像生成」 |
| 7 | `ai-logo-generators` | AI Logo 生成工具横评 | 「AI 生成 logo」 |
| 8 | `midjourney-cn-alternatives` | Midjourney 国产替代方案专题 | 「Midjourney 国内」 |
| 9 | `free-ai-image-tools` | 免费 AI 绘图工具大盘点 | 「免费 AI 绘图」 |
| 10 | `ai-anime-style-tools` | AI 动漫风格生成对比 | 「AI 动漫」「AI 二次元」 |

### 工期估算

- 工具补录：3-5 天（数量较多）
- 起草 + 审核 + 上线：12-15 天
- **合计 15-20 天**

---

## 五、第三批：AI 视频（P2，预计第 121-150 天）

### 工具池盘点

| 状态 | 工具 |
|---|---|
| ✅ 已入库 | Runway Gen-4, Sora, Pika, Descript, 可灵, 海螺, 即梦 |
| ⚠️ 需补录 | Luma AI, Kling Pro 版本细分, Vidu AI, Higgsfield, Hedra（数字人）|

### 第一批 10 篇对比清单

| # | slug | 标题 | 主推 SEO 词 |
|---|---|---|---|
| 1 | `kling-vs-runway` | 可灵 vs Runway：国内外视频生成对决 | 「可灵和 Runway 哪个好」 |
| 2 | `jimeng-vs-kling` | 即梦 vs 可灵：国产 AI 视频横评 | 「即梦和可灵区别」 |
| 3 | `sora-vs-kling` | Sora vs 可灵：长视频物理一致性对比 | 「Sora 替代品」 |
| 4 | `hailuo-vs-pika` | 海螺 vs Pika：电影感 vs 短视频 | 「海螺 AI 视频」 |
| 5 | `ai-digital-human-tools` | AI 数字人工具横评（直播带货）| 「AI 数字人」「AI 主播」 |
| 6 | `ai-short-video-edit` | AI 短视频自动剪辑工具对比 | 「AI 短视频剪辑」 |
| 7 | `runway-vs-sora-cinematic` | Runway vs Sora：电影级镜头对比 | 「Runway 和 Sora」 |
| 8 | `ai-video-cn-alternatives` | 国产 AI 视频工具替代专题 | 「AI 视频生成国内」 |
| 9 | `ai-video-text-to-video` | 文生视频工具大横评 | 「文生视频」 |
| 10 | `ai-image-to-video` | 图生视频工具横评 | 「图生视频」 |

### 实测策略

视频品类必须有至少 1 篇 **Lab 报告**（白皮书 §3.3），因为视频质量是视觉判断，没有截图比对没说服力。建议 #1 可灵 vs Runway 作为 Lab 候选。

### 工期估算

- 工具补录：3 天
- doc-based 9 篇 + Lab 1 篇：18-22 天（视频实测时间长）
- **合计 21-25 天**

---

## 六、技术债 / 工具入库脚手架

无论先做哪一批，都需要：

### 1. 扩充 `seed-cn-tools.ts`

当前覆盖 14 个国内工具，需要再补：
- 写作类：飞书智能伙伴, WPS AI, 腾讯文档 AI, ChatPPT
- 绘图类：美图设计室, 堆友 AI, 星流 AI, Recraft, Adobe Firefly
- 视频类：Vidu AI, Luma AI, Higgsfield, Hedra

每个工具必须包含 cnAlternatives + 国内可用性标记。

### 2. 增加分类（可选）

如果做 AI 视频专题，可考虑细分子类：
- `digital-human`（已有）
- `text-to-video`（新加）
- `image-to-video`（新加）
- `video-edit`（新加）

但**不建议**过早细分。当前 video 大类够用，等 10 篇都上线再决定。

### 3. 替代品专题模板

Sprint 2 的 I8 已上线 `/alternatives` 列表页和首批 5 个 `/alternatives/[slug]` 页面，可在 Sprint 3 直接复用并扩展：
- `cursor` → Trae / Claude Code / GitHub Copilot / Windsurf
- `chatgpt` → 豆包 / Kimi / DeepSeek / 文心一言
- `midjourney` → 即梦 / 文心一格 / 可灵
- `notion-ai` → 豆包 / Kimi / 文心一言
- `runway` → 可灵 / 海螺 / 即梦

Sprint 3 新品类只需要补新的 topic 配置与工具池，不需要重做页面模板。

---

## 七、决策时机

**第 60 天结束（Sprint 2 完成）**，看以下三组数据决定下一批：

1. **Search Console**：哪个非编程类目的 query 已经有 100+ 周展示量
2. **Vercel Analytics**：直接访问 `/tools?cat=X` 的 X 是哪个分类
3. **运营反馈**：知乎 / 公众号读者主动问什么品类的 AI 工具

按数据决定顺序，本草案给的是「无数据时的兜底默认」。

---

## 八、验证标准（每一批通用）

- 该批 10 篇对比页全部 `published`，`/compare` 列表可见
- 工具池已经覆盖（零新增工具入库 = 内容生产期）
- 每篇有顶部 callout（doc-based 标注），至少 1 篇 Lab 报告
- 至少 1 个对应替代品专题页 `/alternatives/[tool]` 上线
- Search Console 收录率 ≥ 80%（30 天内）

---

## 九、不在 Sprint 3 范围（避免范围蔓延）

- ❌ 决策引擎 / 选型助手（白皮书 §3.1，需要更多数据）
- ❌ 众包连通性地图（Sprint 2 I9-A 数据层已完成；I9-B 真实实测填充仍由 Sprint 2 人工任务承接）
- ❌ 商业化（广告 / CPS / 工具方付费推荐）— 需 ICP 备案
- ❌ 用户登录 / 评论系统 — 不是当前阶段优先级

---

## 维护说明

本文是**草案**。Sprint 2 完成时：
1. 拿 Search Console 实际数据回填「七、决策时机」段
2. 调整三批的优先级或合并
3. 改名为 `sprint-3.md`（去掉 `-draft` 后缀）
4. 同时更新 `CODEX_TASKS.md` 的下一批任务编号（推测为 K 系列）
