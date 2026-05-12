---
tool_id: runway
written_by: claude-assisted (locked v1)
written_at: 2026-05-12
---

## 输入数据

```json
{
  "name": "Runway",
  "category": "video",
  "pricing": "Freemium",
  "priceCny": "Free / Standard $15/月 / Pro $35/月 / Unlimited $95/月",
  "chinaAccess": "partial",
  "chineseUi": false,
  "features": [
    "Gen-3 / Gen-4 文生视频与图生视频",
    "镜头运动控制（pan / zoom / orbit）",
    "Motion Brush 局部运动",
    "Lip Sync / Act-One 表情驱动",
    "完整专业级视频编辑套件"
  ],
  "alternatives": ["可灵", "Sora", "Pika", "Luma Dream Machine", "即梦"]
}
```

## 目标输出

```json
{
  "verdictOneLiner": "国际 AI 视频里综合能力仍领先，但中文用户每一步都要绕：访问、注册、支付、提示词。",
  "whoShouldPick": [
    "已经能熟练访问海外网络、有海外信用卡的",
    "做电影级镜头运动、专业制作、复杂运镜的",
    "已经在好莱坞 / 国际广告体系工作流里的"
  ],
  "whoShouldSkip": [
    "中文短视频电商创作者 → 用可灵或即梦更顺",
    "只想临时试试 AI 视频效果 → 国产工具门槛低 10 倍",
    "公司对海外 SaaS 数据上传有合规顾虑的"
  ],
  "vsAlternatives": [
    { "alt": "可灵", "point": "镜头运动和长视频更稳、商业生态成熟；中文与价格全面落后" },
    { "alt": "Sora", "point": "可稳定试用无需等待；模型新鲜度和创意能力略弱" },
    { "alt": "Pika", "point": "商业级编辑工具更完整；纯文生视频 Pika 更轻量" },
    { "alt": "Luma", "point": "运动控制精度更高；Luma 生成速度更快" }
  ],
  "positionToday": "国际第一梯队",
  "caveats": [
    "国内访问偶有不稳，部分功能需代理",
    "仅海外信用卡 / PayPal 支付，无支付宝 / 微信",
    "注册需海外邮箱，新账号偶发额外验证",
    "Free 套餐不可下载、有水印",
    "单次生成时长仍以 5-10 秒为主流"
  ]
}
```
