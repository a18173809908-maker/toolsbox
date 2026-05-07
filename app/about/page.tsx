import type { Metadata } from 'next';
import { LegalPage, LegalStyles as S } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: '关于 AIBoxPro',
  description:
    'AIBoxPro 是面向中文用户的 AI 工具决策平台。我们用结构化数据 + 编辑实测，帮你回答"哪个 AI 工具最适合我"。',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <LegalPage
      title="关于 AIBoxPro"
      subtitle="中文用户的 AI 工具决策平台"
    >
      <h2 style={S.h2}>我们做什么</h2>
      <p style={S.p}>
        AIBoxPro 不只是 AI 工具列表。我们针对每个工具回答中文用户最关心的几个问题：
      </p>
      <ul style={S.ul}>
        <li style={S.li}>国内能不能稳定使用？</li>
        <li style={S.li}>中文支持质量怎么样（界面、文档、输出）？</li>
        <li style={S.li}>定价透明吗？人民币参考价是多少？</li>
        <li style={S.li}>有没有更适合的国产替代？</li>
        <li style={S.li}>具体场景下，跟竞品比哪个更合适？</li>
      </ul>

      <h2 style={S.h2}>内容是怎么产出的</h2>
      <p style={S.p}>
        平台采用「自动采集 + 结构化提取 + 编辑审核」的混合工作流：
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={S.strong}>自动采集</strong>：监控 GitHub Trending、Hacker News、
          Product Hunt 等开发者社区，发现新工具
        </li>
        <li style={S.li}>
          <strong style={S.strong}>AI 起草</strong>：用大语言模型为每个工具填写功能描述、
          国内可用性、中文友好度等结构化字段
        </li>
        <li style={S.li}>
          <strong style={S.strong}>编辑审核</strong>：人工核对每条工具的真实状态，
          特别是定价、合规、国内访问这些容易过期的信息。AI 起草不直接发布
        </li>
      </ul>
      <p style={S.p}>
        所有数据字段附带最后更新时间。过期数据在前端用黄色提示标注，不假装永远是最新的。
      </p>

      <h2 style={S.h2}>为什么不是另一个 AI 工具目录</h2>
      <p style={S.p}>
        市面上的 AI 工具站大多在堆砌链接和摘要。这能解决「有哪些工具」的问题，
        但解决不了「哪个最适合我」。
      </p>
      <p style={S.p}>
        AIBoxPro 把内容重心放在三件事：
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={S.strong}>对比页</strong>：Cursor vs Trae、Claude Code vs Codex
          这类高频对比，给出场景化的明确推荐
        </li>
        <li style={S.li}>
          <strong style={S.strong}>替代方案</strong>：海外工具贵 / 不稳定 / 被墙时，
          列出经过验证的国产替代
        </li>
        <li style={S.li}>
          <strong style={S.strong}>AIBoxPro Lab 实测</strong>：选定核心工具做深度评测，
          公开测试方法、环境、样本量，所有结论可复现
        </li>
      </ul>

      <h2 style={S.h2}>联系我们</h2>
      <p style={S.p}>
        想推荐工具收录？请看
        <a href="/submit-guide" style={{ color: S.strong.color, textDecoration: 'underline' }}>
          《工具提交说明》
        </a>
        。
      </p>
      <p style={S.p}>
        发现内容有误、数据过期，或想反馈建议，欢迎通过 GitHub Issue 联系：
        <a
          href="https://github.com/a18173809908-maker/toolsbox/issues"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: S.strong.color, textDecoration: 'underline' }}
        >
          github.com/a18173809908-maker/toolsbox
        </a>
        。
      </p>
    </LegalPage>
  );
}
