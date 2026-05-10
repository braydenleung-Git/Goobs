import { evaluateDeterministic } from "./deterministic-evaluator"
import type { ChallengeDefinition, ChallengeSlug } from "@/lib/challenges/catalog"

function makeChallenge(overrides: Partial<ChallengeDefinition> & { slug: ChallengeSlug }): ChallengeDefinition {
  return {
    name: "test",
    description: "test",
    xpReward: 100,
    workstationTarget: "computer",
    requiresImageCapableModel: false,
    systemPromptTemplate: "",
    userPromptTemplate: "",
    availableTools: [],
    maxTurns: 5,
    deterministicRules: {},
    ...overrides,
  }
}

const CODE_WRITER_OUTPUT =
  'def fibonacci(n):\n    """Return nth Fibonacci number iteratively."""\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n'

const MULTI_TOOL_OUTPUT =
  "Approach:\n1. Import FastAPI\n2. Create app instance\n3. Define GET route\n\n```python\nfrom fastapi import FastAPI\napp = FastAPI()\n\n@app.get('/items')\nasync def get_items():\n    return [{'id': 1, 'name': 'item'}]\n```\n"

const CHANGE_PROMPT_OUTPUT =
  "Artificial intelligence helps us learn.\nIt helps us write better code.\nEvery day we discover new capabilities."

describe("deterministic-evaluator", () => {
  describe("backward compatibility (no toolCallLog)", () => {
    it("passes good output for change-prompt", () => {
      const c = makeChallenge({
        slug: "change-prompt",
        deterministicRules: { minOutputLength: 20, mustContainKeywords: ["intelligence", "learn", "code"] },
      })
      const result = evaluateDeterministic(c, CHANGE_PROMPT_OUTPUT)
      expect(result.passed).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(60)
    })

    it("fails short output for change-prompt", () => {
      const c = makeChallenge({
        slug: "change-prompt",
        deterministicRules: { minOutputLength: 20, mustContainKeywords: ["intelligence", "learn", "code"] },
      })
      const result = evaluateDeterministic(c, "short")
      expect(result.passed).toBe(false)
    })

    it("fails missing keywords for change-prompt", () => {
      const c = makeChallenge({
        slug: "change-prompt",
        deterministicRules: { minOutputLength: 20, mustContainKeywords: ["intelligence", "learn", "code"] },
      })
      const result = evaluateDeterministic(c, "Artificial intelligence is neat.\nIt helps us do things.\nEvery day we discover new things.\n")
      expect(result.passed).toBe(false)
    })
  })

  describe("code-writer with toolCallLog", () => {
    const c = makeChallenge({
      slug: "code-writer",
      deterministicRules: { minOutputLength: 50, mustContainKeywords: ["def fibonacci", "return"] },
    })

    it("passes with .py file written and exit code 0", () => {
      const toolCallLog = [
        { callId: "c1", name: "write_file", success: true, output: "written", data: { files: ["/tmp/fib.py"] } },
        { callId: "c2", name: "exec_bash", success: true, output: "3", data: { stdout: "3", stderr: "", exitCode: 0 } },
      ]
      const result = evaluateDeterministic(c, CODE_WRITER_OUTPUT, toolCallLog)
      expect(result.passed).toBe(true)
      expect(result.rationale).toContain("Python file written")
      expect(result.rationale).toContain("Code executed successfully (exit 0)")
    })

    it("scores lower without .py file and without exit 0", () => {
      const toolCallLog = [
        { callId: "c1", name: "write_file", success: true, output: "written", data: { files: ["/tmp/data.txt"] } },
        { callId: "c2", name: "exec_bash", success: true, output: "error", data: { stdout: "", stderr: "fail", exitCode: 1 } },
      ]
      const result = evaluateDeterministic(c, CODE_WRITER_OUTPUT, toolCallLog)
      expect(result.rationale).toContain("No .py file written")
      expect(result.rationale).toContain("Code execution did not exit 0")
    })

    it("reports no code executed when exec_bash missing entirely", () => {
      const toolCallLog = [
        { callId: "c1", name: "write_file", success: true, output: "written", data: { files: ["/tmp/data.txt"] } },
      ]
      const result = evaluateDeterministic(c, CODE_WRITER_OUTPUT, toolCallLog)
      expect(result.rationale).toContain("No .py file written")
      expect(result.rationale).toContain("No code executed")
    })
  })

  describe("multi-tool with toolCallLog", () => {
    const c = makeChallenge({
      slug: "multi-tool",
      deterministicRules: { minOutputLength: 100, mustContainKeywords: ["def ", "return"] },
    })

    it("passes with write_file and exec_bash", () => {
      const toolCallLog = [
        { callId: "c1", name: "write_file", success: true, output: "written", data: { files: ["/tmp/app.py"] } },
        { callId: "c2", name: "exec_bash", success: true, output: "done", data: { stdout: "ok", stderr: "", exitCode: 0 } },
      ]
      const result = evaluateDeterministic(c, MULTI_TOOL_OUTPUT, toolCallLog)
      expect(result.passed).toBe(true)
      expect(result.rationale).toContain("Files created via tools")
      expect(result.rationale).toContain("Bash commands executed")
    })

    it("reports missing tools when absent", () => {
      const toolCallLog = [
        { callId: "c1", name: "read_file", success: true, output: "content" },
      ]
      const result = evaluateDeterministic(c, MULTI_TOOL_OUTPUT, toolCallLog)
      expect(result.rationale).toContain("No files created")
      expect(result.rationale).toContain("No bash commands executed")
    })
  })

  describe("change-prompt (no tools, backward compat)", () => {
    const c = makeChallenge({
      slug: "change-prompt",
      deterministicRules: { minOutputLength: 20, mustContainKeywords: ["intelligence", "learn", "code"] },
    })

    it("passes without toolCallLog", () => {
      const result = evaluateDeterministic(c, CHANGE_PROMPT_OUTPUT)
      expect(result.passed).toBe(true)
    })

    it("passes with empty toolCallLog", () => {
      const result = evaluateDeterministic(c, CHANGE_PROMPT_OUTPUT, [])
      expect(result.passed).toBe(true)
    })

    it("passes with irrelevant toolCallLog (no slug-specific logic)", () => {
      const toolCallLog = [
        { callId: "c1", name: "write_file", success: true, output: "written", data: { files: ["data.txt"] } },
      ]
      const result = evaluateDeterministic(c, CHANGE_PROMPT_OUTPUT, toolCallLog)
      expect(result.passed).toBe(true)
      expect(result.rationale).not.toContain("Files created")
    })
  })

  describe("backward compatibility without toolCallLog", () => {
    it("produces identical results to before for code-writer", () => {
      const c = makeChallenge({
        slug: "code-writer",
        deterministicRules: { minOutputLength: 50, mustContainKeywords: ["def fibonacci", "return"] },
      })
      const without = evaluateDeterministic(c, CODE_WRITER_OUTPUT)
      const withUndefined = evaluateDeterministic(c, CODE_WRITER_OUTPUT, undefined)
      expect(withUndefined).toEqual(without)
    })

    it("produces identical results to before for multi-tool", () => {
      const c = makeChallenge({
        slug: "multi-tool",
        deterministicRules: { minOutputLength: 100, mustContainKeywords: ["def ", "return"] },
      })
      const without = evaluateDeterministic(c, MULTI_TOOL_OUTPUT)
      const withUndefined = evaluateDeterministic(c, MULTI_TOOL_OUTPUT, undefined)
      expect(withUndefined).toEqual(without)
    })
  })
})
