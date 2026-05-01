import { fetchToolCandidates } from '@/lib/jobs/fetch-tool-candidates';

(async () => {
  const result = await fetchToolCandidates();
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
