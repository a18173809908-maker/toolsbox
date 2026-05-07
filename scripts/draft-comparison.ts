import { config } from 'dotenv';
import { inArray } from 'drizzle-orm';

config({ path: '.env.local' });

type ToolDraftInput = {
  id: string;
  name: string;
  pricing: string;
  chinaAccess: string;
  features: string[] | null;
  pricingDetail: string | null;
  priceCny: string | null;
  freeQuota: string | null;
};

const ACCESS_LABELS: Record<string, string> = {
  accessible: '国内可直连',
  'vpn-required': '通常需要代理',
  blocked: '国内受限',
  unknown: '待核实',
};

function usage() {
  console.log(`用法:
  npm run draft:comparison -- <tool-a-id> <tool-b-id> [--prompt-only]
  npm run draft:comparison -- --list

示例:
  npm run draft:comparison -- cursor trae
  npm run draft:comparison -- claude-code cursor --prompt-only
  npm run draft:comparison -- --list`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) return { help: true, list: false, promptOnly: false, ids: [] };
  const list = args.includes('--list');
  const promptOnly = args.includes('--prompt-only');
  const ids = args.filter((arg) => !arg.startsWith('--'));
  return { help: false, list, promptOnly, ids };
}

function formatTool(tool: ToolDraftInput) {
  const features = tool.features?.length ? tool.features.join('、') : '待补充';
  const price = tool.priceCny ?? tool.pricingDetail ?? tool.pricing;
  const freeQuota = tool.freeQuota ?? '待补充';
  const access = ACCESS_LABELS[tool.chinaAccess] ?? tool.chinaAccess;
  return [
    `名称：${tool.name}`,
    `工具 ID：${tool.id}`,
    `定价：${price}`,
    `免费额度：${freeQuota}`,
    `国内可用性：${access}`,
    `核心功能：${features}`,
  ].join('\n');
}

function buildPrompt(toolA: ToolDraftInput, toolB: ToolDraftInput) {
  return `你是一位国内 AI 工具实测专家，正在写《${toolA.name} vs ${toolB.name}》横评文章。

工具 A 基本信息：
${formatTool(toolA)}

工具 B 基本信息：
${formatTool(toolB)}

必须覆盖的对比维度：
1. 核心功能差异（各自擅长什么）
2. 国内可用性（直连/需代理/稳定性）
3. 中文支持质量（界面/文档/输出）
4. 定价与性价比（含人民币参考价）
5. 适合的用户场景（明确说谁应该选 A，谁应该选 B）

输出要求：
- 3000-4000 字 markdown
- 含「编辑结论」段
- 结论必须明确推荐，不允许模糊表述
- 不要编造未提供的测试数据；如果缺少实测信息，写成「待编辑实测补充」
- 保留 Methodology Box 可填写线索，包括测试时间、测试环境、评测集说明、测试人`;
}

async function loadTools(ids: string[]) {
  const [{ db }, { tools }] = await Promise.all([
    import('@/lib/db'),
    import('@/lib/db/schema'),
  ]);

  const rows = await db
    .select({
      id: tools.id,
      name: tools.name,
      pricing: tools.pricing,
      chinaAccess: tools.chinaAccess,
      features: tools.features,
      pricingDetail: tools.pricingDetail,
      priceCny: tools.priceCny,
      freeQuota: tools.freeQuota,
    })
    .from(tools)
    .where(inArray(tools.id, ids));

  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id));
}

async function listTools() {
  const [{ db }, { tools }] = await Promise.all([
    import('@/lib/db'),
    import('@/lib/db/schema'),
  ]);

  const rows = await db
    .select({
      id: tools.id,
      name: tools.name,
    })
    .from(tools);

  for (const row of rows.sort((a, b) => a.id.localeCompare(b.id))) {
    console.log(`${row.id}\t${row.name}`);
  }
}

async function main() {
  const { help, list, promptOnly, ids } = parseArgs();
  if (help) {
    usage();
    return;
  }
  if (list) {
    await listTools();
    return;
  }
  if (ids.length !== 2) {
    usage();
    process.exit(1);
  }

  const [toolA, toolB] = await loadTools(ids);
  if (!toolA || !toolB) {
    const missing = ids.filter((id, index) => ![toolA, toolB][index]);
    throw new Error(`tools not found: ${missing.join(', ')}`);
  }

  const prompt = buildPrompt(toolA, toolB);
  if (promptOnly) {
    console.log(prompt);
    return;
  }

  const { chat } = await import('@/lib/llm');
  const markdown = await chat(
    [
      { role: 'system', content: '你是严谨的中文 AI 工具评测编辑，优先准确，不编造实测数据。' },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.35, maxTokens: 6000 },
  );
  console.log(markdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
