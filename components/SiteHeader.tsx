'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { v2Tokens as T } from '@/lib/tokens';
import { BrandLogo } from '@/components/BrandLogo';

type SiteHeaderProps = {
  onOpenPalette?: () => void;
};

const navItems: Array<{ label: string; href: string; comingSoon?: boolean }> = [
  { label: '首页', href: '/' },
  { label: 'AI工具', href: '/tools' },
  { label: '工具榜单', href: '/best' },
  { label: '场景指南', href: '/scenes' },
  { label: '对比', href: '/compare' },
  { label: 'GitHub趋势', href: '/trending' },
  { label: '使用教程', href: '/tutorials', comingSoon: true },
  { label: 'AI 资讯', href: '/news' },
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
      <BrandLogo size={34} compact={isMobile} />

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
          const isDisabled = item.comingSoon;
          
          return (
            <div key={item.href} style={{ position: 'relative' }}>
              {isDisabled ? (
                <span
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    color: T.inkMuted,
                    fontWeight: 500,
                    background: 'transparent',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    cursor: 'not-allowed',
                    opacity: 0.7,
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
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
              )}
              {isDisabled && (
                <span
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    padding: '2px 6px',
                    background: '#F59E0B',
                    color: '#fff',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                  title="正在开发中"
                >
                  开发中
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {onOpenPalette ? (
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="搜索工具"
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
          {!isMobile && <span>搜索工具</span>}
        </button>
      ) : (
        <Link
          href="/tools"
          aria-label="搜索工具"
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
          {isMobile ? '⌘K' : '搜索工具'}
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
