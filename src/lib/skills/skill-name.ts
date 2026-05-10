export function skillName(content: string): string {
  const trimmed = content.trim()

  if (trimmed.startsWith("---")) {
    const end = trimmed.indexOf("---", 3)
    if (end !== -1) {
      const frontmatter = trimmed.slice(3, end)
      const nameMatch = frontmatter.match(/^name:\s*(.+)$/m)
      if (nameMatch) return nameMatch[1].trim()
    }
  }

  const firstLine = trimmed.split("\n")[0] || ""
  return firstLine.replace(/^#\s*/, "").replace(/^["']|["']$/g, "") || "Untitled Skill"
}
