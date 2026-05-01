'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { v2Tokens as T } from '@/lib/tokens';

type SiteHeaderProps = {
  onOpenPalette?: () => void;
};

const navItems: [string, string][] = [
  ['首页', '/'],
  ['GitHub 趋势', '/trending'],
  ['AI 资讯', '/news'],
];

export function SiteHeader({ onOpenPalette }: SiteHeaderProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      padding: '16px clamp(20px, 4vw, 56px)',
      borderBottom: `1px solid ${T.rule}`,
      background: T.panel,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${T.primary} 0%, #FBBF24 100%)`,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontFamily: 'Georgia, serif',
          fontWeight: 900,
          fontSize: 17,
          fontStyle: 'italic',
        }}>
          A
        </div>
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 18, color: T.ink }}>
          AiToolsBox
        </span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 14, flex: 1 }}>
        {navItems.map(([label, href]) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: '7px 14px',
                borderRadius: 6,
                color: active ? T.ink : T.inkSoft,
                fontWeight: active ? 700 : 500,
                background: active ? T.primaryBg : 'transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {onOpenPalette ? (
        <button
          type="button"
          onClick={onOpenPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 13px',
            background: T.bg,
            borderRadius: 8,
            border: `1px solid ${T.rule}`,
            fontSize: 13,
            color: T.inkMuted,
            cursor: 'pointer',
            fontFamily: 'inherit',
            flexShrink: 0,
          }}
        >
          <span>⌘K</span>
          <span>搜索</span>
        </button>
      ) : (
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 13px',
            background: T.bg,
            borderRadius: 8,
            border: `1px solid ${T.rule}`,
            fontSize: 13,
            color: T.inkMuted,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          ⌘K 搜索
        </Link>
      )}
    </header>
  );
}
