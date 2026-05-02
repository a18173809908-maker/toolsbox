import crypto from 'node:crypto';

const API = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

function credentials() {
  const appid = process.env.BAIDU_TRANSLATE_APP_ID;
  const key = process.env.BAIDU_TRANSLATE_APP_KEY;
  if (!appid || !key) return null;
  return { appid, key };
}

export function hasBaiduTranslateConfig() {
  return Boolean(credentials());
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, (m) => m.replace(/\[|\]\([^)]+\)/g, ''))
    .replace(/[#>*_`|~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function readmeExcerpt(markdown: string, maxLength = 1400) {
  return stripMarkdown(markdown).slice(0, maxLength);
}

export async function translateWithBaidu(text: string, from = 'en', to = 'zh'): Promise<string | null> {
  const cred = credentials();
  if (!cred || !text.trim()) return null;

  const salt = String(Date.now());
  const sign = crypto
    .createHash('md5')
    .update(`${cred.appid}${text}${salt}${cred.key}`)
    .digest('hex');

  const body = new URLSearchParams({
    q: text,
    from,
    to,
    appid: cred.appid,
    salt,
    sign,
  });

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = await res.json() as {
    trans_result?: { src: string; dst: string }[];
    error_code?: string;
  };
  if (data.error_code || !data.trans_result?.length) return null;
  return data.trans_result.map((row) => row.dst).join('\n');
}

export async function translateReadmeExcerpt(markdown: string) {
  const excerpt = readmeExcerpt(markdown);
  return translateWithBaidu(excerpt);
}
