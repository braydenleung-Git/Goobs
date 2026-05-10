import { runChallenge } from "./challenge-runner"
import { getChallengeBySlug } from "@/lib/challenges/catalog"
import { runChatCompletion } from "@/lib/llm/openai-compatible-client"
import { runAgent } from "@/lib/runtime/agent-runtime"
import { evaluateRun } from "@/lib/eval/evaluation-engine"
import { applyChallengeReward } from "@/lib/progression/progression-service"
import type { ChallengeDefinition } from "@/lib/challenges/catalog"
import type { AgentRunResult } from "@/lib/runtime/agent-runtime"
import type { ChatRunOutput } from "@/lib/llm/openai-compatible-client"
import type { EvaluateResult } from "@/lib/eval/evaluation-engine"

jest.mock("@/lib/challenges/catalog")
jest.mock("@/lib/llm/openai-compatible-client", () => ({ runChatCompletion: jest.fn() }))
jest.mock("@/lib/runtime/agent-runtime", () => ({ runAgent: jest.fn() }))
jest.mock("@/lib/runtime/tool-registry")
jest.mock("@/lib/runtime/tools/filesystem")
jest.mock("@/lib/runtime/tools/bash")
jest.mock("@/lib/eval/evaluation-engine")
jest.mock("@/lib/progression/progression-service")
jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    agentProfile: { findUnique: jest.fn() },
    challengeRun: { create: jest.fn(), update: jest.fn() },
  },
}))

import { prisma } from "@/lib/db/prisma"

const mockGetChallenge = getChallengeBySlug as jest.MockedFunction<typeof getChallengeBySlug>
const mockRunChatCompletion = runChatCompletion as jest.MockedFunction<typeof runChatCompletion>
const mockRunAgent = runAgent as jest.MockedFunction<typeof runAgent>
const mockEvaluateRun = evaluateRun as jest.MockedFunction<typeof evaluateRun>
const mockApplyReward = applyChallengeReward as jest.MockedFunction<typeof applyChallengeReward>

if (typeof crypto.randomUUID !== "function") {
  Object.defineProperty(crypto, "randomUUID", {
    value: () =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
      }),
    writable: false,
  })
}

const CHANGE_PROMPT_CHALLENGE: ChallengeDefinition = {
  slug: "change-prompt",
  name: "Change Prompt",
  description: "Modify the agent's system prompt.",
  xpReward: 40,
  workstationTarget: "whiteboard",
  requiresImageCapableModel: false,
  availableTools: [],
  maxTurns: 1,
  systemPromptTemplate: "system-prompt",
  userPromptTemplate: "user-prompt",
  deterministicRules: {
    minOutputLength: 20,
    mustContainKeywords: ["intelligence", "learn", "code"],
    mustNotContainKeywords: [],
  },
}

const CODE_WRITER_CHALLENGE: ChallengeDefinition = {
  slug: "code-writer",
  name: "Code Writer",
  description: "The agent writes a working Python function.",
  xpReward: 100,
  workstationTarget: "computer",
  requiresImageCapableModel: false,
  availableTools: ["read_file", "write_file", "list_files", "exec_bash"],
  maxTurns: 5,
  systemPromptTemplate: "system-prompt-code",
  userPromptTemplate: "user-prompt-code",
  deterministicRules: {
    minOutputLength: 50,
    mustContainKeywords: ["def fibonacci", "return"],
    mustNotContainKeywords: [],
  },
}

const PASS_EVALUATION: EvaluateResult = {
  deterministic: { passed: true, score: 80, rationale: "Deterministic pass" },
  rubric: { passed: true, score: 80, rationale: "Rubric pass" },
  finalPass: true,
  totalScore: 80,
  rationale: "Deterministic: pass | Rubric: pass",
}

const PASS_PROGRESS = {
  level: 2,
  unlockedWorkstationsJson: '["computer"]',
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(prisma.agentProfile.findUnique as jest.Mock).mockResolvedValue({ id: "agent-1" })
})

describe("runChallenge", () => {
  describe("non-tool challenge (change-prompt)", () => {
    beforeEach(() => {
      mockGetChallenge.mockReturnValue(CHANGE_PROMPT_CHALLENGE)
      mockRunChatCompletion.mockResolvedValue({
        content: "Artificial intelligence helps us learn and write code.",
        model: "test-model",
        finishReason: "stop",
      } satisfies ChatRunOutput)
      mockEvaluateRun.mockReturnValue(PASS_EVALUATION)
      mockApplyReward.mockResolvedValue(PASS_PROGRESS)
      ;(prisma.challengeRun.create as jest.Mock).mockResolvedValue({
        id: "run-non-tool",
        challengeSlug: "change-prompt",
        agentId: "agent-1",
        workstationId: "whiteboard",
        modelUsed: "test-model",
        runtimeStateLogJson: "[]",
        outputText: "",
        toolCallsJson: "[]",
        artifactsJson: "[]",
      })
    })

    it("calls runChatCompletion", async () => {
      const result = await runChallenge({
        challengeSlug: "change-prompt",
        agentId: "agent-1",
        model: "test-model",
      })

      expect(mockRunChatCompletion).toHaveBeenCalledTimes(1)
      expect(mockRunChatCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "test-model",
          systemPrompt: "system-prompt",
        }),
      )
      expect(mockRunAgent).not.toHaveBeenCalled()
      expect(result.output).toBe("Artificial intelligence helps us learn and write code.")
      expect(result.finalPass).toBe(true)
    })

    it("stores empty toolCallsJson and artifactsJson", async () => {
      await runChallenge({
        challengeSlug: "change-prompt",
        agentId: "agent-1",
        model: "test-model",
      })

      const createData = (prisma.challengeRun.create as jest.Mock).mock.calls[0][0].data
      expect(createData.toolCallsJson).toBe("[]")
      expect(createData.artifactsJson).toBe("[]")
    })
  })

  describe("tool-enabled challenge (code-writer)", () => {
    const mockToolCallLog = [
      { callId: "call-1", name: "write_file", success: true, output: "Written", data: {} },
      { callId: "call-2", name: "exec_bash", success: true, output: "Output", data: { exitCode: 0 } },
    ]
    const mockArtifacts = [{ path: "/workspace/test.py", size: 42 }]

    const agentResult: AgentRunResult = {
      finalContent: "def fibonacci(n):\n    return n",
      toolCallLog: mockToolCallLog,
      artifacts: mockArtifacts,
      turnsUsed: 3,
      fallbackUsed: false,
    }

    beforeEach(() => {
      mockGetChallenge.mockReturnValue(CODE_WRITER_CHALLENGE)
      mockRunAgent.mockResolvedValue(agentResult)
      mockEvaluateRun.mockReturnValue(PASS_EVALUATION)
      mockApplyReward.mockResolvedValue(PASS_PROGRESS)
      ;(prisma.challengeRun.create as jest.Mock).mockResolvedValue({
        id: "run-tool",
        challengeSlug: "code-writer",
        agentId: "agent-1",
        workstationId: "computer",
        modelUsed: "test-model",
        runtimeStateLogJson: "[]",
        outputText: "",
        toolCallsJson: "[]",
        artifactsJson: "[]",
      })
    })

    it("calls runAgent instead of runChatCompletion", async () => {
      const result = await runChallenge({
        challengeSlug: "code-writer",
        agentId: "agent-1",
        model: "test-model",
      })

      expect(mockRunAgent).toHaveBeenCalledTimes(1)
      expect(mockRunAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "test-model",
          systemPrompt: expect.stringContaining("system-prompt-code"),
          userPrompt: "user-prompt-code",
          agentId: "agent-1",
          maxTurns: 5,
        }),
      )
      expect(mockRunChatCompletion).not.toHaveBeenCalled()
      expect(result.output).toBe("def fibonacci(n):\n    return n")
    })

    it("persists toolCallsJson and artifactsJson", async () => {
      await runChallenge({
        challengeSlug: "code-writer",
        agentId: "agent-1",
        model: "test-model",
      })

      const createData = (prisma.challengeRun.create as jest.Mock).mock.calls[0][0].data
      expect(createData.toolCallsJson).toBe(JSON.stringify(mockToolCallLog))
      expect(createData.artifactsJson).toBe(JSON.stringify(mockArtifacts))
    })

    it("returns toolCalls, artifacts, and fallbackUsed in result", async () => {
      const result = await runChallenge({
        challengeSlug: "code-writer",
        agentId: "agent-1",
        model: "test-model",
      })

      expect(result.toolCalls).toEqual(mockToolCallLog)
      expect(result.artifacts).toEqual(mockArtifacts)
      expect(result.fallbackUsed).toBe(false)
    })

    it("passes toolCallLog and artifacts to evaluateRun", async () => {
      await runChallenge({
        challengeSlug: "code-writer",
        agentId: "agent-1",
        model: "test-model",
      })

      expect(mockEvaluateRun).toHaveBeenCalledWith(
        expect.objectContaining({
          toolCallLog: mockToolCallLog,
          artifacts: mockArtifacts,
        }),
      )
    })
  })

  describe("error cases", () => {
    it("throws on unknown challenge", async () => {
      mockGetChallenge.mockReturnValue(undefined)

      await expect(
        runChallenge({ challengeSlug: "change-prompt" as any, agentId: "agent-1", model: "test-model" }),
      ).rejects.toThrow("Unknown challenge")
    })

    it("throws on missing agent", async () => {
      mockGetChallenge.mockReturnValue(CHANGE_PROMPT_CHALLENGE)
      ;(prisma.agentProfile.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        runChallenge({ challengeSlug: "change-prompt", agentId: "missing", model: "test-model" }),
      ).rejects.toThrow("Agent not found")
    })
  })
})
