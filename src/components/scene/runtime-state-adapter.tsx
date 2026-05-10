"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type AnimationState = "idle" | "thinking" | "typing" | "celebrate" | "error" | "walking"

export interface AgentSceneState {
  agentId: string
  animationState: AnimationState
  workstationTarget?: string
  position: [number, number, number]
}

interface AgentMeta {
  name: string
  color: string
}

interface RuntimeState {
  agents: AgentSceneState[]
  selectedAgentId: string | null
  agentMeta: Record<string, AgentMeta>
  setAgentAnimation: (agentId: string, state: AnimationState) => void
  routeAgent: (agentId: string, workstationId: string) => void
  spawnAgent: (agentId: string) => void
  clearScene: () => void
  selectAgent: (agentId: string | null) => void
  updateAgentMeta: (agentId: string, meta: AgentMeta) => void
}

const RuntimeStateContext = createContext<RuntimeState | null>(null)

const WORKSTATION_POSITIONS: Record<string, [number, number, number]> = {
  computer: [4, 0, 0],
  "drawing-tablet": [0, 0, 4],
  whiteboard: [-4, 0, 0],
  book: [0, 0, -4],
}

let spawnIndex = 0

export function RuntimeStateProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<AgentSceneState[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [agentMeta, setAgentMeta] = useState<Record<string, AgentMeta>>({})

  const spawnAgent = useCallback((agentId: string) => {
    const index = spawnIndex++
    const pos: [number, number, number] = [index * 1.5 - 2, 0, 0]
    setAgents((prev) => [
      ...prev,
      { agentId, animationState: "idle", position: pos },
    ])
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
          ? { ...a, workstationTarget: workstationId, position: target, animationState: "walking" }
          : a,
      ),
    )
  }, [])

  const clearScene = useCallback(() => {
    setAgents([])
    setSelectedAgentId(null)
    spawnIndex = 0
  }, [])

  const selectAgent = useCallback((agentId: string | null) => {
    setSelectedAgentId(agentId)
  }, [])

  const updateAgentMeta = useCallback((agentId: string, meta: AgentMeta) => {
    setAgentMeta((prev) => ({ ...prev, [agentId]: meta }))
  }, [])

  return (
    <RuntimeStateContext.Provider
      value={{
        agents,
        selectedAgentId,
        agentMeta,
        setAgentAnimation,
        routeAgent,
        spawnAgent,
        clearScene,
        selectAgent,
        updateAgentMeta,
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
