"use client"

import { useState, useEffect, type FormEvent } from "react"

interface ModelOption {
  id: string
  name: string
  capabilities: string[]
}

interface Props {
  onAgentCreated?: (agentId: string, name: string, color: string) => void
}

const PRESET_COLORS = [
  "#89b4fa", "#cba6f7", "#f5c2e7", "#a6e3a1",
  "#fab387", "#f38ba8", "#94e2d5", "#f9e2af",
]

export function CreateAgentForm({ onAgentCreated }: Props) {
  const [name, setName] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [model, setModel] = useState("OpenCode/deepseek-v4-flash")
  const [models, setModels] = useState<ModelOption[]>([])
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [prefersImage, setPrefersImage] = useState(false)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((list: ModelOption[]) => {
        setModels(list)
        if (list.length > 0 && !list.some((m) => m.id === model)) {
          setModel(list[0].id)
        }
      })
      .catch(() => {
        setModels([{ id: "OpenCode/deepseek-v4-flash", name: "DeepSeek V4 Flash (fallback)", capabilities: ["text"] }])
      })
  }, [])

  const addSkill = () => {
    setSkills((prev) => [...prev, ""])
  }

  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSkill = (index: number, value: string) => {
    setSkills((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const filteredSkills = skills.filter((s) => s.trim().length > 0)
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          systemPrompt,
          skillsJson: JSON.stringify(filteredSkills),
          toolsJson: "[]",
          defaultModel: model,
          modelColorHex: color,
          prefersImageTasks: prefersImage,
        }),
      })
      if (res.ok) {
        const agent = await res.json()
        setMessage(`"${name}" created!`)
        onAgentCreated?.(agent.id, name, color)
        setName("")
        setSystemPrompt("")
        setSkills([])
        setColor(PRESET_COLORS[0])
        setPrefersImage(false)
      } else {
        setMessage("Failed to create agent")
      }
    } catch {
      setMessage("Network error")
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-in stagger-1">
        <h2 className="font-display text-2xl font-bold text-text">
          Create Agent
        </h2>
        <p className="mt-1 font-body text-sm text-subtext">
          Design your workshop companion
        </p>
      </div>

      {message && (
        <div className="animate-fade-in rounded-2xl bg-green/10 px-4 py-2.5 font-body text-sm text-green">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="animate-fade-in stagger-2 space-y-4">
          <div>
            <label className="mb-1.5 block font-display text-sm font-bold text-text">
              Name
            </label>
            <input
              className="input-glass"
              placeholder="e.g. CodeBot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={30}
            />
            <p className="mt-1 text-right font-body text-xs text-subtext/50">
              {name.length}/30
            </p>
          </div>

          <div>
            <label className="mb-1.5 block font-display text-sm font-bold text-text">
              System Prompt
            </label>
            <textarea
              className="input-glass min-h-[100px] resize-y"
              placeholder="You are a helpful AI assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block font-display text-sm font-bold text-text">
              Skills
            </label>
            <div className="space-y-2">
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input-glass flex-1"
                    placeholder="@/home/nate/.agents/skills/..."
                    value={skill}
                    onChange={(e) => updateSkill(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red/10 text-red/70 hover:bg-red/20 hover:text-red transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-subtext/60 hover:border-mauve/30 hover:text-mauve/70 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Skill
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-display text-sm font-bold text-text">
              Model
            </label>
            <select
              className="input-glass"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="animate-fade-in stagger-3">
          <label className="mb-2 block font-display text-sm font-bold text-text">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-8 w-8 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px ${c}, 0 0 12px ${c}60` : "none",
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="animate-fade-in stagger-4 flex items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={prefersImage}
              onChange={(e) => setPrefersImage(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-overlay/40 transition-colors peer-checked:bg-blue/30 peer-checked:shadow-glow-blue" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-subtext transition-all peer-checked:translate-x-4 peer-checked:bg-blue" />
          </label>
          <span className="font-body text-sm text-subtext">Image generation capable</span>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="btn-primary animate-fade-in stagger-5 w-full"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue/30 border-t-blue" />
              Creating...
            </span>
          ) : (
            "Create Agent"
          )}
        </button>
      </form>
    </div>
  )
}
