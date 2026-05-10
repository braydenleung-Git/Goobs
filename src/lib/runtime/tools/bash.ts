import { exec } from "child_process"
import { promisify } from "util"
import type { ToolHandler, ToolResult } from "./types"
import { getWorkspacePath, ensureWorkspace } from "../workspace"

const execAsync = promisify(exec)

export function createBashTool(agentId: string, timeoutMs: number = 10000): ToolHandler {
  const definitions = [
    {
      type: "function" as const,
      function: {
        name: "exec_bash",
        description: "Execute a bash command in the workspace directory",
        parameters: {
          type: "object",
          properties: {
            command: { type: "string", description: "The bash command to execute" },
            timeout: {
              type: "number",
              description: "Timeout in milliseconds",
            },
          },
          required: ["command"],
        },
      },
    },
  ]

  async function execute(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    if (name !== "exec_bash") {
      return {
        callId: name,
        name,
        success: false,
        output: `Unknown tool: ${name}`,
      }
    }

    const command = args.command as string
    const timeout = (args.timeout as number) ?? timeoutMs

    if (!command) {
      return {
        callId: name,
        name,
        success: true,
        output: "No command provided",
        data: { stdout: "", stderr: "", exitCode: -1 },
      }
    }

    await ensureWorkspace(agentId)
    const workspacePath = getWorkspacePath(agentId)

    try {
      const result = await execAsync(command, {
        cwd: workspacePath,
        timeout,
      })

      return {
        callId: name,
        name,
        success: true,
        output: `Command completed (exit 0)`,
        data: {
          stdout: result.stdout ?? "",
          stderr: result.stderr ?? "",
          exitCode: 0,
        },
      }
    } catch (error: unknown) {
      const err = error as {
        code?: number
        killed?: boolean
        signal?: string
        stdout?: string
        stderr?: string
        message?: string
      }

      if (err.killed || err.signal === "SIGTERM") {
        return {
          callId: name,
          name,
          success: true,
          output: "Command timed out",
          data: { exitCode: 124 },
        }
      }

      const exitCode = err.code ?? 1
      return {
        callId: name,
        name,
        success: true,
        output: `Command completed (exit ${exitCode})`,
        data: {
          stdout: err.stdout ?? "",
          stderr: err.stderr ?? "",
          exitCode,
        },
      }
    }
  }

  return { definitions, execute }
}
