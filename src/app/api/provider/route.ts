import { NextRequest, NextResponse } from "next/server"
import { getProviderConfig, saveProviderConfig, ProviderConfigInputSchema } from "@/lib/provider/provider-config-service"

export async function GET() {
  const config = await getProviderConfig()
  return NextResponse.json(config)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const parsed = ProviderConfigInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await saveProviderConfig(parsed.data)
  const config = await getProviderConfig()
  return NextResponse.json(config)
}
