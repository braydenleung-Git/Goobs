import crypto from "node:crypto"
import { prisma } from "@/lib/db/prisma"

export interface RewardInput {
  runId: string
  challengeSlug: string
  xpAwarded: number
}

export interface ProgressSnapshot {
  totalXp: number
  level: number
  unlockedWorkstationsJson: string
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

function computeUnlocks(xp: number, level: number): string[] {
  const unlocked: string[] = []
  if (xp >= 0) unlocked.push("computer")
  if (xp >= 100) unlocked.push("whiteboard")
  if (xp >= 300) unlocked.push("drawing-tablet")
  if (xp >= 600) unlocked.push("book")
  return unlocked
}

export async function applyChallengeReward(
  input: RewardInput,
): Promise<ProgressSnapshot> {
  const existing = await prisma.challengeRewardEvent.findUnique({
    where: { runId: input.runId },
  })
  if (existing) {
    const state = await prisma.progressState.findFirst()
    return {
      totalXp: state?.totalXp ?? 0,
      level: state?.level ?? 1,
      unlockedWorkstationsJson: state?.unlockedWorkstationsJson ?? "[]",
    }
  }

  await prisma.challengeRewardEvent.create({
    data: {
      id: crypto.randomUUID(),
      runId: input.runId,
      challengeSlug: input.challengeSlug,
      xpAwarded: input.xpAwarded,
    },
  })

  const progress =
    (await prisma.progressState.findFirst()) ??
    (await prisma.progressState.create({ data: { id: crypto.randomUUID() } }))

  const newXp = progress.totalXp + input.xpAwarded
  const newLevel = calculateLevel(newXp)
  const unlockedWorkstations = computeUnlocks(newXp, newLevel)

  await prisma.progressState.update({
    where: { id: progress.id },
    data: {
      totalXp: newXp,
      level: newLevel,
      unlockedWorkstationsJson: JSON.stringify(unlockedWorkstations),
    },
  })

  return {
    totalXp: newXp,
    level: newLevel,
    unlockedWorkstationsJson: JSON.stringify(unlockedWorkstations),
  }
}

export async function getProgress(): Promise<ProgressSnapshot> {
  const state =
    (await prisma.progressState.findFirst()) ??
    (await prisma.progressState.create({ data: {} }))
  return {
    totalXp: state.totalXp,
    level: state.level,
    unlockedWorkstationsJson: state.unlockedWorkstationsJson,
  }
}
