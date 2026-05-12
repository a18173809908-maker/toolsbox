---
tool_id: trae
written_by: claude-assisted (locked v1)
written_at: 2026-05-12
---

## 输入数据

```json
{
  "name": "Trae",
  "category": "coding",
  "pricing": "Free",
  "priceCny": "免费",
  "chinaAccess": "accessible",
  "chineseUi": true,
  "features": [
    "AI 代码补全",
    "Builder 多文件编辑",
    "@-mentions 上下文",
    "中文界面与中文文档"
  ],
  "alternatives": ["Cursor", "Windsurf", "Claude Code", "GitHub Copilot"]
}
```

## 目标输出

```json
{
  "verdictOneLiner": "想用 AI IDE 但不想付费、英文 IDE 用着别扭的国内开发者，可以先用 Trae 顶上 Cursor 的 80%。",
  "whoShouldPick": [
    "学生、个人开发者、不能批量付海外 SaaS 的",
    "中文界面和文档对工作流影响大的",
    "主要写中小项目、复杂度上限不高的"
  ],
  "whoShouldSkip": [
    "已经在 Cursor / Windsurf 重度工作流里、模型能力是瓶颈的 → 留在原工具",
    "需要最强 Claude / GPT 后端做项目级 Agent 任务的 → 看 Cursor + Claude",
    "公司禁用中国大陆 SaaS 的"
  ],
  "vsAlternatives": [
    { "alt": "Cursor", "point": "完全免费 + 中文原生；底层模型能力差一档，复杂多文件稳定性弱" },
    { "alt": "Windsurf", "point": "免费这点压倒；Builder agent 能力仍在追赶" },
    { "alt": "Claude Code", "point": "IDE 内嵌上手低；Sonnet 后端是质变差距" },
    { "alt": "GitHub Copilot", "point": "免费 + 中文 + 多文件能力；纯补全 Copilot 仍更稳" }
  ],
  "positionToday": "国产第一梯队",
  "caveats": [
    "模型能力上限明显低于 Cursor + Claude 组合",
    "长上下文项目偶发上下文丢失",
    "部分能力仅在国内版（cn 区域）开放，海外版功能不同步",
    "免费产品后续政策可能变，重要商业项目需确认当期条款",
    "插件生态比 VS Code 原生薄一些"
  ]
}
```
