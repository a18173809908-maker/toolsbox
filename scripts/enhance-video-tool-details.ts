import { config } from 'dotenv';
import { db } from '@/lib/db';
import { tools } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

config({ path: '.env.local' });

const NOW = new Date();

type DetailPatch = {
  id: string;
  pricingDetail: string;
  howToUse: string[];
  faqs: { q: string; a: string }[];
};

const DETAILS: DetailPatch[] = [
  {
    id: 'jimeng-ai',
    pricingDetail: '适合中文创作者先从免费额度试用；会员、点数、商用权益和导出限制以即梦 AI 官方说明为准。',
    howToUse: [
      '访问 jimeng.jianying.com 或打开即梦 App',
      '使用抖音、剪映或手机号登录账号',
      '选择文生视频、图生视频或图片生成入口',
      '生成后可下载素材，或继续导入剪映做剪辑',
    ],
    faqs: [
      { q: '即梦 AI 适合做什么视频？', a: '更适合中文短视频、口播辅助素材、商品氛围图和社媒创意片段，和剪映生态衔接比较方便。' },
      { q: '即梦 AI 国内可以直接用吗？', a: '可以按国内账号体系登录使用，具体免费次数、会员权益和生成排队情况以官方页面为准。' },
      { q: '即梦和可灵怎么选？', a: '如果你主要在抖音、剪映流程里做内容，即梦更顺手；如果更重视镜头控制和 API 入口，可以同时评估可灵。' },
    ],
  },
  {
    id: 'kling-ai',
    pricingDetail: '国内用户可先用免费额度测试；高阶模型、会员权益、API 调用和商用规则以可灵 AI 官方页面为准。',
    howToUse: [
      '访问 klingai.com 或可灵 AI 官方入口',
      '使用手机号、快手或官方支持的方式登录',
      '选择文生视频、图生视频或首尾帧模式',
      '设置比例、时长、镜头运动后提交生成',
    ],
    faqs: [
      { q: '可灵 AI 国内能直连吗？', a: '可灵面向国内用户提供入口，一般不需要 VPN；不同网络环境下的排队、加载和支付体验仍建议实测确认。' },
      { q: '可灵适合哪些场景？', a: '适合中文提示词的视频生成、图生视频、镜头运动控制、产品展示和创意短片原型。' },
      { q: '可灵是否有 API？', a: '可灵提供开发者相关能力，API 开放范围、价格和模型版本需要以官方开发者页面为准。' },
    ],
  },
  {
    id: 'hailuo-ai',
    pricingDetail: '基础生成额度和会员权益会调整；国内用户应以海螺 AI 当前官方页面展示的免费次数、点数和商用规则为准。',
    howToUse: [
      '访问 hailuoai.com 或海螺 AI 官方入口',
      '使用手机号或邮箱完成登录',
      '选择文生视频或图生视频模式',
      '输入中文提示词，生成后下载或继续迭代',
    ],
    faqs: [
      { q: '海螺 AI 适合做什么？', a: '适合快速生成电影感短片、广告创意素材、分镜草稿和图生视频片段。' },
      { q: '海螺 AI 国内使用方便吗？', a: '海螺 AI 面向国内用户可用，登录和访问门槛较低；具体生成速度和排队情况仍会受官方容量影响。' },
      { q: '海螺和 Pika 怎么选？', a: '国内中文创作优先试海螺；如果需要海外社区风格、英文提示词和特效玩法，可以再对比 Pika。' },
    ],
  },
  {
    id: 'runway',
    pricingDetail: 'Runway 采用订阅和 credits 体系；国内用户通常需要确认访问稳定性、海外支付方式和商用授权，以官方 pricing 为准。',
    howToUse: [
      '访问 runwayml.com 并注册账号',
      '进入 Gen 系列视频生成或编辑工作区',
      '上传参考图、视频素材，或输入英文提示词',
      '按 credits 生成、预览、下载或继续编辑',
    ],
    faqs: [
      { q: 'Runway 国内可以直接用吗？', a: '访问稳定性受网络环境影响，生产使用前建议先验证登录、素材上传、生成和下载全流程。' },
      { q: 'Runway 适合什么用户？', a: '更适合需要完整视频创作工作流的创作者和团队，例如图生视频、视频编辑、镜头控制和后期处理。' },
      { q: 'Runway 的主要限制是什么？', a: '主要限制在 credits 成本、海外支付、访问稳定性和不同计划的商用授权差异。' },
    ],
  },
  {
    id: 'sora',
    pricingDetail: 'Sora 的可用入口、额度、模型和 API 权限随 OpenAI 官方策略变化；国内用户通常需要 VPN 和海外支付能力。',
    howToUse: [
      '确认 OpenAI 账号具备 Sora 或视频生成权限',
      '在 Sora 官方入口或 API 文档中选择生成方式',
      '准备提示词、参考素材和视频规格',
      '生成后检查版权、人物、商用和发布限制',
    ],
    faqs: [
      { q: 'Sora 国内能直接访问吗？', a: '通常需要 VPN 或稳定的海外网络环境；账号、地区和套餐权限也会影响可用性。' },
      { q: 'Sora 适合直接替代国内视频工具吗？', a: '不完全适合。Sora 更适合探索复杂镜头和长视频能力，国内日常内容生产仍要考虑访问、支付和协作成本。' },
      { q: 'Sora 有 API 吗？', a: 'OpenAI 提供视频相关 API 能力，但具体模型、权限、价格和地区限制应以官方文档为准。' },
    ],
  },
  {
    id: 'pika',
    pricingDetail: 'Pika 采用免费额度、订阅和生成点数体系；国内用户需要确认网络访问、海外登录方式和支付可用性。',
    howToUse: [
      '访问 pika.art 注册账号',
      '选择文生视频、图生视频或特效模板',
      '输入提示词，必要时上传参考图或视频',
      '生成后预览结果，继续 remix 或下载',
    ],
    faqs: [
      { q: 'Pika 适合做什么内容？', a: '适合短视频特效、图生视频、创意片段、口型同步和社媒玩法测试。' },
      { q: 'Pika 国内使用有什么限制？', a: '主要限制在访问稳定性、海外账号登录、支付方式和生成排队，建议先用免费额度验证。' },
      { q: 'Pika 和 Luma 怎么选？', a: 'Pika 更偏短视频特效和玩法；Luma 更偏图像、视频生成和创意板工作流。' },
    ],
  },
  {
    id: 'luma-dream-machine',
    pricingDetail: 'Luma 采用免费试用、订阅和 API 计费组合；具体额度、Ray 模型、商用授权和价格以官方 plans/API 页面为准。',
    howToUse: [
      '访问 lumalabs.ai 并注册账号',
      '选择 Dream Machine、Ray 或图像/视频生成入口',
      '输入提示词，可加入参考图和风格要求',
      '在 boards 中整理结果，并继续迭代或下载',
    ],
    faqs: [
      { q: 'Luma 更适合哪类视频？', a: '适合图生视频、创意视觉探索、镜头氛围片段和需要参考图一致性的生成任务。' },
      { q: 'Luma 国内使用要注意什么？', a: '要先确认官网访问、账号登录、素材上传和海外支付是否顺畅，生产前建议小样本测试。' },
      { q: 'Luma 有 API 吗？', a: '有开发者 API 能力，模型、价格、速率和可用地区以 Luma 官方文档为准。' },
    ],
  },
  {
    id: 'vidu-ai',
    pricingDetail: 'Vidu 提供订阅和 API credits 计费；国内使用前应确认账号、支付、API 额度和商用授权，以官方 pricing/API 页面为准。',
    howToUse: [
      '访问 vidu.com 注册账号',
      '选择文生视频、图生视频或首尾帧模式',
      '设置比例、时长、参考素材和生成参数',
      '生成后预览、下载，或通过 API 接入工作流',
    ],
    faqs: [
      { q: 'Vidu 的核心优势是什么？', a: '它覆盖文生视频、图生视频、首尾帧和多参考一致性，适合需要结构化视频生成能力的团队。' },
      { q: 'Vidu 国内可以直接用吗？', a: '官网可访问性和支付体验需要按实际网络与账号环境验证；API 使用还要关注 credits 消耗。' },
      { q: 'Vidu 适合个人还是团队？', a: '个人可以试用生成能力；如果要批量生成或集成业务流程，更适合团队评估 API 和成本。' },
    ],
  },
  {
    id: 'higgsfield-ai',
    pricingDetail: 'Higgsfield 的订阅、credits、移动端能力和商用规则可能随官方调整；营销素材生产前需核对当前计划。',
    howToUse: [
      '访问 higgsfield.ai 注册账号',
      '选择 Create Video 或营销创意工作区',
      '上传产品图、人物图或输入创意目标',
      '使用镜头、动作和模板生成社媒视频',
    ],
    faqs: [
      { q: 'Higgsfield 和普通文生视频工具有什么不同？', a: 'Higgsfield 更偏社媒、广告和人物动作创意，适合快速做营销素材和视觉实验。' },
      { q: 'Higgsfield 国内用户要注意什么？', a: '主要确认官网访问、素材上传、模型加载和海外支付是否稳定，批量生产前先小规模测试。' },
      { q: 'Higgsfield 适合电商吗？', a: '适合做产品氛围短片、模特动作参考和广告创意初稿，但最终成片仍建议人工筛选和后期调整。' },
    ],
  },
  {
    id: 'hedra',
    pricingDetail: 'Hedra 使用订阅和 credits 体系；不同模型、视频时长、水印和商用授权以官方 plans 为准。',
    howToUse: [
      '访问 hedra.com 注册账号',
      '选择角色视频、口播或媒体生成入口',
      '上传人物图、音频或输入脚本',
      '选择模型后生成，并按 credits 下载结果',
    ],
    faqs: [
      { q: 'Hedra 适合做数字人吗？', a: '适合做角色口播、人物驱动短片和营销视频，但应注意肖像授权和声音素材合规。' },
      { q: 'Hedra 国内使用有什么门槛？', a: '需要确认访问稳定性、海外支付和生成队列；中文口播效果也建议用真实素材测试。' },
      { q: 'Hedra 和海螺、可灵有什么区别？', a: 'Hedra 更聚焦人物和口播角色；海螺、可灵更偏通用视频生成和镜头画面。' },
    ],
  },
  {
    id: 'descript',
    pricingDetail: 'Descript 按订阅计划提供转写、编辑、AI 配音和协作能力；国内用户需确认访问、上传速度和海外支付。',
    howToUse: [
      '访问 descript.com 注册账号',
      '上传音频或视频素材',
      '等待自动转写后像编辑文档一样剪辑',
      '使用 AI 配音、字幕、翻译或短片生成能力',
    ],
    faqs: [
      { q: 'Descript 是视频生成工具吗？', a: '它更像 AI 视频/音频后期工具，适合播客、访谈、课程、字幕和短视频剪辑。' },
      { q: 'Descript 国内用户适合用吗？', a: '如果能稳定访问并上传素材，它对英文内容后期很方便；中文场景可同时评估剪映等国内工具。' },
      { q: 'Descript 的主要成本在哪里？', a: '成本主要来自订阅、转写/AI 功能额度、团队协作席位和海外支付。' },
    ],
  },
  {
    id: 'pixelle-video',
    pricingDetail: 'Pixelle-Video 是开源研究项目，代码免费；真实成本来自 GPU、模型权重下载、环境配置和推理时间。',
    howToUse: [
      '访问 GitHub 仓库阅读 README',
      '准备 Python、依赖库和 GPU 环境',
      '下载模型权重并配置示例参数',
      '运行示例脚本生成视频样本',
    ],
    faqs: [
      { q: 'Pixelle-Video 适合普通用户吗？', a: '不太适合。它更适合研究者和开发者，需要本地环境、模型权重和 GPU 算力。' },
      { q: 'Pixelle-Video 能商用吗？', a: '需要核对仓库许可证、模型权重许可和训练数据相关限制，不能只看代码开源就默认可商用。' },
      { q: '为什么仍然收录 Pixelle-Video？', a: '它代表开源视频生成方向，适合技术团队评估自部署和模型实验，不是面向普通创作者的一站式产品。' },
    ],
  },
];

async function main() {
  let updated = 0;

  for (const item of DETAILS) {
    const result = await db
      .update(tools)
      .set({
        pricingDetail: item.pricingDetail,
        howToUse: item.howToUse,
        faqs: item.faqs,
        pricingUpdatedAt: NOW,
        featuresUpdatedAt: NOW,
        complianceUpdatedAt: NOW,
      })
      .where(eq(tools.id, item.id));

    updated += result.rowCount ?? 0;
    console.log(`updated ${item.id}`);
  }

  console.log(`Done. Enhanced ${updated} video tool detail pages.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
