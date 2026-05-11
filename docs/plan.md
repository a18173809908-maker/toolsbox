# AIBoxPro 执行计划

最后更新：2026-05-11

---

## 当前状态

- tools：66 个，候选池已空
- Sprint 3：K1/K2/K3 已完成（工具池 + 10 篇视频对比页），K5 和场景页未做
- 榜单页 `/best/`：路由未建
- 场景页 `/scenes/`：路由未建
- 内链：视频品类各页面之间未打通

---

## 待用户决定（未决定不动）

- **收藏/点赞按钮**：无登录系统，建议删除。是否删除？

---

## 执行块（串行，每块完成验收后再开下一块）

---

### Block A：文案修正

**任务**：`app/news/[id]/page.tsx` 中「💡 我们的观点」改为「AI 解读」，移除 emoji。

**验收**：
- `grep -r "我们的观点"` 返回 0
- `/news/任意文章` 页面显示"AI 解读"
- `npm run build` 通过

---

### Block B：Sprint 3 收尾（视频品类闭环）

#### B1 — Runway 替代品专题

补全 `/alternatives/runway` 页面，面向国内用户。

**验收**：
- `/alternatives/runway` 返回 200
- 收录可灵、即梦、海螺、Pika、Luma ≥5 个工具
- 每个工具有：国内访问 / 注册 / 支付 / 价格说明
- 有对比页反链 ≥3 条（如 `kling-vs-runway`、`hailuo-vs-pika`）
- sitemap 包含该 URL
- `npm run build` 通过

#### B2 — 4 篇 doc-based 视频场景页

新建 `/scenes/` 路由，发布以下 4 篇：

| slug | 标题 |
|---|---|
| `text-to-video` | 用 AI 文生视频：工具选择与操作流程 |
| `image-to-video` | 用 AI 图生视频：工具选择与操作步骤 |
| `short-video-editing` | AI 短视频剪辑工具：国内可用选项横评 |
| `digital-human-video` | AI 数字人视频工具：制作流程与推荐 |

每篇结构：适合谁 → 推荐工具组合（3-5 个，含国内可用性）→ 操作步骤大纲 → FAQ 3 条 → 相关对比页内链。不写无实测支撑的画质/速度排名。

**验收**：
- `/scenes` 列表页可访问
- 4 个详情页各自返回 200
- 每篇：关联工具 ≥3、FAQ ≥3 条、对比页内链 ≥2 条
- sitemap 包含 4 个场景页
- `npm run build` 通过

#### B3 — 视频品类内链打通

视频工具详情页、对比页、替代品页、场景页之间双向链接。

**验收**：
- 任意 3 个视频工具详情页底部：对比页链接 ≥2 + 场景页链接 ≥1
- 任意 2 篇对比页底部：场景页链接 ≥1
- 4 篇场景页：工具详情页链接存在
- 以上所有链接无 404

**Block B 整体验收**：工具详情 → 对比 → 替代品 → 场景页，四类页面可以互相到达，无孤岛。

---

### Block C：扩充工具库

**前置**：Block B 完成后执行。

**目标**：tools ≥150。

**步骤**：
1. `npm run fetch:aibot-sitemap -- 200`
2. `npm run process:tool-candidates`（多轮直到候选池空）
3. `npm run bulk-approve-drafted`

**验收**：
- `SELECT count(*) FROM tools` ≥ 150
- 视频类 ≥12（保持），写作/办公/设计/编程各 ≥10
- 无重复 slug
- `npm run build` 通过

---

### Block D：榜单页

**前置**：Block C 完成（工具够多才有可信榜单）。

#### D1 — 路由与模板

新建 `/best/[slug]` 路由，支持从数据库或静态数据渲染榜单。

#### D2 — 首批 3 个榜单

由现有工具数据生成，不需要实测：

| slug | 标题 |
|---|---|
| `free-ai-video-tools` | 免费 AI 视频工具推荐（国内可用） |
| `ai-writing-tools` | AI 写作工具推荐：中文用户怎么选 |
| `ai-coding-tools` | AI 编程工具推荐：Cursor 替代品横评 |

每个榜单结构：适合谁 → 选择标准 → 工具排名（含推荐理由、优缺点、价格）→ 最终建议 → FAQ。

**验收**：
- `/best` 列表页可访问
- 3 个榜单详情页各自返回 200
- 每个榜单收录工具 ≥5，每个工具有推荐理由
- sitemap 包含榜单 URL
- `npm run build` 通过

---

## 不做（本计划范围内）

- GitHub Trending 页
- 登录 / 收藏 / 评论 / 会员
- 人工实测 Lab 报告
- AI 副业相关内容
- 同时扩展多个新品类

---

## 执行顺序

```
A → B1 → B2 → B3 → C → D
```

A 不阻塞 B，可以并行。C 完成后才能做 D。
