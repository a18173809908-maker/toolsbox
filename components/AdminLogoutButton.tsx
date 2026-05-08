'use client';

import { useRouter } from 'next/navigation';

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '6px 16px',
        background: 'transparent',
        border: '1px solid #E8D5B7',
        borderRadius: 6,
        color: '#4B5563',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      退出登录
    </button>
  );
}
