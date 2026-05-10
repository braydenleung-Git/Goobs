import crypto from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getMasterKey(): Buffer {
  const raw = process.env.MASTER_KEY
  if (!raw) throw new Error("MASTER_KEY environment variable is required")
  const key = Buffer.from(raw, "hex")
  if (key.length === 32) return key
  const short = Buffer.from(raw, "utf8")
  if (short.length < 32) throw new Error("MASTER_KEY must be at least 32 bytes")
  return short.subarray(0, 32)
}

export interface EncryptedPayload {
  encrypted: string
  iv: string
  tag: string
  version: number
}

export function encrypt(plaintext: string): EncryptedPayload {
  const key = getMasterKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")
  const tag = cipher.getAuthTag().toString("hex")
  return { encrypted, iv: iv.toString("hex"), tag, version: 1 }
}

export function decrypt(payload: EncryptedPayload): string {
  const key = getMasterKey()
  const iv = Buffer.from(payload.iv, "hex")
  const tag = Buffer.from(payload.tag, "hex")
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  let plain = decipher.update(payload.encrypted, "hex", "utf8")
  plain += decipher.final("utf8")
  return plain
}
