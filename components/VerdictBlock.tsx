import type { ToolVerdict } from '@/lib/db/schema';

const POSITION_STYLE: Record<string, { bg: string; color: string }> = {
  '强烈推荐': { bg: '#DCFCE7', color: '#166534' },
  '推荐': { bg: '#D1FAE5', color: '#065F46' },
  '视场景': { bg: '#FEF3C7', color: '#92400E' },
  '谨慎选择': { bg: '#FEE2E2', color: '#991B1B' },
  '不推荐': { bg: '#FEE2E2', color: '#7F1D1D' },
};

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

type Props = { verdict: ToolVerdict };

export function VerdictBlock({ verdict }: Props) {
  const posStyle = POSITION_STYLE[verdict.positionToday ?? ''] ?? { bg: '#F3F4F6', color: '#374151' };
  const daysLeft = verdict.expiresAt ? daysUntil(verdict.expiresAt) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 30;

  return (
    <div style={{
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderRadius: 16,
      padding: 'clamp(20px, 4vw, 28px) clamp(18px, 5vw, 40px)',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 18, fontWeight: 850, color: '#1F2937', margin: 0 }}>编辑立场</h2>
        {verdict.positionToday && (
          <span style={{
            padding: '3px 12px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            background: posStyle.bg,
            color: posStyle.color,
          }}>
            {verdict.positionToday}
          </span>
        )}
        {isExpiringSoon && (
          <span style={{
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: '#FEF3C7',
            color: '#92400E',
          }}>
            ⚠ 立场将在 {daysLeft} 天后过期
          </span>
        )}
      </div>

      <p style={{ fontSize: 15, color: '#1F2937', lineHeight: 1.7, margin: '0 0 16px' }}>
        {verdict.verdictOneLiner}
      </p>

      {verdict.whoShouldPick && verdict.whoShouldPick.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 6 }}>适合选择</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {verdict.whoShouldPick.map((item, i) => (
              <li key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>✓ {item}</li>
            ))}
          </ul>
        </div>
      )}

      {verdict.whoShouldSkip && verdict.whoShouldSkip.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#991B1B', marginBottom: 6 }}>不适合选择</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {verdict.whoShouldSkip.map((item, i) => (
              <li key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>· {item}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, color: '#9CA3AF' }}>
        立场更新于 {verdict.verdictUpdatedAt.toLocaleDateString('zh-CN')}
        {daysLeft !== null && !isExpiringSoon && <span>，有效期至 {verdict.expiresAt!.toLocaleDateString('zh-CN')}</span>}
      </div>
    </div>
  );
}
