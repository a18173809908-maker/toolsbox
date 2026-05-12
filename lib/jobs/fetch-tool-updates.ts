/**
 * 工具动态抓取 job
 *
 * 流程：
 * 1. 用 YouTube Data API v3 搜索「{工具名} 近7天」的视频
 * 2. 按视频数量自动判断热门工具（出现多 = 热度高）
 * 3. 对热门工具取 top 视频，用 youtube-transcript 抓字幕
 * 4. DeepSeek LLM 提炼成中文文章（动态 or 教程）
 * 5. 写入 tool_updates 表，status='ai_drafted'，等管理员审核发布
 *
 * 环境变量：
 *   YOUTUBE_API_KEY  — YouTube Data API v3
 */

import { and, eq } from 'drizzle-orm';
import { YoutubeTranscript } from 'youtube-transcript';
import { db } from '@/lib/db';
import { toolUpdates } from '@/lib/db/schema';
import { chat } from '@/lib/llm';

// 要追踪的工具列表 — YouTube 视频数量决定实际处理优先级，这里是候选范围
const TRACKED_TOOLS = [
  { name: 'Cursor', id: 'cursor' },
  { name: 'Claude', id: null },
  { name: 'ChatGPT', id: null },
  { name: 'Gemini', id: null },
  { name: 'Codex', id: null },
  { name: 'GitHub Copilot', id: 'github-copilot' },
  { name: 'Midjourney', id: 'midjourney' },
  { name: 'Sora', id: 'sora' },
  { name: 'Runway', id: 'runway' },
  { name: 'Kling AI', id: 'kling-ai' },
  { name: 'Trae', id: 'trae' },
  { name: 'Windsurf', id: 'windsurf' },
  { name: 'Bolt', id: null },
  { name: 'v0', id: null },
  { name: 'Perplexity', id: 'perplexity' },
  { name: 'Kimi', id: 'kimi' },
  { name: 'DeepSeek', id: 'deepseek' },
  { name: '豆包', id: 'doubao' },
];

// 每次 job 最多处理几个工具
const MAX_TOOLS_PER_RUN = 5;
// 每个工具最多处理几个视频
const MAX_VIDEOS_PER_TOOL = 2;

function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function extractJson(s: string): string | null {
  const fenced = s.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenced) return fenced[1];
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return null;
}

// ─── YouTube Search ───────────────────────────────────────────────────────────

type YTVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
};

async function searchYouTube(toolName: string, maxResults = 5): Promise<YTVideo[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  // 搜索最近7天内的视频
  const publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('q', `${toolName} AI`);
  url.searchParams.set('type', 'video');
  url.searchParams.set('order', 'viewCount');          // 按观看数排序，热门优先
  url.searchParams.set('publishedAfter', publishedAfter);
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('relevanceLanguage', 'en');     // 英文视频为主，内容更丰富
  url.searchParams.set('videoDuration', 'any');        // 不限时长，字幕抓取阶段再过滤
  url.searchParams.set('key', key);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const data = await res.json() as {
      items?: {
        id: { videoId: string };
        snippet: { title: string; channelTitle: string; publishedAt: string; description: string };
      }[];
    };
    return (data.items ?? []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description.slice(0, 300),
    }));
  } catch {
    return [];
  }
}

// ─── Transcript ───────────────────────────────────────────────────────────────

async function fetchTranscript(videoId: string): Promise<string | null> {
  // 依次尝试：英文、自动字幕、无语言限制
  const attempts = [
    () => YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' }),
    () => YoutubeTranscript.fetchTranscript(videoId, { lang: 'en-US' }),
    () => YoutubeTranscript.fetchTranscript(videoId),
  ];
  for (const attempt of attempts) {
    try {
      const items = await attempt();
      if (items && items.length > 20) {
        const text = items.map((i) => i.text).join(' ');
        return text.slice(0, 6000);
      }
    } catch {
      // 继续下一种
    }
  }
  return null;
}

// ─── LLM Synthesis ───────────────────────────────────────────────────────────

type UpdateDraft = {
  titleZh: string;
  contentType: 'update' | 'tutorial';
  body: string;
};

async function synthesizeUpdate(
  toolName: string,
  video: YTVideo,
  transcript: string | null,
): Promise<UpdateDraft | null> {
  const hasTranscript = !!transcript;
  const contentSource = hasTranscript
    ? `字幕内容：\n${transcript}`
    : `视频描述：\n${video.description}\n\n注意：没有字幕，仅根据视频标题和描述撰写，内容以已知信息为主，避免猜测细节。`;

  const prompt = `你是专门为中文 AI 从业者写内容的编辑。根据以下 YouTube 视频信息，写一篇关于「${toolName}」的中文文章。

**判断内容类型**：
- 如果视频主要讲工具的新功能/版本更新/最新动态 → contentType = "update"
- 如果视频主要讲如何使用工具/教程/技巧 → contentType = "tutorial"

**写作要求**：
- 只写能从提供信息中确认的内容，不要虚构功能
- 用具体的操作步骤或功能点，不要空泛描述
- 中文读者看得懂、用得上

**输出 JSON**（只返回 JSON）：
{
  "titleZh": "中文标题，不超过30字，点明核心内容",
  "contentType": "update" 或 "tutorial",
  "body": "完整中文文章，Markdown 格式，400-1000字"
}

---

视频标题：${video.title}
频道：${video.channelTitle}
发布时间：${video.publishedAt.slice(0, 10)}

${contentSource}`;

  try {
    const raw = await chat([{ role: 'user', content: prompt }], { maxTokens: 1800, tier: 'premium' });
    const jsonStr = extractJson(raw);
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr) as Partial<UpdateDraft>;
    if (!parsed.titleZh || !parsed.body) return null;
    return {
      titleZh: String(parsed.titleZh).trim().slice(0, 60),
      contentType: parsed.contentType === 'tutorial' ? 'tutorial' : 'update',
      body: String(parsed.body).trim(),
    };
  } catch {
    return null;
  }
}

// ─── Main Job ─────────────────────────────────────────────────────────────────

export type FetchToolUpdatesResult = {
  generated: number;
  skipped: number;
  errors: string[];
  toolsProcessed: string[];
};

export async function fetchToolUpdates(): Promise<FetchToolUpdatesResult> {
  const currentWeek = isoWeek(new Date());
  const result: FetchToolUpdatesResult = {
    generated: 0,
    skipped: 0,
    errors: [],
    toolsProcessed: [],
  };

  if (!process.env.YOUTUBE_API_KEY) {
    result.errors.push('YOUTUBE_API_KEY not set');
    return result;
  }

  // 搜索所有工具，按视频数量排序 → 自动识别本周最热的工具
  type ToolWithVideos = { tool: typeof TRACKED_TOOLS[number]; videos: YTVideo[] };
  const toolResults: ToolWithVideos[] = [];

  for (const tool of TRACKED_TOOLS) {
    const videos = await searchYouTube(tool.name, 3);
    if (videos.length > 0) {
      toolResults.push({ tool, videos });
    }
    // 避免超配额，每次搜索间隔 200ms
    await new Promise((r) => setTimeout(r, 200));
  }

  // 按本周视频数量降序 → 热门工具优先
  toolResults.sort((a, b) => b.videos.length - a.videos.length);

  // 只处理前 N 个最热工具
  const hotTools = toolResults.slice(0, MAX_TOOLS_PER_RUN);

  for (const { tool, videos } of hotTools) {
    let toolGenerated = 0;

    for (const video of videos.slice(0, MAX_VIDEOS_PER_TOOL)) {
      // 去重：同一周同一视频不重复处理
      const existing = await db
        .select({ id: toolUpdates.id })
        .from(toolUpdates)
        .where(
          and(
            eq(toolUpdates.snapshotWeek, currentWeek),
            eq(toolUpdates.sourceUrl, `https://www.youtube.com/watch?v=${video.videoId}`),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        result.skipped++;
        continue;
      }

      // 抓字幕（失败时 fallback 到 description）
      const transcript = await fetchTranscript(video.videoId);

      // LLM 合成
      const draft = await synthesizeUpdate(tool.name, video, transcript);
      if (!draft) {
        result.errors.push(`LLM failed for ${tool.name}: ${video.videoId}`);
        continue;
      }

      // 写入数据库
      await db.insert(toolUpdates).values({
        toolId: tool.id ?? null,
        toolName: tool.name,
        sourceType: 'youtube',
        sourceUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
        sourceTitle: video.title,
        sourceChannel: video.channelTitle,
        contentType: draft.contentType,
        titleZh: draft.titleZh,
        body: draft.body,
        snapshotWeek: currentWeek,
        status: 'ai_drafted',
      });

      result.generated++;
      toolGenerated++;
    }

    if (toolGenerated > 0) {
      result.toolsProcessed.push(tool.name);
    }
  }

  return result;
}
