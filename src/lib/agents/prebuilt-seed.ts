import crypto from "node:crypto"
import { prisma } from "@/lib/db/prisma"

const DEMO_AGENTS: Array<{
  name: string
  systemPrompt: string
  skillsJson: string
  toolsJson: string
  defaultModel: string
  modelColorHex: string
  isPrebuilt: boolean
}> = [
  {
    name: "CodeBot",
    systemPrompt:
      "You are a focused Python backend developer. Write clean, well-structured code with docstrings.",
    skillsJson: JSON.stringify(["Python", "FastAPI", "SQL"]),
    toolsJson: JSON.stringify(["code-runner", "file-editor"]),
    defaultModel: "OpenCode/deepseek-v4-flash",
    modelColorHex: "#4f46e5",
    isPrebuilt: true,
  },
  {
    name: "PromptWizard",
    systemPrompt:
      "You are a prompt engineering expert. Help users craft effective prompts for various tasks.",
    skillsJson: JSON.stringify(["prompt-design", "analysis", "writing"]),
    toolsJson: JSON.stringify(["search", "text-editor"]),
    defaultModel: "OpenCode/deepseek-v4-flash",
    modelColorHex: "#7c3aed",
    isPrebuilt: true,
  },
]

export async function seedPrebuiltAgents(): Promise<number> {
  const count = await prisma.agentProfile.count({ where: { isPrebuilt: true } })
  if (count > 0) return count

  let seeded = 0
  for (const agent of DEMO_AGENTS) {
    await prisma.agentProfile.create({
      data: { id: crypto.randomUUID(), ...agent },
    })
    seeded++
  }
  return seeded
}
