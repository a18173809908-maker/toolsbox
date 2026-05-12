export type RankingEntry = {
  toolId: string;
  rank: number;
  why: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  priceSummary: string;
};

export type Ranking = {
  slug: string;
  title: string;
  subtitle: string;
  targetUsers: string[];
  criteria: string[];
  entries: RankingEntry[];
  verdict: string;
  faqs: { q: string; a: string }[];
};

export const rankings: Ranking[] = [
  {
    slug: 'free-ai-video-tools',
    title: '免费 AI 视频工具推荐（国内可用）',
    subtitle: '2026 年可以免费使用、国内可直接访问的 AI 视频生成工具横评，重点看免费额度够不够用、画质能不能过关。',
    targetUsers: ['短视频创作者', '学生党', '刚入门 AI 视频的用户'],
    criteria: [
      '国内无需翻墙可直接使用',
      '有免费额度或永久免费版',
      '支持中文界面或有中文教程',
      '能商用或个人使用无限制',
    ],
    entries: [
      {
        toolId: 'kling-ai',
        rank: 1,
        why: '可灵由快手出品，国内直接访问，每天有免费灵感值额度，5 秒/10 秒视频均支持，画质在国产免费工具里领先。',
        pros: ['国内直连', '每日免费额度', '画质稳定', '支持文生视频和图生视频'],
        cons: ['免费额度有限，高频使用需付费', '生成排队时间不固定'],
        bestFor: '日常短视频内容测试和社交媒体发布',
        priceSummary: '免费版每日限量；会员 ¥66/月起',
      },
      {
        toolId: 'jimeng-ai',
        rank: 2,
        why: '即梦由字节出品，国内免费直连，文生视频和图生视频均支持，免费额度相对充裕，适合字节系用户。',
        pros: ['国内直连', '免费额度相对充裕', '与剪映生态打通', '支持多种风格'],
        cons: ['分辨率上限较低', '部分高级功能需付费'],
        bestFor: '剪映用户和抖音内容创作者',
        priceSummary: '有免费版；会员 ¥98/月起',
      },
      {
        toolId: 'hailuo-ai',
        rank: 3,
        why: '海螺 AI 由 MiniMax 出品，注册即有免费试用额度，运动流畅度表现突出，适合需要动感视频的场景。',
        pros: ['国内直连', '注册送免费额度', '运动流畅度好', '支持长达 6 秒视频'],
        cons: ['免费额度用完后费用较高', '画风较固定'],
        bestFor: '需要流畅动态效果的短视频场景',
        priceSummary: '注册送额度；付费按次计费',
      },
      {
        toolId: 'vidu-ai',
        rank: 4,
        why: 'Vidu 由清华系团队开发，国内直连，免费试用门槛低，在写实风格视频上表现不错。',
        pros: ['国内直连', '写实风格表现好', '免费试用无需信用卡'],
        cons: ['非写实风格效果一般', '免费额度有限'],
        bestFor: '写实人物或场景视频',
        priceSummary: '免费试用；付费版 ¥68/月起',
      },
      {
        toolId: 'pika',
        rank: 5,
        why: 'Pika 是国际工具，需要代理访问，但免费额度较慷慨，适合能科学上网的用户尝试不同风格。',
        pros: ['免费版额度充裕', '风格多样', '画质稳定'],
        cons: ['需要代理访问', '注册需境外邮箱', '生成速度受服务器影响'],
        bestFor: '能翻墙、想体验多风格的用户',
        priceSummary: '免费版有额度；付费 $8/月起',
      },
    ],
    verdict:
      '纯国内免费用：优先选可灵 → 即梦 → 海螺，三个工具的免费额度叠加足够日常内容创作。能翻墙的用户可以加上 Pika 作为风格补充。Runway、Sora 等工具国内访问不稳定且无免费版，暂不推荐新手入手。',
    faqs: [
      {
        q: '这些工具生成的视频可以商用吗？',
        a: '可灵、即梦、海螺均允许个人商用，但需遵守各平台的内容政策。建议使用前阅读官方用户协议，尤其是涉及肖像权和版权的条款。',
      },
      {
        q: '免费额度用完了怎么办？',
        a: '可以轮流使用多个工具的免费额度（可灵每日刷新、即梦额度较多），或等次日额度重置。高频使用建议选一个工具购买月度会员，性价比高于按次购买。',
      },
      {
        q: '生成的视频质量差怎么办？',
        a: '提示词写得越具体效果越好：描述镜头运动（缓慢推进）、光线（自然光、黄昏）、主体（年轻女性、面带微笑）。避免只写"美女跳舞"这类模糊描述。',
      },
    ],
  },
  {
    slug: 'ai-writing-tools',
    title: 'AI 写作工具推荐：中文用户怎么选',
    subtitle: '面向需要用 AI 辅助中文写作的用户，从日报、文案、长文到代码注释，按使用场景推荐最合适的工具。',
    targetUsers: ['内容创作者', '运营人员', '学生和研究者', '自由撰稿人'],
    criteria: [
      '中文输出质量和自然度',
      '支持长文输入与多轮对话',
      '国内访问稳定性',
      '价格和免费额度',
    ],
    entries: [
      {
        toolId: 'doubao',
        rank: 1,
        why: '豆包由字节出品，中文理解和生成质量优秀，支持长文档，免费版额度非常充裕，国内直连无障碍。',
        pros: ['中文质量高', '国内直连', '免费版额度大', '支持多轮对话'],
        cons: ['部分专业领域知识不如 GPT-4o', '创意写作风格偏保守'],
        bestFor: '日常运营文案、报告撰写、邮件起草',
        priceSummary: '免费版额度充裕；会员 ¥15/月',
      },
      {
        toolId: 'claude',
        rank: 2,
        why: 'Claude 的长文本理解和写作风格是当前主流模型里最接近人类的，适合需要写作质感的内容。',
        pros: ['写作风格自然', '长文本处理能力强', '遵循指令准确'],
        cons: ['国内需要代理', '免费版有次数限制', '注册需境外手机号'],
        bestFor: '长篇文章、创意写作、技术文档',
        priceSummary: '免费版有限制；Pro 版 $20/月',
      },
      {
        toolId: 'kimi',
        rank: 3,
        why: 'Kimi 由 Moonshot AI 出品，超长上下文（200K tokens）是核心优势，适合需要处理大量文档的写作场景。',
        pros: ['超长上下文', '国内直连', '文档读取能力强', '支持联网搜索'],
        cons: ['创意写作不如 Claude', '速度偶尔较慢'],
        bestFor: '基于长文档的写作、论文辅助、报告整理',
        priceSummary: '免费版额度充裕；专业版 ¥49/月',
      },
      {
        toolId: 'chatgpt',
        rank: 4,
        why: 'ChatGPT 在全球写作辅助场景中积累了最多的最佳实践和提示词资源，英文写作尤其强。',
        pros: ['生态最丰富', '英文写作最强', '插件和集成多'],
        cons: ['国内需要代理', '中文质量略逊于豆包/Kimi', '免费版次数有限'],
        bestFor: '英文写作、学术论文、SEO 内容',
        priceSummary: '免费版有限制；Plus 版 $20/月',
      },
      {
        toolId: 'deepseek',
        rank: 5,
        why: 'DeepSeek 在数学推理和技术写作上表现突出，价格极低，适合需要大量生成的场景。',
        pros: ['API 价格极低', '技术写作质量好', '国内直连（部分地区）'],
        cons: ['创意写作风格较单一', '高峰期速度较慢'],
        bestFor: '技术文档、代码注释、大批量内容生成',
        priceSummary: '免费版有限；API 按 token 计费，价格极低',
      },
    ],
    verdict:
      '国内日常写作：豆包免费版可以解决 80% 的需求。处理长文档首选 Kimi。写作风格要求高或需要英文内容，预算允许的话上 Claude。DeepSeek 适合技术写作和 API 场景。不建议为写作单独购买多个会员，选一个主力工具用熟比同时用 5 个更有效率。',
    faqs: [
      {
        q: 'AI 写的内容会被检测为 AI 生成吗？',
        a: '目前 AI 检测工具的准确率并不高，但大段直接使用 AI 生成的文本确实有被识别的风险。建议用 AI 起草初稿，自己修改措辞和加入个人观点，最终产出更自然。',
      },
      {
        q: '写作工具哪个中文最流畅？',
        a: '豆包和 Kimi 的中文流畅度最高，因为针对中文做了专门优化。Claude 的中文也很自然，但英文场景更强。ChatGPT 中文质量近期有提升但仍略逊于前两者。',
      },
      {
        q: '用 AI 写作需要注意什么版权问题？',
        a: '目前中国法律对 AI 生成内容的版权归属尚无明确规定。建议在发布时标注使用了 AI 辅助创作，避免将 AI 生成内容原封不动发布到学术平台，商业场景下注意平台的 AI 内容政策。',
      },
    ],
  },
  {
    slug: 'ai-coding-tools',
    title: 'AI 编程工具推荐：Cursor 替代品横评',
    subtitle: '2026 年主流 AI 编程工具横评，从代码补全、对话式开发到 AI Agent 模式，帮你找到最适合的 Cursor 替代品或配合工具。',
    targetUsers: ['独立开发者', '前端/后端工程师', '学生程序员', '技术型 AI 用户'],
    criteria: [
      '代码质量和上下文理解能力',
      '多文件项目支持',
      '国内访问稳定性',
      '价格和免费额度',
    ],
    entries: [
      {
        toolId: 'cursor',
        rank: 1,
        why: 'Cursor 是目前市场上最成熟的 AI 代码编辑器，多文件上下文理解、代码库索引、Agent 模式是核心优势。',
        pros: ['多文件上下文理解最强', '代码库级别索引', 'Agent 自动修 Bug', '支持 Claude/GPT 等多个模型'],
        cons: ['需要代理访问', 'Pro 版价格较高', '国内团队版有限制'],
        bestFor: '全职开发者、复杂项目、需要 AI Agent 模式的场景',
        priceSummary: '免费版有限制；Pro 版 $20/月',
      },
      {
        toolId: 'trae',
        rank: 2,
        why: 'Trae 由字节出品，国内直连，基于 VS Code 内核，内置豆包模型，免费版无需翻墙，是 Cursor 的国内替代首选。',
        pros: ['国内直连', '免费版功能完整', 'VS Code 生态兼容', '豆包模型中文代码质量好'],
        cons: ['多文件上下文不如 Cursor', '插件生态相比 VS Code 有差距', 'Agent 模式还在完善'],
        bestFor: '国内开发者、前端开发、不想翻墙的场景',
        priceSummary: '目前免费使用',
      },
      {
        toolId: 'github-copilot',
        rank: 3,
        why: 'GitHub Copilot 是最早的 AI 编程工具，与 VS Code/JetBrains 集成最深，代码补全体验最成熟。',
        pros: ['IDE 集成最深', '代码补全体验成熟', '支持多种语言', 'GitHub 生态整合'],
        cons: ['需要代理', '订阅费用较高', '多文件理解不如 Cursor'],
        bestFor: '重度 VS Code/JetBrains 用户、开源项目贡献者',
        priceSummary: '个人版 $10/月；学生免费',
      },
      {
        toolId: 'claude',
        rank: 4,
        why: 'Claude 在代码审查、架构设计、复杂问题分析上表现优秀，配合任意编辑器使用，不局限于单一 IDE。',
        pros: ['代码审查质量高', '善于解释复杂代码', '长上下文支持好', '架构建议准确'],
        cons: ['需要代理', '没有 IDE 深度集成', '不适合高频代码补全'],
        bestFor: '代码 Review、架构讨论、复杂 Bug 分析',
        priceSummary: '免费版有限制；Pro 版 $20/月',
      },
      {
        toolId: 'deepseek',
        rank: 5,
        why: 'DeepSeek 在代码生成上的性价比极高，API 价格是 GPT-4 的几十分之一，适合集成到自有工作流。',
        pros: ['API 价格极低', '代码质量接近 GPT-4', '可以自建工作流', '推理能力强'],
        cons: ['没有 IDE 原生插件', '需要自己集成或用第三方工具', '高峰期速度不稳定'],
        bestFor: '需要大量代码生成的自动化场景、API 集成',
        priceSummary: 'API 按 token 计费，价格极低',
      },
    ],
    verdict:
      '在国内开发：Trae 是免费替代 Cursor 的首选，功能已覆盖大部分日常场景。有翻墙条件且项目复杂的开发者，Cursor Pro 值得订阅。GitHub Copilot 适合重度 JetBrains 用户。Claude 和 DeepSeek 作为对话辅助工具，可以与任何编辑器配合使用。',
    faqs: [
      {
        q: 'Trae 和 Cursor 差距有多大？',
        a: '日常单文件或小项目开发差距不明显。差距主要体现在大型项目的多文件上下文理解、Agent 自动修 Bug 的可靠性上。如果你的项目文件数超过 50 个且相互依赖，Cursor 的体验明显更好。',
      },
      {
        q: 'AI 编程工具会不会让代码质量变差？',
        a: 'AI 生成的代码需要人工 Review，尤其是边界条件、错误处理、安全相关的代码。建议把 AI 当成快速起草工具，生成后认真阅读每一行，而不是直接 Ctrl+C/V。',
      },
      {
        q: '学生党用哪个最划算？',
        a: 'GitHub Copilot 对学生免费（需要认证）。Trae 目前完全免费。DeepSeek 的 API 价格极低适合自建工具。这三个组合能覆盖学生的绝大多数开发场景，无需付费订阅。',
      },
    ],
  },
];

export function getRanking(slug: string): Ranking | null {
  return rankings.find((r) => r.slug === slug) ?? null;
}
