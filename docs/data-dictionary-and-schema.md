# AIBoxPro 字段字典与数据库草案

## 1. 文档目的

本文用于定义 AIBoxPro 第一阶段的核心数据结构，作为：

- 产品字段标准
- 内容生成输入标准
- 后台录入与审核标准
- 后续数据库设计参考

第一阶段范围聚焦于：

- 工具详情页
- 对比页
- 场景页
- 替代方案页
- 工具提交与合作线索

## 2. 设计原则

### 2.1 字段原则

- 优先结构化，少用大段自由文本
- 区分“客观事实字段”和“编辑判断字段”
- 区分“自动提取字段”和“人工审核字段”
- 每个重要结论都尽量能追溯来源

### 2.2 内容原则

- 价格、官网、API、是否支持中文等优先使用官方来源
- 国内可用性、适合人群、使用门槛等可以由编辑判断，但要保留说明
- 高风险字段必须允许 `unknown` 或 `needs_review`

## 3. 字段分层

建议按五层组织字段：

1. 基础标识字段
2. 产品能力字段
3. 国内适配字段
4. 编辑判断字段
5. 来源与审核字段

## 4. 工具主表 `tools`

### 4.1 核心字段

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 内部唯一 ID |
| `slug` | varchar(120) | 是 | URL 标识，如 `claude-code` |
| `name` | varchar(120) | 是 | 工具名称 |
| `display_name_zh` | varchar(120) | 否 | 中文展示名称 |
| `official_url` | text | 是 | 官网地址 |
| `vendor_name` | varchar(120) | 否 | 公司或开发者名称 |
| `vendor_region` | varchar(80) | 否 | 所属地区，如 `US`、`CN` |
| `status` | varchar(32) | 是 | `active` / `inactive` / `archived` |
| `primary_category_id` | uuid | 是 | 主分类 ID |
| `one_line_summary` | text | 是 | 一句话介绍 |
| `summary_zh` | text | 否 | 中文摘要 |
| `launch_date` | date | 否 | 产品发布时间 |
| `last_updated_official_at` | timestamp | 否 | 官方最近更新时间 |
| `last_reviewed_at` | timestamp | 否 | 站内最后审核时间 |
| `published_at` | timestamp | 否 | 首次发布时间 |

### 4.2 示例

```text
slug = claude-code
name = Claude Code
display_name_zh = Claude Code
official_url = https://docs.anthropic.com/en/docs/claude-code/overview
vendor_name = Anthropic
vendor_region = US
status = active
```

## 5. 工具能力表 `tool_capabilities`

用于存储工具的结构化能力标签。

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `tool_id` | uuid | 是 | 关联工具 |
| `supports_api` | boolean | 否 | 是否支持 API |
| `supports_team_plan` | boolean | 否 | 是否支持团队版 |
| `supports_mobile` | boolean | 否 | 是否有移动端 |
| `supports_browser` | boolean | 否 | 是否可网页使用 |
| `supports_desktop` | boolean | 否 | 是否有桌面端 |
| `supports_plugin_ecosystem` | boolean | 否 | 是否有插件生态 |
| `supports_open_source` | boolean | 否 | 是否开源 |
| `open_source_repo_url` | text | 否 | GitHub 仓库 |
| `deployment_mode` | varchar(32) | 否 | `cloud` / `local` / `hybrid` |
| `core_features_json` | jsonb | 否 | 核心功能数组 |
| `supported_modalities_json` | jsonb | 否 | 文本/图像/视频/代码等 |

### 5.1 `core_features_json` 示例

```json
[
  "code_generation",
  "repository_understanding",
  "terminal_execution",
  "bug_fixing"
]
```

## 6. 工具定价表 `tool_pricing`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `tool_id` | uuid | 是 | 关联工具 |
| `pricing_model` | varchar(32) | 否 | `free` / `freemium` / `subscription` / `usage_based` |
| `has_free_plan` | boolean | 否 | 是否有免费版 |
| `has_trial` | boolean | 否 | 是否有试用 |
| `entry_price_value` | decimal(10,2) | 否 | 入门价格数值 |
| `entry_price_currency` | varchar(16) | 否 | 币种 |
| `pricing_summary` | text | 否 | 价格摘要 |
| `pricing_reference_url` | text | 否 | 价格页链接 |
| `pricing_last_checked_at` | timestamp | 否 | 最近核验时间 |
| `pricing_confidence` | varchar(16) | 否 | `high` / `medium` / `low` |

## 7. 国内适配表 `tool_china_fit`

这是 AIBoxPro 的核心差异化表之一。

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `tool_id` | uuid | 是 | 关联工具 |
| `china_access_status` | varchar(32) | 否 | `accessible` / `unstable` / `vpn_required` / `unknown` |
| `account_registration_difficulty` | varchar(32) | 否 | `easy` / `medium` / `hard` / `unknown` |
| `payment_support` | jsonb | 否 | 支付方式数组 |
| `supports_chinese_ui` | boolean | 否 | 是否支持中文界面 |
| `supports_chinese_docs` | boolean | 否 | 是否支持中文文档 |
| `supports_chinese_output_well` | varchar(32) | 否 | `strong` / `medium` / `weak` / `unknown` |
| `domestic_notes` | text | 否 | 国内使用提醒 |
| `compliance_notes` | text | 否 | 合规提醒 |
| `algorithm_filing_status` | varchar(32) | 否 | `filed` / `not_filed` / `unknown` / `not_applicable` |
| `private_deployment_support` | boolean | 否 | 是否支持私有化 |
| `china_fit_last_checked_at` | timestamp | 否 | 最近核验时间 |

### 7.1 `payment_support` 示例

```json
["credit_card", "paypal", "alipay"]
```

### 7.2 说明

`algorithm_filing_status` 属于高风险字段。

建议规则：

- 只有明确官方或可信公开依据时才写 `filed` 或 `not_filed`
- 否则默认 `unknown`
- 对外展示时建议加注释说明“以公开信息和站内核验为准”

## 8. 编辑判断表 `tool_editor_review`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `tool_id` | uuid | 是 | 关联工具 |
| `editor_verdict` | text | 否 | 一句话结论 |
| `best_for_json` | jsonb | 否 | 适合谁 |
| `not_for_json` | jsonb | 否 | 不适合谁 |
| `pros_json` | jsonb | 否 | 优点 |
| `cons_json` | jsonb | 否 | 缺点 |
| `risk_notes` | text | 否 | 风险提示 |
| `review_status` | varchar(32) | 是 | `draft` / `reviewed` / `published` |
| `reviewed_by` | varchar(120) | 否 | 审核人 |
| `reviewed_at` | timestamp | 否 | 审核时间 |

### 8.1 `best_for_json` 示例

```json
[
  "个人开发者",
  "习惯终端的工程师",
  "需要理解大型代码库的人"
]
```

## 9. 评分表 `tool_scores`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `tool_id` | uuid | 是 | 关联工具 |
| `score_overall` | decimal(3,1) | 否 | 总分 |
| `score_features` | decimal(3,1) | 否 | 功能完整度 |
| `score_china_access` | decimal(3,1) | 否 | 国内可用性 |
| `score_onboarding` | decimal(3,1) | 否 | 上手门槛 |
| `score_chinese_support` | decimal(3,1) | 否 | 中文支持 |
| `score_cost_effectiveness` | decimal(3,1) | 否 | 性价比 |
| `score_scenario_fit` | decimal(3,1) | 否 | 场景匹配 |
| `score_reliability` | decimal(3,1) | 否 | 稳定性可信度 |
| `scoring_notes` | text | 否 | 评分说明 |
| `scoring_version` | varchar(32) | 否 | 评分模型版本 |
| `auto_generated` | boolean | 否 | 是否自动生成 |
| `needs_manual_review` | boolean | 否 | 是否需人工复核 |

## 10. 来源表 `tool_sources`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `tool_id` | uuid | 是 | 关联工具 |
| `source_url` | text | 是 | 来源地址 |
| `source_type` | varchar(32) | 是 | `official_site` / `pricing_page` / `docs` / `github` / `news` / `community` |
| `source_level` | varchar(8) | 是 | `A` / `B` / `C` / `D` / `E` |
| `is_official` | boolean | 否 | 是否官方来源 |
| `requires_login` | boolean | 否 | 是否需登录 |
| `requires_special_network` | boolean | 否 | 是否需特殊网络条件 |
| `snapshot_title` | text | 否 | 抓取时标题 |
| `last_checked_at` | timestamp | 否 | 最近检查时间 |
| `content_hash` | varchar(120) | 否 | 内容 hash，用于变更检测 |

## 11. 分类表 `categories`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `slug` | varchar(64) | 是 | 分类 slug |
| `name_zh` | varchar(64) | 是 | 中文分类名 |
| `name_en` | varchar(64) | 否 | 英文分类名 |
| `description` | text | 否 | 分类描述 |
| `parent_id` | uuid | 否 | 父分类 |
| `is_active` | boolean | 是 | 是否启用 |

### 11.1 首批分类建议

- chatbot
- code
- image
- video
- writing
- productivity
- agent
- search

## 12. 对比页主表 `comparisons`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `slug` | varchar(160) | 是 | 如 `claude-code-vs-codex` |
| `tool_a_id` | uuid | 是 | 工具 A |
| `tool_b_id` | uuid | 是 | 工具 B |
| `title` | text | 是 | 页面标题 |
| `one_line_verdict` | text | 否 | 一句话结论 |
| `best_for_a_json` | jsonb | 否 | 更适合 A 的人群 |
| `best_for_b_json` | jsonb | 否 | 更适合 B 的人群 |
| `key_differences_json` | jsonb | 否 | 核心区别 |
| `comparison_table_json` | jsonb | 否 | 对比表数据 |
| `domestic_notes` | text | 否 | 国内使用提醒 |
| `faq_json` | jsonb | 否 | FAQ |
| `review_status` | varchar(32) | 是 | `draft` / `reviewed` / `published` |
| `published_at` | timestamp | 否 | 发布时间 |

## 13. 场景页主表 `scenarios`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `slug` | varchar(160) | 是 | 如 `best-ai-coding-tools-for-cn-devs` |
| `title` | text | 是 | 页面标题 |
| `target_users_json` | jsonb | 否 | 适合人群 |
| `scenario_description` | text | 否 | 场景说明 |
| `recommended_tool_ids_json` | jsonb | 否 | 推荐工具 ID 列表 |
| `selection_logic_json` | jsonb | 否 | 选型逻辑 |
| `comparison_table_json` | jsonb | 否 | 场景对比表 |
| `faq_json` | jsonb | 否 | FAQ |
| `review_status` | varchar(32) | 是 | 页面状态 |
| `published_at` | timestamp | 否 | 发布时间 |

## 14. 替代方案页表 `alternatives`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `slug` | varchar(160) | 是 | 如 `cursor-alternatives` |
| `source_tool_id` | uuid | 是 | 原工具 |
| `title` | text | 是 | 页面标题 |
| `replacement_tool_ids_json` | jsonb | 否 | 替代工具 ID 列表 |
| `replacement_logic_json` | jsonb | 否 | 替代理由 |
| `domestic_fit_notes` | text | 否 | 国内适配提醒 |
| `review_status` | varchar(32) | 是 | 页面状态 |

## 15. 内容任务表 `content_tasks`

用于驱动采集、生成、审核流程。

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `task_type` | varchar(32) | 是 | `tool_detail` / `comparison` / `scenario` / `alternative` |
| `entity_id` | uuid | 否 | 对应内容对象 ID |
| `status` | varchar(32) | 是 | `new` / `processing` / `drafted` / `reviewing` / `published` / `failed` |
| `priority` | integer | 否 | 优先级 |
| `trigger_source` | varchar(32) | 否 | `auto_discovery` / `manual` / `submission` |
| `error_message` | text | 否 | 失败原因 |
| `created_at` | timestamp | 是 | 创建时间 |
| `updated_at` | timestamp | 是 | 更新时间 |

## 16. 工具提交表 `tool_submissions`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `tool_name` | varchar(120) | 是 | 提交的工具名 |
| `official_url` | text | 是 | 官网 |
| `company_name` | varchar(120) | 否 | 公司主体 |
| `category_guess` | varchar(80) | 否 | 提交方选择分类 |
| `supports_chinese_ui` | boolean | 否 | 是否支持中文 |
| `china_access_notes` | text | 否 | 国内访问说明 |
| `pricing_notes` | text | 否 | 定价说明 |
| `contact_name` | varchar(120) | 否 | 联系人 |
| `contact_email` | varchar(160) | 否 | 联系邮箱 |
| `cooperation_interest` | varchar(80) | 否 | 合作意向 |
| `status` | varchar(32) | 是 | `new` / `reviewing` / `accepted` / `rejected` |
| `submitted_at` | timestamp | 是 | 提交时间 |

## 17. 商务线索表 `business_leads`

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | uuid | 是 | 主键 |
| `lead_type` | varchar(32) | 是 | `sponsorship` / `listing` / `consulting` / `partnership` |
| `company_name` | varchar(120) | 否 | 公司名 |
| `contact_name` | varchar(120) | 否 | 联系人 |
| `contact_email` | varchar(160) | 否 | 邮箱 |
| `message` | text | 否 | 留言 |
| `status` | varchar(32) | 是 | `new` / `contacted` / `qualified` / `closed` |
| `created_at` | timestamp | 是 | 创建时间 |

## 18. 推荐状态枚举建议

### 18.1 `china_access_status`

```text
accessible
unstable
vpn_required
blocked
unknown
```

### 18.2 `review_status`

```text
draft
reviewed
published
archived
```

### 18.3 `pricing_model`

```text
free
freemium
subscription
usage_based
custom_quote
unknown
```

## 19. 页面生成最小输入要求

### 19.1 生成工具详情页前至少需要

- `name`
- `slug`
- `official_url`
- `primary_category_id`
- `one_line_summary`
- `china_access_status`
- `supports_chinese_ui`
- `pricing_summary`
- `editor_verdict`
- `score_overall`

### 19.2 生成对比页前至少需要

- 两个工具都有完整主表记录
- 两个工具都有评分
- 两个工具都有国内适配字段
- 有一段编辑结论草稿

### 19.3 生成场景页前至少需要

- 明确场景描述
- 至少 3 个推荐工具
- 每个工具有评分和适合人群

## 20. 第一阶段最小数据库集合

如果先做 MVP，建议先实现这 8 张表：

1. `tools`
2. `tool_capabilities`
3. `tool_pricing`
4. `tool_china_fit`
5. `tool_editor_review`
6. `tool_scores`
7. `comparisons`
8. `scenarios`

后续再补：

- `tool_sources`
- `tool_submissions`
- `business_leads`
- `content_tasks`
- `alternatives`

