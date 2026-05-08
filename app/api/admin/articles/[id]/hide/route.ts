import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
  }

  const result = await db
    .update(articles)
    .set({ status: 'hidden', reviewedBy: 'admin', reviewedAt: new Date() })
    .where(eq(articles.id, articleId));

  if (!result.rowCount) {
    return NextResponse.json({ ok: false, error: '资讯不存在' }, { status: 404 });
  }

  revalidatePath('/admin/articles');
  revalidatePath('/news');

  return NextResponse.json({ ok: true });
}
