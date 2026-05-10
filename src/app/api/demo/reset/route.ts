import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST() {
  try {
    await prisma.challengeRun.deleteMany()
    await prisma.challengeRewardEvent.deleteMany()
    return NextResponse.json({ status: "ok", message: "Transient state cleared" })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Reset failed" },
      { status: 500 },
    )
  }
}
