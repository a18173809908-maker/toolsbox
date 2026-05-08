import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { loadComparisonById } from '@/lib/db/queries';

const BASE = 'https://www.aiboxpro.cn';
const OUTPUT_ROOT = 'draft-package';

type Section = {
  title: string;
  text: string;
};

type CardSpec = {
  width: number;
  height: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  footer?: string;
};

function usage() {
  console.log(`用法:
  npm run draft:social -- <comparison-slug>

示例:
  npm run draft:social -- cursor-vs-trae`);
}

function stripMarkdown(value?: string | null) {
  if (!value) return '';
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/[`*_~]/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSections(markdown?: string | null): Section[] {
  if (!markdown) return [];

  const headed = Array.from(markdown.matchAll(/^#{2,3}\s+(.+)\n([\s\S]*?)(?=^#{2,3}\s+|$)/gm))
    .map((match) => ({
      title: stripMarkdown(match[1]),
      text: stripMarkdown(match[2]),
    }))
    .filter((section) => section.title && section.text && section.text.length > 40)
    .slice(0, 6);
  if (headed.length > 0) return headed;

  return markdown
    .split(/\n{2,}/)
    .filter((item) => !item.includes('|---') && !item.trim().startsWith('|'))
    .map((item) => stripMarkdown(item))
    .filter((item) => item.length > 80 && !item.startsWith('本文基于'))
    .slice(0, 5)
    .map((text, index) => ({
      title: ['核心结论', '使用场景', '功能差异', '国内可用性', '最后建议'][index] ?? `要点 ${index + 1}`,
      text,
    }));
}

function firstSentence(value?: string | null, fallback = '这篇对比帮助中文用户快速判断哪款工具更适合自己。') {
  const clean = stripMarkdown(value);
  if (!clean) return fallback;
  const first = clean.split(/[。！？.!?]/).map((item) => item.trim()).filter(Boolean)[0];
  return `${first || clean}。`;
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function lines(value: string, maxChars: number, maxLines: number) {
  const chars = Array.from(value);
  const out: string[] = [];
  for (let i = 0; i < chars.length && out.length < maxLines; i += maxChars) {
    out.push(chars.slice(i, i + maxChars).join(''));
  }
  if (chars.length > maxChars * maxLines && out.length > 0) {
    out[out.length - 1] = `${out[out.length - 1].slice(0, -1)}…`;
  }
  return out;
}

function accessText(value?: string) {
  if (value === 'accessible') return '国内可直连';
  if (value === 'vpn-required') return '通常需要代理';
  if (value === 'blocked') return '国内受限';
  return '待核实';
}

function priceText(tool: { priceCny?: string; pricingDetail?: string; pricing: string }) {
  return tool.priceCny ?? tool.pricingDetail ?? tool.pricing;
}

function toolLine(tool: {
  name: string;
  chinaAccess?: string;
  chineseUi?: boolean;
  priceCny?: string;
  pricingDetail?: string;
  pricing: string;
}) {
  return `${tool.name}：${accessText(tool.chinaAccess)}，${tool.chineseUi ? '中文界面友好' : '中文体验待核实'}，价格 ${priceText(tool)}`;
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n');
}

function buildWechat(input: {
  title: string;
  summary: string;
  verdict: string;
  url: string;
  toolA: string;
  toolB: string;
  sections: Section[];
}) {
  return `# ${input.title}

> TL;DR：${input.verdict}

原文：${input.url}

## 先给结论

${input.summary}

如果你正在纠结 ${input.toolA} 和 ${input.toolB}，建议先看四件事：国内访问、中文体验、价格门槛、能不能进入你的真实工作流。

${input.sections.slice(0, 5).map((section, index) => `## ${index + 1}. ${section.title}

${truncate(section.text, 360)}
`).join('\n')}

## 怎么选

${markdownList([
  '先看每天最高频的任务，不要只看工具热度。',
  '再看账号、支付、团队协作和数据合规这些落地成本。',
  '最后拿 1-2 个真实任务试用，避免只根据宣传图判断。',
])}

完整表格、结构化对比和相关链接见原文：${input.url}

关注 AIBoxPro，持续跟踪中文用户真正能用、值得用的 AI 工具。`;
}

function buildXiaohongshu(input: {
  summary: string;
  verdict: string;
  toolA: string;
  toolB: string;
}) {
  return `${input.toolA} vs ${input.toolB}，到底怎么选？

先给结论：
${input.verdict}

别只看谁更火，先看这 4 件事：

1. 国内访问是不是稳定
2. 中文界面和中文资料够不够
3. 免费额度和付费门槛是否清楚
4. 能不能接进你的真实工作流

一句话总结：
${input.summary}

完整对比在 AIBoxPro，主页可查看。

#AI工具 #工具对比 #效率工具 #AI编程 #${input.toolA.replace(/\s+/g, '')} #${input.toolB.replace(/\s+/g, '')}`;
}

function buildZhihu(input: {
  summary: string;
  verdict: string;
  url: string;
  toolA: string;
  toolB: string;
  toolALine: string;
  toolBLine: string;
  sections: Section[];
}) {
  return `# ${input.toolA} 和 ${input.toolB} 怎么选？

先说结论：${input.verdict}

我会从“真实使用成本”而不是只看模型热度来判断。对中文用户来说，国内访问、中文资料、价格门槛和团队落地往往比单点功能更影响长期使用。

## 两个工具的基础情况

${markdownList([input.toolALine, input.toolBLine])}

## 我的判断

${input.summary}

${input.sections.slice(0, 4).map((section) => `### ${section.title}

${truncate(section.text, 300)}
`).join('\n')}

## 最后建议

短期尝鲜，看上手成本和免费额度；长期放进团队工作流，就重点检查账号、支付、协作方式和数据合规。工具本身会变，选型逻辑要稳定。

完整对比页在这里，里面有更完整的表格和相关工具链接：${input.url}`;
}

function svg(spec: CardSpec) {
  const wide = spec.width <= 1000;
  const titleSize = wide ? 50 : 78;
  const subtitleSize = wide ? 25 : 32;
  const x = wide ? 56 : 76;
  let y = wide ? 76 : 104;
  const titleLines = lines(spec.title, wide ? 11 : 15, 4);
  const subtitleLines = spec.subtitle ? lines(spec.subtitle, wide ? 20 : 26, 4) : [];

  const out = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.width}" height="${spec.height}" viewBox="0 0 ${spec.width} ${spec.height}">`,
    `<rect width="100%" height="100%" fill="#fff7ed"/>`,
    `<rect x="0" y="0" width="${spec.width}" height="18" fill="#f97316"/>`,
    `<circle cx="${spec.width - 96}" cy="94" r="46" fill="#dcfce7"/>`,
    `<circle cx="${spec.width - 150}" cy="${spec.height - 130}" r="86" fill="#ffedd5"/>`,
    `<text x="${x}" y="${y}" font-family="Arial, Microsoft YaHei, sans-serif" font-size="24" font-weight="800" fill="#c2410c">${escapeXml(spec.eyebrow)}</text>`,
  ];

  y += wide ? 72 : 98;
  for (const line of titleLines) {
    out.push(`<text x="${x}" y="${y}" font-family="Arial, Microsoft YaHei, sans-serif" font-size="${titleSize}" font-weight="900" fill="#1f2937">${escapeXml(line)}</text>`);
    y += titleSize + 10;
  }

  y += 22;
  for (const line of subtitleLines) {
    out.push(`<text x="${x}" y="${y}" font-family="Arial, Microsoft YaHei, sans-serif" font-size="${subtitleSize}" font-weight="500" fill="#4b5563">${escapeXml(line)}</text>`);
    y += subtitleSize + 12;
  }

  if (spec.bullets?.length) {
    y += 30;
    for (const bullet of spec.bullets.slice(0, 4)) {
      out.push(`<rect x="${x}" y="${y - 23}" width="12" height="12" rx="3" fill="#16a34a"/>`);
      out.push(`<text x="${x + 28}" y="${y}" font-family="Arial, Microsoft YaHei, sans-serif" font-size="${wide ? 23 : 28}" font-weight="700" fill="#1f2937">${escapeXml(truncate(bullet, wide ? 24 : 32))}</text>`);
      y += wide ? 40 : 50;
    }
  }

  out.push(`<text x="${x}" y="${spec.height - 54}" font-family="Arial, Microsoft YaHei, sans-serif" font-size="24" font-weight="800" fill="#c2410c">${escapeXml(spec.footer ?? 'AIBoxPro')}</text>`);
  out.push('</svg>');
  return out.join('');
}

async function writePng(file: string, spec: CardSpec) {
  await sharp(Buffer.from(svg(spec))).png().toFile(file);
}

async function writeMarkdown(file: string, content: string) {
  await writeFile(file, `${content.trim()}\n`, 'utf8');
}

async function main() {
  const slug = process.argv[2];
  if (!slug || slug === '--help' || slug === '-h') {
    usage();
    process.exit(slug ? 0 : 1);
  }

  const comparison = await loadComparisonById(slug);
  if (!comparison) throw new Error(`找不到已发布对比页：${slug}`);

  const url = `${BASE}/compare/${comparison.id}`;
  const summary = firstSentence(comparison.summary, `${comparison.toolA.name} 和 ${comparison.toolB.name} 适合不同使用场景。`);
  const verdict = firstSentence(comparison.verdict, summary);
  const sections = extractSections(comparison.body);
  if (sections.length === 0) {
    sections.push(
      { title: '核心结论', text: summary },
      { title: comparison.toolA.name, text: toolLine(comparison.toolA) },
      { title: comparison.toolB.name, text: toolLine(comparison.toolB) },
    );
  }

  const outDir = path.join(process.cwd(), OUTPUT_ROOT, comparison.id);
  const wechatDir = path.join(outDir, 'wechat');
  const xhsDir = path.join(outDir, 'xiaohongshu');
  const zhihuDir = path.join(outDir, 'zhihu');
  await Promise.all([
    mkdir(wechatDir, { recursive: true }),
    mkdir(xhsDir, { recursive: true }),
    mkdir(zhihuDir, { recursive: true }),
  ]);

  await Promise.all([
    writeMarkdown(path.join(wechatDir, 'article.md'), buildWechat({
      title: comparison.title,
      summary,
      verdict,
      url,
      toolA: comparison.toolA.name,
      toolB: comparison.toolB.name,
      sections,
    })),
    writeMarkdown(path.join(xhsDir, 'caption.md'), buildXiaohongshu({
      summary,
      verdict,
      toolA: comparison.toolA.name,
      toolB: comparison.toolB.name,
    })),
    writeMarkdown(path.join(zhihuDir, 'answer.md'), buildZhihu({
      summary,
      verdict,
      url,
      toolA: comparison.toolA.name,
      toolB: comparison.toolB.name,
      toolALine: toolLine(comparison.toolA),
      toolBLine: toolLine(comparison.toolB),
      sections,
    })),
  ]);

  const bullets = [toolLine(comparison.toolA), toolLine(comparison.toolB), verdict];
  await Promise.all([
    writePng(path.join(wechatDir, 'cover.png'), {
      width: 900,
      height: 383,
      eyebrow: '公众号封面',
      title: comparison.title,
      subtitle: summary,
      footer: 'AIBoxPro 工具对比',
    }),
    writePng(path.join(wechatDir, 'inline-1.png'), {
      width: 900,
      height: 620,
      eyebrow: '选型速览',
      title: `${comparison.toolA.name} vs ${comparison.toolB.name}`,
      bullets,
      footer: url,
    }),
    writePng(path.join(xhsDir, 'cover.png'), {
      width: 1242,
      height: 1660,
      eyebrow: '小红书封面',
      title: `${comparison.toolA.name} vs ${comparison.toolB.name}`,
      subtitle: '国内用户怎么选？先看访问、中文、价格和真实工作流。',
      footer: 'AIBoxPro',
    }),
    ...sections.slice(0, 3).map((section, index) => writePng(path.join(xhsDir, `slide-${index + 1}.png`), {
      width: 1080,
      height: 1440,
      eyebrow: `要点 ${index + 1}`,
      title: section.title,
      subtitle: truncate(section.text, 120),
      footer: '完整对比见 AIBoxPro',
    })),
  ]);

  console.log(`已生成草稿包：${path.relative(process.cwd(), outDir)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
