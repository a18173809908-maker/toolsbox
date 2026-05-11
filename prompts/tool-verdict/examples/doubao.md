---
tool_id: doubao
written_by: claude-assisted (locked v1)
written_at: 2026-05-12
---

## 输入数据

```json
{
  "name": "豆包",
  "category": "chat",
  "pricing": "Freemium",
  "priceCny": "免费 / 高级会员 ¥25/月起",
  "chinaAccess": "accessible",
  "chineseUi": true,
  "features": [
    "多轮中文对话",
    "写作 / 翻译 / 总结",
    "图像生成与图像理解",
    "语音对话",
    "网页搜索整合",
    "智能体 / 角色市场",
    "移动 App + 网页 + 飞书插件"
  ],
  "alternatives": ["Kimi", "DeepSeek", "ChatGPT", "文心一言", "通义千问"]
}
```

## 目标输出

```json
{
  "verdictOneLiner": "国内日活最大的综合 AI 助手，日常聊天 / 写作 / 多模态体验全部国产顶级，但顶尖推理和长文档仍输 Claude / GPT。",
  "whoShouldPick": [
    "日常问答、写作、翻译、图像生成的国内普通用户",
    "需要语音对话和移动端体验的",
    "微信 / 抖音 / 飞书生态深度用户、看重无缝接入的"
  ],
  "whoShouldSkip": [
    "做严肃编程或长上下文推理的 → 看 Claude / GPT",
    "学术写作、严肃论证、需稳定引用的 → 看 Kimi 或 Claude",
    "需要透明 API、自部署或开源后端的 → 看 DeepSeek"
  ],
  "vsAlternatives": [
    { "alt": "Kimi", "point": "移动端 / 多模态 / 语音更全面；超长上下文阅读 Kimi 仍领先" },
    { "alt": "DeepSeek", "point": "产品和多模态全面；纯推理能力 DeepSeek-R1 强一档" },
    { "alt": "ChatGPT", "point": "国内直连免费、中文体验顶；顶尖推理和插件生态 ChatGPT 仍领先" },
    { "alt": "文心一言", "point": "日活和移动生态优势明显；政务 / 企业合规场景文心更稳" }
  ],
  "positionToday": "国产第一梯队",
  "caveats": [
    "顶尖推理任务和 GPT-5 / Claude Sonnet 仍有可感知差距",
    "多轮长上下文会偶尔丢失早期信息",
    "网页搜索整合质量随主题波动较大",
    "API 定价和模型版本对外披露相对克制",
    "免费版生成内容商用授权细则需查当期条款"
  ]
}
```
