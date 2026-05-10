import * as fs from "fs/promises"
import * as os from "os"

import {
  getWorkspacePath,
  getRunPath,
  resolveSafePath,
  ensureWorkspace,
  getRunArtifacts,
  cleanWorkspace,
} from "./workspace"

jest.mock("fs/promises")
jest.mock("os")

const mockedFs = fs as jest.Mocked<typeof fs>
const mockedOs = os as jest.Mocked<typeof os>

beforeEach(() => {
  jest.resetAllMocks()
  mockedOs.homedir.mockReturnValue("/home/user")
})

describe("getWorkspacePath", () => {
  it("returns the correct workspace path", () => {
    expect(getWorkspacePath("agent-1")).toBe(
      "/home/user/.goobs/workspaces/agent-1/workspace",
    )
  })
})

describe("getRunPath", () => {
  it("returns the correct run path", () => {
    expect(getRunPath("agent-1", "run-42")).toBe(
      "/home/user/.goobs/workspaces/agent-1/runs/run-42",
    )
  })
})

describe("resolveSafePath", () => {
  it("resolves a simple relative path", () => {
    const result = resolveSafePath("agent-1", "foo/bar.txt")
    expect(result).toBe(
      "/home/user/.goobs/workspaces/agent-1/workspace/foo/bar.txt",
    )
  })

  it("throws on path traversal with ../", () => {
    expect(() => resolveSafePath("agent-1", "../../etc/passwd")).toThrow(
      "Path traversal blocked",
    )
  })

  it("throws on absolute path traversal", () => {
    expect(() => resolveSafePath("agent-1", "/etc/passwd")).toThrow(
      "Path traversal blocked",
    )
  })
})

describe("ensureWorkspace", () => {
  it("creates workspace directory recursively", async () => {
    mockedFs.mkdir.mockResolvedValue(undefined)

    await ensureWorkspace("agent-1")

    expect(mockedFs.mkdir).toHaveBeenCalledWith(
      "/home/user/.goobs/workspaces/agent-1/workspace",
      { recursive: true },
    )
  })
})

describe("cleanWorkspace", () => {
  it("removes workspace directory tree", async () => {
    mockedFs.rm.mockResolvedValue(undefined)

    await cleanWorkspace("agent-1")

    expect(mockedFs.rm).toHaveBeenCalledWith(
      "/home/user/.goobs/workspaces/agent-1/workspace",
      { recursive: true, force: true },
    )
  })
})

describe("getRunArtifacts", () => {
  it("returns empty array when run directory does not exist", async () => {
    mockedFs.access.mockRejectedValue(new Error("ENOENT"))

    const result = await getRunArtifacts("agent-1", "run-42")

    expect(result).toEqual([])
  })

  it("returns files with sizes from run directory", async () => {
    mockedFs.access.mockResolvedValue(undefined)
    mockedFs.readdir
      .mockResolvedValueOnce([
        { name: "file1.txt", isDirectory: () => false, isFile: () => true } as any,
        { name: "subdir", isDirectory: () => true, isFile: () => false } as any,
      ])
      .mockResolvedValueOnce([
        { name: "file2.txt", isDirectory: () => false, isFile: () => true } as any,
      ])
    mockedFs.stat
      .mockResolvedValueOnce({ size: 100 } as any)
      .mockResolvedValueOnce({ size: 200 } as any)

    const result = await getRunArtifacts("agent-1", "run-42")

    expect(result).toHaveLength(2)
    expect(result).toContainEqual(
      expect.objectContaining({ path: expect.stringContaining("file1.txt"), size: 100 }),
    )
    expect(result).toContainEqual(
      expect.objectContaining({ path: expect.stringContaining("file2.txt"), size: 200 }),
    )
  })
})

describe("named exports", () => {
  it("includes all functions", () => {
    const mod = require("./workspace")
    expect(mod.getWorkspacePath).toBeDefined()
    expect(mod.getRunPath).toBeDefined()
    expect(mod.resolveSafePath).toBeDefined()
    expect(mod.ensureWorkspace).toBeDefined()
    expect(mod.getRunArtifacts).toBeDefined()
    expect(mod.cleanWorkspace).toBeDefined()
  })
})
