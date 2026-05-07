import type { Metadata } from 'next';
import { LegalPage, LegalStyles as S } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: '隐私协议',
  description:
    'AIBoxPro 不收集个人身份信息，不要求注册，不在第三方平台投放广告。本协议说明数据收集与第三方服务清单。',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="隐私协议" lastUpdated="2026-05-07">
      <p style={S.p}>
        AIBoxPro 尽量少收集用户数据。我们不要求用户注册、不要求邮箱、不在第三方平台投放再营销广告。
        本页说明现阶段会用到哪些技术服务，以及它们各自接触哪些数据。
      </p>

      <h2 style={S.h2}>本站不收集哪些数据</h2>
      <ul style={S.ul}>
        <li style={S.li}>不收集个人身份信息（姓名、手机号、身份证号等）</li>
        <li style={S.li}>不要求账号注册</li>
        <li style={S.li}>不投放第三方追踪 cookie</li>
        <li style={S.li}>不收集你访问过的其他网站</li>
      </ul>

      <h2 style={S.h2}>本站使用的第三方服务</h2>
      <p style={S.p}>
        以下服务在你访问 AIBoxPro 时会被触发，每个服务接触的数据范围由该服务自己的隐私政策约束：
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={S.strong}>Vercel</strong>（部署与 CDN）：
          可能记录访问 IP、User-Agent 等基础日志，用于安全防护与性能优化
        </li>
        <li style={S.li}>
          <strong style={S.strong}>Vercel Analytics</strong>（匿名访问统计）：
          统计页面浏览量、设备类型、地理大区，**不记录个人 ID 或可识别身份的信息**
        </li>
        <li style={S.li}>
          <strong style={S.strong}>Neon Postgres</strong>（数据库）：
          仅存储平台自身的工具、对比、资讯数据，不存储任何用户行为
        </li>
        <li style={S.li}>
          <strong style={S.strong}>DuckDuckGo Favicon API</strong>（工具图标）：
          浏览器从 DuckDuckGo 加载工具网站的小图标。该请求由你的浏览器直接发起，
          AIBoxPro 不参与
        </li>
        <li style={S.li}>
          <strong style={S.strong}>DeepSeek API</strong>（AI 起草后端）：
          仅在编辑触发起草时调用，处理的是工具公开数据，不传输任何用户访问数据
        </li>
      </ul>

      <h2 style={S.h2}>Cookie 使用</h2>
      <p style={S.p}>
        当前站点不使用功能性以外的 cookie。后续如果上线后台审核或个性化推荐功能，
        会在使用 cookie 时单独说明。
      </p>

      <h2 style={S.h2}>数据保留</h2>
      <p style={S.p}>
        访问日志由 Vercel 自动管理，按其默认策略保留。
        平台不主动收集和存储用户行为数据，因此没有「用户数据」需要由我方保留或销毁。
      </p>

      <h2 style={S.h2}>第三方链接</h2>
      <p style={S.p}>
        AIBoxPro 收录的工具会指向第三方网站（如工具官网、GitHub 仓库等）。
        点击外链后你的访问行为受目标站点自己的隐私政策约束，与 AIBoxPro 无关。
      </p>

      <h2 style={S.h2}>政策更新</h2>
      <p style={S.p}>
        如本协议有更新，会修改顶部「最后更新」日期。建议关注上线版本的最新内容。
      </p>
    </LegalPage>
  );
}
