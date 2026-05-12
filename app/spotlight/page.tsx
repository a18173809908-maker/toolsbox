import { Suspense } from 'react';
import Link from 'next/link';
import { loadPublishedSpotlights } from '@/lib/db/queries';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { v2Tokens as T } from '@/lib/tokens';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '仓库精选 — GitHub 热门项目深度解读 | AIBoxPro',
  description: '每周精选 GitHub 热门 AI 仓库，解读项目能做什么、社区怎么用、国内开发者如何上手。',
};

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

function weekLabel(week: string) {
  // 'YYYY-WW' → '第N周'
  const match = week.match(/(\d{4})-W(\d+)/);
  if (!match) return week;
  return `${match[1]} 第 ${parseInt(match[2], 10)} 周`;
}

async function SpotlightList() {
  const items = await loadPublishedSpotlights(30);

  if (items.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: T.inkMuted }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>精选内容即将上线</div>
        <div style={{ fontSize: 14 }}>每周精选 GitHub 最受关注的 AI 开源项目，解读用途和使用方法</div>
      </div>
    );
  }

  // Group by snapshotWeek
  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const list = grouped.get(item.snapshotWeek) ?? [];
    list.push(item);
    grouped.set(item.snapshotWeek, list);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {[...grouped.entries()].map(([week, weekItems]) => (
        <div key={week}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.inkMuted, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {weekLabel(week)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {weekItems.map((item, i) => (
              <Link
                key={item.id}
                href={`/spotlight/${item.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    background: T.panel,
                    border: `1px solid ${T.rule}`,
                    borderRadius: 12,
                    padding: '20px 22px',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ padding: '2px 8px', background: T.primaryBg, color: T.primary, borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                      #{i + 1} 本周热门
                    </span>
                    <span style={{ fontSize: 11, color: T.inkMuted, fontFamily: 'monospace' }}>
                      {item.repo.split('/')[1]}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, lineHeight: 1.4, marginBottom: 8 }}>
                    {item.titleZh ?? item.repo}
                  </div>
                  <div style={{ fontSize: 12, color: T.inkMuted, fontFamily: 'monospace' }}>
                    {item.repo}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SpotlightIndexPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 32px)', fontFamily: FONT }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: T.ink }}>
            🔭 仓库精选
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 15, color: T.inkSoft, maxWidth: 600 }}>
            每周精选 GitHub 最受关注的 AI 开源项目，解读它能做什么、社区怎么用，以及国内开发者如何上手。
          </p>
        </div>
        <Suspense fallback={<div style={{ color: T.inkMuted, padding: 40, textAlign: 'center' }}>加载中…</div>}>
          <SpotlightList />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
