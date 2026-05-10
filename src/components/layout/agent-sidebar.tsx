"use client"

import { useState, useEffect, useCallback } from "react"
import { skillName } from "@/lib/skills/skill-name"

interface AgentSummary {
  id: string
  name: string
  modelColorHex: string
  defaultModel: string
  skillsJson: string
  systemPrompt: string
  isPrebuilt: boolean
}

export function AgentSidebar() {
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [hovered, setHovered] = useState(false)
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setAgents)
      .catch(() => {})
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, agentId: string) => {
    e.dataTransfer.setData("text/plain", agentId)
    e.dataTransfer.effectAllowed = "copy"
  }, [])

  const infoAgent = selectedInfo ? agents.find((a) => a.id === selectedInfo) : null

  return (
    <>
      <div
        className="fixed left-0 top-0 z-40 h-full w-3 cursor-pointer"
        style={{ paddingTop: "4.5rem" }}
        onMouseEnter={() => setHovered(true)}
      />

      <div
        className={`fixed left-0 top-0 z-50 h-full transition-all duration-200 ease-out ${
          hovered ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ paddingTop: "4.5rem", paddingBottom: "0.75rem", paddingLeft: "0.75rem" }}
        onMouseLeave={() => { setHovered(false); setSelectedInfo(null) }}
      >
        <div className="glass-strong glass-border-accent flex h-full w-72 flex-col rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <h3 className="font-display text-sm font-bold text-text">Agents</h3>
            <span className="font-body text-[10px] text-subtext/50">{agents.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {agents.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="font-body text-xs text-subtext/40 text-center px-4">
                  No agents yet. Create one in the Create tab.
                </p>
              </div>
            )}

            {agents.map((agent) => (
              <div key={agent.id}>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, agent.id)}
                  onClick={() => setSelectedInfo(selectedInfo === agent.id ? null : agent.id)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
                    selectedInfo === agent.id
                      ? "bg-white/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: agent.modelColorHex || "#89b4fa" }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-text truncate">
                        {agent.name}
                      </span>
                      {agent.isPrebuilt && (
                        <span className="rounded-full bg-mauve/10 px-1.5 py-0.5 font-body text-[9px] text-mauve/60 uppercase tracking-wider">
                          demo
                        </span>
                      )}
                    </div>
                    <div className="font-body text-[10px] text-subtext/50 truncate">
                      {agent.defaultModel}
                    </div>
                  </div>

                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-subtext/20 group-hover:text-subtext/40 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M5 15l7-7 7 7" />
                  </svg>
                </div>

                {selectedInfo === agent.id && infoAgent && (
                  <div className="mx-3 mb-2 rounded-xl bg-white/5 px-3 py-3 space-y-2.5 animate-fade-in">
                    <div>
                      <div className="font-body text-[9px] text-subtext/40 uppercase tracking-wider mb-1">System Prompt</div>
                      <div className="font-body text-xs text-text/80 line-clamp-3">{infoAgent.systemPrompt}</div>
                    </div>

                    <div>
                      <div className="font-body text-[9px] text-subtext/40 uppercase tracking-wider mb-1">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          let parsed: string[] = []
                          try { parsed = JSON.parse(infoAgent.skillsJson) } catch {}
                          return parsed.length > 0
                            ? parsed.map((s, i) => (
                                <span key={i} className="rounded-xl bg-mauve/10 px-2 py-1 font-body text-[10px] text-mauve/80 max-w-full">
                                  <span className="truncate block max-w-[200px]">{skillName(s)}</span>
                                  <span className="text-[8px] text-mauve/40">{s.length}c</span>
                                </span>
                              ))
                            : <span className="font-body text-[10px] text-subtext/30">None</span>
                        })()}
                      </div>
                    </div>

                    <div>
                      <div className="font-body text-[9px] text-subtext/40 uppercase tracking-wider mb-1">Model</div>
                      <div className="font-body text-xs text-text/70">{infoAgent.defaultModel}</div>
                    </div>

                    <div>
                      <div className="font-body text-[9px] text-subtext/40 uppercase tracking-wider mb-1">Tools</div>
                      <div className="font-body text-[10px] text-subtext/30">
                        Tool integration coming soon
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 px-4 py-2.5">
            <p className="font-body text-[10px] text-subtext/30 text-center">
              Drag agents into the scene
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
