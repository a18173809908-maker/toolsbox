# CLAUDE.md

## Project Context For Claude Code

This repository is shared by Codex and Claude Code. Treat this file as the first local orientation note before making changes.

### Current Position

AIBoxPro is no longer just an "AI tools directory".

Current positioning:

> A Chinese-language AI tool selection, comparison, and usage-decision platform.

The main product value is helping Chinese users decide which AI tool to use for a real task. The tool database is the base layer, but the strategic differentiator is comparison, China-specific usability, scenarios, and practical decision support.

Read these docs first:

1. `docs/aiboxpro_详细版竞品分析与发展路线方案.md` - long-term strategic direction and product structure.
2. `docs/phased-roadmap.md` - multi-phase execution plan derived from the detailed roadmap.
3. `HANDOFF.md` - current engineering status, environment, completed work, and commands.
4. `docs/current-position.md` - compressed current positioning and what not to do.
5. `docs/sprint-3.md` - active AI video category plan.
6. `docs/manual-tasks.md` - future manual work pool; currently paused.
7. `docs/README.md` - active docs index.

Archived documents under `docs/archive/2026-05-09-doc-reset/` are historical reference only. Do not treat them as current instructions unless the user explicitly asks to revive something from the archive.

### Current Active Track

The long-term direction follows `docs/aiboxpro_详细版竞品分析与发展路线方案.md`: tool database + news + GitHub trends + tutorials + rankings + comparisons + scenario solutions + later monetization.

The current product/content track is the AI video category. Treat AI video as the first wedge to prove the broader strategy, not as the final scope of the project.

Near-term priorities:

- Continue P1 public content flow polish: tool library, tool detail pages, `/news`, and `/trending` should help users decide what is worth opening, not just display generated summaries.
- `/news` currently uses a single `AI 资讯` heading, no category filter pill row, wide reading cards, share/copy actions, and a right-side "最近 3 天热门事件" list based on concrete high-hotness article titles.
- Keep `/news` hot events concrete. Avoid generic labels such as "模型发布" or "行业动态" as the main hot-topic output.
- Strengthen video alternative pages, especially Runway alternatives for Chinese users.
- Build doc-based video scenario pages that do not require manual testing.
- Improve automatic internal linking across tools, comparisons, alternatives, and scenarios.
- Keep comparison pages tied to official sources.
- Mark untested claims clearly; do not publish quality/speed/stability rankings without real tests.

Avoid for now:

- Competing mainly on the number of tools collected.
- Generating thin tool summaries at scale.
- Any work that requires manual participation for now: real Lab testing, human review as a release blocker, manual social distribution, vendor outreach, community operations, or business development.
- Adding login, comments, community scoring, or membership features.
- Shipping visible roadmap/status copy such as "稍后会补" in production pages.
- Expanding into many new categories before the video track is credible.

### Collaboration Rules

- Codex and Claude Code may both edit this repository. Before editing, check `git status --short` and avoid overwriting changes you did not make.
- Keep changes surgical. If you archive or delete docs, update `docs/README.md`, `HANDOFF.md`, and this file when relevant.
- Prefer the current docs listed above over older strategy drafts. The detailed competitive roadmap is now an active strategic source, not an archived note.
- For code changes, verify with `npm run lint` and `npm run build` unless the change is documentation-only.
- Do not run `npm run db:seed` casually; it clears and re-inserts seed rows.

---

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
