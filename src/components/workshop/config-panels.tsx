"use client"

import { useState, useEffect, type FormEvent } from "react"

interface ProviderConfig {
  baseUrl: string
  hasApiKey: boolean
  updatedAt: string
}

export function ConfigPanels() {
  const [config, setConfig] = useState<ProviderConfig | null>(null)
  const [baseUrl, setBaseUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/provider")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d)
        setBaseUrl(d.baseUrl)
      })
  }, [])

  const saveProvider = async (e: FormEvent) => {
    e.preventDefault()
    const body: Record<string, string> = { baseUrl }
    if (apiKey) body.apiKey = apiKey
    const res = await fetch("/api/provider", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setMessage("Provider config saved")
      setConfig(await res.json())
    } else {
      setMessage("Failed to save provider config")
    }
    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <form onSubmit={saveProvider} className="space-y-4">
      {message && (
        <div className="animate-fade-in rounded-xl bg-green/10 px-4 py-2 font-body text-sm text-green">
          {message}
        </div>
      )}

      <div>
        <label className="mb-1.5 block font-display text-sm font-bold text-text">Base URL</label>
        <input
          className="input-glass"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://api.openai.com/v1"
        />
      </div>

      <div>
        <label className="mb-1.5 block font-display text-sm font-bold text-text">
          API Key {config?.hasApiKey ? <span className="font-body text-xs text-green">(stored)</span> : <span className="font-body text-xs text-subtext/50">(optional)</span>}
        </label>
        <input
          className="input-glass"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Leave empty to keep existing"
        />
      </div>

      {config && (
        <p className="font-body text-xs text-subtext/60">
          Endpoint: <span className="font-mono text-subtext">{config.baseUrl}</span>
        </p>
      )}

      <button type="submit" className="btn-primary">
        Save Provider
      </button>
    </form>
  )
}
