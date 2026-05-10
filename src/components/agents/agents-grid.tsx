"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { CreateAgentForm } from "@/components/create/create-agent-form"
import { skillName } from "@/lib/skills/skill-name"

const AgentPreviewScene = dynamic(
  () => import("@/components/create/agent-preview-scene").then((m) => ({ default: m.AgentPreviewScene })),
  { ssr: false },
)

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

function CapsuleIcon({ color, size = 32 }: { color: string; size?: number }) {
  const bodyH = size * 0.5
  const headR = size * 0.18
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={size * 0.25} y={size * 0.2} width={size * 0.5} height={bodyH} rx={size * 0.2} fill={color} opacity={0.8} />
      <circle cx={size * 0.5} cy={size * 0.15} r={headR} fill={color} />
      <circle cx={size * 0.35} cy={size * 0.45} r={size * 0.03} fill="#fff" opacity={0.6} />
      <circle cx={size * 0.65} cy={size * 0.45} r={size * 0.03} fill="#fff" opacity={0.6} />
      <rect x={size * 0.35} y={size * 0.58} width={size * 0.06} height={size * 0.15} rx={size * 0.02} fill={color} opacity={0.5} />
      <rect x={size * 0.59} y={size * 0.58} width={size * 0.06} height={size * 0.15} rx={size * 0.02} fill={color} opacity={0.5} />
    </svg>
  )
}

export function AgentsGrid({ onAgentCreated }: Props) {
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [editColor, setEditColor] = useState("#89b4fa")

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

  const openEdit = (agent: AgentSummary) => {
    setEditColor(agent.modelColorHex)
    setEditing(agent.id)
  }

  const openCreate = () => {
    setEditColor("#89b4fa")
    setCreating(true)
  }

  // Split view for edit/create
  if (editing || creating) {
    const editingAgent = editing ? agents.find((a) => a.id === editing) ?? null : null

    return (
      <div className="flex h-full flex-col" style={{ paddingTop: "1rem" }}>
        <div className="flex flex-1 overflow-hidden animate-scale-in">
          <div className="hidden w-1/2 min-w-0 lg:block">
            <div className="h-full p-4">
              <AgentPreviewScene color={editColor} />
            </div>
          </div>
          <div className="flex w-full lg:w-1/2 flex-col overflow-y-auto p-4 animate-slide-in-right">
            <div className="mb-3 flex items-center gap-3">
              <button
                onClick={() => { setEditing(null); setCreating(false) }}
                className="btn-ghost rounded-full px-3 py-1.5 text-sm"
              >
                ← Back
              </button>
              <h2 className="font-display text-lg font-bold text-text">
                {editing ? `Edit ${editingAgent?.name || ""}` : "Create Agent"}
              </h2>
            </div>
            <div className="glass-strong glass-border-accent rounded-2xl p-6">
              {editingAgent ? (
                <CreateAgentForm key={editing} editingAgent={editingAgent} onUpdated={handleUpdated} />
              ) : (
                <CreateAgentForm onAgentCreated={handleCreated} />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-4 animate-fade-in" style={{ paddingTop: "1rem" }}>
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold text-text">Agents</h2>
        <p className="mt-1 font-body text-sm text-subtext">
          {agents.length} agent{agents.length !== 1 ? "s" : ""} — click to edit, drag into the workshop
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => openEdit(agent)}
              className="glass-strong glass-border-accent group relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all hover:scale-[1.03] hover:shadow-lg"
            >
              <CapsuleIcon color={agent.modelColorHex || "#89b4fa"} size={48} />
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
            onClick={openCreate}
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
