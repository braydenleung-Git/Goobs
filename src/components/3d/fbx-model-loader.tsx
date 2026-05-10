"use client"

import { useFrame, type ThreeEvent } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { FBXLoader } from "three-stdlib"

interface AnimationMapping {
  [key: string]: string
}

interface FBXModelLoaderProps {
  url: string
  position?: [number, number, number]
  scale?: [number, number, number]
  rotation?: [number, number, number]
  animationState?: string
  materialColors?: Record<string, string>
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  animationMapping?: AnimationMapping
  holdLastFrame?: boolean
  playReverse?: boolean
}

export function FBXModelLoader({ 
  url, 
  position = [0, 0, 0], 
  scale = [1, 1, 1], 
  rotation = [0, 0, 0],
  animationState = "idle",
  materialColors,
  onClick,
  animationMapping,
  holdLastFrame = false,
  playReverse = false
}: FBXModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const animationsRef = useRef<THREE.AnimationClip[]>([])
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const activeActionRef = useRef<THREE.AnimationAction | null>(null)

  useEffect(() => {
    const loader = new FBXLoader()
    loader.load(url, (fbx) => {
      // Scale and position the model
      fbx.scale.set(...scale)
      fbx.position.set(...position)
      fbx.rotation.set(...rotation)

      // Apply colors by material name
      if (materialColors) {
        fbx.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material
            if (mat) {
              const matName = ((mat as any).name || "").trim()
              const lower = matName.toLowerCase()
              if (typeof window !== "undefined" && !(window as any).__fbxMaterialsLogged) {
                console.log("FBX material:", matName)
              }
              let match: string | undefined
              if (lower === "skin") match = materialColors.skin
              else if (lower === "shirt") match = materialColors.shirt
              else if (lower === "pants") match = materialColors.pants
              if (match) {
                ;(mat as THREE.MeshStandardMaterial).color = new THREE.Color(match)
                mat.needsUpdate = true
              }
            }
          }
        })
        if (typeof window !== "undefined") (window as any).__fbxMaterialsLogged = true
      }

      // Extract animations from NLA strips
      if (fbx.animations && fbx.animations.length > 0) {
        animationsRef.current = fbx.animations

        const animMixer = new THREE.AnimationMixer(fbx)
        mixerRef.current = animMixer

        const targetAnimationName = animationMapping?.[animationState] || animationState

        const initialClip = animationsRef.current.find((clip: THREE.AnimationClip) =>
          clip.name.toLowerCase().includes(targetAnimationName.toLowerCase())
        ) || animationsRef.current[0]

        if (initialClip) {
          const action = animMixer.clipAction(initialClip)
          action.play()
          activeActionRef.current = action
        }
      }

      // Add to scene
      if (groupRef.current) {
        groupRef.current.add(fbx)
      }
    })

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current.uncacheRoot(mixerRef.current.getRoot())
      }
      if (groupRef.current && modelRef.current) {
        groupRef.current.remove(modelRef.current)
      }
      modelRef.current = null
      animationsRef.current = []
      mixerRef.current = null
      activeActionRef.current = null
    }
  }, [url])

  // Handle animation state changes
  useEffect(() => {
    if (!mixerRef.current || !animationsRef.current.length) return

    // Get the target animation name from mapping or use the state directly
    const targetAnimationName = animationMapping?.[animationState] || animationState
    
    const targetClip = animationsRef.current.find((clip: THREE.AnimationClip) => 
      clip.name.toLowerCase().includes(targetAnimationName.toLowerCase())
    )

    if (targetClip) {
      // Stop current action
      if (activeActionRef.current) {
        activeActionRef.current.fadeOut(0.5)
      }
      
      // Create new action
      const newAction = mixerRef.current.clipAction(targetClip)
      
      // Apply reverse playback if requested
      if (playReverse) {
        newAction.timeScale = -1
        newAction.time = targetClip.duration // Start from end
      } else {
        newAction.timeScale = 1
        newAction.time = 0 // Start from beginning
      }
      
      // Apply hold last frame if requested
      if (holdLastFrame) {
        newAction.setLoop(THREE.LoopOnce, 1)
        newAction.clampWhenFinished = true
      } else {
        newAction.setLoop(THREE.LoopRepeat, Infinity)
        newAction.clampWhenFinished = false
      }
      
      newAction.reset().fadeIn(0.5).play()
      activeActionRef.current = newAction
    }
  }, [animationState, holdLastFrame, playReverse, animationMapping])

  // Update animation mixer
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  return (
    <group 
      ref={groupRef} 
      onClick={onClick}
    />
  )
}

