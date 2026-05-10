import type { ToolHandler, ToolDefinition, ToolResult } from "./types"

export function createSkillsTool(agentId: string, skills: string[]): ToolHandler {
  const definitions: ToolDefinition[] = [
    {
      type: "function" as const,
      function: {
        name: "view_skills",
        description: "View the skills available to this agent. Returns the full skill content as markdown.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    },
  ]

  return {
    definitions,
    async execute(name: string, _args: Record<string, unknown>): Promise<ToolResult> {
      if (name !== "view_skills") {
        return { callId: "", name, success: false, output: `Unknown tool: ${name}` }
      }
      if (skills.length === 0) {
        return { callId: "", name, success: true, output: "No skills configured for this agent." }
      }
      const formatted = skills
        .map((s, i) => {
          const firstLine = s.trim().split("\n")[0] || ""
          const title = firstLine.replace(/^#\s*/, "").replace(/^["']|["']$/g, "") || `Skill ${i + 1}`
          return `## ${title}\n\n${s}`
        })
        .join("\n\n---\n\n")
      return { callId: "", name, success: true, output: formatted }
    },
  }
}
