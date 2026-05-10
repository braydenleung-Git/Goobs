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
import { DemoControls } from "@/components/workshop/demo-controls"
import { LaunchScreen } from "@/components/workshop/launch-screen"
import { ChallengeDock } from "@/components/workshop/challenge-dock"
import { IntroCards } from "@/components/workshop/intro-cards"
import { ToolIntroModal } from "@/components/workshop/tool-intro-modal"
import { HelpIcon } from "@/components/ui/help-icon"
import { skillName } from "@/lib/skills/skill-name"
import { dispatchProgressionEvent, resetProgression, getProgressionState, CHALLENGES, type ProgressionEventType } from "@/lib/progression/progression-engine"

const WorkshopScene = dynamic(
  () => import("@/components/scene/workshop-scene").then((m) => ({ default: m.WorkshopScene })),
  { ssr: false },
)

function WorkshopContent() {
  const { routeAgent, setAgentAnimation, setInstanceAnimation, setTaskResult, updateAgentMeta, requestDrop, setDropPreview, clearDropPreview, agents } = useRuntimeState()
  const progressRef = useRef<{ refresh: () => void }>(null)
  const [activeTab, setActiveTab] = useState<TabId>("workshop")
  const [showConfig, setShowConfig] = useState(false)
  const [showChallenge, setShowChallenge] = useState(false)
  const [previewColor, setPreviewColor] = useState("#89b4fa")
  const [showLaunch, setShowLaunch] = useState(true)
  const [showIntro, setShowIntro] = useState(true)
  const [showToolIntro, setShowToolIntro] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; subtitle: string }>>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const agentId = e.dataTransfer.getData("text/plain")
    if (!agentId) return
    requestDrop(agentId, e.clientX, e.clientY)
    clearDropPreview()
  }, [requestDrop, clearDropPreview])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setDropPreview(e.clientX, e.clientY)
  }, [setDropPreview])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (
      e.clientX <= rect.left || e.clientX >= rect.right ||
      e.clientY <= rect.top || e.clientY >= rect.bottom
    ) {
      clearDropPreview()
    }
  }, [clearDropPreview])

  const handleAgentCreated = useCallback((agentId: string, name: string, color: string) => {
    updateAgentMeta(agentId, { name, color })
    setPreviewColor(color)
    setTimeout(() => setActiveTab("workshop"), 800)
  }, [updateAgentMeta])

  const handleRunStart = useCallback((agentId: string, workstationTarget: string) => {
    routeAgent(agentId, workstationTarget)
  }, [routeAgent])

  const agentsRef = useRef(agents)
  agentsRef.current = agents

  const handleRunComplete = useCallback((result: RunResult, agentId: string) => {
    const instance = agentsRef.current.find((a) => a.agentId === agentId)
    if (instance) {
      setTaskResult(instance.instanceId, result.finalPass ? "celebrate" : "error")
    }
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
    const writeCalls = result.toolCalls?.filter((tc) => tc.name === "write_file" && tc.success) ?? []
    for (let i = 0; i < writeCalls.length; i++) {
      ;(window as any).__goobsProgressionEvent?.("tool_write_file")
    }
    const bashCalls = result.toolCalls?.filter((tc) => tc.name === "exec_bash" && tc.success) ?? []
    for (let i = 0; i < bashCalls.length; i++) {
      ;(window as any).__goobsProgressionEvent?.("tool_exec_bash")
    }
    if (writeCalls.length > 0 && bashCalls.length > 0) {
      ;(window as any).__goobsProgressionEvent?.("tool_build_script")
    }
    progressRef.current?.refresh()
  }, [setTaskResult])

  const handleProgressionEvent = useCallback((type: ProgressionEventType, data?: string) => {
    const delta = dispatchProgressionEvent({ type, agentId: data })
    if (delta.toast) {
      const toastId = crypto.randomUUID()
      setToasts((prev) => [...prev, { id: toastId, title: delta.toast!.title, subtitle: delta.toast!.subtitle }])
    }
    if (delta.tierChanged && delta.newTier === 2) {
      setShowToolIntro(true)
    }
    progressRef.current?.refresh()
  }, [])

  useEffect(() => {
    ;(window as any).__goobsProgressionEvent = handleProgressionEvent
    return () => { delete (window as any).__goobsProgressionEvent }
  }, [handleProgressionEvent])

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-base">
      {showLaunch && <LaunchScreen onStart={() => setShowLaunch(false)} />}
      {showIntro && !showLaunch && <IntroCards onDone={() => setShowIntro(false)} />}
      {showToolIntro && <ToolIntroModal onDone={() => setShowToolIntro(false)} />}
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} onOpenConfig={() => setShowConfig(true)} />

      <div className="relative flex-1">
        {activeTab === "workshop" ? (
          <>
            <div
              className="absolute inset-0"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <WorkshopScene />
            </div>

            <AgentSidebar onSidebarChange={setSidebarOpen} />

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

        {/* Keep AgentChatPanel always mounted so chat logs persist across tab switches */}
        <div className={activeTab !== "workshop" ? "hidden" : ""}>
          <AgentChatPanel />
        </div>
      </div>
      {!showLaunch && <ChallengeDock toasts={toasts} onDismissToast={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} sidebarOpen={sidebarOpen} />}
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

function ToolCallCard({ call }: { call: { name: string; arguments: string; output: string; stdout: string; stderr: string; exitCode?: number; files?: string[] } }) {
  const [open, setOpen] = useState(false)
  const args = (() => { try { return JSON.parse(call.arguments) } catch { return {} } })()

  const icon = call.name === "write_file" ? "📄"
    : call.name === "exec_bash" ? "🖥"
    : call.name === "read_file" ? "📖"
    : call.name === "list_files" ? "📁"
    : "🔧"

  const label = call.name === "write_file" ? `Wrote ${args.path || ""}`
    : call.name === "exec_bash" ? `$ ${(args.command || "").slice(0, 60)}${(args.command || "").length > 60 ? "..." : ""}`
    : call.name === "read_file" ? `Read ${args.path || ""}`
    : call.name === "list_files" ? `Listed ${args.path || "."}`
    : call.name

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] min-w-0 rounded-xl border border-white/5 bg-white/[0.02] text-xs">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-subtext/80 hover:bg-white/5 transition-colors"
        >
          <span className="shrink-0">{icon}</span>
          <span className="flex-1 truncate font-mono">{label}</span>
          {call.name === "exec_bash" && call.exitCode !== undefined && (
            <span className={`shrink-0 font-mono ${call.exitCode === 0 ? "text-green" : "text-red"}`}>
              exit {call.exitCode}
            </span>
          )}
          <span className="shrink-0 text-subtext/40">{open ? "▾" : "▸"}</span>
        </button>
        {open && (
          <div className="border-t border-white/5 px-3 py-2 space-y-2 max-h-[400px] overflow-y-auto">
            {call.name === "write_file" && call.files && call.files.length > 0 && (
              <div className="flex items-center gap-2 text-blue/80">
                <span className="shrink-0">🔗</span>
                <code className="break-all text-[11px]">{call.files[0]}</code>
              </div>
            )}
            {call.name === "exec_bash" && (
              <>
                <div className="rounded bg-black/40 p-2 font-mono text-[11px] text-green/80 whitespace-pre-wrap break-all">{args.command || ""}</div>
                {call.stdout && <div className="rounded bg-black/40 p-2 font-mono text-[11px] text-text/80 whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto">{call.stdout}</div>}
                {call.stderr && <div className="rounded bg-black/40 p-2 font-mono text-[11px] text-red/70 whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto">{call.stderr}</div>}
              </>
            )}
            {(call.name === "read_file" || call.name === "list_files") && call.output && (
              <div className="rounded bg-black/40 p-2 font-mono text-[11px] text-text/80 whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto">{call.output}</div>
            )}
            {!["write_file", "exec_bash", "read_file", "list_files"].includes(call.name) && call.output && (
              <div className="rounded bg-black/40 p-2 font-mono text-[11px] text-text/80 whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto">{call.output}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentChatPanel() {
  const { selectedAgentId, selectedInstanceId, agents, agentMeta, selectAgent, setAgentAnimation, setInstanceAnimation, setTaskResult, routeAgent } = useRuntimeState()

  interface ToolCallEntry {
    name: string
    arguments: string
    output: string
    stdout: string
    stderr: string
    exitCode?: number
    files?: string[]
  }

  interface ChatEntry {
    role: "agent" | "user"
    text: string
    toolCalls?: ToolCallEntry[]
  }

  const [message, setMessage] = useState("")
  const [chatLogs, setChatLogs] = useState<Record<string, ChatEntry[]>>({})
  const [profile, setProfile] = useState<{ skillsJson: string; toolsJson: string; defaultModel: string } | null>(null)
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)
  sendingRef.current = sending
  const chatSentMapRef = useRef<Record<string, boolean>>({})
  const chatLogKey = selectedInstanceId || selectedAgentId || ""

  const chatLog = chatLogKey ? chatLogs[chatLogKey] ?? [] : []

  useEffect(() => {
    if (selectedAgentId) {
      const load = () => {
        fetch(`/api/agents?id=${selectedAgentId}`)
          .then((r) => r.json())
          .then((a) => setProfile(a))
          .catch(() => setProfile(null))
      }
      load()
      const interval = setInterval(load, 4000)
      return () => clearInterval(interval)
    } else {
      setProfile(null)
    }
  }, [chatLogKey])

  if (!selectedAgentId) return null

  const agent = agents.find((a) => a.instanceId === selectedInstanceId)
  const meta = agentMeta[chatLogKey]
  if (!agent) return null

  const stateColor = agent.animationState === "celebrate" ? "#a6e3a1"
    : agent.animationState === "error" ? "#f38ba8"
    : agent.animationState === "walking" ? "#fab387"
    : agent.animationState === "thinking" ? "#cba6f7"
    : meta?.color ?? "#89b4fa"

  let skills: string[] = []
  if (profile) {
    try { skills = JSON.parse(profile.skillsJson) } catch {}
  }

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    const userMsg = message
    const currentLog = chatLog
    setMessage("")
    setChatLogs((prev) => ({
      ...prev,
      [chatLogKey]: [...(prev[chatLogKey] ?? []), { role: "user", text: userMsg }],
    }))
    setSending(true)
    setAgentAnimation(selectedAgentId, "thinking")

    // Classify message intent and route to workstation (non-blocking)
    fetch("/api/chat/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    })
      .then((r) => r.json())
      .then(({ workstationId }) => {
        if (workstationId && sendingRef.current) routeAgent(selectedAgentId, workstationId)
      })
      .catch(() => {})

    try {
      const mappedMessages = currentLog.map((m) => ({
        role: m.role === "agent" ? "assistant" : m.role,
        content: m.text || "",
      }))
      mappedMessages.push({ role: "user" as const, content: userMsg })

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId,
          messages: mappedMessages,
        }),
      })

      if (!res.ok) throw new Error("Response error")

      const contentType = res.headers.get("content-type") || ""

      // ---- SSE streaming (both tools and no-tools paths) ----
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let fullText = ""
      const toolCallsAcc: Array<{ name: string }> = []

      setChatLogs((prev) => ({
        ...prev,
        [chatLogKey]: [...(prev[chatLogKey] ?? []), { role: "agent", text: "" }],
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

            // custom tool-path events
            if (parsed.type === "text") {
              fullText += parsed.content
              setChatLogs((prev) => {
                const msgs = [...(prev[chatLogKey] ?? [])]
                const last = msgs[msgs.length - 1]
                if (last && last.role === "agent") msgs[msgs.length - 1] = { ...last, text: fullText }
                return { ...prev, [chatLogKey]: msgs }
              })
              continue
            }

            if (parsed.type === "tool_call") {
              toolCallsAcc.push({ name: parsed.name })
              setChatLogs((prev) => {
                const msgs = [...(prev[chatLogKey] ?? [])]
                const last = msgs[msgs.length - 1]
                if (last && last.role === "agent") {
                  const calls = last.toolCalls ? [...last.toolCalls] : []
                  calls.push({ name: parsed.name, arguments: parsed.arguments, output: "", stdout: "", stderr: "", files: undefined })
                  msgs[msgs.length - 1] = { ...last, toolCalls: calls }
                }
                return { ...prev, [chatLogKey]: msgs }
              })
              continue
            }

            if (parsed.type === "tool_result") {
              setChatLogs((prev) => {
                const msgs = [...(prev[chatLogKey] ?? [])]
                const last = msgs[msgs.length - 1]
                if (last && last.role === "agent" && last.toolCalls) {
                  const calls = [...last.toolCalls]
                  const idx = calls.length - 1
                  if (idx >= 0) {
                    calls[idx] = { ...calls[idx], output: parsed.output, stdout: parsed.stdout, stderr: parsed.stderr, exitCode: parsed.exitCode, files: parsed.files }
                  }
                  msgs[msgs.length - 1] = { ...last, toolCalls: calls }
                }
                return { ...prev, [chatLogKey]: msgs }
              })
              continue
            }

            if (parsed.type === "done") {
              if (!fullText) fullText = parsed.content || "(no response)"
              setChatLogs((prev) => {
                const msgs = [...(prev[chatLogKey] ?? [])]
                const last = msgs[msgs.length - 1]
                if (last && last.role === "agent") msgs[msgs.length - 1] = { ...last, text: fullText }
                return { ...prev, [chatLogKey]: msgs }
              })
              continue
            }

            // standard OpenAI SSE (no-tools path)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullText += delta
              setChatLogs((prev) => {
                const msgs = [...(prev[chatLogKey] ?? [])]
                const last = msgs[msgs.length - 1]
                if (last && last.role === "agent") msgs[msgs.length - 1] = { ...last, text: fullText }
                return { ...prev, [chatLogKey]: msgs }
              })
            }
          } catch {}
        }
      }

      if (!fullText) {
        setChatLogs((prev) => {
          const msgs = [...(prev[chatLogKey] ?? [])]
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: "(no response)" }
          return { ...prev, [chatLogKey]: msgs }
        })
      }

      if (!chatSentMapRef.current[chatLogKey]) {
        chatSentMapRef.current[chatLogKey] = true
        ;(window as any).__goobsProgressionEvent?.("chat_sent")
      }

      // fire progression events for tool calls from chat
      const writeCount = toolCallsAcc.filter((tc) => tc.name === "write_file").length
      const bashCount = toolCallsAcc.filter((tc) => tc.name === "exec_bash").length
      for (let i = 0; i < writeCount; i++) (window as any).__goobsProgressionEvent?.("tool_write_file")
      for (let i = 0; i < bashCount; i++) (window as any).__goobsProgressionEvent?.("tool_exec_bash")
      const buildPairs = Math.min(writeCount, bashCount)
      for (let i = 0; i < buildPairs; i++) (window as any).__goobsProgressionEvent?.("tool_build_script")

      if (selectedInstanceId) setTaskResult(selectedInstanceId, "celebrate")
    } catch {
      setChatLogs((prev) => ({
        ...prev,
        [chatLogKey]: [...(prev[chatLogKey] ?? []), { role: "agent", text: "*error* Failed to reach agent" }],
      }))
    } finally {
    setSending(false)
  }
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => selectAgent(null)} />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-[500px] flex-col animate-panel-in"
        style={{ paddingTop: "4.5rem", paddingBottom: "0.75rem", paddingRight: "0.75rem" }}
      >
        <div
          className="glass-strong glass-border-accent flex h-full flex-col rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: stateColor, boxShadow: `0 0 8px ${stateColor}40` }} />
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base font-bold text-text truncate">{meta?.name || selectedAgentId}</h3>
              <span className="font-body text-xs text-subtext capitalize">{sending ? "thinking..." : agent.animationState}</span>
            </div>
            <button onClick={() => selectAgent(null)} className="btn-ghost flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs shrink-0">✕</button>
          </div>

          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-2.5 text-[11px] flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="font-body text-subtext/40 uppercase tracking-wider">State</span>
              <span className="font-display text-text capitalize">{agent.animationState}</span>
            </span>
            <span className="text-white/10">·</span>
            <span className="flex items-center gap-1.5">
              <span className="font-body text-subtext/40 uppercase tracking-wider">At</span>
              <span className="font-display text-text">{agent.workstationTarget || "idle"}</span>
            </span>
            {profile && (
              <>
                <span className="text-white/10">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-body text-subtext/40 uppercase tracking-wider">Model</span>
                  <span className="font-display text-text/80 truncate max-w-[120px]">{profile.defaultModel}</span>
                </span>
                <span className="text-white/10">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-body text-subtext/40 uppercase tracking-wider">Skills</span>
                  <span className="font-display text-text/60">{skills.length}</span>
                  <HelpIcon>Skills are markdown knowledge blocks your agent can reference. Add skills in the agent&apos;s edit panel.</HelpIcon>
                </span>
                {skills.length > 0 && (
                  <div className="flex gap-1">
                    {skills.slice(0, 3).map((s, i) => (
                      <span key={i} className="rounded bg-mauve/10 px-1.5 py-0.5 font-body text-[10px] text-mauve/70">
                        {skillName(s)}
                      </span>
                    ))}
                    {skills.length > 3 && <span className="font-body text-[10px] text-subtext/40">+{skills.length - 3}</span>}
                  </div>
                )}
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
                msg.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm bg-blue/20 text-blue">{msg.text}</div>
                  </div>
                ) : (
                  <div key={i} className="flex flex-col gap-2">
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        {msg.toolCalls.map((tc, ti) => (
                          <ToolCallCard key={ti} call={tc} />
                        ))}
                      </div>
                    )}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm bg-white/5 text-text">
                        <Markdown text={msg.text || "*thinking...*"} />
                      </div>
                    </div>
                  </div>
                )
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

export default function WorkshopPage() {
  return (
    <RuntimeStateProvider>
      <WorkshopContent />
    </RuntimeStateProvider>
  )
}
