# The Agent Workshop (24hr Hackathon MVP)

**Vision:** Teach people how AI agents actually work by letting them build, run, and level up agents through a game-like workflow.
**For:** Hackathon judges, developers, and AI-curious builders.
**Solves:** AI agents are powerful but hard to understand in practice. This project makes system prompts, model selection, and tool orchestration tangible through hands-on challenges.

## Goals

- [ ] Deliver a stable local demo where a user creates an agent, runs 3 challenges, and sees live 3D + progression feedback in under 90 seconds.
- [ ] Show technical depth across 3D rendering, LLM orchestration, and gamification with automatic challenge evaluation.
- [ ] Map each judging criterion to at least one clear demo moment.

## Tech Stack

**Core:**

- Framework: Next.js (App Router) + React
- Language: TypeScript
- 3D: Three.js via React Three Fiber + Drei
- Styling: Tailwind CSS
- Database: SQLite via Prisma

**Key dependencies:**

- `@react-three/fiber`, `@react-three/drei`, `three`
- `prisma`, `@prisma/client`
- OpenAI-compatible HTTP endpoints (`/models`, `/chat/completions` style flows)
- `zod` for request/response validation

## Scope

**v1 includes:**

- User-built agent creation (name, system prompt, model choice)
- Global provider configuration (base URL + encrypted API key)
- Optional prebuilt agent examples for demo acceleration
- 3 playable challenges: Change Prompt, Code Writer, Multi-Tool
- Hybrid automatic challenge evaluation (deterministic checks + LLM rubric)
- XP, level, and unlocks for shipped challenges
- 3D runtime state contract: Idle, Thinking, Typing, Celebrate, Error
- Local-laptop demo workflow with reset controls

**Explicitly out of scope:**

- Full 20-challenge catalog and all 4 tiers
- PvP or battle gameplay
- Full multi-provider abstraction and advanced provider management
- Production-grade auth, billing, and multi-tenant account systems
- Full post-hackathon content systems (leaderboards, social, economies)

## Constraints

- Timeline: 24-hour hackathon build window
- Resources: 2-person team (+ coding support from AI assistant)
- Delivery: Must run reliably on a local demo laptop
- Security: Global provider API key is persisted encrypted in SQLite via app-level master key
- Scope discipline: Prioritize end-to-end polish over breadth
