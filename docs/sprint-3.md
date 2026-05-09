# Sprint 3 任务清单：AI 视频品类扩展（第 61 天起）

> **状态**：已定稿（2026-05-09）
> **P0 决策**：优先做 **AI 视频**，暂不把 AI 写作作为 Sprint 3 主线。
> **决策理由**：视频生成的国内外差异更明显，可灵 / 即梦 / 海螺与 Runway / Sora / Pika 的可用性、价格、成片风格和上手门槛差异更适合 AIBoxPro 的“国内用户决策平台”定位。

---

## 一、Sprint 2 收尾口径

Sprint 2 的工程和内容矩阵已足够进入 Sprint 3。以下事项不阻塞 Sprint 3：

- I7 首份 Lab 报告：仍需要真人实测，独立排期。
- I9-B 连通性基线：已按通用网络基线录入首批数据，后续定期补测。
- I13 小红书账号：运营前置，独立推进。
- 编程工具对比页：不继续作为当前主线打磨，除非 Search Console 数据显示明显机会。

---

## 二、Sprint 3 目标

用 21-25 天搭建 AI 视频品类的第一批决策内容：

- 10 篇 AI 视频对比 / 场景页全部 published。
- 至少 1 篇 AIBoxPro Lab 视频实测报告。
- 至少 1 个视频工具替代品专题上线。
- 视频类工具池补齐到能支撑 10 篇内容。
- 每篇内容保持 doc-based 标注；涉及画质、速度、稳定性的强判断必须有实测或明确写“待实测”。

---

## 三、工具池盘点

| 状态 | 工具 |
|---|---|
| ✅ 已入库 | Runway, Sora, Pika, Descript, 可灵, 海螺, 即梦, Luma Dream Machine, Vidu AI, Higgsfield AI, Pixelle-Video |
| ✅ 数字人方向已入库 | Hedra |
| ⚠️ 需核对 | Kling / 可灵 Pro 版本口径、Runway Gen-4 / Gen-4.5 当前入口、Sora 当前可用入口 |

补录要求：

- 必须填写 `chinaAccess`、`chineseUi`、`priceCny`、`registerMethod`、`needsOverseasPhone`、`overseasPaymentOnly`。
- 国内工具优先补 `publicAccount`、`miniProgram`、`appStoreCn`。
- 海外工具必须明确“国内访问 / 支付 / 注册”限制，不写成泛泛的“国际工具”。

---

## 四、第一批 10 篇内容

| # | slug | 标题 | 主推 SEO 词 | 类型 |
|---|---|---|---|---|
| 1 | `kling-vs-runway` | 可灵 vs Runway：国内外视频生成怎么选 | 可灵和 Runway 哪个好 | Lab 候选 |
| 2 | `jimeng-vs-kling` | 即梦 vs 可灵：国产 AI 视频横评 | 即梦和可灵区别 | doc-based |
| 3 | `sora-vs-kling` | Sora vs 可灵：长视频与国内可用性对比 | Sora 替代品 / 可灵 Sora | doc-based |
| 4 | `hailuo-vs-pika` | 海螺 vs Pika：短视频生成怎么选 | 海螺 AI 视频 / Pika 替代品 | doc-based |
| 5 | `runway-vs-sora-cinematic` | Runway vs Sora：电影级镜头生成对比 | Runway 和 Sora | doc-based |
| 6 | `ai-video-cn-alternatives` | 国产 AI 视频工具替代方案 | AI 视频生成国内 / Runway 替代品 | 替代品专题 |
| 7 | `ai-video-text-to-video` | 文生视频工具大横评 | 文生视频 AI 工具 | 场景页 |
| 8 | `ai-image-to-video` | 图生视频工具横评 | 图生视频 AI 工具 | 场景页 |
| 9 | `ai-short-video-edit` | AI 短视频自动剪辑工具对比 | AI 短视频剪辑 | 场景页 |
| 10 | `ai-digital-human-tools` | AI 数字人工具横评 | AI 数字人 / AI 主播 | 场景页 |

---

## 五、K 系列任务

### K1：补齐 AI 视频工具池

**状态（2026-05-09）**：✅ 已完成。新增 `scripts/seed-video-tools.ts` 和 `npm run seed:video-tools`，已补录 / 标准化 12 个视频相关工具；`/tools?cat=video` 当前 11 个工具，必填国内用户字段缺口为 0。

**详情页补强（2026-05-09）**：✅ 已完成。新增 `scripts/enhance-video-tool-details.ts` 和 `npm run enhance:video-details`，已为 12 个视频相关工具补齐详情页内容：每个工具 4 步使用流程、3 条 FAQ、定价 / 权益说明。覆盖 `jimeng-ai`、`kling-ai`、`hailuo-ai`、`runway`、`sora`、`pika`、`luma-dream-machine`、`vidu-ai`、`higgsfield-ai`、`hedra`、`descript`、`pixelle-video`。

补录 Luma AI、Vidu AI、Higgsfield、Hedra，并核对 Runway / Sora / 可灵版本口径。

验证：

- `/tools?cat=video` 至少 8 个可用工具。
- 每个视频工具有国内访问、价格、注册、支付说明。
- 12 个视频相关工具详情页均有 `howToUse`、`faqs`、`pricingDetail`。
- `npm run build` 通过。

### K2：视频对比页起草脚手架

**状态（2026-05-09）**：✅ 已完成。新增 `scripts/seed-video-comparisons.ts` 和 `npm run seed:video-comparisons`，内置视频 doc-based 约束：不凭空写画质 / 速度 / 稳定性排名，明确后续 Lab 才做实测结论。

复用 `draft:comparison`，但为视频品类增加内容约束：

- 不凭空写画质、速度、稳定性结论。
- doc-based 页面只写官方能力、入口、价格、国内可用性、适合场景。
- Lab 页面必须有实测样本、提示词、生成设置、截图或产出链接。

验证：

- 能生成 `kling-vs-runway` / `jimeng-vs-kling` 的草稿 prompt。
- 草稿中明确区分 doc-based 与 Lab。

### K3：发布首批 4 篇 doc-based 视频对比页

**状态（2026-05-09）**：✅ 已完成。已发布 `jimeng-vs-kling`、`sora-vs-kling`、`hailuo-vs-pika`、`runway-vs-sora-cinematic`；4 篇均 `reviewed_by='admin'`，正文 5000+ 字符，自动审计风险为 0。

优先顺序：

1. `jimeng-vs-kling`
2. `sora-vs-kling`
3. `hailuo-vs-pika`
4. `runway-vs-sora-cinematic`

验证：

- 4 篇 `status='published'`。
- 每篇正文 4500-6000 字符。
- 每篇至少 5 个官方来源链接。
- `reviewed_by='admin'`。
- `npm run audit:comparisons` 无新增高风险项。

### K4：首篇视频 Lab 报告

推荐选题：`kling-vs-runway`。

最低实测要求：

- 3 个固定 prompt：人物动作、产品展示、镜头运动。
- 每个工具每个 prompt 至少生成 2 次。
- 记录测试日期、网络环境、账号套餐、模型版本、生成设置、失败次数、等待时间、人工筛选规则。
- 保留截图或产出链接；如不能公开原视频，至少保留内部路径和缩略图。

验证：

- `is_lab_report=true`。
- Methodology Box 所有字段有真实值。
- 不出现“待补充”。

### K5：视频替代品专题

新增 `/alternatives/runway` 或扩展现有 Runway 替代方案，重点覆盖：

- 可灵
- 海螺
- 即梦
- Pika
- Luma / Vidu（补录后）

验证：

- `/alternatives/runway` 页面可访问。
- 页面有视频工具卡片和相关对比页反向链接。
- sitemap 收录。

---

## 六、执行顺序

1. K1：补工具池。
2. K2：补视频起草约束。
3. K3：先上线 4 篇 doc-based，建立收录入口。
4. K5：补 Runway 替代品专题。
5. K4：做 Lab 报告，作为信任资产。

K4 不阻塞 K3。视频 Lab 成本高，先用 doc-based 页面抢收录，再用 Lab 报告补可信度。

---

## 七、不做事项

- 不做泛泛的“十大 AI 视频工具推荐”水文。
- 不写无实测支撑的画质排名。
- 不做用户登录、评论、众包评分。
- 不扩展过多视频子分类，先用现有 `video` 大类。
- 不把 AI 写作作为 Sprint 3 主线，除非 Search Console 数据强烈指向写作类。
