import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ tools: [], articles: [] });
  }

  const { searchTools, searchArticles } = await import('@/lib/db/queries');
  const [tools, articles] = await Promise.all([
    searchTools(q, 20),
    searchArticles(q, 8),
  ]);

  return NextResponse.json({ tools, articles });
}
