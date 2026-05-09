/**
 * Sprint 3 K2/K3: publish the first doc-based AI video comparison pages.
 * 运行：npm run seed:video-comparisons
 */
import { config } from 'dotenv';
import { db } from '@/lib/db';
import { comparisons } from '@/lib/db/schema';

config({ path: '.env.local' });

type Page = {
  id: string;
  toolAId: string;
  toolBId: string;
  title: string;
  summary: string;
  verdict: string;
  seoKeywords: string[];
  a: {
    name: string;
    positioning: string;
    access: string;
    pricing: string;
    strengths: string[];
    bestFor: string[];
    caveat: string;
    sources: { label: string; url: string }[];
  };
  b: Page['a'];
  scenario: string;
  recommendation: string;
  workflow: string;
};

const PAGES: Page[] = [
  {
    id: 'jimeng-vs-kling',
    toolAId: 'jimeng-ai',
    toolBId: 'kling-ai',
    title: '即梦 vs 可灵：国产 AI 视频工具怎么选',
    summary: '即梦更适合中文创作者的低门槛短视频素材和剪映生态工作流；可灵更适合需要运镜控制、首尾帧、API 和更强视频生成专门能力的团队。',
    verdict: '轻量创作和剪映生态优先即梦；更重视视频生成控制、API 和专业化视频工作流优先可灵。',
    seoKeywords: ['即梦和可灵区别', '即梦 vs 可灵', '国产 AI 视频工具', 'AI 视频生成国内'],
    a: {
      name: '即梦',
      positioning: '字节跳动旗下 AI 创作平台，覆盖图片生成、视频生成和剪映生态协同，更像中文创作者的一站式素材入口。',
      access: '国内直连，中文界面，适合抖音、剪映和中文内容创作者上手。',
      pricing: '基础额度和高级权益以即梦官方说明为准，不建议在内容中写死长期价格。',
      strengths: ['中文提示词门槛低', '图片与视频能力放在同一入口', '适合短视频素材', '与剪映生态衔接'],
      bestFor: ['短视频创作者', '运营和内容团队', '需要先做图再做视频的用户', '剪映重度用户'],
      caveat: '更适合作为创作入口和素材工作台；如果任务高度依赖专业视频参数、API 或多轮批量生成，需要继续评估可灵等更专门的视频工具。',
      sources: [
        { label: '即梦官网', url: 'https://jimeng.jianying.com' },
        { label: '剪映官网', url: 'https://www.capcut.cn' },
      ],
    },
    b: {
      name: '可灵',
      positioning: '快手推出的 AI 视频生成工具，围绕文生视频、图生视频、首尾帧、运镜控制和开发者 API 展开。',
      access: '国内直连，中文界面，注册和支付路径对国内用户友好。',
      pricing: '基础额度、高级模型、会员和 API 价格以可灵官方页面为准。',
      strengths: ['文生视频', '图生视频', '首尾帧控制', 'API 接入'],
      bestFor: ['AI 视频专项创作者', '广告和产品展示团队', '需要批量生成的团队', '开发者和自动化工作流'],
      caveat: '视频质量和稳定性必须用真实 prompt 实测，本文不做画质排名。',
      sources: [
        { label: '可灵官网', url: 'https://klingai.com' },
        { label: '可灵 API 入口', url: 'https://app.klingai.com/cn/dev' },
      ],
    },
    scenario: '这篇适合正在选择国产 AI 视频工具的内容创作者、短视频运营、广告素材团队和开发者。两者都能国内使用，但产品气质不同：即梦偏创作入口，可灵偏视频生成专门工具。',
    recommendation: '如果你只想快速做中文短视频素材、封面、脚本视觉化和剪映后期联动，先试即梦；如果你已经明确要做文生视频、图生视频、首尾帧、批量生成或 API 集成，先试可灵。',
    workflow: '建议用同一组中文 prompt 分别测试人物动作、产品展示和镜头移动三类场景。记录能否稳定生成、是否容易修改、是否方便导入剪辑工具、是否支持团队批量流程。',
  },
  {
    id: 'sora-vs-kling',
    toolAId: 'sora',
    toolBId: 'kling-ai',
    title: 'Sora vs 可灵：长视频想象力和国内可用性怎么选',
    summary: 'Sora 代表 OpenAI 视频生态和复杂场景生成方向，但国内通常需要海外账号与网络条件；可灵更适合国内创作者和团队直接落地。',
    verdict: '探索 OpenAI 视频生态和前沿生成能力看 Sora；国内生产、中文团队协作和可控上线优先可灵。',
    seoKeywords: ['Sora 替代品', 'Sora vs 可灵', '可灵 Sora', 'AI 视频生成国内'],
    a: {
      name: 'Sora',
      positioning: 'OpenAI 的视频生成产品，面向提示词、素材上传、视频生成和 remix 等 OpenAI 生态能力。',
      access: '中国大陆通常需要 VPN 或稳定代理，并依赖 OpenAI 账号与套餐可用性。',
      pricing: '随 OpenAI / Sora 官方套餐变化，通常需要海外支付方式。',
      strengths: ['OpenAI 生态', '复杂场景生成', '视频 remix', '多素材输入'],
      bestFor: ['关注前沿视频模型的人', '已有 OpenAI 账号的创作者', '海外团队', '研究和概念验证'],
      caveat: '国内账号、网络、支付和内容合规门槛较高，不适合作为多数国内团队的默认生产入口。',
      sources: [
        { label: 'Sora 官网', url: 'https://sora.com' },
        { label: 'OpenAI Sora 帮助文档', url: 'https://help.openai.com/en/articles/9957612-generating-videos-on-sora' },
      ],
    },
    b: {
      name: '可灵',
      positioning: '国产 AI 视频生成工具，强调文生视频、图生视频、首尾帧、运镜控制和 API。',
      access: '国内直连，中文界面，适合国内内容团队和开发者直接测试。',
      pricing: '基础额度、高级模型、会员和 API 以可灵官方页面为准。',
      strengths: ['国内直连', '中文界面', '图生视频', '开发者 API'],
      bestFor: ['国内短视频团队', '广告素材团队', '电商内容团队', '需要可持续生产的团队'],
      caveat: '如果要判断画质、运动稳定性和复杂镜头能力，仍需针对自己的素材做实测。',
      sources: [
        { label: '可灵官网', url: 'https://klingai.com' },
        { label: '可灵开发者入口', url: 'https://app.klingai.com/cn/dev' },
      ],
    },
    scenario: 'Sora vs 可灵的核心不是“谁一定更强”，而是前沿模型探索和国内生产落地之间的选择。Sora 更适合研究 OpenAI 视频生态；可灵更适合国内团队直接做项目。',
    recommendation: '国内团队如果要做真实业务素材，先用可灵跑通流程；已经有海外账号、预算和网络环境，并且目标是探索 OpenAI 视频能力，再评估 Sora。',
    workflow: '建议先拆成两组测试：一组验证访问、支付、账号、团队协作；另一组用相同 prompt 生成 6-10 个样本，记录失败率、等待时间、可编辑性和人工返工量。',
  },
  {
    id: 'hailuo-vs-pika',
    toolAId: 'hailuo-ai',
    toolBId: 'pika',
    title: '海螺 vs Pika：短视频生成和创意特效怎么选',
    summary: '海螺更适合国内用户做电影感短片、广告素材和中文视频生成；Pika 更适合海外创作者探索创意特效、口型同步和短视频玩法。',
    verdict: '国内短片和广告素材优先海螺；特效玩法、海外创作社区和 Pika 生态优先 Pika。',
    seoKeywords: ['海螺 AI 视频', 'Pika 替代品', '海螺 vs Pika', 'AI 短视频生成'],
    a: {
      name: '海螺',
      positioning: 'MiniMax 推出的 AI 视频生成工具，面向文生视频、图生视频、电影感短片和创意素材。',
      access: '国内直连，中文体验更友好，适合国内创作者直接上手。',
      pricing: '基础额度和高级权益以海螺官方说明为准。',
      strengths: ['文生视频', '图生视频', '电影感画面', '中文创作入口'],
      bestFor: ['中文短片创作者', '广告素材团队', '产品展示', '内容运营'],
      caveat: '本文不对画质做无样本排名；电影感、人物一致性和镜头稳定性要看具体 prompt。',
      sources: [
        { label: '海螺官网', url: 'https://hailuoai.com' },
        { label: 'MiniMax 官网', url: 'https://www.minimaxi.com' },
      ],
    },
    b: {
      name: 'Pika',
      positioning: '海外 AI 短视频生成平台，覆盖文生视频、图生视频、视频特效、口型同步和创意短片玩法。',
      access: '国内可访问性受网络环境影响，付费通常依赖海外支付方式。',
      pricing: '订阅和 credits 以 Pika 官方 pricing 为准。',
      strengths: ['文生视频', '图生视频', '视频特效', '口型同步'],
      bestFor: ['海外创作者', '特效短片', '社媒玩法', '口型同步内容'],
      caveat: '如果团队在国内生产，需要先确认访问稳定性、支付方式和素材合规要求。',
      sources: [
        { label: 'Pika 官网', url: 'https://pika.art' },
        { label: 'Pika pricing', url: 'https://pika.art/pricing' },
      ],
    },
    scenario: '海螺和 Pika 都适合短视频，但入口不同。海螺更像国内可用的视频生成工具，Pika 更像海外社媒创意和特效玩法平台。',
    recommendation: '国内用户和中文商业素材优先海螺；如果你追求 Pika 的特效、口型同步、海外社区玩法，且能接受网络和支付门槛，再选择 Pika。',
    workflow: '建议用“产品广告、人物口播、风格化特效”三类任务试用。不要只看单个样片，至少每类生成两次，记录可用片段比例和人工修改成本。',
  },
  {
    id: 'runway-vs-sora-cinematic',
    toolAId: 'runway',
    toolBId: 'sora',
    title: 'Runway vs Sora：电影级 AI 视频工作流怎么选',
    summary: 'Runway 更像成熟的视频创作平台，适合团队工作流、编辑和 Gen-4 系列能力；Sora 更像 OpenAI 视频生态入口，适合探索前沿生成和 remix。',
    verdict: '需要可落地的创作平台和团队流程先看 Runway；想探索 OpenAI 视频生态和 Sora 模型能力再看 Sora。',
    seoKeywords: ['Runway 和 Sora', 'Runway vs Sora', 'Sora 替代品', 'AI 电影级视频'],
    a: {
      name: 'Runway',
      positioning: 'AI 视频创作平台，覆盖生成、编辑、资产管理、团队协作和 Gen-4 / Gen-4 Turbo 等视频模型工作流。',
      access: '国内可访问性受网络环境影响，付费通常需要海外支付方式。',
      pricing: 'Runway 官方 pricing 显示有免费、Standard、Pro、Unlimited 等计划，credits 和模型消耗以官网为准。',
      strengths: ['Gen-4 视频', '视频编辑', '团队工作区', '运动控制'],
      bestFor: ['专业创作者', '广告团队', '视频制作团队', '需要编辑工作流的团队'],
      caveat: 'Runway 的强项是平台化工作流，但具体画质和成本要按模型、时长、credits 和团队套餐计算。',
      sources: [
        { label: 'Runway 官网', url: 'https://runwayml.com' },
        { label: 'Runway pricing', url: 'https://runwayml.com/pricing' },
        { label: 'Runway Gen-4 docs', url: 'https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video' },
      ],
    },
    b: {
      name: 'Sora',
      positioning: 'OpenAI 的视频生成产品，面向提示词生成、素材输入、视频 remix 和 OpenAI 账号生态。',
      access: '中国大陆通常需要 VPN 或稳定代理，并依赖 OpenAI 账号、套餐和地区可用性。',
      pricing: '随 OpenAI / Sora 官方套餐变化，具体以 Sora 和 OpenAI 帮助文档为准。',
      strengths: ['OpenAI 生态', '视频生成', 'Remix', '复杂场景'],
      bestFor: ['前沿模型探索', '已有 OpenAI 套餐用户', '海外创作者', '研究型试验'],
      caveat: '国内团队不应只看模型想象力，还要确认账号、网络、支付、版权和内容安全流程。',
      sources: [
        { label: 'Sora 官网', url: 'https://sora.com' },
        { label: 'OpenAI Sora 帮助文档', url: 'https://help.openai.com/en/articles/9957612-generating-videos-on-sora' },
      ],
    },
    scenario: 'Runway vs Sora 更像“成熟创作平台”与“前沿模型生态”的对比。一个偏工作流，一个偏生成能力探索；没有实测样本前，不应该下绝对画质结论。',
    recommendation: '广告、品牌、团队制作和可管理工作流优先 Runway；探索 OpenAI 视频模型、remix 和前沿能力优先 Sora。国内团队若要生产落地，还应同步评估可灵、海螺、即梦等直连方案。',
    workflow: '建议把评估分成平台能力和生成质量两层。平台能力看资产、协作、计费、导出、编辑；生成质量用同一组 prompt 和参考图实测，记录可用率和返工成本。',
  },
];

function sourceList(page: Page) {
  const seen = new Set<string>();
  return [...page.a.sources, ...page.b.sources]
    .filter((source) => {
      if (seen.has(source.url)) return false;
      seen.add(source.url);
      return true;
    })
    .map((source) => `- [${source.label}](${source.url})`)
    .join('\n');
}

function renderBody(page: Page) {
  const aStrengths = page.a.strengths.join('、');
  const bStrengths = page.b.strengths.join('、');
  const aBest = page.a.bestFor.map((item) => `- ${item}`).join('\n');
  const bBest = page.b.bestFor.map((item) => `- ${item}`).join('\n');

  return `## 核心差异速览

| 维度 | ${page.a.name} | ${page.b.name} |
|---|---|---|
| 产品定位 | ${page.a.positioning} | ${page.b.positioning} |
| 国内可用性 | ${page.a.access} | ${page.b.access} |
| 价格口径 | ${page.a.pricing} | ${page.b.pricing} |
| 核心能力 | ${aStrengths} | ${bStrengths} |
| 更适合 | ${page.a.bestFor.slice(0, 2).join('、')} | ${page.b.bestFor.slice(0, 2).join('、')} |

## 编辑结论

${page.summary}

一句话：**${page.verdict}**

本文是 doc-based 对比，基于官网、帮助中心、公开定价页和产品入口整理，不包含 AIBoxPro Lab 实测数据。视频生成工具的画质、运动稳定性、人物一致性、等待时间和失败率高度依赖 prompt、素材、模型版本、账号套餐和当日排队状态；没有固定样本测试前，不应写成绝对排名。

## 1. 适用场景

${page.scenario}

对视频工具来说，用户真正要决策的不是“哪个样片更好看”，而是能不能稳定嵌入自己的内容流程。一个工具即使展示片很强，如果注册困难、支付不便、无法稳定打开、导出限制多或团队协作弱，也很难成为日常生产工具。反过来，一个工具即使前沿感没有那么强，只要中文入口、生成流程、素材管理和后期衔接顺畅，对国内团队就可能更有价值。

## 2. 产品定位

${page.a.name}：${page.a.positioning}

${page.b.name}：${page.b.positioning}

判断定位时，不要只看首页宣传词。视频工具至少要拆成四层：生成模型、编辑工作流、资产管理、团队/开发者能力。有的产品偏模型，有的偏创作者工作台，有的偏 API，有的偏社媒玩法。只有把自己的任务放进去，定位差异才会变清楚。

## 3. 生成入口与工作流

${page.a.name} 的主要优势是 ${aStrengths}。如果你的任务和这些能力高度重合，试用优先级就应该提高。${page.a.caveat}

${page.b.name} 的主要优势是 ${bStrengths}。如果你的任务更依赖这些能力，它会更值得先试。${page.b.caveat}

视频工具的工作流通常包括：写 prompt、上传参考图或参考视频、选择比例和时长、等待生成、筛选可用片段、导出到剪辑工具、人工补字幕/音效/包装。任何一步卡住，都会影响真实效率。所以评估时不要只看生成按钮，而要看完整链路。

## 4. 国内可用性

${page.a.name}：${page.a.access}

${page.b.name}：${page.b.access}

国内可用性要拆成访问、注册、支付、生成排队、下载、商用条款六项。尤其是海外工具，即使官网能打开，也可能在支付、账号风控、素材上传、视频下载或团队协作上遇到门槛。国产工具通常在中文入口和支付上更友好，但仍要关注素材合规、版权、商用授权和账号安全。

## 5. 价格与额度

${page.a.name} 的价格口径：${page.a.pricing}

${page.b.name} 的价格口径：${page.b.pricing}

视频生成的成本不能只看月费。更合理的算法是：每条可用视频需要生成多少次、每次多长、是否需要高清、是否需要去水印、是否需要多人协作、是否需要 API、失败片段是否也消耗额度。对商业团队来说，单条可用素材成本 = 生成成本 + 人工筛选成本 + 后期修改成本 + 不可用片段浪费。

## 6. 谁应该选 ${page.a.name}

${aBest}

如果这些描述符合你的真实需求，${page.a.name} 可以作为第一试用对象。但建议先用 3-5 个真实任务跑一轮，不要只看官方样片。官方样片往往经过挑选，真实业务里 prompt、素材、审核、比例、时长和品牌限制会让难度上升。

## 7. 谁应该选 ${page.b.name}

${bBest}

如果这些描述更接近你的工作流，${page.b.name} 更值得优先试。尤其是团队使用时，要让实际负责剪辑、运营、投放或产品展示的人参与测试，而不是只由一个人看效果截图做判断。

## 8. 推荐选择

${page.recommendation}

如果预算有限，建议先不要同时订阅多个视频工具。先选一个最贴近日常流程的工具跑通 7 天，再根据缺口补第二个工具。常见组合是：一个国内直连工具负责日常生产，一个海外工具负责探索特殊风格或前沿能力。

## 9. 实操测试方法

${page.workflow}

推荐使用三类 prompt：人物动作、产品展示、镜头运动。每类至少生成两次，不要只拿最好的一个样片比较。记录以下字段：生成是否成功、等待时间、是否需要重试、人物/产品是否变形、镜头是否按要求移动、下载是否顺利、后期还要改多少。这样得到的结论才适合自己的团队。

## 10. 常见误区

第一，不要把官方 demo 当成平均水平。视频生成的波动比文本生成更明显，失败样本和返工成本必须纳入评估。

第二，不要只比较“画质”。视频工具还要看镜头可控性、角色一致性、时长、比例、批量能力、导出水印、商用授权和后期衔接。

第三，不要忽略合规。上传人物肖像、品牌素材、客户产品、影视片段和音乐时，需要确认自己是否有使用权。AI 视频生成不等于自动获得商用授权。

## 11. 团队落地检查清单

- 账号：是否支持团队账号、多人协作、权限和额度控制。
- 网络：是否能稳定访问、上传素材、等待生成和下载视频。
- 成本：免费额度、订阅、credits、失败重试、高清导出是否可接受。
- 质量：人物、产品、文字、动作、镜头和风格是否稳定。
- 后期：是否方便进入剪映、Premiere、Final Cut、CapCut 或内部剪辑流程。
- 合规：人物肖像、品牌素材、音乐和商业授权是否可控。
- 复盘：是否能保存 prompt、参数、素材、生成结果和失败原因。

## 12. 评分维度建议

如果要把这两个工具放进团队选型表，不建议只给一个总分。更好的方式是按维度打分，每个维度 1-5 分，并保留备注：

| 维度 | 说明 |
|---|---|
| 访问稳定性 | 官网、素材上传、生成排队、下载是否顺畅 |
| 中文上手 | 中文提示词、中文界面、中文帮助文档是否友好 |
| 生成控制 | 是否支持参考图、首尾帧、镜头运动、比例、时长 |
| 返工成本 | 失败样本比例、重试次数、后期修补量 |
| 商业使用 | 去水印、授权、团队管理、品牌素材合规 |
| 成本可控 | credits 消耗是否透明，是否方便估算单条可用视频成本 |

这样做的好处是：即使一个工具画面更惊艳，也不会掩盖访问、成本、协作和合规的短板。视频工具真正进入生产后，稳定性往往比单次惊艳更重要。

## 13. 发布前检查

在把 AI 视频用于公众号、小红书、抖音、B 站、广告投放或客户项目之前，建议做一次发布前检查：

- 是否使用了他人肖像、商标、影视片段或未授权音乐。
- 画面里是否出现变形文字、错误 Logo、奇怪手指、产品结构错误。
- 是否需要标注 AI 生成或遵守平台对 AI 内容的披露要求。
- 是否保留了 prompt、素材、生成时间和版本，方便复盘或处理争议。
- 是否有人工审核最终成片，尤其是医疗、金融、教育、法律等高风险内容。

这部分工作看起来不如“生成”酷，但它决定了 AI 视频能不能进入真实业务。很多团队的瓶颈不是不会生成，而是生成后没有审核、归档和责任边界。

## 14. 工具组合建议

如果你还没有固定工作流，可以先用“两层工具组合”：

第一层是国内直连工具，负责日常生产、中文 prompt、快速试错和团队协作。它不一定每个样片都最惊艳，但要稳定、好访问、好沟通、好复盘。

第二层是海外或前沿工具，负责探索特殊风格、复杂镜头、创意特效和模型能力边界。它可以不作为默认生产入口，但可以在关键项目里提供风格突破。

对于多数国内团队，先跑通第一层，再引入第二层，比一开始就追逐最前沿模型更稳。视频生成是高消耗任务，工具越多，管理成本越高。

## 15. FAQ

**这篇有没有真实画质测试？**  
没有。本文是基于官方资料和公开产品信息的 doc-based 对比，不包含 AIBoxPro Lab 实测。画质、速度和稳定性需要后续用固定 prompt 实测。

**能不能直接按本文结论付费？**  
不建议。先用免费额度或短周期套餐跑真实任务，再决定是否长期订阅。视频工具消耗快，试错成本比文本工具高。

**国内团队是否一定选国产工具？**  
不一定。国内工具在访问、中文和支付上更友好；海外工具可能在某些风格、生态或工作流上更有优势。最稳妥的是一个国内生产工具 + 一个海外探索工具的组合。

## 16. 后续 Lab 应该怎么测

这篇先不做实测排名，但后续如果升级为 AIBoxPro Lab，可以沿用同一套样本。建议准备三组固定 prompt：一组人物动作，例如“年轻设计师走进工作室，镜头从侧面缓慢推进”；一组产品展示，例如“桌面上的智能手表旋转展示，柔和棚拍灯光”；一组镜头运动，例如“无人机穿过城市街道，傍晚霓虹反光”。每个工具每组 prompt 生成两次，保留成功和失败样本。

记录维度包括：生成等待时间、失败次数、人物或产品变形、镜头是否按要求移动、文字和 Logo 是否出错、下载格式、是否带水印、是否能继续编辑。最终不要只选最好看的片段，而要计算“可用片段比例”和“人工返工量”。这比单纯展示一条惊艳样片更能帮助读者判断真实生产价值。

## 17. 为什么不直接给画质排名

视频模型的结果波动很大，同一条 prompt 在不同时间、不同模型版本、不同套餐和不同排队状态下都可能变化。直接写“某工具画质第一”很容易误导读者。更负责任的做法是把判断拆开：画面质感、运动稳定性、人物一致性、产品还原、镜头控制、中文理解、成本、访问和后期衔接分别评估。本文先给选型框架，后续 Lab 再用固定样本给可复核结论。

对中文团队来说，还要额外看提示词复用和团队交接。一个成员写出的 prompt，其他成员能否理解、复用、微调，决定了工具能不能从个人试用变成团队资产。

建议把最终采用的 prompt、参考图、生成参数和成片链接放进同一张表，后续复盘会轻松很多。

如果多人协作，还应记录是谁生成、谁审核、谁剪辑，避免后续无法追溯素材来源和责任。

## 参考资料

${sourceList(page)}`;
}

async function main() {
  const now = new Date();
  let upserted = 0;

  for (const page of PAGES) {
    const body = renderBody(page);
    await db
      .insert(comparisons)
      .values({
        id: page.id,
        toolAId: page.toolAId,
        toolBId: page.toolBId,
        title: page.title,
        summary: page.summary,
        body,
        verdict: page.verdict,
        seoKeywords: page.seoKeywords,
        status: 'published',
        publishedAt: now,
        reviewedBy: 'admin',
        reviewedAt: now,
        isLabReport: false,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: comparisons.id,
        set: {
          toolAId: page.toolAId,
          toolBId: page.toolBId,
          title: page.title,
          summary: page.summary,
          body,
          verdict: page.verdict,
          seoKeywords: page.seoKeywords,
          status: 'published',
          publishedAt: now,
          reviewedBy: 'admin',
          reviewedAt: now,
          isLabReport: false,
          updatedAt: now,
        },
      });
    upserted++;
    console.log(`published ${page.id} (${body.length} chars)`);
  }

  console.log(`Done. Published ${upserted} video comparison pages.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
