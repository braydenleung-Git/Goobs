"use client"

import { useState, useEffect, type FormEvent } from "react"

interface ProviderConfig {
  baseUrl: string
  hasApiKey: boolean
  updatedAt: string
}

interface ModelOption {
  id: string
  name: string
  capabilities: string[]
}

export function ConfigPanels() {
  const [config, setConfig] = useState<ProviderConfig | null>(null)
  const [models, setModels] = useState<ModelOption[]>([])
  const [baseUrl, setBaseUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [agentName, setAgentName] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [skills, setSkills] = useState("")
  const [tools, setTools] = useState("")
  const [defaultModel, setDefaultModel] = useState("")
  const [modelColor, setModelColor] = useState("#4f46e5")
  const [prefersImage, setPrefersImage] = useState(false)
  const [tab, setTab] = useState<"provider" | "agent">("provider")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/provider")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d)
        setBaseUrl(d.baseUrl)
      })
    fetch("/api/challenges/run")
      .then((r) => r.json())
      .then((d) => setModels([]))
    fetch("/api/agents")
      .then((r) => r.json())
      .then((list) => {
        if (list.length > 0) {
          const a = list[0]
          setAgentName(a.name)
          setSystemPrompt(a.systemPrompt)
          setSkills(a.skillsJson)
          setTools(a.toolsJson)
          setDefaultModel(a.defaultModel)
          setModelColor(a.modelColorHex)
          setPrefersImage(a.prefersImageTasks)
        }
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
  }

  const saveAgent = async (e: FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: agentName,
        systemPrompt,
        skillsJson: skills,
        toolsJson: tools,
        defaultModel,
        modelColorHex: modelColor,
        prefersImageTasks: prefersImage,
      }),
    })
    if (res.ok) {
      setMessage(`Agent "${agentName}" created`)
      setAgentName("")
      setSystemPrompt("")
      setSkills("")
      setTools("")
    } else {
      setMessage("Failed to create agent")
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
      <div className="flex gap-2">
        <button
          className={`rounded px-3 py-1 text-sm ${tab === "provider" ? "bg-indigo-600" : "bg-gray-700"}`}
          onClick={() => setTab("provider")}
        >
          Provider
        </button>
        <button
          className={`rounded px-3 py-1 text-sm ${tab === "agent" ? "bg-indigo-600" : "bg-gray-700"}`}
          onClick={() => setTab("agent")}
        >
          Create Agent
        </button>
      </div>

      {message && (
        <div className="rounded bg-green-900/50 px-3 py-1 text-sm text-green-300">
          {message}
        </div>
      )}

      {tab === "provider" && (
        <form onSubmit={saveProvider} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400">Base URL</label>
            <input
              className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400">
              API Key {config?.hasApiKey ? "(stored)" : "(optional)"}
            </label>
            <input
              className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave empty if not needed"
            />
          </div>
          {config && (
            <p className="text-xs text-gray-500">
              Endpoint: <span className="text-gray-300">{config.baseUrl}</span>
            </p>
          )}
          <button
            type="submit"
            className="rounded bg-indigo-600 px-4 py-1 text-sm hover:bg-indigo-500"
          >
            Save Provider
          </button>
        </form>
      )}

      {tab === "agent" && (
        <form onSubmit={saveAgent} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400">Name</label>
            <input
              className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400">System Prompt</label>
            <textarea
              className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm"
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400">
              Skills (JSON array, e.g. {`["Python", "SQL"]`})
            </label>
            <input
              className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400">
              Tools (JSON array)
            </label>
            <input
              className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400">Model</label>
            <input
              className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              placeholder="OpenCode/deepseek-v4-flash"
            />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs text-gray-400">Model Color</label>
              <input
                type="color"
                className="h-8 w-16 rounded border border-gray-600 bg-gray-800"
                value={modelColor}
                onChange={(e) => setModelColor(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={prefersImage}
                onChange={(e) => setPrefersImage(e.target.checked)}
              />
              Image generation agent
            </label>
          </div>
          <button
            type="submit"
            className="rounded bg-indigo-600 px-4 py-1 text-sm hover:bg-indigo-500"
          >
            Create Agent
          </button>
        </form>
      )}
    </div>
  )
}
