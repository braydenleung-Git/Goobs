# Project State

## Session

- Date: 2026-05-09
- Status: Planning in progress
- Focus: Spec-driven setup for 24hr hackathon MVP

## Decisions

- D-001: Use recommended stack (Next.js + TypeScript + React Three Fiber + Tailwind + Prisma/SQLite).
- D-002: Implement challenge completion with fully automatic checks using a hybrid evaluator (deterministic + LLM rubric).
- D-003: Persist state in SQLite for demo reliability across refresh/restart.
- D-004: Run demo primarily on local laptop.
- D-005: Support OpenAI-compatible endpoints using model discovery (`/models`) and model selection at runtime.
- D-006: Primary supported model fallback is `deepseek-v4-flash` if model discovery fails.
- D-007: Animation state contract is fixed to Idle/Thinking/Typing/Celebrate/Error.
- D-008: Progression in MVP includes real XP + level + unlocks for 3 shipped challenges.
- D-009: Global provider API key is persisted encrypted in DB using app-level AES-GCM with env master key.
- D-010: Team ownership is shared coding + shared assets; teammate focus is light frontend wiring.
- D-011: Gate commands are fixed: quick=`npm run lint && npm run test:unit`, full=`npm run test && npm run build`.
- D-012: Challenge completion policy is strict: deterministic pass AND rubric minimum are both required.
- D-013: Demo reset preserves saved agents, progress, and global provider settings.

## Open Questions

- OQ-001: Exact deterministic rules per challenge before LLM rubric stage.

## Blockers

- None currently.

## Todos

- T-PLAN-001: Finalize MVP feature spec with requirement IDs. (Done)
- T-PLAN-002: Finalize context decisions and scope guardrails. (Done)
- T-PLAN-003: Produce architecture design doc for mvp-workshop feature. (Done)
- T-PLAN-004: Produce granular tasks with ownership split and dependencies. (Done)

## Deferred Ideas

- Full 20-challenge catalog and all tier progression.
- PvP/battle systems.
- Multi-provider abstraction layer beyond OpenAI-compatible endpoint support.

## Preferences

- User prefers direct execution and rapid iteration over process overhead.
