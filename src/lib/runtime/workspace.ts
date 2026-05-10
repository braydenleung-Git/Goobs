import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"

const BASE_DIR = ".goobs/workspaces"

function homeDir(): string {
  return os.homedir()
}

export function getWorkspacePath(agentId: string): string {
  return path.join(homeDir(), BASE_DIR, agentId, "workspace")
}

export function getRunPath(agentId: string, runId: string): string {
  return path.join(homeDir(), BASE_DIR, agentId, "runs", runId)
}

export function resolveSafePath(agentId: string, relativePath: string): string {
  const root = getWorkspacePath(agentId)
  const resolved = path.resolve(root, relativePath)
  const relative = path.relative(root, resolved)
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path traversal blocked: ${relativePath} escapes workspace`)
  }
  return resolved
}

export async function ensureWorkspace(agentId: string): Promise<void> {
  const workspacePath = getWorkspacePath(agentId)
  await fs.mkdir(workspacePath, { recursive: true })
}

async function readDirRecursive(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const results: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const sub = await readDirRecursive(fullPath)
      results.push(...sub)
    } else {
      results.push(fullPath)
    }
  }
  return results
}

export async function getRunArtifacts(
  agentId: string,
  runId: string,
): Promise<Array<{ path: string; size: number }>> {
  const runPath = getRunPath(agentId, runId)
  try {
    await fs.access(runPath)
  } catch {
    return []
  }
  const files = await readDirRecursive(runPath)
  const results: Array<{ path: string; size: number }> = []
  for (const filePath of files) {
    const stat = await fs.stat(filePath)
    results.push({ path: filePath, size: stat.size })
  }
  return results
}

export async function cleanWorkspace(agentId: string): Promise<void> {
  const workspacePath = getWorkspacePath(agentId)
  await fs.rm(workspacePath, { recursive: true, force: true })
}


