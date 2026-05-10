"use client"

import { useState, type FormEvent } from "react"
import { useRuntimeState } from "@/components/scene/runtime-state-adapter"

export function AgentSidebar() {
  const { selectedAgentId, selectAgent, agents, agentMeta, setAgentAnimation, routeAgent } =
    useRuntimeState()
  const [message, setMessage] = useState("")
  const [chatLog, setChatLog] = useState<Array<{ role: "agent" | "user"; text: string }>>([])

  if (!selectedAgentId) return null

  const agent = agents.find((a) => a.agentId === selectedAgentId)
  const meta = agentMeta[selectedAgentId]
  if (!agent || !meta) return null

  const stateColor =
    agent.animationState === "celebrate"
      ? "#a6e3a1"
      : agent.animationState === "error"
        ? "#f38ba8"
        : agent.animationState === "walking"
          ? "#fab387"
          : agent.animationState === "thinking"
            ? "#cba6f7"
            : meta.color

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setChatLog((prev) => [...prev, { role: "user", text: message }])
    setChatLog((prev) => [
      ...prev,
      { role: "agent", text: `*${agent.animationState}* — "${message}"` },
    ])
    setMessage("")
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => selectAgent(null)}
      />

      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-[340px] flex-col animate-slide-in-right"
        style={{ paddingTop: "4.5rem", paddingBottom: "0.75rem", paddingRight: "0.75rem" }}
      >
        <div
          className="glass-strong glass-border-accent flex h-full flex-col rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: stateColor, boxShadow: `0 0 8px ${stateColor}40` }}
            />
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-text">{meta.name}</h3>
              <span className="font-body text-xs text-subtext capitalize">
                {agent.animationState}
              </span>
            </div>
            <button
              onClick={() => selectAgent(null)}
              className="btn-ghost flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-white/5 px-5 py-3">
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <div className="font-body text-[10px] text-subtext uppercase tracking-wider">State</div>
              <div className="font-display text-sm text-text capitalize">{agent.animationState}</div>
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <div className="font-body text-[10px] text-subtext uppercase tracking-wider">Position</div>
              <div className="font-display text-sm text-text">
                {agent.workstationTarget || "idle"}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {chatLog.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="font-body text-xs text-subtext/60 text-center">
                  Agent ready. Send a message or run a challenge.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatLog.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-blue/20 text-blue"
                          : "bg-white/5 text-text"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/5 px-4 py-3">
            <input
              className="input-glass flex-1 rounded-full px-4 py-2 text-sm"
              placeholder="Message agent..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue/20 text-blue transition-all hover:bg-blue/30 hover:shadow-glow-blue"
              disabled={!message.trim()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
