'use client';

import { useState } from 'react';

type Props = {
  title: string;
  path: string;
  text?: string;
  label?: string;
  compact?: boolean;
};

export function ShareButton({ title, path, text, label = '分享', compact = false }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = new URL(path, window.location.origin).toString();
    const shareText = text ? `${title}\n${text}` : title;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: shareText, url });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      // User-cancelled native share should stay quiet.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={label}
      title={copied ? '已复制链接' : label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minWidth: compact ? 32 : 72,
        height: compact ? 32 : 36,
        padding: compact ? '0 8px' : '0 13px',
        borderRadius: compact ? 999 : 8,
        border: '1px solid #E8D5B7',
        background: copied ? '#FFEDD5' : '#FFFFFF',
        color: copied ? '#C2410C' : '#4B5563',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize: 15, transform: 'translateY(-1px)' }}>↗</span>
      {!compact && <span>{copied ? '已复制' : label}</span>}
    </button>
  );
}
