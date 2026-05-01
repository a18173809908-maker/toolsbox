import { processToolCandidates } from '@/lib/jobs/process-tool-candidates';

(async () => {
  const result = await processToolCandidates();
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
