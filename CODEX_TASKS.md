# CODEX 任务交接文档

> 最后更新：2026-05-02
> 本文件记录 Claude 已完成的工作及 CODEX 待续任务。

---

## 🚨 Codex 当前进度提醒（2026-05-02 晚）

**G1-G3 已完成 ✅**（commits `a5ba5b9` / `65a4a02` / `ed20a0a`）：DDG favicon、README 翻译落 DB、HN 名清洗都改对了。

**但 G4 / G5 / G7 / E4 还一个都没做**，请继续按以下顺序推进，每个独立 commit：

```
👉 下一批待做（按优先级）

G4  F2 中文资讯源切换         ← 立刻做，工程量中等，对齐产品定位
G7  D3 详情页中国用户字段     ← 含「🔄 国产替代方案」杀手级区块
G5  E3 综合热度评分           ← 提升候选池质量
E4  ai-bot.cn sitemap 抓取    ← 国内工具最全的源，注意法律防线（详见 五·六 E4）
G8  D1（分类重组）/ E5（运营录入）← 最后批，等前面稳定
```

**G6（Product Hunt 官方 API）已跳过 ❌**，原因：
1. PH 在国内访问不稳定（DNS 污染 / Cloudflare 节点慢），用户实测无法打开 OAuth 申请页
2. Vercel 部署后 cron 跑 PH API 也可能因 IP 不稳定被拒
3. PH 上的工具大多需 VPN，不一定是国内用户优先项
4. HN（已接）+ GitHub trending（已接）+ ai-bot.cn（待做 E4）的组合更适合「中国用户专属」定位

每个任务的具体实施细节见下面对应章节（G4 → 五·七 F2，G7 → 五·五 D3，G5 → 五·六 E3，E4 → 五·六 E4）。

---

## ⚡ 最新检查（2026-05-02 晚，Claude review 后给 Codex 的下一批任务）

Codex 已完成 D2 / E1 / F1 三个任务，实测可用。但 review 后发现以下问题需要修复，以及还未启动的 P0/P1 任务清单。**Codex 拿到这一节后请按顺序处理，每完成一个 commit 一次。**

### G1（最高优先级）：修复 favicon 服务 — 改用 DDG，不用 Google

**问题**：`components/ToolBadges.tsx` 第 58 行用的是 `https://www.google.com/s2/favicons?domain=...&sz=128`，但本产品定位「中国用户专属」，**Google 在国内不稳定甚至被墙**，会导致大量国产用户看不到工具图标，与产品定位直接冲突。

**修复**：
1. `components/ToolBadges.tsx` 中 `faviconUrl` 函数改为返回 DDG 地址：
   ```typescript
   return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`;
   ```
2. `next.config.ts` 中的 `images.remotePatterns` 把 `www.google.com` 改成 `icons.duckduckgo.com`（如果之前加过 google 的，要移除）
3. 验证：用国内网络访问 `/tools`，所有工具卡片 favicon 应正常加载（DDG 在国内访问稳定）

**注意**：DDG 偶尔返回 1×1 透明小图（取不到 favicon 时），可考虑加一层「图片加载失败 → 字母兜底」的 onError 处理（如果需要 client component 改造，可以选择保留 server-side 的 favicon URL，让浏览器自然回退）。

### G2（高优先级）：F1 README 翻译落地存储 + env var 对齐

**问题 1**：`lib/baidu-translate.ts` 用 `BAIDU_TRANSLATE_KEY`，但 CODEX_TASKS 文档要求的是 `BAIDU_TRANSLATE_APP_KEY`（与百度官方文档命名一致）。需要二选一对齐。

**修复 1**：
- 推荐改 `lib/baidu-translate.ts` 用 `BAIDU_TRANSLATE_APP_KEY`（与官方一致）
- 同步更新「六、环境变量」段（已是 `BAIDU_TRANSLATE_APP_KEY`，不用改）
- 同步更新 Codex 自己的「九、Codex 更新」记录

**问题 2**：当前每次访问详情页都会触发翻译（虽然有 Next HTTP cache 24h，但每天还是浪费一次百度配额，且页面冷启动慢）。文档要求**翻译结果存到 `github_trending.readmeZh` 字段**，永久缓存。

**修复 2**：
1. `lib/db/schema.ts` 中 `githubTrending` 表加字段 `readmeZh: text('readme_zh')`
2. 运行 `npm run db:push`
3. `app/trending/[...slug]/page.tsx` 改造逻辑：
   - 加载 repo 时 SELECT 包含 `readmeZh`
   - 如果 `readmeZh` 已有值 → 直接渲染
   - 如果为空且配置了百度密钥 → 调翻译 → UPDATE 入库 → 渲染
4. `scripts/translate-readme.ts` 也改成 UPDATE 入库（不只是输出）
5. 写一个补全脚本 `scripts/translate-all-readmes.ts`，遍历所有 `readmeZh IS NULL` 的 repo，批量翻译入库（限速 1 秒一次，避开百度 QPS 限制）

### G3（中优先级）：HN 候选名清洗

**问题**：当前 HN 候选的 name 是帖子标题（如「Show HN: AcmeAI - A GPT-powered note tool」），Codex 已做了简单清洗，但仍可能含描述性后缀。AI 处理时把这种带描述的 name 当工具名入库会很丑。

**修复**：在 `lib/jobs/discover-tool-signals.ts` 的 `cleanTitle` 函数里加更严格的规则：
- 截取 `:`、`-`、`–`、`—`、`|` 之前的部分作为工具名（如 `AcmeAI - A GPT...` → `AcmeAI`）
- 长度超 30 字直接 reject 不入库（多数纯描述性帖子）
- 工具名只允许字母/数字/`-`/`_`/`.`、长度 ≤ 30

### G4（高优先级，未启动）：F2 资讯源切到中文 + 删英文

**任务详情见「五·七 任务 F2」**（机器之心 / 量子位 / 36氪 等 7 个源）

补充要点：
1. 不要直接删除现有英文 sources，而是 `UPDATE sources SET active=false WHERE lang='en'`，保留历史数据
2. 验证抓取链路时注意中文 RSS 编码（部分站可能 GBK，需 iconv-lite 转码）
3. 确认 cron 跑通后再考虑实施 F2-3（B站抓取）

### G5（中优先级，未启动）：E3 综合热度评分

**任务详情见「五·六 任务 E3」**（hotnessScore 加权排序 + 阈值过滤）

实施要点：
1. schema 加字段：`hnPoints`、`ghGainedStars`、`hotnessScore`、`firstSeenAt`
2. `discover-tool-signals.ts` 抓取时填这些字段（`votes` 已是来源原始分，新字段是分类记录）
3. `process-tool-candidates.ts` 改 `loadPendingToolCandidates` 的 ORDER BY 为 `hotnessScore DESC, fetchedAt DESC`
4. 阈值丢弃：`hotnessScore < 5` 直接 markRejected 不喂 AI

### G6（已跳过 ❌）：E2 Product Hunt 官方 API

**决定跳过，不做。** 原因：
1. PH 在国内访问不稳定（DNS 污染 / Cloudflare 节点慢），实测连 OAuth 申请页都打不开
2. Vercel 部署后 cron 跑 PH API 也可能因 IP 不稳定被拒
3. PH 上的工具大多需 VPN，不一定是国内用户优先项

**替代方案**：保留 Codex 之前在 RSS 源里加的 `https://www.producthunt.com/feed?category=artificial-intelligence`（虽然质量低于 GraphQL API，但作为辅助源够用），新工具发现主要靠 HN（已有）+ GitHub trending（已有）+ ai-bot.cn（E4 待做）。

### G7（中优先级，未启动）：D3 详情页中国用户专属字段

**任务详情见「五·五 任务 D3」**（注册门槛 / 支付门槛 / 微信小程序 / **国产替代方案** 等）

「🔄 国产替代方案」是杀手级区块，做完后 ChatGPT 详情页能推荐豆包/Kimi 给国内用户。

### G8（低优先级，未启动）：D1 分类重组、E4 ai-bot.cn 抓取、E5 运营录入页

详见对应章节，等 G1-G7 完成后再做。

### Codex 实施顺序建议

```
G1 (修 favicon)          → 立即修，对齐产品定位
G2 (F1 落地缓存 + env)   → 接着做，省百度配额 + 不返工
G3 (HN 名清洗)            → 数据质量补丁
G4 (F2 中文资讯源)        → 大改动，独立一个 commit
G5 (E3 热度评分)          → 配合 G4 后处理，提升候选质量
G6 (E2 PH API)           → 需要先申请 token
G7 (D3 详情页字段)        → 体量较大，独立 commit
```

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

##### 定位

把 ai-bot.cn 当作「**国内 AI 工具的索引黄页**」用，不是爬整个网站。我们只关心两件事：
1. 他们已经收录了哪些国内工具（能拿到工具的**官网 URL**）
2. 这些工具的国内热度（**点赞数**）

剩下的内容（描述、功能、教程、FAQ）全部用我们自己的 AI 重新生成。

##### 抓取流程

**第一步：sitemap.xml 拉全量 URL 列表**

```
https://ai-bot.cn/sitemap.xml
```

ai-bot.cn 的工具详情页 URL 格式 `/sites/<id>.html`，从 sitemap 里能一次性拿到几千条工具页 URL。

**第二步：每个工具页解析这些字段（且仅这些字段）**

| 字段 | 用途 | 我们的目标字段 |
|------|------|----------------|
| 工具名（如「豆包」） | 工具识别 | `tool_candidates.name` |
| 工具官网 URL（指向 doubao.com） | ⭐ 关键 | `tool_candidates.url` |
| 主分类（如「AI聊天助手」） | 预归类 | 映射到我们的 catId |
| 一句话简介 | **仅作 AI 处理时的参考输入**，不直接展示 | （prompt input only，不写入 tools 表） |
| 点赞数（如 3878） | 国内热度信号 | `tool_candidates.aibotLikes` |

**第三步：增量化 — 只处理新增 URL**

每周拉一次 sitemap，与 DB 中已记录的 URL 集合 diff，只处理新增。这样每周可能新增几十到几百条候选，不会重复打扰目标站点。

##### 法律风险规避（务必严格遵守）

**❌ 绝对不做的事：**

1. **不复制任何描述文案** — ai-bot.cn 的简介只作为 AI 处理时的输入参考，**不直接展示给用户**，写入 tools 表的 `en` / `zh` 全部由 DeepSeek 重新生成
2. **不抓取截图、logo、视频等图片资源** — 我们自己用工具官网的 favicon，不复用 ai-bot.cn 的图片
3. **不复制评论、用户内容** — 评论区数据完全不抓
4. **不做整站抓取** — 不爬首页、分类页、活动页等非 sitemap 包含的页面
5. **不模拟登录、不绕过付费内容** — sitemap 是公开的，不做需鉴权的操作
6. **不抓取 robots.txt 禁止的路径** — 抓取前先验证 `/robots.txt`，遵守 Disallow 规则

**✅ 必须做的事：**

1. **限速** — 每秒最多 1 个请求，并发 = 1（同步顺序处理）
2. **明确 User-Agent** — 设置可识别的 UA：`AiToolsBox-Crawler/1.0 (https://aiboxpro.cn; respectful)`，方便对方识别和联系
3. **遵守 robots.txt** — 抓取前先 fetch 一次 `https://ai-bot.cn/robots.txt`，解析 Disallow，命中则跳过
4. **错误率高时停止** — 如果连续 5 个请求 4xx/5xx，立即停止本次任务，避免被封后继续打
5. **响应 429/503** — 遇到限流响应自动退避，最多 3 次后放弃
6. **frequency 不超过每周 1 次** — 不需要更频繁，sitemap 一周更新一次足够
7. **抓取上限** — 单次任务最多新增 200 条候选，超过则截断（避免一口气拉完所有历史）
8. **数据落地后只用元数据** — 入库后我们的 AI 处理流程**完全基于 url 自己重新爬目标工具官网**生成描述，ai-bot.cn 的简介**只用一次** 作为 prompt 引导，不存档不展示

**⚖️ 法律性质判断**：

- sitemap.xml 是公开 SEO 文件，抓取行为合理
- 网站名称 + 官网 URL 属于**事实性数据**（fact），不构成版权
- 描述文案构成版权作品，**我们不复制不展示，仅作 AI 引导**（合理使用 grey area，但保守起见也可以连引导都不用，只用「工具名 + URL」让 AI 自己去工具官网取信息）
- **最稳妥方案**：连描述都不取，只取「工具名 + 官网 URL + 点赞数」三个事实性字段
- 如果 ai-bot.cn 有「禁止机器抓取」声明（在 ToS 或 robots.txt），立即停止此任务

##### 实施步骤

1. **新建 `scripts/fetch-aibot-sitemap.ts`**
   - 步骤：fetch robots.txt 检查 → fetch sitemap.xml → diff 已有 URL → 限速逐个抓 → 解析 → 入 tool_candidates
   - 错误处理：5 次连续失败立即终止
2. **schema 加 `aibotLikes` 字段**（已在 E1 综合热度信号中规划）
3. **`tool_candidates.sourceName='aibot'`** 标记来源
4. **加 cron** — 每周一次（如周一凌晨 4 点），不要更频繁
5. **写运行日志**：每次任务结束输出新增数 / 跳过数 / 失败数 / 耗时
6. **手动开关** — 在 sources 表加一条记录，`active=true/false` 控制是否抓取，便于随时停止

##### 验证标准

- 单次任务新增 30-100 条候选（前几次会多，稳定后每周 50 左右）
- DB 中 `aibotLikes` 字段填充率 100%（这个源拿到的都有）
- robots.txt 检查日志清晰
- 有终止日志（错误时立即停止而非死磕）
- 法务自查清单（schema 中无 ai-bot.cn 描述文案、无图片、无评论）

##### 退出预案

如果未来 ai-bot.cn 发律师函或在 robots.txt 明确禁止：
1. 立即把 sources 表中 ai-bot 那条 `active=false`
2. 不删除已入库工具数据（已是我们 AI 重新生成的，不构成侵权）
3. 仅删除 `tool_candidates` 表中标记 source='aibot' 的 pending 条目

#### 任务 E5（P2）：运营录入页

- 路径 `/admin/tools/new`（先简易后台，无需鉴权按 IP 白名单或简单密码）
- 表单 → 写入 tool_candidates，sourceName='manual-cn-hot'

### 验证标准

- E1 完成后：HN 抓取每小时跑一次，每日新增 5+ 工具候选；trending 提升每日 3+ 候选
- E2 完成后：PH 抓取每日跑，每日新增 10+ 候选，phVotes 字段填充正确
- E3 完成后：`process-tool-candidates.ts` 处理日志显示按热度排序，hotnessScore < 5 的被自动拒绝
- 整体目标：tools 表三个月内增长到 200+ 条，且新增工具 80%+ 是「真正在火」的（PH/HN 热门、GitHub 飙升）

---

## 五·七、本地化体验升级（待 Codex 实施）

### 任务 F1：GitHub README 中文翻译（百度翻译 API）

**问题**：GitHub Trending 详情页（`/trending/[...slug]`）渲染的 README 几乎全英文，国内用户阅读门槛高。

**方案确定：百度翻译 API**

为何选百度而不是谷歌：
1. 百度翻译开放平台**免费 200 万字符/月**，对当前规模（~200 个 repo × 平均 5K 字 ≈ 100 万/月）足够
2. 国内访问稳定不被墙
3. 中文翻译质量比谷歌略好
4. 注册流程简单（5 分钟）
5. 谷歌「免费」非官方接口违反 ToS、IP 易被封；官方 Cloud Translation 需信用卡

**注册步骤**（Codex 提示用户操作）：
1. 访问 `https://fanyi-api.baidu.com/`
2. 注册并申请「通用翻译 API」标准版（免费）
3. 拿到 `APP_ID` 和 `APP_KEY`

**环境变量**：
```
BAIDU_TRANSLATE_APP_ID=
BAIDU_TRANSLATE_APP_KEY=
```

**实施步骤**：

1. **schema 加字段**：`github_trending` 表新增 `readmeZh text`（缓存翻译结果，避免重复调用）
2. **新建 `lib/translate/baidu.ts`**：
   - 函数签名：`translate(text: string, from: 'en', to: 'zh'): Promise<string>`
   - 签名算法：MD5(appid + q + salt + key)
   - 接口：`https://fanyi-api.baidu.com/api/trans/vip/translate`
   - 单次请求限 6000 字节（UTF-8）→ 切块发送，每秒 1 次（QPS=1 限制）
   - 失败重试 3 次，超时 fallback 到 DeepSeek 翻译
3. **保留 markdown 结构**：
   - 翻译前先用正则把 ```代码块``` 占位符替换（如 `__CODE_BLOCK_0__`）
   - 把行内 `code` 也占位符替换
   - 把 markdown 链接 `[text](url)` 中的 url 部分占位符替换（只翻 text）
   - 翻译完成后还原占位符
4. **改造 `app/trending/[...slug]/page.tsx`**：
   - 加载 repo 时若 `readmeZh` 为空，触发翻译并缓存
   - 详情页加「中英对照」切换按钮（默认显示中文，可切回英文原版）
   - 或并排展示（左中右英）
5. **写脚本 `scripts/translate-readmes.ts`**：批量为已有 200 个 repo 一次性翻译入库（避免详情页冷启动慢）

**单次翻译伪代码**：
```typescript
async function translateReadme(readme: string): Promise<string> {
  const { masked, placeholders } = maskCodeAndLinks(readme);
  const chunks = splitByBytes(masked, 5500);
  const translated = [];
  for (const chunk of chunks) {
    translated.push(await baiduTranslate(chunk));
    await sleep(1100); // QPS=1
  }
  return restorePlaceholders(translated.join(''), placeholders);
}
```

**验证标准**：
- 任意 GitHub trending 详情页能看到中文 README，代码块/链接/图片完整保留
- DB 中 `readmeZh` 字段填充率 80%+
- 月度百度翻译用量在 200 万字符内

---

### 任务 F2：AI 资讯改为只抓国内源

**问题**：当前资讯源以英文为主（TechCrunch / The Verge / VentureBeat 等），翻译后失真，且不符合「中国用户专属」定位。

**方案**：放弃所有英文源，只抓国内主流媒体 + B 站。

#### F2-1：禁用英文源，添加中文主流媒体 RSS（立即可做）

**操作**：
1. 把 `sources` 表中所有 `lang='en'` 的条目 `active=false`
2. 写脚本 `scripts/seed-cn-news-sources.ts` 添加以下中文源：

| 名称 | RSS / Feed | 备注 |
|------|------------|------|
| 机器之心 | `https://www.jiqizhixin.com/rss` | AI 权威媒体，质量高 |
| 量子位 | `https://www.qbitai.com/feed` | 通俗易懂，覆盖面广 |
| 36氪 AI | `https://36kr.com/feed` + 标签过滤 | 商业视角 |
| InfoQ 中文 AI | `https://www.infoq.cn/feed.xml` + 主题过滤 | 技术深度 |
| 虎嗅 AI | `https://www.huxiu.com/rss/0.xml` + 频道过滤 | 商业评论 |
| PingWest 品玩 | `https://www.pingwest.com/feed` | 科技媒体 |
| 钛媒体 AI | `https://www.tmtpost.com/rss.xml` + AI 标签 | 商业新闻 |

**注意**：部分 RSS 是全站 feed，需要在 fetch 时过滤标题/分类含 AI 关键词的条目。

3. 验证抓取链路：中文 RSS 通常 GBK/UTF-8 混杂，需检查编码处理

#### F2-2：处理逻辑调整（中文源）

`lib/jobs/process-articles.ts` 已有 `processChinese()` 分支（lang='zh'），逻辑已对：
- 中文源：标题保留原文为 `titleZh`，AI 只生成 `summaryZh` 和 `tag`
- 不需要翻译，省一半 token

**额外建议**：因为只有中文源了，可以把 `processEnglish()` 函数删掉，简化代码。

#### F2-3：B 站 AI 频道热门视频抓取（中期）

**为什么选 B 站作为社交平台首发**：
1. B 站有非官方但稳定的 API（`api.bilibili.com/x/web-interface/popular`）
2. AI 教程视频质量高，受众与我们目标用户高度重合
3. 反爬比小红书/微博弱
4. 视频标题 + UP 主信息 + 播放量都能拿到，是一手「国内热度」信号

**实施**：
1. 新建 `scripts/fetch-bilibili-ai.ts`
2. 调用：`https://api.bilibili.com/x/web-interface/search/all/v2?keyword=AI工具`
   或分区热门：`https://api.bilibili.com/x/web-interface/popular/precious`
3. 过滤标题含 AI 关键词的视频
4. 入库到新表 `bilibili_videos`：
   ```sql
   id, bvid, title, uploader, views, likes, duration, publishedAt, url, fetchedAt
   ```
5. 在首页或新闻页加「📺 B站 AI 热门」区块（替代/补充现有英文资讯）
6. 注意：B 站 API 需要带浏览器 User-Agent 头，可能需要 cookie

**长期可扩展（不必现在做）**：
- 微博热搜 AI 话题
- 知乎 AI 话题精华
- 小红书（最难，反爬严，最后做）

#### 验证标准

- F2-1 完成后：sources 表 `active=true` 的条目全部 `lang='zh'`，cron 跑完 articles 表新增条目全部为中文
- F2-2 完成后：`processEnglish` 调用次数为 0，`processChinese` 处理量为之前总量的全部
- F2-3 完成后：bilibili_videos 表每周新增 50+ 视频，前端能看到 B 站热门 AI 视频列表

---

## 六、环境变量（.env.local）

```
DATABASE_URL=                   # Neon PostgreSQL 连接串
DEEPSEEK_API_KEY=               # DeepSeek API key（用于 AI 处理）
CRON_SECRET=                    # Vercel cron 鉴权 header
BAIDU_TRANSLATE_APP_ID=         # 百度翻译开放平台 APP ID（任务 F1）
BAIDU_TRANSLATE_APP_KEY=        # 百度翻译开放平台密钥（任务 F1）
PRODUCT_HUNT_TOKEN=             # Product Hunt API token（任务 E2，可选）
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

## 八、Codex 更新（2026-05-02，工具 RSS 源恢复）

已恢复工具自动抓取输入源：

- Product Hunt AI：`https://www.producthunt.com/feed?category=artificial-intelligence`
- BetaList AI：`https://betalist.com/topics/artificial-intelligence/feed`
- Cut & Ship AI：`https://www.cutandship.ai/feed.xml`

已执行验证：

- `npm run seed:tool-sources`：启用上述 3 个源，禁用 DreyX / Insidr / Planet AI 等新闻型源。
- `npm run fetch:tool-candidates`：成功插入 56 条候选，Product Hunt AI 30、BetaList AI 20、Cut & Ship AI 6。
- `npm run process:tool-candidates`：端到端跑通，结果为 processed 3、skipped 3、rejected 0。

代码变更：

- `scripts/seed-tool-sources.ts`：替换为 3 个验证可用源，并补充失效源禁用清单。
- `lib/jobs/fetch-tool-candidates.ts`：清洗 RSS/Atom 描述中的 HTML，归一 `产品名 – tagline` / `产品名 - tagline` 标题。
- `lib/jobs/process-tool-candidates.ts`：LLM 结果支持 `isTool:false`，用于识别非工具候选。

注意：

- Cut & Ship 有少量项目型/非标准工具条目，后续如质量不稳可先禁用该源。
- `process-tool-candidates` 目前遇到 `isTool:false` 会 skipped，后续建议改成 rejected，避免重复处理。

---

## 九、Codex 更新（2026-05-02，D2 / E1 / F1）

已完成用户指定任务：

### D2：图标 + 国产/VPN 徽章

- 新增 `components/ToolBadges.tsx`：
  - `ToolIcon`：优先使用官网 favicon，兜底使用原字母 logo。
  - `AccessBadge`：统一展示“国产友好 / 国内直连 / 需 VPN / 国内受限”徽章。
- `/tools` 列表页已接入 favicon 图标与访问徽章。
- `/tools/[slug]` 详情页 hero 已接入 favicon 图标与访问徽章。
- `next.config.ts` 已允许 `www.google.com` favicon 图片域名。

### E1：HN + GitHub trending → 工具候选

- 新增 `lib/jobs/discover-tool-signals.ts`：
  - Hacker News：通过 Algolia API 抓取 `Show HN / Launch HN + AI` 候选。
  - GitHub trending：从本地 `github_trending` 的 week 榜筛 AI 相关 repo，写入 `tool_candidates`。
- 新增脚本：`npm run discover:tool-signals`。
- `/api/cron/refresh-tools` 已改为同时跑 RSS、HN、GitHub trending 三路候选，然后继续跑 `processToolCandidates()`。
- `tool_candidates.source_type` 现在会写入 `hn` / `github` / `rss`，便于后续质量分析。
- 已执行验证：
  - `npm run discover:tool-signals`：HN 插入 9 条，GitHub trending 插入 7 条。
  - `npm run process:tool-candidates`：processed 4、skipped 2、rejected 0。

### F1：README 百度翻译

- 新增 `lib/baidu-translate.ts`：
  - 使用百度翻译 API：`BAIDU_TRANSLATE_APP_ID` + `BAIDU_TRANSLATE_KEY`。
  - 对 README 做 markdown 文本清洗，只翻译前 1400 字符作为中文速览，避免整篇 README 请求过大。
- GitHub 详情页 `/trending/[...slug]`：
  - 如果配置了百度翻译密钥，会在 README 上方显示“百度翻译 · 中文速览”。
  - 如果未配置密钥，页面不报错，只显示原 README。
- 新增脚本：`npm run translate:readme -- owner/repo`。
- 本地验证时 `.env.local` 未配置百度翻译密钥，脚本会提示并输出 README excerpt，退出码为 0。

后续建议：

- 如果要上线 F1，需要在 Vercel / GitHub Actions secrets 里补 `BAIDU_TRANSLATE_APP_ID` 和 `BAIDU_TRANSLATE_KEY`。
- E1 当前会把 HN/GitHub 候选先送进候选池，再由 LLM 过滤发布；质量稳定前不要一次性大批量 process。

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

---

## Codex update 2026-05-02 (G1-G3)

Status:
- G1 done: `components/ToolBadges.tsx` now uses DuckDuckGo favicon service, and `next.config.ts` allows `icons.duckduckgo.com`.
- G2 done: `github_trending.readme_zh` was added and pushed to Neon with `npm run db:push`; README translation now caches to DB; Baidu env name is aligned to `BAIDU_TRANSLATE_APP_KEY`; `scripts/translate-all-readmes.ts` and `npm run translate:readmes` were added.
- G3 done: HN candidate names are now cleaned before insert; `Show HN:` / `Launch HN:` prefixes are stripped, names are cut before `:`, `-`, en dash, em dash, or `|`, and candidates are rejected unless the name is ASCII letters/numbers/`-`/`_`/`.` with length <= 30.

Validation:
- `npm run db:push` completed for `readme_zh`.
- `npm run translate:readme -- vercel/ai` and `npm run translate:readmes -- 1` handle missing Baidu config cleanly.
- `npm run lint` and `npm run build` should be re-run after this update before push.

---

## Codex update 2026-05-02 (G4)

Status:
- G4 done: added `scripts/seed-cn-news-sources.ts` and `npm run seed:cn-news-sources`.
- The seed script disables existing `type='news'` sources and re-enables 7 Chinese news feeds: 机器之心, 量子位, 36氪 AI, InfoQ 中文 AI, 虎嗅 AI, PingWest 品玩, 钛媒体 AI. Tool discovery sources are untouched because they use `type='tool'`.
- `lib/jobs/fetch-articles.ts` now decodes RSS by declared charset and falls back to `gb18030` when UTF-8 replacement characters appear.
- Full-site Chinese feeds are filtered by AI keywords; 机器之心 and 量子位 are treated as AI-native feeds.
- `lib/jobs/process-articles.ts` was rewritten with readable Chinese tags/prompts and now interpolates the real Chinese title in `processChinese()`.

Validation:
- `npm run seed:cn-news-sources` completed and active news sources are Chinese only.
- `npm run fetch:articles` completed with 7 Chinese news sources; 虎嗅 official RSS timed out during validation, other sources completed.
- `npm run process:articles` processed 10 articles successfully.

---

## Codex update 2026-05-02 (G7)

Status:
- G7 done: `tools` now has China-specific fields for registration, overseas phone, real-name verification, payment limits, CNY price, WeChat mini program, China App Store availability, public account, China alternatives, and tutorial links.
- `process-tool-candidates` prompt now asks the LLM for conservative China-user metadata for every new tool candidate.
- `/tools/[slug]` now renders an 8-item China-user operations card, a China alternatives block, and optional domestic tutorial links.
- Added `scripts/update-cn-user-fields.ts` and `npm run update:cn-user-fields` to backfill key tools without editing the older seed file.

Validation:
- `npm run db:push` added the new `tools` columns in Neon.
- `npm run update:cn-user-fields` updated ChatGPT, Claude, Midjourney, Doubao, Kimi, and DeepSeek.
- `npm run lint` passed with the pre-existing `scripts/cleanup-tool-data.ts` unused `sql` warning.
- `npm run build` passed.

---

## Codex update 2026-05-02 (G5)

Status:
- G5 done: `tool_candidates` now has `hn_points`, `gh_gained_stars`, `hotness_score`, and `first_seen_at`.
- HN candidates write `hnPoints` and use HN points as `hotnessScore`.
- GitHub trending candidates write `ghGainedStars` and use `round(gained * 0.05)` as `hotnessScore`.
- Pending candidate processing now orders by `hotnessScore DESC, fetchedAt DESC`.
- Candidates with a known `hotnessScore < 5` are rejected before LLM processing; unknown scores stay eligible to avoid damaging older RSS candidates.

Validation:
- `npm run db:push` added the new `tool_candidates` columns in Neon.
- `npm run discover:tool-signals` completed successfully; no new candidates were inserted in that run.
- `npm run lint` passed with the pre-existing `scripts/cleanup-tool-data.ts` unused `sql` warning.
- `npm run build` passed.
