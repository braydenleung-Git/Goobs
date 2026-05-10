/**
 * @jest-environment node
 */

import { seedPrebuiltAgents } from "@/lib/agents/prebuilt-seed"
import { prisma } from "@/lib/db/prisma"

describe("prebuilt-seed", () => {
  beforeAll(async () => {
    await prisma.agentProfile.deleteMany({ where: { isPrebuilt: true } })
  })

  it("seeds demo agents", async () => {
    const count = await seedPrebuiltAgents()
    expect(count).toBe(2)
  })

  it("is idempotent", async () => {
    const first = await seedPrebuiltAgents()
    const second = await seedPrebuiltAgents()
    expect(first).toBeGreaterThan(0)
    expect(second).toBe(first)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })
})
