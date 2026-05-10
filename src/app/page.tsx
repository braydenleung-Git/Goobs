"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef } from "react"
import { RuntimeStateProvider, useRuntimeState } from "@/components/scene/runtime-state-adapter"
import { ConfigPanels } from "@/components/workshop/config-panels"
import { ChallengeRunnerPanel, type RunResult } from "@/components/workshop/challenge-runner-panel"
import { ProgressAndHistory } from "@/components/workshop/progress-and-history"
import { DemoControls } from "@/components/workshop/demo-controls"

const WorkshopScene = dynamic(
  () => import("@/components/scene/workshop-scene").then((m) => ({ default: m.WorkshopScene })),
  { ssr: false },
)

function WorkshopContent() {
  const { spawnAgent, routeAgent, setAgentAnimation } = useRuntimeState()
  const progressRef = useRef<{ refresh: () => void }>(null)

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((agents: Array<{ id: string; isPrebuilt: boolean }>) => {
        agents.filter((a) => a.isPrebuilt).forEach((a) => spawnAgent(a.id))
      })
      .catch(() => {})
  }, [spawnAgent])

  const handleAgentCreated = useCallback((agentId: string) => {
    spawnAgent(agentId)
  }, [spawnAgent])

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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-950 text-gray-100">
      <header className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <h1 className="text-lg font-bold tracking-tight">
          Goobs <span className="text-xs font-normal text-gray-500">The Agent Workshop</span>
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto border-r border-gray-800 p-4">
          <ConfigPanels onAgentCreated={handleAgentCreated} />
          <ChallengeRunnerPanel onRunStart={handleRunStart} onRunComplete={handleRunComplete} />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex-1">
            <WorkshopScene />
          </div>
          <div className="flex gap-4 border-t border-gray-800 p-2">
            <div className="w-72">
              <ProgressAndHistory ref={progressRef} />
            </div>
            <div className="flex-1">
              <DemoControls />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkshopPage() {
  return (
    <RuntimeStateProvider>
      <WorkshopContent />
    </RuntimeStateProvider>
  )
}
