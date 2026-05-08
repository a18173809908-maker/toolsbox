import Link from 'next/link';
import { loadAdminRecentArticles } from '@/lib/db/queries';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

const C = {
  bg: '#FFF7ED', panel: '#FFFFFF', ink: '#1F2937', inkSoft: '#4B5563',
  inkMuted: '#9CA3AF', rule: '#E8D5B7', ruleSoft: '#F3E8D0',
  primary: '#F97316', primaryBg: '#FFEDD5',
  green: '#14532D', greenBg: '#DCFCE7',
};

const FONT =
  'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif';

function fmtDate(d: Date | null | undefined) {
  if (!d) return '—';
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { items, total } = await loadAdminRecentArticles(PAGE_SIZE, offset);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: FONT,
        padding: 'clamp(20px, 4vw, 40px)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/admin"
              style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13 }}
            >
              ← 返回总览
            </Link>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink }}>
              近 30 天资讯
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 13,
                  fontWeight: 400,
                  color: C.inkMuted,
                }}
              >
                共 {total} 条
              </span>
            </h1>
          </div>
          <AdminLogoutButton />
        </div>

        {/* Table */}
        <div
          style={{
            background: C.panel,
            border: `1px solid ${C.rule}`,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.ruleSoft }}>
                  {['标题', '来源', '发布时间', '状态', '操作'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        color: C.inkSoft,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        borderBottom: `1px solid ${C.rule}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: '40px 14px',
                        textAlign: 'center',
                        color: C.inkMuted,
                      }}
                    >
                      近 30 天暂无已发布资讯
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom:
                          i < items.length - 1 ? `1px solid ${C.ruleSoft}` : 'none',
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 14px',
                          color: C.ink,
                          fontWeight: 500,
                          maxWidth: 360,
                        }}
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: C.ink, textDecoration: 'none' }}
                          title={item.title}
                        >
                          {item.titleZh ?? item.title}
                        </a>
                      </td>
                      <td style={{ padding: '10px 14px', color: C.inkSoft, whiteSpace: 'nowrap' }}>
                        {item.sourceName ?? '—'}
                      </td>
                      <td
                        style={{
                          padding: '10px 14px',
                          color: C.inkMuted,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fmtDate(item.publishedAt)}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            color: C.green,
                            background: C.greenBg,
                          }}
                        >
                          已发布
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link
                            href={`/admin/articles/${item.id}`}
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              background: C.primaryBg,
                              color: C.primary,
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            审核
                          </Link>
                          <Link
                            href={`/admin/articles/${item.id}?action=hide`}
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              background: '#F3F4F6',
                              color: '#374151',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            隐藏
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginTop: 24,
              fontSize: 13,
              color: C.inkSoft,
            }}
          >
            {page > 1 && (
              <Link
                href={`/admin/articles?page=${page - 1}`}
                style={{
                  padding: '6px 14px',
                  border: `1px solid ${C.rule}`,
                  borderRadius: 6,
                  color: C.inkSoft,
                  textDecoration: 'none',
                }}
              >
                ← 上一页
              </Link>
            )}
            <span>
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/articles?page=${page + 1}`}
                style={{
                  padding: '6px 14px',
                  border: `1px solid ${C.rule}`,
                  borderRadius: 6,
                  color: C.inkSoft,
                  textDecoration: 'none',
                }}
              >
                下一页 →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
