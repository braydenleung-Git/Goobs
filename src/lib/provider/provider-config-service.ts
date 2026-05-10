import { prisma } from "@/lib/db/prisma"
import { encrypt, decrypt } from "@/lib/security/secret-vault"
import { z } from "zod"

export const ProviderConfigInputSchema = z.object({
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
})

export type ProviderConfigInput = z.infer<typeof ProviderConfigInputSchema>

export interface ProviderConfigView {
  baseUrl: string
  hasApiKey: boolean
  updatedAt: Date
}

function getDefaultBaseUrl(): string {
  return process.env.PROVIDER_BASE_URL || "http://homelab/bifrost/v1"
}

export async function getProviderConfig(): Promise<ProviderConfigView> {
  try {
    const row = await prisma.providerConfig.findFirst({ orderBy: { updatedAt: "desc" } })
    if (!row) {
      return { baseUrl: getDefaultBaseUrl(), hasApiKey: false, updatedAt: new Date() }
    }
    return {
      baseUrl: row.baseUrl || getDefaultBaseUrl(),
      hasApiKey: row.encryptedApiKey !== null,
      updatedAt: row.updatedAt,
    }
  } catch (error) {
    console.warn('Database not available, using default config:', error)
    return { baseUrl: getDefaultBaseUrl(), hasApiKey: false, updatedAt: new Date() }
  }
}

export async function saveProviderConfig(input: ProviderConfigInput): Promise<void> {
  try {
    const data: Record<string, unknown> = {}
    if (input.baseUrl !== undefined) data.baseUrl = input.baseUrl
    if (input.apiKey !== undefined && input.apiKey.length > 0) {
      const payload = encrypt(input.apiKey)
      data.encryptedApiKey = payload.encrypted
      data.keyIv = payload.iv
      data.keyTag = payload.tag
      data.keyVersion = payload.version
    }
    if (Object.keys(data).length === 0) return

    const existing = await prisma.providerConfig.findFirst({ orderBy: { updatedAt: "desc" } })
    if (existing) {
      await prisma.providerConfig.update({ where: { id: existing.id }, data })
    } else {
      await prisma.providerConfig.create({ data: data as any })
    }
  } catch (error) {
    console.warn('Database not available, cannot save config:', error)
    throw new Error('Database not available for saving configuration')
  }
}

export async function getProviderRuntimeConfig(): Promise<{
  baseUrl: string
  apiKey?: string
}> {
  try {
    const row = await prisma.providerConfig.findFirst({ orderBy: { updatedAt: "desc" } })
    const baseUrl = row?.baseUrl || getDefaultBaseUrl()
    let apiKey: string | undefined
    if (row?.encryptedApiKey && row.keyIv && row.keyTag) {
      apiKey = decrypt({
        encrypted: row.encryptedApiKey,
        iv: row.keyIv,
        tag: row.keyTag,
        version: row.keyVersion ?? 1,
      })
    }
    return { baseUrl, apiKey }
  } catch (error) {
    console.warn('Database not available, using default runtime config:', error)
    return { baseUrl: getDefaultBaseUrl() }
  }
}
