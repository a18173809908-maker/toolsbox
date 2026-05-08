'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

export default function FeaturedToggle({ slug, featured }: { slug: string; featured: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tools/by-slug/${encodeURIComponent(slug)}/featured`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) {
        alert(data.error ?? '操作失败');
        return;
      }
      router.refresh();
    } catch {
      alert('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      style={{
        padding: '6px 14px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        background: featured ? '#FFEDD5' : '#F3F4F6',
        color: featured ? '#C2410C' : '#6B7280',
        border: `1px solid ${featured ? '#FDBA74' : '#D1D5DB'}`,
      }}
    >
      {loading ? '处理中…' : featured ? '★ 已推荐' : '☆ 设为推荐'}
    </button>
  );
}
