'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const C = { red: '#991B1B', redBg: '#FEE2E2', rule: '#E8D5B7', ink: '#1F2937' };

export default function ArticleHideButton({ articleId }: { articleId: number }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function doHide() {
    if (!confirm('确认将此资讯设为隐藏？')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/hide`, { method: 'POST' });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? '操作失败'); return; }
      router.replace('/admin/articles');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: C.redBg, color: C.red, fontSize: 13 }}>
          {error}
        </div>
      )}
      <button
        disabled={loading}
        onClick={doHide}
        style={{
          padding: '8px 20px',
          background: loading ? '#E5E7EB' : C.redBg,
          color: loading ? '#9CA3AF' : C.red,
          border: `1px solid ${loading ? '#D1D5DB' : '#FECACA'}`,
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '处理中…' : '隐藏此资讯'}
      </button>
    </div>
  );
}
