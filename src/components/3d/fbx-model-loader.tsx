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
  loop?: boolean
  onAnimationFinished?: (state: string) => void
}

function resolveClipName(animations: THREE.AnimationClip[], targetName: string): THREE.AnimationClip | undefined {
  const lower = targetName.toLowerCase()
  const direct = animations.find((c) => c.name.toLowerCase().includes(lower))
  if (direct) return direct
  const aliases: Record<string, string[]> = {
    "transistion": ["transition"],
    "transition": ["transistion"],
    "lying_down": ["lying_down_transistion"],
  }
  for (const [key, alts] of Object.entries(aliases)) {
    if (lower.includes(key)) {
      for (const alt of alts) {
        const found = animations.find((c) => c.name.toLowerCase().includes(alt))
        if (found) return found
      }
    }
  }
  return animations[0]
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
  playReverse = false,
  loop = true,
  onAnimationFinished,
}: FBXModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const animationsRef = useRef<THREE.AnimationClip[]>([])
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const activeActionRef = useRef<THREE.AnimationAction | null>(null)
  const materialColorsRef = useRef(materialColors)
  const onAnimationFinishedRef = useRef(onAnimationFinished)
  materialColorsRef.current = materialColors
  onAnimationFinishedRef.current = onAnimationFinished

  function applyColorsToModel(root: THREE.Group, colors: Record<string, string>) {
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const mat of mats) {
        const name = (mat as any)?.name?.trim()?.toLowerCase() ?? ""
        if (!name) continue
        let match: string | undefined
        if (name.includes("skin")) match = colors.skin
        else if (name.includes("shirt")) match = colors.shirt
        else if (name.includes("pant")) match = colors.pants
        if (match) {
          ;(mat as THREE.MeshStandardMaterial).color = new THREE.Color(match)
          mat.needsUpdate = true
        }
      }
    })
  }

  useEffect(() => {
    const loader = new FBXLoader()
    loader.load(url, (fbx) => {
      fbx.scale.set(...scale)
      fbx.position.set(...position)
      fbx.rotation.set(...rotation)

      modelRef.current = fbx

      if (materialColorsRef.current) {
        applyColorsToModel(fbx, materialColorsRef.current)
      }

      if (fbx.animations && fbx.animations.length > 0) {
        animationsRef.current = fbx.animations

        const animMixer = new THREE.AnimationMixer(fbx)
        mixerRef.current = animMixer

        const targetName = animationMapping?.["idle"] || "idle"
        const initialClip = resolveClipName(fbx.animations, targetName.toLowerCase())

        if (initialClip) {
          const action = animMixer.clipAction(initialClip)
          action.setLoop(THREE.LoopRepeat, Infinity)
          action.play()
          activeActionRef.current = action
        }
      }

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

  useEffect(() => {
    if (modelRef.current && materialColorsRef.current) {
      applyColorsToModel(modelRef.current, materialColorsRef.current)
    }
  }, [materialColors])

  useEffect(() => {
    if (!mixerRef.current || !animationsRef.current.length) return

    const targetName = animationMapping?.[animationState] || animationState
    const targetClip = resolveClipName(animationsRef.current, targetName.toLowerCase())

    if (targetClip) {
      if (activeActionRef.current) {
        activeActionRef.current.fadeOut(0.5)
      }

      const newAction = mixerRef.current.clipAction(targetClip)

      if (playReverse) {
        newAction.timeScale = -1
        newAction.time = targetClip.duration
        newAction.setLoop(THREE.LoopOnce, 1)
        newAction.clampWhenFinished = holdLastFrame
      } else if (!loop) {
        newAction.timeScale = 1
        newAction.time = 0
        newAction.setLoop(THREE.LoopOnce, 1)
        newAction.clampWhenFinished = holdLastFrame
      } else {
        newAction.timeScale = 1
        newAction.time = 0
        newAction.setLoop(THREE.LoopRepeat, Infinity)
        newAction.clampWhenFinished = false
      }

      newAction.reset().fadeIn(0.5).play()
      activeActionRef.current = newAction

      const handleFinish = (e: any) => {
        if (e.action === newAction) {
          onAnimationFinishedRef.current?.(animationState)
        }
      }

      if (!loop || playReverse) {
        mixerRef.current.addEventListener("finished", handleFinish)
      }

      return () => {
        mixerRef.current?.removeEventListener("finished", handleFinish)
      }
    }
  }, [animationState, holdLastFrame, playReverse, loop, animationMapping])

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  return <group ref={groupRef} onClick={onClick} />
}
