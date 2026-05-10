import type { ChallengeDefinition } from "@/lib/challenges/catalog"
import type { ToolResult } from "@/lib/runtime/tools/types"

export interface DeterministicResult {
  passed: boolean
  score: number
  rationale: string
}

export function evaluateDeterministic(
  challenge: ChallengeDefinition,
  output: string,
  toolCallLog?: ToolResult[],
): DeterministicResult {
  const rules = challenge.deterministicRules
  const issues: string[] = []
  let score = 0
  const maxScore = 100

  if (rules.minOutputLength && output.length < rules.minOutputLength) {
    issues.push(
      `Output too short: ${output.length} chars (min ${rules.minOutputLength})`,
    )
  } else if (rules.minOutputLength) {
    score += 30
  }

  if (rules.mustContainKeywords) {
    const matched = rules.mustContainKeywords.filter((kw) =>
      output.toLowerCase().includes(kw.toLowerCase()),
    )
    const matchedCount = matched.length
    const requiredCount = rules.mustContainKeywords.length
    score += Math.round((matchedCount / requiredCount) * 40)
    if (matchedCount < requiredCount) {
      const missing = rules.mustContainKeywords.filter(
        (kw) => !output.toLowerCase().includes(kw.toLowerCase()),
      )
      issues.push(`Missing keywords: ${missing.join(", ")}`)
    }
  }

  if (rules.mustNotContainKeywords) {
    const found = rules.mustNotContainKeywords.filter((kw) =>
      output.toLowerCase().includes(kw.toLowerCase()),
    )
    if (found.length > 0) {
      score -= 20
      issues.push(`Contains forbidden terms: ${found.join(", ")}`)
    }
  }

  if (toolCallLog && toolCallLog.length > 0) {
    const hasWriteFile = toolCallLog.some((tc) => tc.name === "write_file")
    const hasExecBash = toolCallLog.some((tc) => tc.name === "exec_bash")
    const exitCodeZero = toolCallLog.some(
      (tc) => tc.name === "exec_bash" && tc.success && tc.data?.exitCode === 0,
    )

    if (challenge.slug === "code-writer") {
      const pyFileWritten = toolCallLog.some(
        (tc) => tc.name === "write_file" && tc.data?.files?.some((f) => f.endsWith(".py")),
      )
      if (pyFileWritten) {
        score += 15
        issues.push("Python file written")
      } else {
        issues.push("No .py file written")
      }
      if (exitCodeZero) {
        score += 15
        issues.push("Code executed successfully (exit 0)")
      } else if (hasExecBash) {
        issues.push("Code execution did not exit 0")
      } else {
        issues.push("No code executed")
      }
    }

    if (challenge.slug === "multi-tool") {
      if (hasWriteFile) {
        score += 15
        issues.push("Files created via tools")
      } else {
        issues.push("No files created")
      }
      if (hasExecBash) {
        score += 15
        issues.push("Bash commands executed")
      } else {
        issues.push("No bash commands executed")
      }
    }

    if (toolCallLog.length > 0) {
      score += 5
    }
  }

  if (output.length > 0) score += 10
  if (issues.length === 0) score += 20

  const passed = score >= 60
  return {
    passed,
    score: Math.max(0, Math.min(100, score)),
    rationale: issues.length > 0 ? issues.join("; ") : "All deterministic checks passed",
  }
}
