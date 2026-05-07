import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SiteFooter } from '@/components/SiteFooter';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
});

const BASE = 'https://www.aiboxpro.cn';

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'AIBoxPro | 中文 AI 工具决策平台',
    template: '%s | AIBoxPro',
  },
  description:
    'AIBoxPro 帮中文用户比较 AI 工具的价格、中文支持、国内使用情况、适合场景和替代方案，快速判断哪个工具更适合自己。',
  keywords: [
    'AI 工具',
    'AI 工具推荐',
    'AI 工具对比',
    '中文 AI 工具',
    'AI 编程工具',
    'Claude Code',
    'Codex',
    'Cursor',
  ],
  authors: [{ name: 'AIBoxPro' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    url: BASE,
    siteName: 'AIBoxPro',
    title: 'AIBoxPro | 中文 AI 工具决策平台',
    description:
      '比较价格、中文支持、国内使用情况、适合场景和替代方案，让中文用户更快完成 AI 工具选型。',
    images: [{ url: `${BASE}/og?type=default`, width: 1200, height: 630, alt: 'AIBoxPro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIBoxPro | 中文 AI 工具决策平台',
    description: '帮中文用户更快完成 AI 工具选型。',
    images: [`${BASE}/og?type=default`],
  },
  alternates: { canonical: BASE },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
