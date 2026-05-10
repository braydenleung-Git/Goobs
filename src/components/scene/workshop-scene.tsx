"use client"

import { Canvas, useThree, useFrame, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Grid, Html } from "@react-three/drei"
import { useRuntimeState } from "./runtime-state-adapter"
import { useCallback, useEffect, useRef } from "react"
import * as THREE from "three"
import { FBXModelLoader } from "../3d/fbx-model-loader"

const WALK_SPEED = 3
const SPAWN_DURATION = 400
const IDLE_LONG_THRESHOLD = 60000 // 1 minute in milliseconds
const SITTING_TO_WORKING_DURATION = 1500 // 1.5 seconds for 30-frame sitting animation at 24 FPS
const REVERSE_SITTING_DURATION = 1500 // 1.5 seconds for reverse sitting animation
const TASK_COMPLETION_CHECK_INTERVAL = 5000 // Check for task completion every 5 seconds while working
const IDLE_TO_STAND_CHANCE = 0.01 // 10% chance per frame to transition from idle to stand
const STAND_TO_EASTER_EGG_DURATION = 2000 // 2 seconds before transitioning from stand to easter_egg
const EASTER_EGG_DURATION = 3000 // 3 seconds for easter egg animation before returning to idle

// Custom animation mapping for FBX model NLA strips
const ANIMATION_MAPPING = {
  stand: "No_Pose",
  idle: "Idle",
  walking: "Walking",    
  sitting: "Sitting_Transition",
  working: "Working",
  celebrate: "Finish_Task_1",
  attention_start: "Attention_Start",     
  attention_loop: "Attention_Loop",    
  idle_long: "lying_down_transistion",
  easter_egg: "67"
}

function AgentCharacter({
  agentId,
  instanceId,
  position,
}: {
  agentId: string
  instanceId: string
  position: [number, number, number]
}) {
  const { agents, agentMeta, selectAgent, selectedInstanceId, setAgentAnimation } = useRuntimeState()
  const groupRef = useRef<THREE.Group>(null)
  const agent = agents.find((a) => a.instanceId === instanceId)
  const meta = agentMeta[agentId]
  const state = agent?.animationState ?? "idle"
  const isSelected = selectedInstanceId === instanceId
  const target = agent?.targetPosition
  const entryRef = useRef<number | null>(null)
  const idleStartTimeRef = useRef<number | null>(null)
  const lastStateRef = useRef<string>(state)
  const wasIdleLongRef = useRef<boolean>(false)
  const sittingStartTimeRef = useRef<number | null>(null)
  const workingStartTimeRef = useRef<number | null>(null)
  const reverseSittingStartTimeRef = useRef<number | null>(null)
  const taskCompletedRef = useRef<boolean>(false)
  const standStartTimeRef = useRef<number | null>(null)
  const idleRandomCheckRef = useRef<number>(0)
  const easterEggStartTimeRef = useRef<number | null>(null)

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

    // Track state changes and timers
    if (state !== lastStateRef.current) {
      // State changed, reset tracking
      wasIdleLongRef.current = lastStateRef.current === "idle_long"
      lastStateRef.current = state
      
      // Reset idle tracking
      if (state === "idle") {
        idleStartTimeRef.current = Date.now()
        taskCompletedRef.current = false
      } else {
        idleStartTimeRef.current = null
      }
      
      // Reset sitting tracking
      if (state === "sitting") {
        sittingStartTimeRef.current = Date.now()
      } else {
        sittingStartTimeRef.current = null
      }
      
      // Reset working tracking
      if (state === "working") {
        workingStartTimeRef.current = Date.now()
      } else {
        workingStartTimeRef.current = null
      }
      
      // Reset reverse sitting tracking
      if (state === "sitting" && lastStateRef.current === "working") {
        reverseSittingStartTimeRef.current = Date.now()
      } else if (state !== "sitting") {
        reverseSittingStartTimeRef.current = null
      }
      
      // Reset stand tracking
      if (state === "stand") {
        standStartTimeRef.current = Date.now()
      } else {
        standStartTimeRef.current = null
      }
      
      // Reset easter egg tracking
      if (state === "easter_egg") {
        easterEggStartTimeRef.current = Date.now()
      } else {
        easterEggStartTimeRef.current = null
      }
      
      // Reset idle random check when leaving idle
      if (state !== "idle") {
        idleRandomCheckRef.current = 0
      }
    }

    // Handle idle to idle_long transition
    if (state === "idle" && idleStartTimeRef.current) {
      const idleDuration = Date.now() - idleStartTimeRef.current
      if (idleDuration >= IDLE_LONG_THRESHOLD) {
        setAgentAnimation(agentId, "idle_long")
        idleStartTimeRef.current = null
      }
    }

    // Handle random idle to stand transition (only if not lying down)
    if (state === "idle" && !wasIdleLongRef.current) {
      idleRandomCheckRef.current += delta
      // Check every second to reduce performance impact
      if (idleRandomCheckRef.current >= 1) {
        idleRandomCheckRef.current = 0
        if (Math.random() < IDLE_TO_STAND_CHANCE) {
          setAgentAnimation(agentId, "stand")
        }
      }
    }

    // Handle stand to easter_egg transition
    if (state === "stand" && standStartTimeRef.current) {
      const standDuration = Date.now() - standStartTimeRef.current
      if (standDuration >= STAND_TO_EASTER_EGG_DURATION) {
        setAgentAnimation(agentId, "easter_egg")
        standStartTimeRef.current = null
      }
    }

    // Handle easter_egg to idle transition
    if (state === "easter_egg" && easterEggStartTimeRef.current) {
      const easterEggDuration = Date.now() - easterEggStartTimeRef.current
      if (easterEggDuration >= EASTER_EGG_DURATION) {
        setAgentAnimation(agentId, "idle")
        easterEggStartTimeRef.current = null
      }
    }

    // Handle sitting to working transition
    if (state === "sitting" && sittingStartTimeRef.current && !reverseSittingStartTimeRef.current) {
      const sittingDuration = Date.now() - sittingStartTimeRef.current
      if (sittingDuration >= SITTING_TO_WORKING_DURATION) {
        setAgentAnimation(agentId, "working")
        sittingStartTimeRef.current = null
      }
    }

    // Handle task completion detection while working
    if (state === "working" && workingStartTimeRef.current && !taskCompletedRef.current) {
      const workingDuration = Date.now() - workingStartTimeRef.current
      // Simulate task completion after 10 seconds of working
      if (workingDuration >= 10000) {
        taskCompletedRef.current = true
        setAgentAnimation(agentId, "sitting") // Start reverse sitting
      }
    }

    // Handle reverse sitting to celebration transition
    if (state === "sitting" && reverseSittingStartTimeRef.current) {
      const reverseSittingDuration = Date.now() - reverseSittingStartTimeRef.current
      if (reverseSittingDuration >= REVERSE_SITTING_DURATION) {
        setAgentAnimation(agentId, "celebrate")
        reverseSittingStartTimeRef.current = null
      }
    }

    if (!target) return
    const cur = groupRef.current.position
    const dx = target[0] - cur.x
    const dz = target[2] - cur.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < 0.05) {
      cur.x = target[0]
      cur.z = target[2]
      setAgentAnimation(agentId, "sitting")
      return
    }
    const step = Math.min(WALK_SPEED * delta, dist)
    cur.x += (dx / dist) * step
    cur.z += (dz / dist) * step
  })

  //TODO: modify the states color
  const color = state === "celebrate" ? "#a6e3a1"
    : state === "error" ? "#f38ba8"
    : state === "walking" ? "#fab387"
    : state === "thinking" ? "#cba6f7"
    : state === "working" ? "#f9e2af"
    : state === "sitting" ? "#94e2d5"
    : state === "stand" ? "#b4befe"
    : state === "easter_egg" ? "#f5c2e7"
    : meta?.color ?? "#89b4fa"

  const materialColors = meta?.colors ?? { skin: "#f5c2e7", shirt: "#89b4fa", pants: "#6c7086" }

  const height = state === "celebrate" ? 0.8 : 0.6

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectAgent(instanceId)
  }, [instanceId, selectAgent])

  return (
    <group ref={groupRef} position={[position[0], 0, position[2]]}>
      <FBXModelLoader
        url="/3d/goobs.fbx"
        scale={[0.0025, 0.0025, 0.0025]}
        position={[0, 0, 0]}
        animationState={state}
        materialColors={materialColors}
        onClick={handleClick}
        animationMapping={ANIMATION_MAPPING}
        holdLastFrame={state === "idle_long" || state === "sitting"}
        playReverse={(wasIdleLongRef.current && state !== "idle_long") || (reverseSittingStartTimeRef.current !== null)}
      />
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
  const isComputer = label === "Computer"

  return (
    <group position={[position[0], 0.01, position[2]]}>
      {isComputer ? (
        <FBXModelLoader
          url="/3d/table.fbx"
          scale={[0.0025, 0.0025, 0.0025]}
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          materialColors={{ skin: "#d4a574", shirt: "#d4a574", pants: "#d4a574" }}
        />
      ) : (
        <>
          <mesh>
            <boxGeometry args={[0.6, 0.02, 0.6]} />
            <meshStandardMaterial color={unlocked ? color : "#45475a"} transparent opacity={unlocked ? 0.8 : 0.2} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.4, unlocked ? 0.25 : 0.08, 0.4]} />
            <meshStandardMaterial color={color} transparent opacity={unlocked ? 0.3 : 0.05} />
          </mesh>
        </>
      )}
      <Html position={[0, isComputer ? 1.2 : (unlocked ? 0.7 : 0.25), 0]} center className="pointer-events-none" zIndexRange={[1, 2]}>
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
            colors: (() => { try { return JSON.parse(a.modelColorsJson || "{}") } catch { return undefined } })(),
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
          key={a.instanceId}
          agentId={a.agentId}
          instanceId={a.instanceId}
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
