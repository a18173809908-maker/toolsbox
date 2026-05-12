// 起草事件立场字段 → event_verdicts 表（status='ai_drafted'）
// 用法：npm run draft:event-verdict <eventId>

import { db } from '@/lib/db';
import { events, eventVerdicts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { runDraft } from '@/lib/draft/runner';

async function main() {
  const eventId = process.argv[2];
  if (!eventId) {
    console.error('用法：npm run draft:event-verdict <eventId>');
    process.exit(1);
  }

  const rows = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  const event = rows[0];
  if (!event) {
    console.error(`事件不存在：${eventId}`);
    process.exit(1);
  }

  console.log(`起草 event-verdict：${event.title} (${eventId})`);

  const inputData = {
    id: event.id,
    title: event.title,
    summary: event.summary,
    body: event.body,
  };

  await runDraft({
    promptType: 'event-verdict',
    inputData,
    adminPath: '/admin/event-verdicts',
    insertFn: async ({ parsed, promptVersion, llmModel, antiClicheScore }) => {
      const d = parsed ?? {};
      const verdictOneLiner =
        typeof d.verdictOneLiner === 'string' ? d.verdictOneLiner : `事件评析：${event.title}`.slice(0, 50);
      const whoShouldCare = Array.isArray(d.whoShouldCare) ? (d.whoShouldCare as string[]) : [];
      const impactLevel = typeof d.impactLevel === 'string' ? d.impactLevel : null;
      const chinaImpact = typeof d.chinaImpact === 'string' ? d.chinaImpact : null;
      const relatedTools = Array.isArray(d.relatedTools)
        ? (d.relatedTools as { id: string; reason: string }[])
        : null;
      const caveats = Array.isArray(d.caveats) ? (d.caveats as string[]) : [];
      const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

      const result = await db
        .insert(eventVerdicts)
        .values({
          eventId: event.id,
          verdictOneLiner,
          whoShouldCare,
          impactLevel,
          chinaImpact,
          relatedTools,
          caveats,
          promptVersion,
          llmModel,
          antiClicheScore,
          expiresAt,
        })
        .returning({ id: eventVerdicts.id });

      return result[0].id;
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
