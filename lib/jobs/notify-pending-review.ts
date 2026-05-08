import { Resend } from 'resend';
import { db } from '@/lib/db';
import { toolCandidates, comparisons, articles } from '@/lib/db/schema';
import { count, inArray, gt } from 'drizzle-orm';

const BASE_URL = 'https://www.aiboxpro.cn';

export async function notifyPendingReview(): Promise<{ sent: boolean; tools: number; comparisons: number; articles: number }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [toolRows, compRows, artRows] = await Promise.all([
    db.select({ value: count() }).from(toolCandidates)
      .where(inArray(toolCandidates.status, ['ai_drafted', 'processed'])),
    db.select({ value: count() }).from(comparisons)
      .where(inArray(comparisons.status, ['draft'])),
    db.select({ value: count() }).from(articles)
      .where(gt(articles.publishedAt, oneDayAgo)),
  ]);

  const pendingTools = toolRows[0]?.value ?? 0;
  const pendingComparisons = compRows[0]?.value ?? 0;
  const recentArticles = artRows[0]?.value ?? 0;

  if (pendingTools === 0 && pendingComparisons === 0 && recentArticles === 0) {
    return { sent: false, tools: 0, comparisons: 0, articles: 0 };
  }

  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!resendKey || !notifyEmail) {
    throw new Error('RESEND_API_KEY or ADMIN_NOTIFY_EMAIL not configured');
  }

  const resend = new Resend(resendKey);
  const subject = `AIBoxPro 审核提醒：${pendingTools} 条工具 / ${pendingComparisons} 条对比页待审`;

  const html = `
<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="margin:0 0 16px;font-size:20px;color:#1F2937">AIBoxPro 审核提醒</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;color:#4B5563">工具候选待审</td>
      <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;text-align:right;font-weight:600;color:#F97316">${pendingTools} 条</td>
    </tr>
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;color:#4B5563">对比页草稿待审</td>
      <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;text-align:right;font-weight:600;color:#F97316">${pendingComparisons} 条</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#4B5563">最近 24 小时新资讯</td>
      <td style="padding:10px 0;text-align:right;font-weight:600;color:#6B7280">${recentArticles} 条</td>
    </tr>
  </table>
  <a href="${BASE_URL}/admin" style="display:inline-block;padding:10px 20px;background:#F97316;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
    前往后台审核 →
  </a>
</div>`;

  await resend.emails.send({
    from: 'AIBoxPro <noreply@aiboxpro.cn>',
    to: notifyEmail,
    subject,
    html,
  });

  return { sent: true, tools: Number(pendingTools), comparisons: Number(pendingComparisons), articles: Number(recentArticles) };
}
