import { NextRequest } from "next/server"
import { runChatCompletion } from "@/lib/llm/openai-compatible-client"

const CLASSIFY_PROMPT = `You classify user messages into workstation types for a 3D agent workshop.

Workstations:
- computer: coding, file operations, debugging, tool usage, shell commands, API work
- whiteboard: planning, brainstorming, strategy, thinking through problems, design
- book: writing, documentation, composition, storytelling, copy
- drawing-tablet: image generation, visual design, drawing (future use)

Reply with ONLY the workstation ID (one word). Default to "whiteboard" for general chat.`

export async function POST(request: NextRequest) {
  let message: string

  try {
    const body = await request.json()
    message = body.message
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), { status: 400 })
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 })
  }

  try {
    const result = await runChatCompletion({
      model: "OpenCode/deepseek-v4-flash",
      messages: [{ role: "user", content: message.slice(0, 1000) }],
      systemPrompt: CLASSIFY_PROMPT,
    })

    const workstationId = result.content.trim().toLowerCase()
    if (!["computer", "whiteboard", "book", "drawing-tablet"].includes(workstationId)) {
      return Response.json({ workstationId: "whiteboard" })
    }
    return Response.json({ workstationId })
  } catch {
    return Response.json({ workstationId: "whiteboard" })
  }
}
