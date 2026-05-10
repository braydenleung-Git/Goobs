import { evaluateDeterministic } from "./deterministic-evaluator"
import type { ChallengeDefinition } from "@/lib/challenges/catalog"
import type { ToolResult } from "@/lib/runtime/tools/types"

export interface EvaluateInput {
  challenge: ChallengeDefinition
  output: string
  modelUsed: string
  toolCallLog?: ToolResult[]
  artifacts?: Array<{ path: string; size: number }>
}

export interface EvaluateResult {
  deterministic: { passed: boolean; score: number; rationale: string }
  rubric: { passed: boolean; score: number; rationale: string }
  finalPass: boolean
  totalScore: number
  rationale: string
}

function scoreRubric(
  challenge: ChallengeDefinition,
  output: string,
  toolCallLog?: ToolResult[],
): {
  passed: boolean; score: number; rationale: string
} {
  const lines = output.split("\n").filter(Boolean)
  let score = 50
  const notes: string[] = []

  if (lines.length >= 3) { score += 15; notes.push("Good line count") }
  else { notes.push("Few lines") }

  const hasCodeBlock = output.includes("```")
  if (challenge.slug === "code-writer" || challenge.slug === "multi-tool") {
    if (hasCodeBlock) { score += 20; notes.push("Contains code block") }
    else { notes.push("Missing code block") }
  }

  const hasDocstring = output.includes('"""') || output.includes("'''")
  if (challenge.slug === "code-writer" && hasDocstring) {
    score += 15; notes.push("Has docstring")
  }

  if (toolCallLog && toolCallLog.length > 0) {
    const hasSuccessfulExit = toolCallLog.some(
      (tc) => tc.success && tc.data?.exitCode === 0,
    )
    if (hasSuccessfulExit) { score += 10; notes.push("Successful tool execution") }

    const writeFileCount = toolCallLog.filter((tc) => tc.name === "write_file").length
    if (writeFileCount > 0) {
      score += Math.min(writeFileCount * 5, 15)
      notes.push(`Wrote ${writeFileCount} file(s)`)
    }

    score += 5; notes.push("Used tools")
  }

  const passed = score >= 60
  return {
    passed,
    score: Math.min(100, score),
    rationale: notes.length > 0 ? notes.join("; ") : "Rubric scored",
  }
}

export function evaluateRun(input: EvaluateInput): EvaluateResult {
  const deterministic = evaluateDeterministic(input.challenge, input.output)
  const rubric = scoreRubric(input.challenge, input.output, input.toolCallLog)

  const finalPass = deterministic.passed && rubric.passed
  const totalScore = Math.round((deterministic.score + rubric.score) / 2)

  const rationaleParts: string[] = []
  if (deterministic.passed) rationaleParts.push("Deterministic: pass")
  else rationaleParts.push(`Deterministic: fail (${deterministic.rationale})`)

  if (rubric.passed) rationaleParts.push("Rubric: pass")
  else rationaleParts.push(`Rubric: fail (${rubric.rationale})`)

  return {
    deterministic,
    rubric,
    finalPass,
    totalScore,
    rationale: rationaleParts.join(" | "),
  }
}
