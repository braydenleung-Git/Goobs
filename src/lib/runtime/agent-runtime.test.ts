import { runChatCompletion } from "@/lib/llm/openai-compatible-client"
import { ToolRegistry } from "./tool-registry"
import { runAgent } from "./agent-runtime"
import type { ToolHandler } from "./tools/types"
import type { ChatRunOutput } from "@/lib/llm/openai-compatible-client"

jest.mock("@/lib/llm/openai-compatible-client")
jest.mock("./workspace", () => ({
  ensureWorkspace: jest.fn().mockResolvedValue(undefined),
  getRunPath: jest.fn(),
  getRunArtifacts: jest.fn().mockResolvedValue([]),
}))

const mockRunChatCompletion = runChatCompletion as jest.MockedFunction<typeof runChatCompletion>

const echoHandler: ToolHandler = {
  definitions: [
    {
      type: "function",
      function: {
        name: "echo",
        description: "Echoes the input",
        parameters: { type: "object", properties: { msg: { type: "string" } }, required: ["msg"] },
      },
    },
  ],
  async execute(_name, args) {
    return { callId: "call_echo", name: "echo", success: true, output: `echo: ${args.msg ?? ""}` }
  },
}

const failingHandler: ToolHandler = {
  definitions: [
    {
      type: "function",
      function: {
        name: "fail_tool",
        description: "Always fails",
        parameters: { type: "object", properties: {} },
      },
    },
  ],
  async execute() {
    return { callId: "call_fail", name: "fail_tool", success: false, output: "Something went wrong" }
  },
}

function makeToolCallsResponse(toolCalls: Array<{ name: string; args: string; id?: string }>): ChatRunOutput {
  return {
    content: "",
    model: "test-model",
    finishReason: "tool_calls",
    toolCalls: toolCalls.map((tc) => ({
      id: tc.id ?? "call_1",
      type: "function" as const,
      function: { name: tc.name, arguments: tc.args },
    })),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe("runAgent", () => {
  it("single-shot: no tools when useTools is false", async () => {
    mockRunChatCompletion.mockResolvedValue({
      content: "Hello from LLM",
      model: "test-model",
      finishReason: "stop",
    })

    const registry = new ToolRegistry()
    const result = await runAgent({
      model: "test-model",
      systemPrompt: "You are a helpful assistant",
      userPrompt: "Say hello",
      agentId: "agent-1",
      runId: "run-1",
      registry,
      useTools: false,
    })

    expect(mockRunChatCompletion).toHaveBeenCalledTimes(1)
    expect(mockRunChatCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ tools: undefined })
    )
    expect(result.finalContent).toBe("Hello from LLM")
    expect(result.toolCallLog).toEqual([])
    expect(result.turnsUsed).toBe(1)
    expect(result.fallbackUsed).toBe(false)
  })

  it("single tool call then stop", async () => {
    mockRunChatCompletion
      .mockResolvedValueOnce(makeToolCallsResponse([{ name: "echo", args: '{"msg":"hi"}' }]))
      .mockResolvedValueOnce({
        content: "Result: echo: hi",
        model: "test-model",
        finishReason: "stop",
      })

    const registry = new ToolRegistry()
    registry.register(echoHandler)

    const result = await runAgent({
      model: "test-model",
      systemPrompt: "You are a helpful assistant",
      userPrompt: "Use the echo tool",
      agentId: "agent-1",
      runId: "run-1",
      registry,
    })

    expect(mockRunChatCompletion).toHaveBeenCalledTimes(2)
    expect(result.finalContent).toBe("Result: echo: hi")
    expect(result.toolCallLog).toHaveLength(1)
    expect(result.toolCallLog[0].name).toBe("echo")
    expect(result.toolCallLog[0].success).toBe(true)
    expect(result.toolCallLog[0].output).toBe("echo: hi")
    expect(result.turnsUsed).toBe(2)
    expect(result.fallbackUsed).toBe(false)
  })

  it("fallback when tools defined but LLM returns stop immediately", async () => {
    mockRunChatCompletion.mockResolvedValue({
      content: "I don't need any tools",
      model: "test-model",
      finishReason: "stop",
    })

    const registry = new ToolRegistry()
    registry.register(echoHandler)

    const result = await runAgent({
      model: "test-model",
      systemPrompt: "You are a helpful assistant",
      userPrompt: "Say something",
      agentId: "agent-1",
      runId: "run-1",
      registry,
    })

    expect(mockRunChatCompletion).toHaveBeenCalledTimes(1)
    expect(result.finalContent).toBe("I don't need any tools")
    expect(result.toolCallLog).toEqual([])
    expect(result.turnsUsed).toBe(1)
    expect(result.fallbackUsed).toBe(true)
  })

  it("max turns exhausted when LLM keeps calling tools", async () => {
    mockRunChatCompletion.mockResolvedValue(
      makeToolCallsResponse([{ name: "echo", args: '{"msg":"loop"}' }])
    )

    const registry = new ToolRegistry()
    registry.register(echoHandler)

    const result = await runAgent({
      model: "test-model",
      systemPrompt: "You are a helpful assistant",
      userPrompt: "Loop forever",
      agentId: "agent-1",
      runId: "run-1",
      registry,
      maxTurns: 3,
    })

    expect(mockRunChatCompletion).toHaveBeenCalledTimes(3)
    expect(result.toolCallLog).toHaveLength(3)
    expect(result.turnsUsed).toBe(3)
    expect(result.fallbackUsed).toBe(false)
  })

  it("tool execution error is handled gracefully", async () => {
    mockRunChatCompletion
      .mockResolvedValueOnce(makeToolCallsResponse([{ name: "fail_tool", args: "{}" }]))
      .mockResolvedValueOnce(makeToolCallsResponse([{ name: "echo", args: '{"msg":"recover"}' }]))
      .mockResolvedValueOnce({
        content: "All done",
        model: "test-model",
        finishReason: "stop",
      })

    const registry = new ToolRegistry()
    registry.register(failingHandler)
    registry.register(echoHandler)

    const result = await runAgent({
      model: "test-model",
      systemPrompt: "You are a helpful assistant",
      userPrompt: "Use tools",
      agentId: "agent-1",
      runId: "run-1",
      registry,
      maxTurns: 5,
    })

    expect(mockRunChatCompletion).toHaveBeenCalledTimes(3)
    expect(result.toolCallLog).toHaveLength(2)
    expect(result.toolCallLog[0].name).toBe("fail_tool")
    expect(result.toolCallLog[0].success).toBe(false)
    expect(result.toolCallLog[1].name).toBe("echo")
    expect(result.toolCallLog[1].success).toBe(true)
    expect(result.finalContent).toBe("All done")
    expect(result.turnsUsed).toBe(3)
  })
})
