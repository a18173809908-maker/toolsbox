# CODEX 任务交接文档

> 最后更新：2026-05-02
> 本文件记录 Claude 已完成的工作及 CODEX 待续任务。

---

## 一、已完成工作汇总

### 工具库自动抓取管道（Task 10）
- `lib/db/schema.ts`：新增 `tool_candidates` 表（id, name, url, description, status, votes, sourceName, slug, zh, catId, chinaAccess, pricing, features, fetchedAt, publishedAt）
- `scripts/fetch-tool-candidates.ts`：抓取工具类 RSS 源，写入 tool_candidates
- `scripts/process-tool-candidates.ts`：从 tool_candidates 读取 pending 条目，调 DeepSeek AI 补全 zh/catId/pricing/chinaAccess/features，写入 tools 表
- `lib/jobs/process-tool-candidates.ts`：同逻辑的 Job 版本（供 cron 调用）
- `vercel.json`：新增 `/api/cron/refresh-tools`，UTC 凌晨 3 点每日执行
- `scripts/seed-tool-sources.ts`：初始化工具抓取源入库（当前 3 条源均已禁用，见下）

### 噪音数据过滤
- `lib/jobs/process-tool-candidates.ts`：增加 `looksLikeNews()` 函数，在 AI 处理前识别并拒绝新闻 Digest 条目（Digest/Newsletter/Daily/Weekly/Monday...等关键词）
- `scripts/cleanup-tool-data.ts`：清理 tools 表中已误入的新闻条目（已执行，删除 ~30 条）
- `package.json`：新增 `cleanup:tool-data` 脚本

### /tools 列表页（Task 6）
- `app/tools/page.tsx`：完整工具库页面
  - 分类 pills（Link 驱动，URL param `cat=`）
  - 定价筛选 pills（`pricing=`）
  - 国内访问筛选（`china=`）
  - 搜索框（`q=`，GET 提交）
  - 24 个/页，prev/next 分页
  - JSON-LD CollectionPage
- `lib/db/queries.ts`：新增 `loadToolsPage()` 和 `loadAllCategories()`
- `components/SiteHeader.tsx`：导航栏新增「工具库」链接
- `app/sitemap.ts`：新增 `/tools` 静态入口

### 工具详情页丰富化（两轮）
- `lib/db/schema.ts`：tools 表新增 `howToUse text[]` 和 `faqs jsonb`（Codex 已运行 `npm run db:push` 同步到 Neon）
- `lib/data.ts`：Tool 类型新增 `howToUse?: string[]` 和 `faqs?: {q,a}[]`
- `lib/db/queries.ts`：
  - `loadToolById` 新增 howToUse / faqs 字段
  - `publishToolCandidate` 接受并写入 howToUse / faqs
  - 新增 `loadRelatedArticles(toolName, limit)` 查询
- `lib/jobs/process-tool-candidates.ts`：AI prompt 新增 howToUse（3-4步）和 faqs（2-3条Q&A），maxTokens 提升至 600
- `scripts/seed-cn-tools.ts`：新增，含 14 个国内主流工具（含完整 howToUse + faqs 数据），运行 `npm run seed:cn-tools`
- `package.json`：新增 `seed:cn-tools` 脚本
- `app/tools/[slug]/page.tsx`：
  - Hero 新增点赞数显示（upvotes > 0 时展示）
  - 新增「🚀 如何开始使用」区块（编号步骤列表，橙色圆形序号）
  - 新增「🇨🇳 国内用户须知」醒目卡片（访问方式/中文界面/免费额度/API开放）
  - 信息网格精简为 4 格（定价/分类/日期/推荐）
  - 新增「💬 常见问答」FAQ 区块（Q/A 格式，分隔线）
  - 新增「📰 相关资讯」区块

---

## 二、当前数据状态

| 项目 | 状态 |
|------|------|
| tools 表 | ~24 条旧数据 + 14 条国内工具（运行 `seed:cn-tools` 后）；自动抓取源暂停 |
| tool_candidates | ~40 条 pending（清理后剩余，等待质量源） |
| tool 抓取源 | 6 条全部 `active=false`（因原源均为新闻 Digest） |
| articles | 正常，cron 每天 2am 抓取并 AI 处理 |
| github_trending | 正常，cron 每天 1am 抓取 |

---

## 三、CODEX 待续任务

### Task A：找到有效工具 RSS 源（最高优先级）

当前所有工具源均被禁用（原因：DreyX/Insidr/Planet AI 均为新闻 Digest，非工具目录）。

需要找到实际可用的 AI 工具目录 RSS 源，并重新入库启用。

**已知失效源**（不要重复尝试）：
- theresanaiforthat.com/feed → 403
- futurepedia.io/feed → 404
- aitoolsdirectory.com/rss → fetch failed
- DreyX AI Digest RSS → 新闻，非工具
- Insidr AI Tools RSS → 新闻，非工具
- Planet AI RSS → 新闻，非工具

**建议候选**：
- `https://www.producthunt.com/feed?category=artificial-intelligence`
- `https://aitoptools.com/feed/`
- `https://www.toolify.ai/rss`
- `https://topai.tools/rss`

操作步骤：
1. curl 测试 URL 可访问性
2. 查看 RSS 内容，确认 `<item>` 是工具而非新闻
3. 用 `npm run seed:tool-sources` 逻辑（或直接 SQL）插入并设 `active=true`
4. 运行 `npm run fetch:tool-candidates` 验证抓取
5. 运行 `npm run process:tool-candidates` 几次将工具数量提升到 100+

### Task B：工具详情页 — 更多数据填充

`tools` 表有以下字段目前大多为 null/默认值，AI 自动填充质量较低：
- `openSource` (boolean)
- `githubRepo` (text)
- `pricingDetail` (text)
- `alternatives` (text[])

可考虑在 `process-tool-candidates.ts` 的 AI prompt 中增加这些字段的询问，或单独写一个 `update:tool-meta` 脚本（`package.json` 中已有该 script entry，`scripts/update-tool-meta.ts` 尚待实现）。

### Task C：工具库页面 UX 优化（低优先级）

- 移动端：Codex 已完成基础响应式；工具库分类仍保留横向滚动，后续可考虑折叠为 drawer
- 搜索：当前为 GET form 全页刷新，可考虑 debounce input + router.replace（client component）
- 排序：目前按 publishedAt desc，可加「热门」排序（按 upvotes）

---

## 四、关键文件路径速查

```
app/
  tools/
    page.tsx                  # 工具库列表页（Server Component, force-dynamic）
    [slug]/
      page.tsx                # 工具详情页
  news/page.tsx               # 资讯列表页
  trending/page.tsx           # GitHub趋势列表页

lib/
  db/
    schema.ts                 # Drizzle 表定义
    queries.ts                # 所有数据库查询函数
    index.ts                  # db 实例（Neon serverless）
  jobs/
    process-tool-candidates.ts # AI 批量处理工具候选（供 cron 调用）
    process-articles.ts        # AI 批量处理文章（供 cron 调用）
  llm/index.ts                # DeepSeek chat wrapper（读 DEEPSEEK_API_KEY）
  tokens.ts                   # 设计 token（颜色/间距）

scripts/
  fetch-tool-candidates.ts    # 从 RSS 抓取工具候选
  process-tool-candidates.ts  # 脚本版（手动运行）
  cleanup-tool-data.ts        # 清理噪音数据 + 禁用工具源
  seed-tool-sources.ts        # 初始化工具源数据
  update-tool-meta.ts         # (待实现) 补全工具元数据

components/
  SiteHeader.tsx              # 顶部导航
  CommandPalette.tsx          # ⌘K 搜索面板

vercel.json                   # Cron 配置（1/2/3 am UTC）
```

---

## 五、待研究问题（2026-05-02 下午细化）

### 问题 A：工具库缺失国内主流 AI 工具

**现状**：当前 ~24 条工具全为西方英文工具（ChatGPT/Midjourney 等），没有任何国内 AI 工具。

**根因**：
1. 手工种子数据偏西方，从未录入国内工具
2. RSS 抓取源全是英文站（DreyX/Insidr/Planet AI），不收录国内工具，且均已禁用
3. 没有中文 AI 工具目录的 RSS 源

**待细化方向**：

方案一（最快）：手工脚本 `scripts/seed-cn-tools.ts` 批量插入国内主流工具，AI 补全描述
待补录清单：

| 工具 | URL | 分类 | 定价 | 访问 |
|------|-----|------|------|------|
| 豆包 | doubao.com | chatbot | Freemium | accessible |
| Kimi | kimi.moonshot.cn | chatbot | Freemium | accessible |
| 文心一言 | yiyan.baidu.com | chatbot | Freemium | accessible |
| 通义千问 | tongyi.aliyun.com | chatbot | Freemium | accessible |
| 智谱清言 | chatglm.cn | chatbot | Freemium | accessible |
| 讯飞星火 | xinghuo.xfyun.cn | chatbot | Freemium | accessible |
| 元宝 | yuanbao.tencent.com | chatbot | Free | accessible |
| DeepSeek | deepseek.com | chatbot | Freemium | accessible |
| 即梦AI | jimeng.jianying.com | image | Freemium | accessible |
| 可灵AI | klingai.com | video | Freemium | accessible |
| MiniMax/海螺 | hailuoai.com | video | Freemium | accessible |
| 腾讯混元 | hunyuan.tencent.com | chatbot | Freemium | accessible |
| 秘塔AI搜索 | metaso.cn | research | Free | accessible |
| 天工AI | tiangong.cn | chatbot | Freemium | accessible |

方案二（中期）：爬取 ai-bot.cn
- 工具详情页格式规则：`https://ai-bot.cn/sites/[数字ID].html`
- 可抓取 sitemap 获取所有工具 URL → 解析名称/简介/分类 → 写入 tool_candidates → 跑 AI 补全
- 注意：需要处理反爬，且数据需二次清洗

### 问题 B：工具详情页内容单薄 ✅ 已解决

使用教程（howToUse）、FAQ（faqs）、点赞数已全部实现，详见「已完成工作汇总 - 工具详情页丰富化」。

剩余可做（低优先级）：
- 功能点从 pill 升级为「标题 + 一句说明」（需 AI prompt 改造 + 数据迁移）
- 用户评论/评分系统（需用户认证体系，工程量大）

---

## 五·五、产品差异化方向（2026-05-02 下午讨论，待 Codex 实施）

### 战略定位

> **AiToolsBox = 中国用户专属的 AI 工具指南**

不是抄 ai-bot.cn，而是做对国内用户**更友好**的版本。每个功能决策都问一句：「这对国内用户有什么独特价值？」

### 用户提出的三个问题

1. 工具的分类远不如 ai-bot.cn 丰富
2. 工具的图标不如 ai-bot.cn（我们是字母色块，他们是真 favicon）
3. 详情页的介绍不如 ai-bot.cn 丰富

### 解决方案 — 围绕「国内用户」差异化

#### 任务 D1：分类按「国内用户心智模型」重组（中等优先级）

**现状**：14 个分类是从西方 AI 目录翻译，不贴合国内搜索习惯

**新增分类清单**（围绕国内场景）：
```
ai-search       AI搜索引擎       (秘塔/天工带火)
translation     AI翻译           (独立成类)
side-hustle     AI副业 / AI赚钱   ⭐ 国内独有热点
digital-human   AI数字人 / AI主播 ⭐ 国内电商带货爆款
ppt             PPT制作          (从 productivity 拆出)
detection       内容检测/查重    ⭐ 国内学生刚需
ai-learn        学习AI技术本身    (区别于 education)
```

**实施步骤**：
1. `lib/data.ts` / categories 表追加上述 7 个分类
2. 现有 38 个工具中，找出符合新分类的重新归类（如把 metaso 从 research → ai-search）
3. 更新 `seed-cn-tools.ts` 中工具的 catId
4. 验证 `/categories/[id]` 页面对新分类正常渲染

#### 任务 D2：图标系统升级 + 国产/需VPN徽章（最高优先级，视觉冲击大）

**现状**：用 `mono`（字母）+ `brand`（颜色块）做 placeholder，国内用户无法靠图标识别工具

**方案**：
1. **schema 加 `iconUrl text`** — DDG favicon 服务自动填充（`https://icons.duckduckgo.com/ip3/<domain>.ico`）
2. **写脚本 `scripts/fill-tool-icons.ts`** — 遍历所有工具，从 `tool.url` 提取 domain，生成 iconUrl
3. **改卡片渲染** — 优先 `<img src={iconUrl}>`，缺失/加载失败回退到字母块
4. **加角标徽章** — 在卡片右上角醒目展示：
   - 🇨🇳 红底「国产」徽章（chinaAccess=accessible 且工具是中国公司产品）
   - ⚠️ 黄底「需VPN」徽章（chinaAccess=vpn-required）
   - 🚫 灰底「已屏蔽」徽章（chinaAccess=blocked）

**为什么是最高优先级**：用户一眼能识别「这工具我能不能用」，比 ai-bot.cn 还实用（他们不区分访问性）。

**注意**：
- DDG 服务有时返回 1×1 透明图（取不到 favicon），需做尺寸/字节数检测，过小则视为失败
- 「国产」徽章判断逻辑可以用 url 域名包含 `.cn` 或在白名单里（doubao/kimi/deepseek 等）

#### 任务 D3：详情页加「中国用户专属」字段（高优先级，独特价值）

**思路**：不是补长篇介绍（那是 ai-bot.cn 做的事），而是回答国内用户最关心的**实操问题**。

**schema 新增字段**：
```typescript
// 注册门槛
registerMethod: text('register_method').array()       // ['手机号', '微信扫码', '邮箱']
needsOverseasPhone: boolean                           // 是否需要海外手机号
needsRealName: boolean                                // 是否需要实名认证

// 支付门槛
overseasPaymentOnly: boolean                          // 是否仅支持海外信用卡
priceCny: text('price_cny')                          // 人民币价格（如「会员¥48/月」）

// 国内特色入口
miniProgram: text('mini_program')                    // 微信小程序名称
appStoreCn: boolean                                  // 是否上架 App Store 中国区
publicAccount: text('public_account')                // 官方微信公众号

// 国产替代（杀手级功能）
cnAlternatives: text('cn_alternatives').array()      // ['doubao', 'kimi'] —— 工具被墙时给国内替代品

// 配套教程（国内平台）
tutorialLinks: jsonb('tutorial_links')               // [{platform:'bilibili', url, title}]
```

**详情页对应的新区块**：

```
┌─ 🇨🇳 国内用户须知（已有，扩展） ──┐
│  访问方式 / 中文界面 / 免费额度    │
│  注册：手机号 + 实名认证   ← 新   │
│  支付：仅支持海外信用卡 ⚠️ ← 新   │
│  价格：约 ¥150/月         ← 新   │
│  小程序：搜「豆包」可用    ← 新   │
└──────────────────────────────────┘

┌─ 🔄 国产替代方案 ──────────────┐ ← 全新区块（杀手级）
│ 此工具需 VPN，国内用户可用：    │
│ • 豆包 (字节，免费)             │
│ • Kimi (月之暗面，长文本强)     │
└──────────────────────────────┘

┌─ 📺 国内教程资源（可选） ──────┐ ← 全新区块
│ • B站：xxx 教程视频  ↗         │
│ • 小红书：实操笔记 #           │
└──────────────────────────────┘
```

**实施步骤**：
1. schema 加上述字段，`npm run db:push`
2. `loadToolById` 和 `Tool` 类型扩展
3. `seed-cn-tools.ts` 14 个国内工具手工补全这些字段（数据已知的）
4. `process-tool-candidates.ts` AI prompt 升级（针对新工具自动生成保守值）
5. 详情页改造「国内用户须知」卡片 + 新增「国产替代方案」「教程资源」两个区块

### 实施优先级（按用户价值）

```
P0 ─ 任务 D2  图标 + 国产徽章
       理由：视觉冲击大、改动小、用户一眼识别能否使用

P1 ─ 任务 D3  详情页中国用户专属字段（含国产替代）
       理由：独家价值，ai-bot.cn 做不到

P2 ─ 任务 D1  分类按国内场景重组
       理由：长尾 SEO 受益，但工具量到 100+ 才明显
```

### 验证标准

- D2 完成后：在 `/tools` 列表页所有卡片应显示真实图标（或回退字母块），右上角有「国产/需VPN/已屏蔽」徽章之一
- D3 完成后：14 个国内工具的详情页「国内用户须知」卡片有 8 项信息，且至少能看到一个工具有「国产替代方案」推荐（如 ChatGPT 详情页推荐豆包/Kimi）
- D1 完成后：`/categories` 应有 21+ 分类，新增的 `/categories/side-hustle`、`/categories/digital-human` 等页面能正常渲染

---

## 五·六、工具发现源升级 — 紧盯热门工具（待 Codex 实施）

### 问题定义

> **「好源」≠「多」，而是「能持续给我们热门信号」**

之前废掉的 DreyX/Insidr/Planet AI 三个源，本质问题不是数量少，而是它们抓的本身就是新闻 Digest，而非工具。重新定义需求：

1. 持续抓到「真正在火的」AI 工具（PH 当日榜首、HN 顶帖、GitHub 一周猛涨）
2. 国内热度信号要单独抓（小红书、B站、公众号热文里提的工具）
3. 一个工具被多个源同时提到 → 极强热度信号

### 五个源的可行性分级

#### 🟢 立即可做（一周内能上）

##### 源 1：Hacker News API（免费、官方、稳定）

```
顶帖 ID 列表：https://hacker-news.firebaseio.com/v0/topstories.json
帖子详情：    https://hacker-news.firebaseio.com/v0/item/<id>.json
```

实施：
- 每小时抓一次顶 100 帖
- 过滤标题含 AI 关键词（AI/LLM/GPT/agent/copilot...）或 `Show HN:` 的
- 提取 url 字段（外链）→ 跑 `looksLikeNews` 过滤 → 入 `tool_candidates`
- 把 HN points 存到候选记录里作为热度依据
- **优势**：开发者社区第一手信号，新工具发布都在这

##### 源 2：Product Hunt API（最强热门信号）

```
GraphQL 端点：https://api.producthunt.com/v2/api/graphql
```

需要先在 producthunt.com/v2/oauth/applications 申请开发者 token（免费）。

实施：
- 每日抓 `topic:artificial-intelligence` 当日 launches
- GraphQL 直接拿到 votes / makers / topics / website
- **votes 数就是天然热度分**
- **优势**：业内公认的「新工具发布场」，质量极高

##### 源 3：复用我们自己的 GitHub Trending 数据（零成本）

```
当前 github_trending 表已有：repo / stars / gained / lang / description
```

实施：
- 写脚本 `scripts/promote-trending-to-tools.ts`
- 扫 `gh_trending` 表 → 通过 GitHub API 取每个 repo 的 `homepage` 字段
- 有 homepage、是 AI 项目（按 description 关键词或 topics）→ 视为工具候选
- 用 `gained`（一周新增 stars）作为热度分
- **优势**：数据已在库里，零额外抓取成本

#### 🟡 中期（两到四周）

##### 源 4：ai-bot.cn sitemap 增量抓取

实施：
- 每周拉 `https://ai-bot.cn/sitemap.xml`
- 与上次结果 diff，只处理新增 URL
- 解析 `/sites/<id>.html` 提取名称、简介、分类、点赞数
- **优势**：国内最全工具站，**点赞数是国内用户真实热度信号**
- **风险**：反爬（设 User-Agent + 限流）、HTML 结构可能变化、版权（仅取公开元数据，不复制描述全文）

#### 🟠 长期 / 运营兜底

##### 源 5：国内热度（小红书 / B站 / 公众号）

机器抓难度高，建议**「半自动 + 运营」**：
- 后台开「人工录入热门工具」入口（简易管理页）
- 运营每周看小红书「AI 工具」TOP 笔记 / B站「AI 工具推荐」热门视频，把里面提到的工具录入
- 给这些条目打 `source=manual-cn-hot` 标签

### 综合热度信号设计

`tool_candidates` 加几个字段，承接多源热度：

```typescript
phVotes:        integer  // Product Hunt votes
hnPoints:       integer  // Hacker News points
ghGainedStars:  integer  // GitHub 一周新增 stars
aibotLikes:     integer  // ai-bot.cn 点赞数
mentionsCount:  integer  // 被多少个源同时提到（关键信号）
firstSeenAt:    timestamp
hotnessScore:   integer  // 综合分（上述加权）
```

**`hotnessScore` 加权公式（建议）**：
```
hotnessScore =
    phVotes        * 1.5    // PH 用户主动投票，最权威
  + hnPoints       * 1.0
  + ghGainedStars  * 0.05   // 数量级大，权重要小
  + aibotLikes     * 0.5
  + mentionsCount  * 50     // 多源提及加大幅奖励
```

`process-tool-candidates.ts` 改为按 `hotnessScore desc` 处理，**热门工具优先 AI 处理上线**，冷门候选延后或自动丢弃。

### 实施任务清单

#### 任务 E1（P0）：HN + GitHub trending → tool 转化

- 新建 `scripts/fetch-hn-tools.ts`：抓 HN 顶帖 → 过滤 → 入 tool_candidates
- 新建 `scripts/promote-trending-to-tools.ts`：从 gh_trending 提升到 tool_candidates
- `package.json` 新增 npm scripts
- `vercel.json` 加 cron（HN 每小时一次，trending 每日一次）
- schema 加 `hnPoints`、`ghGainedStars`、`firstSeenAt`、`hotnessScore`、`mentionsCount` 字段

#### 任务 E2（P1）：Product Hunt API 接入

- 申请 PH 开发者 token，写入 `.env.local` 的 `PRODUCT_HUNT_TOKEN`
- 新建 `scripts/fetch-ph-tools.ts`：GraphQL 查询每日 AI launches
- schema 加 `phVotes` 字段
- 加 cron（每日抓一次）

#### 任务 E3（P1）：综合热度排序处理

- `lib/jobs/process-tool-candidates.ts` 改 ORDER BY 为 `hotnessScore desc`
- 加阈值：`hotnessScore < 5` 的候选自动 mark rejected（不浪费 AI 调用）

#### 任务 E4（P2）：ai-bot.cn sitemap 增量抓取

- 新建 `scripts/fetch-aibot-sitemap.ts`
- 注意 robots.txt + 限流（建议每秒不超过 1 个请求）
- 仅抓元数据（名称、URL、分类、点赞数），描述用 AI 重写避免版权问题

#### 任务 E5（P2）：运营录入页

- 路径 `/admin/tools/new`（先简易后台，无需鉴权按 IP 白名单或简单密码）
- 表单 → 写入 tool_candidates，sourceName='manual-cn-hot'

### 验证标准

- E1 完成后：HN 抓取每小时跑一次，每日新增 5+ 工具候选；trending 提升每日 3+ 候选
- E2 完成后：PH 抓取每日跑，每日新增 10+ 候选，phVotes 字段填充正确
- E3 完成后：`process-tool-candidates.ts` 处理日志显示按热度排序，hotnessScore < 5 的被自动拒绝
- 整体目标：tools 表三个月内增长到 200+ 条，且新增工具 80%+ 是「真正在火」的（PH/HN 热门、GitHub 飙升）

---

## 六、环境变量（.env.local）

```
DATABASE_URL=           # Neon PostgreSQL 连接串
DEEPSEEK_API_KEY=       # DeepSeek API key（用于 AI 处理）
CRON_SECRET=            # Vercel cron 鉴权 header
```

---

## 六、常用命令

## 七、Codex 更新（2026-05-02，Task 5 移动端响应式）

已处理移动端基础响应式，不改变现有数据逻辑：

- `components/SiteHeader.tsx`：移动端隐藏主导航，收紧顶部栏间距与搜索按钮文案。
- `components/V2Pro.tsx`：首页 hero、分类条、主内容双栏、精选/最新工具网格、右侧趋势栏、footer 在小屏改为单列或横向滚动。
- `app/tools/page.tsx`：工具库列表页标题字号、筛选栏换行、卡片网格最小宽度改为不会撑破屏幕。
- `app/tools/[slug]/page.tsx`：工具详情页 hero、说明、功能、国内用户须知、相关资讯、相关工具卡片改为 clamp padding / 自适应网格。
- `app/trending/page.tsx`：趋势列表页主容器、period tabs、repo 卡片统计行适配移动端。
- `app/trending/[...slug]/page.tsx`：GitHub 详情页 hero、标题、README、stats grid 适配移动端。
- `app/news/page.tsx`、`app/news/[id]/page.tsx`：新闻列表/详情页 hero、正文卡片、tag strip、文章网格适配移动端。
- `app/categories/[id]/page.tsx`：分类详情页 hero、工具网格、返回链接 padding 适配移动端。

验证要求：后续继续前请跑 `npm run lint` 和 `npm run build`；如有浏览器环境，重点查看 375px 宽度下 `/`、`/tools`、`/news`、`/trending`、工具详情页、GitHub 详情页是否无横向滚动。

---

```bash
npm run dev                    # 本地开发
npm run db:push                # 同步 schema 到 Neon
npm run fetch:tool-candidates  # 抓取工具候选
npm run process:tool-candidates # AI 处理工具候选（批量 6 条）
npm run cleanup:tool-data      # 清理噪音 + 禁用工具源
npm run fetch:articles         # 抓取资讯
npm run process:articles       # AI 处理资讯（摘要/翻译/标签）
```
