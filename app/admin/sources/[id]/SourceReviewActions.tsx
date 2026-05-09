'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const C = {
  red: '#991B1B', redBg: '#FEE2E2', green: '#14532D', greenBg: '#DCFCE7',
  ink: '#1F2937', inkSoft: '#4B5563', rule: '#E8D5B7', bg: '#FFF7ED', panel: '#FFFFFF',
};

export default function SourceReviewActions({ candidateId, canApprove }: { candidateId: number; canApprove: boolean }) {
  const router = useRouter();
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function post(action: 'approve' | 'reject') {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sources/${candidateId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? '操作失败');
        return;
      }
      router.replace('/admin/sources');
      router.refresh();
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 12, padding: 24, marginTop: 16 }}>
      <h2 style={{ margin: '0 0 14px', color: C.ink, fontSize: 16 }}>审核操作</h2>
      {!canApprove && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: '#FEF3C7', color: '#92400E', fontSize: 13 }}>
          缺少 RSS/Atom Feed，暂不能通过为正式源。
        </div>
      )}
      {error && <div style={{ marginBottom: 12, color: C.red, fontSize: 13 }}>{error}</div>}
      {!rejecting ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button disabled={!canApprove || loading} onClick={() => post('approve')} style={btn(C.greenBg, C.green, !canApprove || loading)}>通过并加入正式源</button>
          <button disabled={loading} onClick={() => setRejecting(true)} style={btn(C.redBg, C.red, loading)}>拒绝</button>
        </div>
      ) : (
        <div>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="拒绝原因（可选）" style={{ width: '100%', boxSizing: 'border-box', padding: 10, border: `1px solid ${C.rule}`, borderRadius: 8, background: C.bg, color: C.inkSoft, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button disabled={loading} onClick={() => post('reject')} style={btn(C.redBg, C.red, loading)}>确认拒绝</button>
            <button disabled={loading} onClick={() => setRejecting(false)} style={btn('#F3F4F6', '#374151', loading)}>取消</button>
          </div>
        </div>
      )}
    </section>
  );
}

function btn(bg: string, color: string, disabled: boolean) {
  return {
    padding: '9px 16px',
    border: 'none',
    borderRadius: 8,
    background: disabled ? '#E5E7EB' : bg,
    color: disabled ? '#9CA3AF' : color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 700,
    fontSize: 13,
  } as React.CSSProperties;
}
