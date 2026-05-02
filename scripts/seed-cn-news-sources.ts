import { db } from '@/lib/db';
import { sources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const CN_NEWS_SOURCES = [
  {
    name: '机器之心',
    url: 'https://www.jiqizhixin.com',
    feedUrl: 'https://www.jiqizhixin.com/rss',
    lang: 'zh',
    type: 'news',
  },
  {
    name: '量子位',
    url: 'https://www.qbitai.com',
    feedUrl: 'https://www.qbitai.com/feed',
    lang: 'zh',
    type: 'news',
  },
  {
    name: '36氪 AI',
    url: 'https://36kr.com',
    feedUrl: 'https://36kr.com/feed',
    lang: 'zh',
    type: 'news',
  },
  {
    name: 'InfoQ 中文 AI',
    url: 'https://www.infoq.cn',
    feedUrl: 'https://www.infoq.cn/feed.xml',
    lang: 'zh',
    type: 'news',
  },
  {
    name: '虎嗅 AI',
    url: 'https://www.huxiu.com',
    feedUrl: 'https://www.huxiu.com/rss/0.xml',
    lang: 'zh',
    type: 'news',
  },
  {
    name: 'PingWest 品玩',
    url: 'https://www.pingwest.com',
    feedUrl: 'https://www.pingwest.com/feed',
    lang: 'zh',
    type: 'news',
  },
  {
    name: '钛媒体 AI',
    url: 'https://www.tmtpost.com',
    feedUrl: 'https://www.tmtpost.com/rss.xml',
    lang: 'zh',
    type: 'news',
  },
];

(async () => {
  await db
    .update(sources)
    .set({ active: false })
    .where(eq(sources.type, 'news'));

  console.log('Disabled existing news sources.');

  for (const src of CN_NEWS_SOURCES) {
    await db
      .insert(sources)
      .values({ ...src, active: true })
      .onConflictDoUpdate({
        target: sources.feedUrl,
        set: {
          name: src.name,
          url: src.url,
          lang: src.lang,
          type: src.type,
          active: true,
        },
      });
    console.log(`Enabled ${src.name}: ${src.feedUrl}`);
  }

  console.log(`Done. Active Chinese news sources targeted: ${CN_NEWS_SOURCES.length}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
