import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import { loadAdminSourceCandidates } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5',
};

const PAGE_SIZE = 30;
const FONT = 'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

const CATEGORY_LABEL: Record<string, string> = {
  aggregation: '聚合追踪',
  vertical_media: '垂直媒体',
  community_column: '社区专栏',
  official_source: '官方源',
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminSourcesPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const { items, total } = await loadAdminSourceCandidates(PAGE_SIZE, offset);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, padding: 'clamp(20px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}>← 返回总览</Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>
              信息源候选
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: C.inkMuted }}>共 {total} 个待审核</span>
            </h1>
          </div>
          <AdminLogoutButton />
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {items.length === 0 ? (
            <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 40, textAlign: 'center', color: C.inkMuted }}>
              暂无待审核信息源。可运行 `npm run discover:sources` 生成候选。
            </div>
          ) : items.map((item) => (
            <Link key={item.id} href={`/admin/sources/${item.id}`} style={{ textDecoration: 'none' }}>
              <article style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: '0 0 8px', color: C.ink, fontSize: 18 }}>{item.name}</h2>
                    <div style={{ color: C.inkSoft, fontSize: 13, lineHeight: 1.6 }}>{item.url}</div>
                    {item.feedUrl && <div style={{ color: C.inkMuted, fontSize: 12, marginTop: 3 }}>RSS：{item.feedUrl}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Badge>{CATEGORY_LABEL[item.sourceCategory] ?? item.sourceCategory}</Badge>
                    <Badge>质量 {item.qualityScore}</Badge>
                    <Badge>AI {item.aiRelevanceScore}</Badge>
                    <Badge>工具 {item.toolRelevanceScore}</Badge>
                  </div>
                </div>
                {item.evidence?.recentTitles && item.evidence.recentTitles.length > 0 && (
                  <p style={{ margin: '12px 0 0', color: C.inkSoft, fontSize: 13, lineHeight: 1.6 }}>
                    样例：{item.evidence.recentTitles[0]}
                  </p>
                )}
              </article>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, color: C.inkSoft, fontSize: 13 }}>
            {page > 1 && <Link href={`/admin/sources?page=${page - 1}`} style={{ color: C.inkSoft }}>上一页</Link>}
            <span>{page} / {totalPages}</span>
            {page < totalPages && <Link href={`/admin/sources?page=${page + 1}`} style={{ color: C.inkSoft }}>下一页</Link>}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ padding: '4px 8px', borderRadius: 999, background: C.primaryBg, color: C.primary, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}
