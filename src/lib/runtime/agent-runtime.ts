import { runChatCompletion } from "@/lib/llm/openai-compatible-client"
import { ToolRegistry } from "./tool-registry"
import { ensureWorkspace, getRunPath, getRunArtifacts } from "./workspace"
import type { ToolResult } from "./tools/types"

export interface AgentRunInput {
  model: string
  systemPrompt: string
  userPrompt: string
  agentId: string
  runId: string
  registry: ToolRegistry
  maxTurns?: number
  useTools?: boolean
}

export interface AgentRunResult {
  finalContent: string
  toolCallLog: ToolResult[]
  artifacts: Array<{ path: string; size: number }>
  turnsUsed: number
  fallbackUsed: boolean
}

export async function runAgent(input: AgentRunInput): Promise<AgentRunResult> {
  const maxTurns = input.maxTurns ?? 5
  const toolCallLog: ToolResult[] = []
  let fallbackUsed = false
  let toolsUsed = false

  await ensureWorkspace(input.agentId)

  const tools = input.useTools !== false ? input.registry.getDefinitions() : undefined
  const messages: Array<any> = [{ role: "user", content: input.userPrompt }]
  let finishReason = ""

  for (let turn = 0; turn < maxTurns; turn++) {
    const response = await runChatCompletion({
      model: input.model,
      systemPrompt: input.systemPrompt,
      messages: messages as any,
      tools: tools && tools.length > 0 ? tools : undefined,
    })

    finishReason = response.finishReason

    if (response.toolCalls && response.toolCalls.length > 0) {
      messages.push({
        role: "assistant",
        content: response.content || null,
        tool_calls: response.toolCalls,
      })

      for (const tc of response.toolCalls) {
        let args: Record<string, unknown> = {}
        try {
          args = JSON.parse(tc.function.arguments)
        } catch {
          args = {}
        }

        toolsUsed = true
        const result = await input.registry.execute(tc.function.name, args)
        const loggedResult: ToolResult = {
          ...result,
          callId: tc.id,
          name: tc.function.name,
        }
        toolCallLog.push(loggedResult)

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result.output,
        })
      }
    } else {
      if (tools && tools.length > 0 && !toolsUsed) {
        fallbackUsed = true
      }

      return {
        finalContent: response.content,
        toolCallLog,
        artifacts: await getRunArtifacts(input.agentId, input.runId),
        turnsUsed: turn + 1,
        fallbackUsed,
      }
    }
  }

  const lastAssistantMsg = [...messages].reverse().find(
    (m) => m.role === "assistant" && m.content && typeof m.content === "string"
  )
  return {
    finalContent: lastAssistantMsg?.content ?? "",
    toolCallLog,
    artifacts: await getRunArtifacts(input.agentId, input.runId),
    turnsUsed: maxTurns,
    fallbackUsed,
  }
}
