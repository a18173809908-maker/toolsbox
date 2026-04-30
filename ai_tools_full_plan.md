# 🛠 AI 工具聚合站 — 需求补充 & 开发计划

> 配套 [ai_tools_full_design.md](ai_tools_full_design.md) 与 UI 草图([UI/v2-pro.jsx](UI/v2-pro.jsx) 等)。
> 本文回答两件事:**原设计漏了什么** + **怎么落地**。

---

## A. 原设计缺漏与补充

### A1. 用户与互动层(原文档完全没有)
- 用户体系:邮箱/GitHub OAuth、JWT、匿名→登录态合并
- 收藏 / 关注分类 / 订阅周报(UI 侧栏已有 ★ Favorites 但无后端)
- 评分(1–5)、评论、举报失效链接
- 工具提交表单(顶栏 "+ Submit tool" 按钮要走的流程):草稿 → 审核 → 发布

### A2. 内容质量与治理
- 工具去重(同一工具多源):URL 标准化 + 名称模糊匹配
- 链接健康度巡检:每周 HEAD 请求,标记 dead / redirect
- AI 摘要质量门槛:置信度 < 阈值进人工队列
- 黑名单/敏感词过滤(资讯+评论)

### A3. 搜索与发现
- 全文搜索后端(原文档未指定):Postgres GIN / Meilisearch / Typesense 三选一
- ⌘K 命令面板的 API:`/api/search?q=&type=tool|repo|category`
- 标签云、相关工具推荐(同分类 + 共现标签)
- 对比页 `/compare?ids=a,b,c`、榜单页 `/leaderboard/:cat`

### A4. SEO 技术细节(原文档只列方向)
- SSG/ISR:Next.js `generateStaticParams` + 增量再生(每小时)
- `sitemap.xml` + `robots.txt` 自动生成
- 每页 JSON-LD(SoftwareApplication / Article / BreadcrumbList)
- Open Graph 动态封面图(`@vercel/og`)
- 内链策略:工具 → 同分类 / 同标签 / 替代品

### A5. 资讯模块细化(原文档只一句话)
- 源管理:RSS 列表入库,可启停,失败重试 + 退避
- 去重:标题 SimHash + URL 规范化
- AI 处理:摘要 + 标签 + SEO 标题 + 中英双语标题
- 编辑后台:草稿 / 已发布 / 撤回

### A6. 调度、监控、可观测
- 调度器:APScheduler 或 Celery Beat
- 任务状态表 `jobs(id, type, status, started_at, error)`,顶栏 "Last updated 2 min ago" 应查这里
- 监控:Prometheus + Grafana(抓取成功率、AI 调用时延/费用、API p95)
- 告警:Sentry(错误)+ webhook(任务连续失败)

### A7. AI 成本与多供应商
- 抽象 LLM 适配层:Claude / GPT / 本地模型可切换
- 成本看板:每日 token 用量、单条资讯处理成本
- 缓存层:已处理 URL 不重复调用 LLM

### A8. 安全与合规
- API 限流(用户/IP),反爬(UA + 行为)
- CSRF / XSS / SQLi 防护(FastAPI + ORM 默认 + CSP)
- 备案/隐私政策/Cookie 同意条(国内站需备案号)
- 第三方内容版权:摘要而非全文转载,显著标注来源

### A9. 商业化基础设施(原文档列了方向无设计)
- 广告位埋点:列表第 N 条 / 侧栏 / 详情页右栏(UI 需预留)
- CPS 链接跟踪:`?ref=aitoolsbox` + 点击落库
- 付费推荐:订单表 + 后台审核 + 到期下架
- 统计:GA4 + 自建点击/曝光埋点

### A10. 国际化
- UI 已是中英双语硬编码,需抽 i18n 字典(`zh-CN` / `en`)
- 路由:`/zh/...` `/en/...` 或 `Accept-Language` 协商

### A11. 部署与工程化
- 仓库结构:`apps/web`(Next.js)+ `apps/api`(FastAPI)+ `apps/worker`(爬虫/调度)+ `packages/shared`
- Docker Compose 一键起本地(pg / redis / api / web / worker)
- CI:lint + typecheck + 单元测试 + e2e(Playwright)
- 部署:Vercel(web)+ Fly.io / Railway(api+worker)+ Neon(pg)+ Upstash(redis)

### A12. 数据库补全(原文档三表不够)
新增/扩展:
- `tools`:加 `slug, logo_url, pricing, status, quality_score, click_count, fav_count, submitted_by, published_at`
- `tool_categories`(多对多)、`tool_tags`、`tool_alternatives`
- `users`、`user_favorites`、`user_recents`
- `submissions`、`reviews`(评分评论)
- `articles`:加 `slug, lang, source_id, ai_meta(jsonb), status`
- `sources`(RSS/爬虫源)、`jobs`(调度)、`ad_slots`、`click_events`

---

## B. 开发计划清单(按阶段 + 可勾选)

### Phase 0 — 工程基建(1 周)
- [ ] 初始化 monorepo(pnpm + turbo)
- [ ] `apps/web` Next.js 14 App Router + Tailwind
- [ ] `apps/api` FastAPI + SQLModel + Alembic
- [ ] `apps/worker` 调度入口(Celery 或 APScheduler)
- [ ] Docker Compose:pg / redis / api / web / worker
- [ ] CI:GitHub Actions(lint/test/build)
- [ ] 环境变量与密钥管理(`.env.example` + doppler/1password 任选)
- [ ] 错误监控接入(Sentry)
- [ ] 提交规范(commitlint + husky)

### Phase 1 — MVP(对齐原文档第十一节,3–4 周)
**数据**
- [ ] 数据库 schema 落地(B 节列出的所有表)
- [ ] 种子数据脚本:导入 200+ 工具(从 [UI/data.jsx](UI/data.jsx) 提取后清洗)

**采集**
- [ ] RSS 源管理 + 抓取器(10 分钟一次)
- [ ] GitHub Trending 爬虫(1 小时一次)
- [ ] ProductHunt API 接入
- [ ] 链接健康度任务(每周)
- [ ] 去重(URL 标准化 + SimHash)

**AI 处理**
- [ ] LLM 适配层(Claude / GPT 可切换)
- [ ] 摘要 + 标签 + SEO 标题流水线
- [ ] 处理结果缓存(已处理 URL 跳过)
- [ ] 成本与 token 用量记录

**API**
- [ ] `GET /api/tools`(分页/筛选/排序)
- [ ] `GET /api/tools/:slug`
- [ ] `GET /api/articles`、`/api/articles/:slug`
- [ ] `GET /api/github`(period/lang)
- [ ] `GET /api/search?q=&type=`
- [ ] `GET /api/categories`
- [ ] OpenAPI schema 自动生成

**前端**
- [ ] 把 [UI/v2-pro.jsx](UI/v2-pro.jsx) 迁移到 Next.js 组件
- [ ] 工具列表页 / 详情页 / 分类页
- [ ] 资讯列表 / 详情
- [ ] GitHub Trending 页
- [ ] ⌘K 命令面板接真 API
- [ ] SEO:sitemap、robots、JSON-LD、OG 图
- [ ] i18n 抽字典,zh / en 双语路由

**质量门槛(MVP 验收)**
- [ ] 工具 ≥ 200,资讯 ≥ 100,Repo ≥ 50
- [ ] Lighthouse 性能 ≥ 90,SEO ≥ 95
- [ ] 自动更新连续运行 7 天无人工干预

### Phase 2 — 用户与增长(2–3 周)
- [ ] 用户系统(邮箱 + GitHub OAuth)
- [ ] 收藏 / 最近浏览(替换 v2-pro 的本地 state)
- [ ] 工具提交表单 + 审核后台
- [ ] 评分 / 评论 / 举报失效
- [ ] 对比页 `/compare`
- [ ] 榜单页 `/leaderboard/:cat`
- [ ] 周报订阅(邮件,Resend / Postmark)
- [ ] 推荐:同类 / 替代品 / 共现标签
- [ ] 标签云 + 标签详情页
- [ ] Grafana 看板(抓取/AI/API 关键指标)

### Phase 3 — 商业化(2 周)
- [ ] 广告位组件 + 投放后台
- [ ] CPS 链接跟踪 + 点击表
- [ ] 付费推荐订单流程
- [ ] GA4 + 自建曝光/点击埋点
- [ ] 站长后台(收入 / 流量 / 转化)

### Phase 4 — 规模化(持续)
- [ ] 搜索切到 Meilisearch / Typesense
- [ ] CDN + 边缘缓存(Cloudflare)
- [ ] 限流 / 反爬 / WAF
- [ ] 多语言扩展(日 / 韩)
- [ ] App / 小程序(可选)

---

## C. 立即可做的下一步建议(优先级排序)

1. **冻结 schema** — 按 A12 写出 SQL/SQLModel,作为前后端契约
2. **抽数据契约** — 把 [UI/data.jsx](UI/data.jsx) 的 mock 结构对齐到 schema,后端先返回相同 JSON,前端零改动接入
3. **跑通一条端到端链路** — RSS → 入库 → AI 摘要 → API → 前端列表(其它源后补)
4. **SEO 基线先做** — sitemap/JSON-LD/OG 在内容少时就要到位,等内容堆起来才补会丢索引窗口

---
