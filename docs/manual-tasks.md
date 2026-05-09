# 人工执行任务清单

> 这份文档记录**工程链路已就绪、但需要真人完成**的内容/运营任务。CODEX 不能代做。
>
> 工程任务（写代码、改 schema、跑 db:push 等）不在这里。
>
> 当前决策（2026-05-09）：**所有需要人工参与的任务暂不执行**。本文档只作为未来人工工作池，不作为近期路线图。

---

## Sprint 1 待人工执行

### ✅ M1：跑 `npm run cleanup:articles` 首次清理资讯库 — 已完成（2026-05-07）

**首次执行结果**：`隐藏 15 条（乱码 15 / 语言错误 0 / 过期 0）`

执行过程中发现两个原脚本的隐藏 bug，已一并修复（commit 643893c + 25a04e2）：

1. **乱码识别规则不够全面**：原规则只识别"3+ 个连续 ? 或 <"，但 DB 实际乱码是 U+FFFD（Unicode 替换字符 �，UTF-8 解码失败标记）。已扩展规则覆盖 U+FFFD / 锟斤拷 / mojibake 三类
2. **`hideByIds` 用 `ANY()` 写法错误**：之前未触发，规则扩展后立即报错。改用 Drizzle 标准 `inArray()`

后续若发现更多乱码模式，可直接更新 `scripts/cleanup-articles.ts` 的 `mojibakePatterns` 段，重新运行命令即可。

**脚本可作为日常运维定期执行**（每 1-2 周一次），自动 hide 任何新增的乱码或过期条目。

---

## Sprint 1 配置（待人工）

### M11：配置 Admin 后台密码与邮件服务

依赖 sprint-1 I8 + I9 工程上线。

| 维度 | 内容 |
|---|---|
| 依赖工程 | 🟡 待 sprint-1 I8 + I9 |
| 工作量 | 30-60 分钟（含 Resend 注册和域名验证） |
| 步骤 | 1. 生成强密码（建议 1Password 等密码管理器）<br>2. Vercel 项目 Settings → Environment Variables 加 `ADMIN_PASSWORD`<br>3. 注册 Resend（[resend.com](https://resend.com)）→ 验证域名 `aiboxpro.cn`（DNS 加 SPF/DKIM）→ 获取 API Key<br>4. Vercel env 加 `RESEND_API_KEY`、`ADMIN_NOTIFY_EMAIL`（接收提醒的邮箱）<br>5. 触发 redeploy<br>6. 测试：访问 `/admin/login` 用密码登录，手动调用 `/api/cron/notify-review` 验证收件 |
| 输出 | Vercel 已配置三个 env 变量；Resend 域名状态 verified；测试邮件已收到 |
| 验证 | `/admin` 必须密码访问；09:00 cron 触发能收到邮件（前提：DB 中有待审核内容） |

---

## Sprint 2 待人工执行

### M2：编辑产出 10 篇对比页内容

对应 sprint-2 I6 内容侧。

| 维度 | 内容 |
|---|---|
| 依赖工程 | ✅ `draft:comparison` 脚本（2a47561）+ `comparisons` 表（3440f47）<br>🟡 sprint-1 I8 Admin 后台（替代之前提到的 publish:comparison 脚本） |
| 工作量 | 8-15 小时（10 篇 × 60-90 分钟人工修订） |
| 输入 | sprint-2 I6 任务清单的 10 个 slug 和目标对比词 |
| 流程 | 1. `npm run draft:comparison -- <a> <b>` 生成草稿<br>2. 人工核对工具版本号、定价数字（与 tools 表对齐）<br>3. 删 AI 套话，加编辑判断<br>4. 填 Methodology Box（至少 testedAt / testedBy / testedEnv 三项必填）<br>5. 用 SQL 插入 `comparisons` 表 status='draft'（或后续提供专用入库 CLI）<br>6. **进 `/admin/comparisons/[id]` 审核详情页 → 通过 → 自动置为 published** |
| 验证 | `/compare/[slug]` 全部可访问；`/compare` 列表页 ≥ 10 条 |

### M3：完成首份 AIBoxPro Lab 实测报告

对应 sprint-2 I7 内容侧。

| 维度 | 内容 |
|---|---|
| 依赖工程 | ✅ Lab schema、徽章、Methodology Box 扩展、反向引用（1519082） |
| 工作量 | 5-10 小时（含真实测试） |
| 选题 | `Claude Code vs Cursor`（白皮书 §3.3 + sprint-2 I7 指定） |
| 流程 | 1. 选评测集（白皮书示例：Codeforces Div.2 A-C 题，随机 30 题）<br>2. 在一个真实、可说明的网络环境下跑测（记录直连 / 代理即可）<br>3. 记录响应延迟、推理准确率、稳定性<br>4. （可选）整理测试脚本到独立 GitHub repo，填 `repo_url` 字段，置 `reproducible=true`<br>5. 写报告，**所有 Methodology Box 字段必须有真实值，不允许"待补充"** |
| 阻塞 | 测试者需要：<br>- 至少有一个能稳定连 Claude Code / Cursor 的网络环境<br>- 有一个具体的测试用例集（Codeforces 账号或本地题集）<br>- 时间专门做一次完整测试 |
| 验证 | `/compare/lab-claude-code-vs-cursor-202501`（或类似 slug）页面渲染，标题旁有「AIBoxPro Lab」紫色徽章；Methodology Box 全部字段非空 |

### M4：填充连通性地图初始数据（10 个核心工具）

对应 sprint-2 I9。I9-A 工程链路已完成：`tool_connectivity` 表、工具详情页展示、`scripts/seed-connectivity.ts` 导入脚本均已就绪。M4 只覆盖真人实测与数据录入。

| 维度 | 内容 |
|---|---|
| 依赖工程 | ✅ I9-A 工程链路已完成（ede3dd7） |
| 工作量 | 30-60 分钟（10 条数据手工录入） |
| 范围 | 10 个核心工具，每个工具录入 1 条真实网络环境实测；不再按运营商拆分 |
| 工具清单 | claude / cursor / chatgpt / doubao / kimi / deepseek / wenxin / tongyi / trae / github-copilot |
| 填写模板 | `docs/connectivity-measurement-template.md` |
| 输出 | `tool_connectivity` 表写入 10 条基线数据，`carrier='general'`，`source='editor'`，`reportedAt` 为实测日期 |
| 验证 | `/tools/[slug]` 页面有连通性表格 |

### M5：注册并完善小红书账号 `AIBoxPro`

对应 sprint-2 I13。

| 维度 | 内容 |
|---|---|
| 依赖工程 | 无 |
| 工作量 | 30-60 分钟（含手机号实名认证等待） |
| 流程 | 1. 小红书 App 手机号注册<br>2. 昵称：`AIBoxPro`（与公众号统一）<br>3. 简介：从白皮书 §2 价值主张提炼<br>4. 头像：与公众号统一<br>5. （可选）实名认证（认证后流量倾斜更好）<br>6. 把账号登录信息归档到 `docs/community-distribution-sop.md`（M6 中产出） |
| 验证 | 小红书可搜到账号 `AIBoxPro` |

### M6：填充社区分发 SOP 的渠道账号清单

对应 sprint-2 I11。

| 维度 | 内容 |
|---|---|
| 依赖工程 | ✅ I11 文档框架已完成 |
| 工作量 | 1-2 小时（注册 + 整理） |
| 6 个目标渠道 | 知乎 / V2EX / 即刻 / 稀土掘金 / SegmentFault / GitHub |
| 输出 | `docs/community-distribution-sop.md` 中渠道账号清单填完整：每个渠道的账号名、注册状态、负责人、登录信息归档位置 |
| 验证 | 文档每行有可执行的状态（已有 / 待注册 / 已启用） |

### M7：填充工具方互推外联清单

对应 sprint-2 I12。

| 维度 | 内容 |
|---|---|
| 依赖工程 | ✅ I12 文档框架已完成 |
| 工作量 | 1-2 小时（搜联系方式 + 整理） |
| 目标 | 至少 10 家国产 AI 工具方的可执行联系方式 |
| 工具方分级 | 国产新锐：豆包 / Kimi / DeepSeek / Trae / 即梦 / 可灵 / 海螺<br>国产成熟：文心 / 通义 / 讯飞星火 |
| 输出 | `docs/vendor-outreach-sop.md` 目标工具方清单段落 |
| 验证 | 每家工具方有可触达的联系方式（运营邮箱 / 商务公众号 / 创始人推特或知乎账号等） |

---

## Sprint 2 第 7-8 周持续运营任务

> 以下是上线后的常态运营，每篇新对比页都要走一遍流程。不是"做完一次就结束"。

### M8：每篇对比页发布后的社区分发

对应白皮书 §6.4.1 + sprint-2 I11。

| 维度 | 内容 |
|---|---|
| 依赖 | M2 至少有 1 篇对比页上线、M6 SOP 完成 |
| 节奏 | 每篇对比页发布当周内分发到至少 2 个开发者社区 |
| 渠道 checklist | 每篇必走：<br>☐ 知乎找 1-2 个目标问题答题（正文 ≤ 30%，文末附链接）<br>☐ V2EX 或即刻发短帖（1 句结论 + 截图 + 链接）<br>☐ 稀土掘金 或 SegmentFault 长文同步<br>☐ GitHub awesome-list / Discussion 提交（机会性） |
| 反模式 | ❌ 不要在所有平台粘贴同一篇文章原文<br>❌ 不要私信用户拉访<br>❌ 不要小号矩阵互相点赞 |
| 60 天目标 | 累计社区分发 ≥ 20 次（白皮书 §6.4.3） |

### M9：工具方互推外联

对应白皮书 §6.4.2 + sprint-2 I12。

| 维度 | 内容 |
|---|---|
| 依赖 | M7 联系清单完成 + 至少 1 篇对比页/替代品专题已上线 |
| 流程 | 1. 写完一篇专题 → 提取 TL;DR（3 句结论 + 1 张图）<br>2. 联系被推荐方运营 / 创始人社交账号<br>3. 提供完整链接 + 转发素材 + 不强求语<br>4. 跟进表记录回复 / 转发情况 |
| 60 天目标 | 累计成功合作 ≥ 5 次 |

### M10：私域内容分发（公众号 + 小红书 + 知乎）

对应白皮书 §6.4.5 + sprint-2 I10。I10 工程已完成：`npm run draft:social -- <comparison-slug>` 可从已发布对比页生成三平台草稿包。

| 维度 | 内容 |
|---|---|
| 依赖 | ✅ sprint-2 I10 工程完成 + M5 小红书账号就位 + M2 至少 3 篇对比页上线 |
| 流程 | 1. 跑 `npm run draft:social -- <slug>` 生成三平台草稿<br>2. 编辑审核每个平台的文案 + 配图<br>3. 公众号：人工发布<br>4. 小红书：人工发布<br>5. 知乎：作为 M8 知乎答题的素材 |
| 60 天目标 | 公众号 ≥ 3 篇 / 关注 ≥ 50<br>小红书 ≥ 5 篇 / 粉丝 ≥ 30<br>知乎 ≥ 10 条（含 M8 已发布的） |

---

## 阻塞依赖图

```
M1  (清理资讯)   → ✅ 已完成（2026-05-07，隐藏 15 条乱码）
M5  (小红书账号) → 独立可执行
M11 (Admin 配置) → 依赖 sprint-1 I8/I9 工程
M6 / M7         → 依赖 CODEX 写 I11/I12 文档框架
M2  (10 对比页)  → 依赖工具数据完整性 + M11（Admin 用于审核入库）
M3  (Lab 报告)   → 依赖测试者真实操作时间 + M11
M4  (连通性)     → ✅ I9-A 工程已完成；依赖真人实测数据
M8              → 依赖 M2 上线 + M6 完成
M9              → 依赖 M7 完成
M10             → ✅ I10 工程已完成；依赖 M5 + M2
```

最容易先做的入口：**M1（已完成）→ M5（30 分钟）→ M4（30-60 分钟实测录入）→ M6/M7（补真实账号/联系人）**。

M2 / M3 内容生产任务在 M11 配置完成前都没有正式入库通道，建议先把 M11 跑通再批量生产内容。
