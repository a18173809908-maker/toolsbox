import { db } from '@/lib/db';
import { tools } from '@/lib/db/schema';
import { ilike, eq } from 'drizzle-orm';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

type ProductHuntTool = {
  id: string;
  name: string;
  url: string | null;
};

const READER_PREFIX = 'https://r.jina.ai/http://';
const BATCH_SIZE = 2;
const execFileAsync = promisify(execFile);
const MANUAL_OVERRIDES: Record<string, string> = {
  'https://www.producthunt.com/products/agentchat': 'https://www.agentchat.me/',
  'https://www.producthunt.com/products/monid': 'https://monid.ai/',
  'https://www.producthunt.com/products/nylas': 'https://cli.nylas.com/',
  'https://www.producthunt.com/products/wozcode': 'https://www.wozcode.com/',
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toProductHuntEmbedUrl(url: string) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const productIndex = parts.indexOf('products');
  const slug = productIndex >= 0 ? parts[productIndex + 1] : null;

  if (!slug) return null;

  return `https://www.producthunt.com/products/${slug}/embed`;
}

function cleanWebsiteUrl(raw: string) {
  const parsed = new URL(raw);
  const blockedParams = ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  for (const param of blockedParams) {
    parsed.searchParams.delete(param);
  }

  parsed.hash = '';
  return parsed.toString();
}

function isUsefulWebsite(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, '');
  return host !== 'producthunt.com' && !host.endsWith('.producthunt.com');
}

function extractVisitWebsite(markdown: string) {
  const match = markdown.match(/\[Visit website\]\((https?:\/\/[^)\s]+)\)/i);
  if (!match) return null;

  try {
    const cleaned = cleanWebsiteUrl(match[1]);
    return isUsefulWebsite(cleaned) ? cleaned : null;
  } catch {
    return null;
  }
}

async function fetchProductWebsite(productHuntUrl: string) {
  const override = MANUAL_OVERRIDES[productHuntUrl.replace(/\/$/, '')];
  if (override) return override;

  const embedUrl = toProductHuntEmbedUrl(productHuntUrl);
  if (!embedUrl) return null;

  const readerUrl = `${READER_PREFIX}${embedUrl}`;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const { stdout } = await execFileAsync(
      'curl.exe',
      ['-L', '--silent', '--show-error', '--max-time', '30', '-A', 'ai-toolbox-url-repair/1.0', readerUrl],
      { maxBuffer: 1024 * 1024 },
    );
    const websiteUrl = extractVisitWebsite(stdout);

    if (websiteUrl || attempt === 3) {
      return websiteUrl;
    }

    await sleep(500 * attempt);
  }

  return null;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const rows: ProductHuntTool[] = await db
    .select({ id: tools.id, name: tools.name, url: tools.url })
    .from(tools)
    .where(ilike(tools.url, '%producthunt.com/products/%'));

  console.log(`Found ${rows.length} Product Hunt tool URLs.`);

  async function processRow(row: ProductHuntTool) {
    if (!row.url) {
      return { updated: 0, skipped: 1 };
    }

    try {
      console.log(`checking: ${row.name}`);
      const websiteUrl = await fetchProductWebsite(row.url);

      if (!websiteUrl) {
        console.log(`skip: ${row.name} (${row.url})`);
        return { updated: 0, skipped: 1 };
      }

      console.log(`${apply ? 'update' : 'preview'}: ${row.name}`);
      console.log(`  ${row.url}`);
      console.log(`  -> ${websiteUrl}`);

      if (apply) {
        await db.update(tools).set({ url: websiteUrl }).where(eq(tools.id, row.id));
      }

      return { updated: 1, skipped: 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`error: ${row.name} (${row.url}) ${message}`);
      return { updated: 0, skipped: 1 };
    }
  }

  let updated = 0;
  let skipped = 0;

  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    const results = await Promise.all(batch.map(processRow));
    updated += results.reduce((sum, result) => sum + result.updated, 0);
    skipped += results.reduce((sum, result) => sum + result.skipped, 0);
    await sleep(100);
  }

  console.log(`Done. ${apply ? 'Updated' : 'Would update'} ${updated}, skipped ${skipped}.`);

  if (!apply) {
    console.log('Run with --apply to write changes.');
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Product Hunt URL repair failed:', error);
  process.exit(1);
});
