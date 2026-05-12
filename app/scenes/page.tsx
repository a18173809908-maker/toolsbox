import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { scenes } from '@/lib/scenes';

export const metadata: Metadata = {
  title: 'AI 使用场景指南 | AIBoxPro',
  description: '按具体任务查找合适的 AI 工具组合：文生视频、图生视频、短视频剪辑、数字人视频，附操作流程和工具推荐。',
  alternates: { canonical: '/scenes' },
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

export default function ScenesPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <SiteHeader />
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(28px, 6vw, 48px) clamp(16px, 5vw, 28px) 72px' }}>
        <section style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 10px', color: C.accent, fontSize: 13, fontWeight: 900 }}>场景指南</p>
          <h1 style={{ margin: '0 0 14px', color: C.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(36px, 7vw, 64px)', lineHeight: 1.04 }}>
            我想完成什么任务？
          </h1>
          <p style={{ margin: 0, maxWidth: 780, color: C.inkSoft, fontSize: 16, lineHeight: 1.75 }}>
            按你要完成的具体任务查找工具组合和操作流程，而不是在工具分类里猜哪个好用。
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
          {scenes.map((scene) => (
            <Link
              key={scene.slug}
              href={`/scenes/${scene.slug}`}
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
                场景
              </div>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: 20, lineHeight: 1.3 }}>{scene.title}</h2>
                <p style={{ margin: 0, color: C.inkSoft, fontSize: 14, lineHeight: 1.65 }}>{scene.subtitle}</p>
              </div>
              <div style={{ marginTop: 'auto', color: C.inkMuted, fontSize: 13 }}>
                适合：{scene.targetUsers.slice(0, 2).join('、')}
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
