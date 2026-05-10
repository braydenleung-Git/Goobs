import { NextResponse } from "next/server"
import { listModels } from "@/lib/llm/openai-compatible-client"

export async function GET() {
  try {
    const models = await listModels()
    return NextResponse.json(models)
  } catch {
    return NextResponse.json([
      { id: "OpenCode/deepseek-v4-flash", name: "DeepSeek V4 Flash (fallback)", capabilities: ["text"] },
    ])
  }
}
