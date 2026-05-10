import type { ChallengeSlug, WorkstationId } from "@/lib/challenges/catalog"
import { getChallengeBySlug } from "@/lib/challenges/catalog"

export interface WorkstationResolveInput {
  challengeSlug: ChallengeSlug
  agentId: string
}

export interface WorkstationAssignment {
  workstationId: WorkstationId
}

export function resolveWorkstation(input: WorkstationResolveInput): WorkstationAssignment {
  const challenge = getChallengeBySlug(input.challengeSlug)
  if (!challenge) throw new Error(`Unknown challenge: ${input.challengeSlug}`)
  return { workstationId: challenge.workstationTarget }
}
