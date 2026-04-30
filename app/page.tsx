import V2ProHomepage from '@/components/V2Pro';
import { loadHomepageData } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await loadHomepageData();
  return <V2ProHomepage {...data} />;
}
