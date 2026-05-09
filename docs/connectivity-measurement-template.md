# Connectivity Measurement Template

Use this file to prepare the real I9-B baseline measurements before importing them with:

```powershell
npm run seed:connectivity -- <measurements.json>
```

Do not import this Markdown file directly. Copy the JSON block below into a temporary `.json` file, replace every placeholder with real test results, then run the import command.

Current scope:

- 10 core tools.
- 1 real baseline network measurement per tool.
- Do not split by carrier.
- Use `carrier: "general"`.
- Use `source: "editor"`.
- Use the actual test date in `reportedAt`.

Status values:

- `direct`: website and core interaction work without proxy.
- `proxy-needed`: direct access fails or is too unstable, but works through proxy.
- `blocked`: cannot complete the core interaction in the tested environment.
- `unknown`: test was inconclusive; use sparingly and explain why in `note`.

Latency:

- Use `latencyMs` only when you measured a concrete response time.
- Omit `latencyMs` when blocked, proxy-only without a comparable direct timing, or inconclusive.

```json
[
  {
    "toolId": "claude",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明官网、登录、核心功能是否可用"
  },
  {
    "toolId": "cursor",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明官网、下载/登录、核心功能是否可用"
  },
  {
    "toolId": "chatgpt",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明官网、登录、对话是否可用"
  },
  {
    "toolId": "doubao",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明网页/App 入口和对话是否可用"
  },
  {
    "toolId": "kimi",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明网页、登录、长文本/对话是否可用"
  },
  {
    "toolId": "deepseek",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明网页、登录、对话是否可用"
  },
  {
    "toolId": "wenxin",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明网页、登录、对话是否可用"
  },
  {
    "toolId": "tongyi",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明网页、登录、对话是否可用"
  },
  {
    "toolId": "trae",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明下载、登录、核心 IDE 功能是否可用"
  },
  {
    "toolId": "github-copilot",
    "carrier": "general",
    "region": "填写实际测试城市",
    "status": "direct | proxy-needed | blocked | unknown",
    "source": "editor",
    "reportedAt": "YYYY-MM-DD",
    "reportedBy": "admin",
    "note": "说明 GitHub/Copilot 页面、登录、IDE 授权是否可用"
  }
]
```
