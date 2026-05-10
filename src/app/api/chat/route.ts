import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getProviderRuntimeConfig } from "@/lib/provider/provider-config-service"
import { ToolRegistry } from "@/lib/runtime/tool-registry"
import { createFilesystemTools } from "@/lib/runtime/tools/filesystem"
import { createBashTool } from "@/lib/runtime/tools/bash"
import { runChatCompletion } from "@/lib/llm/openai-compatible-client"

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
    const skillBlocks = skills.map((s, i) => {
      const trimmed = s.trim()
      const firstLine = trimmed.split("\n")[0] || ""
      const title = firstLine.replace(/^#\s*/, "").replace(/^["']|["']$/g, "") || `Skill ${i + 1}`
      return `### ${title}\n\n${trimmed}`
    })
    systemPrompt += `\n\nYou have the following skills:\n\n${skillBlocks.join("\n\n")}`
  }

  // check tool profile
  let toolProfile = "none"
  try {
    const parsed = JSON.parse(agent.toolsJson || "{}")
    toolProfile = parsed.profile || "none"
  } catch {}

  if (toolProfile === "none") {
    systemPrompt += `\n\nYou do not have access to any function calls or tools. Only respond with text directly.`
  }

  // run chat
  const { baseUrl, apiKey } = await getProviderRuntimeConfig()
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`

  if (toolProfile !== "none") {
    // ---- tool-enabled chat (non-streaming, multi-turn) ----
    const registry = new ToolRegistry()
    registry.register(createFilesystemTools(agentId, `chat-${agentId}`))
    registry.register(createBashTool(agentId))
    const toolDefinitions = registry.getDefinitions()

    const chatMessages: Array<any> = [...messages]
    let finalContent = ""
    let turnCount = 0
    const MAX_TURNS = 5

    while (turnCount < MAX_TURNS) {
      const result = await runChatCompletion({
        model: agent.defaultModel,
        systemPrompt,
        messages: chatMessages as any,
        tools: toolDefinitions,
      })

      turnCount++

      if (result.toolCalls && result.toolCalls.length > 0) {
        chatMessages.push({
          role: "assistant",
          content: result.content || null,
          tool_calls: result.toolCalls,
        })

        for (const tc of result.toolCalls) {
          let args: Record<string, unknown> = {}
          try { args = JSON.parse(tc.function.arguments) } catch {}

          const execResult = await registry.execute(tc.function.name, args)

          chatMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: execResult.output,
          })
        }
      } else {
        finalContent = result.content
        break
      }
    }

    if (!finalContent) {
      const last = [...chatMessages].reverse().find(
        (m) => m.role === "assistant" && m.content && typeof m.content === "string"
      )
      finalContent = last?.content ?? "(no response)"
    }

    return new Response(JSON.stringify({ content: finalContent }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  // ---- no-tools chat (streaming) ----
  const requestBody: Record<string, unknown> = {
    model: agent.defaultModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
  }
  if (/deepseek/i.test(agent.defaultModel)) {
    requestBody.thinking = { type: "disabled" }
  }

  try {
    const provider = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000),
    })

    if (!provider.ok) {
      const text = await provider.text()
      return new Response(JSON.stringify({ error: text }), { status: 502 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = provider.body?.getReader()
        if (!reader) { controller.close(); return }
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
                controller.close(); return
              }
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
          }
        } catch (e) {
          controller.enqueue(new TextEncoder().encode(`data: {"error": "${String(e)}"}\n\n`))
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
