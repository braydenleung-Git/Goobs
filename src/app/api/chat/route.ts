import { NextRequest, NextResponse } from "next/server"
import { runChatCompletion } from "@/lib/llm/openai-compatible-client"
import { prisma } from "@/lib/db/prisma"

export async function POST(request: NextRequest) {
  try {
    const { agentId, messages } = await request.json()
    if (!agentId || !messages) {
      return NextResponse.json({ error: "agentId and messages required" }, { status: 400 })
    }

    const agent = await prisma.agentProfile.findUnique({ where: { id: agentId } })
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    let systemPrompt = agent.systemPrompt

    let skills: string[] = []
    try { skills = JSON.parse(agent.skillsJson || "[]") } catch {}
    if (skills.length > 0) {
      const skillNames = skills.map((s) => {
        const firstLine = s.trim().split("\n")[0] || ""
        return firstLine.replace(/^#\s*/, "").replace(/^["']|["']$/g, "") || "Untitled Skill"
      })
      systemPrompt += `\n\nAvailable skills: ${skillNames.join(", ")}. Use these skills only when relevant.`
    }

    const result = await runChatCompletion({
      model: agent.defaultModel,
      systemPrompt,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    })

    return NextResponse.json({ content: result.content, finishReason: result.finishReason })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Chat failed" }, { status: 500 })
  }
}
