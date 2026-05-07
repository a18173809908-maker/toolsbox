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
      // 裸域 aiboxpro.cn 永久重定向到 www.aiboxpro.cn（301 而非 307），
      // 避免搜索引擎把两个域名视为重复内容、SEO 权重分散。
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'aiboxpro.cn' }],
        destination: 'https://www.aiboxpro.cn/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
