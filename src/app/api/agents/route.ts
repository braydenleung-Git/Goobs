import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"

const AgentInputSchema = z.object({
  name: z.string().min(1).max(100),
  systemPrompt: z.string().min(1).max(10000),
  skillsJson: z.string().optional().default("[]"),
  toolsJson: z.string().optional().default("[]"),
  defaultModel: z.string().min(1),
  modelColorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#4f46e5"),
  prefersImageTasks: z.boolean().optional().default(false),
})

const AgentUpdateSchema = AgentInputSchema.partial()

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (id) {
    const agent = await prisma.agentProfile.findUnique({ where: { id } })
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    return NextResponse.json(agent)
  }
  const agents = await prisma.agentProfile.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(agents)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = AgentInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  try {
    const agent = await prisma.agentProfile.create({
      data: { id: crypto.randomUUID(), ...parsed.data },
    })
    return NextResponse.json(agent, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Create failed" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id query param required" }, { status: 400 })

  const body = await request.json()
  const parsed = AgentUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const agent = await prisma.agentProfile.update({ where: { id }, data: parsed.data })
  return NextResponse.json(agent)
}
