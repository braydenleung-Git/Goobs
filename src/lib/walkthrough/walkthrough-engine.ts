export type WalkthroughEventType = "agent_created" | "skill_added" | "agent_spawned" | "chat_sent"

export interface WalkthroughStep {
  id: string
  title: string
  description: string
  xpReward: number
  trigger: WalkthroughEventType
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  { id: "create-agent", title: "Become a Creator", description: "Create your first agent", xpReward: 20, trigger: "agent_created" },
  { id: "add-skill", title: "Skill Builder", description: "Add a skill to your agent", xpReward: 30, trigger: "skill_added" },
  { id: "deploy-workshop", title: "Into the Wild", description: "Drag your agent into the workshop", xpReward: 40, trigger: "agent_spawned" },
  { id: "first-chat", title: "First Contact", description: "Send a message to your agent", xpReward: 50, trigger: "chat_sent" },
]

interface WalkthroughState {
  started: boolean
  completed: string[]
}

const STORAGE_KEY = "goobs-walkthrough"

export function getWalkthroughState(): WalkthroughState {
  if (typeof window === "undefined") return { started: false, completed: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { started: false, completed: [] }
  } catch {
    return { started: false, completed: [] }
  }
}

export function setWalkthroughStarted(): void {
  if (typeof window === "undefined") return
  const state = getWalkthroughState()
  state.started = true
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function isStepCompleted(stepId: string): boolean {
  return getWalkthroughState().completed.includes(stepId)
}

export function completeStep(stepId: string): WalkthroughStep | undefined {
  const state = getWalkthroughState()
  if (!state.completed.includes(stepId)) {
    state.completed.push(stepId)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  return WALKTHROUGH_STEPS.find((s) => s.id === stepId)
}

export function getAllCompleted(): string[] {
  return getWalkthroughState().completed
}

function calculateLevel(xp: number): number {
  if (xp >= 5000) return 10
  if (xp >= 3500) return 9
  if (xp >= 2500) return 8
  if (xp >= 1800) return 7
  if (xp >= 1200) return 6
  if (xp >= 750) return 5
  if (xp >= 400) return 4
  if (xp >= 150) return 3
  if (xp >= 50) return 2
  return 1
}

export function processWalkthroughReward(stepId: string): { xpReward: number; level: number } {
  const step = completeStep(stepId)
  if (!step) return { xpReward: 0, level: 1 }

  const raw = localStorage.getItem("goobs-progress")
  const p = raw ? JSON.parse(raw) : { xp: 0, level: 1, unlockedWorkstations: [] }
  p.xp += step.xpReward
  p.level = calculateLevel(p.xp)

  if (p.xp >= 0 && !p.unlockedWorkstations.includes("computer")) p.unlockedWorkstations.push("computer")
  if (p.xp >= 100 && !p.unlockedWorkstations.includes("whiteboard")) p.unlockedWorkstations.push("whiteboard")
  if (p.xp >= 300 && !p.unlockedWorkstations.includes("drawing-tablet")) p.unlockedWorkstations.push("drawing-tablet")
  if (p.xp >= 600 && !p.unlockedWorkstations.includes("book")) p.unlockedWorkstations.push("book")

  localStorage.setItem("goobs-progress", JSON.stringify(p))

  const runs = JSON.parse(localStorage.getItem("goobs-runs") || "[]")
  runs.push({
    id: crypto.randomUUID(),
    challengeSlug: step.id,
    finalPass: true,
    totalScore: 100,
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem("goobs-runs", JSON.stringify(runs))

  return { xpReward: step.xpReward, level: p.level }
}
