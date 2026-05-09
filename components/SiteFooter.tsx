'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { v2Tokens as T } from '@/lib/tokens';
import { BrandLogo } from '@/components/BrandLogo';

const C = {
  bg:       '#FFF7ED',
  ink:      '#1F2937',
  inkSoft:  '#4B5563',
  inkMuted: '#6B7280',
  rule:     '#E8D5B7',
  ruleSoft: '#F3E8D0',
};

type FooterLink = { label: string; href: string; external?: boolean };

const productLinks: FooterLink[] = [
  { label: '工具库', href: '/tools' },
  { label: '工具对比', href: '/compare' },
  { label: '开发者趋势', href: '/trending' },
  { label: '工具动态', href: '/news' },
];

const legalLinks: FooterLink[] = [
  { label: '关于 AIBoxPro', href: '/about' },
  { label: '工具提交说明', href: '/submit-guide' },
  { label: '隐私协议', href: '/privacy' },
  { label: '免责声明', href: '/disclaimer' },
];

const contactLinks: FooterLink[] = [
  { label: '邮箱 4514407@qq.com', href: 'mailto:4514407@qq.com' },
  { label: '微信公众号 aiboxprocn', href: '/about#contact' },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3
        style={{
          margin: '0 0 12px',
          color: C.ink,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.inkSoft, fontSize: 14, textDecoration: 'none' }}
              >
                {link.label} ↗
              </a>
            ) : (
              <Link
                href={link.href}
                style={{ color: C.inkSoft, fontSize: 14, textDecoration: 'none' }}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 全站统一页脚。出现在所有公共页面（主页、工具库、对比页、合规页等）底部。
 * 提供合规页入口（之前合规页只在 sitemap 中，没有从 UI 进入的路径）。
 *
 * 在 /admin/* 路径下隐藏（后台不需要公共站文案）。
 */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer
      style={{
        marginTop: 'auto',
        background: T.panel,
        borderTop: `1px solid ${C.rule}`,
        fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: 'clamp(28px, 5vw, 44px) clamp(20px, 5vw, 56px) 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
          gap: 32,
          alignItems: 'start',
        }}
      >
        <div style={{ maxWidth: 320 }}>
          <div style={{ marginBottom: 12 }}>
            <BrandLogo size={30} />
          </div>
          <p style={{ margin: 0, color: C.inkSoft, fontSize: 13, lineHeight: 1.7 }}>
            中文用户的 AI 工具决策平台。比较价格、中文支持、国内可用情况，帮你更快决定用哪个。
          </p>
        </div>

        <FooterColumn title="产品" links={productLinks} />
        <FooterColumn title="说明" links={legalLinks} />
        <FooterColumn title="联系" links={contactLinks} />
      </div>

      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '18px clamp(20px, 5vw, 56px) 28px',
          borderTop: `1px solid ${C.ruleSoft}`,
          color: C.inkMuted,
          fontSize: 12,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span>© {new Date().getFullYear()} AIBoxPro</span>
        <span>所有数据仅供参考，详见<Link href="/disclaimer" style={{ color: C.inkSoft, textDecoration: 'underline' }}>免责声明</Link></span>
      </div>
    </footer>
  );
}
