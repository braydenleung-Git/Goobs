import { getProviderRuntimeConfig } from "@/lib/provider/provider-config-service"
import type { ToolDefinition, ToolCall } from "@/lib/runtime/tools/types"

export interface ModelInfo {
  id: string
  name: string
  capabilities: string[]
}

export type ChatMessage =
  | { role: "user" | "assistant"; content: string }
  | { role: "tool"; tool_call_id: string; content: string }
  | { role: "assistant"; content?: string; tool_calls?: ToolCall[] }

export interface ChatRunInput {
  model: string
  systemPrompt: string
  messages: ChatMessage[]
  maxTokens?: number
  tools?: ToolDefinition[]
}

export interface ChatRunOutput {
  content: string
  model: string
  finishReason: string
  toolCalls?: ToolCall[]
}

const FALLBACK_MODELS: ModelInfo[] = [
  { id: "OpenCode/deepseek-v4-flash", name: "DeepSeek V4 Flash (via bifrost)", capabilities: ["text"] },
  { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash", capabilities: ["text"] },
  { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", capabilities: ["text"] },
  { id: "gpt-4o", name: "GPT-4o", capabilities: ["text"] },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", capabilities: ["text"] },
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", capabilities: ["text"] },
]

async function fetchWithBase(path: string, init?: RequestInit): Promise<Response> {
  const { baseUrl, apiKey } = await getProviderRuntimeConfig()
  const url = `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`
  return fetch(url, { ...init, headers, signal: AbortSignal.timeout(30000) })
}

export async function listModels(): Promise<ModelInfo[]> {
  try {
    const res = await fetchWithBase("models", { cache: "no-store" })
    if (!res.ok) throw new Error(`Model fetch returned ${res.status}`)
    const body = await res.json()
    const models: ModelInfo[] = (body.data || body || []).map((m: any) => ({
      id: m.id || m.name || "unknown",
      name: m.name || m.id || "unknown",
      capabilities: [],
    }))
    if (models.length === 0) throw new Error("Empty model list")
    const ids = new Set(models.map((m) => m.id))
    for (const fb of FALLBACK_MODELS) {
      if (!ids.has(fb.id)) models.push(fb)
    }
    return models
  } catch {
    return FALLBACK_MODELS
  }
}

export async function runChatCompletion(input: ChatRunInput): Promise<ChatRunOutput> {
  const messages: Array<Record<string, unknown>> = [
    { role: "system", content: input.systemPrompt },
    ...input.messages.map((m): Record<string, unknown> => {
      if (m.role === "tool") {
        return { role: "tool", tool_call_id: m.tool_call_id, content: m.content }
      }
      if (m.role === "assistant" && "tool_calls" in m && m.tool_calls) {
        return { role: "assistant", content: m.content ?? null, tool_calls: m.tool_calls }
      }
      return { role: m.role, content: m.content }
    }),
  ]

  const requestBody: Record<string, unknown> = {
    model: input.model,
    messages,
    max_tokens: input.maxTokens ?? 2048,
    ...(input.tools ? { tools: input.tools, tool_choice: "auto" } : {}),
  }

  if (/deepseek/i.test(input.model)) {
    requestBody.thinking = { type: "disabled" }
  }

  const res = await fetchWithBase("chat/completions", {
    method: "POST",
    body: JSON.stringify(requestBody),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Chat completion failed (${res.status}): ${text}`)
  }

  const body = await res.json()
  const choice = body.choices?.[0]
  const toolCalls: ToolCall[] | undefined = choice?.message?.tool_calls?.map(
    (tc: { id: string; function: { name: string; arguments: string } }) => ({
      id: tc.id,
      type: "function" as const,
      function: { name: tc.function.name, arguments: tc.function.arguments },
    }),
  )
  return {
    content: choice?.message?.content ?? "",
    model: body.model ?? input.model,
    finishReason: choice?.finish_reason ?? "stop",
    ...(toolCalls ? { toolCalls } : {}),
  }
}
