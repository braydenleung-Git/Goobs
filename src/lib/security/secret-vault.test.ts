import { encrypt, decrypt } from "./secret-vault"

beforeAll(() => {
  process.env.MASTER_KEY = "00000000000000000000000000000000"
})

describe("Secret Vault", () => {
  it("roundtrips a plaintext value", () => {
    const payload = encrypt("my-api-key-123")
    const result = decrypt(payload)
    expect(result).toBe("my-api-key-123")
  })

  it("produces unique ciphertexts for the same input", () => {
    const a = encrypt("hello")
    const b = encrypt("hello")
    expect(a.encrypted).not.toBe(b.encrypted)
  })

  it("uses version field", () => {
    const payload = encrypt("test")
    expect(payload.version).toBe(1)
  })
})
