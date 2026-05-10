"use client"

import { useState, useEffect, type FormEvent } from "react"
import { skillName } from "@/lib/skills/skill-name"
import { getProgressionState } from "@/lib/progression/progression-engine"

interface ModelOption {
  id: string
  name: string
  capabilities: string[]
}

interface Props {
  onAgentCreated?: (agentId: string, name: string, color: string) => void
  editingAgent?: {
    id: string
    name: string
    systemPrompt: string
    skillsJson: string
    defaultModel: string
    modelColorHex: string
  } | null
  onUpdated?: () => void
}

const PRESET_COLORS = [
  "#89b4fa", "#cba6f7", "#f5c2e7", "#a6e3a1",
  "#fab387", "#f38ba8", "#94e2d5", "#f9e2af",
]

export function CreateAgentForm({ onAgentCreated, editingAgent, onUpdated }: Props) {
  const [name, setName] = useState(editingAgent?.name ?? "")
  const [systemPrompt, setSystemPrompt] = useState(editingAgent?.systemPrompt ?? "")
  const [skills, setSkills] = useState<string[]>(() => {
    if (editingAgent) { try { return JSON.parse(editingAgent.skillsJson) } catch { return [] } }
    return []
  })
  const [model, setModel] = useState(editingAgent?.defaultModel ?? "OpenCode/deepseek-v4-flash")
  const [models, setModels] = useState<ModelOption[]>([])
  const [color, setColor] = useState(editingAgent?.modelColorHex ?? PRESET_COLORS[0])
  const [prefersImage, setPrefersImage] = useState(false)
  const [toolProfile, setToolProfile] = useState("none")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((list: ModelOption[]) => {
        setModels(list)
        if (list.length > 0) {
          setModel(list[0].id)
        }
      })
      .catch(() => {
        setModels([{ id: "OpenCode/deepseek-v4-flash", name: "DeepSeek V4 Flash (fallback)", capabilities: ["text"] }])
      })
  }, [])

  const openEditor = (index: number | null) => {
    if (index !== null) {
      setEditContent(skills[index] || "")
      setEditingIndex(index)
    } else {
      setEditContent("")
      setEditingIndex(skills.length)
    }
  }

  const saveSkill = () => {
    if (editingIndex === null) return
    const trimmed = editContent.trim()
    setSkills((prev) => {
      const next = [...prev]
      if (editingIndex >= next.length) {
        next.push(trimmed)
      } else {
        next[editingIndex] = trimmed
      }
      return next
    })
    setEditingIndex(null)
    setEditContent("")
    ;(window as any).__goobsProgressionEvent?.("skill_added")
  }

  const removeSkill = (index: number) => {
    if (editingIndex === index) {
      setEditingIndex(null)
      setEditContent("")
    }
    setSkills((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const filteredSkills = skills.filter((s) => s.trim().length > 0)
      const body = {
        name,
        systemPrompt,
        skillsJson: JSON.stringify(filteredSkills),
        toolsJson: JSON.stringify({ profile: toolProfile, selectedTools: toolProfile }),
        defaultModel: model,
        modelColorHex: color,
        prefersImageTasks: prefersImage,
      }

      if (editingAgent) {
        const res = await fetch(`/api/agents?id=${editingAgent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          setMessage(`"${name}" updated!`)
          onUpdated?.()
        } else {
          setMessage("Failed to update agent")
        }
      } else {
        const res = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const agent = await res.json()
          setMessage(`"${name}" created!`)
          onAgentCreated?.(agent.id, name, color)
          ;(window as any).__goobsProgressionEvent?.("agent_created")
          setName("")
          setSystemPrompt("")
          setSkills([])
          setColor(PRESET_COLORS[0])
          setPrefersImage(false)
        } else {
          setMessage("Failed to create agent")
        }
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
          {editingAgent ? "Edit Agent" : "Create Agent"}
        </h2>
        <p className="mt-1 font-body text-sm text-subtext">
          {editingAgent ? "Update your workshop companion" : "Design your workshop companion"}
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
                <div key={i} className="group flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditor(i)}
                    className="flex-1 rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2 text-left text-xs text-text/70 hover:bg-white/[0.06] hover:border-white/10 transition-all truncate"
                  >
                    <span className="font-display text-sm font-bold text-text truncate block">
                      {skillName(skill)}
                    </span>
                    <span className="font-body text-[10px] text-subtext/40 mt-0.5 block truncate">
                      {skill.length} chars
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red/10 text-red/70 hover:bg-red/20 hover:text-red transition-colors text-sm opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => openEditor(null)}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-subtext/60 hover:border-mauve/30 hover:text-mauve/70 transition-all w-full justify-center"
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
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl px-3 py-2 pr-8 text-sm transition-all"
                style={{
                  background: "rgba(49, 50, 68, 0.4)",
                  border: "1px solid rgba(205, 214, 244, 0.08)",
                  color: "#cdd6f4",
                }}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: "#313244", color: "#cdd6f4" }}>
                    {m.name || m.id}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-subtext/60"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
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

        <div className="animate-fade-in stagger-4">
          <label className="mb-1.5 block font-display text-sm font-bold text-text">
            Tool Profile
          </label>
          <div className="relative">
            <select
              disabled={getProgressionState().tier < 2}
              className="w-full appearance-none rounded-xl px-3 py-2 pr-8 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: "rgba(49, 50, 68, 0.4)",
                border: "1px solid rgba(205, 214, 244, 0.08)",
                color: "#cdd6f4",
              }}
              value={toolProfile}
              onChange={(e) => setToolProfile(e.target.value)}
            >
              <option value="none" style={{ background: "#313244", color: "#cdd6f4" }}>None</option>
              <option value="read_only" style={{ background: "#313244", color: "#cdd6f4" }}>Read Only</option>
              <option value="read_write" style={{ background: "#313244", color: "#cdd6f4" }}>Read + Write</option>
              <option value="full" style={{ background: "#313244", color: "#cdd6f4" }}>Full (includes Bash)</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-subtext/60"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <p className="mt-1 font-body text-[10px] text-subtext/40">
            {getProgressionState().tier < 2 ? "Unlocks after completing all Tier 1 challenges" : "Select tool permissions for this agent"}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="btn-primary animate-fade-in stagger-5 w-full"
        >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue/30 border-t-blue" />
                {editingAgent ? "Saving..." : "Creating..."}
              </span>
            ) : editingAgent ? (
              "Update Agent"
            ) : (
              "Create Agent"
            )}
        </button>
      </form>

      {editingIndex !== null && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setEditingIndex(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="glass-strong glass-border-accent w-full max-w-lg animate-scale-in rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <h3 className="font-display text-base font-bold text-text">
                  Edit Skill
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="btn-ghost flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <textarea
                  className="h-56 w-full resize-none rounded-xl bg-black/20 border border-white/5 px-4 py-3 text-sm font-mono text-text leading-relaxed focus:border-blue/30 focus:shadow-[0_0_0_2px_rgba(137,180,250,0.15)] transition-all outline-none"
                  placeholder="Paste skill markdown content here..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-white/5 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="btn-ghost rounded-xl px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveSkill}
                  disabled={!editContent.trim()}
                  className="btn-primary rounded-xl px-5 py-2 text-sm"
                >
                  Save Skill
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
