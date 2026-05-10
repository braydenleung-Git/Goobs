/**
 * @jest-environment node
 */

import { applyChallengeReward } from "./progression-service"
import { prisma } from "@/lib/db/prisma"

jest.setTimeout(30000)

describe("progression-service", () => {
  beforeAll(async () => {
    await prisma.challengeRewardEvent.deleteMany()
    await prisma.progressState.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it("rewards XP and sets level 1 initially", async () => {
    const result = await applyChallengeReward({
      runId: "test-run-1",
      challengeSlug: "change-prompt",
      xpAwarded: 40,
    })
    expect(result.totalXp).toBe(40)
    expect(result.level).toBe(1)
  })

  it("prevents duplicate rewards for same run", async () => {
    const first = await applyChallengeReward({
      runId: "test-run-dup",
      challengeSlug: "code-writer",
      xpAwarded: 100,
    })
    const second = await applyChallengeReward({
      runId: "test-run-dup",
      challengeSlug: "code-writer",
      xpAwarded: 100,
    })
    expect(second.totalXp).toBe(first.totalXp)
  })

  it("levels up at threshold", async () => {
    const result = await applyChallengeReward({
      runId: "test-run-level",
      challengeSlug: "multi-tool",
      xpAwarded: 200,
    })
    expect(result.level).toBe(3)
  })
})
