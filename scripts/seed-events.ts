/**
 * 补种 5 个样本事件（T5.3）
 * 用法：npx tsx scripts/seed-events.ts
 */
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const SAMPLE_EVENTS = [
  {
    slug: 'claude-code-1',
    title: 'Anthropic 正式发布 Claude Code：自主编程 CLI 工具',
    summary: 'Anthropic 推出 Claude Code，一个可以读写和运行整个代码库的 agentic CLI 工具，支持 Git 操作、终端命令和多文件修改，标志着 AI 编程工具从"补全助手"向"自主代理"的范式转变。',
    body: `## 事件概要

2025 年，Anthropic 正式发布 Claude Code，这是一个基于命令行界面（CLI）的 agentic 编程工具。

## 主要功能

- **全代码库理解**：Claude Code 可以读取整个项目目录，理解跨文件的依赖关系
- **自主执行命令**：可在本地运行测试、安装依赖、执行脚本
- **多文件修改**：支持跨越多个文件的协调修改
- **Git 操作**：可直接进行 commit、branch 管理等 Git 操作

## 定价

Claude Code 基于 Anthropic API 按用量计费，使用 Claude Sonnet 和 Claude Opus 模型。没有独立免费额度，需要 Anthropic API 账户。

## 访问限制

国内用户无法直接访问 Claude.ai，且需要海外手机号和海外支付方式注册 Anthropic 账户。

## 行业影响

Claude Code 的发布加速了 AI 编程工具从"行内补全"向"自主任务执行"的演进。Cursor、Windsurf、Cline 等工具均加速推出或强化了类似的 Agent 功能。字节跳动随后推出 Trae，为国内用户提供免费的 Claude 编程能力替代入口。`,
    publishedAt: new Date('2025-02-25'),
  },
  {
    slug: 'cursor-1-0',
    title: 'Cursor 1.0 发布：BugBot 自动审查与 Background Agent',
    summary: 'Anysphere 发布 Cursor 1.0，引入 BugBot 自动代码审查、Background Agent 后台任务执行、全新记忆功能和 One-click MCP 服务器安装，AI 代码编辑器从功能迭代进入品牌成熟阶段。',
    body: `## 事件概要

Anysphere 于 2025 年发布 Cursor 1.0，这是该产品的首个大版本里程碑，标志着产品从快速迭代期进入成熟阶段。

## 1.0 核心新功能

### BugBot
- 自动审查 Pull Request，在代码合并前发现潜在 Bug
- 集成到 GitHub PR 流程，以行内 Comment 形式呈现问题
- 不需要用户手动触发，CI 级别的自动化

### Background Agent
- 支持后台并行执行编码任务
- 用户可以同时启动多个 Agent 任务，在等待期间继续其他工作
- 任务完成后通知用户审查结果

### 记忆功能
- Cursor 可以跨对话记住用户的偏好设置、项目约定和代码风格
- 减少每次对话需要重新解释上下文的摩擦

### One-click MCP
- 一键安装 MCP（Model Context Protocol）服务器
- 让 Cursor 接入更多外部工具和数据源

## 定价

个人版约 20 美元/月，商业版另有报价。国内需要海外支付方式。

## 竞争背景

Cursor 1.0 发布时，GitHub Copilot、Windsurf、Claude Code 均在加速功能迭代，AI 代码编辑器市场进入激烈竞争阶段。`,
    publishedAt: new Date('2025-04-09'),
  },
  {
    slug: 'kling-1-5',
    title: '可灵 AI 1.5 发布：画质与运动控制大幅升级',
    summary: '快手推出可灵 AI 1.5 版本，视频生成画质和运动一致性显著提升，同时开放更长视频时长和更精细的镜头控制，巩固其在国产 AI 视频生成工具中的领先地位。',
    body: `## 事件概要

快手旗下的可灵 AI 发布 1.5 版本，在视频生成质量和功能完整性上实现了较大幅度的提升。

## 1.5 主要升级

### 画质提升
- 视频细节和纹理质量明显改善
- 人物面部和手部的生成稳定性增强
- 光影处理更自然，减少"塑料感"

### 运动控制
- 图生视频的运动幅度和方向控制更精细
- 支持更复杂的摄像机运动（如环绕、追踪）
- 减少视频中途出现的形变和扭曲

### 时长扩展
- 最长支持生成更长的视频片段
- 分段生成后的拼接一致性改善

## 国内使用情况

可灵 AI 国内直连，支持微信和支付宝登录，有免费额度，付费套餐支持人民币结算。是国内商业可用性最强的 AI 视频生成工具之一。

## 竞争背景

1.5 版本发布后，可灵与即梦 AI、海螺 AI 在国产视频工具中形成三强格局。海外的 Runway Gen-4 和 Sora 在部分指标上仍有优势，但国内访问受限。`,
    publishedAt: new Date('2025-03-20'),
  },
  {
    slug: 'jimeng-1-2',
    title: '即梦 AI 视频生成重大升级：支持参考图与更长时长',
    summary: '字节跳动旗下即梦 AI 推出视频生成重大升级，新增参考图驱动生成、更长视频时长支持和风格一致性控制，进一步缩小与国际顶级视频 AI 工具的差距。',
    body: `## 事件概要

字节跳动旗下的即梦 AI（Jimeng AI）推出视频生成能力的重大更新，在多个关键维度实现突破。

## 核心升级内容

### 参考图驱动
- 用户可上传参考图来控制视频的视觉风格
- 支持保持特定角色形象在整个视频中的一致性
- 适合有品牌视觉规范的商业内容创作

### 视频时长
- 单次生成支持更长的视频片段
- 多段生成的场景连贯性改善

### 风格控制
- 新增多种预设风格（写实、动漫、电影感等）
- 中文提示词的理解准确率提升

## 国内可用性

即梦 AI 国内直连，字节账号（抖音/头条）即可登录，有免费额度，付费套餐人民币计费。是国内开箱即用体验最顺畅的视频生成工具之一。

## 生态整合

即梦 AI 与字节旗下的剪映深度整合，生成的视频可直接在剪映中进行后续剪辑，形成从生成到发布的完整工作流。这种生态优势是单纯做生成能力的工具难以复制的。`,
    publishedAt: new Date('2025-03-05'),
  },
  {
    slug: 'gpt-5',
    title: 'OpenAI 发布 GPT-5：推理与多模态能力全面升级',
    summary: 'OpenAI 正式发布 GPT-5，在推理能力、长上下文处理和多模态理解上相比 GPT-4o 有显著提升，同时整合了 o3 的推理能力，统一了 OpenAI 的模型产品线。',
    body: `## 事件概要

OpenAI 发布 GPT-5，这是 GPT 系列的新一代旗舰模型，在多个维度超越 GPT-4o。

## 核心能力提升

### 推理能力
- 整合了 o3 系列的链式推理（Chain-of-Thought）能力
- 在数学、编程和逻辑推断任务上表现显著提升
- 复杂多步骤问题的正确率提高

### 长上下文
- 支持更长的上下文窗口
- 在长文档理解和多轮对话中的一致性更强

### 多模态
- 视觉理解能力增强，可处理更复杂的图表和图片
- 音频和视频理解能力扩展

## 产品整合

GPT-5 发布后，OpenAI 简化了模型选择界面，将 ChatGPT 免费版、Plus 版和 API 统一使用 GPT-5 系列。

## 国内访问

ChatGPT 国内仍无法直连，需要 VPN 访问。API 使用需要海外支付方式。国内可通过部分第三方平台（合规性存疑）使用，建议通过官方渠道。

## 对行业的影响

GPT-5 的发布加速了 Claude 4、Gemini 2 系列等竞争产品的迭代节奏。对 AI 编程工具（Cursor、Claude Code 等）影响尤为明显——这些工具的底层模型选择直接影响用户体验。`,
    publishedAt: new Date('2025-05-01'),
  },
];

async function main() {
  for (const ev of SAMPLE_EVENTS) {
    const existing = await db.select({ id: events.id }).from(events).where(eq(events.slug, ev.slug));
    if (existing.length) {
      console.log(`⏭  已存在: ${ev.slug}`);
      continue;
    }
    await db.insert(events).values({
      slug: ev.slug,
      title: ev.title,
      summary: ev.summary,
      body: ev.body,
      status: 'published',
      publishedAt: ev.publishedAt,
    });
    console.log(`✓ 已插入: ${ev.slug}`);
  }
  console.log('\n完成。');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
