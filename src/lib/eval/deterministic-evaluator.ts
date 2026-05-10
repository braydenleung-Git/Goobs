import type { ChallengeDefinition } from "@/lib/challenges/catalog"

export interface DeterministicResult {
  passed: boolean
  score: number
  rationale: string
}

export function evaluateDeterministic(
  challenge: ChallengeDefinition,
  output: string,
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

  if (output.length > 0) score += 10
  if (issues.length === 0) score += 20

  const passed = score >= 60
  return {
    passed,
    score: Math.max(0, Math.min(100, score)),
    rationale: issues.length > 0 ? issues.join("; ") : "All deterministic checks passed",
  }
}
