# The Agent Workshop — Full Expansion

> *"Learn how AI agents work by building, training, and battling them."*

---

## Core Loop

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ CREATE       │────▶│ TRAIN        │────▶│ COMPLETE     │────▶│ LEVEL UP     │
│ an agent     │     │ with skills  │     │ challenges   │     │ + unlocks    │
│              │     │ + prompts    │     │              │     │              │
│ Pick name    │     │ Give tasks   │     │ Earn rewards  │     │ New skills   │
│ Customize 3D │     │ Earn XP      │     │ Unlock items  │     │ New items    │
│ Choose model │     │ Improve stats│     │ Rank up      │     │ Harder       │
│              │     │              │     │              │     │ challenges   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

The player creates an AI agent (3D character + skills + system prompt + model), gives it real tasks to complete, and watches it earn XP, level up, and unlock new abilities. The game is the interface — the agent IS the character.

---

## Player Goal

**Become an AI agent master.** Understand how agents work — system prompts, model selection, skill assignment, tool use — by building and deploying increasingly capable agents.

The game has a clear end-state: **unlock all agent slots, reach max level, complete all challenges, and build a team of specialized agents that can handle any task.**

---

## Challenge System

Challenges are the core gameplay. Each challenge tests a specific skill — both the agent's skill AND the player's understanding of how to configure that agent.

### Tier 1: Tutorial (The Basics)

| Challenge | What the Player Does | What They Learn | XP Reward |
|---|---|---|---|
| **First Steps** | Create your first agent using a template | Agent creation flow | 50 |
| **Hello World** | Give your agent a simple task ("write a poem") | Chat interface, agent responses | 30 |
| **Change the Prompt** | Modify the system prompt and see behavior change | Prompt engineering matters | 40 |
| **Add a Skill** | Add "Python" skill to your agent | Skills define capabilities | 35 |
| **Try a New Model** | Switch from GPT-4o to Gemma and compare | Model selection impacts quality | 75 |

### Tier 2: Builder (Skill Development)

| Challenge | What the Player Does | What They Learn | XP Reward |
|---|---|---|---|
| **Code Writer** | Agent writes a working Python function | Coding agent setup, code quality | 100 |
| **Bug Hunter** | Agent finds and explains a bug in provided code | Debugging, analytical prompting | 120 |
| **Research Assistant** | Agent summarizes a topic from the web | Web search tool use | 110 |
| **API Builder** | Agent designs a REST API endpoint structure | API design, structured output | 130 |
| **Refactor Master** | Agent refactors messy code into clean code | Code quality, readability prompting | 140 |

### Tier 3: Advanced (Mastery)

| Challenge | What the Player Does | What They Learn | XP Reward |
|---|---|---|---|
| **Multi-Tool** | Agent uses two tools together (search + write) | Tool chaining, multi-step tasks | 200 |
| **System Prompt Architect** | Write a prompt that makes the agent behave as a specific persona | Advanced prompt engineering | 250 |
| **Model Showdown** | Same task with 3 different models, compare outputs | Model comparison, cost/quality tradeoffs | 300 |
| **Agent Team-Up** | Create two agents, have them collaborate on one task | Multi-agent orchestration | 350 |
| **The Gauntlet** | One agent completes 5 diverse tasks in a row | Agent robustness, context windows | 500 |

### Tier 4: Expert (True Mastery)

| Challenge | What the Player Does | What They Learn | XP Reward |
|---|---|---|---|
| **Custom Tool** | Connect an MCP tool to your agent | MCP protocol, tool integration | 400 |
| **Edge Case Hunter** | Find and handle 5 edge cases in a provided spec | Robustness testing, prompt edge cases | 450 |
| **Prompt Injection Defense** | Write a system prompt resistant to prompt injection | Security, prompt hardening | 500 |
| **Cost Optimizer** | Complete a task using the cheapest model that succeeds | Cost awareness, model selection strategy | 550 |
| **Agent Team Lead** | Orchestrate 3 agents on a complex multi-step project | Full agent workflow orchestration | 800 |

---

## Player Progression

### Agent Slots (Unlocked by Player Level)

| Player Level | XP Needed | Unlock |
|---|---|---|
| 1 | 0 | 1 agent slot, basic character |
| 2 | 150 | 2 agent slots |
| 3 | 400 | Hat accessory |
| 4 | 750 | 3 agent slots |
| 5 | 1,200 | Glow effect |
| 6 | 1,800 | 4 agent slots |
| 7 | 2,500 | Particle effects |
| 8 | 3,500 | Custom idle animation |
| 9 | 5,000 | 5 agent slots |
| 10 | 7,000 | Neon glow, legendary hat, all effects |

### Agent Stats (Per Agent, Tracked and Displayed)

Each agent has 5 core stats that grow with use:

| Stat | What It Measures | How It Increases |
|---|---|---|
| **Efficiency** | Task completion rate | +1 per 5 completed tasks |
| **Accuracy** | Tasks accepted without revision | +1 per accepted task |
| **Speed** | Average response time | +1 per fast completion |
| **Versatility** | Unique skills used | +1 per new skill used |
| **Wisdom** | Tokens of context processed | +1 per 10k tokens |

Stats are displayed on the agent's 3D hover card and affect gameplay — higher stats unlock harder challenges.

---

## The 3D Character System

### Customization (Aesthetic Only — No Pay-to-Win)

| Category | Options |
|---|---|
| **Body Color** | 12 preset colors |
| **Eyes** | 5 eye styles (circle, star, heart, slit, glow) |
| **Hat** | None, crown, wizard hat, chef hat, hard hat, top hat, beanie, graduation cap |
| **Glow** | None, soft, neon, fire, ice, electric |
| **Accessory** | None, glasses, bow tie, scarf, wings, cape, backpack, toolbelt |
| **Animation Style** | Bouncy, floaty, robotic, sleepy, energetic |

### Hats as Achievement Badges

Hats are the primary visual reward. They're unlocked by completing specific challenges:

| Hat | How to Unlock |
|---|---|
| **Crown** | Complete Tier 1 challenges |
| **Wizard Hat** | Complete "System Prompt Architect" challenge |
| **Hard Hat** | Complete "Code Writer" challenge |
| **Chef Hat** | Complete "Research Assistant" challenge |
| **Graduation Cap** | Complete "The Gauntlet" challenge |
| **Top Hat** | Complete "Model Showdown" challenge |
| **Beanie** | Complete "Agent Team-Up" challenge |
| **Legendary Crown** | Complete "Agent Team Lead" challenge |

---

## Visual Demo Flow (90 Seconds)

1. **:00–:10** — Show the workshop. Three 3D characters are bouncing in a scene.
2. **:10–:25** — Click "New Agent." Walk through: name it "CodeBot," pick blue color, circle eyes, wizard hat, neon glow.
3. **:25–:35** — Add skills: Python, FastAPI, SQL. Write system prompt: "You are a focused Python backend developer."
4. **:35–:40** — CodeBot appears in the scene. Select the challenge "Code Writer" from the challenge list.
5. **:40–:50** — CodeBot animates (thinking spin → typing hands → celebration bounce). Code appears on screen.
6. **:50–:60** — XP bar fills. Notification: "Challenge Complete! +100 XP." Level up: "Level 3 reached! Hat unlocked!" 
7. **1:00–:110** — Show stat card: Efficiency 78%, Accuracy 82%, 15 tasks completed.
8. **1:10–:130** — "The more you use your agents, the stronger they get. And the more you learn about how agents actually work."

---

## How the Judging Criteria Are Met

### Technical Execution (25%) — Target: 8/10

Three distinct technical systems working together:
1. **Three.js 3D renderer** — real-time character rendering with animations and customization
2. **LLM orchestration backend** — spawns real agent sessions with user-provided API keys, handles streaming responses, manages context
3. **Gamification engine** — XP tracking, leveling, stat calculation, unlock logic, challenge verification

The challenge is making all three work together in real time — the 3D character animates based on the LLM's state, the XP updates as tasks complete, the stat card refreshes automatically.

### Innovation & Creativity (25%) — Target: 8/10

- **Novel interface paradigm:** Nobody has represented AI agents as 3D characters that level up. Current tools show agents as text in a terminal or a chat bubble.
- **Learning-through-play:** The game loop teaches real AI agent concepts (system prompts, model selection, tool use) without explicit tutorials.
- **Challenge-based progression:** Each challenge maps to a real skill the player develops, not a fabricated game mechanic.

### Impact & Usefulness (25%) — Target: 7/10

- **Real utility:** These are real LLM-powered agents doing real work. The code they write, research they do, and bugs they find are functional.
- **Educational value:** Players learn prompt engineering, model comparison, tool integration, and multi-agent orchestration through play.
- **Onboarding for AI:** The biggest barrier to AI agent adoption is understanding. This project removes that barrier through gamification.

The gap vs Retrospect: this solves a less urgent problem. Session loss is a daily pain. "I don't understand how to configure agents" is a learning gap, not a crisis.

### Presentation & Demo (25%) — Target: 9/10

- **Visual from second one:** 3D characters bouncing on screen is immediately attention-grabbing
- **The "level up" moment is filmable:** When the 3D character does a celebration animation and a particle burst fires, judges reach for their phones
- **Complete story arc:** Create → challenge → animate → level up → unlock. Clear beginning, middle, end.
- **Fun factor:** It's the only project in the room that makes people smile

---

## The Judge Pitch (45 seconds)

> *"AI agents are the most powerful tool most people have never learned to use. The barrier isn't access — it's understanding. What is a system prompt? How do skills work? Why does model choice matter?*
>
> *The Agent Workshop teaches you by building. You create 3D characters that are real AI agents — give them names, skills, personalities, and models. You give them challenges — write code, find bugs, research topics. They animate, respond, and level up.*
>
> *Every challenge teaches you something real about how agents work. By the time you've built three agents, you understand prompt engineering, model selection, and tool use — without a single tutorial.*
>
> *The game loop drives the learning. And it's the most fun you'll have building an AI agent all weekend."*

---

## Against the Gamification Criteria

| Criterion | How It's Met |
|---|---|
| **Has challenges** | 20 challenges across 4 tiers. Each has a clear goal, a learning outcome, and an XP reward. |
| **Player goals** | Short-term: complete challenges. Mid-term: level up agents. Long-term: master agent configuration, unlock all items, complete The Gauntlet. |
| **Progression system** | Player level (10 levels), agent level (per-agent), XP (per action), unlocks (hats, effects, slots). |
| **Rewards** | XP, levels, hats, glow effects, particle effects, new agent slots, animations. Every action gives something. |
| **Meaningful choices** | Which model to use? Which skills to assign? Which prompt style works best? Each choice affects performance. |
| **Learning outcomes** | 20 challenges teach: prompt engineering, model selection, skill assignment, tool use, MCP, multi-agent orchestration, cost optimization, security. |
| **Fun factor** | 3D characters with animations, customization, and visual feedback. The "level up" moment is genuinely satisfying. |
