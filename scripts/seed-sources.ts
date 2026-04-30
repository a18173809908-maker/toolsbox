import { db } from '@/lib/db';
import { sources } from '@/lib/db/schema';

const RSS_SOURCES = [
  { name: 'OpenAI Blog',       url: 'https://openai.com/blog',                  feedUrl: 'https://openai.com/blog/rss/' },
  { name: 'Anthropic',         url: 'https://www.anthropic.com',                 feedUrl: 'https://www.anthropic.com/rss.xml' },
  { name: 'Google DeepMind',   url: 'https://deepmind.google',                  feedUrl: 'https://deepmind.google/blog/rss.xml' },
  { name: 'Hugging Face',      url: 'https://huggingface.co',                   feedUrl: 'https://huggingface.co/blog/feed.xml' },
  { name: 'VentureBeat AI',    url: 'https://venturebeat.com/category/ai',      feedUrl: 'https://feeds.feedburner.com/venturebeat/SZYF' },
  { name: 'MIT Tech Review',   url: 'https://www.technologyreview.com',         feedUrl: 'https://www.technologyreview.com/feed/' },
  { name: 'The Verge',         url: 'https://www.theverge.com',                 feedUrl: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Ars Technica',      url: 'https://arstechnica.com',                  feedUrl: 'https://feeds.arstechnica.com/arstechnica/index' },
];

(async () => {
  console.log(`Seeding ${RSS_SOURCES.length} RSS sources…`);
  for (const src of RSS_SOURCES) {
    await db.insert(sources).values(src).onConflictDoNothing();
    console.log(`  ✓ ${src.name}`);
  }
  console.log('Done.');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
