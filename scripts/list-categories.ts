import { db } from '../lib/db/index';
import { categories } from '../lib/db/schema';

async function main() {
  const cats = await db.select().from(categories);
  console.log('数据库中的分类：');
  console.log(JSON.stringify(cats, null, 2));
}

main().catch(console.error);
