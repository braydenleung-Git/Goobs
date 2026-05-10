# Goobs Demo Walkthrough

> 5-minute live demo covering the full core loop: create → deploy → chat → level up

---

## Setup

```bash
npm install && npx prisma db push && npm run dev
```

Open `http://localhost:3000`. Set up an LLM provider (gear icon → base URL + API key) before you start.

---

## Script

### 1. Launch (0:00–0:20)

Hit the page. Rainbow "goobs" title with animated gradient + subtitle. Click **"Get Started"** — this POSTs to `/api/demo/reset`, wiping DB + sessionStorage, then seeds 2 prebuilt agents (CodeBot, PromptWizard).

**Say:** *"Goobs teaches AI agents through play. You create chibi characters, give them skills and tools, chat with them, and watch them work in a living 3D workshop. A progression system guides you from basic concepts to advanced tool use."*

### 2. Intro Cards (0:20–0:35)

Four cards pop up automatically: **Agents, Skills, Tools, Challenges**. Each explains one concept. Click **"Got it!"**

**Say:** *"Quick primer: Agents are chibi characters you create. Skills are markdown knowledge blocks. Tools let agents act — read/write files, run bash. Challenges teach you step by step."*

### 3. Create Agent 1 with a Skill (0:35–1:15)

Switch to the **"Create"** tab. Fill in:

- **Name:** `PyBoi`
- **System prompt:** `"You are a Python expert who writes clean, well-documented code."`
- **Skills:** Click "+ Add Skill" → paste markdown:

```markdown
# Python
Python is a high-level, interpreted programming language.
Use `def` for functions, `class` for objects, `import` for modules.
```

  → **Save Skill** (fires `skill_added` progression event)

- Pick skin/shirt/pants colors
- Click **"Create Agent"** (fires `agent_created` → +20 XP)

👉 Toast: **"Create Agent · +20 XP"** — challenge dock updates to 1/8

**Say:** *"Each agent has a system prompt, markdown skills you write yourself, and a 3D character you customize. Skills teach the agent what it needs to know."*

### 4. Create Agent 2 (1:15–1:40)

Switch to "Create" tab again:

- **Name:** `BashBuddy`
- **System prompt:** `"You are a Linux expert. You write shell scripts and automate tasks."`
- **Skill:**

```markdown
# Shell Scripting
Bash scripting for Linux. Shebang: `#!/bin/bash`.
Variables: `$VAR`. Conditionals: `if []; then; fi`.
```

→ **Create Agent**

### 5. Deploy to Workshop (1:40–2:15)

Switch to **"Workshop"** tab. The 3D isometric scene loads with auto-rotate. **Hover the left edge** → agent sidebar slides out.

- **Drag PyBoi** from sidebar into the scene → drops at cursor position as a 3D chibi character with floating name badge
- **Drag BashBuddy** → drops separately

Click an agent → selection ring appears, camera focuses on it. Sidebar shows demo badge on prebuilt agents and expandable info (prompt, skills, model).

👉 First deploy: **"+40 XP — Deploy to Workshop"**
👉 Second deploy completes **"Field Two Agents · +60 XP"** → **Filesystem unlocked!**
👉 Progress: **Tier 1 complete (140 XP)** → promotes to **Tier 2**

**Say:** *"Drag and drop — agents become 3D characters in the scene. Click to focus. The challenge dock tracks everything."*

### 6. Chat with SSE Streaming (2:15–2:45)

Click PyBoi in scene → **Chat panel** slides out from the right. Shows agent state, model, skills, and a text input.

Type: *"Write a `greet(name)` function that returns a hello message."*

Watch:
1. Agent animation → **thinking** (FSM state change)
2. Response streams via SSE (Server-Sent Events)
3. Text renders as formatted markdown
4. Animation → **idle** when done

👉 **"+50 XP — First Chat"** → all Tier 1 challenges complete
👉 **"Tools Unlocked!"** modal appears — explains File Tools + Bash Commands + how to enable tool profiles in edit panel

**Say:** *"Real-time streaming chat with your agent. Markdown responses, thinking animation, per-agent conversation history that persists across tab switches."*

### 7. Tool Use via Chat (2:45–3:30)

Now that tools are unlocked (Tier 2), edit BashBuddy's tool profile:

1. Click gear icon → config panel
2. Open BashBuddy from sidebar, update tool profile to **"Read + Write"** or **"Full"** (gated by tier)
3. In chat, ask: *"Create a script called greet.sh that prints 'Hello from Goobs' and run it."*

Agent will:
1. Call `write_file` → creates the script (collapsible tool call card shows file path)
2. Call `exec_bash` → runs it (card shows command, stdout, exit code)
3. Return the output

👉 Tool call cards display inline with real-time progress: call args → execution → result
👉 **"+50 XP — Write a File"**, **"+100 XP — Execute Bash Command"** (Bash unlocked!)
👉 If both fire in same turn, **"Build a Script"** counter ticks

**Say:** *"Tier 2 unlocks filesystem and bash tools. Tool call cards show every step — what the agent wrote, what commands it ran, and the output."*

### 8. Run a Workshop Challenge (3:30–4:00)

Click **gear icon → Config → Challenges** (or the gear to open config, then ChallengeRunnerPanel). Or click the challenge dock bottom-left and click a challenge to view details.

Select a challenge (e.g., **"Change Prompt"**), pick an agent, click **"Run Challenge"**.

The challenge runner:
1. Sends prompt to the agent (optionally with tools for code-writer/multi-tool)
2. Runs evaluation engine (deterministic checks + rubric scoring)
3. Shows PASS/FAIL with score, XP awarded, level
4. Stores result in ChallengeRun table

**Say:** *"The workshop has 3 built-in challenges. In 'Change Prompt,' the agent writes a poem about AI and we check for keywords. In 'Code Writer,' the agent writes a Python function using file and bash tools. In 'Multi-Tool,' it designs a REST API — plan then implement."*

### 9. Progression Wrap-Up (4:00–4:30)

Point to the **challenge dock** bottom-left. It shows:
- Completed challenges with checkmarks
- Current tier and progress counters (agents deployed, files written, commands run)
- Unlock badges (Filesystem ✓, Bash ✓)
- XP and level tracking

Every action fires progression events. The engine checks all 8 challenges on each event, awarding XP and unlocks immediately.

**Say:** *"8 challenges across 3 tiers. Create → deploy → chat → tool use → automation. Every action earns XP, unlocks new capabilities, and teaches you how agents really work. These are real LLM agents doing real work — the code they write, the files they create, the commands they run — it all works."*

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

## Judging Criteria Mapping

| Criterion | How Goobs Hits It |
|-----------|-------------------|
| **Technical (25%)** | R3F 3D scene with FSM animations, drop-to-deploy, SSE streaming chat, tool registry/execution, evaluation engine, progression engine |
| **Innovation (25%)** | Agents as customizable 3D chibi characters (not terminal text), skills as user-written markdown, tool unlocks as game mechanic |
| **Impact (25%)** | Teaches real agent concepts — prompts, skills, models, tools — through play. Real work (code, files, bash) from real LLM agents |
| **Presentation (25%)** | Visual from second one (3D scene, rainbow launch), progression toasts + animations = filmable, clear arc: create → deploy → chat → level up |

---

## Key Lines to Say

- *"Skills are markdown knowledge blocks. You write them — they teach your agent what it needs to know."*
- *"Drag and drop — agents become 3D characters in a living workshop."*
- *"The challenge dock tracks everything. Complete challenges to unlock tools."*
- *"Tier 2 unlocks filesystem and bash — your agents can read, write, and execute."*
- *"8 challenges, 3 tiers, real agents doing real work. This is how you learn AI agents — by playing."*
