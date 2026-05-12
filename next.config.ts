import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'icons.duckduckgo.com' },
    ],
  },
  async redirects() {
    return [
      // 裸域 aiboxpro.cn 永久重定向到 www.aiboxpro.cn
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'aiboxpro.cn' }],
        destination: 'https://www.aiboxpro.cn/:path*',
        permanent: true,
      },
      // 重复对比页 → 保留版本（301 永久重定向）
      { source: '/compare/claude-code-vs-cursor',    destination: '/compare/cursor-vs-claude-code',        permanent: true },
      { source: '/compare/cursor-vs-trae',           destination: '/compare/trae-vs-cursor',               permanent: true },
      { source: '/compare/cursor-vs-github-copilot', destination: '/compare/github-copilot-vs-cursor',     permanent: true },
      { source: '/compare/jimeng-vs-kling',          destination: '/compare/kling-vs-jimeng',              permanent: true },
      { source: '/compare/sora-vs-runway',           destination: '/compare/runway-vs-sora-cinematic',     permanent: true },
    ];
  },
};

export default nextConfig;
