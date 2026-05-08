export type AlternativeTopic = {
  slug: string;
  title: string;
  subtitle: string;
  fallbackToolIds: string[];
  scenario: string;
  why: string;
};

export const alternativeTopics: AlternativeTopic[] = [
  {
    slug: 'cursor',
    title: 'Cursor 的国产替代方案',
    subtitle: 'AI IDE、代码补全和项目级问答都能覆盖，优先看国内访问和团队落地门槛。',
    fallbackToolIds: ['trae', 'claude-code', 'github-copilot', 'windsurf'],
    scenario: 'AI 编程、代码补全、项目级重构',
    why: 'Cursor 适合深度 AI 编程，但国内用户常会遇到账号、网络、团队采购和中文资料不稳定的问题。替代方案不一定要完全复制 Cursor，而是要覆盖真实工作流：能不能直接登录，能不能理解中文需求，能不能在现有 IDE 或代码仓库里稳定协作。',
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
    fallbackToolIds: ['kling-ai', 'hailuo-ai', 'jimeng-ai'],
    scenario: 'AI 视频生成、短视频素材、图生视频',
    why: 'Runway 在海外视频生成工具里很有代表性，但国内团队更关心生成速度、访问稳定性、中文提示词和商用链路。国产视频工具在短视频、电商素材和中文创意表达上更贴近日常生产。',
  },
];

export function getAlternativeTopic(slug: string) {
  return alternativeTopics.find((topic) => topic.slug === slug) ?? null;
}
