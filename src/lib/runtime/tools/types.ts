export interface ToolDefinition {
  type: "function"
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface ToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

export interface ToolResult {
  callId: string
  name: string
  success: boolean
  output: string
  data?: {
    stdout?: string
    stderr?: string
    exitCode?: number
    files?: string[]
  }
}

export interface ToolHandler {
  definitions: ToolDefinition[]
  execute(name: string, args: Record<string, unknown>): Promise<ToolResult>
}
