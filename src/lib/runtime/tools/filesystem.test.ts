import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"
import { createFilesystemTools } from "./filesystem"
import { resolveSafePath } from "../workspace"

jest.mock("../workspace")

const mockedResolveSafePath = resolveSafePath as jest.MockedFunction<typeof resolveSafePath>
const agentId = "test-agent"
let tmpDir: string

function mockResolveSafePath(_agentId: string, relativePath: string): string {
  const resolved = path.resolve(tmpDir, relativePath)
  const sep = path.sep
  const rootWithSep = tmpDir.endsWith(sep) ? tmpDir : tmpDir + sep
  const resolvedWithSep = resolved.endsWith(sep) ? resolved : resolved + sep
  if (!resolvedWithSep.startsWith(rootWithSep)) {
    throw new Error(`Path traversal blocked: ${relativePath} escapes workspace`)
  }
  return resolved
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "goobs-fs-test-"))
  mockedResolveSafePath.mockImplementation(mockResolveSafePath)
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

describe("createFilesystemTools", () => {
  describe("read_file", () => {
    it("reads a file from the workspace", async () => {
      const content = "hello world"
      await fs.writeFile(path.join(tmpDir, "test.txt"), content, "utf-8")
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("read_file", { path: "test.txt" })

      expect(result.success).toBe(true)
      expect(result.output).toBe(content)
    })
  })

  describe("write_file", () => {
    it("writes content to a file in the workspace", async () => {
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("write_file", {
        path: "output.txt",
        content: "file content",
      })

      expect(result.success).toBe(true)
      expect(result.output).toContain("output.txt")
      expect(result.data?.files).toEqual([path.join(tmpDir, "output.txt")])
      const written = await fs.readFile(path.join(tmpDir, "output.txt"), "utf-8")
      expect(written).toBe("file content")
    })
  })

  describe("list_files", () => {
    it("lists files and directories in the workspace", async () => {
      await fs.writeFile(path.join(tmpDir, "a.txt"), "a", "utf-8")
      await fs.writeFile(path.join(tmpDir, "b.txt"), "b", "utf-8")
      await fs.mkdir(path.join(tmpDir, "subdir"))
      await fs.writeFile(path.join(tmpDir, "subdir", "c.txt"), "c", "utf-8")
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("list_files", {})

      expect(result.success).toBe(true)
      expect(result.output).toContain("[file] a.txt")
      expect(result.output).toContain("[file] b.txt")
      expect(result.output).toContain("[dir]  subdir")
    })

    it("lists with custom path", async () => {
      await fs.mkdir(path.join(tmpDir, "nested"))
      await fs.writeFile(path.join(tmpDir, "nested", "deep.txt"), "deep", "utf-8")
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("list_files", { path: "nested" })

      expect(result.success).toBe(true)
      expect(result.output).toContain("[file] deep.txt")
    })

    it("returns (empty) for empty directory", async () => {
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("list_files", {})

      expect(result.success).toBe(true)
      expect(result.output).toBe("(empty)")
    })
  })

  describe("path traversal", () => {
    it("returns error for path traversal attempt", async () => {
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("read_file", { path: "../../etc/passwd" })

      expect(result.success).toBe(false)
      expect(result.output).toContain("Path traversal blocked")
    })
  })

  describe("unknown tool", () => {
    it("returns error for unknown tool name", async () => {
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("unknown_tool", {})

      expect(result.success).toBe(false)
      expect(result.output).toContain("Unknown tool")
    })
  })

  describe("validation", () => {
    it("returns error when path is missing for read_file", async () => {
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("read_file", {})

      expect(result.success).toBe(false)
      expect(result.output).toBe("Missing required argument: path")
    })

    it("returns error when path is missing for write_file", async () => {
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("write_file", { content: "foo" })

      expect(result.success).toBe(false)
      expect(result.output).toBe("Missing required argument: path")
    })

    it("returns error when content is missing for write_file", async () => {
      const tools = createFilesystemTools(agentId)

      const result = await tools.execute("write_file", { path: "foo.txt" })

      expect(result.success).toBe(false)
      expect(result.output).toBe("Missing required argument: content")
    })
  })
})
