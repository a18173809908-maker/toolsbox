import { fetchReadme } from '@/lib/github';
import { hasBaiduTranslateConfig, readmeExcerpt, translateReadmeExcerpt } from '@/lib/baidu-translate';
import { updateRepoReadmeZh } from '@/lib/db/queries';

const repo = process.argv[2];

if (!repo || !repo.includes('/')) {
  console.error('Usage: npm run translate:readme -- owner/repo');
  process.exit(1);
}

(async () => {
  const readme = await fetchReadme(repo);
  if (!readme) {
    console.error(`README not found for ${repo}`);
    process.exit(1);
  }

  if (!hasBaiduTranslateConfig()) {
    console.log('Baidu translate is not configured; skipping translation.');
    console.log('Set BAIDU_TRANSLATE_APP_ID and BAIDU_TRANSLATE_APP_KEY in .env.local.');
    console.log('\nExcerpt:\n');
    console.log(readmeExcerpt(readme));
    return;
  }

  const translated = await translateReadmeExcerpt(readme);
  if (!translated) {
    console.error('Baidu translate returned no translation.');
    process.exit(1);
  }

  await updateRepoReadmeZh(repo, translated);
  console.log(`Saved README translation for ${repo}`);
  console.log(translated);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
