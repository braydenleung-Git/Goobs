"use client"

import { Canvas, useThree, useFrame, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Grid, Html } from "@react-three/drei"
import { useRuntimeState } from "./runtime-state-adapter"
import { useCallback, useEffect, useRef } from "react"
import * as THREE from "three"
import { FBXModelLoader } from "../3d/fbx-model-loader"

const WALK_SPEED = 3
const SPAWN_DURATION = 400
const IDLE_LONG_DELAY = 60000

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
  thinking: "Attention_Loop",
  error: "No_Pose",
  typing: "Working",
  easter_egg: "67",
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
  const { agents, agentMeta, selectAgent, selectedInstanceId, setInstanceAnimation, setInstancePosition, setTargetPosition } = useRuntimeState()
  const groupRef = useRef<THREE.Group>(null)
  const agent = agents.find((a) => a.instanceId === instanceId)
  const meta = agentMeta[agentId]
  const state = agent?.animationState ?? "idle"
  const isSelected = selectedInstanceId === instanceId
  const target = agent?.targetPosition
  const entryRef = useRef<number | null>(null)
  const originalPositionRef = useRef(position)

  const stateRef = useRef(state)
  stateRef.current = state

  const pendingStateRef = useRef<string | null>(null)
  const idleLongInterruptedRef = useRef(false)
  const prevSelectedRef = useRef(isSelected)
  const arrivedRef = useRef(false)
  const returningHomeRef = useRef(false)
  const posThrottleRef = useRef(0)

  if (entryRef.current === null) entryRef.current = Date.now()

  const isOneShot = !["idle", "walking", "working", "attention_loop", "thinking", "stand", "typing"].includes(state)
  const playReverse = pendingStateRef.current !== null && state === "idle_long"

  // Click handler
  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectAgent(instanceId)
  }, [instanceId, selectAgent])

  // Selection → attention chain
  useEffect(() => {
    if (isSelected && !prevSelectedRef.current) {
      const s = stateRef.current
      if (s === "idle_long") {
        idleLongInterruptedRef.current = true
        pendingStateRef.current = "attention_start"
        setInstanceAnimation(instanceId, "idle_long")
      } else if (s !== "walking" && s !== "sitting" && s !== "working") {
        setInstanceAnimation(instanceId, "attention_start")
      }
    } else if (!isSelected && prevSelectedRef.current) {
      const s = stateRef.current
      if (s === "attention_start" || s === "attention_loop") {
        setInstanceAnimation(instanceId, "idle")
      }
    }
    prevSelectedRef.current = isSelected
  }, [isSelected, instanceId, setInstanceAnimation])

  // Idle → idle_long timer
  useEffect(() => {
    if (state === "idle") {
      const timer = setTimeout(() => {
        setInstanceAnimation(instanceId, "idle_long")
      }, IDLE_LONG_DELAY)
      return () => clearTimeout(timer)
    }
  }, [state, instanceId, setInstanceAnimation])

  // Animation chaining via onAnimationFinished
  // Sitting → working is NOT auto-chained — working is set externally by challenges/tools
  const handleAnimationFinished = useCallback((finishedState: string) => {
    if (pendingStateRef.current) {
      const next = pendingStateRef.current
      pendingStateRef.current = null
      idleLongInterruptedRef.current = false
      setInstanceAnimation(instanceId, next as any)
      return
    }
    if (finishedState === "attention_start") {
      setInstanceAnimation(instanceId, "attention_loop")
    } else if (finishedState === "celebrate" || finishedState === "error") {
      setTargetPosition(instanceId, originalPositionRef.current)
      returningHomeRef.current = true
      arrivedRef.current = false
      setInstanceAnimation(instanceId, "walking")
    }
  }, [instanceId, setInstanceAnimation, setTargetPosition])

  // Movement + rotation + spawn scale + throttled position updates
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
      if (!arrivedRef.current) {
        cur.x = target[0]
        cur.z = target[2]
        arrivedRef.current = true
        if (returningHomeRef.current) {
          returningHomeRef.current = false
          setInstanceAnimation(instanceId, "idle")
        } else {
          setInstanceAnimation(instanceId, "sitting")
        }
        setInstancePosition(instanceId, [cur.x, 0, cur.z])
      }
      return
    }
    arrivedRef.current = false

    // Smooth rotation toward movement direction
    const angle = Math.atan2(dx, dz)
    let diff = angle - groupRef.current.rotation.y
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    groupRef.current.rotation.y += diff * Math.min(1, 8 * delta)

    const step = Math.min(WALK_SPEED * delta, dist)
    cur.x += (dx / dist) * step
    cur.z += (dz / dist) * step

    // Throttled position updates for camera tracking
    posThrottleRef.current += delta
    if (posThrottleRef.current >= 0.15) {
      posThrottleRef.current = 0
      setInstancePosition(instanceId, [cur.x, 0, cur.z])
    }
  })

  const color = state === "celebrate" ? "#a6e3a1"
    : state === "error" ? "#f38ba8"
    : state === "walking" ? "#fab387"
    : state === "thinking" ? "#cba6f7"
    : state === "working" ? "#f9e2af"
    : state === "sitting" ? "#94e2d5"
    : state === "stand" ? "#b4befe"
    : state === "easter_egg" ? "#f5c2e7"
    : state === "attention_start" || state === "attention_loop" ? "#b4befe"
    : meta?.color ?? "#89b4fa"

  const materialColors = meta?.colors ?? { skin: "#f5c2e7", shirt: "#89b4fa", pants: "#6c7086" }

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
        loop={!isOneShot}
        holdLastFrame={state === "idle_long" || state === "sitting"}
        playReverse={playReverse}
        onAnimationFinished={handleAnimationFinished}
      />
      {isSelected && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
}: {
  position: [number, number, number]
  label: string
  color: string
}) {
  const rotation: [number, number, number] = label === "Computer" ? [0, Math.PI / 2, 0]
    : label === "Drawing Tablet" ? [0, 0, 0]
    : label === "Whiteboard" ? [0, -Math.PI / 4, 0]
    : [0, Math.PI / 4, 0]

  return (
    <group position={[position[0], 0.01, position[2]]}>
      <FBXModelLoader
        url="/3d/table.fbx"
        scale={[0.0025, 0.0025, 0.0025]}
        position={[0, 0, 0]}
        rotation={rotation}
        materialColors={{ skin: color, shirt: color, pants: color }}
      />
      <Html position={[0, 1.2, 0]} center className="pointer-events-none" zIndexRange={[1, 2]}>
        <div
          className="rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold whitespace-nowrap text-text/80"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}20`,
          }}
        >
          {label}
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

function CameraController({ controlsRef }: { controlsRef: React.MutableRefObject<any> }) {
  const { selectedInstanceId, agents } = useRuntimeState()
  const { camera } = useThree()

  useFrame(() => {
    const ctrl = controlsRef.current
    if (!ctrl?.target) return
    const agent = selectedInstanceId ? agents.find((a) => a.instanceId === selectedInstanceId) : undefined

    if (agent) {
      ctrl.autoRotate = false
      const tx = agent.position[0]
      const tz = agent.position[2]
      ctrl.target.lerp(new THREE.Vector3(tx, 0.4, tz), 0.06)
      camera.position.lerp(new THREE.Vector3(tx + 3, 3.5, tz + 3), 0.06)
    } else {
      ctrl.autoRotate = true
      ctrl.target.lerp(new THREE.Vector3(0, 0.4, 0), 0.02)
    }
    ctrl.update()
  })

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
  const controlsRef = useRef<any>(null)

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
      <CameraController controlsRef={controlsRef} />
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
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  )
}
