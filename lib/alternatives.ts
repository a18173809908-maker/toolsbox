export type AlternativeScenario = {
  useCase: string;   // 使用场景描述
  pick: string;      // 推荐工具名
  reason: string;    // 一句话理由
};

export type AlternativeTopic = {
  slug: string;
  title: string;
  subtitle: string;
  fallbackToolIds: string[];
  scenario: string;
  why: string;
  scenarios?: AlternativeScenario[];
};

export const alternativeTopics: AlternativeTopic[] = [
  {
    slug: 'cursor',
    title: 'Cursor 的国产替代方案',
    subtitle: 'AI IDE、代码补全和项目级问答都能覆盖，优先看国内访问和团队落地门槛。',
    fallbackToolIds: ['trae', 'claude-code', 'github-copilot', 'windsurf'],
    scenario: 'AI 编程、代码补全、项目级重构',
    why: 'Cursor 适合深度 AI 编程，但国内用户常会遇到账号、网络、团队采购和中文资料不稳定的问题。替代方案不一定要完全复制 Cursor，而是要覆盖真实工作流：能不能直接登录，能不能理解中文需求，能不能在现有 IDE 或代码仓库里稳定协作。',
    scenarios: [
      { useCase: '没有 VPN，想免费用 Claude 写代码', pick: 'Trae', reason: '字节出品，国内直连，免费内置 Claude 3.5 Sonnet 和 GPT-4o，零门槛' },
      { useCase: '想在终端里自主完成复杂任务', pick: 'Claude Code', reason: '自主读写整个代码库、执行命令、Git 操作，适合 agentic 工作流' },
      { useCase: '已有 VS Code 习惯，团队统一采购', pick: 'GitHub Copilot', reason: '无缝集成 VS Code/JetBrains，企业版有合规隔离，支持 PR 自动审查' },
      { useCase: '想要多文件协调编辑 + 类 Cursor 体验', pick: 'Windsurf', reason: 'Cascade 智能体流支持跨文件修改，免费版每月 50 次，体验接近 Cursor' },
    ],
  },
  {
    slug: 'chatgpt',
    title: 'ChatGPT 的国产替代方案',
    subtitle: '日常问答、中文写作、长文档和推理任务，可以优先试这些国内可用工具。',
    fallbackToolIds: ['doubao', 'kimi', 'deepseek', 'wenxin-yiyan'],
    scenario: '中文问答、写作、长文档、学习办公',
    why: 'ChatGPT 能力全面，但国内访问、支付和团队合规经常是实际阻力。国产替代工具的优势在中文语境、直连体验和本地生态集成，适合把日常写作、学习、办公和资料整理先跑起来。',
  },
  {
    slug: 'midjourney',
    title: 'Midjourney 的国产替代方案',
    subtitle: '图像生成、海报、电商图和短视频素材，国内工具已经能覆盖不少生产场景。',
    fallbackToolIds: ['jimeng-ai', 'wenshuyige', 'kling-ai'],
    scenario: 'AI 绘图、海报、电商素材、视频分镜',
    why: 'Midjourney 的画面质感强，但账号、英文社区和网络环境对国内新手并不友好。国产工具更适合快速生成中文营销素材、电商图和短视频前期视觉方案，团队协作和素材交付也更顺手。',
  },
  {
    slug: 'notion-ai',
    title: 'Notion AI 的国产替代方案',
    subtitle: '知识库、会议纪要、文档写作和团队协作，更适合国内团队的选择。',
    fallbackToolIds: ['doubao', 'kimi', 'wenxin-yiyan'],
    scenario: '知识管理、文档写作、团队协作',
    why: 'Notion AI 适合在 Notion 工作区里直接写作和总结，但国内团队常会优先考虑访问稳定、中文长文档处理和协作工具生态。国产替代方案更适合先解决文档总结、会议材料和日常知识整理。',
  },
  {
    slug: 'runway',
    title: 'Runway 的国产替代方案',
    subtitle: '文生视频、图生视频、短片素材和商业创意，先看国内能稳定使用的工具。',
    fallbackToolIds: ['kling-ai', 'hailuo-ai', 'jimeng-ai', 'pika', 'vidu-ai'],
    scenario: 'AI 视频生成、短视频素材、图生视频',
    why: 'Runway 在海外视频生成工具里技术扎实，尤其是图生视频和摄像机运动控制领先，但国内用户面临三个硬门槛：需要代理访问、注册须绑境外手机号、付款只支持境外信用卡（最低 12 美元/月）。国产替代工具（可灵、即梦、海螺）在这三点上全部消除，且中文提示词理解更稳定，对短视频素材、电商创意和日常内容生产更直接。',
    scenarios: [
      { useCase: '电商产品视频 + 国内直连零成本开始', pick: '即梦 AI', reason: '字节账号直接登录，有免费额度，对产品图和中文提示词理解好' },
      { useCase: '精细运动控制 + 图生视频质量优先', pick: '可灵 AI', reason: '快手出品，图生视频运动控制最细，国内工具里画质最稳，付费套餐人民币计费' },
      { useCase: '写实风格短片 + 快速批量出素材', pick: '海螺 AI', reason: 'MiniMax 出品，写实画风独特，适合批量生成自然场景素材，有免费额度' },
      { useCase: '预算充裕 + 想对标 Runway 画质', pick: 'Pika', reason: '国内可访问（需邮箱注册），画质接近 Runway，可以作为付费档位的备选' },
    ],
  },
];

export function getAlternativeTopic(slug: string) {
  return alternativeTopics.find((topic) => topic.slug === slug) ?? null;
}
