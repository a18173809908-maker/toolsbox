// Design tokens — merged V1 editorial + V2 Pro warm palette.
export const v2Tokens = {
  bg:        '#FFF7ED',   // warm off-white canvas
  panel:     '#FFFFFF',   // card / sidebar / topbar surface
  panel2:    '#FEF3E2',   // hover fill
  ink:       '#1F2937',   // primary text (deep gray)
  inkSoft:   '#4B5563',   // secondary text
  inkMuted:  '#9CA3AF',   // placeholder / muted
  rule:      '#E8D5B7',   // borders (warm)
  ruleSoft:  '#F3E8D0',   // subtle separators
  primary:   '#F97316',   // warm orange — primary CTA, active state
  primaryBg: '#FFEDD5',   // light orange fill for badges / chips
  accent:    '#C2410C',   // dark orange for text on light bg
  green:     '#16A34A',   // stars / positive delta
  greenBg:   '#DCFCE7',
};

export type V2Tokens = typeof v2Tokens;
