# MVP Workshop Context

**Gathered:** 2026-05-09
**Updated:** 2026-05-09
**Spec:** `.specs/features/mvp-workshop/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Deliver one polished, local-first vertical slice where users build agents with meaningful configuration, see those agents inhabit and move through an isometric workshop scene, run 3 selected learning challenges, receive fully automatic grading, and progress via XP/level/workstation unlocks.

---

## Implementation Decisions

### Frontend Scene Direction

- The workshop starts as a blank isometric plane where all created agents live.
- Creating an agent spawns it directly into the scene.
- Idle agents play idle animation continuously.
- Scene growth is part of progression: additional workstation areas unlock over time.

### Agent Creation Inputs

- Agent creation includes skills, system prompt, tools, model selection, and model color customization.
- Users can create dedicated agent profiles for different task types (including image generation).

### Workstation Mapping and Animation

- Task types map to physical workstation zones:
  - Computer: coding
  - Drawing tablet: image generation
  - Whiteboard: planning/brainstorming
  - Book: writing
- On task start, the selected agent walks to the mapped workstation and plays workstation-specific animation.

### Challenge Scope and Learning Arc

- The shipped challenge set remains fixed to 3: `Change Prompt`, `Code Writer`, and `Multi-Tool`.
- Challenge breadth is intentionally constrained to maximize quality and stability under 24-hour constraints.
- Challenges are educational goals for understanding agents, not game combat mechanics.

### Evaluation Strategy

- Completion checking is fully automatic.
- Evaluation uses a hybrid chain: deterministic checks first, then LLM rubric scoring where needed.
- Final challenge status is a normalized result usable by progression logic.
- Final challenge pass requires deterministic pass AND rubric minimum pass.

### Runtime + Provider Behavior

- Runtime uses OpenAI-compatible endpoints for model discovery and inference.
- Model selection is user-facing and populated dynamically from provider `/models`.
- If model discovery fails, fallback model support is provided for `OpenCode/deepseek-v4-flash`.
- Image-generation tasks require selecting a model flagged as image-capable.

### Data and Security

- Persistence is SQLite via Prisma for demo reliability.
- Global provider API key is persisted encrypted in the database using app-level AES-GCM and an environment-sourced master key.
- Demo runs local-first on a laptop to reduce network/deployment risks.

### 3D State Contract

- Engineering-to-animation contract is fixed to 5 states: `Idle`, `Thinking`, `Typing`, `Celebrate`, `Error`.
- These states map directly to challenge lifecycle and failure handling.

### Team Execution

- Team ownership is shared for both coding and assets.
- Teammate coding scope is light frontend wiring and integration around 3D assets.
- AI coding support can absorb substantial core system implementation load to preserve timeline.

### Demo Reset Policy

- Demo reset is non-destructive: preserve saved agents, saved progress, and global provider key configuration.

### Agent's Discretion

- Exact deterministic rule thresholds per challenge may be tuned during implementation.
- Exact XP and level curve values can be tuned for demo pacing.
- Exact workstation unlock thresholds can be tuned for best demo cadence.
- UI composition details are flexible as long as scene readability and criterion mapping remain clear.

---

## Specific References

- Source concept and gameplay framing: `AGENT_WORKSHOP.md`
- Judging criteria that must be directly addressed in implementation and demo:
  - Technical Execution (25%)
  - Innovation & Creativity (25%)
  - Impact & Usefulness (25%)
  - Presentation & Demo (25%)

---

## Deferred Ideas

- Expand from 3 to full 20 challenge catalog.
- Add battle-oriented gameplay modes if future direction warrants it.
- Add provider-agnostic multi-provider abstraction.
- Add production-ready account/auth/billing workflows.
