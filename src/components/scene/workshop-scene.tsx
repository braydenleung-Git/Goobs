"use client"

import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Grid, Html } from "@react-three/drei"
import { useRuntimeState } from "./runtime-state-adapter"
import { useCallback } from "react"

function AgentCharacter({
  agentId,
  position,
}: {
  agentId: string
  position: [number, number, number]
}) {
  const { agents, agentMeta, selectAgent, selectedAgentId } = useRuntimeState()
  const agent = agents.find((a) => a.agentId === agentId)
  const meta = agentMeta[agentId]
  const state = agent?.animationState ?? "idle"
  const isSelected = selectedAgentId === agentId

  const color = state === "celebrate" ? "#a6e3a1"
    : state === "error" ? "#f38ba8"
    : state === "walking" ? "#fab387"
    : state === "thinking" ? "#cba6f7"
    : meta?.color ?? "#89b4fa"

  const height = state === "celebrate" ? 0.8 : 0.6

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectAgent(agentId)
  }, [agentId, selectAgent])

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh onClick={handleClick}>
        <capsuleGeometry args={[0.3, height, 4, 8]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={isSelected ? 1 : 0.85}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]} onClick={handleClick}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {isSelected && (
        <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 32]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.4}
            side={2}
          />
        </mesh>
      )}
      <Html position={[0, 1.2, 0]} center className="pointer-events-none">
        <div
          className="rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold whitespace-nowrap"
          style={{
            background: `${color}20`,
            color,
            border: `1px solid ${color}30`,
          }}
        >
          {meta?.name || state}
        </div>
      </Html>
    </group>
  )
}

const WORKSTATIONS = [
  { position: [4, 0, 0] as [number, number, number], label: "Computer", color: "#89b4fa" },
  { position: [0, 0, 4] as [number, number, number], label: "Drawing Tablet", color: "#cba6f7" },
  { position: [-4, 0, 0] as [number, number, number], label: "Whiteboard", color: "#a6e3a1" },
  { position: [0, 0, -4] as [number, number, number], label: "Book", color: "#fab387" },
]

function WorkstationMarker({
  position,
  label,
  color,
  unlockedWorkstations,
}: {
  position: [number, number, number]
  label: string
  color: string
  unlockedWorkstations: string[]
}) {
  const unlockKey = label.toLowerCase().replace(/\s+/g, "-")
  const unlocked = unlockKey === "computer" || unlockedWorkstations.includes(unlockKey)

  return (
    <group position={[position[0], 0.01, position[2]]}>
      <mesh>
        <boxGeometry args={[0.6, 0.02, 0.6]} />
        <meshStandardMaterial color={unlocked ? color : "#45475a"} transparent opacity={unlocked ? 0.8 : 0.2} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.4, unlocked ? 0.25 : 0.08, 0.4]} />
        <meshStandardMaterial color={color} transparent opacity={unlocked ? 0.3 : 0.05} />
      </mesh>
      <Html position={[0, unlocked ? 0.7 : 0.25, 0]} center className="pointer-events-none">
        <div
          className={`rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold whitespace-nowrap ${
            unlocked
              ? "text-text/80"
              : "text-subtext/30"
          }`}
          style={{
            background: unlocked ? `${color}15` : "rgba(69, 71, 90, 0.2)",
            border: unlocked ? `1px solid ${color}20` : "1px solid rgba(69, 71, 90, 0.1)",
          }}
        >
          {unlocked ? label : ""}
        </div>
      </Html>
    </group>
  )
}

function SceneClickCatcher() {
  const { selectAgent } = useRuntimeState()
  const { gl } = useThree()

  const handlePointerDown = useCallback(() => {
    selectAgent(null)
  }, [selectAgent])

  gl.domElement.addEventListener("pointerdown", handlePointerDown)
  return null
}

export function WorkshopScene() {
  const { agents, agentMeta } = useRuntimeState()

  const stored = typeof window !== "undefined" ? localStorage.getItem("goobs-progress") : null
  let unlockedWorkstations: string[] = ["computer"]
  if (stored) {
    try { unlockedWorkstations = JSON.parse(stored).unlockedWorkstations ?? ["computer"] } catch {}
  }

  return (
    <Canvas
      camera={{ position: [8, 8, 8], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#1e1e2e")
      }}
    >
      <SceneClickCatcher />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.7} />
      <directionalLight position={[-5, 5, -5]} intensity={0.2} />
      <pointLight position={[0, 5, 0]} intensity={0.2} color="#cba6f7" />

      <Grid
        args={[16, 16]}
        cellSize={0.5}
        cellThickness={0.3}
        cellColor="#45475a"
        sectionSize={2}
        sectionThickness={0.6}
        sectionColor="#585b70"
        fadeDistance={30}
      />

      {WORKSTATIONS.map((ws) => (
        <WorkstationMarker
          key={ws.label}
          position={ws.position}
          label={ws.label}
          color={ws.color}
          unlockedWorkstations={unlockedWorkstations}
        />
      ))}

      {agents.map((a) => (
        <AgentCharacter
          key={a.agentId}
          agentId={a.agentId}
          position={a.position}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  )
}
