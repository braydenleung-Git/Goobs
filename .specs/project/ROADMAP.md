# Roadmap

**Current Milestone:** M1 - Demo-Ready MVP
**Status:** Planning

---

## M1 - Demo-Ready MVP (24hr)

**Goal:** Ship a stable local demo that clearly scores across technical execution, innovation, usefulness, and presentation.
**Target:** Complete before final hackathon demo window.

### Features

**Workshop Runtime Shell** - PLANNED

- Boot local app with deterministic seed/reset controls
- Show workshop scene, challenge panel, and agent control surface
- Persist core state needed for reliable live demo

**Agent Creation + Configuration** - PLANNED

- Create user-defined agent (name, prompt, model)
- Load prebuilt example agents for fast demo setup
- Persist and edit agent configuration

**LLM Orchestration (OpenAI-Compatible)** - PLANNED

- Pull model list from endpoint and allow model selection
- Execute challenge runs via chat completion endpoint
- Stream/return outputs and runtime events to UI

**3D State Integration** - PLANNED

- Bind runtime states to animation contract (Idle/Thinking/Typing/Celebrate/Error)
- Surface challenge lifecycle transitions in-scene
- Keep UI and 3D state synchronized

**Challenge Engine (3 Challenges)** - PLANNED

- Implement Change Prompt, Code Writer, and Multi-Tool challenge definitions
- Run challenge sessions and capture attempt artifacts
- Attach XP rewards and completion state

**Auto-Evaluation Engine (Hybrid)** - PLANNED

- Deterministic checks for objective criteria
- LLM rubric scoring for subjective quality dimensions
- Unified pass/fail + score payload for progression updates

**Progression + Unlocks** - PLANNED

- XP accumulation and level calculation
- Unlocks tied to completed shipped challenges
- Progress cards for demo narrative

**Demo Story + Judge Mapping** - PLANNED

- Build a scripted 90-second walkthrough path
- Add criterion mapping panel (Tech/Innovation/Impact/Presentation)
- Prepare fallback route if live run fails

---

## M2 - Post-Hackathon Expansion

**Goal:** Expand breadth once MVP is stable.

### Features

**Challenge Library Expansion** - PLANNED

- Add additional tiered challenges from original concept
- Add challenge authoring workflow

**Provider Expansion** - PLANNED

- Add first-class support for additional providers
- Improve model-cost and latency analytics

**Social + Team Systems** - PLANNED

- Team orchestration challenge modes
- Shared runs and comparison views

---

## Future Considerations

- Battle-oriented modes if aligned with product direction
- Online deployment hardening and auth model
- Telemetry for learning outcomes and challenge success rates
