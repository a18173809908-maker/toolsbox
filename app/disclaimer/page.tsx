import type { Metadata } from 'next';
import { LegalPage, LegalStyles as S } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: '免责声明',
  description:
    'AIBoxPro 平台数据来自公开信息与编辑实测，仅供参考。本页明确平台对内容准确性、合规判断与决策结果的责任边界。',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="免责声明" lastUpdated="2026-05-07">
      <p style={S.p}>
        AIBoxPro 致力于提供准确的 AI 工具信息，帮助中文用户做出更好的选型决策。
        但 AI 工具市场变化极快，平台无法保证所有数据 100% 准确或实时。
        阅读本声明能帮你正确理解平台信息的边界。
      </p>

      <h2 style={S.h2}>合规状态字段</h2>
      <div style={S.callout}>
        合规状态仅供参考，以工具官方公告及监管机构最新公示为准。AIBoxPro 不对因信息滞后导致的决策损失承担责任。
      </div>
      <p style={S.p}>
        平台标注的「算法备案状态」等合规字段，数据来源包括官方公告、国家互联网信息办公室公示、
        编辑核实等，每条标注最后核实日期。**平台只描述客观状态**（已完成 / 未完成 / 进行中 / 未知），
        不对工具合规性做主观判断。
      </p>
      <p style={S.p}>
        如果你需要在企业级或合规敏感场景中选用工具，请以工具方官方公告与监管机构最新公示为准，
        不要将平台数据作为合规判断的唯一依据。
      </p>

      <h2 style={S.h2}>定价与功能信息</h2>
      <p style={S.p}>
        平台显示的定价、免费额度、功能列表等数据采自工具方公开信息，标注最后更新日期。
        但工具方调价、改套餐、增减功能可能未及时同步到平台。**最终费用与功能以工具方实际页面为准。**
      </p>
      <p style={S.p}>
        过期超过阈值的字段会以黄色提示标注，建议你点击工具官网链接核实最新状态。
      </p>

      <h2 style={S.h2}>国内可用性信息</h2>
      <p style={S.p}>
        平台的「国内访问」标注基于编辑测试时刻的状态。受网络环境、运营商、地理位置、
        工具方配置变化影响，实际可用性可能不同。**任何工具的国内访问稳定性，
        AIBoxPro 都不做长期承诺。**
      </p>

      <h2 style={S.h2}>对比与推荐结论</h2>
      <p style={S.p}>
        平台的对比页和编辑推荐基于公开数据 + 编辑实测得出，包含主观判断成分。
        实际使用体验受你的具体需求、技术栈、网络环境影响，可能与平台结论不一致。
      </p>
      <p style={S.p}>
        AIBoxPro 不为基于平台内容做出的任何采购决策、订阅决策、技术选型决策承担直接或间接责任。
        建议在重要决策前，亲自试用并参考多方信息。
      </p>

      <h2 style={S.h2}>第三方工具与外链</h2>
      <p style={S.p}>
        平台收录的工具是第三方产品。工具方的服务质量、数据安全、用户隐私保护，
        AIBoxPro 不参与、不担保、不承担连带责任。
      </p>
      <p style={S.p}>
        外链点击后你的访问行为受目标站点自己的政策约束。
      </p>

      <h2 style={S.h2}>AIBoxPro Lab 实测报告</h2>
      <p style={S.p}>
        Lab 实测报告会公开测试时间、版本、环境、评测集、样本量等 Methodology Box 信息。
        受测试条件限制，实测结果不代表所有场景下的工具表现。报告中标注的具体数字（如响应延迟、准确率）
        仅在指定条件下成立。
      </p>

      <h2 style={S.h2}>AI 生成内容</h2>
      <p style={S.p}>
        平台部分内容（如工具描述、对比页正文初稿）由大语言模型起草，再经人工审核发布。
        尽管已经过审核，仍可能存在事实错误或表述不准确。**发现错误请通过 GitHub Issue 反馈。**
      </p>

      <h2 style={S.h2}>责任边界总结</h2>
      <p style={S.p}>简而言之：</p>
      <ul style={S.ul}>
        <li style={S.li}>AIBoxPro 提供<strong style={S.strong}>选型参考信息</strong>，不构成任何形式的承诺</li>
        <li style={S.li}>合规状态、定价、可用性等会变化的字段以官方为准</li>
        <li style={S.li}>采购、订阅、合规相关的决策请以工具方官方信息和你的独立判断为依据</li>
        <li style={S.li}>因平台信息错误或滞后导致的损失，AIBoxPro 不承担责任</li>
      </ul>

      <p style={S.p}>
        如果你认为平台某条信息存在严重误导，请通过{' '}
        <a
          href="https://github.com/a18173809908-maker/toolsbox/issues"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: S.strong.color, textDecoration: 'underline' }}
        >
          GitHub Issue
        </a>
        {' '}联系我们，会尽快核实并修正。
      </p>
    </LegalPage>
  );
}
