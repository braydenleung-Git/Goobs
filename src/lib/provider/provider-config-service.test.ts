import { ProviderConfigInputSchema } from "./provider-config-service"

describe("ProviderConfigInputSchema", () => {
  it("accepts valid input", () => {
    const result = ProviderConfigInputSchema.safeParse({
      baseUrl: "http://localhost:8080",
      apiKey: "sk-test",
    })
    expect(result.success).toBe(true)
  })

  it("accepts empty apiKey", () => {
    const result = ProviderConfigInputSchema.safeParse({
      baseUrl: "http://homelab/bifrost/v1",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid URL", () => {
    const result = ProviderConfigInputSchema.safeParse({ baseUrl: "not-a-url" })
    expect(result.success).toBe(false)
  })
})
