/**
 * 补种 4 个 AI 编程工具（T4.1 对比草稿所需）
 * windsurf / claude-code / trae / github-copilot
 */
import { db } from '@/lib/db';
import { tools } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const NEW_TOOLS = [
  {
    id: 'windsurf',
    name: 'Windsurf',
    mono: 'WS',
    brand: '#1A56DB',
    catId: 'code',
    en: 'AI-native code editor by Codeium with Cascade agentic AI flows.',
    zh: 'Codeium 出品的 AI 原生代码编辑器，支持 Cascade 智能体工作流。',
    pricing: 'Freemium',
    url: 'https://codeium.com/windsurf',
    chinaAccess: 'vpn-required',
    chineseUi: false,
    freeQuota: '免费版每月 50 次 Cascade 流程',
    apiAvailable: false,
    openSource: false,
    features: ['多文件编辑', 'Cascade 智能体流', '代码补全', '终端集成'],
    needsOverseasPhone: false,
    overseasPaymentOnly: true,
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    mono: 'CC',
    brand: '#D97706',
    catId: 'code',
    en: "Anthropic's agentic coding CLI — reads, writes, and runs your codebase autonomously.",
    zh: 'Anthropic 推出的智能体编程 CLI，可自主读写运行代码库。',
    pricing: 'Paid',
    url: 'https://claude.ai/code',
    chinaAccess: 'blocked',
    chineseUi: false,
    freeQuota: null,
    apiAvailable: true,
    openSource: false,
    features: ['全代码库理解', '自主执行命令', '多文件修改', 'Git 操作'],
    needsOverseasPhone: true,
    overseasPaymentOnly: true,
  },
  {
    id: 'trae',
    name: 'Trae',
    mono: 'TR',
    brand: '#0066FF',
    catId: 'code',
    en: 'ByteDance AI IDE with free Claude & GPT-4o access, Chinese UI.',
    zh: '字节跳动出品的 AI IDE，免费内置 Claude 与 GPT-4o，中文界面。',
    pricing: 'Free',
    url: 'https://trae.ai',
    chinaAccess: 'accessible',
    chineseUi: true,
    freeQuota: '现阶段完全免费，包含 Claude 3.5 Sonnet 与 GPT-4o',
    apiAvailable: false,
    openSource: false,
    features: ['免费 Claude/GPT-4o', '中文界面', 'AI 代码补全', '多文件编辑'],
    needsOverseasPhone: false,
    overseasPaymentOnly: false,
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    mono: 'GC',
    brand: '#24292E',
    catId: 'code',
    en: 'AI pair programmer by GitHub with inline suggestions and multi-model chat.',
    zh: 'GitHub 出品的 AI 结对编程工具，支持行内建议与多模型对话。',
    pricing: 'Paid',
    url: 'https://github.com/features/copilot',
    chinaAccess: 'vpn-required',
    chineseUi: false,
    freeQuota: '学生与开源贡献者免费',
    apiAvailable: true,
    openSource: false,
    features: ['行内代码建议', '多模型对话', 'PR 自动审查', 'IDE 插件生态'],
    needsOverseasPhone: false,
    overseasPaymentOnly: true,
  },
];

async function main() {
  for (const tool of NEW_TOOLS) {
    const existing = await db.select({ id: tools.id }).from(tools).where(eq(tools.id, tool.id));
    if (existing.length) {
      console.log(`⏭  已存在: ${tool.id}`);
      continue;
    }
    await db.insert(tools).values({
      id: tool.id,
      name: tool.name,
      mono: tool.mono,
      brand: tool.brand,
      catId: tool.catId,
      en: tool.en,
      zh: tool.zh,
      pricing: tool.pricing,
      url: tool.url,
      chinaAccess: tool.chinaAccess,
      chineseUi: tool.chineseUi,
      freeQuota: tool.freeQuota,
      apiAvailable: tool.apiAvailable,
      openSource: tool.openSource,
      features: tool.features,
      needsOverseasPhone: tool.needsOverseasPhone,
      overseasPaymentOnly: tool.overseasPaymentOnly,
      publishedAt: new Date().toISOString(),
    });
    console.log(`✓ 已插入: ${tool.id} (${tool.name})`);
  }
  console.log('\n完成。');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
