import type { CSSProperties } from 'react';
import Image from 'next/image';

type ToolIconProps = {
  name: string;
  mono: string;
  brand: string;
  url?: string | null;
  size?: number;
};

type AccessBadgeProps = {
  chinaAccess?: string | null;
  chineseUi?: boolean;
  compact?: boolean;
};

const ACCESS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  accessible: { label: '国内直连', bg: '#DCFCE7', color: '#166534' },
  'vpn-required': { label: '需 VPN', bg: '#FEF3C7', color: '#92400E' },
  blocked: { label: '国内受限', bg: '#FEE2E2', color: '#991B1B' },
  unknown: { label: '访问未知', bg: '#F3F4F6', color: '#6B7280' },
};

const CN_HOSTS = [
  'doubao.com',
  'moonshot.cn',
  'baidu.com',
  'aliyun.com',
  'chatglm.cn',
  'xfyun.cn',
  'tencent.com',
  'deepseek.com',
  'jianying.com',
  'klingai.com',
  'hailuoai.com',
  'metaso.cn',
  'tiangong.cn',
];

function hostname(url?: string | null) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function isChineseTool(url?: string | null) {
  const host = hostname(url);
  return Boolean(host && CN_HOSTS.some((suffix) => host === suffix || host.endsWith(`.${suffix}`)));
}

export function faviconUrl(url?: string | null) {
  const host = hostname(url);
  if (!host) return null;
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`;
}

export function ToolIcon({ name, mono, brand, url, size = 44 }: ToolIconProps) {
  const icon = faviconUrl(url);
  const radius = Math.max(8, Math.round(size * 0.24));
  const innerSize = Math.max(18, Math.round(size * 0.58));
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    background: brand,
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    fontFamily: 'Georgia, serif',
    fontWeight: 700,
    fontSize: mono.length <= 2 ? Math.round(size * 0.42) : Math.round(size * 0.3),
    letterSpacing: '-0.03em',
  };

  return (
    <div style={style} aria-label={`${name} icon`}>
      {icon ? (
        <Image
          src={icon}
          alt=""
          width={innerSize}
          height={innerSize}
          unoptimized
          style={{ width: innerSize, height: innerSize, borderRadius: Math.max(4, Math.round(size * 0.12)) }}
        />
      ) : (
        mono.slice(0, 3)
      )}
    </div>
  );
}

export function AccessBadge({ chinaAccess, chineseUi, compact = false }: AccessBadgeProps) {
  const access = ACCESS_STYLE[chinaAccess ?? 'unknown'];
  const domestic = chineseUi || chinaAccess === 'accessible';
  const bg = domestic ? '#DCFCE7' : access.bg;
  const color = domestic ? '#166534' : access.color;
  const label = domestic ? (compact ? '国产/直连' : '国产友好 · 国内直连') : access.label;
  const icon = domestic ? 'CN' : chinaAccess === 'vpn-required' ? 'VPN' : chinaAccess === 'blocked' ? '!' : '?';

  if (!chinaAccess || chinaAccess === 'unknown') return null;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: compact ? '2px 7px' : '3px 10px',
      borderRadius: compact ? 5 : 999,
      background: bg,
      color,
      fontSize: compact ? 11 : 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: compact ? 9 : 10, letterSpacing: '0.04em' }}>{icon}</span>
      {label}
    </span>
  );
}

export function isDomesticTool(url?: string | null, chineseUi?: boolean, chinaAccess?: string | null) {
  return Boolean(chineseUi || chinaAccess === 'accessible' || isChineseTool(url));
}
