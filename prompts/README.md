# Prompts 目录

本目录是 AIBoxPro 内容起草系统的一等资产。所有 LLM 起草脚本都从这里加载 prompt 文件 + few-shot examples。

修改这些文件等同于修改本站内容的"声音"。

## 目录结构

```
prompts/
├── README.md                          # 本文件
├── <type>/
│   ├── v<n>.md                        # 主 prompt（最新版本，旧版本保留可回退）
│   └── examples/                      # few-shot 样本（定义本站声音）
│       └── <slug>.md
└── audit/
    └── anti-cliche.v<n>.md            # 反套话审计 prompt
```

## 主 prompt 文件格式

YAML frontmatter + Markdown body：

```yaml
---
name: tool-verdict
version: v1
model_tier: standard          # standard 用 LLM_MODEL；premium 用 LLM_MODEL_PREMIUM
temperature: 0.6
max_tokens: 1500
require_few_shot: true
require_anti_cliche_audit: true
---

# 任务说明、输出 schema、声音规则、禁用词汇、占位符
```

`model_tier` 当前 standard / premium 都指向 DeepSeek（详见 `docs/dev-plan-2026-05.md` Q12）。

Body 内常用占位符：

- `<INPUT_JSON>` — 起草时拼入的客观字段
- `<FEW_SHOT_EXAMPLES>` — 拼入 `examples/*.md` 全部样本
- `<TARGET_TOOL>` — 起草目标工具的标识

## Few-shot 样本格式

```markdown
---
tool_id: cursor
written_by: human (claude-assisted, locked v1)
written_at: 2026-05-12
---

## 输入数据

\`\`\`json
{ ... 客观字段 ... }
\`\`\`

## 目标输出

\`\`\`json
{ ... 严格符合主 prompt 输出 schema 的目标 verdict ... }
\`\`\`
```

输出用 JSON code block 而不是 YAML list，方便起草脚本直接序列化拼入 prompt 上下文。

## 版本号约定

- `v1` / `v2` / `v3`：主版本，跨版本 prompt 显著重写
- 旧版本保留为只读，便于回滚和 A/B 比较
- `npm run eval:prompt <type>` 跑测试集，输出报告含每版本质量分布

## 起草流程

```
1. CLI: npm run draft:<type> <slug>
2. 加载 prompts/<type>/v<latest>.md + 全部 examples/*.md
3. 抓输入数据（官网 / DB / RSS）
4. 拼接 system prompt + examples + target → 调 LLM（按 model_tier）
5. LLM 输出 JSON → 跑 prompts/audit/anti-cliche.v1.md
6. 写入 *_drafts 表，记录 promptVersion + llmModel + antiClicheScore
7. 终端打印 /admin/<type>/<id>，等待人工审核 publish
```

## 修改样本时

样本一旦 locked，是该版本的语气基线。

修改样本 = 升 prompt 版本（写到 `v2.md`，旧 `v1.md` 保留）。

不要原地改 locked 样本——会让"为什么后面起草的草稿语气变了"无从追溯。

## 当前 locked 状态

- `tool-verdict/v1.md` — locked 2026-05-12
- `tool-verdict/examples/{cursor,kling,trae,runway,doubao}.md` — locked 2026-05-12
- 其它 prompt 类型（event-verdict / comparison-draft / scene-draft / ranking-draft / alternative-draft / tool-field-draft / article-draft）待 M2 / M1 第 2 周陆续建立
