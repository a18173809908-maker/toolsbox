import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { rankings } from '@/lib/rankings';

export const metadata: Metadata = {
  title: 'AI 工具榜单推荐 | AIBoxPro',
  description: '按使用场景筛选最好用的 AI 工具：免费视频工具、中文写作工具、编程辅助工具横评，帮中国用户做决定。',
  alternates: { canonical: '/best' },
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

export default function BestPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <SiteHeader />
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
        <section style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 10px', color: C.accent, fontSize: 13, fontWeight: 900 }}>工具榜单</p>
          <h1 style={{ margin: '0 0 14px', color: C.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(36px, 7vw, 64px)', lineHeight: 1.04 }}>
            哪个最值得用？
          </h1>
          <p style={{ margin: 0, maxWidth: 780, color: C.inkSoft, fontSize: 16, lineHeight: 1.75 }}>
            按使用场景精选和排名，列出推荐理由、优缺点和价格，帮你快速决定该用哪个。
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
          {rankings.map((ranking) => (
            <Link
              key={ranking.slug}
              href={`/best/${ranking.slug}`}
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
              <div style={{ width: 42, height: 42, borderRadius: 8, display: 'grid', placeItems: 'center', background: C.primaryBg, color: C.accent, fontWeight: 900, fontSize: 13 }}>
                榜单
              </div>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: 18, lineHeight: 1.3 }}>{ranking.title}</h2>
                <p style={{ margin: 0, color: C.inkSoft, fontSize: 14, lineHeight: 1.65 }}>{ranking.subtitle}</p>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ranking.entries.slice(0, 3).map((e) => (
                  <span key={e.toolId} style={{ fontSize: 12, color: C.inkMuted, background: C.primaryBg, padding: '2px 8px', borderRadius: 99 }}>
                    #{e.rank} {e.toolId}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
