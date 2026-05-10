import * as fs from "fs/promises"
import * as path from "path"
import type { ToolHandler, ToolDefinition, ToolResult } from "./types"
import { resolveSafePath } from "../workspace"

const definitions: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the contents of a file from the workspace",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path to the file" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Write content to a file in the workspace",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path to the file" },
          content: { type: "string", description: "Content to write" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List files and directories in the workspace",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path to list" },
        },
      },
    },
  },
]

export function createFilesystemTools(agentId: string, _runId?: string): ToolHandler {
  return {
    definitions,
    async execute(name: string, args: Record<string, unknown>): Promise<ToolResult> {
      const callId = `${name}-${Date.now()}`
      const base: Pick<ToolResult, "callId" | "name"> = { callId, name }

      try {
        switch (name) {
          case "read_file": {
            const filePath = args.path as string | undefined
            if (!filePath) {
              return { ...base, success: false, output: "Missing required argument: path" }
            }
            const safePath = resolveSafePath(agentId, filePath)
            const content = await fs.readFile(safePath, "utf-8")
            return { ...base, success: true, output: content }
          }

          case "write_file": {
            const filePath = args.path as string | undefined
            const content = args.content as string | undefined
            if (!filePath) {
              return { ...base, success: false, output: "Missing required argument: path" }
            }
            if (content === undefined) {
              return { ...base, success: false, output: "Missing required argument: content" }
            }
            const safePath = resolveSafePath(agentId, filePath)
            await fs.mkdir(path.dirname(safePath), { recursive: true })
            await fs.writeFile(safePath, content, "utf-8")
            return {
              ...base,
              success: true,
              output: `Written ${safePath}`,
              data: { files: [safePath] },
            }
          }

          case "list_files": {
            const dirPath = (args.path as string | undefined) || "."
            const safePath = resolveSafePath(agentId, dirPath)
            const entries = await fs.readdir(safePath, { withFileTypes: true })
            const lines = entries.map((e) =>
              e.isDirectory() ? `[dir]  ${e.name}` : `[file] ${e.name}`,
            )
            return {
              ...base,
              success: true,
              output: lines.length ? lines.join("\n") : "(empty)",
            }
          }

          default:
            return { ...base, success: false, output: `Unknown tool: ${name}` }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return { ...base, success: false, output: message }
      }
    },
  }
}
