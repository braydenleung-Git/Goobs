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

### Phase 4: Agent Runtime — Sandboxed Tools (Parallel-Safe Domain)

New runtime layer enabling multi-turn tool use. Domain logic tasks are parallel-safe; integration follows.

```text
After T23 (existing codebase stable):
  T24 [P]  T25 [P]  T30 [P]  T31 [P]  T35 [P]

After T24 + T25:
  T26 [P]  T27 [P]  T28 [P]

After T25 + T33:
  T34 [P]

After T24 + T28 + T30 + T31:
  T29

After T29:
  T32 -> T33

After T32 + T33 + T35:
  T36

After T24:
  T37
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

### T24: Create WorkspaceManager [P]

**What**: Implement workspace path management under `~/.goobs/workspaces/{agentId}/` with path traversal protection.
**Where**: `src/lib/runtime/workspace.ts`, `src/lib/runtime/workspace.test.ts`
**Depends on**: None
**Reuses**: Node `fs/promises`, `path`
**Owner**: You + AI
**Requirement**: MVP-19, MVP-22, MVP-23, MVP-27

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] `getWorkspacePath()` returns correct `~/.goobs/workspaces/{agentId}/workspace/` path
- [ ] `getRunPath()` returns `~/.goobs/workspaces/{agentId}/runs/{runId}/` path
- [ ] `resolveSafePath()` resolves relative paths and throws on traversal attempts (`../../etc/passwd`)
- [ ] `ensureWorkspace()` creates directories on first use
- [ ] `getRunArtifacts()` lists files created in a run directory
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- workspace` passes.

---

### T25: Create Tool Types [P]

**What**: Define TypeScript types for tool definitions, tool calls, tool results, and the ToolHandler interface (OpenAI-compatible function calling format).
**Where**: `src/lib/runtime/tools/types.ts`
**Depends on**: None
**Reuses**: None (pure types)
**Owner**: You + AI
**Requirement**: MVP-20, MVP-21, MVP-29

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] `ToolDefinition` type matches OpenAI function calling schema
- [ ] `ToolCall` type for parsed LLM tool call requests
- [ ] `ToolResult` type with success/output/data fields
- [ ] `ToolHandler` interface with `definitions` and `execute` methods
- [ ] All types exported from `src/lib/runtime/tools/index.ts`
- [ ] Build passes: `npm run build`

**Tests**: none
**Gate**: build

**Verify**: `npm run build` exits 0.

---

### T26: Create Filesystem Tools [P]

**What**: Implement sandboxed `read_file`, `write_file`, `list_files` tools as a ToolHandler that restricts operations to the agent's workspace.
**Where**: `src/lib/runtime/tools/filesystem.ts`, `src/lib/runtime/tools/filesystem.test.ts`
**Depends on**: T24, T25
**Reuses**: WorkspaceManager
**Owner**: You + AI
**Requirement**: MVP-19

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] `read_file` returns file contents or clear error (file not found, path blocked)
- [ ] `write_file` creates/writes file and returns success confirmation
- [ ] `list_files` returns directory listing (recursive and top-level)
- [ ] All paths validated through `WorkspaceManager.resolveSafePath()` — traversal blocked
- [ ] `createFilesystemTools()` factory returns a `ToolHandler` with all 3 tool definitions
- [ ] Tool definitions match OpenAI function calling schema with JSON Schema parameters
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- filesystem` passes.

---

### T27: Create Bash Tool [P]

**What**: Implement `exec_bash` tool that runs commands in the workspace directory with a 10-second timeout, returning `{stdout, stderr, exitCode}`.
**Where**: `src/lib/runtime/tools/bash.ts`, `src/lib/runtime/tools/bash.test.ts`
**Depends on**: T24, T25
**Reuses**: WorkspaceManager (for working directory), Node `child_process.exec`
**Owner**: You + AI
**Requirement**: MVP-20

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Runs a command in the agent's workspace directory as `cwd`
- [ ] Returns `{stdout, stderr, exitCode}` after command completion
- [ ] Timeout kills process and returns exit code 124 with "timeout" error
- [ ] Shell-injection prevented (command is single arg to `exec`, not shell-expanded from user)
- [ ] `createBashTool()` factory returns a `ToolHandler` with single `exec_bash` definition
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- bash` passes.

---

### T28: Create ToolRegistry [P]

**What**: Implement extensible tool registry that merges definitions from all handlers and routes tool calls to the correct handler.
**Where**: `src/lib/runtime/tool-registry.ts`, `src/lib/runtime/tool-registry.test.ts`
**Depends on**: T25
**Reuses**: Tool types from `tools/types.ts`
**Owner**: You + AI
**Requirement**: MVP-28, MVP-29

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] `register(handler)` adds a handler's definitions to the merged schema
- [ ] `getDefinitions()` returns all tool definitions as OpenAI-compatible array
- [ ] `execute(name, args)` routes to correct handler and returns `ToolResult`
- [ ] Unknown tool names return error result with "Unknown tool" message
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- tool-registry` passes.

---

### T29: Create AgentRuntime [P]

**What**: Implement multi-turn tool-use loop. Send messages + tool definitions to LLM, execute tool calls, feed results back, repeat until stop or max turns.
**Where**: `src/lib/runtime/agent-runtime.ts`, `src/lib/runtime/agent-runtime.test.ts`
**Depends on**: T24, T28, T30
**Reuses**: Updated LLM client (T30), ToolRegistry, WorkspaceManager
**Owner**: You + AI
**Requirement**: MVP-21, MVP-22

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Builds initial messages: system prompt + user prompt
- [ ] Sends messages with tool definitions from registry to LLM
- [ ] On `finish_reason: "tool_calls"`: parses tool calls, executes via registry, appends `tool` role messages
- [ ] Repeats until `finish_reason: "stop"` or max turns exceeded (default 5)
- [ ] Returns `AgentRunResult` with final content, tool call log, artifacts list
- [ ] Fallback: if LLM never calls tools (no `tool_calls` in response), returns result with `fallbackUsed: true`
- [ ] Error in tool execution is reported back to LLM, not thrown (allows recovery)
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= baseline + 1 unit suite passes (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- agent-runtime` passes.

---

### T30: Update LLM Client for Tools Support [P]

**What**: Add optional `tools` parameter to `runChatCompletion()` and parse `tool_calls` from response messages.
**Where**: `src/lib/llm/openai-compatible-client.ts` (modify), `src/lib/llm/openai-compatible-client.test.ts` (update)
**Depends on**: T25
**Reuses**: Existing client structure
**Owner**: You + AI
**Requirement**: MVP-21, MVP-24

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] `ChatRunInput` accepts optional `tools: ToolDefinition[]` field
- [ ] LLM request includes `tools` and `tool_choice: "auto"` when tools are provided
- [ ] Response parsing extracts `tool_calls[]` from `message` when `finish_reason` is `tool_calls`
- [ ] Backward compatible: requests without tools work as before
- [ ] `ChatRunOutput` includes optional `toolCalls: ToolCall[]` field
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= existing + new tool-related test cases (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- openai-compatible-client` passes.

---

### T31: Update Challenge Catalog with Tool Config [P]

**What**: Add `availableTools` and `maxTurns` fields to challenge definitions. Code Writer and Multi-Tool get filesystem+bash tools; Change Prompt gets none.
**Where**: `src/lib/challenges/catalog.ts` (modify), `src/lib/challenges/catalog.test.ts` (update)
**Depends on**: None
**Reuses**: Existing catalog structure
**Owner**: You + AI
**Requirement**: MVP-19, MVP-21, MVP-22

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] `ChallengeDefinition` includes `availableTools: string[]` (tool names enabled for this challenge)
- [ ] `ChallengeDefinition` includes `maxTurns: number` (default 5)
- [ ] `change-prompt`: availableTools = [], maxTurns = 1 (single-shot)
- [ ] `code-writer`: availableTools = ["read_file", "write_file", "list_files", "exec_bash"], maxTurns = 5
- [ ] `multi-tool`: availableTools = ["read_file", "write_file", "list_files", "exec_bash"], maxTurns = 5
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= existing + 1 (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- catalog` passes.

---

### T32: Update Challenge Runner for AgentRuntime

**What**: Modify challenge runner to use AgentRuntime for tool-enabled challenges instead of single-shot LLM call. Persist tool call log and artifacts alongside existing run data.
**Where**: `src/lib/runs/challenge-runner.ts` (modify), `src/lib/runs/challenge-runner.test.ts` (update)
**Depends on**: T29
**Reuses**: AgentRuntime, ChallengeCatalog, EvaluationEngine, ProgressionService
**Owner**: You + AI
**Requirement**: MVP-21, MVP-22, MVP-23

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] When challenge has `availableTools.length > 0`: builds ToolRegistry with only enabled tools, creates AgentRuntime, runs multi-turn loop
- [ ] When challenge has no tools (Change Prompt): uses existing single-shot path
- [ ] Tool call log and artifacts are persisted in `ChallengeRun.toolCallsJson` and `artifactsJson`
- [ ] Runtime events still emitted (walking, thinking, etc.) and persisted in `runtimeStateLogJson`
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= existing + 1 (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- challenge-runner` passes.

---

### T33: Update Evaluation Engine for Execution Artifacts

**What**: Extend evaluation pipeline to accept tool call logs and execution results. Factor execution success (exit codes, file creation) into deterministic and rubric scoring.
**Where**: `src/lib/eval/evaluation-engine.ts` (modify), `src/lib/eval/evaluation-engine.test.ts` (update)
**Depends on**: T25
**Reuses**: Existing evaluation pipeline, updated deterministic evaluator (T34)
**Owner**: You + AI
**Requirement**: MVP-25, MVP-26

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] `EvaluateInput` accepts optional `toolCallLog: ToolResult[]` and `artifacts` fields
- [ ] Tool results passed through to deterministic evaluator
- [ ] Rubric scorer checks for execution success when tool results present (adds bonus for exit code 0)
- [ ] Backward compatible: runs without tools evaluate the same as before
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= existing + 1 (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- evaluation-engine` passes.

---

### T34: Update Deterministic Evaluator for Execution Checks [P]

**What**: Add execution artifact checks: for Code Writer, verify a `.py` file was written and `exec_bash` returned exit code 0. For Multi-Tool, verify files were created and code was executed.
**Where**: `src/lib/eval/deterministic-evaluator.ts` (modify), `src/lib/eval/deterministic-evaluator.test.ts` (update)
**Depends on**: T25, T33
**Reuses**: Existing deterministic rule framework
**Owner**: You + AI
**Requirement**: MVP-25

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] `evaluateDeterministic()` accepts optional `toolCallLog` parameter
- [ ] Code Writer: checks for `write_file` tool call producing a `.py` file + `exec_bash` with exit code 0
- [ ] Multi-Tool: checks for at least one `write_file` + at least one `exec_bash` call
- [ ] Execution checks contribute to deterministic score (up to +30 for successful execution)
- [ ] Change Prompt: no tool-log-based checks (evaluates the same as before)
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: >= existing + 1 (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**: `npm run test:unit -- deterministic-evaluator` passes.

---

### T35: Update Prisma Schema for Tool and Artifact Fields [P]

**What**: Add `toolCallsJson` and `artifactsJson` columns to ChallengeRun model and run migration.
**Where**: `prisma/schema.prisma` (modify), `prisma/migrations/*` (new)
**Depends on**: None
**Reuses**: Existing Prisma conventions
**Owner**: You + AI
**Requirement**: MVP-23, MVP-27

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] `ChallengeRun` model has `toolCallsJson String @default("[]")`
- [ ] `ChallengeRun` model has `artifactsJson String @default("[]")`
- [ ] Migration applies without data loss (existing rows get empty defaults)
- [ ] Build passes: `npm run build`

**Tests**: none
**Gate**: build

**Verify**: `npx prisma migrate dev` then `npm run build` exit 0.

---

### T36: Update API Route and UI for Tool Results

**What**: Pass tool call logs and artifacts through the run API response. Update challenge runner panel to show execution output (stdout/stderr/exit code) alongside text output.
**Where**: `src/app/api/challenges/run/route.ts` (modify), `src/components/workshop/challenge-runner-panel.tsx` (modify)
**Depends on**: T32, T33, T35
**Reuses**: Existing API and UI patterns
**Owner**: You + AI
**Requirement**: MVP-23

**Tools**:

- MCP: `filesystem`
- Skill: `frontend-design`

**Done when**:

- [ ] API response includes `toolCalls` array and `artifacts` array in run result
- [ ] Challenge runner panel shows "Execution" tab/section with tool call history (tool name, args, result)
- [ ] `exec_bash` results display stdout, stderr, and exit code color-coded
- [ ] `write_file` results show file path created
- [ ] Change Prompt runs (no tools) show no execution panel (graceful empty state)
- [ ] Gate check passes: `npm run lint && npm run test:unit`
- [ ] Test count: (no separate tests needed — tested via integration)

**Tests**: none
**Gate**: quick

**Verify**: Visual check in `npm run dev`: run Code Writer, verify execution panel appears with file path and exit code.

---

### T37: Update Demo Reset for Workspace Cleanup

**What**: Extend demo reset route to optionally clean workspace directories under `~/.goobs/`.
**Where**: `src/app/api/demo/reset/route.ts` (modify)
**Depends on**: T24
**Reuses**: WorkspaceManager, existing reset pattern
**Owner**: You + AI
**Requirement**: MVP-10 (extended)

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [ ] Reset route accepts optional `scope` parameter: `"transient"` | `"workspaces"` | `"full"`
- [ ] `"transient"` scope: existing behavior (clear runs only)
- [ ] `"workspaces"` scope: clear transient runs AND workspace directories
- [ ] `"full"` scope: everything (existing full reset behavior)
- [ ] Gate check passes: `npm run test && npm run build`

**Tests**: integration
**Gate**: full

**Verify**: `npm run test -- demo.reset.route.integration` passes.

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

Phase 4 (Agent Runtime):
  First wave (independent):
    T24 [P]  T25 [P]  T30 [P]  T31 [P]  T35 [P]
  Second wave (after T24 + T25):
    T26 [P]  T27 [P]  T28 [P]
  Sequential backbone:
    T29 (after T24 + T28 + T30)
    T32 (after T29 + T31)
    T33 (after T25)
    T34 (after T25 + T33)
    T36 (after T32 + T33 + T35)
    T37 (after T24)
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
| T24 | Workspace manager module | PASS Granular |
| T25 | Tool type definitions | PASS Granular |
| T26 | Filesystem tools module | PASS Granular |
| T27 | Bash tool module | PASS Granular |
| T28 | Tool registry module | PASS Granular |
| T29 | Agent runtime module | PASS Granular |
| T30 | LLM client extension | PASS Granular |
| T31 | Challenge catalog extension | PASS Granular |
| T32 | Challenge runner refactor | PASS Granular |
| T33 | Evaluation engine extension | PASS Granular |
| T34 | Deterministic evaluator extension | PASS Granular |
| T35 | Prisma schema migration | PASS Granular |
| T36 | API + UI update | PASS Granular |
| T37 | Demo reset extension | PASS Granular |

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
| T24 | None | None | PASS Match |
| T25 | None | None | PASS Match |
| T26 | T24, T25 | T24 -> T26 and T25 -> T26 | PASS Match |
| T27 | T24, T25 | T24 -> T27 and T25 -> T27 | PASS Match |
| T28 | T25 | T25 -> T28 | PASS Match |
| T29 | T24, T28, T30 | T24 -> T29 and T28 -> T29 and T30 -> T29 | PASS Match |
| T30 | T25 | T25 -> T30 | PASS Match |
| T31 | None | None | PASS Match |
| T32 | T29 | T29 -> T32 | PASS Match |
| T33 | T25 | T25 -> T33 | PASS Match |
| T34 | T25, T33 | T25 -> T34 and T33 -> T34 | PASS Match |
| T35 | None | None | PASS Match |
| T36 | T32, T33, T35 | T32 -> T36 and T33 -> T36 and T35 -> T36 | PASS Match |
| T37 | T24 | T24 -> T37 | PASS Match |

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
| T24 | `src/lib/runtime/*` domain logic | unit | unit | PASS OK |
| T25 | `src/lib/runtime/*` types | none | none | PASS OK |
| T26 | `src/lib/runtime/*` domain logic | unit | unit | PASS OK |
| T27 | `src/lib/runtime/*` domain logic | unit | unit | PASS OK |
| T28 | `src/lib/runtime/*` domain logic | unit | unit | PASS OK |
| T29 | `src/lib/runtime/*` domain logic | unit | unit | PASS OK |
| T30 | `src/lib/llm/*` domain logic (modified) | unit | unit | PASS OK |
| T31 | `src/lib/challenges/*` domain logic (modified) | unit | unit | PASS OK |
| T32 | `src/lib/runs/*` domain logic (modified) | unit | unit | PASS OK |
| T33 | `src/lib/eval/*` domain logic (modified) | unit | unit | PASS OK |
| T34 | `src/lib/eval/*` domain logic (modified) | unit | unit | PASS OK |
| T35 | Prisma schema/migration | none | none | PASS OK |
| T36 | API route + UI component | integration + unit | none (visual verification) | PASS OK |
| T37 | `src/app/api/**` API route (modified) | integration | integration | PASS OK |

---

## Tooling Confirmation for Execute

Before implementation starts, confirm per-task tool usage preferences.

- **Default MCPs**: `filesystem`, `context7` (for API/library checks), `bash` (tests/build)
- **Default skills**: `context7-mcp` for SDK/API certainty, `frontend-design` for panel/UI implementation quality
