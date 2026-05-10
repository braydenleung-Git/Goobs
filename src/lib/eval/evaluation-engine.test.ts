import { evaluateRun } from "./evaluation-engine"
import { listChallenges } from "@/lib/challenges/catalog"

describe("evaluation-engine", () => {
  const challenges = listChallenges()

  it("passes good output for each challenge", () => {
    const outputs: Record<string, string> = {
      "change-prompt":
        "Artificial intelligence helps us learn.\nIt helps us write better code.\nEvery day we discover new capabilities.",
      "code-writer":
        '```python\ndef fibonacci(n):\n    """Return nth Fibonacci number iteratively."""\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n```',
      "multi-tool":
        "Approach:\n1. Import FastAPI\n2. Create app instance\n3. Define GET route\n\n```python\nfrom fastapi import FastAPI\napp = FastAPI()\n\n@app.get('/items')\nasync def get_items():\n    return [{'id': 1, 'name': 'item'}]\n```",
    }

    for (const c of challenges) {
      const output = outputs[c.slug]
      const result = evaluateRun({ challenge: c, output, modelUsed: "test-model" })
      expect(result.finalPass).toBe(true)
      expect(result.totalScore).toBeGreaterThanOrEqual(60)
    }
  })

  it("fails empty output", () => {
    const c = challenges[0]
    const result = evaluateRun({ challenge: c, output: "", modelUsed: "test-model" })
    expect(result.finalPass).toBe(false)
  })

  it("fails missing keywords", () => {
    const c = challenges[0]
    const result = evaluateRun({
      challenge: c,
      output: "short",
      modelUsed: "test-model",
    })
    expect(result.finalPass).toBe(false)
  })
})
