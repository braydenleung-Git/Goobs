"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import { RuntimeStateProvider, useRuntimeState } from "@/components/scene/runtime-state-adapter"
import { TopNav, type TabId } from "@/components/layout/top-nav"
import { AgentSidebar } from "@/components/layout/agent-sidebar"
import { CreateAgentForm } from "@/components/create/create-agent-form"
import { AgentPreviewScene } from "@/components/create/agent-preview-scene"
import { ConfigPanels } from "@/components/workshop/config-panels"
import { ChallengeRunnerPanel, type RunResult } from "@/components/workshop/challenge-runner-panel"
import { ProgressAndHistory } from "@/components/workshop/progress-and-history"
import { DemoControls } from "@/components/workshop/demo-controls"

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
    setAgentAnimation(agentId, "walking")
    setTimeout(() => {
      routeAgent(agentId, workstationTarget)
    }, 200)
    setTimeout(() => {
      setAgentAnimation(agentId, "thinking")
    }, 1500)
  }, [setAgentAnimation, routeAgent])

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
          <div className="flex h-full gap-4 p-4" style={{ paddingTop: "1rem" }}>
            <div className="flex-1 overflow-y-auto">
              <div className="glass-strong glass-border-accent mx-auto max-w-lg rounded-2xl p-6">
                <CreateAgentForm onAgentCreated={handleAgentCreated} />
              </div>
            </div>

            <div className="hidden w-[45%] lg:block">
              <AgentPreviewScene color={previewColor} />
            </div>
          </div>
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

export default function WorkshopPage() {
  return (
    <RuntimeStateProvider>
      <WorkshopContent />
    </RuntimeStateProvider>
  )
}
