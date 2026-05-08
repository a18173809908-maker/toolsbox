'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const C = {
  bg: '#FFF7ED', ink: '#1F2937', inkSoft: '#4B5563',
  rule: '#E8D5B7', panel: '#FFFFFF',
  red: '#991B1B', redBg: '#FEE2E2',
  green: '#14532D', greenBg: '#DCFCE7',
};

type Props = { comparisonId: string };
type Mode = 'idle' | 'rejecting';

export default function ComparisonReviewActions({ comparisonId }: Props) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>('idle');
  const [rejectReason, setRejectReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function doApprove() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/comparisons/${comparisonId}/approve`, { method: 'POST' });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? '操作失败'); return; }
      router.replace('/admin/comparisons');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  async function doReject() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/comparisons/${comparisonId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? '操作失败'); return; }
      router.replace('/admin/comparisons');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginTop: 24 }}>
      <p style={{ margin: '0 0 16px', fontWeight: 600, color: C.ink, fontSize: 14 }}>操作</p>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: C.redBg, color: C.red, fontSize: 13 }}>
          {error}
        </div>
      )}

      {mode === 'idle' && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button disabled={loading} onClick={doApprove} style={btn(C.greenBg, C.green, loading)}>
            ✓ 通过发布
          </button>
          <button disabled={loading} onClick={() => setMode('rejecting')} style={btn(C.redBg, C.red, loading)}>
            ✗ 拒绝
          </button>
        </div>
      )}

      {mode === 'rejecting' && (
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>
            拒绝原因（可留空）
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="请输入拒绝原因…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${C.rule}`, borderRadius: 8, fontSize: 13, color: C.ink, background: C.bg, resize: 'vertical', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button disabled={loading} onClick={doReject} style={btn(C.redBg, C.red, loading)}>✗ 确认拒绝</button>
            <button disabled={loading} onClick={() => setMode('idle')} style={btn('#F3F4F6', '#374151', loading)}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}

function btn(bg: string, color: string, disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 18px',
    background: disabled ? '#E5E7EB' : bg,
    color: disabled ? '#9CA3AF' : color,
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
