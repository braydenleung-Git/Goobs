import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { cleanWorkspace } from "@/lib/runtime/workspace"

export async function POST(request: NextRequest) {
  try {
    let scope = "transient"
    try {
      const body = await request.json()
      scope = body.scope || "transient"
    } catch {}

    await prisma.challengeRun.deleteMany()
    await prisma.challengeRewardEvent.deleteMany()

    if (scope === "workspaces" || scope === "full") {
      const agents = await prisma.agentProfile.findMany({ select: { id: true } })
      await Promise.all(agents.map((a) => cleanWorkspace(a.id).catch(() => {})))
    }

    const message =
      scope === "transient"
        ? "Transient state cleared"
        : "Transient state and workspaces cleared"

    return NextResponse.json({ status: "ok", message, scope })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Reset failed" },
      { status: 500 },
    )
  }
}
