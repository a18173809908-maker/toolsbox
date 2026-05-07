import V2ProHomepage from '@/components/V2Pro';
import { loadHomepageData } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.aiboxpro.cn';

export default async function Home() {
  const data = await loadHomepageData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AIBoxPro',
    url: BASE,
    description:
      'AIBoxPro 帮中文用户比较 AI 工具的价格、中文支持、国内使用情况、适合场景和替代方案。',
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
      <V2ProHomepage {...data} />
    </>
  );
}
