import { config } from 'dotenv';
import { writeFile } from 'node:fs/promises';
import { loadAllComparisons } from '@/lib/db/queries';

config({ path: '.env.local' });

type AuditRow = {
  id: string;
  title: string;
  reviewedBy: string;
  chars: number;
  headings: number;
  links: number;
  hasCallout: boolean;
  hasVerdict: boolean;
  hasReferenceSection: boolean;
  risks: string[];
};

const OUTPUT = 'docs/comparison-quality-audit.md';

function countMatches(value: string, pattern: RegExp) {
  return Array.from(value.matchAll(pattern)).length;
}

function auditBody(comparison: Awaited<ReturnType<typeof loadAllComparisons>>[number]): AuditRow {
  const body = comparison.body ?? '';
  const summary = comparison.summary ?? '';
  const verdict = comparison.verdict ?? '';
  const reviewedBy = comparison.reviewedBy ?? '未标记';
  const chars = body.length;
  const headings = countMatches(body, /^#{2,3}\s+/gm);
  const links = countMatches(body, /\[[^\]]+]\([^)]+\)/g);
  const hasCallout = body.includes('本文基于') || summary.includes('本文基于');
  const hasVerdict = verdict.length >= 20 || /编辑结论|一句话/.test(body);
  const hasReferenceSection = /参考资料|资料来源|官方文档|官网/.test(body);
  const risks: string[] = [];

  if (chars < 5000) risks.push('正文偏短，建议补充到标准模板深度');
  if (headings < 7) risks.push('章节少于 7 个，结构可能偏薄');
  if (links < 2) risks.push('外部引用少于 2 个，事实口径需要补来源');
  if (!hasCallout && comparison.isLabReport) risks.push('Lab 报告缺少实测说明');
  if (!hasVerdict) risks.push('缺少明确编辑结论');
  if (!hasReferenceSection) risks.push('缺少参考资料/官方来源段落');
  if (reviewedBy === 'claude-assisted') risks.push('claude-assisted 标记，建议人工复审');

  return {
    id: comparison.id,
    title: comparison.title,
    reviewedBy,
    chars,
    headings,
    links,
    hasCallout,
    hasVerdict,
    hasReferenceSection,
    risks,
  };
}

function statusIcon(row: AuditRow) {
  if (row.risks.length >= 4) return '🔴';
  if (row.risks.length >= 2) return '🟡';
  return '🟢';
}

function renderMarkdown(rows: AuditRow[]) {
  const sorted = [...rows].sort((a, b) => b.risks.length - a.risks.length || a.chars - b.chars);
  const now = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
  const priority = sorted.filter((row) => row.risks.length >= 2);

  return `# 对比页质量自动审计

> 生成日期：${now}
> 来源：Neon \`comparisons\` 表中已发布对比页
> 说明：这是自动检查结果，只用于排序复审优先级；最终内容判断仍需编辑确认。非 Lab 对比页的 doc-based 提示由页面模板统一渲染。

## 复审优先级

${priority.length > 0 ? priority.map((row, index) => `${index + 1}. ${statusIcon(row)} \`${row.id}\` — ${row.risks.join('；')}`).join('\n') : '暂无高优先级风险项。'}

## 明细表

| 状态 | slug | 字符数 | 章节数 | 链接数 | 审核标记 | 风险数 |
|---|---|---:|---:|---:|---|---:|
${sorted.map((row) => `| ${statusIcon(row)} | \`${row.id}\` | ${row.chars} | ${row.headings} | ${row.links} | ${row.reviewedBy} | ${row.risks.length} |`).join('\n')}

## 风险详情

${sorted.map((row) => `### ${statusIcon(row)} ${row.title}

- slug：\`${row.id}\`
- 审核标记：${row.reviewedBy}
- 正文字符数：${row.chars}
- 章节数：${row.headings}
- 外部链接数：${row.links}
- 正文内说明：${row.hasCallout ? '有' : '由页面模板统一渲染'}
- 编辑结论：${row.hasVerdict ? '有' : '无'}
- 参考资料/官方来源：${row.hasReferenceSection ? '有' : '无'}
- 风险：${row.risks.length ? row.risks.join('；') : '暂无明显自动化风险'}
`).join('\n')}
`;
}

async function main() {
  const rows = (await loadAllComparisons()).map(auditBody);
  await writeFile(OUTPUT, renderMarkdown(rows), 'utf8');
  console.log(`已生成 ${OUTPUT}，共审计 ${rows.length} 篇已发布对比页`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
