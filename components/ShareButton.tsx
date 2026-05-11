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
      setOpen(false);
      window.setTimeout(() => {
        setCopied(false);
        setHint('');
      }, 2000);
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
          gap: 6,
          minWidth: compact ? 32 : 72,
          height: compact ? 32 : 34,
          padding: compact ? 0 : '0 12px',
          borderRadius: 999,
          border: `1px solid ${copied ? '#10B981' : '#E8D5B7'}`,
          background: copied ? '#ECFDF5' : '#FFFFFF',
          color: copied ? '#059669' : '#4B5563',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1,
          transition: 'all .2s',
          boxShadow: copied ? '0 2px 8px rgba(16, 185, 129, 0.2)' : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
        {!compact && <span>{copied ? '已复制' : label}</span>}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 'calc(100% + 8px)',
            zIndex: 100,
            width: 200,
            padding: 6,
            borderRadius: 14,
            border: '1px solid #E8D5B7',
            background: '#FFFFFF',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <ShareIconButton icon="wechat" label="微信" onClick={() => copyFor('已复制')} />
            <ShareIconButton icon="moments" label="朋友圈" onClick={() => copyFor('已复制')} />
            <ShareIconButton icon="xiaohongshu" label="小红书" onClick={() => copyFor('已复制')} />
            <ShareIconButton icon="weibo" label="微博" onClick={() => openShareUrl('weibo')} />
            <ShareIconButton icon="qq" label="QQ" onClick={() => openShareUrl('qq')} />
            <ShareIconButton icon="link" label="复制链接" onClick={() => copyFor('已复制链接')} />
          </div>
          {canUseNativeShare && (
            <div style={{ borderTop: '1px solid #F3E8D0', marginTop: 6, paddingTop: 6 }}>
              <button
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleNativeShare();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  border: 0,
                  borderRadius: 10,
                  background: 'transparent',
                  color: '#4B5563',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFF8F0'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                系统分享
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShareIconButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const icons: Record<string, string> = {
    wechat: `
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M8 12h2v4H8zm6-2h2v6h-2z" fill="currentColor" opacity="0.6"/>
      <path d="M8 8c-2.2 0-4 1.8-4 4s1.8 4 4 4v-4z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M16 8c-2.2 0-4 1.8-4 4s1.8 4 4 4v-4z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
    `,
    moments: `
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M8 10h2v2H8zm6-2h2v4h-2z" fill="currentColor" opacity="0.6"/>
      <circle cx="8" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
      <circle cx="16" cy="10" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
      <circle cx="16" cy="14" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
    `,
    xiaohongshu: `
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2" fill="none"/>
      <circle cx="12" cy="9" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M9 15l3-2 3 2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    weibo: `
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M8 7c1.5 0 3 .5 4 2 1-1.5 2.5-2 4-2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M8 12c1 0 2 .5 2.5 1.5S11 15 11 15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="16" cy="14" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
    `,
    qq: `
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
      <circle cx="8" cy="10" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
      <circle cx="16" cy="10" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M8 14h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
    `,
    link: `
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm4-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `,
  };

  return (
    <button
      type="button"
      role="menuitem"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      title={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '10px 6px',
        border: 0,
        borderRadius: 10,
        background: 'transparent',
        color: '#4B5563',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 11,
        fontWeight: 600,
        transition: 'all .15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = '#FFF8F0';
        el.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'transparent';
        el.style.transform = 'scale(1)';
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <style>{`svg { transition: transform 0.15s; }`}</style>
        <foreignObject x="0" y="0" width="24" height="24">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            {icons[icon] && <g dangerouslySetInnerHTML={{ __html: icons[icon] }} />}
          </svg>
        </foreignObject>
      </svg>
      {label}
    </button>
  );
}