"use client"

import { Canvas, useThree, useFrame, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Grid, Html } from "@react-three/drei"
import { useRuntimeState } from "./runtime-state-adapter"
import { useCallback, useEffect, useRef } from "react"
import * as THREE from "three"

const WALK_SPEED = 3
const SPAWN_DURATION = 400

function AgentCharacter({
  agentId,
  position,
}: {
  agentId: string
  position: [number, number, number]
}) {
  const { agents, agentMeta, selectAgent, selectedAgentId, setAgentAnimation } = useRuntimeState()
  const groupRef = useRef<THREE.Group>(null)
  const agent = agents.find((a) => a.agentId === agentId)
  const meta = agentMeta[agentId]
  const state = agent?.animationState ?? "idle"
  const isSelected = selectedAgentId === agentId
  const target = agent?.targetPosition
  const entryRef = useRef<number | null>(null)

  if (entryRef.current === null) entryRef.current = Date.now()

  useFrame((_, delta) => {
    if (!groupRef.current || entryRef.current === null) return

    const elapsed = Date.now() - entryRef.current
    if (elapsed < SPAWN_DURATION) {
      const t = Math.min(elapsed / SPAWN_DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      groupRef.current.scale.setScalar(eased)
    } else if (groupRef.current.scale.x < 1) {
      groupRef.current.scale.setScalar(1)
    }

    if (!target) return
    const cur = groupRef.current.position
    const dx = target[0] - cur.x
    const dz = target[2] - cur.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < 0.05) {
      cur.x = target[0]
      cur.z = target[2]
      setAgentAnimation(agentId, "thinking")
      return
    }
    const step = Math.min(WALK_SPEED * delta, dist)
    cur.x += (dx / dist) * step
    cur.z += (dz / dist) * step
  })

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
    <group ref={groupRef} position={[position[0], 0, position[2]]}>
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
      <Html position={[0, 1.2, 0]} center className="pointer-events-none" zIndexRange={[1, 2]}>
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
      <Html position={[0, unlocked ? 0.7 : 0.25, 0]} center className="pointer-events-none" zIndexRange={[1, 2]}>
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

function DropCatcher() {
  const { pendingDrop, clearDrop, spawnAgent, agentMeta, updateAgentMeta } = useRuntimeState()
  const { camera, gl } = useThree()
  const processed = useRef<string | null>(null)

  useEffect(() => {
    if (!pendingDrop) {
      processed.current = null
      return
    }
    if (processed.current === pendingDrop.agentId) return
    processed.current = pendingDrop.agentId

    const rect = gl.domElement.getBoundingClientRect()
    const ndcX = ((pendingDrop.screenX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((pendingDrop.screenY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const point = new THREE.Vector3()
    const hit = raycaster.ray.intersectPlane(plane, point)

    if (hit) {
      spawnAgent(pendingDrop.agentId, [point.x, 0, point.z])
      ;(window as any).__goobsProgressionEvent?.("agent_deployed", pendingDrop.agentId)
      fetch(`/api/agents?id=${pendingDrop.agentId}`)
        .then((r) => r.json())
        .then((a) => {
          updateAgentMeta(pendingDrop.agentId, {
            name: a.name || pendingDrop.agentId,
            color: a.modelColorHex || "#89b4fa",
          })
        })
        .catch(() => {
          updateAgentMeta(pendingDrop.agentId, {
            name: pendingDrop.agentId,
            color: "#89b4fa",
          })
        })
    }
    clearDrop()
  }, [pendingDrop, clearDrop, spawnAgent, camera, gl, agentMeta, updateAgentMeta])

  return null
}

function DropPreview() {
  const { dropPreview, clearDropPreview } = useRuntimeState()
  const { camera, gl } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const pulseRef = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    pulseRef.current += delta * 3
    const scale = 1 + Math.sin(pulseRef.current) * 0.08
    groupRef.current.scale.setScalar(scale)
  })

  if (!dropPreview) return null

  const rect = gl.domElement.getBoundingClientRect()
  const ndcX = ((dropPreview.screenX - rect.left) / rect.width) * 2 - 1
  const ndcY = -((dropPreview.screenY - rect.top) / rect.height) * 2 + 1

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const point = new THREE.Vector3()
  const hit = raycaster.ray.intersectPlane(plane, point)

  if (!hit) return null

  return (
    <group ref={groupRef} position={[point.x, 0, point.z]}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.5, 32]} />
        <meshStandardMaterial
          color="#89b4fa"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshStandardMaterial
          color="#89b4fa"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
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
      <DropCatcher />
      <DropPreview />
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
