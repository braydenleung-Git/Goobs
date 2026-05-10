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
})
