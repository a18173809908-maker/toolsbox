import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';

config({ path: '.env.local' });

type ConnectivityInput = {
  toolId: string;
  carrier: 'general' | 'telecom' | 'unicom' | 'mobile';
  region?: string;
  status: 'direct' | 'proxy-needed' | 'blocked' | 'unknown';
  latencyMs?: number;
  source?: 'editor' | 'user-report';
  reportedAt?: string;
  reportedBy?: string;
  note?: string;
};
type ValidConnectivityInput = Omit<ConnectivityInput, 'source'> & {
  source: 'editor' | 'user-report';
};

const CARRIERS = new Set(['general', 'telecom', 'unicom', 'mobile']);
const STATUSES = new Set(['direct', 'proxy-needed', 'blocked', 'unknown']);
const SOURCES = new Set(['editor', 'user-report']);

function usage() {
  console.log(`用法:
  npm run seed:connectivity -- <measurements.json>

JSON 格式:
[
  {
    "toolId": "cursor",
    "carrier": "general",
    "region": "上海",
    "status": "proxy-needed",
    "source": "editor",
    "reportedAt": "2026-05-09",
    "reportedBy": "admin",
    "note": "家庭宽带测试"
  }
]`);
}

function validateRows(value: unknown): ValidConnectivityInput[] {
  if (!Array.isArray(value)) throw new Error('JSON 顶层必须是数组');
  return value.map((row, index) => {
    const item = row as Partial<ConnectivityInput>;
    if (!item.toolId) throw new Error(`第 ${index + 1} 行缺少 toolId`);
    if (!item.carrier || !CARRIERS.has(item.carrier)) throw new Error(`第 ${index + 1} 行 carrier 无效`);
    if (!item.status || !STATUSES.has(item.status)) throw new Error(`第 ${index + 1} 行 status 无效`);
    if (item.source && !SOURCES.has(item.source)) throw new Error(`第 ${index + 1} 行 source 无效`);
    if (item.latencyMs !== undefined && (!Number.isInteger(item.latencyMs) || item.latencyMs < 0)) {
      throw new Error(`第 ${index + 1} 行 latencyMs 必须是非负整数`);
    }
    return {
      toolId: item.toolId,
      carrier: item.carrier,
      region: item.region,
      status: item.status,
      latencyMs: item.latencyMs,
      source: item.source === 'user-report' ? 'user-report' : 'editor',
      reportedAt: item.reportedAt,
      reportedBy: item.reportedBy,
      note: item.note,
    };
  });
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath || filePath === '--help' || filePath === '-h') {
    usage();
    process.exit(filePath ? 0 : 1);
  }

  const [{ db }, { toolConnectivity }] = await Promise.all([
    import('@/lib/db'),
    import('@/lib/db/schema'),
  ]);

  const raw = await readFile(filePath, 'utf8');
  const rows = validateRows(JSON.parse(raw));
  if (rows.length === 0) {
    console.log('没有可导入的连通性数据');
    return;
  }

  await db.insert(toolConnectivity).values(rows.map((row) => ({
    toolId: row.toolId,
    carrier: row.carrier,
    region: row.region,
    status: row.status,
    latencyMs: row.latencyMs,
    source: row.source,
    reportedAt: row.reportedAt ? new Date(row.reportedAt) : new Date(),
    reportedBy: row.reportedBy,
    note: row.note,
  })));

  console.log(`已导入 ${rows.length} 条连通性测量数据`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
