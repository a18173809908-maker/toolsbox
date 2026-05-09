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
        fontFamily: 'Fraunces, Georgia, serif',
        fontWeight: 800,
        fontSize: compact ? 17 : 19,
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
        d="M10.5 14.5 20 9.5l9.5 5v10.8L20 30.5l-9.5-5.2V14.5Z"
        fill="#FFFDF7"
        stroke="url(#aiboxpro-mark-line)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M10.8 14.8 20 19.7l9.2-4.9M20 19.7v10.1"
        fill="none"
        stroke="#0F6B57"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M15.1 25.6v-6.2M15.1 19.4l-2.7 6.2M15.1 19.4l2.7 6.2M13.4 23.2h3.4M20.9 19.2v6.4M24.8 19.2v6.4"
        fill="none"
        stroke="#17201C"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M23.2 10.2c2.2-2.4 4.7-3.8 7.6-4.2-.8 2.8-2.3 5.2-4.6 7.1"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M30.8 6 30 11.5 25.9 7.9Z" fill="#F59E0B" />
      <path
        d="M13.2 8.4 14 6.2l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"
        fill="#F59E0B"
      />
    </svg>
  );
}
