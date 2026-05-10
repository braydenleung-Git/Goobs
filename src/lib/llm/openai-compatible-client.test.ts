/**
 * @jest-environment node
 */

import { runChatCompletion } from "@/lib/llm/openai-compatible-client"
import { getProviderRuntimeConfig } from "@/lib/provider/provider-config-service"
import type { ToolDefinition } from "@/lib/runtime/tools/types"

jest.mock("@/lib/provider/provider-config-service")

const mockGetProviderRuntimeConfig = jest.mocked(getProviderRuntimeConfig)

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  jest.resetAllMocks()
  mockGetProviderRuntimeConfig.mockResolvedValue({
    baseUrl: "http://test.local/v1",
    apiKey: "sk-test",
  })
})

function mockResponse(bodyOverrides: Record<string, unknown> = {}) {
  const body = {
    id: "chatcmpl-123",
    model: "test-model",
    choices: [
      {
        index: 0,
        finish_reason: "stop",
        message: { role: "assistant", content: "Hello" },
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 5 },
    ...bodyOverrides,
  }
  return {
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => "",
    headers: new Headers(),
  } as unknown as Response
}

describe("runChatCompletion", () => {
  it("sends a basic chat completion request", async () => {
    mockFetch.mockResolvedValue(mockResponse())

    const result = await runChatCompletion({
      model: "test-model",
      systemPrompt: "You are a helpful assistant",
      messages: [{ role: "user", content: "Hi" }],
    })

    expect(result.content).toBe("Hello")
    expect(result.model).toBe("test-model")
    expect(result.finishReason).toBe("stop")
    expect(result.toolCalls).toBeUndefined()
  })

  it("includes maxTokens in the request", async () => {
    mockFetch.mockResolvedValue(mockResponse())

    await runChatCompletion({
      model: "test-model",
      systemPrompt: "Be concise",
      messages: [{ role: "user", content: "Hi" }],
      maxTokens: 100,
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.max_tokens).toBe(100)
  })

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    } as Response)

    await expect(
      runChatCompletion({
        model: "test-model",
        systemPrompt: "Be helpful",
        messages: [{ role: "user", content: "Hi" }],
      }),
    ).rejects.toThrow("Chat completion failed (401): Unauthorized")
  })

  describe("with tools", () => {
    const weatherTool: ToolDefinition = {
      type: "function",
      function: {
        name: "get_weather",
        description: "Get current weather for a location",
        parameters: {
          type: "object",
          properties: { location: { type: "string" } },
          required: ["location"],
        },
      },
    }

    it("sends tools and tool_choice when tools are provided", async () => {
      mockFetch.mockResolvedValue(mockResponse())

      await runChatCompletion({
        model: "test-model",
        systemPrompt: "Use tools when needed",
        messages: [{ role: "user", content: "What is the weather in Paris?" }],
        tools: [weatherTool],
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
      expect(body.tools).toEqual([weatherTool])
      expect(body.tool_choice).toBe("auto")
    })

    it("parses tool_calls from the response", async () => {
      mockFetch.mockResolvedValue(
        mockResponse({
          choices: [
            {
              index: 0,
              finish_reason: "tool_calls",
              message: {
                role: "assistant",
                content: null,
                tool_calls: [
                  {
                    id: "call_abc123",
                    type: "function",
                    function: {
                      name: "get_weather",
                      arguments: JSON.stringify({ location: "Paris" }),
                    },
                  },
                ],
              },
            },
          ],
        }),
      )

      const result = await runChatCompletion({
        model: "test-model",
        systemPrompt: "Use tools when needed",
        messages: [{ role: "user", content: "Weather in Paris?" }],
        tools: [weatherTool],
      })

      expect(result.finishReason).toBe("tool_calls")
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls![0].id).toBe("call_abc123")
      expect(result.toolCalls![0].type).toBe("function")
      expect(result.toolCalls![0].function.name).toBe("get_weather")
      expect(result.toolCalls![0].function.arguments).toBe(
        JSON.stringify({ location: "Paris" }),
      )
    })

    it("includes tool result messages in the request", async () => {
      mockFetch.mockResolvedValue(mockResponse())

      await runChatCompletion({
        model: "test-model",
        systemPrompt: "Use tools",
        messages: [
          { role: "user", content: "Weather in Paris?" },
          {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_abc123",
                type: "function",
                function: { name: "get_weather", arguments: "{}" },
              },
            ],
          },
          {
            role: "tool",
            tool_call_id: "call_abc123",
            content: JSON.stringify({ temp: 22 }),
          },
        ],
        tools: [weatherTool],
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
      expect(body.messages).toHaveLength(4)
      expect(body.messages[0].role).toBe("system")
      expect(body.messages[1].role).toBe("user")
      expect(body.messages[2].role).toBe("assistant")
      expect(body.messages[2].tool_calls).toBeDefined()
      expect(body.messages[3].role).toBe("tool")
      expect(body.messages[3].tool_call_id).toBe("call_abc123")
      expect(body.messages[3].content).toBe(JSON.stringify({ temp: 22 }))
    })
  })
})
