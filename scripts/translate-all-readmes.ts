import { hasBaiduTranslateConfig, translateReadmeExcerpt } from '@/lib/baidu-translate';
import { loadReposMissingReadmeZh, updateRepoReadmeZh } from '@/lib/db/queries';
import { fetchReadme } from '@/lib/github';

const limit = Math.max(1, Number(process.argv[2] ?? 10) || 10);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  if (!hasBaiduTranslateConfig()) {
    console.log('Baidu translate is not configured; skipping batch translation.');
    console.log('Set BAIDU_TRANSLATE_APP_ID and BAIDU_TRANSLATE_APP_KEY in .env.local.');
    return;
  }

  const repos = await loadReposMissingReadmeZh(limit);
  let translated = 0;
  let skipped = 0;

  for (const repo of repos) {
    const readme = await fetchReadme(repo);
    if (!readme) {
      skipped++;
      continue;
    }

    const zh = await translateReadmeExcerpt(readme);
    if (!zh) {
      skipped++;
      continue;
    }

    await updateRepoReadmeZh(repo, zh);
    translated++;
    console.log(`saved ${repo}`);
    await sleep(1100);
  }

  console.log(JSON.stringify({ translated, skipped, checked: repos.length }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
