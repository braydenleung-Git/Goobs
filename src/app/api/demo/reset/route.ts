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

    if (scope === "full") {
      await prisma.progressState.deleteMany()
      await prisma.workstationState.deleteMany()
      const agents = await prisma.agentProfile.findMany({ select: { id: true } })
      await prisma.agentProfile.deleteMany()
      await Promise.all(agents.map((a) => cleanWorkspace(a.id).catch(() => {})))
    } else if (scope === "workspaces") {
      const agents = await prisma.agentProfile.findMany({ select: { id: true } })
      await Promise.all(agents.map((a) => cleanWorkspace(a.id).catch(() => {})))
    }

    const message =
      scope === "full"
        ? "Full reset complete"
        : scope === "workspaces"
          ? "Transient state and workspaces cleared"
          : "Transient state cleared"

    return NextResponse.json({ status: "ok", message, scope })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Reset failed" },
      { status: 500 },
    )
  }
}
