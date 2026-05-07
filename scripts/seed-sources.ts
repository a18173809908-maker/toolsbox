// =============================================================================
//  ⚠️  DEPRECATED — DO NOT RUN
// -----------------------------------------------------------------------------
//  此脚本是早期英文资讯源的 seed 实现，已被 scripts/seed-cn-news-sources.ts
//  替代（G4 任务）。当前平台只使用中文资讯源。
//
//  保留此文件作为代码考古，便于追溯历史决策。如果误跑，会重新启用 OpenAI Blog /
//  DeepMind / The Verge 等英文源，与白皮书 §2.5（中文用户为主力）方向冲突。
//
//  正确命令：
//      npm run seed:cn-news-sources
//
//  原始 RSS_SOURCES 列表参见 git history：
//      git show 67c876d^:scripts/seed-sources.ts
// =============================================================================
console.error(
  '[deprecated] scripts/seed-sources.ts 已废弃。请改用：\n' +
  '    npm run seed:cn-news-sources\n' +
  '原因：平台资讯源已切换为中文（见 docs/whitepaper.md §2.5）。'
);
process.exit(1);
