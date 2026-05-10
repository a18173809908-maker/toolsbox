const SOURCE_WEIGHTS: Record<string, number> = {
  '机器之心': 30,
  '量子位': 28,
  'InfoQ 中文 AI': 25,
  '36氪 AI': 23,
  '虎嗅 AI': 20,
  '钛媒体 AI': 18,
  'PingWest 品玩': 16,
};

const TAG_WEIGHTS: Record<string, number> = {
  模型发布: 22,
  产品更新: 18,
  AI公司动态: 14,
  开源项目: 16,
  行业政策: 13,
  融资新闻: 18,
  AI应用案例: 12,
  AI工具更新: 18,
  工具更新: 18,
  产品评测: 18,
  技术研究: 16,
  开发者: 14,
  国内动态: 14,
  行业动态: 14,
};

const KEYWORD_WEIGHTS: Array<[RegExp, number]> = [
  [/(DeepSeek|OpenAI|ChatGPT|Claude|Gemini|Kimi|Sora|GPT-5|GPT|阿里|通义|字节|豆包|腾讯|百度|华为)/i, 18],
  [/(融资|估值|收购|上市|裁员|开源|发布|上线|更新|免费|降价|涨价|封禁|可用)/i, 14],
  [/(大模型|多模态|Agent|智能体|推理|训练|Transformer|芯片|算力|视频生成|图像生成|语音|机器人)/i, 12],
  [/(教程|实测|对比|评测|排行榜|替代|国内|中文|效率|办公|编程|开发者)/i, 8],
];

export function estimateArticleHotness(input: {
  title?: string | null;
  titleZh?: string | null;
  summary?: string | null;
  summaryZh?: string | null;
  tag?: string | null;
  sourceName?: string | null;
}) {
  const text = [
    input.title,
    input.titleZh,
    input.summary,
    input.summaryZh,
    input.tag,
  ].filter(Boolean).join(' ');

  let score = SOURCE_WEIGHTS[input.sourceName ?? ''] ?? 10;
  score += TAG_WEIGHTS[input.tag ?? ''] ?? 0;

  for (const [pattern, weight] of KEYWORD_WEIGHTS) {
    if (pattern.test(text)) score += weight;
  }

  const length = text.replace(/\s/g, '').length;
  if (length > 80) score += 4;
  if (length > 160) score += 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}
