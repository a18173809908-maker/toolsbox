'use client';

import Link from 'next/link';
import { v2Tokens as T } from '@/lib/tokens';

type BrandLogoProps = {
  href?: string;
  size?: number;
  showWordmark?: boolean;
  compact?: boolean;
};

export function BrandLogo({ href = '/', size = 32, showWordmark = true, compact = false }: BrandLogoProps) {
  const mark = <LogoMark size={size} />;
  const wordmark = showWordmark ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        fontWeight: 850,
        fontSize: compact ? 17 : 18,
        color: T.ink,
        lineHeight: 1,
        letterSpacing: 0,
        whiteSpace: 'nowrap',
      }}
    >
      AIBox
      <span style={{ color: T.primary }}>Pro</span>
    </span>
  ) : null;

  return (
    <Link
      href={href}
      aria-label="AIBoxPro 首页"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 8 : 10,
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      {mark}
      {wordmark}
    </Link>
  );
}

export function LogoMark({ size = 32 }: { size?: number }) {
  const radius = Math.round(size * 0.27);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="AIBoxPro logo"
      style={{
        display: 'block',
        borderRadius: radius,
        boxShadow: '0 1px 0 rgba(23, 32, 28, 0.08)',
      }}
    >
      <defs>
        <linearGradient id="aiboxpro-mark-bg" x1="5" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFDF7" />
          <stop offset="1" stopColor="#F7E9C8" />
        </linearGradient>
        <linearGradient id="aiboxpro-mark-line" x1="9" y1="8" x2="31" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F6B57" />
          <stop offset="0.58" stopColor="#1E8A70" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#aiboxpro-mark-bg)" />
      <rect x="1.5" y="1.5" width="37" height="37" rx="9.5" fill="none" stroke="#DED6C7" />
      <path
        d="M9.5 15.8 20 10.3l10.5 5.5v11.6L20 33 9.5 27.4V15.8Z"
        fill="#FFFDF7"
        stroke="url(#aiboxpro-mark-line)"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M10.1 16.1 20 21.4l9.9-5.3M20 21.4v10.6"
        fill="none"
        stroke="#0F6B57"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M14.6 27.2v-6.8M25.4 20.4v6.8M17.2 28.6h5.6"
        fill="none"
        stroke="#17201C"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M21.9 11.6c2.1-2.1 4.6-3.5 7.6-4.2-.7 2.9-2.1 5.4-4.2 7.5"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M29.5 7.4 28.8 12.8 24.8 9.2Z" fill="#F59E0B" />
      <path
        d="M13.2 9.4 14 7.2l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"
        fill="#F59E0B"
      />
    </svg>
  );
}
