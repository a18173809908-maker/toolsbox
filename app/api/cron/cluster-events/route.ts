import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min — AI calls can be slow

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { seedSampleEvents, clusterRecentEvents } = await import('@/lib/jobs/cluster-events');

    // 1. 幂等补种 5 个初始样本事件
    const seedResult = await seedSampleEvents();

    // 2. 聚类最近 3 天文章
    const clusterResult = await clusterRecentEvents(3);

    return NextResponse.json({ ok: true, seed: seedResult, cluster: clusterResult });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
