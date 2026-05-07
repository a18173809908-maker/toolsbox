# 人工执行任务清单

> 这份文档记录**工程链路已就绪、但需要真人完成**的内容/运营任务。CODEX 不能代做。
>
> 工程任务（写代码、改 schema、跑 db:push 等）不在这里。

---

## Sprint 1 待人工执行

### M1：跑 `npm run cleanup:articles` 首次清理资讯库

| 维度 | 内容 |
|---|---|
| 依赖工程 | ✅ 脚本已上线（commit 67c876d，sprint-1 I2） |
| 工作量 | 5 分钟 |
| 操作 | `cd D:/toolsbox && npm run cleanup:articles` |
| 输出 | 控制台输出 `隐藏 X 条（乱码 Y / 语言错误 Z / 过期 W）` |
| 验证 | 访问 `/news`，无乱码标题，无纯英文条目 |
| 风险 | 软删除 (`status='hidden'`)，可恢复，无数据风险 |

---

## Sprint 2 待人工执行

### M2：编辑产出 10 篇对比页内容

对应 sprint-2 I6 内容侧。

| 维度 | 内容 |
|---|---|
| 依赖工程 | ✅ `draft:comparison` 脚本（2a47561）+ `comparisons` 表（3440f47） |
| 工作量 | 8-15 小时（10 篇 × 60-90 分钟人工修订） |
| 输入 | sprint-2 I6 任务清单的 10 个 slug 和目标对比词 |
| 流程 | 1. `npm run draft:comparison -- <a> <b>` 生成草稿<br>2. 人工核对工具版本号、定价数字（与 tools 表对齐）<br>3. 删 AI 套话，加编辑判断<br>4. 填 Methodology Box（至少 testedAt / testedBy / testedEnv 三项必填）<br>5. 写入 `comparisons` 表 status='published' |
| 阻塞 | **缺一个 `publish:comparison` 入库脚本**——目前要么手工 SQL `INSERT`，要么后续补脚本 |
| 验证 | `/compare/[slug]` 全部可访问；`/compare` 列表页 ≥ 10 条 |

### M3：完成首份 AIBoxPro Lab 实测报告

对应 sprint-2 I7 内容侧。

| 维度 | 内容 |
|---|---|
| 依赖工程 | ✅ Lab schema、徽章、Methodology Box 扩展、反向引用（1519082） |
| 工作量 | 5-10 小时（含真实测试） |
| 选题 | `Claude Code vs Cursor`（白皮书 §3.3 + sprint-2 I7 指定） |
| 流程 | 1. 选评测集（白皮书示例：Codeforces Div.2 A-C 题，随机 30 题）<br>2. 在三种网络环境下分别跑测（电信 / 联通 / 移动 或 直连 / 代理）<br>3. 记录响应延迟、推理准确率、稳定性<br>4. （可选）整理测试脚本到独立 GitHub repo，填 `repo_url` 字段，置 `reproducible=true`<br>5. 写报告，**所有 Methodology Box 字段必须有真实值，不允许"待补充"** |
| 阻塞 | 测试者需要：<br>- 至少有一个能稳定连 Claude Code / Cursor 的网络环境<br>- 有一个具体的测试用例集（Codeforces 账号或本地题集）<br>- 时间专门做一次完整测试 |
| 验证 | `/compare/lab-claude-code-vs-cursor-202501`（或类似 slug）页面渲染，标题旁有「AIBoxPro Lab」紫色徽章；Methodology Box 全部字段非空 |

### M4：填充连通性地图初始数据（10 工具 × 3 运营商）

对应 sprint-2 I9。注意：此项**工程链路也尚未完成**（schema 待加、scripts/seed-connectivity.ts 待写），M4 是工程做完后才能开始的人工部分。

| 维度 | 内容 |
|---|---|
| 依赖工程 | ❌ 待做（sprint-2 I9 工程任务） |
| 工作量 | 30-60 分钟（30 条数据手工录入） |
| 范围 | 10 个核心工具 × 电信 / 联通 / 移动 = 30 条记录 |
| 工具清单 | claude / cursor / chatgpt / doubao / kimi / deepseek / wenxin / tongyi / trae / github-copilot |
| 输出 | `tool_connectivity` 表写入 30 条数据，`source='editor'`，`reportedAt` 为实测日期 |
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
| 依赖工程 | ✅ I11 文档框架（待 CODEX 写） |
| 工作量 | 1-2 小时（注册 + 整理） |
| 6 个目标渠道 | 知乎 / V2EX / 即刻 / 稀土掘金 / SegmentFault / GitHub |
| 输出 | `docs/community-distribution-sop.md` 中渠道账号清单填完整：每个渠道的账号名、注册状态、负责人、登录信息归档位置 |
| 验证 | 文档每行有可执行的状态（已有 / 待注册 / 已启用） |

### M7：填充工具方互推外联清单

对应 sprint-2 I12。

| 维度 | 内容 |
|---|---|
| 依赖工程 | ✅ I12 文档框架（待 CODEX 写） |
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

对应白皮书 §6.4.5 + sprint-2 I10。注意：依赖 sprint-2 I10 自动生成系统（工程任务，待做）。

| 维度 | 内容 |
|---|---|
| 依赖 | sprint-2 I10 工程完成 + M5 小红书账号就位 + M2 至少 3 篇对比页上线 |
| 流程 | 1. 跑 `npm run draft:social -- <slug>` 生成三平台草稿<br>2. 编辑审核每个平台的文案 + 配图<br>3. 公众号：人工发布<br>4. 小红书：人工发布<br>5. 知乎：作为 M8 知乎答题的素材 |
| 60 天目标 | 公众号 ≥ 3 篇 / 关注 ≥ 50<br>小红书 ≥ 5 篇 / 粉丝 ≥ 30<br>知乎 ≥ 10 条（含 M8 已发布的） |

---

## 阻塞依赖图

```
M1 (清理资讯) → 独立可执行
M5 (小红书账号) → 独立可执行
M6 / M7 → 依赖 CODEX 写 I11/I12 文档框架
M2 (10 对比页) → 依赖工具数据完整性 + 缺 publish:comparison 脚本
M3 (Lab 报告) → 依赖测试者真实操作时间
M4 (连通性) → 依赖 sprint-2 I9 工程
M8 → 依赖 M2 上线 + M6 完成
M9 → 依赖 M7 完成
M10 → 依赖 sprint-2 I10 工程 + M5 + M2
```

最容易先做的入口：**M1（5 分钟）→ M5（30 分钟）→ M6/M7（等 CODEX 出框架）**。
