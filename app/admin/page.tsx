'use client';

import React from 'react';

const C = {
  bg:      '#FFF7ED',
  panel:   '#FFFFFF',
  ink:     '#1F2937',
  inkSoft: '#4B5563',
  rule:    '#E8D5B7',
  primary: '#F97316',
};

/**
 * Admin 首页占位（I8.2）。I8.3 会替换为：
 *   - 三类待审核数量徽章（工具候选 / 对比页草稿 / 资讯）
 *   - 跳转到三类列表页的入口
 *   - 今日已审核统计
 *
 * 当前仅用于验证 I8.2 鉴权流程：未登录访问会被 middleware 重定向到
 * /admin/login，登录成功后会跳到这里。
 */
export default function AdminHomePage() {
  const [logoutPending, setLogoutPending] = React.useState(false);

  async function handleLogout() {
    setLogoutPending(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch {
      setLogoutPending(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        padding: 'clamp(28px, 5vw, 56px) clamp(20px, 5vw, 40px)',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0, color: C.ink, fontFamily: 'Georgia, serif', fontSize: 32 }}>
            AIBoxPro Admin
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutPending}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: C.inkSoft,
              border: `1px solid ${C.rule}`,
              borderRadius: 8,
              cursor: logoutPending ? 'not-allowed' : 'pointer',
              fontSize: 13,
            }}
          >
            {logoutPending ? '登出中…' : '登出'}
          </button>
        </header>

        <div
          style={{
            background: C.panel,
            border: `1px solid ${C.rule}`,
            borderRadius: 12,
            padding: 'clamp(22px, 4vw, 32px)',
            color: C.inkSoft,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          <p style={{ margin: '0 0 12px', color: C.ink, fontWeight: 700 }}>
            ✅ 鉴权流程已就位（I8.2）
          </p>
          <p style={{ margin: 0 }}>
            后台审核功能将在后续任务中上线：
          </p>
          <ul style={{ margin: '12px 0 0', paddingLeft: 22 }}>
            <li><strong>I8.3</strong>：三类待审核内容列表（工具候选 / 对比页草稿 / 资讯抽审）</li>
            <li><strong>I8.4</strong>：单条审核详情页 + 通过 / 拒绝 / 隐藏 操作</li>
            <li><strong>I8.5</strong>：自动处理脚本不再直接 publish，改为草稿待审</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
