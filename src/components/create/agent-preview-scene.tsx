"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import { FBXModelLoader } from "@/components/3d/fbx-model-loader"

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
  easter_egg: "67",
}

interface Props {
  skinColor: string
  shirtColor: string
  pantsColor: string
}

export function AgentPreviewScene({ skinColor, shirtColor, pantsColor }: Props) {
  const materialColors = { skin: skinColor, shirt: shirtColor, pants: pantsColor }
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl">
      <Canvas
        camera={{ position: [1.5, 1.2, 2], fov: 35 }}
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

        <FBXModelLoader
          url="/3d/goobs.fbx"
          scale={[0.0025, 0.0025, 0.0025]}
          position={[0, -0.2, 0]}
          animationState="idle"
          materialColors={materialColors}
          animationMapping={ANIMATION_MAPPING}
        />

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
