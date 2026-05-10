"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type AnimationState = "idle" | "thinking" | "typing" | "celebrate" | "error" | "walking" | "idle_long" | "sitting" | "working" | "stand" | "easter_egg"

export interface AgentSceneState {
  instanceId: string
  agentId: string
  animationState: AnimationState
  workstationTarget?: string
  position: [number, number, number]
  targetPosition?: [number, number, number]
}

interface AgentMeta {
  name: string
  color: string
}

interface RuntimeState {
  agents: AgentSceneState[]
  selectedInstanceId: string | null
  selectedAgentId: string | null
  agentMeta: Record<string, AgentMeta>
  pendingDrop: { agentId: string; screenX: number; screenY: number } | null
  dropPreview: { screenX: number; screenY: number } | null
  setAgentAnimation: (agentId: string, state: AnimationState) => void
  routeAgent: (agentId: string, workstationId: string) => void
  spawnAgent: (agentId: string, position?: [number, number, number]) => void
  clearScene: () => void
  selectAgent: (instanceId: string | null) => void
  updateAgentMeta: (agentId: string, meta: AgentMeta) => void
  requestDrop: (agentId: string, screenX: number, screenY: number) => void
  clearDrop: () => void
  setDropPreview: (screenX: number, screenY: number) => void
  clearDropPreview: () => void
}

const RuntimeStateContext = createContext<RuntimeState | null>(null)

const WORKSTATION_POSITIONS: Record<string, [number, number, number]> = {
  computer: [4, 0, 0],
  "drawing-tablet": [0, 0, 4],
  whiteboard: [-4, 0, 0],
  book: [0, 0, -4],
}

let spawnIndex = 0
let instanceCounter = 0

export function RuntimeStateProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<AgentSceneState[]>([])
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)
  const [agentMeta, setAgentMeta] = useState<Record<string, AgentMeta>>({})
  const [pendingDrop, setPendingDrop] = useState<{ agentId: string; screenX: number; screenY: number } | null>(null)
  const [dropPreview, setDropPreviewState] = useState<{ screenX: number; screenY: number } | null>(null)

  const selectedAgentId = selectedInstanceId
    ? agents.find((a) => a.instanceId === selectedInstanceId)?.agentId ?? null
    : null

  const spawnAgent = useCallback((agentId: string, position?: [number, number, number]) => {
    const instanceId = `${agentId}::${instanceCounter++}`
    if (position) {
      setAgents((prev) => [
        ...prev,
        { instanceId, agentId, animationState: "idle", position },
      ])
    } else {
      const index = spawnIndex++
      const pos: [number, number, number] = [index * 1.5 - 2, 0, 0]
      setAgents((prev) => [
        ...prev,
        { instanceId, agentId, animationState: "idle", position: pos },
      ])
    }
  }, [])

  const setAgentAnimation = useCallback((agentId: string, state: AnimationState) => {
    setAgents((prev) =>
      prev.map((a) => (a.agentId === agentId ? { ...a, animationState: state } : a)),
    )
  }, [])

  const routeAgent = useCallback((agentId: string, workstationId: string) => {
    const target = WORKSTATION_POSITIONS[workstationId]
    if (!target) return
    setAgents((prev) =>
      prev.map((a) =>
        a.agentId === agentId
          ? { ...a, workstationTarget: workstationId, targetPosition: target, animationState: "walking" }
          : a,
      ),
    )
  }, [])

  const clearScene = useCallback(() => {
    setAgents([])
    setSelectedInstanceId(null)
    spawnIndex = 0
    instanceCounter = 0
  }, [])

  const selectAgent = useCallback((instanceId: string | null) => {
    setSelectedInstanceId(instanceId)
  }, [])

  const updateAgentMeta = useCallback((agentId: string, meta: AgentMeta) => {
    setAgentMeta((prev) => ({ ...prev, [agentId]: meta }))
  }, [])

  const requestDrop = useCallback((agentId: string, screenX: number, screenY: number) => {
    setPendingDrop({ agentId, screenX, screenY })
  }, [])

  const clearDrop = useCallback(() => {
    setPendingDrop(null)
  }, [])

  const setDropPreview = useCallback((screenX: number, screenY: number) => {
    setDropPreviewState({ screenX, screenY })
  }, [])

  const clearDropPreview = useCallback(() => {
    setDropPreviewState(null)
  }, [])

  return (
    <RuntimeStateContext.Provider
      value={{
        agents,
        selectedInstanceId,
        selectedAgentId,
        agentMeta,
        pendingDrop,
        dropPreview,
        setAgentAnimation,
        routeAgent,
        spawnAgent,
        clearScene,
        selectAgent,
        updateAgentMeta,
        requestDrop,
        clearDrop,
        setDropPreview,
        clearDropPreview,
      }}
    >
      {children}
    </RuntimeStateContext.Provider>
  )
}

export function useRuntimeState() {
  const ctx = useContext(RuntimeStateContext)
  if (!ctx) throw new Error("useRuntimeState must be used within RuntimeStateProvider")
  return ctx
}
