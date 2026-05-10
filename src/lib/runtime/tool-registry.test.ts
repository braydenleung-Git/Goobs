import { ToolRegistry } from "./tool-registry"
import type { ToolHandler } from "./tools/types"

const mockHandler: ToolHandler = {
  definitions: [
    {
      type: "function",
      function: {
        name: "test_tool",
        description: "A test tool",
        parameters: { type: "object", properties: { msg: { type: "string" } }, required: [] },
      },
    },
  ],
  async execute(name, args) {
    return { callId: "1", name, success: true, output: `executed with ${JSON.stringify(args)}` }
  },
}

const mockHandler2: ToolHandler = {
  definitions: [
    {
      type: "function",
      function: {
        name: "other_tool",
        description: "Another test tool",
        parameters: { type: "object", properties: {} },
      },
    },
  ],
  async execute(name, args) {
    return { callId: "2", name, success: true, output: `other executed with ${JSON.stringify(args)}` }
  },
}

describe("ToolRegistry", () => {
  let registry: ToolRegistry

  beforeEach(() => {
    registry = new ToolRegistry()
  })

  it("returns definitions from registered handlers", () => {
    registry.register(mockHandler)
    const defs = registry.getDefinitions()
    expect(defs).toHaveLength(1)
    expect(defs[0].function.name).toBe("test_tool")
  })

  it("executes a known tool successfully", async () => {
    registry.register(mockHandler)
    const result = await registry.execute("test_tool", { msg: "hello" })
    expect(result.success).toBe(true)
    expect(result.output).toContain("hello")
  })

  it("returns error for unknown tool", async () => {
    registry.register(mockHandler)
    const result = await registry.execute("unknown_tool", {})
    expect(result.success).toBe(false)
    expect(result.output).toContain("Unknown tool")
    expect(result.output).toContain("test_tool")
  })

  it("hasTool returns true for registered tool and false otherwise", () => {
    registry.register(mockHandler)
    expect(registry.hasTool("test_tool")).toBe(true)
    expect(registry.hasTool("nonexistent")).toBe(false)
  })

  it("merges definitions from multiple handlers", () => {
    registry.register(mockHandler)
    registry.register(mockHandler2)
    const defs = registry.getDefinitions()
    expect(defs).toHaveLength(2)
    expect(defs.map((d) => d.function.name)).toEqual(["test_tool", "other_tool"])
  })

  it("executes the correct handler when multiple are registered", async () => {
    registry.register(mockHandler)
    registry.register(mockHandler2)
    const result = await registry.execute("other_tool", {})
    expect(result.success).toBe(true)
    expect(result.callId).toBe("2")
  })

  it("tracks handler count", () => {
    expect(registry.handlerCount).toBe(0)
    registry.register(mockHandler)
    expect(registry.handlerCount).toBe(1)
    registry.register(mockHandler2)
    expect(registry.handlerCount).toBe(2)
  })
})
