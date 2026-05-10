import type { ToolHandler, ToolDefinition, ToolResult } from "./tools/types"

export class ToolRegistry {
  private handlers: ToolHandler[] = []

  register(handler: ToolHandler): void {
    this.handlers.push(handler)
  }

  getDefinitions(): ToolDefinition[] {
    return this.handlers.flatMap((h) => h.definitions)
  }

  async execute(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    for (const handler of this.handlers) {
      const def = handler.definitions.find((d) => d.function.name === name)
      if (def) {
        return handler.execute(name, args)
      }
    }
    return {
      callId: "unknown",
      name,
      success: false,
      output: `Unknown tool: ${name}. Available: ${this.getDefinitions().map((d) => d.function.name).join(", ")}`,
    }
  }

  hasTool(name: string): boolean {
    return this.handlers.some((h) =>
      h.definitions.some((d) => d.function.name === name),
    )
  }

  get handlerCount(): number {
    return this.handlers.length
  }
}
