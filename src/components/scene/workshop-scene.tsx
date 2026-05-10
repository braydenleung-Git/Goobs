"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Html } from "@react-three/drei"
import { useRuntimeState } from "./runtime-state-adapter"

function AgentCharacter({
  agentId,
  position,
}: {
  agentId: string
  position: [number, number, number]
}) {
  const { agents } = useRuntimeState()
  const agent = agents.find((a) => a.agentId === agentId)
  const state = agent?.animationState ?? "idle"

  const color = state === "celebrate" ? "#22c55e"
    : state === "error" ? "#ef4444"
    : state === "walking" ? "#f59e0b"
    : state === "thinking" ? "#a78bfa"
    : "#4f46e5"

  const height = state === "celebrate" ? 0.8 : 0.6

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh>
        <capsuleGeometry args={[0.3, height, 4, 8]} />
        <meshStandardMaterial color={color} />
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      </mesh>
      <Html position={[0, 1.3, 0]} center className="pointer-events-none">
        <div className="rounded bg-gray-900/80 px-1.5 py-0.5 text-[9px] text-gray-300 whitespace-nowrap">
          {state}
        </div>
      </Html>
    </group>
  )
}

const WORKSTATIONS = [
  { position: [4, 0, 0] as [number, number, number], label: "Computer", color: "#4f46e5" },
  { position: [0, 0, 4] as [number, number, number], label: "Drawing Tablet", color: "#7c3aed" },
  { position: [-4, 0, 0] as [number, number, number], label: "Whiteboard", color: "#059669" },
  { position: [0, 0, -4] as [number, number, number], label: "Book", color: "#d97706" },
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
        <meshStandardMaterial color={unlocked ? color : "#1f2937"} transparent opacity={unlocked ? 1 : 0.3} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.4, unlocked ? 0.3 : 0.1, 0.4]} />
        <meshStandardMaterial color={color} transparent opacity={unlocked ? 0.4 : 0.1} />
      </mesh>
      <Html position={[0, unlocked ? 0.7 : 0.3, 0]} center className="pointer-events-none">
        <div
          className={`rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
            unlocked
              ? "bg-gray-900/80 text-gray-200"
              : "bg-gray-900/40 text-gray-600"
          }`}
        >
          {unlocked ? label : "🔒"}
        </div>
      </Html>
    </group>
  )
}

export function WorkshopScene() {
  const { agents } = useRuntimeState()

  const stored = typeof window !== "undefined" ? localStorage.getItem("goobs-progress") : null
  let unlockedWorkstations: string[] = ["computer"]
  if (stored) {
    try { unlockedWorkstations = JSON.parse(stored).unlockedWorkstations ?? ["computer"] } catch {}
  }

  return (
    <Canvas
      camera={{ position: [8, 8, 8], fov: 50 }}
      gl={{ antialias: true }}
      style={{ height: "100%", width: "100%" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      <Grid
        args={[16, 16]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#374151"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#4B5563"
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
    </Canvas>
  )
}
