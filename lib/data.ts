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

export const CATEGORIES: Category[] = [
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
