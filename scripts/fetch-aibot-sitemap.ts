import { fetchAibotSitemapCandidates } from '@/lib/jobs/fetch-aibot-sitemap';

const limit = Number.parseInt(process.argv[2] ?? '20', 10);

(async () => {
  const result = await fetchAibotSitemapCandidates(Number.isFinite(limit) ? limit : 20);
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
