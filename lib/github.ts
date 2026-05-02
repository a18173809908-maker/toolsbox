import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const GH_TOKEN = process.env.GITHUB_TOKEN;

const headers: HeadersInit = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'AiToolsBox/1.0',
  ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
};

export type GitHubRepoInfo = {
  topics: string[];
  language: string | null;
  license: { spdx_id: string; name: string } | null;
  pushed_at: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
};

export async function fetchRepoInfo(repo: string): Promise<GitHubRepoInfo | null> {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers,
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<GitHubRepoInfo>;
}

export async function fetchReadme(repo: string): Promise<string | null> {
  const res = await fetch(`https://api.github.com/repos/${repo}/readme`, {
    headers,
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json() as { content?: string; encoding?: string };
  if (data.encoding !== 'base64' || !data.content) return null;
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

function absolutizeReadmeLinks(markdown: string, repo: string) {
  const rawBase = `https://raw.githubusercontent.com/${repo}/HEAD/`;
  const blobBase = `https://github.com/${repo}/blob/HEAD/`;
  return markdown
    .replace(/!\[([^\]]*)\]\((?!https?:\/\/|#)([^)]+)\)/g, (_, alt: string, src: string) => `![${alt}](${rawBase}${src})`)
    .replace(/\[([^\]]+)\]\((?!https?:\/\/|#|mailto:)([^)]+)\)/g, (_, label: string, href: string) => `[${label}](${blobBase}${href})`);
}

export async function renderReadme(markdown: string, repo: string): Promise<string> {
  const fixed = absolutizeReadmeLinks(markdown, repo);
  const html = await marked.parse(fixed, { async: true });
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'details',
      'summary',
      'picture',
      'source',
      'kbd',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'align'],
      source: ['src', 'srcset', 'type'],
      code: ['class'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}
