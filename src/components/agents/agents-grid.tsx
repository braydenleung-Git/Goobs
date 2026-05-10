"use client"

import { useState, useEffect, useCallback } from "react"
import { CreateAgentForm } from "@/components/create/create-agent-form"

interface AgentSummary {
  id: string
  name: string
  modelColorHex: string
  defaultModel: string
  skillsJson: string
  systemPrompt: string
  isPrebuilt: boolean
}

interface Props {
  onAgentCreated?: (agentId: string, name: string, color: string) => void
}

export function AgentsGrid({ onAgentCreated }: Props) {
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setAgents)
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreated = (agentId: string, name: string, color: string) => {
    setCreating(false)
    load()
    onAgentCreated?.(agentId, name, color)
  }

  const handleUpdated = () => {
    setEditing(null)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this agent and all its runs?")) return
    await fetch(`/api/agents?id=${id}`, { method: "DELETE" })
    load()
  }

  if (creating) {
    return (
      <div className="flex h-full p-4" style={{ paddingTop: "1rem" }}>
        <div className="mx-auto w-full max-w-lg overflow-y-auto">
          <div className="mb-4 flex items-center gap-3">
            <button onClick={() => setCreating(false)} className="btn-ghost rounded-full px-3 py-1.5 text-sm">
              ← Back
            </button>
            <h2 className="font-display text-lg font-bold text-text">Create Agent</h2>
          </div>
          <div className="glass-strong glass-border-accent rounded-2xl p-6">
            <CreateAgentForm onAgentCreated={handleCreated} />
          </div>
        </div>
      </div>
    )
  }

  if (editing) {
    const agent = agents.find((a) => a.id === editing)
    if (!agent) { setEditing(null); return null }
    return (
      <div className="flex h-full p-4" style={{ paddingTop: "1rem" }}>
        <div className="mx-auto w-full max-w-lg overflow-y-auto">
          <div className="mb-4 flex items-center gap-3">
            <button onClick={() => setEditing(null)} className="btn-ghost rounded-full px-3 py-1.5 text-sm">
              ← Back
            </button>
            <h2 className="font-display text-lg font-bold text-text">Edit {agent.name}</h2>
          </div>
          <div className="glass-strong glass-border-accent rounded-2xl p-6">
            <CreateAgentForm
              key={editing}
              editingAgent={agent}
              onUpdated={handleUpdated}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-4" style={{ paddingTop: "1rem" }}>
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold text-text">Agents</h2>
        <p className="mt-1 font-body text-sm text-subtext">
          {agents.length} agent{agents.length !== 1 ? "s" : ""} — click to edit, drag into the workshop
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setEditing(agent.id)}
              className="glass-strong glass-border-accent group relative flex flex-col items-center gap-2 rounded-2xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <div
                className="h-10 w-10 rounded-full shrink-0"
                style={{ backgroundColor: agent.modelColorHex || "#89b4fa", boxShadow: `0 0 16px ${agent.modelColorHex || "#89b4fa"}40` }}
              />
              <div className="text-center min-w-0 w-full">
                <div className="font-display text-sm font-bold text-text truncate">{agent.name}</div>
                <div className="font-body text-[10px] text-subtext/50 truncate mt-0.5">{agent.defaultModel}</div>
              </div>
              {agent.isPrebuilt && (
                <span className="absolute top-2 right-2 rounded-full bg-mauve/10 px-1.5 py-0.5 font-body text-[8px] text-mauve/60 uppercase tracking-wider">
                  demo
                </span>
              )}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span
                  onClick={(e) => { e.stopPropagation(); handleDelete(agent.id) }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red/10 text-red/60 text-[10px] hover:bg-red/20"
                >
                  ✕
                </span>
              </div>
            </button>
          ))}

          <button
            onClick={() => setCreating(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 p-4 text-subtext/40 transition-all hover:border-mauve/30 hover:text-mauve/60"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="font-display text-xs font-bold">Create Agent</span>
          </button>
        </div>
      </div>
    </div>
  )
}
