export type ToolMeta = {
  url: string;
  chinaAccess: 'accessible' | 'vpn-required' | 'blocked' | 'unknown';
  chineseUi?: boolean;
  freeQuota?: string;
  apiAvailable?: boolean;
  openSource?: boolean;
  githubRepo?: string;
  features?: string[];
  pricingDetail?: string;
};

export const TOOL_META: Record<string, ToolMeta> = {
  claude: { url: 'https://claude.ai', chinaAccess: 'vpn-required', freeQuota: '每天有限免费额度', apiAvailable: true, features: ['长文本理解', '代码辅助', '多轮对话'] },
  chatgpt: { url: 'https://chat.openai.com', chinaAccess: 'vpn-required', freeQuota: '每天有限免费额度', apiAvailable: true, features: ['多模态对话', '代码生成', '文件分析'] },
  midjourney: { url: 'https://midjourney.com', chinaAccess: 'vpn-required', freeQuota: '无免费额度', features: ['高质量图像生成', '风格控制', '社区画廊'] },
  runway: { url: 'https://runwayml.com', chinaAccess: 'accessible', freeQuota: '有限免费点数', apiAvailable: true, features: ['文生视频', '视频编辑', '运动控制'] },
  cursor: { url: 'https://cursor.sh', chinaAccess: 'accessible', freeQuota: '免费版可用', features: ['项目级问答', '多文件编辑', '代码补全'] },
  sora: { url: 'https://openai.com/sora', chinaAccess: 'vpn-required', features: ['长视频生成', '物理一致性', '镜头控制'] },
  elevenlabs: { url: 'https://elevenlabs.io', chinaAccess: 'accessible', freeQuota: '免费版可用', apiAvailable: true, features: ['语音合成', '声音克隆', '多语种配音'] },
  perplexity: { url: 'https://perplexity.ai', chinaAccess: 'accessible', freeQuota: '免费版可用', apiAvailable: true, features: ['联网搜索', '来源引用', '研究问答'] },
  'notion-ai': { url: 'https://www.notion.com/product/ai', chinaAccess: 'accessible', chineseUi: true, features: ['文档总结', '知识库问答', '写作辅助'] },
  'figma-ai': { url: 'https://www.figma.com/ai/', chinaAccess: 'accessible', features: ['设计生成', '原型生成', '视觉搜索'] },
  suno: { url: 'https://suno.com', chinaAccess: 'accessible', freeQuota: '每天有限免费额度', features: ['歌曲生成', '人声生成', '歌词创作'] },
  gamma: { url: 'https://gamma.app', chinaAccess: 'accessible', freeQuota: '免费版可用', features: ['演示文稿生成', '文档生成', '网页生成'] },
  jasper: { url: 'https://www.jasper.ai', chinaAccess: 'accessible', features: ['品牌语调', '营销文案', '团队协作'] },
  descript: { url: 'https://www.descript.com', chinaAccess: 'accessible', freeQuota: '免费版可用', features: ['文本剪视频', '转录', '录音增强'] },
  krea: { url: 'https://www.krea.ai', chinaAccess: 'accessible', freeQuota: '免费版可用', features: ['实时画布', '图像生成', '视频生成'] },
  devin: { url: 'https://devin.ai', chinaAccess: 'unknown', features: ['自主编程', '任务规划', 'PR 交付'] },
  replicate: { url: 'https://replicate.com', chinaAccess: 'accessible', apiAvailable: true, features: ['云端模型运行', 'API 调用', '开源模型'] },
  huggingface: { url: 'https://huggingface.co', chinaAccess: 'accessible', apiAvailable: true, openSource: true, githubRepo: 'huggingface/transformers', features: ['模型托管', '数据集', 'Spaces'] },
  'spline-ai': { url: 'https://spline.design/ai', chinaAccess: 'accessible', features: ['3D 生成', '场景编辑', '动画'] },
  tldraw: { url: 'https://www.tldraw.com', chinaAccess: 'accessible', openSource: true, githubRepo: 'tldraw/tldraw', features: ['白板绘图', '原型草图', '协作'] },
  pika: { url: 'https://pika.art', chinaAccess: 'accessible', freeQuota: '免费版可用', features: ['文生视频', '音效', '口型同步'] },
  mistral: { url: 'https://chat.mistral.ai', chinaAccess: 'accessible', freeQuota: '免费版可用', apiAvailable: true, features: ['多语种对话', '代码问答', '欧洲模型'] },
  gemini: { url: 'https://gemini.google.com', chinaAccess: 'vpn-required', freeQuota: '免费版可用', apiAvailable: true, features: ['多模态问答', 'Workspace 集成', '长上下文'] },
  v0: { url: 'https://v0.dev', chinaAccess: 'accessible', freeQuota: '免费版可用', features: ['React UI 生成', 'Tailwind 代码', '原型生成'] },
};
