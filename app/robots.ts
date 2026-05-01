import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*',           allow: '/', disallow: '/api/' },
      { userAgent: 'Baiduspider', allow: '/'                    },
    ],
    sitemap: 'https://aiboxpro.cn/sitemap.xml',
  };
}
