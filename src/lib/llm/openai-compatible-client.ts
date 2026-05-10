import { getProviderRuntimeConfig } from "@/lib/provider/provider-config-service"

export interface ModelInfo {
  id: string
  name: string
  capabilities: string[]
}

export interface ChatRunInput {
  model: string
  systemPrompt: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
  maxTokens?: number
}

export interface ChatRunOutput {
  content: string
  model: string
  finishReason: string
}

const FALLBACK_MODEL = "OpenCode/deepseek-v4-flash"

async function fetchWithBase(path: string, init?: RequestInit): Promise<Response> {
  const { baseUrl, apiKey } = await getProviderRuntimeConfig()
  const url = `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`
  return fetch(url, { ...init, headers, signal: AbortSignal.timeout(30000) })
}

export async function listModels(): Promise<ModelInfo[]> {
  try {
    const res = await fetchWithBase("models")
    if (!res.ok) throw new Error(`Model fetch returned ${res.status}`)
    const body = await res.json()
    const models: ModelInfo[] = (body.data || body || []).map((m: any) => ({
      id: m.id || m.name || "unknown",
      name: m.name || m.id || "unknown",
      capabilities: [],
    }))
    if (models.length === 0) throw new Error("Empty model list")
    return models
  } catch {
    return [
      { id: FALLBACK_MODEL, name: "DeepSeek V4 Flash (fallback)", capabilities: ["text"] },
    ]
  }
}

export async function runChatCompletion(input: ChatRunInput): Promise<ChatRunOutput> {
  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: input.systemPrompt },
    ...input.messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  const res = await fetchWithBase("chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: input.model,
      messages,
      max_tokens: input.maxTokens ?? 2048,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Chat completion failed (${res.status}): ${text}`)
  }

  const body = await res.json()
  const choice = body.choices?.[0]
  return {
    content: choice?.message?.content ?? "",
    model: body.model ?? input.model,
    finishReason: choice?.finish_reason ?? "stop",
  }
}
