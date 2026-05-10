# MVP Workshop Specification

## Problem Statement

People hear that AI agents are powerful but do not internalize how prompt design, model choice, skills, and tools change outcomes. Existing interfaces are mostly terminal/chat-first and do not make agent behavior and progression intuitive. For a 24-hour hackathon, we need a polished vertical slice that teaches these concepts through a living 3D workshop loop.

## Goals

- [ ] A user can create their own agent, run 3 challenges, and receive automatic completion plus progression feedback in a single demo session.
- [ ] The demo clearly evidences technical execution via a living 3D workshop (isometric scene, workstation routing, animation transitions), real LLM calls, and working progression logic.
- [ ] The product story maps cleanly to judging criteria (technical execution, innovation, usefulness, presentation).

## Out of Scope

Explicitly excluded to prevent scope creep during the 24-hour build.

| Feature | Reason |
| --- | --- |
| Full 20-challenge catalog across all tiers | Too broad for 24-hour timeline; prioritizing polished vertical slice |
| PvP or agent battle mode | Not required for MVP learning loop |
| Production multi-tenant auth and billing | Increases risk without demo payoff |
| Full provider abstraction platform | MVP only needs OpenAI-compatible endpoint support |
| Marketplace/social systems | Not required for judge demo criteria |

---

## User Stories

### P1: Build and Configure a Custom Agent (MVP)

**User Story**: As a player, I want to create my own agent with skills, system prompt, tools, model choice, and model color so that I can test how configuration affects behavior.

**Why P1**: User-built agents are the core value proposition and primary interaction loop.

**Acceptance Criteria**:

1. WHEN the player opens agent creation THEN the system SHALL allow entering agent name and system prompt.
2. WHEN the player configures an agent THEN the system SHALL allow entering skills and tool metadata plus a model color customization value.
3. WHEN the player requests model options THEN the system SHALL fetch and display models from the configured OpenAI-compatible endpoint.
4. WHEN model discovery fails THEN the system SHALL offer `OpenCode/deepseek-v4-flash` as a fallback model option.
5. WHEN the player saves an agent THEN the system SHALL persist agent configuration (name, skills, tools, prompt, model, color) and associate it with the active provider configuration.
6. WHEN the user saves provider settings THEN the system SHALL persist base URL and API key encrypted at rest using app-level master-key encryption.
7. WHEN the player marks an agent for image generation tasks THEN the system SHALL require selecting a model flagged as image-capable before image tasks can be started.

**Independent Test**: Create a new agent from empty state, include skills/tools/color, save it, reload the app, and verify the agent configuration persists and can be selected.

---

### P1: Populate and Grow the Workshop Scene (MVP)

**User Story**: As a player, I want agents to live in a visual workshop scene that expands over time so that progress feels tangible and engaging.

**Why P1**: The spatial workshop is the signature product experience and presentation differentiator.

**Acceptance Criteria**:

1. WHEN the workshop loads with no agents THEN the system SHALL render a blank isometric plane as the base environment.
2. WHEN an agent is created THEN the system SHALL spawn that agent into the scene and set it to idle behavior.
3. WHEN an agent is idle THEN the system SHALL play idle animation loops without blocking other scene updates.
4. WHEN the player views available workstations THEN the scene SHALL include workstation anchors for computer (coding), drawing tablet (image generation), whiteboard (planning), and book (writing).
5. WHEN unlock conditions are met THEN the system SHALL unlock additional workstations and reflect them visually in the scene.

**Independent Test**: Start from empty state, create two agents, verify both appear on the isometric plane with idle animations, then complete unlock conditions and verify new workstation visibility.

---

### P1: Run 3 Learning Challenges End-to-End (MVP)

**User Story**: As a player, I want to run core challenges (Change Prompt, Code Writer, Multi-Tool) so that I can learn key agent concepts through practice.

**Why P1**: Challenges are the learning engine and judge-visible gameplay loop.

**Acceptance Criteria**:

1. WHEN a player starts one of the 3 shipped challenges THEN the system SHALL execute a challenge-specific run using the selected agent configuration.
2. WHEN a run starts THEN the system SHALL assign the relevant workstation for the task type and animate the agent walking toward it.
3. WHEN the agent reaches the assigned workstation THEN the system SHALL play the corresponding workstation animation while the task is executing.
4. WHEN a run is in progress THEN the system SHALL emit runtime state updates compatible with 3D animation states (Idle/Thinking/Typing/Celebrate/Error).
5. WHEN challenge execution returns output THEN the system SHALL store attempt artifacts (prompt, output, metadata) for evaluation.
6. WHEN the player selects a different challenge THEN the system SHALL isolate runs and scoring per challenge instance.

**Independent Test**: Complete one run for each of the 3 challenges and verify workstation routing, walking animation, output generation, and per-challenge run recording.

---

### P1: Automatically Evaluate and Progress (MVP)

**User Story**: As a player, I want challenge completion and rewards to be automatic so that I can focus on learning instead of manually grading myself.

**Why P1**: Automatic evaluation and rewards create credibility for technical execution and gameplay continuity.

**Acceptance Criteria**:

1. WHEN a challenge run completes THEN the system SHALL execute deterministic checks for objective criteria.
2. WHEN deterministic checks finish THEN the system SHALL execute an LLM rubric pass for subjective quality dimensions where configured.
3. WHEN final evaluation is computed THEN the system SHALL produce a normalized completion result (pass/fail, score, rationale).
4. WHEN a challenge is passed THEN the system SHALL award XP, update level, and apply configured unlocks including workstation unlock state.

**Independent Test**: Run one pass and one fail scenario for each challenge and verify results, XP deltas, workstation unlock behavior, and final completion state.

---

### P2: Prebuilt Agents for Demo Acceleration

**User Story**: As a presenter, I want prebuilt agents so that I can quickly demonstrate scenarios without re-entering setup every time.

**Why P2**: Improves demo reliability and pacing for presentation scoring.

**Acceptance Criteria**:

1. WHEN the workshop loads THEN the system SHALL provide at least one prebuilt agent profile that can be selected instantly.
2. WHEN a prebuilt agent is loaded THEN the system SHALL allow user overrides before running challenges.

**Independent Test**: Select prebuilt agent, run a challenge immediately, then modify prompt/model and rerun successfully.

---

### P2: Judge-Focused Demo Flow Reliability

**User Story**: As a presenter, I want a reliable local demo flow so that network hiccups or state drift do not derail the live pitch.

**Why P2**: Demo quality directly affects a full judging category.

**Acceptance Criteria**:

1. WHEN the presenter triggers demo reset THEN the system SHALL reset runtime session state while preserving saved agents, progression records, and encrypted global provider settings.
2. WHEN provider/model lookup is unavailable THEN the system SHALL allow execution with fallback model configuration.
3. WHEN a run errors THEN the system SHALL present actionable recovery guidance and keep app navigation responsive.

**Independent Test**: Perform two full demo walkthroughs back-to-back with reset between runs and no manual data cleanup.

---

### P3: Run History for Explanation Support

**User Story**: As a presenter, I want to inspect recent run results so that I can answer judge questions with concrete evidence.

**Why P3**: Helpful for Q&A but not required for core loop.

**Acceptance Criteria**:

1. WHEN challenge runs complete THEN the system SHALL keep a recent history list with result status and timestamp.
2. WHEN the presenter opens a past run THEN the system SHALL display the evaluation summary and key artifacts.

---

## Edge Cases

- WHEN global API credentials are invalid THEN system SHALL block run start and display a safe error without exposing secret values.
- WHEN model discovery returns an empty list THEN system SHALL offer configured fallback model `OpenCode/deepseek-v4-flash` and log diagnostic context.
- WHEN an image generation task is requested with a non-image-capable model THEN system SHALL block start and request a capable model selection.
- WHEN a required workstation is still locked THEN system SHALL show unlock guidance and prevent task start.
- WHEN challenge output is partially streamed or truncated THEN system SHALL evaluate only finalized content and mark run state accurately.
- WHEN deterministic and LLM evaluation disagree THEN system SHALL apply configured merge policy and include rationale.
- WHEN DB write fails during reward application THEN system SHALL mark run as non-finalized and prevent duplicate XP grants on retry.

---

## Requirement Traceability

Each requirement has a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| MVP-01 | P1: Build and Configure a Custom Agent | Tasks | In Tasks |
| MVP-02 | P1: Build and Configure a Custom Agent | Tasks | In Tasks |
| MVP-03 | P1: Build and Configure a Custom Agent | Tasks | In Tasks |
| MVP-13 | P1: Build and Configure a Custom Agent | Tasks | In Tasks |
| MVP-18 | P1: Build and Configure a Custom Agent | Tasks | In Tasks |
| MVP-14 | P1: Populate and Grow the Workshop Scene | Tasks | In Tasks |
| MVP-15 | P1: Populate and Grow the Workshop Scene | Tasks | In Tasks |
| MVP-16 | P1: Run 3 Learning Challenges End-to-End | Tasks | In Tasks |
| MVP-17 | P1: Automatically Evaluate and Progress | Tasks | In Tasks |
| MVP-04 | P1: Run 3 Learning Challenges End-to-End | Tasks | In Tasks |
| MVP-05 | P1: Run 3 Learning Challenges End-to-End | Tasks | In Tasks |
| MVP-06 | P1: Automatically Evaluate and Progress | Tasks | In Tasks |
| MVP-07 | P1: Automatically Evaluate and Progress | Tasks | In Tasks |
| MVP-08 | P1: Automatically Evaluate and Progress | Tasks | In Tasks |
| MVP-09 | P2: Prebuilt Agents for Demo Acceleration | Tasks | In Tasks |
| MVP-10 | P2: Judge-Focused Demo Flow Reliability | Tasks | In Tasks |
| MVP-11 | P2: Judge-Focused Demo Flow Reliability | Tasks | In Tasks |
| MVP-12 | P3: Run History for Explanation Support | Tasks | In Tasks |

**ID format:** `MVP-XX`

**Status values:** Pending -> In Design -> In Tasks -> Implementing -> Verified

**Coverage:** 18 total, 18 mapped to tasks, 0 unmapped

---

## Success Criteria

How we know the MVP feature is successful:

- [ ] A fresh user can create an agent (with skills/tools/color) and complete at least 1 challenge in under 2 minutes.
- [ ] All 3 shipped challenges can be run and automatically evaluated in one session without app crash.
- [ ] Agents visibly route to assigned workstations with correct animation cues during task execution.
- [ ] At least 2 consecutive full 90-second demo rehearsals complete on local laptop without manual fixes.
- [ ] Judge-facing criteria mapping can be demonstrated with concrete in-app evidence for all 4 rubric categories.
