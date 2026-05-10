import type { AnimationState } from "@/components/scene/runtime-state-adapter"

export type Tier = 1 | 2 | 3

export type ProgressionEventType = "agent_created" | "skill_added" | "agent_deployed" | "tool_write_file" | "chat_sent"

export interface ProgressionEvent {
  type: ProgressionEventType
  agentId?: string
}

export interface ChallengeDef {
  id: string
  title: string
  description: string
  tier: Tier
  xpReward: number
  trigger: "event" | "counter"
  eventType?: ProgressionEventType
  counterCheck?: (counters: Counters) => boolean
  unlocks?: string[]
}

export interface Counters {
  deployedAgentIds: string[]
  writeFileCount: number
}

export interface Unlocks {
  filesystem: boolean
  bash: boolean
}

export interface ProgressionState {
  tier: Tier
  xp: number
  completedChallenges: string[]
  counters: Counters
  unlocks: Unlocks
}

export interface ProgressionDelta {
  newChallenges: string[]
  xpGained: number
  newUnlocks: string[]
  tierChanged: boolean
  newTier: Tier
  toast?: { title: string; subtitle: string }
}

const STORAGE_KEY = "goobs-progression"
const TIER_1_XP_MIN = 90

export const CHALLENGES: ChallengeDef[] = [
  { id: "create-agent", title: "Create Agent", description: "Create your first agent", tier: 1, xpReward: 20, trigger: "event", eventType: "agent_created" },
  { id: "add-skill", title: "Add Skill", description: "Add a skill to your agent", tier: 1, xpReward: 30, trigger: "event", eventType: "skill_added" },
  { id: "deploy-workshop", title: "Deploy to Workshop", description: "Drag your agent into the scene", tier: 1, xpReward: 40, trigger: "event", eventType: "agent_deployed" },
  { id: "field-two-agents", title: "Field Two Agents", description: "Deploy 2 unique agents", tier: 2, xpReward: 60, trigger: "counter", counterCheck: (c) => c.deployedAgentIds.length >= 2, unlocks: ["filesystem"] },
  { id: "write-two-files", title: "Write Two Files", description: "Write 2 files using agent tools", tier: 2, xpReward: 100, trigger: "counter", counterCheck: (c) => c.writeFileCount >= 2, unlocks: ["bash"] },
]

function defaultState(): ProgressionState {
  return { tier: 1, xp: 0, completedChallenges: [], counters: { deployedAgentIds: [], writeFileCount: 0 }, unlocks: { filesystem: false, bash: false } }
}

export function getProgressionState(): ProgressionState {
  if (typeof sessionStorage === "undefined") return defaultState()
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultState()
  } catch {
    return defaultState()
  }
}

export function resetProgression(): void {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.removeItem(STORAGE_KEY)
}

function saveState(state: ProgressionState): void {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function tierFromXp(xp: number): Tier {
  if (xp >= TIER_1_XP_MIN) return 2
  return 1
}

function checkTier2Promotion(state: ProgressionState): boolean {
  const t1Challenges = CHALLENGES.filter((c) => c.tier === 1)
  return t1Challenges.every((c) => state.completedChallenges.includes(c.id))
}

function checkUnlocks(state: ProgressionState): Unlocks {
  let filesystem = state.unlocks.filesystem
  let bash = state.unlocks.bash
  for (const id of state.completedChallenges) {
    const c = CHALLENGES.find((ch) => ch.id === id)
    if (c?.unlocks?.includes("filesystem")) filesystem = true
    if (c?.unlocks?.includes("bash")) bash = true
  }
  return { filesystem, bash }
}

export function dispatchProgressionEvent(event: ProgressionEvent): ProgressionDelta {
  const state = getProgressionState()
  const delta: ProgressionDelta = { newChallenges: [], xpGained: 0, newUnlocks: [], tierChanged: false, newTier: state.tier }

  // update counters
  if (event.type === "agent_deployed" && event.agentId) {
    if (!state.counters.deployedAgentIds.includes(event.agentId)) {
      state.counters.deployedAgentIds.push(event.agentId)
    }
  }
  if (event.type === "tool_write_file") {
    state.counters.writeFileCount += 1
  }

  // re-check all challenges
  for (const challenge of CHALLENGES) {
    if (state.completedChallenges.includes(challenge.id)) continue
    if (challenge.tier > state.tier) continue

    let complete = false
    if (challenge.trigger === "event" && challenge.eventType === event.type) {
      complete = true
    }
    if (challenge.trigger === "counter" && challenge.counterCheck?.(state.counters)) {
      complete = true
    }

    if (complete) {
      state.completedChallenges.push(challenge.id)
      state.xp += challenge.xpReward
      delta.newChallenges.push(challenge.id)
      delta.xpGained += challenge.xpReward

      if (challenge.unlocks) {
        delta.newUnlocks.push(...challenge.unlocks)
      }
    }
  }

  // check tier progression
  const newUnlocks = checkUnlocks(state)
  state.unlocks = newUnlocks

  if (checkTier2Promotion(state) && state.tier === 1) {
    state.tier = 2
    delta.tierChanged = true
    delta.newTier = 2

    // re-check tier 2 challenges on promotion
    for (const challenge of CHALLENGES) {
      if (state.completedChallenges.includes(challenge.id)) continue
      if (challenge.tier !== 2) continue
      if (challenge.trigger === "counter" && challenge.counterCheck?.(state.counters)) {
        state.completedChallenges.push(challenge.id)
        state.xp += challenge.xpReward
        delta.newChallenges.push(challenge.id)
        delta.xpGained += challenge.xpReward
        if (challenge.unlocks) {
          delta.newUnlocks.push(...challenge.unlocks)
        }
      }
    }

    const finalUnlocks = checkUnlocks(state)
    state.unlocks = finalUnlocks
    if (finalUnlocks.bash && state.tier === 2) {
      state.tier = 3
      delta.newTier = 3
    }
  }

  // check tier 3 if bash unlocked
  if (state.unlocks.bash && state.tier === 2) {
    state.tier = 3
    delta.tierChanged = true
    delta.newTier = 3
  }

  saveState(state)

  // build toast
  const last = delta.newChallenges[delta.newChallenges.length - 1]
  if (last) {
    const c = CHALLENGES.find((ch) => ch.id === last)
    if (c) {
      const parts: string[] = [`${c.title} · +${c.xpReward} XP`]
      if (delta.newUnlocks.length > 0) parts.push(`${delta.newUnlocks.join(" + ")} unlocked`)
      if (delta.tierChanged) parts.push(`Tier ${delta.newTier}`)
      delta.toast = { title: c.title, subtitle: parts.join(" · ") }
    }
  } else if (delta.tierChanged) {
    delta.toast = { title: `Tier ${delta.newTier}`, subtitle: delta.newUnlocks.length > 0 ? `${delta.newUnlocks.join(" + ")} unlocked` : "" }
  }

  return delta
}
