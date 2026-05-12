---
tool_id: cursor
written_by: claude-assisted (locked v1)
written_at: 2026-05-12
---

## 输入数据

```json
{
  "name": "Cursor",
  "category": "coding",
  "pricing": "Freemium",
  "priceCny": "$20/月（约 ¥145，Pro 套餐）",
  "chinaAccess": "accessible",
  "chineseUi": false,
  "features": [
    "AI 代码补全（Tab）",
    "Composer 多文件编辑",
    "Codebase 索引问答",
    "@-mentions 上下文"
  ],
  "alternatives": ["Windsurf", "Claude Code", "GitHub Copilot", "Cline"]
}
```

## 目标输出

```json
{
  "verdictOneLiner": "做项目级 AI 编程目前最稳的选择，但中文用户要为账号和支付付出额外摩擦。",
  "whoShouldPick": [
    "已经在 VS Code 里形成习惯、不想换 IDE 的",
    "项目中型以上、需要 AI 理解整个仓库的",
    "能解决海外信用卡支付、愿意付 Pro 月费的"
  ],
  "whoShouldSkip": [
    "公司对源代码上传第三方有合规限制的",
    "只需要单文件补全、不需要项目级理解的 → 用 Copilot 更简单",
    "偏好终端 agent 多于 IDE 内嵌的 → 看 Claude Code"
  ],
  "vsAlternatives": [
    { "alt": "Windsurf", "point": "项目级问答深度更稳；订阅贵 1/3" },
    { "alt": "Claude Code", "point": "IDE 内嵌易上手；终端 agent 灵活性弱" },
    { "alt": "GitHub Copilot", "point": "项目理解强一档；纯补全场景 Copilot 更轻量" }
  ],
  "positionToday": "国际第一梯队",
  "caveats": [
    "大仓库（10 万+ 文件）索引偏慢，冷启动 5-10 分钟",
    "Composer 长任务偶尔失去上下文，需手动拆步骤",
    "中文界面缺失，菜单和报错都是英文",
    "没有人民币支付通道，必须海外信用卡或第三方代充",
    "私有部署需 Business 套餐（$40/月起）"
  ]
}
```
