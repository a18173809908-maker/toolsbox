import { Suspense } from 'react';
import Link from 'next/link';
import { loadPublishedToolUpdates, loadPublishedSpotlights } from '@/lib/db/queries';
import { SiteHeader } from '@/components/SiteHeader';

import { v2Tokens as T } from '@/lib/tokens';
import type { Metadata } from 'next';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: '动态 — AI 工具最新动态与教程 | AIBoxPro',
  description: '跟进热门 AI 工具的最新功能、实战教程，以及 GitHub 热门开源项目解读。',
};

const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

function ContentTypeTag({ type }: { type: string }) {
  const isUpdate = type === 'update';
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700,
      background: isUpdate ? '#FEF3C7' : '#EFF6FF',
      color: isUpdate ? '#92400E' : '#1D4ED8',
    }}>
      {isUpdate ? '⚡ 动态' : '📖 教程'}
    </span>
  );
}

function SpotlightTag() {
  return (
    <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: T.primaryBg, color: T.primary }}>
      🔭 仓库精选
    </span>
  );
}

async function UpdatesContent() {
  const [updates, spotlights] = await Promise.all([
    loadPublishedToolUpdates(20),
    loadPublishedSpotlights(10),
  ]);

  // 合并两类内容，按发布时间倒序
  type FeedItem =
    | { kind: 'update'; id: number; title: string; toolName: string; contentType: string; publishedAt: Date | null }
    | { kind: 'spotlight'; id: number; title: string; repo: string; publishedAt: Date | null };

  const feed: FeedItem[] = [
    ...updates.map((u) => ({
      kind: 'update' as const,
      id: u.id,
      title: u.titleZh ?? u.toolName,
      toolName: u.toolName,
      contentType: u.contentType,
      publishedAt: u.publishedAt,
    })),
    ...spotlights.map((s) => ({
      kind: 'spotlight' as const,
      id: s.id,
      title: s.titleZh ?? s.repo,
      repo: s.repo,
      publishedAt: s.publishedAt,
    })),
  ].sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });

  if (feed.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: T.inkMuted }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>动态内容即将上线</div>
        <div style={{ fontSize: 14 }}>每天抓取热门 AI 工具最新视频，提炼成中文内容</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {feed.map((item) => {
        const href = item.kind === 'update' ? `/updates/${item.id}` : `/spotlight/${item.id}`;
        const timeStr = item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
          : '';

        return (
          <Link
            key={`${item.kind}-${item.id}`}
            href={href}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div style={{
              background: T.panel,
              border: `1px solid ${T.rule}`,
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {item.kind === 'update'
                    ? <ContentTypeTag type={item.contentType} />
                    : <SpotlightTag />
                  }
                  <span style={{ fontSize: 12, color: T.inkMuted }}>
                    {item.kind === 'update' ? item.toolName : item.repo.split('/')[1]}
                  </span>
                  {timeStr && <span style={{ fontSize: 12, color: T.inkMuted, marginLeft: 'auto' }}>{timeStr}</span>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.45 }}>
                  {item.title}
                </div>
              </div>
              <span style={{ color: T.inkMuted, fontSize: 18, flexShrink: 0, marginTop: 2 }}>›</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function SpotlightIndexPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 780, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 32px)', fontFamily: FONT }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: T.ink }}>
            动态
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 15, color: T.inkSoft }}>
            热门 AI 工具的最新功能、实战技巧，以及 GitHub 热门项目解读
          </p>
        </div>
        <Suspense fallback={<div style={{ color: T.inkMuted, padding: 40, textAlign: 'center' }}>加载中…</div>}>
          <UpdatesContent />
        </Suspense>
      </main>

    </>
  );
}
