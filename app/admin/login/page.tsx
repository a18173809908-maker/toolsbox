'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const C = {
  bg:       '#FFF7ED',
  panel:    '#FFFFFF',
  ink:      '#1F2937',
  inkSoft:  '#4B5563',
  inkMuted: '#6B7280',
  rule:     '#E8D5B7',
  primary:  '#F97316',
  accent:   '#C2410C',
  errorBg:  '#FEE2E2',
  error:    '#991B1B',
};

export default function AdminLoginPage() {
  // useSearchParams 必须在 Suspense 内调用（Next.js prerender 限制）
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginShell() {
  // Suspense fallback：登录前的静态空壳，与 LoginForm 视觉一致避免闪烁
  return <div style={{ minHeight: '100vh', background: C.bg }} />;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin';

  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error === 'ADMIN_PASSWORD not configured' ? '服务端未配置 ADMIN_PASSWORD' : '密码错误');
        return;
      }
      // 登录成功，跳到原本要去的页面（防止 next 参数被恶意构造为外站）
      const safeNext = nextPath.startsWith('/admin') ? nextPath : '/admin';
      router.replace(safeNext);
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(20px, 5vw, 40px)',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 400,
          background: C.panel,
          border: `1px solid ${C.rule}`,
          borderRadius: 12,
          padding: 'clamp(28px, 5vw, 40px)',
          boxShadow: '0 8px 26px rgba(24, 32, 28, .06)',
        }}
      >
        <h1
          style={{
            margin: '0 0 8px',
            color: C.ink,
            fontFamily: 'Georgia, serif',
            fontSize: 28,
            lineHeight: 1.2,
          }}
        >
          AIBoxPro Admin
        </h1>
        <p style={{ margin: '0 0 24px', color: C.inkSoft, fontSize: 14, lineHeight: 1.6 }}>
          内容审核后台，仅授权人员可访问。
        </p>

        <label
          htmlFor="admin-password"
          style={{ display: 'block', marginBottom: 6, color: C.ink, fontSize: 13, fontWeight: 600 }}
        >
          密码
        </label>
        <input
          id="admin-password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={submitting}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            minHeight: 42,
            padding: '10px 14px',
            border: `1px solid ${C.rule}`,
            borderRadius: 8,
            background: C.bg,
            color: C.ink,
            fontSize: 15,
            outline: 'none',
            marginBottom: 14,
          }}
        />

        {error ? (
          <div
            style={{
              marginBottom: 14,
              padding: '10px 12px',
              borderRadius: 8,
              background: C.errorBg,
              color: C.error,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting || password.length === 0}
          style={{
            width: '100%',
            minHeight: 42,
            padding: '11px 14px',
            background: submitting || password.length === 0 ? C.inkMuted : C.primary,
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            borderRadius: 8,
            cursor: submitting || password.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? '登录中…' : '登录'}
        </button>
      </form>
    </div>
  );
}
