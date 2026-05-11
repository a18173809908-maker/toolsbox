import { loadHomepageData, loadArticles } from '@/lib/db/queries';
import { HomePageClient } from './HomePageClient';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.aiboxpro.cn';

export default async function Home() {
  const [homeData, articles] = await Promise.all([
    loadHomepageData(),
    loadArticles({ limit: 3 }),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AIBoxPro',
    url: BASE,
    description:
      '面向中文用户的AI工具选择与使用指南平台，帮你找到真正好用的AI工具',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE}/tools?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient
        tools={homeData.tools}
        categories={homeData.categories}
        trending={homeData.trending}
        articles={articles}
      />
    </>
  );
}
