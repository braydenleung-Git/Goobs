import type { AgentSceneState, AnimationState } from "@/components/scene/runtime-state-adapter"

function interpolatePosition(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ]
}

export interface RoutePlan {
  waypoints: Array<{ position: [number, number, number]; state: AnimationState }>
  totalDurationMs: number
}

export function buildRoutePlan(
  from: [number, number, number],
  to: [number, number, number],
): RoutePlan {
  const steps = 10
  const waypoints = Array.from({ length: steps }, (_, i) => ({
    position: interpolatePosition(from, to, (i + 1) / steps),
    state: "walking" as AnimationState,
  }))
  return { waypoints, totalDurationMs: steps * 150 }
}
