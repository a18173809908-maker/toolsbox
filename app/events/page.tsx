import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { loadPublishedEvents } from '@/lib/db/queries';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'AI 事件追踪 | AIBoxPro',
  description: '追踪重要 AI 工具发布、版本更新和行业动态，持续更新，聚合原始资讯来源。',
  alternates: { canonical: '/events' },
};

const C = {
  bg: '#F9FAFB',
  panel: '#FFFFFF',
  ink: '#1F2937',
  inkSoft: '#4B5563',
  inkMuted: '#9CA3AF',
  rule: '#E5E7EB',
  accent: '#7C3AED',
  accentBg: '#F5F3FF',
};

export default async function EventsPage() {
  const events = process.env.DATABASE_URL ? await loadPublishedEvents(60) : [];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <SiteHeader />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
        <header style={{ marginBottom: 36 }}>
          <p style={{ margin: '0 0 8px', color: C.accent, fontSize: 13, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>AI 事件追踪</p>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: C.ink, lineHeight: 1.15 }}>
            重要 AI 事件
          </h1>
          <p style={{ margin: 0, color: C.inkSoft, fontSize: 16, lineHeight: 1.7, maxWidth: 620 }}>
            追踪 AI 工具发布、版本更新和行业动态。每个事件聚合多条来源，附实际影响分析。
          </p>
        </header>

        {events.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.inkMuted, background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12 }}>
            暂无已发布事件
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.slug}`}
                style={{ display: 'block', padding: '20px 24px', background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, textDecoration: 'none', color: C.ink }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, lineHeight: 1.4 }}>{ev.title}</div>
                    {ev.summary && (
                      <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.65, maxWidth: 640 }}>{ev.summary}</div>
                    )}
                  </div>
                  {ev.publishedAt && (
                    <div style={{ fontSize: 12, color: C.inkMuted, flexShrink: 0, paddingTop: 2 }}>
                      {new Date(ev.publishedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
