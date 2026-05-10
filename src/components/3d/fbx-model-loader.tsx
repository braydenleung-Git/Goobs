"use client"

import { useFrame, type ThreeEvent } from "@react-three/fiber"
import { useCallback, useEffect, useRef } from "react"
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

  const applyColors = useCallback(() => {
    const root = modelRef.current
    if (!root || !materialColors) return
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const mat of mats) {
        const name = (mat as any)?.name?.trim()?.toLowerCase() ?? ""
        if (!name) continue
        let match: string | undefined
        if (name.includes("skin")) match = materialColors.skin
        else if (name.includes("shirt")) match = materialColors.shirt
        else if (name.includes("pant")) match = materialColors.pants
        if (match) {
          ;(mat as THREE.MeshStandardMaterial).color = new THREE.Color(match)
          mat.needsUpdate = true
        }
      }
    })
  }, [materialColors])

  useEffect(() => {
    const loader = new FBXLoader()
    loader.load(url, (fbx) => {
      // Scale and position the model
      fbx.scale.set(...scale)
      fbx.position.set(...position)
      fbx.rotation.set(...rotation)

      // Store model reference
      modelRef.current = fbx

      // Apply colors by material name
      applyColors()

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

  // Re-apply colors when materialColors changes
  useEffect(() => {
    if (modelRef.current) {
      applyColors()
    }
  }, [applyColors])

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

