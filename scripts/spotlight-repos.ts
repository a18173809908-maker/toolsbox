import { generateRepoSpotlights } from '../lib/jobs/spotlight-repos';

void (async () => {
  const result = await generateRepoSpotlights();
  console.log('Repo spotlight generation result:');
  console.log(`  generated: ${result.generated}`);
  console.log(`  skipped:   ${result.skipped}`);
  if (result.errors.length > 0) {
    console.log('  errors:');
    for (const e of result.errors) console.log(`    - ${e}`);
  }
})();
