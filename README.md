# Goobs — The Agent Workshop

An interactive 3D workshop that teaches how AI agents work by turning agent configuration and task execution into a visual, gamified experience. Built for a 24-hour hackathon.

## Overview

Goobs makes AI agent concepts tangible. You create chibi AI characters called "goobs," give them skills and tools, chat with them, and watch them work in a real-time 3D isometric scene. A progression system with tiers and challenges guides you from basic concepts (creating an agent, adding a skill) to advanced capabilities (writing files, running bash commands, building and executing scripts).

## Features

### Agent Creation
- Customizable chibi 3D agents with pastel skin, shirt, and pants colors
- System prompt editor to define agent personality and behavior
- Skills system — markdown knowledge blocks your agent can reference
- Tool profiles — None, Read Only, Read+Write, Full (includes bash)
- Model selection — pick from any OpenAI-compatible model
- Prebuilt demo agents to get started instantly

### 3D Workshop Scene
- Isometric 3D view with OrbitControls (drag to rotate)
- Agents spawn at drop position when dragged from sidebar
- Walking animation between workstations with constant-speed movement
- Selection ring + camera focus when clicking an agent
- Floating name badge above each agent
- Animation states: idle, walking, thinking, working, sitting, celebrate, error, idle_long, easter_egg
- Workstation markers (computer, drawing tablet, whiteboard, book)

### Chat
- Real-time SSE streaming chat with markdown rendering
- Per-agent conversation history (persists across tab switches)
- Tool calls displayed inline as collapsible cards with file links and command output
- "Thinking" animation while agent responds
- Both streaming (no-tools) and streaming-with-tool-calls modes

### Tools (Filesystem + Bash)
- Agents can read, write, and list files in a sandboxed workspace
- Agents can execute bash commands
- Tool call cards show real-time progress: call args → execution → result
- Workspace at `~/.goobs/workspaces/{agentId}/`
- Tool profiles gated behind progression tiers

### Progression & Challenges
- **Tier 1** — Onboarding: Create Agent, Add Skill, Deploy to Workshop, First Chat
- **Tier 2** — Tools: Field 2 Agents (unlocks filesystem), Write a File, Execute Bash Command (unlocks bash)
- **Tier 3** — Automation: Build a Script (write + execute 2 times)
- Session-based state (survives page refresh, wiped on "Get Started")
- XP rewards per challenge, toast notifications with progress bar
- Mastery message when all challenges complete

### Learning Aids
- Intro cards on first launch explaining agents, skills, tools, and challenges
- Challenge detail popups with "what you'll learn" and step-by-step instructions
- Help icons (?) next to labels explaining skills, tool profiles, and models
- Tools Unlocked! modal when reaching Tier 2 explaining file and bash tools
- Challenge dock shows only the current tier with live progress counters

### UI
- Glassmorphism design (frosted glass panels with border accents)
- Animated gradient "goobs" logo in nav bar
- Launch screen with rainbow animated title
- Pull-out agent sidebar (left edge tab)
- Agent chat panel with popout animation
- Config panel (top-right gear icon)
- Bottom-left challenge dock with tier badges and progress bars
- Toast notifications for challenge completions

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript |
| 3D Rendering | React Three Fiber + drei |
| Styling | Tailwind CSS + Catppuccin-based custom theme |
| Database | Prisma + SQLite |
| LLM Provider | OpenAI-compatible endpoint (configurable) |
| Animation | FBX model loader with NLA strip animation blending |
| Security | AES-GCM encrypted API key storage |

## Getting Started

```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click "Get Started" to reset the demo and enter the workshop.

### Environment Variables

Copy `.env.example` or create `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite database path (`file:./dev.db`) |
| `MASTER_KEY` | AES-GCM master key for encrypted provider API keys |
| `PROVIDER_BASE_URL` | Default OpenAI-compatible endpoint |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agents/       # Agent CRUD API
│   │   ├── chat/         # Chat completion (SSE streaming + tool calls)
│   │   ├── challenges/   # Challenge runner API
│   │   ├── demo/         # Full reset API
│   │   ├── models/       # Model listing from provider
│   │   └── provider/     # Provider config API
│   └── page.tsx          # Main app (workshop content, chat panel, modals)
├── components/
│   ├── 3d/               # FBX model loader
│   ├── agents/           # Agents grid (list, edit, create)
│   ├── create/           # Agent creation form, preview scene
│   ├── layout/           # Top nav, agent sidebar
│   ├── scene/            # R3F scene, runtime state adapter
│   ├── ui/               # HelpIcon component
│   └── workshop/         # Challenge dock, launch screen, intro cards, tool intro, chat panel
├── lib/
│   ├── agents/           # Prebuilt agent seed
│   ├── challenges/       # Challenge catalog (3 shipped challenges)
│   ├── db/               # Prisma client
│   ├── eval/             # Evaluation engine (deterministic + rubric)
│   ├── llm/              # OpenAI-compatible client
│   ├── progression/      # Session-based progression engine
│   ├── provider/         # Provider config service
│   ├── runtime/          # Agent runtime, tool registry, tools (filesystem, bash, skills)
│   └── skills/           # Skill name parser
└── specs/                # Planning artifacts (project docs, features, tasks)
```

## Key Architecture Decisions

- **Unique instance IDs**: Each agent spawn gets a unique `instanceId` (`{agentId}::{counter}`) so multiple copies of the same agent can be individually selected and tracked in the 3D scene.
- **SSE streaming for tool calls**: Both text and tool-call responses stream via Server-Sent Events, with custom event types (`text`, `tool_call`, `tool_result`, `done`) so the UI updates incrementally.
- **Material-based coloring**: FBX materials are matched by name (`Skin`, `Shirt`, `Pants`) and colored individually rather than applying a uniform tint.
- **Session-based progression**: Unlike server-side state, progression lives in `sessionStorage` so each browser session starts fresh — ideal for demo kiosks.
- **Tool profile gating**: Tool profiles are disabled until Tier 2, preventing confusion while users learn the basics.

## Team

- AI + core systems, APIs, orchestration, evaluation, progression, 3D scene, UI
- Teammate: 3D character models, FBX animations, Blender assets
