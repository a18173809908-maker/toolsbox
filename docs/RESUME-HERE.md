# 从这里继续

> 这份文档是会话切换时的快速接续点。
> 长期文档见 `docs/current-position.md` 和 `docs/phased-roadmap.md`。

最后更新：本次会话最后 commit `75bd628`

---

## 上一段做了什么（按时间顺序）

### 一、文档审阅与判断

读了三份核心文档并给出判断：

- `docs/whitepaper.md` — 之前的决策平台白皮书，被后续 5/9 文档重置部分替代
- `docs/aiboxpro_详细版竞品分析与发展路线方案.md` — 战略蓝图，**大约 40% 可执行 / 60% 需团队/资源不到位**：
  - §8 数据库结构是 MySQL 语法（项目用 PostgreSQL + Drizzle），照搬会出错
  - §11 内容生产计划「每日 5-10 个工具 + 每周多篇深度内容」≈ 5 人编辑团队工作量，与「暂不做需要人工参与的内容」原则冲突
  - §12 商业化定价过早承诺
  - §6 导航/分类与现状不一致
  - 「AI 副业」相关内容建议不做（信任风险 + 与「技术决策者」主力用户画像不符）
- `CHANGELOG.md` — 不规范（无版本号、无 commit hash、混杂实现细节），且记录了几个**与路线图冲突的改动**：
  - 收藏/点赞按钮（需要登录态，但 `current-position.md` 说「暂不做登录」）
  - 「💡 我们的观点」UI 文案（AI 生成内容贴上「平台立场」标签是信任风险，应改为「AI 解读」）
  - `app/tools/page.tsx.backup` 和 `components/V2Pro.tsx.backup` 都是 `.backup` 反模式

**建议待办**（与用户讨论后未决定执行）：
1. 在 `aiboxpro_详细版...md` 顶部加免责说明，明确执行优先级以 `phased-roadmap.md` 为准
2. 删除「AI 副业」相关内容
3. 删除 `*.backup` 文件 + 加 `.gitignore` 排除
4. 「💡 我们的观点」改回「AI 解读」
5. 删除收藏/点赞按钮（或纳入登录系统范围）

### 二、生产环境数据恢复（事故处理）

**发现**：生产 DB `tools` 表只有 **24 条**，最早 2026-03-29 最新 **2026-04-22**，5 月之后未新增任何工具。原本应有 100+ 工具。Neon DB endpoint 没换（同一个 `ep-blue-frog-amvgygge-pooler`），数据丢失原因未定（可能某次 `db:push --force` 触发了截断）。

**用户选择**：直接重抓而不是 Point-in-Time Recovery。

**执行**：

1. 修了 `.env.local`（被覆盖成 placeholder 后由用户重新填回 DATABASE_URL/DeepSeek/Baidu key）
2. 修 `lib/db/queries.ts:672` 类型错误（fallback 类型与 dbFn 不匹配）
3. 修 `scripts/check-candidates.ts` 错误 import 路径
4. 提交 14 个文件 + 2500 行 codex 累积改动到 origin/main（commit `0edb98f`）
5. 重抓数据：
   - `npm run fetch:tool-candidates` → 4 条 RSS 候选
   - `npm run discover:tool-signals` → 0 条（去重）
   - `npm run fetch:aibot-sitemap -- 100` → 100 条 ai-bot.cn 候选
6. 发现 `process-tool-candidates.ts` 两个 bug：
   - **`maxTokens: 900` 太小**，DeepSeek 处理 15+ 字段 JSON 经常被截断
   - **enrich 返回 null（含 `isTool=false`）时只 `skipped++` 不标记 status**，导致候选反复被拉取处理
7. 修复后跑 30 轮 process 清空 174 候选池
8. 写 `scripts/bulk-approve-drafted.ts` 一次性把 42 条 `ai_drafted` → `tools`（绕过 admin 审核，C 方案）
9. 跑 `npm run seed:domestic-categories` 同步 categories.count
10. 提交修复（commit `75bd628`）

---

## 当前数据状态

| 指标 | 数量 |
|---|---|
| `tools` 总数 | **66**（原 24 + 新增 42） |
| `tool_candidates` published | 42 |
| `tool_candidates` rejected | 132（噪音 / hotnessScore<5） |
| `tool_candidates` pending | 0（池子已清空） |
| `categories` 总数 | 22 |
| 分类分布 | productivity 21 / design 7 / video 7 / audio 6 / code 6 / writing 6 / image 4 / ai-search 2 / opensource 2 / 其他单条 |

---

## 当前 Git 状态

```
最新 commit (origin/main):
  75bd628  fix(process): 提升 LLM maxTokens + 修 skipped 不标记的 bug + 新增批量 approve 脚本
  0edb98f  feat: 首页客户端化 + demo 页 + 工具脚本补齐 + 数据资产
  7a6db2d  完成多项优化：新闻页面改进、工具库侧边栏重构、分享按钮改进（之前已推）
```

**未提交的 untracked**：
- `components/V2Pro.tsx.backup` —— 反模式，**应该删除**

**主工作区 `D:/toolsbox`**：与 origin/main 同步

**Worktree `D:/toolsbox/.claude/worktrees/happy-nash-93465a`**：可能需要 `git pull` 才能拿到本次会话的几个 commit

---

## 已知问题 / 待办

按优先级排序：

### P0 - 需用户确认方向

1. **CHANGELOG 列出的功能与路线图冲突**（见上面"文档审阅"段落）。需决定：
   - 收藏/点赞按钮是否真的要 → 决定后才能修 UI
   - 「💡 我们的观点」是否改成「AI 解读」
2. **战略文档不一致** — `aiboxpro_详细版...md` 是否要加修正说明 + 删 AI 副业 + 删 §8 错误 SQL

### P1 - 可立即执行的清理

3. **删除 `components/V2Pro.tsx.backup`** 和 `app/tools/page.tsx.backup`（如果还在）
4. **加 `.gitignore`** 排除 `*.backup`、`*.bak`
5. **决定 process-tool-candidates 长期行为**：当前修复后是「AI 起草 → ai_drafted → 等审核」流程，但 ai_drafted 状态实际上是被 `bulk-approve` 一次性绕过的。要么继续走审核流（需要 admin UI 真的被人用），要么改回直接 publish（与 I8.5 设计相反）

### P2 - 数据继续完善

6. **继续扩 tools** — 当前 66 个，如果想继续涨：
   - `npm run fetch:aibot-sitemap -- 200` 拉更多 ai-bot.cn 候选
   - 跑 `npm run process:tool-candidates` 多轮（现在 bug 已修）
   - 跑 `npm run bulk-approve-drafted`（注意：bulk-approve 设计用于一次性恢复，频繁用违反审核流程设计）

### P3 - Sprint 3 主线推进

7. 当前 sprint 主线是 **AI 视频品类**（见 `docs/sprint-3.md` 和 `docs/phased-roadmap.md` Phase 2）。具体待做（不依赖人工实测）：
   - 视频替代品页面（特别是 Runway 替代品）
   - doc-based 视频场景页
   - 视频工具的内链补全

---

## 另一台电脑接续指南

1. **拉最新代码**：
   ```bash
   cd D:/toolsbox  # 或对应路径
   git pull origin main
   ```

2. **验证 `.env.local` 存在并完整**：
   ```bash
   awk '{print "Line " NR ": " substr($0, 1, 20) "..."}' .env.local
   ```
   应该看到 DATABASE_URL / DEEPSEEK_API_KEY / BAIDU_TRANSLATE_APP_ID / BAIDU_TRANSLATE_APP_KEY 至少 4 个变量。

3. **验证 DB 连接**：
   ```bash
   npx tsx --env-file=.env.local scripts/check-candidates.ts
   ```
   应该输出"候选工具总数：0"（池子已清空）。

4. **如果数据状态不对** — 看 `tools` 总数：
   ```bash
   # 用 Neon SQL Editor 或临时脚本
   SELECT count(*) FROM tools;
   ```
   应是 **66**。如果不是，说明可能切了 DB 或又被清了，需要排查。

5. **本次会话遗留的几个临时脚本**（保留作为参考工具，不是反模式）：
   - `scripts/check-candidates.ts` — 候选池速查
   - `scripts/list-candidates.ts` — 候选列表
   - `scripts/list-categories.ts` — 分类列表
   - `scripts/export-tools.ts` — 工具数据导出
   - `scripts/bulk-approve-drafted.ts` — 一次性批量 approve（C 方案）

6. **临时 probe 脚本已清理**（`scripts/_probe-*.ts` 和 `scripts/_debug-*.ts`），不要找它们。

---

## 给 Claude / Codex 接手时的提醒

- 这次会话开头有过几个用户判断需要保持一致：
  1. **不要开源** — 联系方式用邮箱 `4514407@qq.com` + 微信公众号 `aiboxprocn`，**不要**重新加 GitHub Issue 链接
  2. **`current-position.md` 是当前定位的权威源** — 战略问题先看它，再看 `phased-roadmap.md`
  3. **战略蓝图 `aiboxpro_详细版...md` 是输入，不是执行清单**
  4. **暂不做需要人工参与的内容**（Lab 实测、人工审校、运营分发、厂商触达）

- 不要主动创建白皮书提到但 `current-position.md` / `phased-roadmap.md` 没要求的功能（比如登录、评论、会员、收藏系统）。
