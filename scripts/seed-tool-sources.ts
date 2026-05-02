import { db } from '@/lib/db';
import { sources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const TOOL_SOURCES = [
  {
    name: 'Product Hunt AI',
    url: 'https://www.producthunt.com/categories/artificial-intelligence',
    feedUrl: 'https://www.producthunt.com/feed?category=artificial-intelligence',
    type: 'tool',
    lang: 'en',
  },
  {
    name: 'BetaList AI',
    url: 'https://betalist.com/topics/artificial-intelligence',
    feedUrl: 'https://betalist.com/topics/artificial-intelligence/feed',
    type: 'tool',
    lang: 'en',
  },
  {
    name: 'Cut & Ship AI',
    url: 'https://www.cutandship.ai',
    feedUrl: 'https://www.cutandship.ai/feed.xml',
    type: 'tool',
    lang: 'en',
  },
];

const RETIRED_FEEDS = [
  'https://theresanaiforthat.com/feed/',
  'https://www.futurepedia.io/tool-releases.xml',
  'https://aitoolsdirectory.com/rss',
  'https://dreyx.com/digest/rss',
  'https://www.insidr.ai/feed/',
  'https://www.planet-ai.net/rss.xml',
  'https://aitoptools.com/feed/',
  'https://www.toolify.ai/rss',
  'https://topai.tools/rss',
  'https://www.musthave.ai/tools/feed',
  'https://www.musthave.ai/tools/rss',
  'https://www.musthave.ai/tools/api/rss',
];

(async () => {
  for (const feedUrl of RETIRED_FEEDS) {
    await db.update(sources).set({ active: false }).where(eq(sources.feedUrl, feedUrl));
  }

  console.log(`Seeding ${TOOL_SOURCES.length} tool sources...`);
  for (const src of TOOL_SOURCES) {
    await db
      .insert(sources)
      .values(src)
      .onConflictDoUpdate({
        target: sources.feedUrl,
        set: { name: src.name, url: src.url, type: src.type, lang: src.lang, active: true },
      });
    console.log(`  ok ${src.name}`);
  }
  console.log('Done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
