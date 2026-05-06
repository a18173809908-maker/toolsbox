import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
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

const BASE = 'https://aiboxpro.cn';

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'AiToolsBox — AI 工具精选 + GitHub 趋势',
    template: '%s | AiToolsBox',
  },
  description:
    'AiToolsBox 精选 1,400+ AI 工具，实时追踪 GitHub 热门开源项目，每日更新 AI 资讯。The thoughtful directory of AI tools and a live pulse of what\'s trending on GitHub.',
  keywords: ['AI tools', 'AI 工具', 'GitHub trending', '开源', 'ChatGPT', 'Midjourney', 'Cursor'],
  authors: [{ name: 'AiToolsBox' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    url: BASE,
    siteName: 'AiToolsBox',
    title: 'AiToolsBox — AI 工具精选 + GitHub 趋势',
    description: '精选 1,400+ AI 工具，实时追踪 GitHub 热门开源项目，每日更新 AI 资讯。',
    images: [{ url: `${BASE}/og?type=default`, width: 1200, height: 630, alt: 'AiToolsBox' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AiToolsBox — AI 工具精选',
    description: '精选 AI 工具 + GitHub 趋势 · 每日更新',
    images: [`${BASE}/og?type=default`],
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
