import { NextResponse } from "next/server"
import { listModels } from "@/lib/llm/openai-compatible-client"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const models = await listModels()
    return NextResponse.json(models, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch {
    return NextResponse.json(
      [{ id: "OpenCode/deepseek-v4-flash", name: "DeepSeek V4 Flash (fallback)", capabilities: ["text"] }],
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    )
  }
}
