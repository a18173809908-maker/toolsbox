import type React from 'react';
import { SiteHeader } from './SiteHeader';

const C = {
  bg:       '#FFF7ED',
  panel:    '#FFFFFF',
  ink:      '#1F2937',
  inkSoft:  '#4B5563',
  inkMuted: '#6B7280',
  rule:     '#E8D5B7',
  primary:  '#F97316',
  accent:   '#C2410C',
};

type Props = {
  title: string;
  subtitle?: string;
  lastUpdated?: string; // YYYY-MM-DD
  children: React.ReactNode;
};

/**
 * 通用合规/说明页布局：
 * - 顶部 SiteHeader（与全站一致）
 * - 标题区（title / subtitle / 最后更新日期）
 * - 中央内容卡片（用于 prose 样式的长文）
 *
 * 4 个合规页（/about /privacy /submit-guide /disclaimer）共用此组件。
 */
export function LegalPage({ title, subtitle, lastUpdated, children }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <SiteHeader />

      <main
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: 'clamp(28px, 6vw, 56px) clamp(16px, 5vw, 28px) 96px',
        }}
      >
        <header style={{ marginBottom: 28 }}>
          <h1
            style={{
              margin: '0 0 8px',
              color: C.ink,
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(32px, 6vw, 44px)',
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              style={{
                margin: 0,
                color: C.inkSoft,
                fontSize: 17,
                lineHeight: 1.65,
              }}
            >
              {subtitle}
            </p>
          ) : null}
          {lastUpdated ? (
            <p
              style={{
                margin: '8px 0 0',
                color: C.inkMuted,
                fontSize: 13,
              }}
            >
              最后更新：{lastUpdated}
            </p>
          ) : null}
        </header>

        <article
          style={{
            background: C.panel,
            border: `1px solid ${C.rule}`,
            borderRadius: 12,
            padding: 'clamp(22px, 4vw, 36px)',
            color: C.ink,
            fontSize: 15,
            lineHeight: 1.8,
          }}
        >
          {children}
        </article>
      </main>
    </div>
  );
}

export const LegalStyles = {
  h2: {
    margin: '32px 0 12px',
    color: C.ink,
    fontFamily: 'Georgia, serif',
    fontSize: 22,
    lineHeight: 1.3,
  } as React.CSSProperties,
  p: {
    margin: '0 0 14px',
    color: C.inkSoft,
  } as React.CSSProperties,
  ul: {
    margin: '0 0 16px',
    paddingLeft: 22,
    color: C.inkSoft,
  } as React.CSSProperties,
  li: {
    marginBottom: 6,
  } as React.CSSProperties,
  callout: {
    background: '#FEF3C7',
    border: '1px solid #FCD34D',
    borderRadius: 8,
    padding: '14px 16px',
    margin: '20px 0',
    color: '#78350F',
    fontSize: 14,
    lineHeight: 1.7,
  } as React.CSSProperties,
  strong: {
    color: C.ink,
    fontWeight: 700,
  } as React.CSSProperties,
};
