# Goobs — Technical Documentation

## Architecture Overview

Goobs is a single-page Next.js 14 application that combines a 3D workshop scene (React Three Fiber) with an LLM-powered agent backend (OpenAI-compatible API). It uses Prisma + SQLite for persistence, and runs entirely on a local machine.

### High-Level Data Flow

```
Browser (React SPA)
  │
  ├── Scene (R3F Canvas)
  │     RuntimeStateProvider (context)
  │       ├── AgentSceneState[]  ← positions, animations, targets
  │       └── AgentMeta{}        ← display names, colors
  │
  ├── AgentChatPanel
  │     └── /api/chat   ← SSE stream (text + tool_calls + tool_result)
  │
  ├── ChallengeRunnerPanel
  │     └── /api/challenges/run  ← POST → runChallenge()
  │
  └── AgentsGrid + CreateAgentForm
        └── /api/agents  ← CRUD
```

### Directory Structure (src/)

```
app/
  page.tsx               ← Root: LaunchScreen, WorkshopContent, AgentChatPanel, ChallengeDock, etc.
  api/
    agents/route.ts       ← CRUD for AgentProfile (Prisma)
    chat/route.ts         ← SSE streaming chat (OpenAI-compatible)
    chat/classify/route.ts← Task-type classifier (LLM → workstation)
    challenges/run/route.ts ← Challenge execution + evaluation
    demo/reset/route.ts    ← Session/workspace reset
    models/route.ts        ← Model discovery from provider
    provider/route.ts      ← Provider config (base URL, encrypted API key)
components/
  3d/fbx-model-loader.tsx ← FBX loader, animation mixer, color tinting
  scene/
    workshop-scene.tsx     ← R3F scene: agents, workstations, movement, animation FSM
    runtime-state-adapter.tsx ← React context for scene state
  agents/agents-grid.tsx   ← Agent list/edit/create grid
  create/create-agent-form.tsx ← Agent creation form + preview
  create/agent-preview-scene.tsx ← 3D preview with FBX model
  layout/top-nav.tsx       ← Nav bar, tier progress
  layout/agent-sidebar.tsx ← Left hover drawer for drag-and-drop
  ui/agent-avatar.tsx      ← Shared SVG character avatar
  workshop/
    challenge-dock.tsx     ← Challenge progression widget
    challenge-runner-panel.tsx ← Challenge execution panel
    launch-screen.tsx      ← Fullscreen intro overlay
    intro-cards.tsx, tool-intro-modal.tsx ← Tutorial modals
    config-panels.tsx      ← Provider configuration UI
lib/
  db/prisma.ts             ← Singleton PrismaClient
  llm/openai-compatible-client.ts ← Chat completion + function calling
  runtime/
    tool-registry.ts       ← Tool handler registration + dispatch
    agent-runtime.ts       ← Multi-turn tool-use loop
    workspace.ts           ← Filesystem sandboxing
    tools/
      types.ts             ← ToolDefinition, ToolCall, ToolResult, ToolHandler interface
      filesystem.ts        ← read_file, write_file, list_files
      bash.ts              ← exec_bash
      skills.ts            ← Skills lookup tool
  challenges/catalog.ts    ← Challenge definitions (3 shipped)
  eval/
    evaluation-engine.ts   ← Hybrid evaluator: deterministic + rubric
    deterministic-evaluator.ts ← Keyword, length, tool-call checks
  progression/
    progression-engine.ts  ← Session-based state machine (sessionStorage)
    progression-service.ts ← Server-side XP/unlock persistence (Prisma)
  provider/provider-config-service.ts ← Provider URL + encrypted key management
  security/secret-vault.ts ← AES-256-GCM encryption
  skills/skill-name.ts     ← YAML frontmatter parser for skill names
```

---

## 1. Workspace Sandboxing

File: `src/lib/runtime/workspace.ts`

### Path Structure

```
~/.goobs/workspaces/{agentId}/
  workspace/     ← agent's writable directory
  runs/{runId}/  ← per-run artifacts
```

### Creation

`ensureWorkspace(agentId)` creates `~/.goobs/workspaces/{agentId}/workspace/` recursively on first access. Called by both the agent runtime (challenge runner) and tool handlers.

### Path Traversal Protection

`resolveSafePath(agentId, relativePath)` resolves a user-supplied relative path against the agent's workspace root:

```typescript
const root = getWorkspacePath(agentId)           // ~/.goobs/workspaces/{agentId}/workspace
const resolved = path.resolve(root, relativePath) // absolute
const relative = path.relative(root, resolved)    // relative back to root
if (relative.startsWith("..") || path.isAbsolute(relative)) {
  throw new Error("Path traversal blocked")
}
```

If the resolved path falls outside the workspace root (e.g., `../../etc/passwd`), the relative computation produces a path starting with `..`, and the operation is rejected.

### Artifacts

`getRunPath(agentId, runId)` creates a separate directory per challenge run at `~/.goobs/workspaces/{agentId}/runs/{runId}`. `getRunArtifacts()` recursively enumerates all files and their sizes.

### Cleanup

`cleanWorkspace(agentId)` recursively removes the agent's workspace directory. Called by the demo reset API (`scope=full` or `scope=workspaces`).

---

## 2. Database Schema (Prisma + SQLite)

File: `prisma/schema.prisma`

### Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `ProviderConfig` | LLM endpoint config | `baseUrl`, `encryptedApiKey`, `keyIv`, `keyTag` |
| `AgentProfile` | User-created agents | `name`, `systemPrompt`, `skillsJson`, `toolsJson`, `defaultModel`, `modelColorsJson` |
| `WorkstationState` | Unlock state per workstation | `workstationId` (unique), `isUnlocked` |
| `ChallengeRun` | Execution history | `challengeSlug`, `agentId`, `deterministicPass`, `rubricPass`, `finalPass`, `toolCallsJson`, `artifactsJson` |
| `ProgressState` | Server-side XP/level | `totalXp`, `level`, `unlockedWorkstationsJson` |
| `ChallengeRewardEvent` | Idempotent reward ledger | `runId` (unique), `xpAwarded` |

### UUID Handling

`crypto.randomUUID()` is used instead of Prisma's `@default("uuid")` because SQLite generates duplicate UUIDs under concurrent writes. All model IDs are assigned explicitly in application code.

### JSON Fields

Several fields store JSON-serialized data in text columns (SQLite lacks native JSON):

- `skillsJson: "[]"` — Array of markdown skill strings
- `toolsJson: "[]"` — Tool profile config `{ profile: "read_only"|"read_write"|"full"|"none" }`
- `modelColorsJson: "{}"` — `{ "skin": "#hex", "shirt": "#hex", "pants": "#hex" }`
- `runtimeStateLogJson: "[]"` — Event log during challenge runs
- `toolCallsJson: "[]"` — Tool call results
- `artifactsJson: "[]"` — Files created during a run
- `unlockedWorkstationsJson: "[]"` — Unlocked workstation IDs

---

## 3. Agent Runtime System

### 3.1 Tool Interface

File: `src/lib/runtime/tools/types.ts`

```typescript
interface ToolHandler {
  definitions: ToolDefinition[]  // OpenAI-compatible function definitions
  execute(name: string, args: Record<string, unknown>): Promise<ToolResult>
}
```

All tools implement this interface. `ToolRegistry` (file: `src/lib/runtime/tool-registry.ts`) collects handlers and dispatches execution by tool name:

```typescript
class ToolRegistry {
  register(handler: ToolHandler): void
  getDefinitions(): ToolDefinition[]  // flattened for OpenAI function calling
  execute(name: string, args): Promise<ToolResult>
}
```

### 3.2 Available Tools

#### read_file (`filesystem.ts`)
- **Parameters**: `path` (relative to workspace)
- **Security**: Path traversal check via `resolveSafePath`
- **Returns**: File contents as string

#### write_file (`filesystem.ts`)
- **Parameters**: `path` (relative), `content` (string)
- **Security**: Path traversal check, `mkdir -p` parent directory creation
- **Returns**: Confirmation with absolute path

#### list_files (`filesystem.ts`)
- **Parameters**: `path` (optional, defaults to workspace root)
- **Returns**: `[dir]`/`[file]` prefixed entry list

#### exec_bash (`bash.ts`)
- **Parameters**: `command` (string), `timeout` (optional, default 10s)
- **Execution**: `child_process.exec` in agent's workspace directory (`cwd` = `~/.goobs/workspaces/{agentId}/workspace/`)
- **Returns**: `stdout`, `stderr`, `exitCode`
- **Error handling**: Killed processes (SIGTERM) report as timeout (exit 124). Non-zero exits return the stdout/stderr with the error code.

### 3.3 Multi-Turn Tool Loop

File: `src/lib/runtime/agent-runtime.ts`

```
for turn = 0 to maxTurns:
  1. Call runChatCompletion(messages, tools)
  2. If response has tool_calls:
     a. Append assistant message (with tool_calls)
     b. For each tool_call:
        - Execute via registry.execute(name, args)
        - Append tool result message
     c. Continue loop
  3. If response has no tool_calls:
     a. Return final content
```

- **Max turns**: 5 (configurable per challenge)
- **Fallback detection**: If tools were provided but never called, `fallbackUsed = true`
- **Used in two places**:
  1. Chat API (`/api/chat`) — tool profile decides tool availability
  2. Challenge runner (`/api/challenges/run`) — challenge definition decides tool availability

---

## 4. Chat System

### 4.1 API Endpoint

File: `src/app/api/chat/route.ts`

Two paths depending on tool profile:

**No-tools path** (streaming):
- Proxies raw SSE from the OpenAI-compatible provider
- System prompt: agent prompt + skills + "no tools available" instruction
- DeepSeek models: disables thinking mode (`thinking: { type: "disabled" }`)
- Timeout: 60s

**Tool-enabled path** (streaming + multi-turn):
- Uses `ToolRegistry` + `runChatCompletion` in a loop (same pattern as agent-runtime)
- Streams custom SSE events:
  - `data: {"type":"text","content":"..."}` — Assistant text
  - `data: {"type":"tool_call","name":"write_file","arguments":"..."}` — Tool invocation
  - `data: {"type":"tool_result","name":"write_file","output":"...","stdout":"...","stderr":"...","exitCode":0}` — Tool result
  - `data: {"type":"done","content":"..."}` — Final

### 4.2 Task Classification

File: `src/app/api/chat/classify/route.ts`

When a user sends a chat message, a lightweight LLM call (model: `deepseek-v4-flash`) classifies the intent into one of four workstation types:

| Workstation | Triggers |
|-------------|----------|
| `computer` | coding, file ops, debugging, tool usage, commands, API work |
| `whiteboard` | planning, brainstorming, strategy, thinking |
| `book` | writing, documentation, composition, storytelling |
| `drawing-tablet` | image generation, visual design (future) |

The classification runs asynchronously alongside the main chat request. The agent is only routed to the workstation if the chat is still in progress when the classification returns (guarded by `sendingRef.current`).

### 4.3 System Prompt Composition

```
agent.systemPrompt
+
  "You have the following skills:"
  [skill markdown blocks]
+
  tool instructions based on profile:
    read_only  → read_file, list_files available
    read_write → + write_file
    full       → + exec_bash
```

---

## 5. Animation State Machine

File: `src/components/scene/workshop-scene.tsx`

### State Types

```
idle | walking | sitting | working | celebrate | error
attention_start | attention_loop | thinking | idle_long | stand | typing | easter_egg
```

### Animation Mapping

| Internal State | FBX Clip Name |
|----------------|---------------|
| idle | Idle |
| walking | Walking |
| sitting | Sitting_Transition |
| working | Working |
| celebrate | Finish_Task_1 |
| attention_start | Attention_Start |
| attention_loop | Attention_Loop |
| idle_long | lying_down_transistion |
| thinking | Attention_Loop |
| error | No_Pose |
| typing | Working |

### Animation Aliases

The `resolveClipName` function handles asset naming inconsistencies:
```
"transistion" ↔ "transition"  (Sitting_Transistion / Sitting_Transition)
"lying_down"  → "lying_down_transistion"
```

### FSM Chain (via `onAnimationFinished`)

```
attention_start  ──→ attention_loop
sitting          ──→ working
working          ──→ [taskResult ? celebrate/error : idle]
celebrate/error  ──→ walking (to spawn) ──→ idle
```

### TaskResult Deferral

When external code (chat completion, challenge result) fires `setTaskResult()`, the result is captured in a ref (`taskResultRef`). The animation FSM checks this ref when `working` finishes. If set, it chains to `celebrate` or `error`. This ensures:
- `walking → sitting → working` always plays fully
- External completion signals don't interrupt mid-chain
- Fast AI responses don't skip the work visualization

### FBX Model Loader

File: `src/components/3d/fbx-model-loader.tsx`

- Loads FBX with `FBXLoader` from `three-stdlib`
- Manages `AnimationMixer` with clip crossfading (0.5s fade in/out)
- Supports `loop` (LoopRepeat) vs one-shot (LoopOnce) per state
- `holdLastFrame: true` keeps idle_long and sitting poses clamped
- `playReverse: true` reverses idle_long to wake up
- Per-material coloring via `materialColors` prop:
  - Mesh name substring matching: `skin` → colors.skin, `shirt` → colors.shirt, `pant` → colors.pants

---

## 6. 3D Scene

### Runtime State Context

File: `src/components/scene/runtime-state-adapter.tsx`

Central React context that manages the 3D scene state:

```typescript
interface AgentSceneState {
  instanceId: string        // "{agentId}::{counter}"
  agentId: string           // logical agent from DB
  animationState: AnimationState
  workstationTarget?: string
  position: [number, number, number]
  targetPosition?: [number, number, number]
  taskResult?: "celebrate" | "error" | null
}
```

### Instance IDs

Each spawn creates a unique `instanceId` (`${agentId}::${counter}`). This allows multiple copies of the same agent to be individually tracked, selected, and animated.

### Camera Focus

`CameraController` reads the selected agent's current position (updated throttled every 150ms during movement) and lerps both `OrbitControls.target` and `camera.position` toward it at rate 0.06. The camera offset is `+3` units on X/Z and `+3.5` on Y relative to the agent.

### Movement

Walking is driven in `useFrame`:
- WALK_SPEED = 3 units/second
- Smooth rotation via `Math.atan2(dx, dz)` with delta-limited angular velocity (`diff * min(1, 8 * delta)`)
- Arrival detection: distance < 0.05 units
- On arrival: `returningHome` → idle, otherwise → sitting

### Workstations

Four workstations positioned in a 4-unit radius square:

| Workstation | Position | Table Rotation |
|-------------|----------|----------------|
| Computer | [4, 0, 0] | [0, PI/2, 0] |
| Drawing Tablet | [0, 0, 4] | [0, 0, 0] |
| Whiteboard | [-4, 0, 0] | [0, -PI/2, 0] |
| Book | [0, 0, -4] | [0, PI, 0] |

Each uses the same `table.fbx` model with the workstation's theme color.

### Drag and Drop

Agents are dragged from the sidebar by setting `dataTransfer.setData("text/plain", agentId)`. The `DropCatcher` component uses a `Raycaster` to project the mouse position onto the y=0 plane. The agent spawns at the intersection point with a cubic ease-out scale animation (400ms).

---

## 7. Challenge System

### Catalog

File: `src/lib/challenges/catalog.ts`

Three shipped challenges:

| Challenge | Workstation | Tools | Turn Limit |
|-----------|-------------|-------|------------|
| Change Prompt | whiteboard | none | 1 (single-shot) |
| Code Writer | computer | read, write, list, bash | 5 |
| Multi-Tool | computer | read, write, list, bash | 5 |

### Evaluation Engine

File: `src/lib/eval/evaluation-engine.ts`

**Hybrid evaluation**: deterministic checks + rubric scoring. Both must pass (`finalPass = deterministic.passed && rubric.passed`).

**Deterministic evaluator** (`src/lib/eval/deterministic-evaluator.ts`):
- Minimum output length
- Required keywords (case-insensitive)
- Forbidden keywords
- Tool-specific checks:
  - `code-writer`: .py file written + exit code 0
  - `multi-tool`: files created + bash executed

**Rubric scorer** (in `evaluation-engine.ts`):
- Line count (15 pts)
- Code blocks in code challenges (20 pts)
- Docstrings in code-writer (15 pts)
- Tool execution success (10 pts)
- File writes (5 pts each, max 15)
- Tool usage indicator (5 pts)
- Pass threshold: 60/100

### Runner

File: `src/lib/runs/challenge-runner.ts`

1. Fetch agent profile and challenge definition
2. Compose system prompt (agent prompt + skill blocks + task prompt)
3. If tools are available: execute multi-turn `runAgent()`
4. If no tools: single-shot `runChatCompletion()`
5. Evaluate output with the hybrid engine
6. Persist `ChallengeRun` record
7. If passed: apply XP reward via `applyChallengeReward()`
8. Return `RunResult` with scores, rationale, tool calls, artifacts, runtime events

---

## 8. Progression System

File: `src/lib/progression/progression-engine.ts`

### Architecture

**Dual-layer**: sessionStorage (client) + Prisma (server).

- Client: `sessionStorage` key `"goobs-progression"` — instant UI feedback
- Server: `ProgressState` + `ChallengeRewardEvent` — persistent progress tracking

### Tiers

| Tier | Requirements | Unlocks |
|------|-------------|---------|
| 1 (Onboarding) | 4 event-triggered challenges | Tool profiles in agent creation |
| 2 (Tools) | 3 counter-triggered challenges | Filesystem + bash tools |
| 3 (Automation) | 1 combined counter challenge | Mastery message |

### Events

Dispatched via `window.__goobsProgressionEvent(type, data?)`:
- `agent_created` — Create Agent challenge
- `skill_added` — Add Skill challenge
- `agent_deployed` — Deploy to Workshop challenge
- `chat_sent` — First Chat challenge
- `tool_write_file` — Write a File challenge (counter)
- `tool_exec_bash` — Execute Bash challenge (counter)
- `tool_build_script` — Build a Script challenge (counter, counts min(write, bash) pairs)

### Promotion

Tier 2: all Tier 1 challenges completed. Tier 3: all Tier 2 challenges completed. On promotion, previously-satisfied counter challenges are auto-detected and completed.

### Toast Notifications

`dispatchProgressionEvent()` returns a `ProgressionDelta` with toast info (title, subtitle, XP gained, new unlocks, tier change). The UI renders a self-dismissing toast with a `requestAnimationFrame`-driven progress bar (3s duration).

---

## 9. Provider Configuration & Security

### Endpoint Config

File: `src/lib/provider/provider-config-service.ts`

- Default base URL: `http://homelab/bifrost/v1` (from `PROVIDER_BASE_URL` env)
- Models: discovered via `/models` endpoint
- Chat: `POST /chat/completions`

### API Key Encryption

File: `src/lib/security/secret-vault.ts`

- Algorithm: AES-256-GCM
- Master key: from `MASTER_KEY` env variable (minimum 32 bytes)
- Per-key: random 16-byte IV, 16-byte auth tag
- Storage: `encryptedApiKey`, `keyIv`, `keyTag`, `keyVersion` in `ProviderConfig`
- Decrypt: `decrypt({ encrypted, iv, tag, version })`

---

## 10. 3D FBX Model Integration

### Model File

`public/3d/goobs.fbx` — Chibi character with NLA animation strips. Named clips (from Blender): Idle, Walking, Sitting_Transition, Working, Finish_Task_1, Attention_Start, Attention_Loop, lying_down_transistion, No_Pose.

### Materials

Three named materials on the FBX mesh: `Skin`, `Shirt`, `Pants`. The `applyColorsToModel` function traverses all meshes and matches by substring:
- `name.includes("skin")` → `colors.skin`
- `name.includes("shirt")` → `colors.shirt`
- `name.includes("pant")` → `colors.pants`

### Animation Playback

- **Looping**: idle, walking, attention_loop, thinking, stand, typing — `LoopRepeat`
- **One-shot**: attention_start, sitting, working, celebrate, error, idle_long — `LoopOnce`
- **Hold**: idle_long, sitting — `clampWhenFinished: true` (hold last frame)
- **Reverse**: idle_long when interrupted — `timeScale: -1` starting from clip duration
- **Crossfade**: 0.5s fadeIn/fadeOut between all state transitions

---

## 11. Key Design Decisions

### 11.1 Why `crypto.randomUUID()` instead of Prisma's `@default("uuid")`?

SQLite generates duplicate UUIDs under concurrent writes. Explicit client-side UUID generation avoids this.

### 11.2 Why sessionStorage for progression instead of server-only?

Each browser session should start fresh for demo kiosk mode. Server-side Prisma stores provide persistence across sessions when "Get Started" reset is used.

### 11.3 Why per-instance animation tracking (`instanceId`)?

Multiple copies of the same agent can be spawned. Each needs independent position, animation state, and selection tracking. The `instanceId` (`{agentId}::{counter}`) scheme keeps logical identity while allowing visual independence.

### 11.4 Why `holdLastFrame` for sitting instead of looping?

The "Sitting_Transition" clip transitions from standing to sitting. Once seated, the agent stays in that pose until the next state change. LoopOnce with clampWhenFinished naturally provides this — no separate looping "sitting idle" clip needed.

### 11.5 Why deferred taskResult instead of direct animation set?

If the AI response arrives before the agent reaches the workstation (common with fast models), directly setting "celebrate" skips the entire walking→sitting→working sequence. Deferring via `taskResultRef` ensures the full visual sequence plays every time.

### 11.6 Why both deterministic and rubric evaluation?

Deterministic checks (keywords, file creation, exit codes) catch objective failures. The rubric catches subjective quality (docstrings, code blocks, line counts). Both must pass — preventing both false positives from rigid rules and false positives from lenient AI grading.

### 11.7 Why classify chat intent via LLM instead of simple keyword matching?

Keyword matching breaks on natural language ("can you help me plan this feature?" or "write a quick bash script for me"). An LLM classification call correctly maps diverse phrasing to workstations without fragile regex patterns.

### 11.8 Why path traversal protection on workspace paths?

Agents could read/write arbitrary filesystem paths via malicious tool calls. The `resolveSafePath` function ensures all file operations stay within `~/.goobs/workspaces/{agentId}/workspace/`.

---

## 12. Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | `file:./dev.db` | SQLite database path |
| `MASTER_KEY` | Yes | — | AES-256-GCM master key (32+ bytes) |
| `PROVIDER_BASE_URL` | No | `http://homelab/bifrost/v1` | LLM API endpoint |

---

## 13. Build & Development

```bash
# Install
npm install

# Database
npx prisma db push    # Create SQLite schema
npx prisma generate   # Generate Prisma client

# Development
npm run dev           # Next.js dev server on :3000

# Testing
npm run test:unit     # Jest unit tests
npm run lint          # ESLint
npm run build         # Production build (includes TypeScript check)
```

### Known Build Issues

- Stale `.next` cache causes intermittent font/DB-collection failures. Run `rm -rf .next` before production builds.
- Dev server must restart after production builds due to stale chunk cache.

---

## 14. API Reference

### `GET /api/agents`
Returns all agents ordered by creation date (descending).

### `GET /api/agents?id={uuid}`
Returns a single agent by ID.

### `POST /api/agents`
Create agent. Body: `{ name, systemPrompt, skillsJson?, toolsJson?, defaultModel, modelColorHex?, modelColorsJson? }`.

### `PATCH /api/agents?id={uuid}`
Update agent fields. Body: partial of create schema.

### `DELETE /api/agents?id={uuid}`
Delete agent and its challenge runs.

### `POST /api/chat`
Chat with an agent. Body: `{ agentId, messages }`. Returns SSE stream.

### `POST /api/chat/classify`
Classify message intent. Body: `{ message }`. Returns `{ workstationId }`.

### `POST /api/challenges/run`
Execute a challenge. Body: `{ challengeSlug, agentId, model }`.

### `GET /api/challenges/run`
List available challenges.

### `GET /api/models`
List models from provider.

### `GET /api/provider`
Get provider config. Returns `{ baseUrl, hasApiKey }`.

### `POST /api/provider`
Save provider config. Body: `{ baseUrl?, apiKey? }`.

### `POST /api/demo/reset`
Reset application state. Body: `{ scope: "transient" | "full" | "workspaces" }`.

---

## 15. Build Configuration

- **TypeScript**: `strict: true` in `tsconfig.json`
- **Next.js**: App Router, no standalone output
- **Tailwind**: Custom Catppuccin-based theme, custom animations (panelIn, scaleIn, gradientFlow)
- **Jest**: ts-jest with jsdom environment
