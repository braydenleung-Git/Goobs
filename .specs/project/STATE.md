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
- D-006: Primary supported model fallback is `OpenCode/deepseek-v4-flash` if model discovery fails.
- D-007: Animation state contract is fixed to Idle/Thinking/Typing/Celebrate/Error.
- D-008: Progression in MVP includes real XP + level + unlocks for 3 shipped challenges.
- D-009: Global provider API key is persisted encrypted in DB using app-level AES-GCM with env master key.
- D-010: Team ownership is shared coding + shared assets; teammate focus is light frontend wiring.
- D-011: Gate commands are fixed: quick=`npm run lint && npm run test:unit`, full=`npm run test && npm run build`.
- D-012: Challenge completion policy is strict: deterministic pass AND rubric minimum are both required.
- D-013: Demo reset preserves saved agents, progress, and global provider settings.
- D-014: Frontend scene starts as blank isometric plane; created agents spawn into scene and idle.
- D-015: Workstations are physical task targets (computer, drawing tablet, whiteboard, book); agents walk to assigned station before task execution.
- D-016: Scene growth is progression-driven through workstation unlocks.
- D-017: Workstation mapping is fixed for MVP: computer=coding, drawing-tablet=image generation, whiteboard=planning/brainstorming, book=writing.
- D-018: Image-generation tasks require image-capable model selection.
- D-019: Provider endpoint is `http://homelab/bifrost/v1` with no API key; provider config handles optional/empty keys gracefully.
- D-020: AgentRuntime uses multi-turn OpenAI function calling for tool-enabled challenges (not single-shot generation).
- D-021: Agent workspaces are sandboxed under `~/.goobs/workspaces/{agentId}/` with path traversal protection.
- D-022: Tool registry uses a `ToolHandler` interface designed for future MCP server and skill loader integration.
- D-023: Bash execution uses 10-second default timeout; commands run in the agent's workspace directory.
- D-024: Challenges specify which tools are available (`availableTools` field); Change Prompt uses none (single-shot fallback).
- D-025: Evaluation engine accepts optional tool call logs; execution artifacts factor into deterministic pass (exit code 0, file creation).

## Open Questions

- OQ-001: Exact deterministic rules per challenge before LLM rubric stage.

## Blockers

- None currently.

## Todos

- T-PLAN-001: Finalize MVP feature spec with requirement IDs. (Done)
- T-PLAN-002: Finalize context decisions and scope guardrails. (Done)
- T-PLAN-003: Produce architecture design doc for mvp-workshop feature. (Done)
- T-PLAN-004: Produce granular tasks with ownership split and dependencies. (Done)
- T-PLAN-005: Update spec/context/design/tasks for AgentRuntime + sandboxed tools. (Done — MVP-19 to MVP-29, T24-T37)

## Deferred Ideas

- Full 20-challenge catalog and all tier progression.
- PvP/battle systems.
- Multi-provider abstraction layer beyond OpenAI-compatible endpoint support.
- Full headless session mode with persistent bash shell and background processes.
- MCP tool server integration (ToolRegistry interface is designed for it, not yet implemented).
- Skill loading from filesystem (same ToolRegistry extension point).

## Preferences

- User prefers direct execution and rapid iteration over process overhead.
