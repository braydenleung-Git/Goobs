# Goobs Demo Walkthrough

> 5-minute live demo covering the full core loop: create → deploy → chat → level up

---

## Setup

```bash
npm install && npx prisma db push && npm run dev
```

Open `http://localhost:3000`. Set up an LLM provider (gear icon → base URL + API key) before you start.

---

## FULL DEMO SCRIPT

Say this verbatim. Type exactly what's shown.

---

### 0. Before You Start

```bash
# Terminal 1
npm run dev
```

Browser → `http://localhost:3000` → gear icon → set base URL + API key → Close.

---

### 1. Launch (0:00–0:15)

**Page loads. Rainbow "goobs" title is on screen.**

> **You say:** *"Goobs teaches AI agents through play. You create chibi characters, give them skills and tools, and watch them work in a living 3D workshop. The progression system guides you from zero to agent mastery."*

**Click "Get Started"** (wait for launch screen to disappear).

---

### 2. Intro Cards (0:15–0:25)

**Four cards appear: Agents, Skills, Tools, Challenges.**

> **You say:** *"Quick primer — four concepts that make up the whole experience."*

**Click "Got it!"**

---

### 3. Create Agent 1 — PyBoi (0:25–1:05)

**Click "Create" tab in top nav.**

> **You say:** *"First agent. Every good Pythonista needs a companion."*

**Fill in:**

| Field | Exact Input |
|-------|-------------|
| Name | `PyBoi` |
| System Prompt | `You are a Python expert who writes clean, well-documented code.` |

**Scroll to Skills. Click "+ Add Skill". Paste this into the modal textarea:**

```markdown
# Python
Python is a high-level, interpreted programming language.
Key features: dynamic typing, extensive standard library, third-party packages via pip.
Use `def` for functions, `class` for objects, `import` for modules.
Keep code PEP 8 compliant. Write docstrings for all public functions.
```

**Click "Save Skill"**

> **You say:** *"Skills are markdown knowledge blocks you write yourself. This is what makes your agent smart about a topic."*

**Pick colors** — any skin, shirt, pants.

**Click "Create Agent"**

> **You say (after toast fires):** *"Twenty XP. First challenge done. Watch the challenge dock bottom-left — it tracks all progression."*

---

### 4. Create Agent 2 — BashBuddy (1:05–1:35)

> **You say:** *"Second agent — different specialty, different tools."*

**Create tab → fill in:**

| Field | Exact Input |
|-------|-------------|
| Name | `BashBuddy` |
| System Prompt | `You are a Linux systems expert. You write shell scripts and automate tasks.` |

**"+ Add Skill" → paste:**

```markdown
# Shell Scripting
Bash scripting for Linux automation.
Shebang: `#!/bin/bash`. Variables: `$VAR`.
Conditionals: `if [ condition ]; then commands; fi`.
Loops: `for i in list; do commands; done`. Functions: `func() { body; }`.
Always check exit codes with `$?`. Quote variables to prevent word splitting.
```

**"Save Skill" → pick colors → "Create Agent"**

---

### 5. Deploy to Workshop (1:35–2:10)

**Click "Workshop" tab.**

> **You say:** *"Now we bring them to life."*

**Hover left edge** → sidebar slides out.

> **You say:** *"Drag and drop — agents become 3D characters."*

**Grab PyBoi** by its name in the sidebar → **drag into the scene** → drop.

**Grab BashBuddy** → **drag into the scene** → drop.

> **You say (after Field Two Agents toast):** *"Two agents deployed — that triggers the 'Field Two Agents' challenge, which unlocks the filesystem tool. Watch the dock."*

**Click an agent** in the scene.

> **You say:** *"Click to focus. Selection ring, camera moves in. The sidebar shows their details — prompt, skills, model."*

---

### 6. Chat with PyBoi (2:10–2:40)

**Click PyBoi in the scene → chat panel slides out from the right.**

> **You say:** *"Chat panel. SSE streaming, markdown rendering, per-agent history. Let's give it a task."*

**Type exactly:**

```
Write a Python function called `greet(name)` that returns a greeting. Include a docstring.
```

**Hit Enter. Watch:**
1. Animation changes to thinking
2. Text streams in
3. Markdown renders

> **You say (after First Chat toast):** *"First chat — fifty more XP. That completes all Tier 1 challenges and promotes us to Tier 2. Watch..."*

**"Tools Unlocked!" modal appears.**

> **You say:** *"Tier 2 unlocks filesystem and bash tools. Your agents can now read, write, and execute."*

**Click "Got it!" on the modal.**

---

### 7. Enable Tool Profile (2:40–2:55)

> **You say:** *"Now that Tier 2 unlocked tools, let's enable them on BashBuddy."*

**Go to "Create" tab → find BashBuddy in the agents list → click to edit.**

In the edit form, find **Tool Profile** dropdown (now enabled since Tier 2):

**Select "Full (includes Bash)"**

**Click "Update Agent"**

> **You say:** *"Full profile gives read, write, and bash access. Gated behind progression — you have to earn it."*

---

### 8. BashBuddy Uses Tools (2:55–3:30)

**Switch to Workshop → click BashBuddy → chat panel opens.**

> **You say:** *"Now BashBuddy can write files and run commands. Watch the tool call cards appear in real time."*

**Type exactly:**

```
Create a bash script called greet.sh that prints "Hello from Goobs" and then run it.
```

**Hit Enter. Watch:**

1. First tool call card appears: `write_file greet.sh`
2. Card updates with file path
3. Second tool call card: `exec_bash bash greet.sh`
4. Card shows command, stdout (`Hello from Goobs`), exit code `0`
5. Final response streams in

> **You say:** *"Tool call cards show every step — what was written, what was executed, and the result. This is a real agent doing real work."*

---

### 9. Run a Workshop Challenge (3:30–4:00)

> **You say:** *"The workshop ships with 3 challenges that test your agents — Change Prompt, Code Writer, and Multi-Tool. Let's run one."*

**Open the challenge runner (gear icon → find challenges / run section, or click a challenge in the dock, or however the ChallengeRunnerPanel is surfaced).**

**Select challenge** → "Change Prompt" (simplest, no tools needed).

**Select agent** → PyBoi.

**Click "Run Challenge".**

Wait a few seconds for the run to complete.

> **You say:** *"The challenge runner sends the prompt to the agent, collects the response, and runs it through the evaluation engine — deterministic keyword checks plus rubric scoring. PASS or FAIL with a score."*

**Result shows: PASS / FAIL with score + XP.**

> **You say:** *"Each challenge teaches something different. Change Prompt shows how system prompts affect behavior. Code Writer tests file writing. Multi-Tool chains file and bash together."*

---

### 10. Progression Wrap-Up (4:00–4:30)

**Point to the challenge dock bottom-left.**

> **You say:** *"Here's what we accomplished in under 5 minutes: Created 2 agents with custom skills, deployed them as 3D characters, chatted with them, unlocked filesystem and bash tools, watched them write and execute real code, and ran a workshop challenge."*

**Count the checkmarks in the dock.**

> **You say:** *"Eight challenges across three tiers. Every action fires a progression event — the engine checks all challenges, awards XP immediately, and unlocks new capabilities on the spot. Session-based state means every demo starts fresh."*

**Look at the judges.**

> **You say (the closer):** *"Goobs turns AI agent concepts into a game. System prompts, skills, models, tools — every challenge maps to a real skill you'd use building agents professionally. The 3D characters make it visual. The progression system makes it a game. And the best part? These are real LLM agents doing real work — the code they write, the files they create, the commands they run — it all works. This is how you learn AI agents — by playing."*

---

## Exact Inputs Cheat Sheet

### Create Agent 1: PyBoi

| Field | Value |
|-------|-------|
| Name | `PyBoi` |
| System Prompt | `You are a Python expert who writes clean, well-documented code.` |
| Skill | Paste the Python markdown block above |

### Create Agent 2: BashBuddy

| Field | Value |
|-------|-------|
| Name | `BashBuddy` |
| System Prompt | `You are a Linux systems expert. You write shell scripts and automate tasks.` |
| Skill | Paste the Shell Scripting markdown block above |

### Chat Messages

| To | Message |
|----|---------|
| PyBoi | `Write a Python function called greet(name) that returns a greeting. Include a docstring.` |
| BashBuddy | `Create a bash script called greet.sh that prints "Hello from Goobs" and then run it.` |

---

## Progression Reference

| Tier | Challenge | Trigger | XP | Unlock |
|------|-----------|---------|----|--------|
| 1 | Create Agent | `agent_created` | 20 | — |
| 1 | Add Skill | `skill_added` | 30 | — |
| 1 | Deploy to Workshop | `agent_deployed` | 40 | — |
| 1 | First Chat | `chat_sent` | 50 | — |
| 2 | Field Two Agents | counter: 2 deploy | 60 | filesystem |
| 2 | Write a File | counter: 1 write | 50 | — |
| 2 | Execute Bash | counter: 1 bash | 100 | bash |
| 3 | Build a Script | counter: 2 combo | 200 | — |

---

## Judge Q&A Prep

**Q: "What makes this different from any other agent builder?"**
> *"Most tools show agents as text in a terminal. We show them as 3D characters you can customize, deploy, and watch work. The game loop — create, deploy, chat, level up — teaches real concepts without tutorials."*

**Q: "How is this educational?"**
> *"Eight challenges across 3 tiers progressively teach: what is a system prompt, how skills work, what tool use looks like, how models differ. Every challenge maps to a real concept. By the end you've built two production-ready agents."*

**Q: "Is it just a demo or can people actually use it?"**
> *"It's a real workshop. Bring your own API key, create agents with custom prompts and skills, chat with them, give them filesystem and bash access. The code they write, the files they create — it's real."*

**Q: "How do you handle multiple users / state?"**
> *"Progression lives in sessionStorage — each session starts fresh, perfect for demo kiosks. Server state persists runs per agent for audit. The demo reset endpoint wipes everything clean with one click."*

**Q: "What's the hardest technical challenge?"**
> *"Three systems in real time — 3D character rendering with FSM animations, LLM orchestration with SSE streaming and tool calls, and the progression engine — all updating simultaneously without race conditions. Making a chibi character look like it's thinking while it streams a response was surprisingly hard."*

---

## Timing Summary

| Time | Action | Judge Sees |
|------|--------|------------|
| 0:00 | Page loads | Rainbow goobs title |
| 0:15 | Click "Get Started" | Scene + intro cards |
| 0:25 | Create PyBoi | Form fill, skill modal |
| 1:05 | Create BashBuddy | Second agent |
| 1:35 | Drag + drop both | 3D characters in scene |
| 2:10 | Chat with PyBoi | SSE streaming + markdown |
| 2:40 | Tools Unlocked modal | Progression payoff |
| 2:55 | Chat BashBuddy uses tools | Tool call cards |
| 3:30 | Run workshop challenge | Evaluation engine |
| 4:00 | Show challenge dock | 8 challenges mapped |
| 4:30 | Closing pitch | — |
