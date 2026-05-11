'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  title: string;
  path: string;
  text?: string;
  label?: string;
  compact?: boolean;
};

export function ShareButton({ title, path, text, label = '分享', compact = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const canUseNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const url = typeof window === 'undefined' ? path : new URL(path, window.location.origin).toString();
  const shareText = text ? `${title}\n${text}` : title;
  const payload = `${shareText}\n${url}`;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  async function copyFor(platform = '已复制链接') {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setHint(platform);
      window.setTimeout(() => {
        setCopied(false);
        setHint('');
      }, 1800);
    } catch {
      setHint('复制失败，请手动复制地址栏链接');
    }
  }

  function openShareUrl(kind: 'weibo' | 'qq') {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(shareText);
    const shareUrl = kind === 'weibo'
      ? `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`
      : `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text ?? '')}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=760,height=620');
    setOpen(false);
  }

  async function handleNativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: shareText, url });
      } else {
        await copyFor('已复制链接');
      }
    } catch {
      // User-cancelled native share should stay quiet.
    }
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        display: 'inline-flex',
      }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-label={label}
        title={hint || label}
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          minWidth: compact ? 34 : 84,
          height: compact ? 34 : 36,
          padding: compact ? 0 : '0 13px',
          borderRadius: compact ? 10 : 10,
          border: '1px solid #DED6C7',
          background: copied ? '#DCEBE5' : '#FFFDF7',
          color: copied ? '#0F6B57' : '#17201C',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1,
          boxShadow: '0 1px 2px rgba(23,32,28,0.06)',
        }}
      >
        <ShareIcon />
        {!compact && <span>{copied ? '已复制' : label}</span>}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            zIndex: 30,
            width: 224,
            padding: 8,
            borderRadius: 12,
            border: '1px solid #DED6C7',
            background: '#FFFDF7',
            boxShadow: '0 18px 40px rgba(23,32,28,0.14)',
          }}
        >
          <ShareItem icon="微" label="微信" desc="复制后打开微信发送" onClick={() => copyFor('已复制，打开微信粘贴')} />
          <ShareItem icon="朋" label="朋友圈" desc="复制文案和链接" onClick={() => copyFor('已复制，打开朋友圈粘贴')} />
          <ShareItem icon="红" label="小红书" desc="复制后发笔记" onClick={() => copyFor('已复制，打开小红书粘贴')} />
          <ShareItem icon="博" label="微博" desc="打开微博分享" onClick={() => openShareUrl('weibo')} />
          <ShareItem icon="Q" label="QQ" desc="打开 QQ 分享" onClick={() => openShareUrl('qq')} />
          <ShareItem icon="链" label="复制链接" desc={hint || '复制标题、摘要和链接'} onClick={() => copyFor('已复制链接')} />
          {canUseNativeShare && (
            <ShareItem icon="系" label="系统分享" desc="调用手机系统分享面板" onClick={handleNativeShare} />
          )}
        </div>
      )}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5.9 5.2 10 3.1M5.9 10.8 10 12.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="4.2" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11.8" cy="2.6" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11.8" cy="13.4" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ShareItem({
  icon,
  label,
  desc,
  onClick,
}: {
  icon: string;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        border: 0,
        borderRadius: 9,
        background: 'transparent',
        color: '#17201C',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = '#F6F1E8';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = 'transparent';
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          display: 'grid',
          placeItems: 'center',
          background: '#DCEBE5',
          color: '#0F6B57',
          fontSize: 12,
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{label}</span>
        <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: '#65706B', lineHeight: 1.2 }}>{desc}</span>
      </span>
    </button>
  );
}
