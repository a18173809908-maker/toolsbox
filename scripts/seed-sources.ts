import { db } from '@/lib/db';
import { sources } from '@/lib/db/schema';

const RSS_SOURCES = [
  { name: 'OpenAI Blog', url: 'https://openai.com/blog', feedUrl: 'https://openai.com/blog/rss/', lang: 'en', type: 'news' },
  { name: 'Anthropic', url: 'https://www.anthropic.com', feedUrl: 'https://www.anthropic.com/rss.xml', lang: 'en', type: 'news' },
  { name: 'Google DeepMind', url: 'https://deepmind.google', feedUrl: 'https://deepmind.google/blog/rss.xml', lang: 'en', type: 'news' },
  { name: 'Hugging Face', url: 'https://huggingface.co', feedUrl: 'https://huggingface.co/blog/feed.xml', lang: 'en', type: 'news' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai', feedUrl: 'https://feeds.feedburner.com/venturebeat/SZYF', lang: 'en', type: 'news' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com', feedUrl: 'https://www.technologyreview.com/feed/', lang: 'en', type: 'news' },
  { name: 'The Verge', url: 'https://www.theverge.com', feedUrl: 'https://www.theverge.com/rss/index.xml', lang: 'en', type: 'news' },
  { name: 'Ars Technica', url: 'https://arstechnica.com', feedUrl: 'https://feeds.arstechnica.com/arstechnica/index', lang: 'en', type: 'news' },
  { name: '量子位', url: 'https://www.qbitai.com', feedUrl: 'https://www.qbitai.com/feed', lang: 'zh', type: 'news' },
  { name: '少数派', url: 'https://sspai.com', feedUrl: 'https://sspai.com/feed', lang: 'zh', type: 'news' },
  { name: 'InfoQ 中文', url: 'https://www.infoq.cn', feedUrl: 'https://www.infoq.cn/feed', lang: 'zh', type: 'news' },
  { name: '极客公园', url: 'https://www.geekpark.net', feedUrl: 'https://www.geekpark.net/rss', lang: 'zh', type: 'news' },
  { name: '36氪', url: 'https://36kr.com', feedUrl: 'https://36kr.com/feed', lang: 'zh', type: 'news' },
];

(async () => {
  console.log(`Seeding ${RSS_SOURCES.length} RSS sources...`);
  for (const src of RSS_SOURCES) {
    await db
      .insert(sources)
      .values(src)
      .onConflictDoUpdate({
        target: sources.feedUrl,
        set: { name: src.name, url: src.url, lang: src.lang, type: src.type, active: true },
      });
    console.log(`  ok ${src.name}`);
  }
  console.log('Done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
