import type { Metadata } from 'next';
import { LegalPage, LegalStyles as S } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: '工具提交说明',
  description:
    '想推荐 AI 工具收录到 AIBoxPro？请阅读收录标准、提交流程、审核周期与常见问题。',
  alternates: { canonical: '/submit-guide' },
};

export default function SubmitGuidePage() {
  return (
    <LegalPage
      title="工具提交说明"
      subtitle="想推荐一个 AI 工具收录到 AIBoxPro？这里说明收录标准与提交方式。"
      lastUpdated="2026-05-07"
    >
      <div style={S.callout}>
        本页是<strong style={{ ...S.strong, color: 'inherit' }}>说明文档</strong>，
        不是表单页。当前阶段我们通过 GitHub Issue 接收工具推荐，下面会说明具体格式。
      </div>

      <h2 style={S.h2}>收录标准</h2>
      <p style={S.p}>满足以下任一条件的 AI 工具我们都会评估：</p>
      <ul style={S.ul}>
        <li style={S.li}>面向中文用户的国产 AI 工具（豆包、Kimi、DeepSeek、Trae 等同类）</li>
        <li style={S.li}>海外 AI 工具，但在国内有可用性优势或合理使用场景</li>
        <li style={S.li}>开源 AI 工具或 GitHub 趋势项目，有真实用户与活跃 issue</li>
      </ul>

      <p style={S.p}>以下情况通常不收录：</p>
      <ul style={S.ul}>
        <li style={S.li}>非工具的内容（资讯、博客、新闻聚合站）</li>
        <li style={S.li}>已停服或长期无更新（最后版本超过 12 个月）的项目</li>
        <li style={S.li}>纯营销页面，没有实际可用产品</li>
        <li style={S.li}>违反国内法律法规或包含违禁内容的工具</li>
      </ul>

      <h2 style={S.h2}>怎么提交</h2>
      <p style={S.p}>
        前往项目 GitHub 仓库提交 issue：
      </p>
      <p style={S.p}>
        <a
          href="https://github.com/a18173809908-maker/toolsbox/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: S.strong.color, textDecoration: 'underline' }}
        >
          github.com/a18173809908-maker/toolsbox/issues/new
        </a>
      </p>
      <p style={S.p}>issue 标题用「工具推荐：[工具名称]」，正文包含以下信息：</p>
      <ul style={S.ul}>
        <li style={S.li}>工具名称（中英文都给）</li>
        <li style={S.li}>官方网址</li>
        <li style={S.li}>核心功能（1-2 句）</li>
        <li style={S.li}>定价模式（免费 / 免费增值 / 订阅 / 按量）</li>
        <li style={S.li}>国内访问情况（直连 / 需代理 / 受限）</li>
        <li style={S.li}>（可选）你和这个工具的关系：用户 / 团队成员 / 利益相关方</li>
      </ul>

      <h2 style={S.h2}>审核周期</h2>
      <p style={S.p}>
        从你提交到看到工具上线，通常需要 <strong style={S.strong}>1-2 周</strong>。包括：
      </p>
      <ul style={S.ul}>
        <li style={S.li}>编辑核对工具真实性、定价、可用性</li>
        <li style={S.li}>AI 起草工具描述、分类、功能标签</li>
        <li style={S.li}>编辑审核 AI 草稿，修正后发布</li>
      </ul>

      <h2 style={S.h2}>常见问题</h2>

      <p style={S.p}>
        <strong style={S.strong}>Q：可以付费插队加快审核吗？</strong>
      </p>
      <p style={S.p}>
        当前不行。商业化收录入口预计在平台稳定运行后开放，并且会与编辑推荐严格区分标注，
        与免费收录使用相同评分模型。
      </p>

      <p style={S.p}>
        <strong style={S.strong}>Q：被拒绝后能再次提交吗？</strong>
      </p>
      <p style={S.p}>
        可以。如果是工具有较大功能更新或合规状态变化，欢迎重新提交并说明变化。
      </p>

      <p style={S.p}>
        <strong style={S.strong}>Q：收录后能保证一直在线吗？</strong>
      </p>
      <p style={S.p}>
        如果工具方长期停服或我们检测到访问失败超过 30 天，相关条目会被标记为「已下线」，
        可能下架以保护用户体验。
      </p>

      <p style={S.p}>
        <strong style={S.strong}>Q：我的工具描述里有错误怎么办？</strong>
      </p>
      <p style={S.p}>
        在同一个 GitHub Issue 渠道提交修正即可。修正请提供具体字段和正确值，
        以及可证实的来源链接。
      </p>
    </LegalPage>
  );
}
