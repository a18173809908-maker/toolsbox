# 对比页复审准备包

> 生成日期：2026-05-09
> 输入：`docs/comparison-quality-audit.md`
> 目的：给编辑复审第一批已发布对比页时使用。本文不是发布内容，不代表页面已人工复审。

## 复审原则

- 不改成 Lab 报告，不补没有真实测试支撑的性能结论。
- 保持 doc-based 口径：基于官方文档、公开资料、产品页面和可核验价格信息。
- 每篇至少补 2 个官方来源链接，优先官网文档、定价页、帮助中心、官方博客。
- 正文建议补到 4500-6000 字符，短文优先补“场景判断”和“落地成本”，不要堆泛泛功能介绍。
- 复审完成后，`reviewed_by` 应改为 `admin`，并记录 `reviewed_at`。

## 总体优先级

1. `kimi-vs-wenxin`
2. `doubao-vs-kimi`
3. `cursor-vs-windsurf`
4. `trae-vs-github-copilot`
5. `deepseek-vs-kimi`
6. `cursor-vs-github-copilot`
7. `claude-code-vs-cursor`
8. `cursor-vs-trae`

## 单篇复审提纲

### 1. `kimi-vs-wenxin`

当前问题：

- 正文约 1385 字符，明显偏短。
- 外部引用为 0，需要补官方来源。
- `claude-assisted` 标记，建议人工复审。

建议补写：

- 长文档能力：Kimi 的长文本、文件阅读、网页总结适用边界。
- 百度生态：文心一言 / 千帆在搜索、企业云、国产模型接入上的差异。
- 价格与 API：Kimi / Moonshot 与百度千帆官方定价入口，各自说明“以官网为准”。
- 适合人群：学生/研究/文档整理 vs 企业云/百度生态用户。

建议来源：

- Kimi 官网 / Moonshot API 文档 / 定价页
- 百度文心一言官网 / 百度智能云千帆文档 / 定价页

### 2. `doubao-vs-kimi`

当前问题：

- 正文约 1396 字符，明显偏短。
- 外部引用为 0，需要补官方来源。
- `claude-assisted` 标记，建议人工复审。

建议补写：

- 日常助手场景：写作、问答、资料整理、办公入口差异。
- 长文本场景：Kimi 的阅读/资料处理优势与豆包的通用助手定位。
- 国内生态：豆包与字节/火山生态，Kimi 与 Moonshot API。
- 价格与入口：App、网页、API、免费额度的官方口径。

建议来源：

- 豆包官网 / 火山引擎豆包模型文档 / 定价页
- Kimi 官网 / Moonshot API 文档 / 定价页

### 3. `cursor-vs-windsurf`

当前问题：

- 正文约 1705 字符，偏短。
- 外部引用为 0，需要补官方来源。
- `claude-assisted` 标记，建议人工复审。

建议补写：

- IDE 使用流：补全、聊天、Agent、多文件修改、项目上下文。
- 团队落地：规则文件、代码库索引、权限、企业订阅和协作成本。
- 国内使用：账号、支付、网络、文档资料门槛。
- 选择建议：个人开发者、团队项目、重构任务、快速原型各自怎么选。

建议来源：

- Cursor 官方文档 / Pricing / Changelog
- Windsurf 官方文档 / Pricing / Cascade 或 Agent 功能说明

### 4. `trae-vs-github-copilot`

当前问题：

- 正文约 1746 字符，偏短。
- 外部引用为 0，需要补官方来源。
- `claude-assisted` 标记，建议人工复审。

建议补写：

- Trae 的中文 IDE、SOLO Builder、国内访问与上手成本。
- GitHub Copilot 的 IDE 覆盖、企业合规、GitHub 生态集成。
- 适合人群：中文新手/产品原型 vs GitHub 工作流/成熟工程团队。
- 国内支付、账号、企业采购差异。

建议来源：

- Trae 官网 / 官方文档 / SOLO Builder 说明
- GitHub Copilot 官方文档 / Pricing / Business 或 Enterprise 文档

### 5. `deepseek-vs-kimi`

当前问题：

- 正文约 1843 字符，偏短。
- 外部引用为 0，需要补官方来源。
- `claude-assisted` 标记，建议人工复审。

建议补写：

- DeepSeek 的推理、代码、API 与开源/模型生态定位。
- Kimi 的长文本、资料阅读、搜索问答定位。
- 中文办公：文档总结、写作、学习、研究各自适合谁。
- API 与价格：官方定价、上下文、模型能力不要凭印象写死。

建议来源：

- DeepSeek 官网 / API 文档 / 定价页
- Kimi 官网 / Moonshot API 文档 / 定价页

### 6. `cursor-vs-github-copilot`

当前问题：

- 正文约 1873 字符，偏短。
- 外部引用为 0，需要补官方来源。
- `claude-assisted` 标记，建议人工复审。

建议补写：

- Cursor：AI-first 编辑器、项目级上下文、多文件 Agent。
- Copilot：IDE 插件、多 IDE 覆盖、GitHub 企业生态。
- 团队采购：企业权限、代码安全、GitHub 组织管理。
- 国内落地：网络、支付、团队培训成本。

建议来源：

- Cursor 官方文档 / Pricing
- GitHub Copilot 官方文档 / Pricing / Enterprise 文档

### 7. `claude-code-vs-cursor`

当前问题：

- 正文约 1950 字符，偏短。
- 外部引用为 0，需要补官方来源。
- `claude-assisted` 标记，建议人工复审。

建议补写：

- Claude Code 的终端/代理式开发工作流和适合任务。
- Cursor 的 IDE 内补全、编辑、项目上下文体验。
- 开发者门槛：命令行偏好、IDE 偏好、团队协作。
- 不写“谁更准/更快”，除非后续 I7 Lab 报告真实测过。

建议来源：

- Claude Code 官方文档 / Anthropic docs
- Cursor 官方文档 / Pricing / Changelog

### 8. `cursor-vs-trae`

当前问题：

- 正文约 4747 字符，接近标准但仍可补深。
- 外部引用已有 4 个，来源基础较好。
- `claude-assisted` 标记，建议人工复审。

建议补写：

- 把已有引用逐条核对是否仍有效。
- 补 Trae 国内上手路径、团队场景和 SOLO Builder 的限制条件。
- 补 Cursor 在团队项目中的规则文件、索引、Agent 使用边界。
- 编辑结论可以更明确地区分“专业工程长期使用”和“中文快速原型”。

建议来源：

- Cursor 官方文档 / Pricing
- Trae 官方文档 / Pricing 或产品说明

## 建议执行顺序

先补正文低于 2000 字符且 0 引用的 7 篇，再处理 `cursor-vs-trae`。每篇复审完成后建议重新跑：

```powershell
npm.cmd run audit:comparisons
npm.cmd run build
```

复审全部完成后，再把 `docs/comparison-quality-audit.md` 重新生成并提交。
