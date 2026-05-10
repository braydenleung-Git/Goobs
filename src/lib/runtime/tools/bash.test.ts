import { createBashTool } from "./bash"

jest.mock("child_process", () => ({
  exec: jest.fn(),
}))

jest.mock("../workspace", () => ({
  getWorkspacePath: jest.fn().mockReturnValue("/fake/workspace"),
  ensureWorkspace: jest.fn().mockResolvedValue(undefined),
}))

const mockExec = jest.requireMock("child_process").exec as jest.Mock

describe("createBashTool", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("definitions", () => {
    it("provides exec_bash definition", () => {
      const tool = createBashTool("agent-1")
      expect(tool.definitions).toHaveLength(1)
      expect(tool.definitions[0].function.name).toBe("exec_bash")
    })
  })

  describe("execute", () => {
    it("echo command returns stdout and exit 0", async () => {
      mockExec.mockImplementation((_cmd: string, _opts: object, cb: Function) => {
        cb(null, { stdout: "hello\n", stderr: "" })
      })

      const tool = createBashTool("agent-1")
      const result = await tool.execute("exec_bash", { command: 'echo "hello"' })

      expect(result.success).toBe(true)
      expect(result.data?.stdout).toBe("hello\n")
      expect(result.data?.exitCode).toBe(0)
    })

    it("failing command returns exitCode 1", async () => {
      const error = new Error("Command failed: exit 1") as any
      error.code = 1
      error.stdout = ""
      error.stderr = ""
      mockExec.mockImplementation((_cmd: string, _opts: object, cb: Function) => {
        cb(error)
      })

      const tool = createBashTool("agent-1")
      const result = await tool.execute("exec_bash", { command: "exit 1" })

      expect(result.data?.exitCode).toBe(1)
    })

    it("timeout on long running command", async () => {
      const error = new Error("Command timed out") as any
      error.killed = true
      error.signal = "SIGTERM"
      error.code = null
      mockExec.mockImplementation((_cmd: string, _opts: object, cb: Function) => {
        cb(error)
      })

      const tool = createBashTool("agent-1", 500)
      const result = await tool.execute("exec_bash", { command: "sleep 100" })

      expect(result.success).toBe(true)
      expect(result.output).toBe("Command timed out")
      expect(result.data?.exitCode).toBe(124)
    })

    it("cwd is workspace directory", async () => {
      mockExec.mockImplementation((_cmd: string, opts: any, cb: Function) => {
        cb(null, { stdout: opts.cwd, stderr: "" })
      })

      const tool = createBashTool("agent-1")
      const result = await tool.execute("exec_bash", { command: "pwd" })

      expect(result.data?.stdout).toBe("/fake/workspace")
    })

    it("unknown tool name returns error", async () => {
      const tool = createBashTool("agent-1")
      const result = await tool.execute("unknown_tool", {})

      expect(result.success).toBe(false)
      expect(result.output).toBe("Unknown tool: unknown_tool")
    })
  })
})
