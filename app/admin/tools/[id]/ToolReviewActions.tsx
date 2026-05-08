'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const C = {
  bg: '#FFF7ED', ink: '#1F2937', inkSoft: '#4B5563', inkMuted: '#9CA3AF',
  rule: '#E8D5B7', primary: '#F97316', primaryBg: '#FFEDD5',
  red: '#991B1B', redBg: '#FEE2E2', green: '#14532D', greenBg: '#DCFCE7',
  panel: '#FFFFFF',
};

type Props = {
  candidateId: number;
  currentZh: string | null;
  slug: string | null;
  catId: string | null;
};

type Mode = 'idle' | 'rejecting' | 'editing';

export default function ToolReviewActions({ candidateId, currentZh, slug, catId }: Props) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>('idle');
  const [rejectReason, setRejectReason] = React.useState('');
  const [editedZh, setEditedZh] = React.useState(currentZh ?? '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canApprove = Boolean(slug && catId);

  async function doApprove(zh?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tools/${candidateId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zh }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? '操作失败'); return; }
      router.replace('/admin/tools');
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
      const res = await fetch(`/api/admin/tools/${candidateId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? '操作失败'); return; }
      router.replace('/admin/tools');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.rule}`,
        borderRadius: 12,
        padding: 24,
        marginTop: 24,
      }}
    >
      <p style={{ margin: '0 0 16px', fontWeight: 600, color: C.ink, fontSize: 14 }}>操作</p>

      {!canApprove && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#FEF3C7',
            color: '#92400E',
            fontSize: 13,
          }}
        >
          {!slug ? '⚠️ 缺少 slug，无法通过' : '⚠️ 缺少分类 catId，无法通过'}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 8,
            background: C.redBg,
            color: C.red,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {mode === 'idle' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            disabled={loading || !canApprove}
            onClick={() => doApprove()}
            style={btnStyle(C.greenBg, C.green, loading || !canApprove)}
          >
            ✓ 通过
          </button>
          <button
            disabled={loading}
            onClick={() => setMode('editing')}
            style={btnStyle(C.primaryBg, C.primary, loading || !canApprove)}
          >
            ✏️ 编辑后通过
          </button>
          <button
            disabled={loading}
            onClick={() => setMode('rejecting')}
            style={btnStyle(C.redBg, C.red, loading)}
          >
            ✗ 拒绝
          </button>
        </div>
      )}

      {mode === 'editing' && (
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>
            中文描述 (zh)
          </label>
          <textarea
            value={editedZh}
            onChange={(e) => setEditedZh(e.target.value)}
            rows={5}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              border: `1px solid ${C.rule}`,
              borderRadius: 8,
              fontSize: 13,
              color: C.ink,
              background: C.bg,
              resize: 'vertical',
              marginBottom: 12,
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              disabled={loading}
              onClick={() => doApprove(editedZh)}
              style={btnStyle(C.greenBg, C.green, loading)}
            >
              ✓ 确认通过
            </button>
            <button
              disabled={loading}
              onClick={() => setMode('idle')}
              style={btnStyle('#F3F4F6', '#374151', loading)}
            >
              取消
            </button>
          </div>
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
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              border: `1px solid ${C.rule}`,
              borderRadius: 8,
              fontSize: 13,
              color: C.ink,
              background: C.bg,
              resize: 'vertical',
              marginBottom: 12,
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              disabled={loading}
              onClick={doReject}
              style={btnStyle(C.redBg, C.red, loading)}
            >
              ✗ 确认拒绝
            </button>
            <button
              disabled={loading}
              onClick={() => setMode('idle')}
              style={btnStyle('#F3F4F6', '#374151', loading)}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg: string, color: string, disabled: boolean) {
  return {
    padding: '8px 18px',
    background: disabled ? '#E5E7EB' : bg,
    color: disabled ? '#9CA3AF' : color,
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  } as React.CSSProperties;
}
