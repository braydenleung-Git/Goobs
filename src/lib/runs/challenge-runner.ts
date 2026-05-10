import type { ChallengeSlug } from "@/lib/challenges/catalog"
import { getChallengeBySlug } from "@/lib/challenges/catalog"
import { runChatCompletion } from "@/lib/llm/openai-compatible-client"
import { runAgent } from "@/lib/runtime/agent-runtime"
import { ToolRegistry } from "@/lib/runtime/tool-registry"
import { createSkillsTool } from "@/lib/runtime/tools/skills"
import { createFilesystemTools } from "@/lib/runtime/tools/filesystem"
import { createBashTool } from "@/lib/runtime/tools/bash"
import { evaluateRun } from "@/lib/eval/evaluation-engine"
import { applyChallengeReward } from "@/lib/progression/progression-service"
import { prisma } from "@/lib/db/prisma"
import type { ToolResult } from "@/lib/runtime/tools/types"

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
  toolCalls?: ToolResult[]
  artifacts?: Array<{ path: string; size: number }>
  fallbackUsed?: boolean
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

  let systemPrompt = challenge.systemPromptTemplate

  const agentPrompt = agent.systemPrompt?.trim()
  if (agentPrompt) {
    systemPrompt = agentPrompt + "\n\n---\n\n" + systemPrompt
  }

  let agentSkills: string[] = []
  try {
    agentSkills = JSON.parse(agent.skillsJson || "[]")
  } catch {}
  if (agentSkills.length > 0) {
    const blocks = agentSkills.map((s, i) => {
      const trimmed = s.trim()
      const firstLine = trimmed.split("\n")[0] || ""
      const title = firstLine.replace(/^#\s*/, "").replace(/^["']|["']$/g, "") || `Skill ${i + 1}`
      return `### ${title}\n\n${trimmed}`
    })
    systemPrompt += `\n\nYou have the following skills:\n\n${blocks.join("\n\n")}`
  }

  const runId = crypto.randomUUID()

  let outputText = ""
  let toolCallLog: ToolResult[] = []
  let artifacts: Array<{ path: string; size: number }> = []
  let fallbackUsed = false

  const hasTools = challenge.availableTools && challenge.availableTools.length > 0

  if (hasTools) {
    events.push("state:typing")
    systemPrompt += `\n\nDuring this task you can use tools. Use \`write_file\` to create files, \`exec_bash\` to run commands, \`read_file\` to read existing files, and \`list_files\` to see what's in your workspace.`

    const registry = new ToolRegistry()
    registry.register(createSkillsTool(input.agentId, agentSkills))
    registry.register(createFilesystemTools(input.agentId, runId))
    registry.register(createBashTool(input.agentId))

    const agentResult = await runAgent({
      model: input.model,
      systemPrompt,
      userPrompt: challenge.userPromptTemplate,
      agentId: input.agentId,
      runId,
      registry,
      maxTurns: challenge.maxTurns,
    })

    outputText = agentResult.finalContent
    toolCallLog = agentResult.toolCallLog
    artifacts = agentResult.artifacts
    fallbackUsed = agentResult.fallbackUsed

    events.push("state:done")
  } else {
    const llmOutput = await runChatCompletion({
      model: input.model,
      systemPrompt,
      messages: [{ role: "user", content: challenge.userPromptTemplate }],
    })

    outputText = llmOutput.content
    events.push("state:typing")
    events.push("state:done")
  }

  const evaluation = evaluateRun({
    challenge,
    output: outputText,
    modelUsed: input.model,
    toolCallLog,
    artifacts,
  })

  const run = await prisma.challengeRun.create({
    data: {
      id: runId,
      challengeSlug: input.challengeSlug,
      agentId: input.agentId,
      workstationId: challenge.workstationTarget,
      modelUsed: input.model,
      runtimeStateLogJson: JSON.stringify(events),
      outputText,
      toolCallsJson: JSON.stringify(toolCallLog),
      artifactsJson: JSON.stringify(artifacts),
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
    output: outputText,
    finalPass: evaluation.finalPass,
    totalScore: evaluation.totalScore,
    deterministicScore: evaluation.deterministic.score,
    rubricScore: evaluation.rubric.score,
    rationale: evaluation.rationale,
    xpAwarded,
    level,
    unlockedWorkstationsJson,
    runtimeEvents: events,
    toolCalls: toolCallLog,
    artifacts,
    fallbackUsed,
  }
}
