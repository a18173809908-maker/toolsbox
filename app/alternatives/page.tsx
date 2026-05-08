import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { alternativeTopics } from '@/lib/alternatives';

export const metadata: Metadata = {
  title: '国产替代方案 | AIBoxPro',
  description: '盘点 Cursor、ChatGPT、Midjourney、Notion AI、Runway 等海外 AI 工具的国内可用替代方案。',
  alternates: { canonical: '/alternatives' },
};

const C = {
  bg: '#FFF7ED',
  panel: '#FFFFFF',
  ink: '#1F2937',
  inkSoft: '#4B5563',
  inkMuted: '#9CA3AF',
  rule: '#E8D5B7',
  primaryBg: '#FFEDD5',
  accent: '#C2410C',
};

export default function AlternativesPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <SiteHeader />
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
        <section style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 10px', color: C.accent, fontSize: 13, fontWeight: 900 }}>国产替代方案</p>
          <h1 style={{ margin: '0 0 14px', color: C.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(36px, 7vw, 64px)', lineHeight: 1.04 }}>
            海外 AI 工具不好用时，先看国内替代
          </h1>
          <p style={{ margin: 0, maxWidth: 780, color: C.inkSoft, fontSize: 16, lineHeight: 1.75 }}>
            按常见海外工具整理国内可用选项，重点看访问稳定性、中文体验、价格门槛和适用场景。
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
          {alternativeTopics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/alternatives/${topic.slug}`}
              style={{
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                padding: 22,
                background: C.panel,
                border: `1px solid ${C.rule}`,
                borderRadius: 10,
                color: C.ink,
                textDecoration: 'none',
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 8, display: 'grid', placeItems: 'center', background: C.primaryBg, color: C.accent, fontWeight: 900 }}>
                替
              </div>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: 22, lineHeight: 1.25 }}>{topic.title}</h2>
                <p style={{ margin: 0, color: C.inkSoft, fontSize: 14, lineHeight: 1.65 }}>{topic.subtitle}</p>
              </div>
              <div style={{ marginTop: 'auto', color: C.inkMuted, fontSize: 13 }}>
                覆盖：{topic.scenario}
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
