const NEWS_TITLE_PATTERNS = [
  /digest/i,
  /newsletter/i,
  /\bdaily\b/i,
  /\bweekly\b/i,
  /\bmonthly\b/i,
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /issue\s*#?\d+/i,
  /vol\.?\s*\d+/i,
  /roundup/i,
  /recap/i,
  /\bwrap[\s-]?up\b/i,
];

const EDITORIAL_HOSTS = [
  'analyticsvidhya.com',
  'kdnuggets.com',
  'marktechpost.com',
  'techcrunch.com',
  'towardsdatascience.com',
  'wired.com',
];

const ARTICLE_PATH_PATTERNS = [
  /\/(article|blog|blogs|guide|guides|learn|news|p|podcast|post|posts|story|video)\//i,
  /\/\d{4}\/\d{2}\//,
];

function hostname(value?: string | null) {
  if (!value) return '';
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function pathname(value?: string | null) {
  if (!value) return '';
  try {
    return new URL(value).pathname;
  } catch {
    return '';
  }
}

export function looksLikeNewsTitle(name: string) {
  return NEWS_TITLE_PATTERNS.some((pattern) => pattern.test(name));
}

export function looksLikeArticleUrl(url?: string | null) {
  const host = hostname(url);
  const path = pathname(url);
  if (!host || !path) return false;

  if (host === 'blogs.nvidia.com') return true;
  if (host === 'aws.amazon.com' && path.startsWith('/blogs/')) return true;
  if (host === 'insidr.ai' && path !== '/' && !path.startsWith('/ai-tools')) return true;

  const isEditorialHost = EDITORIAL_HOSTS.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
  return isEditorialHost && ARTICLE_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

export function looksLikeToolNoise(input: { name: string; url?: string | null }) {
  return looksLikeNewsTitle(input.name) || looksLikeArticleUrl(input.url);
}
