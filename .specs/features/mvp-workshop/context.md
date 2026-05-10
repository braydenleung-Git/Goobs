# MVP Workshop Context

**Gathered:** 2026-05-09
**Spec:** `.specs/features/mvp-workshop/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Deliver one polished, local-first vertical slice where users build an agent, run 3 selected learning challenges, receive fully automatic challenge grading, and see XP/level progression with synchronized 3D state feedback.

---

## Implementation Decisions

### Challenge Scope and Learning Arc

- The shipped challenge set is fixed to 3: `Change Prompt`, `Code Writer`, and `Multi-Tool`.
- Challenge breadth is intentionally constrained to maximize quality and stability under 24-hour constraints.
- Challenges are educational goals for understanding agents, not game combat mechanics.

### Evaluation Strategy

- Completion checking is fully automatic.
- Evaluation uses a hybrid chain: deterministic checks first, then LLM rubric scoring where needed.
- Final challenge status is a normalized result usable by progression logic.

### Runtime + Provider Behavior

- Runtime uses OpenAI-compatible endpoints for model discovery and inference.
- Model selection is user-facing and populated dynamically from provider `/models`.
- If model discovery fails, fallback model support is provided for `deepseek-v4-flash`.

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

### Scoring and Reset Policy

- Final challenge completion requires both deterministic pass AND rubric minimum pass.
- Demo reset is non-destructive: preserve saved agents, saved progress, and global provider key configuration.

### Agent's Discretion

- Exact deterministic rule thresholds per challenge may be tuned during implementation.
- Exact XP and level curve values can be tuned for demo pacing.
- UI layout details are flexible as long as demo flow and criterion mapping remain clear.

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
