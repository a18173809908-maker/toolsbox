import { db } from '@/lib/db';
import { sources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const TOOL_SOURCES = [
  {
    name: 'DreyX AI Digest',
    url: 'https://dreyx.com',
    feedUrl: 'https://dreyx.com/digest/rss',
    type: 'tool',
    lang: 'en',
  },
  {
    name: 'Insidr AI Tools',
    url: 'https://www.insidr.ai',
    feedUrl: 'https://www.insidr.ai/feed/',
    type: 'tool',
    lang: 'en',
  },
  {
    name: 'Planet AI',
    url: 'https://www.planet-ai.net',
    feedUrl: 'https://www.planet-ai.net/rss.xml',
    type: 'tool',
    lang: 'en',
  },
];

const RETIRED_FEEDS = [
  'https://theresanaiforthat.com/feed/',
  'https://www.futurepedia.io/tool-releases.xml',
  'https://aitoolsdirectory.com/rss',
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
