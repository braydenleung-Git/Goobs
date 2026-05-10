"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { marked } from "marked"
import { RuntimeStateProvider, useRuntimeState } from "@/components/scene/runtime-state-adapter"
import { TopNav, type TabId } from "@/components/layout/top-nav"
import { AgentSidebar } from "@/components/layout/agent-sidebar"
import { CreateAgentForm } from "@/components/create/create-agent-form"
import { AgentPreviewScene } from "@/components/create/agent-preview-scene"
import { AgentsGrid } from "@/components/agents/agents-grid"
import { ConfigPanels } from "@/components/workshop/config-panels"
import { ChallengeRunnerPanel, type RunResult } from "@/components/workshop/challenge-runner-panel"
import { ProgressAndHistory } from "@/components/workshop/progress-and-history"
import { DemoControls } from "@/components/workshop/demo-controls"
import { skillName } from "@/lib/skills/skill-name"

const WorkshopScene = dynamic(
  () => import("@/components/scene/workshop-scene").then((m) => ({ default: m.WorkshopScene })),
  { ssr: false },
)

function WorkshopContent() {
  const { spawnAgent, routeAgent, setAgentAnimation, updateAgentMeta, requestDrop } = useRuntimeState()
  const progressRef = useRef<{ refresh: () => void }>(null)
  const [activeTab, setActiveTab] = useState<TabId>("workshop")
  const [showConfig, setShowConfig] = useState(false)
  const [showChallenge, setShowChallenge] = useState(false)
  const [previewColor, setPreviewColor] = useState("#89b4fa")

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const agentId = e.dataTransfer.getData("text/plain")
    if (!agentId) return
    requestDrop(agentId, e.clientX, e.clientY)
  }, [requestDrop])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }, [])

  const handleAgentCreated = useCallback((agentId: string, name: string, color: string) => {
    spawnAgent(agentId)
    updateAgentMeta(agentId, { name, color })
    setPreviewColor(color)
    setTimeout(() => setActiveTab("workshop"), 800)
  }, [spawnAgent, updateAgentMeta])

  const handleRunStart = useCallback((agentId: string, workstationTarget: string) => {
    routeAgent(agentId, workstationTarget)
  }, [routeAgent])

  const handleRunComplete = useCallback((result: RunResult, agentId: string) => {
    if (result.finalPass) {
      setTimeout(() => setAgentAnimation(agentId, "celebrate"), 300)
    } else {
      setAgentAnimation(agentId, "error")
    }
    setTimeout(() => setAgentAnimation(agentId, "idle"), 4000)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("goobs-runs")
      const runs = stored ? JSON.parse(stored) : []
      runs.push({
        id: result.runId,
        challengeSlug: result.challengeSlug,
        finalPass: result.finalPass,
        totalScore: result.totalScore,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem("goobs-runs", JSON.stringify(runs))
      if (result.finalPass) {
        const storedP = localStorage.getItem("goobs-progress")
        const p = storedP ? JSON.parse(storedP) : { xp: 0, level: 1, unlockedWorkstations: [] }
        p.xp += result.xpAwarded
        p.level = result.level
        localStorage.setItem("goobs-progress", JSON.stringify(p))
      }
    }
    progressRef.current?.refresh()
  }, [setAgentAnimation])

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-base">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="relative flex-1">
        {activeTab === "workshop" ? (
          <>
            <div
              className="absolute inset-0"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <WorkshopScene />
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
              <div className="glass rounded-full px-3 py-2 flex items-center gap-2">
                <button
                  onClick={() => setShowChallenge(true)}
                  className="btn-ghost rounded-full px-4 py-1.5 font-body text-xs font-medium"
                >
                  Run Challenge
                </button>
                <div className="h-4 w-px bg-white/5" />
                <button
                  onClick={() => setShowConfig(true)}
                  className="btn-ghost rounded-full px-4 py-1.5 font-body text-xs font-medium"
                >
                  Config
                </button>
                <div className="h-4 w-px bg-white/5" />
                <div className="px-2">
                  <ProgressAndHistory ref={progressRef} compact />
                </div>
              </div>
            </div>

            <AgentSidebar />

            <AgentChatPanel />

            {showConfig && (
              <ConfigModal onClose={() => setShowConfig(false)} />
            )}

            {showChallenge && (
              <ChallengeModal
                onClose={() => setShowChallenge(false)}
                onRunStart={handleRunStart}
                onRunComplete={handleRunComplete}
              />
            )}
          </>
        ) : (
          <AgentsGrid onAgentCreated={handleAgentCreated} />
        )}
      </div>
    </div>
  )
}

function ConfigModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="modal-backdrop z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="glass-strong glass-border-accent w-full max-w-md animate-scale-in rounded-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text">Configuration</h2>
            <button onClick={onClose} className="btn-ghost flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs">
              ✕
            </button>
          </div>
          <ConfigPanels />
          <div className="mt-4 border-t border-white/5 pt-4">
            <DemoControls />
          </div>
        </div>
      </div>
    </>
  )
}

function ChallengeModal({
  onClose,
  onRunStart,
  onRunComplete,
}: {
  onClose: () => void
  onRunStart: (agentId: string, workstationTarget: string) => void
  onRunComplete: (result: RunResult, agentId: string) => void
}) {
  return (
    <>
      <div className="modal-backdrop z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="glass-strong glass-border-accent w-full max-w-lg animate-scale-in rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text">Run Challenge</h2>
            <button onClick={onClose} className="btn-ghost flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs">
              ✕
            </button>
          </div>
          <ChallengeRunnerPanel onRunStart={onRunStart} onRunComplete={onRunComplete} />
        </div>
      </div>
    </>
  )
}

function Markdown({ text }: { text: string }) {
  const [html, setHtml] = useState("")
  useEffect(() => {
    const result = marked.parse(text, { breaks: true })
    if (typeof result === "string") {
      setHtml(result)
    } else {
      result.then(setHtml).catch(() => setHtml(text))
    }
  }, [text])
  if (!html) return <span className="opacity-40">{text}</span>
  return (
    <div
      className="max-w-none break-words [&_pre]:bg-black/30 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-xs [&_code]:bg-white/5 [&_code]:rounded [&_code]:px-1 [&_code]:text-xs [&_p]:leading-relaxed [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function AgentChatPanel() {
  const { selectedAgentId, agents, agentMeta, selectAgent, setAgentAnimation } = useRuntimeState()
  const [message, setMessage] = useState("")
  const [chatLogs, setChatLogs] = useState<Record<string, Array<{ role: "agent" | "user"; text: string }>>>({})
  const [profile, setProfile] = useState<{ skillsJson: string; toolsJson: string; defaultModel: string } | null>(null)
  const [sending, setSending] = useState(false)

  const chatLog = selectedAgentId ? chatLogs[selectedAgentId] ?? [] : []

  useEffect(() => {
    if (selectedAgentId) {
      fetch(`/api/agents?id=${selectedAgentId}`)
        .then((r) => r.json())
        .then((a) => setProfile(a))
        .catch(() => setProfile(null))
    } else {
      setProfile(null)
    }
  }, [selectedAgentId])

  if (!selectedAgentId) return null

  const agent = agents.find((a) => a.agentId === selectedAgentId)
  const meta = agentMeta[selectedAgentId]
  if (!agent || !meta) return null

  const stateColor = agent.animationState === "celebrate" ? "#a6e3a1"
    : agent.animationState === "error" ? "#f38ba8"
    : agent.animationState === "walking" ? "#fab387"
    : agent.animationState === "thinking" ? "#cba6f7"
    : meta.color

  let skills: string[] = []
  if (profile) {
    try { skills = JSON.parse(profile.skillsJson) } catch {}
  }

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    const userMsg = message
    setMessage("")
    setChatLogs((prev) => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] ?? []), { role: "user", text: userMsg }],
    }))
    setSending(true)
    setAgentAnimation(selectedAgentId, "thinking")

    const currentLog = chatLog

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId,
          messages: [...currentLog, { role: "user", content: userMsg }],
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error("Response error")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let fullText = ""

      setChatLogs((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] ?? []), { role: "agent", text: "" }],
      }))

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data: ")) continue
          const data = trimmed.slice(6)
          if (data === "[DONE]") continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullText += delta
              setChatLogs((prev) => {
                const msgs = [...(prev[selectedAgentId] ?? [])]
                const last = msgs[msgs.length - 1]
                if (last && last.role === "agent") {
                  msgs[msgs.length - 1] = { ...last, text: fullText }
                }
                return { ...prev, [selectedAgentId]: msgs }
              })
            }
          } catch {}
        }
      }

      if (!fullText) {
        setChatLogs((prev) => {
          const msgs = [...(prev[selectedAgentId] ?? [])]
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: "(no response)" }
          return { ...prev, [selectedAgentId]: msgs }
        })
      }
    } catch {
      setChatLogs((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] ?? []), { role: "agent", text: "*error* Failed to reach agent" }],
      }))
    } finally {
    setSending(false)
    setAgentAnimation(selectedAgentId, "idle")
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => selectAgent(null)} />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-[340px] flex-col animate-slide-in-right"
        style={{ paddingTop: "4.5rem", paddingBottom: "0.75rem", paddingRight: "0.75rem" }}
      >
        <div
          className="glass-strong glass-border-accent flex h-full flex-col rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: stateColor, boxShadow: `0 0 8px ${stateColor}40` }} />
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base font-bold text-text truncate">{meta.name}</h3>
              <span className="font-body text-xs text-subtext capitalize">{sending ? "thinking..." : agent.animationState}</span>
            </div>
            <button onClick={() => selectAgent(null)} className="btn-ghost flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs shrink-0">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-white/5 px-5 py-3">
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <div className="font-body text-[10px] text-subtext uppercase tracking-wider">State</div>
              <div className="font-display text-sm text-text capitalize">{agent.animationState}</div>
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <div className="font-body text-[10px] text-subtext uppercase tracking-wider">Position</div>
              <div className="font-display text-sm text-text">{agent.workstationTarget || "idle"}</div>
            </div>
          </div>

          <div className="border-b border-white/5 px-5 py-3 space-y-3">
            {profile && (
              <>
                <div>
                  <div className="font-body text-[10px] text-subtext/40 uppercase tracking-wider mb-1.5">Model</div>
                  <div className="font-display text-xs text-text/80">{profile.defaultModel}</div>
                </div>
                <div>
                  <div className="font-body text-[10px] text-subtext/40 uppercase tracking-wider mb-1.5">Skills</div>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {skills.map((s, i) => (
                        <span key={i} className="rounded-lg bg-mauve/10 px-2 py-1 font-body text-[10px] text-mauve/70">
                          {skillName(s)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-body text-[11px] text-subtext/30">None</span>
                  )}
                </div>
                <div>
                  <div className="font-body text-[10px] text-subtext/40 uppercase tracking-wider mb-1.5">Tools</div>
                  <span className="font-body text-[11px] text-subtext/30">Integration coming soon</span>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
            {chatLog.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="font-body text-xs text-subtext/40 text-center px-4">Agent selected. Message them or run a challenge.</p>
              </div>
            ) : (
              chatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${msg.role === "user" ? "bg-blue/20 text-blue" : "bg-white/5 text-text"}`}>
                    {msg.role === "user" ? msg.text : <Markdown text={msg.text || "*thinking...*"} />}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/5 px-4 py-3">
            <input
              className="input-glass flex-1 rounded-full px-4 py-2 text-sm"
              placeholder={sending ? "Waiting..." : "Message agent..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !message.trim()} className="flex h-9 w-9 items-center justify-center rounded-full bg-blue/20 text-blue transition-all hover:bg-blue/30 disabled:opacity-20 shrink-0">
              {sending ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue/30 border-t-blue" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
}

export default function WorkshopPage() {
  return (
    <RuntimeStateProvider>
      <WorkshopContent />
    </RuntimeStateProvider>
  )
}
