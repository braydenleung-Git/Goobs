# Goobs - The Agent Workshop

Goobs is a 24-hour hackathon project that teaches people how AI agents work by turning agent configuration and task execution into a visual 3D workshop game loop.

## What It Is

Players create agents with:

- Skills
- Tools
- System prompts
- Model selection
- Model color customization

Agents spawn into an isometric workshop scene. When assigned work, they walk to a mapped workstation and play task-specific animations.

Workstation mapping for MVP:

- Computer -> coding
- Drawing tablet -> image generation
- Whiteboard -> planning/brainstorming
- Book -> writing

The scene grows over time through workstation unlocks tied to progression.

## Why It Exists

Most agent tools are terminal/chat-first and hard for newcomers to understand. Goobs makes agent concepts visible and concrete:

- Prompt changes alter behavior
- Model choice matters
- Skills/tools shape capabilities
- Structured task loops improve learning

## MVP Scope (Hackathon)

Shipped challenge set:

1. Change Prompt
2. Code Writer
3. Multi-Tool

MVP includes:

- User-built agents + prebuilt demo agents
- OpenAI-compatible provider integration (`/models` + chat completion)
- Fallback model: `OpenCode/deepseek-v4-flash`
- Hybrid automatic evaluation (deterministic checks + LLM rubric)
- Strict pass policy: deterministic pass AND rubric minimum
- XP, level, and unlock progression
- Local-first demo reliability with non-destructive reset

## Current Project State

Planning artifacts are complete in `.specs/`:

- Project docs: `.specs/project/PROJECT.md`, `.specs/project/ROADMAP.md`, `.specs/project/STATE.md`
- Feature docs: `.specs/features/mvp-workshop/spec.md`, `.specs/features/mvp-workshop/context.md`, `.specs/features/mvp-workshop/design.md`, `.specs/features/mvp-workshop/tasks.md`
- Testing strategy: `.specs/codebase/TESTING.md`

No production app code has been implemented yet; execution starts from task T1.

## Planned Architecture

- Frontend: Next.js + React + React Three Fiber + Tailwind
- Backend/API: Next.js App Router API routes
- Data: Prisma + SQLite
- Provider: OpenAI-compatible endpoints
- Security: AES-GCM encrypted provider key storage with env master key

Key domain services:

- ProviderConfigService
- OpenAICompatibleClient
- WorkstationRouter
- SceneOrchestrator
- ChallengeRunner
- EvaluationEngine
- ProgressionService

## Implementation Plan

Execution follows atomic tasks in `.specs/features/mvp-workshop/tasks.md`:

### Phase 1 - Foundation

- Bootstrap app baseline
- Define Prisma schema/migrations
- Add encrypted provider config path
- Build agents API and prebuilt seed

### Phase 2 - Challenge Engine

- Implement provider client and challenge catalog
- Add deterministic + rubric evaluators
- Implement progression and unlock rules
- Build challenge run API and demo reset API

### Phase 3 - UX, Scene, and Demo Polish

- Build config and challenge panels
- Build progress/history + judge mapping panel
- Implement runtime state adapter
- Wire isometric scene, idle loops, workstation routing, and task animations
- Run full gate + rehearsal checklist

## Hackathon Judging Alignment

- Technical Execution: real 3D scene + real LLM orchestration + progression engine
- Innovation & Creativity: agents embodied as workshop characters with physical task routing
- Impact & Usefulness: practical learning loop for agent concepts
- Presentation & Demo: strong visual arc (create -> move -> execute -> level -> unlock)

## Team Split

- You + AI coding support: core systems, APIs, orchestration, evaluation, progression
- Teammate: light frontend wiring plus 3D asset/model/animation integration
