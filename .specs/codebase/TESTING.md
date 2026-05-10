# Testing Strategy (Hackathon MVP)

**Context:** Greenfield build with 24-hour delivery constraints.

## Test Coverage Matrix

| Code Layer | Required Test Type | Rationale |
| --- | --- | --- |
| Domain logic (`src/lib/challenges/*`, `src/lib/eval/*`, `src/lib/progression/*`, `src/lib/security/*`) | unit | Core correctness and scoring logic must be deterministic and fast to verify |
| API routes (`src/app/api/**/route.ts`) | integration | Must verify request validation, DB writes, and provider integration boundaries |
| UI logic components (`src/components/**` excluding pure visual-only wrappers) | unit | Validate interaction/state behavior without requiring full browser e2e |
| 3D animation assets and clip content | none | Verified manually with visual QA during rehearsal |
| End-to-end full flow | none (manual) | For hackathon speed, use scripted manual demo rehearsal instead of full e2e framework |

## Parallelism Assessment

| Test Type | Parallel-Safe | Notes |
| --- | --- | --- |
| unit | Yes | Safe to run per-task in parallel if tasks do not mutate same files |
| integration | No | Uses shared SQLite state and API routes; execute sequentially for reliability |
| none | Yes | Parallelism depends only on code dependencies |

## Gate Check Commands

| Gate | Command | Purpose |
| --- | --- | --- |
| quick | `npm run lint && npm run test:unit` | Fast confidence check during iterative implementation |
| full | `npm run test && npm run build` | Pre-demo integration confidence + compile validation |
| build | `npm run build` | Compile-only smoke check for UI-only adjustments |

## Baseline Policy

- For each task that adds tests, baseline is the test count at task start.
- A task passes only if post-task count is `>= baseline` and includes new/updated tests for changed code.
- Silent test deletions are not allowed.
