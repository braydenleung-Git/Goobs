"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Mesh, Group } from "three"

interface AgentModelProps {
  customization: {
    bodyColor: string
    eyes: string
    hat: string
    glow: string
    accessory: string
    animationStyle: string
  }
}

function Eyes({ style }: { style: string }) {
  switch (style) {
    case 'circle':
      return (
        <group>
          <mesh position={[-0.15, 0.1, 0.35]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0.15, 0.1, 0.35]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      )
    case 'star':
      return (
        <group>
          <mesh position={[-0.15, 0.1, 0.35]}>
            <coneGeometry args={[0.08, 0.16, 5]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          <mesh position={[0.15, 0.1, 0.35]}>
            <coneGeometry args={[0.08, 0.16, 5]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>
      )
    case 'heart':
      return (
        <group>
          <mesh position={[-0.15, 0.1, 0.35]}>
            <boxGeometry args={[0.12, 0.12, 0.05]} />
            <meshStandardMaterial color="#FF1493" />
          </mesh>
          <mesh position={[0.15, 0.1, 0.35]}>
            <boxGeometry args={[0.12, 0.12, 0.05]} />
            <meshStandardMaterial color="#FF1493" />
          </mesh>
        </group>
      )
    case 'slit':
      return (
        <group>
          <mesh position={[-0.15, 0.1, 0.35]}>
            <boxGeometry args={[0.2, 0.02, 0.05]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0.15, 0.1, 0.35]}>
            <boxGeometry args={[0.2, 0.02, 0.05]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      )
    case 'glow':
      return (
        <group>
          <mesh position={[-0.15, 0.1, 0.35]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.15, 0.1, 0.35]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

function Hat({ style }: { style: string }) {
  switch (style) {
    case 'crown':
      return (
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.3, 8]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      )
    case 'wizard':
      return (
        <group position={[0, 0.3, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <coneGeometry args={[0.25, 0.4, 8]} />
            <meshStandardMaterial color="#4B0082" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>
      )
    case 'chef':
      return (
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshStandardMaterial color="#FFF" />
        </mesh>
      )
    case 'hardhat':
      return (
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 8]} />
          <meshStandardMaterial color="#FFA500" />
        </mesh>
      )
    case 'tophat':
      return (
        <group position={[0, 0.3, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.3, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.05, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      )
    case 'beanie':
      return (
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#FF1493" />
        </mesh>
      )
    case 'graduation':
      return (
        <group position={[0, 0.3, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.4, 0.02, 0.4]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

function Accessory({ style }: { style: string }) {
  switch (style) {
    case 'glasses':
      return (
        <group position={[0, 0.1, 0.35]}>
          <mesh position={[-0.15, 0, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.02, 0.02]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      )
    case 'bowtie':
      return (
        <mesh position={[0, -0.1, 0.35]}>
          <boxGeometry args={[0.2, 0.1, 0.05]} />
          <meshStandardMaterial color="#FF1493" />
        </mesh>
      )
    case 'scarf':
      return (
        <group position={[0, -0.2, 0]}>
          <mesh position={[0, 0, 0.35]}>
            <boxGeometry args={[0.6, 0.1, 0.05]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
          <mesh position={[0.3, 0.2, 0.35]}>
            <boxGeometry args={[0.1, 0.4, 0.05]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
        </group>
      )
    case 'wings':
      return (
        <group position={[0, 0, 0]}>
          <mesh position={[-0.4, 0, 0]}>
            <boxGeometry args={[0.3, 0.6, 0.05]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.3, 0.6, 0.05]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
        </group>
      )
    case 'cape':
      return (
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[0.5, 0.8, 0.05]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
      )
    case 'backpack':
      return (
        <mesh position={[0, 0, -0.3]}>
          <boxGeometry args={[0.3, 0.4, 0.2]} />
          <meshStandardMaterial color="#4169E1" />
        </mesh>
      )
    case 'toolbelt':
      return (
        <mesh position={[0, -0.3, 0]}>
          <torusGeometry args={[0.35, 0.05, 8, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )
    default:
      return null
  }
}

function GlowEffect({ style }: { style: string }) {
  const meshRef = useRef<Mesh>(null)
  
  useEffect(() => {
    if (meshRef.current && style !== 'none') {
      switch (style) {
        case 'soft':
          meshRef.current.material = new (window as any).THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            emissive: '#FFFFFF',
            emissiveIntensity: 0.1,
            transparent: true,
            opacity: 0.3
          })
          break
        case 'neon':
          meshRef.current.material = new (window as any).THREE.MeshStandardMaterial({
            color: '#FF00FF',
            emissive: '#FF00FF',
            emissiveIntensity: 0.5
          })
          break
        case 'fire':
          meshRef.current.material = new (window as any).THREE.MeshStandardMaterial({
            color: '#FF4500',
            emissive: '#FF4500',
            emissiveIntensity: 0.4
          })
          break
        case 'ice':
          meshRef.current.material = new (window as any).THREE.MeshStandardMaterial({
            color: '#00CED1',
            emissive: '#00CED1',
            emissiveIntensity: 0.3
          })
          break
        case 'electric':
          meshRef.current.material = new (window as any).THREE.MeshStandardMaterial({
            color: '#FFFF00',
            emissive: '#FFFF00',
            emissiveIntensity: 0.6
          })
          break
      }
    }
  }, [style])

  if (style === 'none') return null

  return (
    <mesh ref={meshRef} scale={[1.2, 1.2, 1.2]}>
      <capsuleGeometry args={[0.35, 0.65, 4, 8]} />
    </mesh>
  )
}

export function AgentModel({ customization }: AgentModelProps) {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      switch (customization.animationStyle) {
        case 'bouncy':
          groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
          break
        case 'floaty':
          groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
          groupRef.current.rotation.y += 0.01
          break
        case 'robotic':
          groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
          break
        case 'sleepy':
          groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
          groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
          break
        case 'energetic':
          groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.15
          groupRef.current.rotation.y += 0.02
          break
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Glow Effect (behind everything) */}
      <GlowEffect style={customization.glow} />
      
      {/* Main Body */}
      <mesh>
        <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
        <meshStandardMaterial color={customization.bodyColor} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color={customization.bodyColor} />
      </mesh>
      
      {/* Eyes */}
      <Eyes style={customization.eyes} />
      
      {/* Hat */}
      <Hat style={customization.hat} />
      
      {/* Accessory */}
      <Accessory style={customization.accessory} />
    </group>
  )
}
