import { fetchAibotSitemapCandidates } from '@/lib/jobs/fetch-aibot-sitemap';

const limit = Number.parseInt(process.argv[2] ?? '20', 10);
const offset = Number.parseInt(process.argv[3] ?? '0', 10);

(async () => {
  const result = await fetchAibotSitemapCandidates(
    Number.isFinite(limit) ? limit : 20,
    Number.isFinite(offset) ? offset : 0,
  );
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
