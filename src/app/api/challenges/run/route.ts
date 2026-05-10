import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { runChallenge } from "@/lib/runs/challenge-runner"
import { listChallenges } from "@/lib/challenges/catalog"

const RunInputSchema = z.object({
  challengeSlug: z.enum(["change-prompt", "code-writer", "multi-tool"]),
  agentId: z.string().uuid(),
  model: z.string().min(1),
})

export async function GET() {
  const challenges = listChallenges().map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    xpReward: c.xpReward,
    workstationTarget: c.workstationTarget,
  }))
  return NextResponse.json(challenges)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = RunInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const result = await runChallenge(parsed.data)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Run failed" },
      { status: 500 },
    )
  }
}
