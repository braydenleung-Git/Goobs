import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getProviderRuntimeConfig } from "@/lib/provider/provider-config-service"

export async function POST(request: NextRequest) {
  let agentId: string, messages: Array<{ role: string; content: string }>

  try {
    const body = await request.json()
    agentId = body.agentId
    messages = body.messages
    if (!agentId || !messages) {
      return new Response(JSON.stringify({ error: "agentId and messages required" }), { status: 400 })
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 })
  }

  const agent = await prisma.agentProfile.findUnique({ where: { id: agentId } })
  if (!agent) {
    return new Response(JSON.stringify({ error: "Agent not found" }), { status: 404 })
  }

  let systemPrompt = agent.systemPrompt
  let skills: string[] = []
  try { skills = JSON.parse(agent.skillsJson || "[]") } catch {}
  if (skills.length > 0) {
    const names = skills.map((s) => {
      const trimmed = s.trim()
      if (trimmed.startsWith("---")) {
        const end = trimmed.indexOf("---", 3)
        if (end !== -1) {
          const m = trimmed.slice(3, end).match(/^name:\s*(.+)$/m)
          if (m) return m[1].trim()
        }
      }
      return trimmed.split("\n")[0].replace(/^#\s*/, "") || "Untitled Skill"
    })
    systemPrompt += `\n\nAvailable skills: ${names.join(", ")}. Use these skills only when relevant.`
  }

  const { baseUrl, apiKey } = await getProviderRuntimeConfig()
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`

  const body: Record<string, unknown> = {
    model: agent.defaultModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
  }
  if (/deepseek/i.test(agent.defaultModel)) {
    body.thinking = { type: "disabled" }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`

  try {
    const provider = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    })

    if (!provider.ok) {
      const text = await provider.text()
      return new Response(JSON.stringify({ error: text }), { status: 502 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = provider.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }
        const decoder = new TextDecoder()
        let buffer = ""
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith("data: ")) continue
              const data = trimmed.slice(6)
              if (data === "[DONE]") {
                controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"))
                controller.close()
                return
              }
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
          }
        } catch (e) {
          controller.enqueue(
            new TextEncoder().encode(`data: {"error": "${String(e)}"}\n\n`),
          )
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Chat failed" }), { status: 500 })
  }
}
