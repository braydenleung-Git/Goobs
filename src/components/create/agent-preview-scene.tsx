"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"

function PlaceholderAgent({ color }: { color: string }) {
  return (
    <group position={[0, 0.3, 0]}>
      <mesh>
        <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.9, 0.22]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <group position={[0, -0.1, 0]}>
        <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
      <group position={[0, 0.5, -0.35]}>
        <mesh position={[-0.18, 0, 0]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.18, 0, 0]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  )
}

function FloatingHat({ color }: { color: string }) {
  return (
    <group position={[0, 1.2, 0]}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.35, 0.04, 0.35]} />
        <meshStandardMaterial color={color} opacity={0.6} transparent />
      </mesh>
      <mesh position={[0, 0.2, -0.05]}>
        <boxGeometry args={[0.05, 0.2, 0.2]} />
        <meshStandardMaterial color={color} opacity={0.4} transparent />
      </mesh>
    </group>
  )
}

interface Props {
  color: string
}

export function AgentPreviewScene({ color }: Props) {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl">
      <Canvas
        camera={{ position: [2.5, 2, 3.5], fov: 35 }}
        gl={{ antialias: true }}
        style={{ height: "100%", width: "100%" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#1e1e2e")
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={0.8} />
        <directionalLight position={[-2, 3, -2]} intensity={0.3} />
        <pointLight position={[0, 2, 0]} intensity={0.3} color="#cba6f7" />

        <Grid
          args={[4, 4]}
          cellSize={0.5}
          cellThickness={0.3}
          cellColor="#45475a"
          sectionSize={1}
          sectionThickness={0.5}
          sectionColor="#585b70"
          fadeDistance={8}
          position={[0, -0.01, 0]}
        />

        <PlaceholderAgent color={color} />
        <FloatingHat color={color} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2.5}
          autoRotate
          autoRotateSpeed={3}
        />
      </Canvas>
    </div>
  )
}
