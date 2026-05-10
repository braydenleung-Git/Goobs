"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import { useRuntimeState } from "./runtime-state-adapter"

function AgentCharacter({
  agentId,
  position,
  color,
}: {
  agentId: string
  position: [number, number, number]
  color: string
}) {
  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh>
        <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  )
}

function WorkstationMarker({
  position,
  label,
}: {
  position: [number, number, number]
  label: string
}) {
  return (
    <group position={[position[0], 0.01, position[2]]}>
      <mesh>
        <boxGeometry args={[0.6, 0.02, 0.6]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <meshStandardMaterial color="#4f46e5" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export function WorkshopScene() {
  const { agents } = useRuntimeState()

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

      <WorkstationMarker position={[4, 0, 0]} label="Computer" />
      <WorkstationMarker position={[0, 0, 4]} label="Drawing Tablet" />
      <WorkstationMarker position={[-4, 0, 0]} label="Whiteboard" />
      <WorkstationMarker position={[0, 0, -4]} label="Book" />

      {agents.map((a) => (
        <AgentCharacter
          key={a.agentId}
          agentId={a.agentId}
          position={a.position}
          color="#4f46e5"
        />
      ))}
    </Canvas>
  )
}
