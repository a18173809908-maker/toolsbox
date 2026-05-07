'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { v2Tokens as T } from '@/lib/tokens';

type SiteHeaderProps = {
  onOpenPalette?: () => void;
};

const navItems: Array<{ label: string; href: string }> = [
  { label: '首页', href: '/' },
  { label: '工具库', href: '/tools' },
  { label: '对比', href: '/compare' },
  { label: '开发者趋势', href: '/trending' },
  { label: '工具动态', href: '/news' },
];

export function SiteHeader({ onOpenPalette }: SiteHeaderProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 10 : 24,
        padding: isMobile ? '12px 16px' : '16px clamp(20px, 4vw, 56px)',
        borderBottom: `1px solid ${T.rule}`,
        background: T.panel,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        <div
          style={{
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
          }}
        >
          A
        </div>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: isMobile ? 16 : 18,
            color: T.ink,
          }}
        >
          AIBoxPro
        </span>
      </Link>

      <nav
        style={{
          display: isMobile ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          fontSize: 14,
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
              {item.label}
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
          {!isMobile && <span>搜索</span>}
        </button>
      ) : (
        <Link
          href="/tools"
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
          {isMobile ? '⌘K' : '⌘K 搜索'}
        </Link>
      )}
    </header>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return mobile;
}
