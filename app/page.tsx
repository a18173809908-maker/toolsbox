import V2ProHomepage from '@/components/V2Pro';
import { loadHomepageData } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const BASE = 'https://toolsbox-six.vercel.app';

export default async function Home() {
  const data = await loadHomepageData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AiToolsBox',
    url: BASE,
    description: '精选 AI 工具目录与 GitHub 开源趋势追踪平台',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE}/?q={search_term_string}`,
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
