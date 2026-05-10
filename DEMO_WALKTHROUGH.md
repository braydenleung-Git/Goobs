# Goobs Demo Walkthrough — Gamification Track

> A 5-minute live demo with progression, 2 agents, skills, and challenges.

---

## Setup (Before Demo)

```bash
npm install
npx prisma db push
npm run dev
```

Open `http://localhost:3000`. Configure an LLM provider (gear icon → set base URL + API key) so the agent chat and challenge runner work.

---

## The Demo Script

### Phase 1: Launch & Context (0:00–0:30)

1. **Refresh the page** — the Launch Screen appears with the rainbow "goobs" title
2. Click **"Get Started"** — this resets everything and seeds CodeBot + PromptWizard
3. **Intro Cards** pop up automatically explaining Agents, Skills, Tools, Challenges
4. Click **"Got it!"**
5. Say: *"Goobs turns AI agent concepts into a game. Watch the bottom-left — that's the challenge dock. It tracks your progression through 8 challenges across 3 tiers."*

### Phase 2: Create Agent 1 (0:30–1:15)

1. Click **"Create"** tab in the top nav
2. Name: **"PyBoi"**
3. System prompt: *"You are a Python expert who writes clean, well-documented code."*
4. Click **"+ Add Skill"** — paste in a markdown skill block:

```markdown
# Python
Python is a high-level, interpreted programming language.
Key features: dynamic typing, extensive standard library,
third-party packages via pip. Use `def` for functions,
`class` for objects, `import` for modules.
```

5. Click **"Save Skill"**
6. Note the **"Skills" badge** on the sidebar shows the skill name
7. Pick a color (skin, shirt, pants)
8. Click **"Create Agent"**

👉 **XP toast fires:** "+20 XP — Create Agent"
👉 **Challenge dock updates:** 1/8 complete

### Phase 3: Create Agent 2 (1:15–1:45)

1. Click **"Create"** tab again
2. Name: **"BashBuddy"**
3. System prompt: *"You are a Linux systems expert. You write shell scripts and automate tasks."*
4. Add a skill:

```markdown
# Shell Scripting
Bash scripting for Linux. Use `#!/bin/bash` shebang.
Variables: `$VAR`. Conditionals: `if []; then; fi`.
Loops: `for i in list; do; done`. Functions: `func() {}`.
```

5. Pick different colors
6. Click **"Create Agent"**

### Phase 4: Deploy Both Agents to Workshop (1:45–2:15)

1. Switch to **"Workshop"** tab
2. **Hover the left edge** — the Agent Sidebar slides out
3. **Drag "PyBoi"** from the sidebar into the 3D scene and drop it
4. The agent appears as a 3D chibi character at the drop position
5. **Drag "BashBuddy"** into the scene too
6. Click on an agent — a **selection ring** appears, the camera focuses on it

👉 **XP toasts fire as you deploy each:**
- "+40 XP — Deploy to Workshop"
- When second is deployed: **"+60 XP — Field Two Agents"**
- **"Filesystem Unlocked!"** toast fires (you now have access to read/write tools)

### Phase 5: Chat with an Agent (2:15–2:45)

1. Click on PyBoi in the scene → the **Chat Panel** slides out from the right
2. Type: *"Write a Python function called `greet(name)` that returns a greeting."*
3. Watch as:
   - Agent animation changes to "thinking" 
   - Response streams in via SSE
   - Tool call cards appear if the agent uses tools
   - Final response appears as formatted markdown

👉 **XP toast fires:** "+50 XP — First Chat"
👉 **Tier 1 complete!** Tier promotion toast: **"Tier 2 — Tools unlocked"**
👉 **Tool Introduction Modal** appears — explains file + bash tools

### Phase 6: Run a Challenge (2:45–3:30)

1. Click **"Challenges"** tab in the dock (or click the challenge dock bottom-left)
2. Click the **"Change Prompt"** challenge
3. A challenge detail popup explains what to do
4. Click **"Run Challenge"**
5. The challenge runner interface appears — select an agent and execute
6. Watch the challenge run: agent responds, evaluation runs, results display
7. **XP awarded** based on the challenge result

### Phase 7: Use Tools via Chat (3:30–4:00)

1. Click BashBuddy in the scene to open chat
2. Type: *"Write a script called 'hello.sh' that prints 'Hello from Goobs!' and run it."*
3. The agent will:
   - Call `write_file` to create the script
   - Call `exec_bash` to run it
   - Show both tool call cards inline

👉 **Tool use events fire progression:**
- Write File challenge completes
- Exec Bash challenge completes  
- When both happen: **Build a Script** counter starts

### Phase 8: Show Progression (4:00–4:30)

1. Point to the **Challenge Dock** (bottom-left) — shows completed challenges with checkmarks
2. Click a completed challenge → **Challenge Detail Popup** shows "Completed ✓" with XP earned
3. Highlight:
   - Filesystem badge: unlocked ✓
   - Bash badge: unlocked ✓
   - Tier badges showing current tier

### Phase 9: Wrap-Up (4:30–5:00)

> *"What just happened: You created 2 custom AI agents with different skills and personalities, deployed them as 3D characters, chatted with them, watched them use tools to write and run code, and leveled up through 8 progression challenges — all in under 5 minutes.*

> *Goobs teaches AI agent concepts through play. System prompts, skills, tools, models — every challenge maps to a real skill. The 3D characters make it visual. The progression system makes it a game.*

> *And the best part? These are real LLM agents doing real work. The code they write, the files they create, the commands they run — it all works."*

---

## Key Moments to Hit

| Timestamp | Moment | Why It Matters |
|-----------|--------|----------------|
| 0:10 | Launch screen | Visual hook — 3D scene + rainbow branding |
| 0:45 | Skill modal | Skills = markdown knowledge blocks (novel mechanic) |
| 1:30 | Create 2nd agent | Demonstrates multi-agent concepts |
| 2:00 | Drag & drop deploy | 3D integration — agents as tangible characters |
| 2:20 | Field Two Agents challenge | Counter-based challenge | 
| 2:40 | Chat streaming | Real-time SSE + "thinking" animation |
| 3:00 | Tier 2 promotion + tool unlock | Progression system payoff |
| 3:20 | Challenge run | Built-in evaluation engine |
| 4:00 | Tool call cards | Agent using read/write/bash in real time |

---

## Gamification Judging Criteria Mapping

### Technical Execution (25%)
- 3D scene with R3F, drop-to-deploy, animation states
- LLM orchestration with SSE streaming + tool calls
- Progression engine with 8 challenges, counters, event triggers
- Evaluation engine with deterministic checks + rubric scoring

### Innovation & Creativity (25%)
- Agents as 3D chibi characters — not terminal text or chat bubbles
- Skills as markdown knowledge blocks (user-writable)
- Progression system that teaches real AI concepts through play
- Tool unlock gating as a game mechanic

### Impact & Usefulness (25%)
- Teaches: prompt engineering, model selection, tool use, multi-agent
- Real agents doing real work (writing code, running commands)
- Works with any OpenAI-compatible provider

### Presentation & Demo (25%)
- Visual from second one — 3D characters bouncing in scene
- "Level up" moment = toast + animation = filmable
- Complete arc: create → deploy → chat → challenge → level up
- Fun factor: only project with chibi AI characters

---

## Challenge Flow Summary

```
Tier 1 (Onboarding)
  ├── Create Agent     → event: agent_created     → +20 XP
  ├── Add Skill        → event: skill_added        → +30 XP
  ├── Deploy Workshop  → event: agent_deployed     → +40 XP
  └── First Chat       → event: chat_sent          → +50 XP
                      ─────────────────────────────────
                      Total Tier 1: 140 XP → promotes to Tier 2
                      Unlocks: filesystem tools

Tier 2 (Tools)
  ├── Field Two Agents → counter: 2 deploy        → +60 XP
  ├── Write a File     → counter: 1 write_file     → +50 XP
  └── Exec Bash        → counter: 1 exec_bash      → +100 XP
                      ─────────────────────────────────
                      Total Tier 2: 210 XP → promotes to Tier 3
                      Unlocks: bash tools

Tier 3 (Automation)
  └── Build a Script   → counter: 2 build_script   → +200 XP
                      (requires write + bash combo)
```

---

## Quick Reference: What to Say

**Opening:** *"Goobs turns AI agent concepts into a game. Every action earns XP and unlocks new capabilities."*

**On skills:** *"Skills are markdown knowledge blocks. You write them — they teach your agent what it needs to know."*

**On deployment:** *"Drag and drop agents into the 3D scene. They're real characters now."*

**On progression:** *"Every action fires a progression event. The challenge dock tracks everything. Complete challenges to unlock tools."*

**On tools:** *"Once unlocked, your agents can read, write, and execute files. Real tools doing real work."*

**Closing:** *"In 5 minutes you built two agents, taught them skills, deployed them, chatted with them, and leveled up. This is how you learn AI agents — by playing."*
