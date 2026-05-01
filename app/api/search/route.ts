import { NextRequest, NextResponse } from 'next/server';
import { searchTools, searchArticles } from '@/lib/db/queries';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ tools: [], articles: [] });
  }

  const [tools, articles] = await Promise.all([
    searchTools(q, 20),
    searchArticles(q, 8),
  ]);

  return NextResponse.json({ tools, articles });
}
