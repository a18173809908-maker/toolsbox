// Static seed data — bilingual AI tools, GitHub trending, categories, news.
// Will be replaced by /api/* once DB layer lands.

export type Category = {
  id: string;
  en: string;
  zh: string;
  icon: string;
  count: number;
};

export type Tool = {
  id: string;
  name: string;
  mono: string;
  brand: string;
  cat: string;
  en: string;
  zh: string;
  date: string;
  featured?: boolean;
  pricing: 'Free' | 'Freemium' | 'Paid';
  url?: string;
  chinaAccess?: 'accessible' | 'vpn-required' | 'blocked' | 'unknown';
  chineseUi?: boolean;
  freeQuota?: string;
  apiAvailable?: boolean;
  openSource?: boolean;
  githubRepo?: string;
  features?: string[];
  pricingDetail?: string;
  alternatives?: string[];
  registerMethod?: string[];
  needsOverseasPhone?: boolean;
  needsRealName?: boolean;
  overseasPaymentOnly?: boolean;
  priceCny?: string;
  miniProgram?: string;
  appStoreCn?: boolean;
  publicAccount?: string;
  cnAlternatives?: string[];
  tutorialLinks?: { platform: string; url: string; title: string }[];
  pricingUpdatedAt?: string;
  accessUpdatedAt?: string;
  featuresUpdatedAt?: string;
  complianceUpdatedAt?: string;
  upvotes?: number;
  downvotes?: number;
  howToUse?: string[];
  faqs?: { q: string; a: string }[];
};

export type RepoItem = {
  repo: string;
  desc: string;
  descZh?: string;
  lang: string;
  stars: number;
  gained: number;
};

export type TrendingPeriod = 'today' | 'week' | 'month';

export type HomepageStats = {
  toolsTotal: number;
  featuredTools: number;
  categoriesTotal: number;
  reposTracked: number;
  todayRepos: number;
  todayStarsGained: number;
  lastUpdatedAt?: string;
};

export type NewsItem = {
  id: number;
  title: string;
  titleZh?: string;
  url: string;
  tag?: string;
  publishedAt?: string;
};

export const CATEGORIES: Category[] = [
  { id: 'ai-search',    en: 'AI Search Engines', zh: 'AI搜索引擎', icon: '🔎', count: 0 },
  { id: 'translation',  en: 'AI Translation',    zh: 'AI翻译', icon: '🌐', count: 0 },
  { id: 'side-hustle',  en: 'AI Side Hustle',    zh: 'AI副业/赚钱', icon: '💰', count: 0 },
  { id: 'digital-human', en: 'Digital Humans',   zh: 'AI数字人/主播', icon: '🧑‍💼', count: 0 },
  { id: 'ppt',          en: 'Presentations',     zh: 'PPT制作', icon: '📊', count: 0 },
  { id: 'detection',    en: 'AI Detection',      zh: '内容检测/查重', icon: '🛡️', count: 0 },
  { id: 'ai-learn',     en: 'Learn AI',          zh: '学习AI技术', icon: '🧭', count: 0 },
  { id: 'chatbot',      en: 'AI Chatbots',      zh: '智能对话', icon: '💬', count: 142 },
  { id: 'image',        en: 'Image Generation', zh: '图像生成', icon: '🎨', count: 218 },
  { id: 'video',        en: 'Video Creation',   zh: '视频创作', icon: '🎬', count: 96 },
  { id: 'audio',        en: 'Audio & Voice',    zh: '音频语音', icon: '🎙️', count: 73 },
  { id: 'code',         en: 'Code & Dev',       zh: '编程开发', icon: '⌨️', count: 167 },
  { id: 'writing',      en: 'Writing & Copy',   zh: '写作文案', icon: '✍️', count: 124 },
  { id: 'productivity', en: 'Productivity',     zh: '效率办公', icon: '⚡', count: 189 },
  { id: 'design',       en: 'Design',           zh: '设计创意', icon: '◐', count: 88 },
  { id: 'marketing',    en: 'Marketing',        zh: '营销推广', icon: '◈', count: 64 },
  { id: 'education',    en: 'Education',        zh: '教育学习', icon: '◇', count: 51 },
  { id: 'research',     en: 'Research',         zh: '学术研究', icon: '◉', count: 47 },
  { id: '3d',           en: '3D & Modeling',    zh: '3D建模',   icon: '◫', count: 32 },
  { id: 'data',         en: 'Data Analysis',    zh: '数据分析', icon: '◰', count: 58 },
  { id: 'agent',        en: 'AI Agents',        zh: 'AI智能体', icon: '◆', count: 79 },
];

export const AI_TOOLS: Tool[] = [
  { id: 'claude',      name: 'Claude',       mono: 'C',  brand: '#D97757', cat: 'chatbot',      en: "Anthropic's helpful, harmless, honest AI assistant for thinking and writing.", zh: 'Anthropic 推出的安全、有用、诚实的 AI 助手，擅长长文本思考与写作。', date: '2026-04-21', featured: true, pricing: 'Freemium' },
  { id: 'chatgpt',     name: 'ChatGPT',      mono: 'GT', brand: '#10A37F', cat: 'chatbot',      en: "OpenAI's flagship conversational AI for everyday tasks, code, and creativity.", zh: 'OpenAI 旗舰对话模型，覆盖日常问答、编程与创意写作。', date: '2026-04-18', featured: true, pricing: 'Freemium' },
  { id: 'midjourney',  name: 'Midjourney',   mono: 'MJ', brand: '#1A1A1A', cat: 'image',        en: 'Painterly, cinematic image generation favored by art directors.', zh: '电影感与绘画感并存的图像生成工具，深受艺术总监喜爱。', date: '2026-04-19', featured: true, pricing: 'Paid' },
  { id: 'runway',      name: 'Runway Gen-4', mono: 'R',  brand: '#000000', cat: 'video',        en: 'Text-to-video and video-to-video model with controllable motion.', zh: '可控运镜的文本与视频转视频模型。', date: '2026-04-22', featured: true, pricing: 'Freemium' },
  { id: 'cursor',      name: 'Cursor',       mono: 'C',  brand: '#000000', cat: 'code',         en: 'AI-first code editor with multi-file edits and project-aware chat.', zh: 'AI 优先的代码编辑器，支持跨文件编辑与项目级对话。', date: '2026-04-15', featured: true, pricing: 'Freemium' },
  { id: 'sora',        name: 'Sora',         mono: 'S',  brand: '#000000', cat: 'video',        en: "OpenAI's long-form text-to-video with strong physical consistency.", zh: 'OpenAI 长视频生成，物理一致性强。', date: '2026-04-20', pricing: 'Paid' },
  { id: 'elevenlabs',  name: 'ElevenLabs',   mono: '11', brand: '#000000', cat: 'audio',        en: 'Lifelike voice synthesis, cloning, and multilingual dubbing.', zh: '逼真语音合成、克隆与多语种配音。', date: '2026-04-17', pricing: 'Freemium' },
  { id: 'perplexity',  name: 'Perplexity',   mono: 'P',  brand: '#20808D', cat: 'research',     en: 'Answer engine that cites its sources — research-grade search.', zh: '带来源引用的答案引擎，适合学术研究。', date: '2026-04-16', pricing: 'Freemium' },
  { id: 'notion-ai',   name: 'Notion AI',    mono: 'N',  brand: '#000000', cat: 'productivity', en: 'Writing, summarizing, and Q&A built into your workspace.', zh: '内置于工作区的写作、总结与问答。', date: '2026-04-14', pricing: 'Paid' },
  { id: 'figma-ai',    name: 'Figma AI',     mono: 'F',  brand: '#F24E1E', cat: 'design',       en: 'Make Designs, Make Prototype, and visual search across your files.', zh: '生成设计、生成原型与跨文件视觉搜索。', date: '2026-04-13', pricing: 'Paid' },
  { id: 'suno',        name: 'Suno',         mono: 'SU', brand: '#000000', cat: 'audio',        en: 'Generate full songs with vocals from a single prompt.', zh: '一句话生成带人声的完整歌曲。', date: '2026-04-12', pricing: 'Freemium' },
  { id: 'gamma',       name: 'Gamma',        mono: 'G',  brand: '#7C3AED', cat: 'productivity', en: 'AI-powered presentations, docs, and websites in one app.', zh: 'AI 驱动的演示、文档与网站一体化工具。', date: '2026-04-11', pricing: 'Freemium' },
  { id: 'jasper',      name: 'Jasper',       mono: 'J',  brand: '#FF6B35', cat: 'writing',      en: 'Marketing copy generation tuned to your brand voice.', zh: '贴合品牌语调的营销文案生成。', date: '2026-04-10', pricing: 'Paid' },
  { id: 'descript',    name: 'Descript',     mono: 'D',  brand: '#1E1E1E', cat: 'video',        en: 'Edit video by editing text — overdub, transcripts, and studio sound.', zh: '通过编辑文本来剪辑视频——配音、转录与录音棚音效。', date: '2026-04-09', pricing: 'Freemium' },
  { id: 'krea',        name: 'Krea',         mono: 'K',  brand: '#000000', cat: 'image',        en: 'Real-time generative canvas for ideation and motion.', zh: '实时生成式画布，适合构思与动画。', date: '2026-04-08', pricing: 'Freemium' },
  { id: 'devin',       name: 'Devin',        mono: 'DV', brand: '#0F172A', cat: 'agent',        en: 'Autonomous software engineering agent that ships pull requests.', zh: '自主软件工程智能体，能够直接提交 PR。', date: '2026-04-07', pricing: 'Paid' },
  { id: 'replicate',   name: 'Replicate',    mono: 'RE', brand: '#000000', cat: 'code',         en: 'Run open-source ML models in the cloud with one API call.', zh: '一行 API 即可调用开源 ML 模型。', date: '2026-04-06', pricing: 'Freemium' },
  { id: 'huggingface', name: 'Hugging Face', mono: '🤗', brand: '#FFD21E', cat: 'code',         en: 'The hub for open-source models, datasets, and Spaces.', zh: '开源模型、数据集与 Spaces 的中心。', date: '2026-04-05', pricing: 'Free' },
  { id: 'spline-ai',   name: 'Spline AI',    mono: 'SP', brand: '#FF66C4', cat: '3d',           en: 'Generate 3D objects, scenes, and animations from text.', zh: '从文本生成 3D 物体、场景与动画。', date: '2026-04-04', pricing: 'Freemium' },
  { id: 'tldraw',      name: 'tldraw',       mono: 'TL', brand: '#FF7438', cat: 'design',       en: 'Sketch UI and watch it become a real working prototype.', zh: '手绘 UI 即可变为真实可交互原型。', date: '2026-04-03', pricing: 'Free' },
  { id: 'pika',        name: 'Pika',         mono: 'PK', brand: '#0EA5E9', cat: 'video',        en: 'Idea-to-video with sound effects and lip-sync controls.', zh: '从创意到视频，支持音效与口型同步。', date: '2026-04-02', pricing: 'Freemium' },
  { id: 'mistral',     name: 'Le Chat',      mono: 'M',  brand: '#FA520F', cat: 'chatbot',      en: "Mistral's European frontier chat with strong multilingual chops.", zh: 'Mistral 推出的欧洲前沿对话，多语种能力出众。', date: '2026-04-01', pricing: 'Freemium' },
  { id: 'gemini',      name: 'Gemini',       mono: 'GE', brand: '#4285F4', cat: 'chatbot',      en: "Google DeepMind's multimodal assistant across the Workspace stack.", zh: 'Google DeepMind 多模态助手，贯穿 Workspace 全家桶。', date: '2026-03-30', pricing: 'Freemium' },
  { id: 'v0',          name: 'v0',           mono: 'V0', brand: '#000000', cat: 'code',         en: 'Generate React + Tailwind UI from a sketch or a sentence.', zh: '从草图或一句话生成 React + Tailwind 界面。', date: '2026-03-29', pricing: 'Freemium' },
  // ── 国内 AI 工具 ──────────────────────────────────────────────────────────
  { id: 'doubao',       name: '豆包',         mono: '豆',  brand: '#4E6EF2', cat: 'chatbot',      en: "ByteDance's all-in-one AI assistant for intelligent conversation and creative tasks.", zh: '字节跳动推出的全能AI助手，支持智能对话、文案创作、图片生成及自定义智能体。', date: '2026-03-28', featured: true, pricing: 'Freemium' },
  { id: 'kimi',         name: 'Kimi',         mono: 'Ki',  brand: '#6366F1', cat: 'chatbot',      en: "Moonshot AI's long-context assistant for reading ultra-long documents.", zh: '月之暗面出品的长文本AI助手，支持200万字超长上下文。', date: '2026-03-27', featured: true, pricing: 'Freemium' },
  { id: 'deepseek',     name: 'DeepSeek',     mono: 'DS',  brand: '#1D4ED8', cat: 'chatbot',      en: "DeepSeek's frontier AI with exceptional reasoning and coding.", zh: '深度求索推出的顶级AI大模型，推理和编程能力出众，完全免费并开源。', date: '2026-03-26', featured: true, pricing: 'Free' },
  { id: 'wenxin-yiyan', name: '文心一言',     mono: '文',  brand: '#E11D48', cat: 'chatbot',      en: "Baidu's ERNIE Bot with strong Chinese language understanding.", zh: '百度推出的文心大模型AI助手，中文理解与创作能力强。', date: '2026-03-25', pricing: 'Freemium' },
  { id: 'tongyi-qianwen', name: '通义千问',   mono: '通',  brand: '#F97316', cat: 'chatbot',      en: "Alibaba's Qwen AI assistant with strong reasoning capabilities.", zh: '阿里巴巴推出的通义千问AI助手，擅长推理、编程和数学。', date: '2026-03-24', pricing: 'Freemium' },
  { id: 'zhipu-chatglm', name: '智谱清言',    mono: '智',  brand: '#0D9488', cat: 'chatbot',      en: "Zhipu AI's ChatGLM assistant with natural Chinese dialogue.", zh: '清华系智谱AI推出的AI助手，中文表达自然流畅。', date: '2026-03-23', pricing: 'Freemium' },
  { id: 'xunfei-spark', name: '讯飞星火',     mono: '火',  brand: '#2563EB', cat: 'chatbot',      en: "iFlytek's Spark AI with industry-leading voice interaction.", zh: '科大讯飞推出的星火大模型AI助手，语音交互能力业界领先。', date: '2026-03-22', pricing: 'Freemium' },
  { id: 'tencent-yuanbao', name: '腾讯元宝',  mono: '元',  brand: '#059669', cat: 'chatbot',      en: "Tencent's Yuanbao AI assistant with WeChat ecosystem integration.", zh: '腾讯推出的AI助手，基于混元大模型，深度整合微信生态。', date: '2026-03-21', pricing: 'Free' },
  { id: 'metaso',       name: '秘塔AI搜索',   mono: '搜',  brand: '#475569', cat: 'ai-search',    en: 'Ad-free AI search engine with source-cited comprehensive answers.', zh: '无广告的AI搜索引擎，自动汇总多方来源并生成带引用的答案。', date: '2026-03-20', pricing: 'Free' },
  { id: 'jimeng-ai',    name: '即梦AI',       mono: '梦',  brand: '#EC4899', cat: 'image',        en: "ByteDance's AI for high-quality image and video generation.", zh: '字节跳动推出的AI创作平台，支持文字生成图片和视频。', date: '2026-03-19', pricing: 'Freemium' },
  { id: 'kling-ai',     name: '可灵AI',       mono: 'KL',  brand: '#7C3AED', cat: 'video',        en: "Kuaishou's AI video generator with physics-accurate videos.", zh: '快手推出的AI视频生成工具，物理效果逼真。', date: '2026-03-18', pricing: 'Freemium' },
  { id: 'hailuo-ai',    name: '海螺AI',       mono: '海',  brand: '#0891B2', cat: 'video',        en: "MiniMax's Hailuo AI for cinematic-quality short videos.", zh: 'MiniMax推出的AI视频生成工具，画面质感电影级。', date: '2026-03-17', pricing: 'Freemium' },
  { id: 'wenshuyige',   name: '文心一格',     mono: '格',  brand: '#7C2D12', cat: 'image',        en: "Baidu's AI image generation tool for artistic images.", zh: '百度推出的AI绘画工具，支持中文描述词生成高质量艺术图片。', date: '2026-03-16', pricing: 'Freemium' },
  // ── 设计与创意工具 ────────────────────────────────────────────────────────
  { id: 'canva',        name: 'Canva',        mono: 'CV',  brand: '#00C4CC', cat: 'design',       en: 'All-in-one design platform with AI-powered features.', zh: '一体化设计平台，提供AI驱动的图形设计和演示文稿制作。', date: '2026-03-15', pricing: 'Freemium' },
  { id: 'adobe-firefly', name: 'Adobe Firefly', mono: 'AF', brand: '#FF0000', cat: 'image',        en: 'Adobe AI image generation tool integrated with Creative Cloud.', zh: 'Adobe AI图像生成工具，集成Creative Cloud应用。', date: '2026-03-14', pricing: 'Freemium' },
  { id: 'dall-e-3',     name: 'DALL-E 3',     mono: 'DE',  brand: '#10A37F', cat: 'image',        en: "OpenAI's text-to-image model with improved prompt understanding.", zh: 'OpenAI的文本转图像模型，具有改进的提示理解能力。', date: '2026-03-13', pricing: 'Paid' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', mono: 'SD', brand: '#00D4FF', cat: 'image', en: 'Open-source text-to-image model.', zh: '开源文本转图像模型，可以在本地运行。', date: '2026-03-12', pricing: 'Free' },
  { id: 'lexica',       name: 'Lexica',        mono: 'L',  brand: '#00D4FF', cat: 'image',        en: 'Search engine for AI-generated images to find prompts.', zh: 'AI生成图像的搜索引擎，用于查找提示词。', date: '2026-03-11', pricing: 'Free' },
  // ── 写作与文案工具 ────────────────────────────────────────────────────────
  { id: 'grammarly',    name: 'Grammarly',    mono: 'G',  brand: '#553C9A', cat: 'writing',      en: 'AI-powered writing assistant for grammar and style.', zh: 'AI驱动的写作助手，帮助改善语法、拼写和风格。', date: '2026-03-10', pricing: 'Freemium' },
  { id: 'copy-ai',      name: 'Copy.ai',      mono: 'CP',  brand: '#8B5CF6', cat: 'writing',      en: 'AI writing tool for marketing copy and social media.', zh: 'AI写作工具，支持营销文案、社交媒体内容创作。', date: '2026-03-09', pricing: 'Freemium' },
  { id: 'quillbot',     name: 'QuillBot',      mono: 'QB',  brand: '#4ECDC4', cat: 'writing',      en: 'AI paraphrasing tool for rewriting text.', zh: 'AI改写工具，在保持原意的同时重写文本。', date: '2026-03-08', pricing: 'Freemium' },
  // ── 编程开发工具 ──────────────────────────────────────────────────────────
  { id: 'github-copilot', name: 'GitHub Copilot', mono: 'GC', brand: '#000000', cat: 'code', en: 'AI pair programmer with code suggestions.', zh: 'AI结对编程工具，在输入时提供代码建议。', date: '2026-03-07', pricing: 'Paid' },
  { id: 'codeium',      name: 'Codeium',       mono: 'Cd',  brand: '#6166DC', cat: 'code',         en: 'AI code completion supporting 70+ languages.', zh: 'AI代码补全工具，支持70多种语言。', date: '2026-03-06', pricing: 'Freemium' },
  { id: 'tabnine',      name: 'Tabnine',       mono: 'T',  brand: '#22A8B5', cat: 'code',         en: 'AI-powered autocompletion for developers.', zh: '为开发者打造的AI自动补全工具。', date: '2026-03-05', pricing: 'Freemium' },
  // ── 音视频工具 ────────────────────────────────────────────────────────────
  { id: 'capcut',       name: 'CapCut',        mono: 'CC',  brand: '#00D4FF', cat: 'video',        en: "ByteDance's AI-powered video editing app.", zh: '字节跳动AI驱动的视频编辑应用，社交媒体内容创作首选。', date: '2026-03-04', pricing: 'Free' },
  { id: 'filmora',      name: 'Filmora',       mono: 'F',  brand: '#00D4FF', cat: 'video',        en: 'AI-powered video editing software for all skill levels.', zh: 'AI驱动的视频编辑软件，适合初学者和专业人士。', date: '2026-03-03', pricing: 'Freemium' },
  { id: 'otter',        name: 'Otter.ai',      mono: 'O',  brand: '#4F46E5', cat: 'audio',        en: 'AI-powered meeting notes and transcription service.', zh: 'AI驱动的会议记录和转录服务。', date: '2026-03-02', pricing: 'Freemium' },
  { id: 'fireflies',    name: 'Fireflies',     mono: 'FF',  brand: '#10B981', cat: 'audio',        en: 'AI meeting assistant that records and summarizes meetings.', zh: 'AI会议助手，自动记录和总结会议内容。', date: '2026-03-01', pricing: 'Freemium' },
  // ── AI搜索工具 ────────────────────────────────────────────────────────────
  { id: 'bing-ai',      name: 'Copilot',       mono: 'B',  brand: '#0078D4', cat: 'ai-search',    en: 'Microsoft AI-powered search with chat interface.', zh: '微软AI驱动的搜索引擎，具有聊天界面和创意功能。', date: '2026-02-29', pricing: 'Freemium' },
  { id: 'you-com',      name: 'You.com',       mono: 'Y',  brand: '#00D4AA', cat: 'ai-search',    en: 'Privacy-focused AI search engine with summarization.', zh: '注重隐私的AI搜索引擎，提供摘要和聊天功能。', date: '2026-02-28', pricing: 'Freemium' },
  { id: 'phind',        name: 'Phind',         mono: 'P',  brand: '#00C853', cat: 'ai-search',    en: 'AI search engine optimized for developers.', zh: '为开发者优化的AI搜索引擎。', date: '2026-02-27', pricing: 'Freemium' },
  // ── 翻译工具 ──────────────────────────────────────────────────────────────
  { id: 'deepl',        name: 'DeepL',         mono: 'D',  brand: '#00D4FF', cat: 'translation',  en: 'AI-powered translation with human-like quality.', zh: 'AI驱动的翻译，具有类人质量。', date: '2026-02-26', pricing: 'Freemium' },
  { id: 'baidu-translate', name: '百度翻译',   mono: '百',  brand: '#231F20', cat: 'translation',  en: 'Baidu AI-powered translation service.', zh: '百度AI驱动的翻译服务，中文支持强大。', date: '2026-02-25', pricing: 'Freemium' },
  { id: 'youdao-translate', name: '有道翻译',  mono: '道',  brand: '#FF6B00', cat: 'translation',  en: 'NetEase AI translation service with comprehensive dictionary.', zh: '网易AI翻译服务，词典全面。', date: '2026-02-24', pricing: 'Freemium' },
  // ── 效率办公工具 ──────────────────────────────────────────────────────────
  { id: 'notion',       name: 'Notion',        mono: 'N',  brand: '#000000', cat: 'productivity', en: 'All-in-one workspace with AI features.', zh: '一体化工作空间，提供AI功能用于笔记、任务和数据库。', date: '2026-02-23', pricing: 'Freemium' },
  { id: 'obsidian',     name: 'Obsidian',      mono: 'O',  brand: '#483699', cat: 'productivity', en: 'Knowledge management tool with AI-powered note-taking.', zh: '知识管理工具，具有AI驱动的笔记和链接功能。', date: '2026-02-22', pricing: 'Freemium' },
  { id: 'airtable-ai',  name: 'Airtable AI',   mono: 'A',  brand: '#18BFFF', cat: 'productivity', en: 'AI-powered collaboration platform with databases.', zh: 'AI驱动的协作平台，具有关系数据库功能。', date: '2026-02-21', pricing: 'Freemium' },
  { id: 'slack-ai',     name: 'Slack AI',      mono: 'S',  brand: '#E01E5A', cat: 'productivity', en: 'AI-powered collaboration hub for teams.', zh: 'AI驱动的团队协作中心。', date: '2026-02-20', pricing: 'Freemium' },
  { id: 'zoom-ai',      name: 'Zoom AI',       mono: 'Z',  brand: '#2D8CFF', cat: 'productivity', en: 'AI-powered video conferencing with summaries.', zh: 'AI驱动的视频会议，提供会议摘要和转录。', date: '2026-02-19', pricing: 'Freemium' },
  // ── 数据分析工具 ─────────────────────────────────────────────────────────
  { id: 'tableau-gpt',  name: 'Tableau GPT',   mono: 'TG',  brand: '#1E7BB8', cat: 'data',         en: 'AI-powered analytics platform for data visualization.', zh: 'AI驱动的分析平台，用于可视化和理解数据。', date: '2026-02-18', pricing: 'Paid' },
  { id: 'power-bi',     name: 'Power BI',      mono: 'PB',  brand: '#00B4D8', cat: 'data',         en: 'Microsoft business analytics service with AI insights.', zh: '微软商业分析服务，提供AI驱动的洞察。', date: '2026-02-17', pricing: 'Freemium' },
  { id: 'pandas-ai',    name: 'PandasAI',      mono: 'Pd',  brand: '#150485', cat: 'data',         en: 'AI-powered data analysis tool for pandas.', zh: 'AI驱动的数据分析工具，使pandas具有对话能力。', date: '2026-02-16', pricing: 'Freemium' },
  // ── PPT制作工具 ──────────────────────────────────────────────────────────
  { id: 'beautiful-ai', name: 'Beautiful.ai',  mono: 'B',  brand: '#00D4FF', cat: 'ppt',          en: 'AI-powered presentation builder with automatic design.', zh: 'AI驱动的演示构建器，自动设计幻灯片。', date: '2026-02-15', pricing: 'Freemium' },
  { id: 'slidebean',    name: 'SlideBean',     mono: 'S',  brand: '#00D4FF', cat: 'ppt',          en: 'AI-powered presentation platform with analytics.', zh: 'AI驱动的演示平台，具有分析功能。', date: '2026-02-14', pricing: 'Freemium' },
  // ── AI智能体平台 ─────────────────────────────────────────────────────────
  { id: 'langchain',    name: 'LangChain',     mono: 'L',  brand: '#00D4FF', cat: 'agent',        en: 'Framework for building context-aware AI applications.', zh: '用于构建上下文感知AI应用的框架。', date: '2026-02-13', pricing: 'Freemium' },
  { id: 'llamaindex',   name: 'LlamaIndex',    mono: 'LI',  brand: '#00D4FF', cat: 'agent',        en: 'Data framework for connecting LLMs to your data.', zh: '数据框架，用于将LLM连接到你的数据。', date: '2026-02-12', pricing: 'Freemium' },
  // ── 向量数据库 ────────────────────────────────────────────────────────────
  { id: 'pinecone',     name: 'Pinecone',      mono: 'Pc',  brand: '#00D4FF', cat: 'code',         en: 'Managed vector database for AI applications.', zh: '托管向量数据库，用于构建AI应用。', date: '2026-02-11', pricing: 'Freemium' },
  { id: 'chromadb',     name: 'Chroma',        mono: 'Ch',  brand: '#00D4FF', cat: 'code',         en: 'Open-source vector database for RAG applications.', zh: '开源向量数据库，用于构建RAG应用。', date: '2026-02-10', pricing: 'Free' },
];

export const LANG_COLOR: Record<string, string> = {
  Python: '#3572A5', JavaScript: '#F1E05A', TypeScript: '#3178C6',
  Rust: '#DEA584', Go: '#00ADD8', 'C++': '#F34B7D', Swift: '#F05138',
  Kotlin: '#A97BFF', Ruby: '#701516', Jupyter: '#DA5B0B', Shell: '#89E051',
  HTML: '#E34C26', CSS: '#563D7C', Java: '#B07219', Zig: '#EC915C',
};

export const GITHUB_TRENDING: Record<TrendingPeriod, RepoItem[]> = {
  today: [
    { repo: 'anthropic-ai/claude-cookbook', desc: 'Production-ready recipes and patterns for building with Claude — from RAG to multi-agent orchestration.', lang: 'Python',     stars: 18420, gained: 1247 },
    { repo: 'pytorch/torchtitan',           desc: 'PyTorch native pre-training library for large language models, optimized for trillion-parameter scale.',     lang: 'Python',     stars: 12108, gained: 892 },
    { repo: 'vercel/ai',                    desc: 'Build AI-powered applications with React, Svelte, Vue, and Solid — streaming, tools, structured outputs.',  lang: 'TypeScript', stars: 28741, gained: 754 },
    { repo: 'huggingface/smolagents',       desc: 'A barebones library for agents — code-first, model-agnostic, easy to extend.',                              lang: 'Python',     stars: 9612,  gained: 631 },
    { repo: 'tursodatabase/limbo',          desc: 'Limbo is a complete rewrite of SQLite in Rust, with first-class async, vector search, and WASM support.',  lang: 'Rust',       stars: 11203, gained: 588 },
    { repo: 'microsoft/markitdown',         desc: 'Convert any file (PDF, DOCX, XLSX, audio, images) to clean Markdown for LLM ingestion.',                   lang: 'Python',     stars: 31044, gained: 502 },
    { repo: 'cline/cline',                  desc: 'Autonomous coding agent that lives in your IDE — plans, edits, runs commands, and recovers from errors.',  lang: 'TypeScript', stars: 19877, gained: 478 },
    { repo: 'modular/max',                  desc: 'High-performance AI inference engine with native Mojo kernels — drop-in replacement for vLLM and TGI.',    lang: 'C++',        stars: 6541,  gained: 412 },
    { repo: 'astral-sh/uv',                 desc: 'An extremely fast Python package and project manager, written in Rust. 10–100× faster than pip.',         lang: 'Rust',       stars: 35219, gained: 389 },
    { repo: 'unslothai/unsloth',            desc: 'Finetune Llama 3.3, Mistral, Phi-4 & Gemma 2× faster with 70% less memory.',                              lang: 'Python',     stars: 22341, gained: 367 },
    { repo: 'ggerganov/llama.cpp',          desc: "LLM inference in C/C++ — port of Facebook's LLaMA model, runs on a Raspberry Pi.",                       lang: 'C++',        stars: 78920, gained: 341 },
    { repo: 'oven-sh/bun',                  desc: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager — all in one.',             lang: 'Zig',        stars: 76105, gained: 298 },
  ],
  week: [
    { repo: 'anthropic-ai/claude-cookbook', desc: 'Production-ready recipes and patterns for building with Claude.',           lang: 'Python',     stars: 18420, gained: 6840 },
    { repo: 'astral-sh/uv',                 desc: 'An extremely fast Python package and project manager, written in Rust.',   lang: 'Rust',       stars: 35219, gained: 5102 },
    { repo: 'microsoft/markitdown',         desc: 'Convert any file to clean Markdown for LLM ingestion.',                    lang: 'Python',     stars: 31044, gained: 4287 },
    { repo: 'vercel/ai',                    desc: 'Build AI-powered applications with React, Svelte, Vue, and Solid.',        lang: 'TypeScript', stars: 28741, gained: 3915 },
    { repo: 'cline/cline',                  desc: 'Autonomous coding agent that lives in your IDE.',                          lang: 'TypeScript', stars: 19877, gained: 3402 },
    { repo: 'unslothai/unsloth',            desc: 'Finetune Llama 3.3, Mistral, Phi-4 & Gemma 2× faster.',                    lang: 'Python',     stars: 22341, gained: 2891 },
    { repo: 'huggingface/smolagents',       desc: 'A barebones library for agents — code-first, model-agnostic.',             lang: 'Python',     stars: 9612,  gained: 2654 },
    { repo: 'tursodatabase/limbo',          desc: 'Complete rewrite of SQLite in Rust with async, vector search, WASM.',     lang: 'Rust',       stars: 11203, gained: 2401 },
    { repo: 'pytorch/torchtitan',           desc: 'PyTorch native pre-training library for trillion-parameter LLMs.',         lang: 'Python',     stars: 12108, gained: 2103 },
    { repo: 'ggerganov/llama.cpp',          desc: 'LLM inference in C/C++ — runs on a Raspberry Pi.',                         lang: 'C++',        stars: 78920, gained: 1872 },
    { repo: 'modular/max',                  desc: 'High-performance AI inference engine with native Mojo kernels.',            lang: 'C++',        stars: 6541,  gained: 1654 },
    { repo: 'oven-sh/bun',                  desc: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager.', lang: 'Zig',  stars: 76105, gained: 1402 },
  ],
  month: [
    { repo: 'astral-sh/uv',                 desc: 'An extremely fast Python package and project manager.',          lang: 'Rust',       stars: 35219, gained: 18420 },
    { repo: 'microsoft/markitdown',         desc: 'Convert any file to clean Markdown for LLM ingestion.',          lang: 'Python',     stars: 31044, gained: 16208 },
    { repo: 'anthropic-ai/claude-cookbook', desc: 'Production-ready recipes and patterns for building with Claude.', lang: 'Python',     stars: 18420, gained: 14102 },
    { repo: 'unslothai/unsloth',            desc: 'Finetune LLMs 2× faster with 70% less memory.',                  lang: 'Python',     stars: 22341, gained: 12876 },
    { repo: 'vercel/ai',                    desc: 'Build AI-powered applications across frameworks.',               lang: 'TypeScript', stars: 28741, gained: 11203 },
    { repo: 'cline/cline',                  desc: 'Autonomous coding agent for your IDE.',                          lang: 'TypeScript', stars: 19877, gained: 10541 },
    { repo: 'tursodatabase/limbo',          desc: 'SQLite rewritten in Rust with async + vector search.',           lang: 'Rust',       stars: 11203, gained: 9412 },
    { repo: 'pytorch/torchtitan',           desc: 'PyTorch native pre-training for trillion-param models.',         lang: 'Python',     stars: 12108, gained: 8703 },
    { repo: 'huggingface/smolagents',       desc: 'Barebones library for code-first agents.',                       lang: 'Python',     stars: 9612,  gained: 7841 },
    { repo: 'modular/max',                  desc: 'High-performance AI inference with Mojo kernels.',                lang: 'C++',        stars: 6541,  gained: 5612 },
    { repo: 'ggerganov/llama.cpp',          desc: 'LLM inference in C/C++.',                                        lang: 'C++',        stars: 78920, gained: 4988 },
    { repo: 'oven-sh/bun',                  desc: 'Fast JavaScript runtime, bundler, test runner.',                 lang: 'Zig',        stars: 76105, gained: 4203 },
  ],
};

export const NEWS = [
  { date: '2026-04-28', tag: 'Models',  en: 'Anthropic ships Claude Opus 4.5 with 2M context and native tool-use planning.', zh: 'Anthropic 发布 Claude Opus 4.5：2M 上下文与原生工具调用规划。' },
  { date: '2026-04-27', tag: 'Funding', en: 'Mistral closes $2.4B Series D at a $32B valuation, eyes US enterprise push.',  zh: 'Mistral 完成 24 亿美元 D 轮融资，估值 320 亿美元，瞄准美国企业市场。' },
  { date: '2026-04-26', tag: 'Tooling', en: 'Cursor 1.0 lands with multi-repo agents and a redesigned diff inspector.',     zh: 'Cursor 1.0 发布：多仓库智能体与重新设计的 diff 检视器。' },
  { date: '2026-04-25', tag: 'Open',    en: 'Hugging Face releases SmolLM3 — 3B params, beats Llama-3-8B on reasoning.',     zh: 'Hugging Face 发布 SmolLM3：30 亿参数，推理超越 Llama-3-8B。' },
  { date: '2026-04-24', tag: 'Policy',  en: 'EU AI Act Phase 2 takes effect — frontier model audits become mandatory.',      zh: '欧盟 AI 法案二期生效：前沿模型审计成为强制要求。' },
];
