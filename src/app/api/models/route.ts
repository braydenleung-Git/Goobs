import { NextResponse } from "next/server"
import { listModels } from "@/lib/llm/openai-compatible-client"

export const dynamic = "force-dynamic"

export async function GET() {
  const models = await listModels()
  return NextResponse.json(models, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  })
}
