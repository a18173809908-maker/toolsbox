import { neon } from '@neondatabase/serverless';

const NOW_DATE = '2026-05-08';

const tools = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    mono: 'CC',
    brand: '#DA7757',
    catId: 'code',
    en: 'Anthropic\'s agentic coding tool that reads code, edits files, runs commands directly from terminal, IDE or desktop app.',
    zh: 'Anthropic 推出的智能编程工具，可在终端、IDE、桌面端直接读取项目、修改文件、运行命令。',
    pricing: 'Freemium',
    url: 'https://docs.anthropic.com/en/docs/claude-code/overview',
    chinaAccess: 'vpn-required',
    chineseUi: false,
    features: ['代码理解', '文件编辑', '终端操作', '子代理'],
    needsOverseasPhone: false,
    needsRealName: false,
    overseasPaymentOnly: true,
    apiAvailable: true,
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    mono: 'OC',
    brand: '#10A37F',
    catId: 'code',
    en: 'OpenAI\'s cloud-based software engineering agent that reads, modifies and runs code in isolated containers, and can prepare PRs.',
    zh: 'OpenAI 推出的云端软件工程代理，可在隔离容器中读改代码、运行测试、起草 PR；含在 ChatGPT Plus / Pro / Business / Edu / Enterprise 中。',
    pricing: 'Freemium',
    url: 'https://chatgpt.com/codex',
    chinaAccess: 'vpn-required',
    chineseUi: false,
    features: ['云端任务', '并行执行', 'PR 起草', 'GitHub 集成'],
    needsOverseasPhone: true,
    needsRealName: false,
    overseasPaymentOnly: true,
    apiAvailable: true,
  },
  {
    id: 'trae',
    name: 'Trae',
    mono: 'TR',
    brand: '#3B82F6',
    catId: 'code',
    en: 'ByteDance\'s AI IDE for Chinese developers, with SOLO Builder that generates apps from natural language.',
    zh: '字节跳动推出的 AI IDE，主打中文开发者体验；SOLO Builder 可从自然语言生成应用。',
    pricing: 'Freemium',
    url: 'https://www.trae.ai',
    chinaAccess: 'accessible',
    chineseUi: true,
    features: ['中文界面', 'AI 补全', 'SOLO Builder', '应用生成'],
    needsOverseasPhone: false,
    needsRealName: false,
    overseasPaymentOnly: false,
    apiAvailable: false,
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    mono: 'GC',
    brand: '#24292F',
    catId: 'code',
    en: 'GitHub\'s AI coding assistant with deep IDE integration (VS Code, JetBrains, Visual Studio, Neovim) and chat / PR summary features.',
    zh: 'GitHub 推出的 AI 编程助手，深度集成 VS Code、JetBrains、Visual Studio 等主流 IDE，含聊天和 PR 摘要。',
    pricing: 'Freemium',
    url: 'https://github.com/features/copilot',
    chinaAccess: 'accessible',
    chineseUi: false,
    features: ['代码补全', '聊天', 'PR 摘要', '多 IDE 支持'],
    needsOverseasPhone: false,
    needsRealName: false,
    overseasPaymentOnly: false,
    apiAvailable: true,
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    mono: 'WS',
    brand: '#00CFCF',
    catId: 'code',
    en: 'Agentic AI IDE with Cascade Agent workflow and deep agent capabilities for full-codebase tasks. Originally by Codeium; acquired by Cognition in 2025, ownership and roadmap may be in transition.',
    zh: 'AI IDE，主打 Cascade Agent 工作流和深度代理能力；最初由 Codeium 推出，2025 年被 Cognition 收购，归属与路线图正在过渡，请以官方公告为准。',
    pricing: 'Freemium',
    url: 'https://codeium.com/windsurf',
    chinaAccess: 'vpn-required',
    chineseUi: false,
    features: ['Agent 工作流', 'Cascade', '代码补全', '本地编辑器'],
    needsOverseasPhone: false,
    needsRealName: false,
    overseasPaymentOnly: true,
    apiAvailable: false,
  },
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const now = new Date();

  const existing = await sql<{ id: string }[]>`SELECT id FROM tools WHERE id = ANY(${tools.map((t) => t.id)})`;
  const existingSet = new Set(existing.map((r) => r.id));

  let inserted = 0;
  let skipped = 0;
  for (const t of tools) {
    if (existingSet.has(t.id)) {
      console.log(`  ⏭  ${t.id} 已存在，跳过`);
      skipped++;
      continue;
    }
    await sql`
      INSERT INTO tools (
        id, name, mono, brand, cat_id, en, zh, pricing, url,
        china_access, chinese_ui, features,
        needs_overseas_phone, needs_real_name, overseas_payment_only,
        api_available, published_at,
        pricing_updated_at, access_updated_at, features_updated_at
      ) VALUES (
        ${t.id}, ${t.name}, ${t.mono}, ${t.brand}, ${t.catId}, ${t.en}, ${t.zh}, ${t.pricing}, ${t.url},
        ${t.chinaAccess}, ${t.chineseUi}, ${t.features},
        ${t.needsOverseasPhone}, ${t.needsRealName}, ${t.overseasPaymentOnly},
        ${t.apiAvailable}, ${NOW_DATE},
        ${now}, ${now}, ${now}
      )
    `;
    console.log(`  ✓ ${t.id}  ${t.name}`);
    inserted++;
  }
  console.log(`\n完成：插入 ${inserted}，跳过 ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
