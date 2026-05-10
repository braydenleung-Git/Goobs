import { listChallenges, getChallengeBySlug } from "./catalog"

describe("ChallengeCatalog", () => {
  it("lists 3 challenges", () => {
    expect(listChallenges()).toHaveLength(3)
  })

  it("includes all expected slugs", () => {
    const slugs = listChallenges().map((c) => c.slug)
    expect(slugs).toContain("change-prompt")
    expect(slugs).toContain("code-writer")
    expect(slugs).toContain("multi-tool")
  })

  it("returns undefined for unknown slug", () => {
    expect(getChallengeBySlug("invalid" as any)).toBeUndefined()
  })

  it("each challenge has a workstation target", () => {
    for (const c of listChallenges()) {
      expect(c.workstationTarget).toBeTruthy()
    }
  })

  it("each challenge has availableTools and maxTurns", () => {
    for (const c of listChallenges()) {
      expect(c.availableTools).toBeDefined()
      expect(Array.isArray(c.availableTools)).toBe(true)
      expect(c.maxTurns).toBeGreaterThan(0)
    }
  })

  it("change-prompt has no tools and maxTurns=1", () => {
    const c = getChallengeBySlug("change-prompt")!
    expect(c.availableTools).toEqual([])
    expect(c.maxTurns).toBe(1)
  })

  it("code-writer has tools and maxTurns=5", () => {
    const c = getChallengeBySlug("code-writer")!
    expect(c.availableTools).toEqual(["read_file", "write_file", "list_files", "exec_bash"])
    expect(c.maxTurns).toBe(5)
  })

  it("multi-tool has tools and maxTurns=5", () => {
    const c = getChallengeBySlug("multi-tool")!
    expect(c.availableTools).toEqual(["read_file", "write_file", "list_files", "exec_bash"])
    expect(c.maxTurns).toBe(5)
  })
})
