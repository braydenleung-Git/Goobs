import type { ChallengeSlug } from "@/lib/challenges/catalog"
import { getChallengeBySlug } from "@/lib/challenges/catalog"
import { runChatCompletion } from "@/lib/llm/openai-compatible-client"
import { evaluateRun } from "@/lib/eval/evaluation-engine"
import { applyChallengeReward } from "@/lib/progression/progression-service"
import { prisma } from "@/lib/db/prisma"

export interface RunInput {
  challengeSlug: ChallengeSlug
  agentId: string
  model: string
}

export interface RunResult {
  runId: string
  challengeSlug: string
  output: string
  finalPass: boolean
  totalScore: number
  deterministicScore: number
  rubricScore: number
  rationale: string
  xpAwarded: number
  level: number
  unlockedWorkstationsJson: string
  runtimeEvents: string[]
}

export async function runChallenge(input: RunInput): Promise<RunResult> {
  const challenge = getChallengeBySlug(input.challengeSlug)
  if (!challenge) throw new Error(`Unknown challenge: ${input.challengeSlug}`)

  const agent = await prisma.agentProfile.findUnique({ where: { id: input.agentId } })
  if (!agent) throw new Error(`Agent not found: ${input.agentId}`)

  const events: string[] = []
  events.push(`assign-workstation:${challenge.workstationTarget}`)
  events.push("state:walking")
  events.push("state:thinking")

  const llmOutput = await runChatCompletion({
    model: input.model,
    systemPrompt: challenge.systemPromptTemplate,
    messages: [{ role: "user", content: challenge.userPromptTemplate }],
  })

  events.push("state:typing")
  events.push("state:done")

  const evaluation = evaluateRun({
    challenge,
    output: llmOutput.content,
    modelUsed: input.model,
  })

  const run = await prisma.challengeRun.create({
    data: {
      challengeSlug: input.challengeSlug,
      agentId: input.agentId,
      workstationId: challenge.workstationTarget,
      modelUsed: input.model,
      runtimeStateLogJson: JSON.stringify(events),
      outputText: llmOutput.content,
      deterministicPass: evaluation.deterministic.passed,
      rubricPass: evaluation.rubric.passed,
      finalPass: evaluation.finalPass,
      deterministicScore: evaluation.deterministic.score,
      rubricScore: evaluation.rubric.score,
      totalScore: evaluation.totalScore,
      rationale: evaluation.rationale,
    },
  })

  let xpAwarded = 0
  let level = 1
  let unlockedWorkstationsJson = "[]"

  if (evaluation.finalPass) {
    xpAwarded = challenge.xpReward
    const progress = await applyChallengeReward({
      runId: run.id,
      challengeSlug: input.challengeSlug,
      xpAwarded,
    })
    level = progress.level
    unlockedWorkstationsJson = progress.unlockedWorkstationsJson
    events.push("state:celebrate")
  } else {
    events.push("state:error")
  }

  await prisma.challengeRun.update({
    where: { id: run.id },
    data: { runtimeStateLogJson: JSON.stringify(events) },
  })

  return {
    runId: run.id,
    challengeSlug: input.challengeSlug,
    output: llmOutput.content,
    finalPass: evaluation.finalPass,
    totalScore: evaluation.totalScore,
    deterministicScore: evaluation.deterministic.score,
    rubricScore: evaluation.rubric.score,
    rationale: evaluation.rationale,
    xpAwarded,
    level,
    unlockedWorkstationsJson,
    runtimeEvents: events,
  }
}
