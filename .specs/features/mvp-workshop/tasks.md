# MVP Workshop Tasks

**Design**: `.specs/features/mvp-workshop/design.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Foundation (Mostly Sequential)

Core setup, persistence, and secure provider configuration.

```text
T1 -> T2 -> T3 -> T5 -> T6 -> T7 -> T8
  \-> T4 -----------/
```

### Phase 2: Core Challenge Engine (Parallel Where Safe)

Domain logic tasks are unit-test parallel-safe; integration routes remain sequential.

```text
After T5:
  T9 [P]   T10 [P]

After T9 + T10:
  T11 [P]  T12 [P]  T13 [P]  T14 [P]

Then sequential integration:
  T15 -> T16
```

### Phase 3: UX + 3D + Demo Readiness

UI and presentation layers, then hardening.

```text
After T6/T7/T8/T9:
  T17 [P]

After T15:
  T18 [P]  T19 [P]

Then:
  T20 -> T21

After T16/T17/T18/T19:
  T22

Final:
  T23
```

---

## Task Breakdown

### T1: Initialize Next.js Baseline

**What**: Create project baseline (Next.js App Router, TypeScript, Tailwind, lint/test scripts skeleton).
**Where**: `package.json`, `next.config.*`, `tsconfig.json`, `src/app/*`
**Depends on**: None
**Reuses**: Standard Next.js defaults
**Owner**: You + AI
**Requirement**: MVP-01

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Next.js app runs locally
- [ ] Lint and test scripts exist in `package.json`
- [ ] Build passes: `npm run build`

**Tests**: none
**Gate**: build

**Verify**: `npm run build` exits 0.

---

### T2: Define Prisma Schema and Migrations

**What**: Create Prisma models for provider config, enriched agents, challenge runs, progress, workstation state, and reward events.
**Where**: `prisma/schema.prisma`, `prisma/migrations/*`
**Depends on**: T1
**Reuses**: Prisma SQLite conventions
**Owner**: You + AI
**Requirement**: MVP-01, MVP-08, MVP-12, MVP-13, MVP-14, MVP-15, MVP-17, MVP-18

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] All planned MVP entities are modeled including agent skills/tools/color and workstation unlock state
- [ ] Migration applies successfully
- [ ] Build passes: `npm run build`

**Tests**: none
**Gate**: build

**Verify**: `npx prisma migrate dev` then `npm run build` exit 0.

---

### T3: Add Prisma Client Singleton

**What**: Implement shared Prisma client utility for server-side modules.
**Where**: `src/lib/db/prisma.ts`
**Depends on**: T2
**Reuses**: Standard singleton pattern for Next.js server runtime
**Owner**: You + AI
**Requirement**: MVP-01, MVP-08

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Single shared Prisma client utility is available
- [ ] Importing modules compile cleanly
- [ ] Build passes: `npm run build`

**Tests**: none
**Gate**: build

**Verify**: `npm run build` exits 0 with DB utility imports present.

---

### T4: Implement Secret Vault (AES-GCM)

**What**: Build encrypt/decrypt utility for provider API key storage using env master key.
**Where**: `src/lib/security/secret-vault.ts`, `src/lib/security/secret-vault.test.ts`
**Depends on**: T1
**Reuses**: Node crypto primitives
**Owner**: You + AI
**Requirement**: MVP-13

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Encrypt/decrypt roundtrip succeeds for valid key material
- [ ] Invalid key/version payload fails safely
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- secret-vault` passes.

---

### T5: Implement ProviderConfigService

**What**: Create service for saving/loading base URL and encrypted global provider key.
**Where**: `src/lib/provider/provider-config-service.ts`, `src/lib/provider/provider-config-service.test.ts`
**Depends on**: T3, T4
**Reuses**: Prisma client from `src/lib/db/prisma.ts`
**Owner**: You + AI
**Requirement**: MVP-02, MVP-03, MVP-13

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Save/load flow works with encrypted key payloads
- [ ] Service returns redacted key metadata to UI callers
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- provider-config-service` passes.

---

### T6: Create Provider Settings API Route

**What**: Add `GET/PUT /api/provider` route with validation and safe error payloads.
**Where**: `src/app/api/provider/route.ts`, `src/app/api/provider/route.integration.test.ts`
**Depends on**: T5
**Reuses**: ProviderConfigService
**Owner**: You + AI
**Requirement**: MVP-02, MVP-03, MVP-11, MVP-13

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] GET returns provider config without exposing plaintext key
- [ ] PUT validates inputs and persists encrypted credentials
- [ ] Error responses are actionable and secret-safe
- [ ] Gate check passes: `npm run test && npm run build`
- [ ] Test count: >= baseline + 1 integration suite passes (no silent deletions)

**Tests**: integration
**Gate**: full

**Verify**: `npm run test -- provider.route.integration` passes.

---

### T7: Create Agents API Routes

**What**: Add `GET/POST/PATCH /api/agents` for user-built agent CRUD with skills, tools, and model color fields.
**Where**: `src/app/api/agents/route.ts`, `src/app/api/agents/route.integration.test.ts`
**Depends on**: T3
**Reuses**: Prisma models for AgentProfile
**Owner**: You + AI
**Requirement**: MVP-01, MVP-18

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Agents can be created, listed, and updated
- [ ] Input validation prevents malformed prompt/model/skills/tools/color payloads
- [ ] Gate check passes: `npm run test && npm run build`
- [ ] Test count: >= baseline + 1 integration suite passes (no silent deletions)

**Tests**: integration
**Gate**: full

**Verify**: `npm run test -- agents.route.integration` passes.

---

### T8: Add Prebuilt Agent Seeder

**What**: Add deterministic prebuilt agent seed logic available on fresh startup.
**Where**: `src/lib/agents/prebuilt-seed.ts`, `src/lib/agents/prebuilt-seed.test.ts`
**Depends on**: T7
**Reuses**: Agents API data shape
**Owner**: You + AI
**Requirement**: MVP-09

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] At least one prebuilt agent appears in list on clean DB
- [ ] Seeder is idempotent (no duplicate inserts)
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- prebuilt-seed` passes.

---

### T9: Implement OpenAI-Compatible Client

**What**: Build client for model discovery and chat runs with fallback model behavior.
**Where**: `src/lib/llm/openai-compatible-client.ts`, `src/lib/llm/openai-compatible-client.test.ts`
**Depends on**: T5
**Reuses**: ProviderConfigService
**Owner**: You + AI
**Requirement**: MVP-02, MVP-03, MVP-04

**Tools**:

- MCP: `filesystem`, `context7`
- Skill: `context7-mcp`

**Done when**:

- [ ] `listModels` supports provider endpoint response parsing
- [ ] Empty/error model lists fall back to `OpenCode/deepseek-v4-flash`
- [ ] Model normalization includes capability tags used by workstation routing (at minimum image-capable flag)
- [ ] Chat run path returns normalized output payload
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- openai-compatible-client` passes.

---

### T10: Implement 3-Challenge Catalog

**What**: Define challenge metadata, prompts, XP, workstation targets, and evaluation config for 3 shipped challenges.
**Where**: `src/lib/challenges/catalog.ts`, `src/lib/challenges/catalog.test.ts`
**Depends on**: T1
**Reuses**: Challenge names and rewards from `AGENT_WORKSHOP.md`
**Owner**: You + AI
**Requirement**: MVP-04, MVP-16

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Catalog exposes `change-prompt`, `code-writer`, `multi-tool`
- [ ] XP, workstation target, and rubric configs are defined per challenge
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- catalog` passes.

---

### T11: Implement Deterministic Evaluation Rules

**What**: Implement objective checks for each shipped challenge.
**Where**: `src/lib/eval/deterministic-evaluator.ts`, `src/lib/eval/deterministic-evaluator.test.ts`
**Depends on**: T10
**Reuses**: ChallengeCatalog config
**Owner**: You + AI
**Requirement**: MVP-06

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Each challenge has explicit deterministic pass/fail checks
- [ ] Evaluator output contains score + rationale fields
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- deterministic-evaluator` passes.

---

### T12: Implement Rubric Scorer + Merge Policy

**What**: Implement rubric scoring and strict merge logic (deterministic pass AND rubric minimum).
**Where**: `src/lib/eval/rubric-scorer.ts`, `src/lib/eval/evaluation-engine.ts`, `src/lib/eval/evaluation-engine.test.ts`
**Depends on**: T9, T10
**Reuses**: OpenAI-compatible client and challenge rubric config
**Owner**: You + AI
**Requirement**: MVP-07, MVP-08

**Tools**:

- MCP: `filesystem`, `context7`
- Skill: `context7-mcp`

**Done when**:

- [ ] Rubric scorer returns normalized score/rationale payload
- [ ] Merge policy requires deterministic pass and rubric threshold
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- evaluation-engine` passes.

---

### T13: Implement Progression Service

**What**: Implement XP/level/unlock application with idempotent reward event guard and workstation unlock progression.
**Where**: `src/lib/progression/progression-service.ts`, `src/lib/progression/progression-service.test.ts`
**Depends on**: T3, T10
**Reuses**: Challenge reward config + Prisma event table
**Owner**: You + AI
**Requirement**: MVP-08, MVP-17

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] XP and level update logic is deterministic
- [ ] Duplicate reward apply for same run is prevented
- [ ] Unlock payload updates are persisted including workstation unlock state
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- progression-service` passes.

---

### T14: Implement Challenge Runner Service

**What**: Orchestrate run lifecycle, workstation assignment, movement events, model call, and runtime state emission payload.
**Where**: `src/lib/runs/challenge-runner.ts`, `src/lib/runs/challenge-runner.test.ts`
**Depends on**: T9, T10
**Reuses**: OpenAI client + challenge catalog
**Owner**: You + AI
**Requirement**: MVP-04, MVP-05, MVP-16

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Runner emits lifecycle-compatible states for UI/3D adapter
- [ ] Runner emits workstation assignment and movement start/arrival events
- [ ] Image-generation workstation runs are blocked unless selected model is image-capable
- [ ] Runner returns normalized attempt artifact payload
- [ ] Error path maps to `Error` state with recoverable message
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- challenge-runner` passes.

---

### T15: Create Challenge Run API Route

**What**: Add `POST /api/challenges/run` to execute runner, evaluate results, persist run history, and apply progression.
**Where**: `src/app/api/challenges/run/route.ts`, `src/app/api/challenges/run/route.integration.test.ts`
**Depends on**: T6, T7, T11, T12, T13, T14
**Reuses**: Runner + EvaluationEngine + ProgressionService
**Owner**: You + AI
**Requirement**: MVP-04, MVP-06, MVP-07, MVP-08, MVP-12

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Route executes full run pipeline for each challenge slug
- [ ] Response includes final pass/fail, scores, rationale, XP delta, level snapshot
- [ ] Run artifacts are persisted for history
- [ ] Gate check passes: `npm run test && npm run build`
- [ ] Test count: >= baseline + 1 integration suite passes (no silent deletions)

**Tests**: integration
**Gate**: full

**Verify**: `npm run test -- challenges.run.route.integration` passes.

---

### T16: Create Demo Reset API Route

**What**: Add non-destructive reset endpoint that clears transient runtime state but preserves agents/progress/provider config.
**Where**: `src/app/api/demo/reset/route.ts`, `src/app/api/demo/reset/route.integration.test.ts`
**Depends on**: T3, T15
**Reuses**: Run/progress stores and reset policy from context
**Owner**: You + AI
**Requirement**: MVP-10, MVP-11

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Reset endpoint preserves configured long-lived records
- [ ] Transient session/run buffers are cleared quickly
- [ ] Gate check passes: `npm run test && npm run build`
- [ ] Test count: >= baseline + 1 integration suite passes (no silent deletions)

**Tests**: integration
**Gate**: full

**Verify**: `npm run test -- demo.reset.route.integration` passes.

---

### T17: Build Config Panels UI

**What**: Build provider settings and agent configuration panels (including prebuilt selection).
**Where**: `src/components/workshop/config-panels.tsx`, `src/components/workshop/config-panels.test.tsx`
**Depends on**: T6, T7, T8, T9
**Reuses**: Provider and agents APIs
**Owner**: Shared (You + Teammate)
**Requirement**: MVP-01, MVP-02, MVP-03, MVP-09, MVP-13, MVP-18

**Tools**:

- MCP: `filesystem`
- Skill: `frontend-design`

**Done when**:

- [ ] User can save provider config and agent config from UI
- [ ] Agent config supports skills, tools, and model color
- [ ] Model picker reflects discovered/fallback models
- [ ] UI enforces image-capable model selection when agent is marked for image generation tasks
- [ ] Prebuilt agent can be loaded and edited
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- config-panels` passes.

---

### T18: Build Challenge Execution UI

**What**: Build challenge selector + run trigger UI with workstation routing indicator, runtime state indicator, and output display.
**Where**: `src/components/workshop/challenge-runner-panel.tsx`, `src/components/workshop/challenge-runner-panel.test.tsx`
**Depends on**: T15
**Reuses**: Challenge run API response shape
**Owner**: You + AI
**Requirement**: MVP-04, MVP-05, MVP-16

**Tools**:

- MCP: `filesystem`
- Skill: `frontend-design`

**Done when**:

- [ ] User can run each shipped challenge from UI
- [ ] Runtime state badge updates during run lifecycle
- [ ] Assigned workstation and movement progress are visible during run
- [ ] Output text and completion payload render correctly
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- challenge-runner-panel` passes.

---

### T19: Build Evaluation + Progress UI

**What**: Build evaluation summary, XP/level HUD, workstation unlock feed, and run history panel.
**Where**: `src/components/workshop/progress-and-history.tsx`, `src/components/workshop/progress-and-history.test.tsx`
**Depends on**: T15
**Reuses**: Challenge run result and progression snapshot payloads
**Owner**: You + AI
**Requirement**: MVP-06, MVP-07, MVP-08, MVP-12, MVP-17

**Tools**:

- MCP: `filesystem`
- Skill: `frontend-design`

**Done when**:

- [ ] Pass/fail and score/rationale are visible after each run
- [ ] XP/level/unlocks update immediately on pass
- [ ] Workstation unlock status updates immediately on qualifying pass
- [ ] Recent run history is displayed and selectable
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- progress-and-history` passes.

---

### T20: Implement Runtime State Adapter

**What**: Create adapter from app run lifecycle/workstation events to fixed 3D states (`Idle/Thinking/Typing/Celebrate/Error`).
**Where**: `src/components/scene/runtime-state-adapter.ts`, `src/components/scene/runtime-state-adapter.test.ts`
**Depends on**: T18
**Reuses**: Challenge runner panel event model and workstation assignment events
**Owner**: You + AI
**Requirement**: MVP-05, MVP-16

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] All lifecycle and workstation movement transitions map to one of 5 contract states
- [ ] Failure and recovery transitions return to `Idle`
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- runtime-state-adapter` passes.

---

### T21: Wire Scene and 3D Animation Hooks

**What**: Connect teammate-provided scene layout and animation clips/controllers to runtime adapter and workstation contract.
**Where**: `src/components/scene/agent-scene.tsx` (and teammate asset hook files)
**Depends on**: T20
**Reuses**: Runtime state adapter + teammate animation assets
**Owner**: Teammate (primary) + You support
**Requirement**: MVP-05, MVP-14, MVP-15, MVP-16

**Tools**:

- MCP: `filesystem`
- Skill: `frontend-design`

**Done when**:

- [ ] Scene starts as blank isometric plane and shows spawned agents
- [ ] Idle agents continuously play idle animation
- [ ] Each runtime state visibly triggers intended animation behavior
- [ ] Agents route to mapped workstation and play workstation-specific animation
- [ ] Missing clip fallback does not crash scene
- [ ] Build passes: `npm run build`

**Tests**: none
**Gate**: build

**Verify**: Manual scene check and `npm run build` exit 0.

---

### T22: Build Demo Controls + Judge Criteria Panel

**What**: Add UI for demo reset controls, fallback guidance, and explicit mapping to judging criteria.
**Where**: `src/components/workshop/demo-controls.tsx`, `src/components/workshop/demo-controls.test.tsx`
**Depends on**: T16, T17, T18, T19
**Reuses**: Reset API and live run metrics
**Owner**: Shared (You + Teammate)
**Requirement**: MVP-10, MVP-11, MVP-15

**Tools**:

- MCP: `filesystem`
- Skill: `frontend-design`

**Done when**:

- [ ] Reset control triggers non-destructive reset endpoint
- [ ] Fallback guidance is visible for provider/model failures
- [ ] Criteria panel clearly maps app features (scene growth and workstations included) to all 4 judging categories
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- demo-controls` passes.

---

### T23: Final Hardening + Rehearsal Evidence

**What**: Run full gate, fix blocking defects, and produce a repeatable 90-second rehearsal checklist.
**Where**: `README.md` (demo runbook section), touched bugfix files as needed
**Depends on**: T21, T22
**Reuses**: All implemented MVP systems
**Owner**: You + AI
**Requirement**: MVP-10, MVP-11

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Full gate passes: `npm run test && npm run build`
- [ ] Two consecutive local demo rehearsals complete without manual data cleanup
- [ ] Demo runbook includes fallback script for model/provider failure scenario

**Tests**: none
**Gate**: full

**Verify**: Execute full gate and rehearsal checklist end-to-end.

---

## Parallel Execution Map

```text
Phase 1 (Sequential with branch):
  T1 -> T2 -> T3 -> T5 -> T6 -> T7 -> T8
        \-> T4 ------/

Phase 2 (Parallel-safe unit tasks):
  After T5:
    T9 [P], T10 [P]
  After T9 + T10:
    T11 [P], T12 [P], T13 [P], T14 [P]
  Then sequential integration:
    T15 -> T16

Phase 3 (UI + 3D):
  T17 [P] (after T6/T7/T8/T9)
  T18 [P], T19 [P] (after T15)
  T20 (after T18)
  T21 (after T20)
  T22 (after T16/T17/T18/T19)
  T23 (after T21/T22)
```

**Parallelism constraint validation:**

- Integration-test tasks (`T6`, `T7`, `T15`, `T16`) are not marked `[P]`.
- `[P]` tasks are unit-test or no-test and do not depend on sibling `[P]` tasks in the same wave.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | App scaffold setup | PASS Granular |
| T2 | Prisma schema/migration | PASS Granular |
| T3 | DB client utility | PASS Granular |
| T4 | Secret vault utility | PASS Granular |
| T5 | Provider config service | PASS Granular |
| T6 | Provider API route | PASS Granular |
| T7 | Agents API route | PASS Granular |
| T8 | Prebuilt seeding module | PASS Granular |
| T9 | Provider LLM client | PASS Granular |
| T10 | Challenge catalog | PASS Granular |
| T11 | Deterministic evaluator | PASS Granular |
| T12 | Rubric/merge evaluator | PASS Granular |
| T13 | Progression service | PASS Granular |
| T14 | Challenge runner service | PASS Granular |
| T15 | Challenge run API route | PASS Granular |
| T16 | Demo reset API route | PASS Granular |
| T17 | Config panels UI | PASS Granular |
| T18 | Challenge execution UI | PASS Granular |
| T19 | Eval/progress/history UI | PASS Granular |
| T20 | Runtime adapter | PASS Granular |
| T21 | 3D state hook wiring | PASS Granular |
| T22 | Demo controls/judging panel | PASS Granular |
| T23 | Hardening + runbook | PASS Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | None | PASS Match |
| T2 | T1 | T1 -> T2 | PASS Match |
| T3 | T2 | T2 -> T3 | PASS Match |
| T4 | T1 | T1 -> T4 | PASS Match |
| T5 | T3, T4 | T3 -> T5 and T4 -> T5 | PASS Match |
| T6 | T5 | T5 -> T6 | PASS Match |
| T7 | T3 | T3 -> T7 | PASS Match |
| T8 | T7 | T7 -> T8 | PASS Match |
| T9 | T5 | T5 -> T9 | PASS Match |
| T10 | T1 | T1 -> T10 | PASS Match |
| T11 | T10 | T10 -> T11 | PASS Match |
| T12 | T9, T10 | T9 -> T12 and T10 -> T12 | PASS Match |
| T13 | T3, T10 | T3 -> T13 and T10 -> T13 | PASS Match |
| T14 | T9, T10 | T9 -> T14 and T10 -> T14 | PASS Match |
| T15 | T6, T7, T11, T12, T13, T14 | Arrows from all listed tasks to T15 | PASS Match |
| T16 | T3, T15 | T3 -> T16 and T15 -> T16 | PASS Match |
| T17 | T6, T7, T8, T9 | Arrows from all listed tasks to T17 | PASS Match |
| T18 | T15 | T15 -> T18 | PASS Match |
| T19 | T15 | T15 -> T19 | PASS Match |
| T20 | T18 | T18 -> T20 | PASS Match |
| T21 | T20 | T20 -> T21 | PASS Match |
| T22 | T16, T17, T18, T19 | Arrows from all listed tasks to T22 | PASS Match |
| T23 | T21, T22 | T21 -> T23 and T22 -> T23 | PASS Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Project scaffold/infrastructure | none | none | PASS OK |
| T2 | Prisma schema/migration | none | none | PASS OK |
| T3 | DB utility infrastructure | none | none | PASS OK |
| T4 | `src/lib/security/*` domain logic | unit | unit | PASS OK |
| T5 | `src/lib/provider/*` domain logic | unit | unit | PASS OK |
| T6 | `src/app/api/**/route.ts` | integration | integration | PASS OK |
| T7 | `src/app/api/**/route.ts` | integration | integration | PASS OK |
| T8 | `src/lib/agents/*` domain logic | unit | unit | PASS OK |
| T9 | `src/lib/llm/*` domain logic | unit | unit | PASS OK |
| T10 | `src/lib/challenges/*` domain logic | unit | unit | PASS OK |
| T11 | `src/lib/eval/*` domain logic | unit | unit | PASS OK |
| T12 | `src/lib/eval/*` domain logic | unit | unit | PASS OK |
| T13 | `src/lib/progression/*` domain logic | unit | unit | PASS OK |
| T14 | `src/lib/runs/*` domain logic | unit | unit | PASS OK |
| T15 | `src/app/api/**/route.ts` | integration | integration | PASS OK |
| T16 | `src/app/api/**/route.ts` | integration | integration | PASS OK |
| T17 | `src/components/**` UI logic | unit | unit | PASS OK |
| T18 | `src/components/**` UI logic | unit | unit | PASS OK |
| T19 | `src/components/**` UI logic | unit | unit | PASS OK |
| T20 | `src/components/**` UI logic | unit | unit | PASS OK |
| T21 | 3D assets/wiring | none | none | PASS OK |
| T22 | `src/components/**` UI logic | unit | unit | PASS OK |
| T23 | rehearsal/runbook + bugfixes | none (or inherited by touched code) | none | PASS OK |

---

## Tooling Confirmation for Execute

Before implementation starts, confirm per-task tool usage preferences.

- **Default MCPs**: `filesystem`, `context7` (for API/library checks), `bash` (tests/build)
- **Default skills**: `context7-mcp` for SDK/API certainty, `frontend-design` for panel/UI implementation quality
